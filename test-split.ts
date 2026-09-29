const splitMergedAlignedWords = (words: any[]): any[] => {
    const result: any[] = [];
    for (const w of words) {
        const parts = w.word.split(/(\n+)/);
        
        if (parts.length === 1) {
            result.push(w);
            continue;
        }
        
        const splitWords: string[] = [];
        let current = "";
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                 if (current) splitWords.push(current);
                 current = parts[i];
            } else {
                 current += parts[i];
                 splitWords.push(current);
                 current = "";
            }
        }
        if (current) splitWords.push(current);
        
        const finalWords = splitWords.filter(s => s.length > 0);
        
        if (finalWords.length === 1) {
             result.push({ ...w, word: finalWords[0] });
             continue;
        }

        const totalLen = finalWords.reduce((sum, s) => sum + s.length, 0);
        const duration = w.end_s - w.start_s;
        let currentStart = w.start_s;
        
        for (const fw of finalWords) {
             const fwDuration = (fw.length / totalLen) * duration;
             result.push({
                  ...w,
                  word: fw,
                  start_s: currentStart,
                  end_s: currentStart + fwDuration
             });
             currentStart += fwDuration;
        }
    }
    return result;
};

const input = [
  { word: "fades\nScroll ", start_s: 4.4838, end_s: 6.144 },
  { word: "light\n\nV6 ", start_s: 17.8886, end_s: 20.29267 },
  { word: "normal ", start_s: 1, end_s: 2 },
  { word: "end\n", start_s: 3, end_s: 4 },
  { word: "\n\nstart", start_s: 5, end_s: 6 }
];

console.log(JSON.stringify(splitMergedAlignedWords(input), null, 2));
