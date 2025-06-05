document.addEventListener('DOMContentLoaded', function() {
    // Check if we already have a number in localStorage
    const savedNumber = localStorage.getItem('currentPhoneNumber');
    const savedOrderId = localStorage.getItem('currentOrderId');
    const savedDialCode = localStorage.getItem('currentDialCode');
    const savedExpiresAt = localStorage.getItem('currentExpiresAt');
    
    if (savedNumber && savedOrderId) {
        // Display the existing number
        document.getElementById('countryCode').textContent = savedDialCode;
        document.getElementById('phoneNumber').textContent = savedNumber;
        
        // Restart the expiration timer if we have the expiration time
        if (savedExpiresAt) {
            const remainingTime = Math.max(0, Math.floor((parseInt(savedExpiresAt) - Date.now()) / 1000));
            if (remainingTime > 0) {
                startExpirationTimer(remainingTime);
            } else {
                // Number has expired
                clearCurrentNumber();
                return;
            }
        }
        
        // Start checking for SMS
        setTimeout(fetchReceivedSMS, 2000);
    } else {
        // Fetch a new number if none exists
        fetchPhoneNumber();
    }
});

async function fetchPhoneNumber() {
    const countryCode = localStorage.getItem('selectedCountryCode');
    const serviceCode = localStorage.getItem('selectedServiceCode');

    if (!countryCode || !serviceCode) {
        document.getElementById('phoneNumber').textContent = 'Please select a country and service';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/activation?country=${countryCode}&service=${serviceCode}`);
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        
        const data = await response.json();

        if (data.phoneNumber) {
            // Save to localStorage
            localStorage.setItem('currentPhoneNumber', data.phoneNumber);
            localStorage.setItem('currentOrderId', data.orderId);
            localStorage.setItem('currentDialCode', data.dialCode);
            
            // Calculate and store expiration time
            const expiresIn = typeof data.expiresIn === 'string' ? 
                parseInt(data.expiresIn) * 60 : // Convert minutes to seconds if string
                (data.expiresIn || 900); // Default to 15 minutes (900 seconds)
            
            const expiresAt = Date.now() + (expiresIn * 1000);
            localStorage.setItem('currentExpiresAt', expiresAt.toString());
            
            // Display the number
            document.getElementById('countryCode').textContent = data.dialCode;
            document.getElementById('phoneNumber').textContent = data.phoneNumber;
            
            // Start the expiration timer
            startExpirationTimer(expiresIn);
            
            // Start checking for SMS
            setTimeout(fetchReceivedSMS, 2000);
        } else {
            document.getElementById('phoneNumber').textContent = 'No number available';
        }
    } catch (error) {
        console.error('Error fetching number:', error);
        document.getElementById('phoneNumber').textContent = 'Error fetching number';
    }
}

function startExpirationTimer(seconds) {
    const timerElement = document.getElementById('numberExpiryTimer');
    const timeDisplay = document.getElementById('expiryTime');
    
    if (!timerElement || !timeDisplay) {
        console.error('Timer elements not found!');
        return;
    }
    
    console.log('Showing timer element');
    timerElement.classList.remove('d-none');
    
    let remainingTime = seconds;
    
    // Update the timer display immediately
    updateTimerDisplay();
    
    // Start the countdown
    const timerInterval = setInterval(() => {
        remainingTime--;
        updateTimerDisplay();
        
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            timeDisplay.textContent = "Timeout!";
            timerElement.classList.add('bg-danger');
            timerElement.classList.remove('bg-warning');
            
            // Show timeout message in the SMS content area
            updateSMSStatus('The number has timed out. Getting a new number...', 'danger');
            
            // Clear the number after a short delay
            setTimeout(() => {
                clearCurrentNumber();
            }, 2000);
        }
    }, 1000);
    
    function updateTimerDisplay() {
        const minutes = Math.floor(remainingTime / 60);
        const secs = remainingTime % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        // Change color when under 2 minutes
        if (remainingTime <= 120) {
            timerElement.classList.add('bg-danger');
            timerElement.classList.remove('bg-warning');
        }
    }
}

function clearCurrentNumber() {
    localStorage.removeItem('currentPhoneNumber');
    localStorage.removeItem('currentOrderId');
    localStorage.removeItem('currentDialCode');
    localStorage.removeItem('currentExpiresAt');
    document.getElementById('phoneNumber').textContent = 'Fetching...';
    
    // Hide the timer
    const timerElement = document.getElementById('numberExpiryTimer');
    if (timerElement) {
        timerElement.classList.add('d-none');
    }
    
    fetchPhoneNumber(); // Get a new number
}

async function fetchReceivedSMS() {
    const orderId = localStorage.getItem('currentOrderId');
    if (!orderId) {
        console.error('No order ID available');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/activation/sms/${orderId}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('SMS fetch response:', data);

        if (response.status === 200) {
            // SMS received successfully
            displaySMSMessage(data);
            return; // Stop polling
        } else if (response.status === 202) {
            // SMS not yet received
            updateSMSStatus('Waiting for SMS...', 'info');
            setTimeout(fetchReceivedSMS, 2000); // Poll again after 2 seconds
        } else {
            throw new Error(data.message || 'Unknown response status');
        }
    } catch (error) {
        console.error('SMS fetch error:', error);
        updateSMSStatus(`Error: ${error.message}`, 'error');
        
        // Only continue polling for network/timeout errors
        if (error.message.includes('Network') || error.message.includes('timeout')) {
            setTimeout(fetchReceivedSMS, 2000);
        }
    }
}

async function displaySMSMessage(smsData) {
    const smsContent = document.getElementById('smsContent');
    
    // Ensure we have a valid expiresIn value (default to 5 minutes if not provided)
    let expiresIn = smsData.expiresIn || 300;
    let remainingTime = expiresIn;


    // Start the countdown
   

    // Initial display
    let balanceInfo = '';
    if (smsData.balanceDeducted !== undefined) {
    if (smsData.balanceDeducted) {
        balanceInfo = `
            <div class="alert alert-success mt-2">
                <i class="bi bi-check-circle-fill"></i> 
                $${smsData.price || 0.35} deducted successfully. 
                New balance: $${smsData.newBalance.toFixed(2)}
            </div>
        `;
        updateDisplayedBalance(smsData.newBalance);
    }
    //  else {
    //     balanceInfo = `
    //         <div class="alert alert-danger mt-2">
    //             <i class="bi bi-exclamation-triangle-fill"></i>
    //             Balance not deducted: ${smsData.balanceError || 'Unknown error'}
    //         </div>
    //     `;
    // }
}


    smsContent.innerHTML = `
        <div class="sms-message alert alert-success">
            <div class="sms-code">${smsData.sms || smsData.data?.sms?.code || 'No code received'}</div>
            <p class="sms-text">${smsData.smsText || smsData.data?.sms?.fullText || 'No message content'}</p>
            <small id="sms-timer" class="text-muted"></small>
            ${balanceInfo}
        </div>
    `;

    // Initialize the timer display
    updateTimerDisplay();
}

function updateDisplayedBalance(newBalance) {
    // Update all balance displays on the page
    document.querySelectorAll('.app-balance').forEach(el => {
        el.textContent = `Balance: $${newBalance.toFixed(2)}`;
    });
}

function updateSMSStatus(message, type = 'info') {
    const smsContent = document.getElementById('smsContent');
    
    if (type === 'info' && message.includes('Waiting')) {
        smsContent.innerHTML = `
            <h5>${message}</h5>
            <div class="center">
                ${Array.from({length: 10}, (_, i) => 
                    `<div class="wave" style="--i: ${i}"></div>`
                ).join('')}
            </div>
            <p class="text-muted mt-2">This may take a few moments...</p>
        `;
    } else {
        smsContent.innerHTML = `
            <div class="alert alert-${type}">
                ${message}
                ${type === 'info' ? `
                    <div class="spinner-border spinner-border-sm ms-2" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

// function updateSMSStatus(message, type = 'info') {
//     const smsContent = document.getElementById('smsContent');
//     smsContent.innerHTML = `
//         <div class="alert alert-${type}">
//             ${message}
//             <div class="spinner-border spinner-border-sm ms-2" role="status">
//                 <span class="visually-hidden">Loading...</span>
//             </div>
//         </div>
//     `;
// }