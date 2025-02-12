const express = require('express');
const router = express.Router();
const verifyToken = require('./middleware/auth');
const { Character } = require('./models');  // Import from models/index.js

// GET all characters
router.get('/', verifyToken, async (req, res) => {
    try {
        const characters = await Character.find({ userId: req.user._id });
        res.json(characters);
    } catch (error) {
        console.error('Error fetching characters:', error);
        res.status(500).json({ error: 'Error fetching characters' });
    }
});

// POST new character
router.post('/', verifyToken, async (req, res) => {
    try {
        const character = new Character({
            userId: req.user._id,
            name: req.body.name,
            description: req.body.description,
            traits: req.body.traits ? req.body.traits.split(',').map(trait => trait.trim()) : []
        });

        await character.save();
        res.status(201).json({ message: 'Character created successfully', data: character });
    } catch (error) {
        console.error('Error creating character:', error);
        res.status(500).json({ error: 'Error creating character' });
    }
});

// PUT (update) character (protected route)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updates = req.body;
        const updatedCharacter = await Character.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { $set: updates },
            { new: true }
        );

        if (!updatedCharacter) {
            return res.status(404).json({ error: 'Character not found.' });
        }

        res.status(200).json(updatedCharacter);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Server error while updating character' });
    }
});

// DELETE character (protected route)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const deletedCharacter = await Character.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!deletedCharacter) {
            return res.status(404).json({ error: 'Character not found.' });
        }

        res.status(200).json({ message: 'Character deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Server error while deleting character' });
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
