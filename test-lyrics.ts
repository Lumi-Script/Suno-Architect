import { matchWordsToPrompt } from './src/utils/lyrics';
import * as fs from 'fs';

const alignedWords = [
    { word: "[track: ", start_s: 7.1, end_s: 7.1 },
    { word: "genre: ", start_s: 7.1, end_s: 7.1 },
    { word: "emo ", start_s: 7.1, end_s: 7.1 },
    { word: "rap, ", start_s: 7.1, end_s: 7.1 },
    { word: "[intro | ", start_s: 7.1, end_s: 7.1 },
    { word: "Yeah, ", start_s: 7.1, end_s: 7.1 },
    { word: "yeah ", start_s: 7.1, end_s: 7.1 },
    { word: "Oh, ", start_s: 7.1, end_s: 7.1 },
    { word: "okay ", start_s: 7.1, end_s: 7.1 },
    { word: "[verse 1] ", start_s: 7.1, end_s: 7.1 },
    { word: "Up ", start_s: 7.1, end_s: 7.1 },
    { word: "at ", start_s: 7.1, end_s: 7.1 },
    { word: "three ", start_s: 7.1, end_s: 7.1 },
    { word: "AM, ", start_s: 7.1, end_s: 7.1 },
    { word: "painting ", start_s: 7.1, end_s: 7.1 },
    { word: "my ", start_s: 7.1, end_s: 7.1 },
    { word: "bedroom ", start_s: 7.1, end_s: 7.1 },
    { word: "floor ", start_s: 7.1, end_s: 7.1 }
] as any[];

const promptText = `
Yeah, yeah
Oh, okay

Up at three AM, painting my bedroom floor
`;

const res = matchWordsToPrompt(alignedWords, promptText);
console.log(JSON.stringify(res.map(line => line.map(w => w.word).join("")), null, 2));
