const express = require('express');
const router = express.Router();
const verifyToken = require('./middleware/auth');
const { WorldContext } = require('./models');

// Routes
router.post('/', verifyToken, async (req, res) => {
    try {
        console.log('Creating world context with user ID:', req.user.id);
        console.log('Request body:', req.body);

        // Validate required fields
        if (!req.body.title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const newContext = new WorldContext({
            title: req.body.title,
            description: req.body.description || '',
            userId: req.user.id
        });

        // Validate the model before saving
        const validationError = newContext.validateSync();
        if (validationError) {
            console.error('Validation error:', validationError);
            return res.status(400).json({ error: validationError.message });
        }

        const savedContext = await newContext.save();
        console.log('Successfully saved context:', savedContext);
        
        res.status(201).json(savedContext);
    } catch (error) {
        console.error('Detailed error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        if (error.name === 'MongoError') {
            return res.status(500).json({ error: 'Database error: ' + error.message });
        }
        res.status(500).json({ error: 'Error saving world context: ' + error.message });
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

// GET route to test if the endpoint is working
router.get('/test', (req, res) => {
    res.json({ message: 'World context endpoint is working' });
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!'
    });
});

module.exports = router; 