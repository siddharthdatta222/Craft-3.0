const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyToken = require('./middleware/auth');

// Define the schema
const relationshipSchema = new mongoose.Schema({
    character1Id: {
        type: String,
        required: true
    },
    character2Id: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Create model if it doesn't exist
const Relationship = mongoose.models.Relationship || mongoose.model('Relationship', relationshipSchema);

// Get all relationships
router.get('/', verifyToken, async (req, res) => {
    try {
        console.log('User ID from token:', req.user._id);
        const relationships = await Relationship.find({ userId: req.user._id });
        res.json(relationships);
    } catch (error) {
        console.error('Error fetching relationships:', error);
        res.status(500).json({ error: 'Error fetching relationships' });
    }
});

// Create new relationship
router.post('/', verifyToken, async (req, res) => {
    try {
        const { character1Id, character2Id, type, description } = req.body;

        // Validation
        if (!character1Id || !character2Id) {
            return res.status(400).json({ error: 'Please provide both character IDs.' });
        }

        if (character1Id === character2Id) {
            return res.status(400).json({ error: 'Character IDs must be different.' });
        }

        console.log('Creating relationship with userId:', req.user._id);

        const relationship = new Relationship({
            character1Id,
            character2Id,
            type: type || 'unspecified',
            description: description || '',
            userId: req.user._id
        });

        const savedRelationship = await relationship.save();
        
        res.status(201).json({
            id: savedRelationship._id,
            character1Id: savedRelationship.character1Id,
            character2Id: savedRelationship.character2Id,
            type: savedRelationship.type,
            description: savedRelationship.description,
            userId: savedRelationship.userId
        });
    } catch (error) {
        console.error('Error creating relationship:', error);
        res.status(500).json({ error: 'Error creating relationship' });
    }
});

// Update relationship
router.put('/:id', verifyToken, async (req, res) => {
    try {
        console.log('Updating relationship. ID:', req.params.id, 'User ID:', req.user._id);
        
        const relationship = await Relationship.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!relationship) {
            return res.status(404).json({ error: 'Relationship not found.' });
        }

        const { type, description } = req.body;
        
        if (type) relationship.type = type;
        if (description) relationship.description = description;

        const updatedRelationship = await relationship.save();
        
        res.json({
            id: updatedRelationship._id,
            character1Id: updatedRelationship.character1Id,
            character2Id: updatedRelationship.character2Id,
            type: updatedRelationship.type,
            description: updatedRelationship.description,
            userId: updatedRelationship.userId
        });
    } catch (error) {
        console.error('Error updating relationship:', error);
        res.status(500).json({ error: 'Error updating relationship' });
    }
});

// Delete relationship
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        console.log('Deleting relationship. ID:', req.params.id, 'User ID:', req.user._id);
        
        const relationship = await Relationship.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!relationship) {
            return res.status(404).json({ error: 'Relationship not found.' });
        }

        await relationship.deleteOne();
        res.json({ message: 'Relationship deleted successfully.' });
    } catch (error) {
        console.error('Error deleting relationship:', error);
        res.status(500).json({ error: 'Error deleting relationship' });
    }
});

module.exports = router;
