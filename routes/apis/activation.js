const express = require('express');
const request = require('request');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Wallet = require('../../models/walletModel');
const Transaction = require('../../models/transactionModel');
const History = require('../../models/historyModel');

const router = express.Router();

// Load country map
const countryMapPath = path.join(__dirname, '../../data/countryMap.json');
const countryMap = JSON.parse(fs.readFileSync(countryMapPath, 'utf8'));

    // Add this near the other model imports

// Then modify the GET route to save history
    router.get('/', async (req, res) => {
        let { country, service } = req.query;

        if (!country || !service) {
            return res.status(400).json({ error: '❌ Country and service are required' });
        }

        const countryCode = country.toUpperCase();
        const serviceCode = service.trim();

        const url = `https://api.smspva.com/activation/number/${countryCode}/${serviceCode}`;
        const options = {
            method: 'GET',
            url: url,
            headers: { "apikey": process.env.API_KEY }
        };

        request(options, async (error, response, body) => {
            if (error) {
                return res.status(500).json({ error: 'Failed to fetch number', details: error.message });
            }

            if (response.statusCode !== 200) {
                return res.status(response.statusCode).json({ error: 'API request failed', details: body });
            }

            try {
                const data = JSON.parse(body);
                if (!data.data.phoneNumber) {
                    return res.status(404).json({ error: 'No number available' });
                }

                // Get dial code from countryMap
                const dialCode = countryMap[countryCode]?.dial_code || '';
                
                // Save to history if user is authenticated
                if (req.customer?.id) {
                    try {
                        const expiresInMinutes = 15; // Number expires in 15 minutes
                        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
                        
                        await History.create({
                            customer_id: req.customer.id,
                            phoneNumber: data.data.phoneNumber,
                            orderId: data.data.orderId,
                            countryCode: data.data.countryCode,
                            countryName: countryMap[countryCode]?.name || countryCode,
                            dialCode: dialCode,
                            service: serviceCode,
                            status: 'active',
                            expiresAt: expiresAt
                        });
                    } catch (historyError) {
                        console.error('Failed to save history:', historyError);
                        // Don't fail the request just because history couldn't be saved
                    }
                }

                res.json({
                    orderId: data.data.orderId,
                    phoneNumber: data.data.phoneNumber,
                    countryCode: data.data.countryCode,
                    dialCode: dialCode,
                    expiresIn: data.data.orderExpireIn
                });
                
            } catch (parseError) {
                return res.status(500).json({ error: 'Invalid API response', details: parseError.message });
            }
        });
    });
    // router.get('/', async (req, res) => {
    //     let { country, service } = req.query;

    //     if (!country || !service) {
    //         return res.status(400).json({ error: '❌ Country and service are required' });
    //     }

    //     const countryCode = country.toUpperCase();
    //     const serviceCode = service.trim();

    //     const url = `https://api.smspva.com/activation/number/${countryCode}/${serviceCode}`;
    //     const options = {
    //         method: 'GET',
    //         url: url,
    //         headers: { "apikey": process.env.API_KEY }
    //     };

    //     request(options, (error, response, body) => {
    //         if (error) {
    //             return res.status(500).json({ error: 'Failed to fetch number', details: error.message });
    //         }

    //         if (response.statusCode !== 200) {
    //             return res.status(response.statusCode).json({ error: 'API request failed', details: body });
    //         }

    //         try {
    //             const data = JSON.parse(body);
    //             if (!data.data.phoneNumber) {
    //                 return res.status(404).json({ error: 'No number available' });
    //             }

    //             // Get dial code from countryMap
    //             const dialCode = countryMap[countryCode]?.dial_code || '';

    //             res.json({
    //                 orderId: data.data.orderId,
    //                 phoneNumber: data.data.phoneNumber,
    //                 countryCode: data.data.countryCode,
    //                 dialCode: dialCode, // Add dial code
    //                 expiresIn: data.data.orderExpireIn
    //             });
    //             console.log('API Response:', data);
                
    //         } catch (parseError) {
    //             return res.status(500).json({ error: 'Invalid API response', details: parseError.message });
    //         }
    //     });
    // });

    router.get('/sms/:orderid', async (req, res) => {
        const orderId = req.params.orderid;
        const customerId = req.customer?.id;
        
        if (!orderId || isNaN(orderId)) {
            return res.status(400).json({ 
                error: 'Invalid order ID',
                details: 'Order ID must be a valid number'
            });
        }
    
        const url = `https://api.smspva.com/activation/sms/${orderId}`;
        const options = {
            method: 'GET',
            url: url,
            headers: {
                "apikey": process.env.API_KEY,
                "Accept": "application/json"
            }
        };
    
        try {
            const smsResponse = await new Promise((resolve, reject) => {
                request(options, (error, response, body) => {
                    if (error) return reject(error);
                    
                    try {
                        const parsedBody = JSON.parse(body);
                        
                        // Handle different status codes appropriately
                        if (response.statusCode === 200) {
                            resolve(parsedBody);
                        } else if (response.statusCode === 202) {
                            // SMS not yet received - this is a normal waiting state
                            resolve({
                                statusCode: 202,
                                message: 'Waiting for SMS...',
                                status: 'pending'
                            });
                        } else {
                            // Other error cases
                            reject(new Error(parsedBody.message || `API returned ${response.statusCode}`));
                        }
                    } catch (parseError) {
                        reject(parseError);
                    }
                });
            });
    
            console.log('SMS API response:', smsResponse);
    
            // Update history if SMS received
            if (smsResponse.statusCode === 200 && req.customer?.id) {
                await History.findOneAndUpdate(
                    { orderId: orderId, customer_id: req.customer.id },
                    { 
                        status: 'completed',
                        smsContent: smsResponse.sms || smsResponse.data?.sms?.code,
                        $unset: { expiresAt: 1 }
                    }
                );
            }
    
            // Prepare response data
            const responseData = { ...smsResponse };
    
            // Only deduct balance if SMS was successfully received (statusCode 200)
            if (smsResponse.statusCode === 200 && customerId) {
                const servicePrice = 1.0;
                
                try {
                    const wallet = await Wallet.findOneAndUpdate(
                        { customer_id: customerId, balance: { $gte: servicePrice } },
                        { $inc: { balance: -servicePrice } },
                        { new: true }
                    );
    
                    if (!wallet) {
                        responseData.balanceDeducted = false;
                        responseData.balanceError = "Insufficient balance or wallet not found";
                    } else {
                        try {
                            await Transaction.create({
                                customer_id: customerId,
                                amount: servicePrice,
                                type: "service",
                                service: req.query.service || "unknown",
                                remaining_balance: wallet.balance,
                                status: "completed",
                                balance: wallet.balance
                            });
    
                            responseData.balanceDeducted = true;
                            responseData.newBalance = wallet.balance;
                        } catch (transactionError) {
                            console.error('Transaction creation failed:', transactionError);
                            await Wallet.updateOne(
                                { customer_id: customerId },
                                { $inc: { balance: servicePrice } }
                            );
                            responseData.balanceDeducted = false;
                            responseData.balanceError = "Transaction record failed";
                        }
                    }
                } catch (walletError) {
                    console.error('Wallet operation failed:', walletError);
                    responseData.balanceDeducted = false;
                    responseData.balanceError = "Wallet operation failed";
                }
            }
    
            return res.status(smsResponse.statusCode || 200).json(responseData);
    
        } catch (error) {
            console.error('SMS API error:', error);
            
            // Special handling for "waiting" cases
            if (error.message.includes('wait') || error.message.includes('pending')) {
                return res.status(202).json({
                    statusCode: 202,
                    message: 'Waiting for SMS...',
                    status: 'pending'
                });
            }
            
            // For other errors, return a more user-friendly message
            return res.status(500).json({ 
                statusCode: 500,
                error: 'Please wait while we check for your SMS...',
                details: 'The system is processing your request',
                originalError: error.message
            });
        }
    });

module.exports = router;
