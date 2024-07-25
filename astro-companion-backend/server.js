require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5003;

// CORS middleware
app.use(cors());

app.use(express.json());

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are Astro-Companion, a supportive chatbot designed to help astronauts with their mental health, particularly with feelings of loneliness and isolation. 
                        Provide responses that are comforting, encouraging, and relate to space and life as an astronaut. Use space terminology and relate advice to the unique environment of space whenever possible. 
                        For example:
                        - Mention stars, Earth, the mission, the space station.
                        - Offer practical tips that can be done in space, like looking out at Earth, talking to mission control, or thinking about the stars.
                        - Remind them of the support from their team on the ground and the significance of their mission.`
                    },
                    { role: 'user', content: userMessage }
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        const assistantMessage = response.data.choices[0].message.content;
        res.json({ reply: assistantMessage });
    } catch (error) {
        console.error('Error communicating with OpenAI:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error communicating with OpenAI' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});