const express = require('express');
const router = express.Router();
const verifyToken = require('./middleware/auth');
const axios = require('axios');

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Helper function to make OpenAI API calls
async function callOpenAI(prompt) {
    try {
        const response = await axios.post(OPENAI_API_URL, {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 500
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API Error:', error.response?.data || error.message);
        throw new Error('Failed to generate AI response');
    }
}

// Generate character
router.post('/generate-character', verifyToken, async (req, res) => {
    try {
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ error: 'Please provide a character description.' });
        }

        const prompt = `Create a detailed character profile based on this description: "${description}". 
            Include the following in JSON format:
            - name
            - background (a paragraph about their past)
            - likes (array of 3-5 things they like)
            - dislikes (array of 3-5 things they dislike)
            - reactions (object with keys: happy, sad, angry, surprised)`;

        const aiResponse = await callOpenAI(prompt);
        const characterProfile = JSON.parse(aiResponse);

        res.status(200).json(characterProfile);
    } catch (error) {
        if (error.message === 'Failed to generate AI response') {
            return res.status(503).json({ error: 'AI service temporarily unavailable' });
        }
        res.status(500).json({ error: 'Server error while generating character' });
    }
});

// Generate dialogue
router.post('/generate-dialogue', verifyToken, async (req, res) => {
    try {
        const { characters, context, tone } = req.body;

        if (!characters || !context || !tone) {
            return res.status(400).json({ error: 'Please provide characters, context, and tone.' });
        }

        if (!Array.isArray(characters) || characters.length < 1) {
            return res.status(400).json({ error: 'Please provide at least one character.' });
        }

        const prompt = `Generate a dialogue scene between ${characters.join(' and ')} 
            in this context: "${context}". The tone should be ${tone}. 
            Write it in screenplay format.`;

        const dialogue = await callOpenAI(prompt);

        res.status(200).json({ dialogue });
    } catch (error) {
        if (error.message === 'Failed to generate AI response') {
            return res.status(503).json({ error: 'AI service temporarily unavailable' });
        }
        res.status(500).json({ error: 'Server error while generating dialogue' });
    }
});

// Enhance description
router.post('/enhance-description', verifyToken, async (req, res) => {
    try {
        const { description, style } = req.body;

        if (!description || !style) {
            return res.status(400).json({ error: 'Please provide description and style.' });
        }

        const prompt = `Enhance this scene description: "${description}" 
            in a ${style} style. Make it more vivid and engaging while maintaining 
            the same basic elements. Focus on sensory details and atmosphere.`;

        const enhancedDescription = await callOpenAI(prompt);

        res.status(200).json({ enhancedDescription });
    } catch (error) {
        if (error.message === 'Failed to generate AI response') {
            return res.status(503).json({ error: 'AI service temporarily unavailable' });
        }
        res.status(500).json({ error: 'Server error while enhancing description' });
    }
});

module.exports = router;
