const alignLyrics = [
    {
        text: "Of thirty-five thousand feet",
        start_s: 6.941,
        end_s: 8.617,
        words: [
            {text: 'Of', start_s: 6.941, end_s: 7.181},
            {text: ' th', start_s: 7.181, end_s: 7.261},
            {text: 'irty', start_s: 7.261, end_s: 7.5},
            {text: '-five', start_s: 7.5, end_s: 7.739},
            {text: ' thousand', start_s: 7.739, end_s: 8.218},
            {text: ' feet', start_s: 8.218, end_s: 8.617}
        ]
    }
];

const autoLines = [
    [
        {word: 'Of ', start_s: 7.061, end_s: 7.181},
        {word: 'thirty-five ', start_s: 7.221, end_s: 7.739},
        {word: 'thousand ', start_s: 7.798, end_s: 8.218},
        {word: 'feet', start_s: 8.317, end_s: 8.617}
    ]
];

const allSyllables = alignLyrics.flatMap(l => l.words.map(w => ({
    word: w.text,
    start_s: w.start_s,
    end_s: w.end_s,
    success: true
}))).sort((a, b) => a.start_s - b.start_s);

const promptLines = autoLines;
const allWords = promptLines.flatMap(line => line);

const syllableToWord = new Map();
for (const syl of allSyllables) {
    let bestWord = allWords[0];
    let maxOverlap = -1;
    
    for (const word of allWords) {
        const overlapStart = Math.max(syl.start_s, word.start_s);
        const overlapEnd = Math.min(syl.end_s, word.end_s);
        const overlap = overlapEnd - overlapStart;
        
        if (overlap > maxOverlap) {
            maxOverlap = overlap;
            bestWord = word;
        }
    }
    
    if (maxOverlap <= 0) {
        let minDistance = Infinity;
        for (const word of allWords) {
            const dist = Math.min(Math.abs(syl.start_s - word.end_s), Math.abs(syl.end_s - word.start_s));
            if (dist < minDistance) {
                minDistance = dist;
                bestWord = word;
            }
        }
    }
    
    syllableToWord.set(syl, bestWord);
}

const result = [];
for (const line of promptLines) {
    const lineSyllables = [];
    for (const syl of allSyllables) {
        if (line.includes(syllableToWord.get(syl))) {
            lineSyllables.push({ ...syl, word: syl.word.replace(/^\n+/, '') });
        }
    }
    result.push(lineSyllables);
}

console.log(JSON.stringify(result, null, 2));
