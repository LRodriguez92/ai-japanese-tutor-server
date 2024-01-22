const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();


const app = express();
app.use(express.json());

const openai = new OpenAI(process.env.OPENAI_API_KEY);

app.post('/api/openai', async (req, res) => {
    // console.log(req.body)
    try {
        const prompt = req.body.prompt;
        const response = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4-1106-preview',
        });
        const choices = response.choices[0];
        // console.log(choices.message.content)
        res.json({ response: choices.message.content.trim() });
    } catch (error) {
        console.error("Error in OpenAI API request:", error);
        res.status(500).send('Error in fetching response from OpenAI');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
