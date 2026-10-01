
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ vertexai: true, apiKey: 'FAKE_KEY' });
const req = {
  model: 'gemini-1.5-flash',
  contents: [{ role: 'user', parts: [{ text: 'hello' }] }],
  config: { systemInstruction: 'You are a helpful assistant' }
};
console.log(JSON.stringify(req, null, 2));

