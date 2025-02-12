const express = require('express');
const router = express.Router();
const verifyToken = require('./middleware/auth');
const { WorldContext } = require('./models');

// Routes
router.post('/', verifyToken, async (req, res) => {
    try {
        console.log('Received world context data:', req.body);
        
        const worldContext = new WorldContext({
            userId: req.user._id,
            name: req.body.name,
            description: req.body.description,
            rules: req.body.rules
        });

        await worldContext.save();
        res.status(201).json({ message: 'World context saved successfully', data: worldContext });
    } catch (error) {
        console.error('Error saving world context:', error);
        res.status(500).json({ error: 'Error saving world context' });
    }
});

router.get('/', verifyToken, async (req, res) => {
    try {
        const worldContext = await WorldContext.findOne({ userId: req.user._id });
        res.json(worldContext || {});
    } catch (error) {
        console.error('Error fetching world context:', error);
        res.status(500).json({ error: 'Error fetching world context' });
    }
});

// PUT (update) world context node (protected route)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { title, description, rules } = req.body;
        const updates = {};

        // Build update object with provided fields
        if (title) updates.title = title;
        if (description) updates.description = description;
        if (rules) updates.rules = rules;

        // Find and update node
        const updatedNode = await WorldContext.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedNode) {
            return res.status(404).json({ error: 'Node not found.' });
        }

        res.status(200).json(updatedNode);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Server error while updating node' });
    }
});

// DELETE world context node (protected route)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const deletedNode = await WorldContext.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!deletedNode) {
            return res.status(404).json({ error: 'Node not found.' });
        }

        res.status(200).json({ message: 'Node deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Server error while deleting node' });
    }
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!'
    });
});

module.exports = router; 