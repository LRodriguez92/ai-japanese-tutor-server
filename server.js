const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI(process.env.OPENAI_API_KEY);

app.post('/api/openai', async (req, res) => {
    try {
        const userPrompt = req.body.prompt;
        // Adjust the prompt to encourage a more conversational response.
        const conversationPreface = `You are a fluent Japanese speaker and a language teacher. A student is speaking to you in English, and you will Respond in Japanese and follow it with 'English Translation:' and the English translation. Keep the conversation flowing and dynamic by asking follow up questions or prompts for the user. Do not repeat the phrase 'English Translation:' more than once in your response. \nStudent: ${userPrompt}\nTeacher:`;
        
        const response = await openai.chat.completions.create({
            messages: [{ role: 'user', content: conversationPreface }],
            model: 'gpt-4-1106-preview',
            temperature: 0.7, // Adjust temperature for creativity 0.0 = least creative 1.0 = most creative
            max_tokens: 150,  // Limit the length of the response
        });
        const combinedResponse = response.choices[0].message.content.trim();

        // Parse the combined response into Japanese and English parts
        const [japaneseText, englishText] = parseCombinedResponse(combinedResponse);

        res.json({
            japanese: japaneseText,
            english: englishText
        });
    } catch (error) {
        console.error("Error in OpenAI API request:", error);
        res.status(500).send('Error in fetching response from OpenAI');
    }
});

function parseCombinedResponse(combinedText) {
    const delimiter = "English Translation:";
    const splitIndex = combinedText.indexOf(delimiter);

    if (splitIndex === -1) {
        // If the delimiter is not found, return the whole text as both Japanese and English
        return [combinedText, combinedText];
    }

    const japaneseText = combinedText.substring(0, splitIndex).trim();
    const englishText = combinedText.substring(splitIndex + delimiter.length).trim();

    return [japaneseText, englishText];
}



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
