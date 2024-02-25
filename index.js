const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');


const app = express();
app.use(cors());
const PORT = process.env.PORT ||3001;


const API_KEY = process.env.API_KEY || "AIzaSyAyBPrhrKtPvf4yQ-W2yGF4_k2StVQbdHg";
if (!API_KEY) {
  throw new Error('Please provide an API_KEY environment variable.');
}


const genAI = new GoogleGenerativeAI(API_KEY);


app.use(bodyParser.json());


app.post('/', async (req, res) => {
  
    
    const { language, difficulty, topic, numQuestions } = req.body;

    
    if (!language || !difficulty || !topic || !numQuestions) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    
    const prompt = `Give me ${numQuestions} multiple choice questions about ${topic} in the ${language} programming language. The questions should be at an ${difficulty} level. Return your answer entirely in the form of a JSON object. The JSON object should have a key named "questions" which is an array of the questions. Each quiz question should include the choices, the answer, and a brief explanation of why the answer is correct. Don't include anything other than the JSON. The JSON properties of each question should be "query" (which i s the question), "choices", and "explanation". The choices shouldn't have any ordinal value like A, B, C, D or a number like 1, 2, 3, 4. The answer should be the 0-indexed number of the correct choice.and include any other information.do not even a comma or a period. only the JSON object.`;

    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let textee = await response.text();
    //I need to remove the first and last 3 chars of the string only backsticks apper at the first and lat of the string
    if(textee.charAt(0) === '`' && textee.charAt(1) === '`' && textee.charAt(2) === '`'){
      textee = textee.slice(3);
    }
    if(textee.charAt(textee.length-1) === '`' && textee.charAt(textee.length-2) === '`' && textee.charAt(textee.length-3) === '`'){
      textee = textee.slice(0, -3);
    }
    // console.log(textee);
    
    const jsonQuestions = parseQuestionsJSON(textee);
    
    

    console.log(jsonQuestions);
    res.json({ jsonQuestions });
});

function parseQuestionsJSON(text) {
    try {

        const parsedData = JSON.parse(text);
        
        const questions = parsedData.questions.map(question => {
            return {
                query: question.query,
                choices: question.choices,
                answer: question.answer,
                explanation: question.explanation
            };
        });
        return { questions };
    } catch (error) {
        console.error('Error parsing questions JSON:', error);
        return { error: 'Failed to parse questions JSON' };
    }
}




app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
