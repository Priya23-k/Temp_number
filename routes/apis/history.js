const express = require('express');
const router = express.Router();

// Add this to your routes file (or create a new route file for history)
// GET user's history
router.get('/history', async (req, res) => {
    try {
        if (!req.customer?.id) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const history = await History.find({ 
            customer_id: req.customer.id 
        }).sort({ createdAt: -1 }).limit(50);

        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// DELETE user's history
router.delete('/history', async (req, res) => {
    try {
        if (!req.customer?.id) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        await History.deleteMany({ customer_id: req.customer.id });
        res.json({ message: 'History cleared' });
    } catch (error) {
        console.error('Error clearing history:', error);
        res.status(500).json({ error: 'Failed to clear history' });
    }
});
module.exports = router;