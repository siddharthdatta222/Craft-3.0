const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyToken = require('./middleware/auth');
const { Script } = require('./models');

// Script Schema
const scriptSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    logline: {
        type: String,
        required: true
    },
    synopsis: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const ScriptModel = mongoose.models.Script || mongoose.model('Script', scriptSchema);

// Get all scripts
router.get('/', verifyToken, async (req, res) => {
    try {
        const scripts = await ScriptModel.find({ userId: req.user._id });
        console.log('Fetched scripts:', scripts);
        res.json(scripts);
    } catch (error) {
        console.error('Error fetching scripts:', error);
        res.status(500).json({ error: 'Error fetching scripts' });
    }
});

// Get specific script
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const script = await ScriptModel.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!script) {
            return res.status(404).json({ error: 'Script not found' });
        }

        res.json(script);
    } catch (error) {
        console.error('Error fetching script:', error);
        res.status(500).json({ error: 'Error fetching script' });
    }
});

// Create new script
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, content, genre, logline, synopsis } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required.' });
        }

        const script = new ScriptModel({
            title,
            content,
            genre: genre || 'Unspecified',
            logline: logline || '',
            synopsis: synopsis || '',
            userId: req.user._id
        });

        const savedScript = await script.save();

        res.status(201).json({
            id: savedScript._id,
            title: savedScript.title,
            content: savedScript.content,
            genre: savedScript.genre,
            logline: savedScript.logline,
            synopsis: savedScript.synopsis,
            userId: savedScript.userId
        });
    } catch (error) {
        console.error('Error creating script:', error);
        res.status(500).json({ error: 'Error creating script' });
    }
});

// Update script
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const script = await ScriptModel.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!script) {
            return res.status(404).json({ error: 'Script not found' });
        }

        const { title, content, genre, logline, synopsis } = req.body;

        if (title) script.title = title;
        if (content) script.content = content;
        if (genre) script.genre = genre;
        if (logline) script.logline = logline;
        if (synopsis) script.synopsis = synopsis;

        const updatedScript = await script.save();

        res.json({
            id: updatedScript._id,
            title: updatedScript.title,
            content: updatedScript.content,
            genre: updatedScript.genre,
            logline: updatedScript.logline,
            synopsis: updatedScript.synopsis,
            userId: updatedScript.userId
        });
    } catch (error) {
        console.error('Error updating script:', error);
        res.status(500).json({ error: 'Error updating script' });
    }
});

// Delete script
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const script = await ScriptModel.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!script) {
            return res.status(404).json({ error: 'Script not found' });
        }

        await script.deleteOne();
        res.json({ message: 'Script deleted successfully.' });
    } catch (error) {
        console.error('Error deleting script:', error);
        res.status(500).json({ error: 'Error deleting script' });
    }
});

module.exports = router; 