const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyToken = require('./middleware/auth');

// Define subscription plans
const subscriptionPlans = [
    {
        planId: 'free',
        name: 'Free',
        price: 0,
        features: ['Basic script writing', 'Limited AI suggestions', '1 project']
    },
    {
        planId: 'basic',
        name: 'Basic',
        price: 9.99,
        features: ['Advanced script writing', 'More AI suggestions', '5 projects', 'Character development tools']
    },
    {
        planId: 'pro',
        name: 'Professional',
        price: 19.99,
        features: ['Full script writing suite', 'Unlimited AI suggestions', 'Unlimited projects', 'All features']
    }
];

// Define Subscription Schema
const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    planId: {
        type: String,
        required: true,
        enum: subscriptionPlans.map(plan => plan.planId)
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'cancelled', 'expired'],
        default: 'active'
    },
    startDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// GET subscription plans
router.get('/plans', (req, res) => {
    res.status(200).json(subscriptionPlans);
});

// POST new subscription
router.post('/subscribe', verifyToken, async (req, res) => {
    try {
        const { userId, planId } = req.body;

        // Validate required fields
        if (!userId || !planId) {
            return res.status(400).json({
                error: 'Please provide userId and planId.'
            });
        }

        // Validate plan exists
        const planExists = subscriptionPlans.some(plan => plan.planId === planId);
        if (!planExists) {
            return res.status(400).json({
                error: 'Invalid plan ID.'
            });
        }

        // Check if user already has a subscription
        let subscription = await Subscription.findOne({ userId });

        if (subscription) {
            // Update existing subscription
            subscription.planId = planId;
            subscription.status = 'active';
            await subscription.save();
        } else {
            // Create new subscription
            subscription = new Subscription({
                userId,
                planId
            });
            await subscription.save();
        }

        res.status(201).json(subscription);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Server error while creating subscription' });
    }
});

// GET user subscription
router.get('/user/:userId', verifyToken, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ userId: req.params.userId });

        if (!subscription) {
            return res.status(404).json({
                error: 'Subscription not found for user.'
            });
        }

        // Add plan details to response
        const plan = subscriptionPlans.find(p => p.planId === subscription.planId);
        const response = subscription.toObject();
        response.plan = plan;

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Server error while fetching subscription' });
    }
});

module.exports = router; 