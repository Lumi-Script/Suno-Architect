export const alignSyllablesToPrompt = (alignLyrics: AlignedLyricLine[], promptLines: AlignedWord[][]): AlignedWord[][] => {
    const allSyllables = alignLyrics.flatMap(l => {
        if (!l.words) return [];
        return l.words.map(w => ({
            word: w.text || (w as any).word || "",
            start_s: w.start_s,
            end_s: w.end_s,
            success: true
        }));
    }).sort((a, b) => a.start_s - b.start_s);

    if (promptLines.length === 0) {
        return alignLyrics.map(l => l.words.map(w => ({
            word: w.text || (w as any).word || "",
            start_s: w.start_s,
            end_s: w.end_s,
            success: true
        })));
    }

    // Flatten promptLines to assign syllables to words
    const allWords = promptLines.flatMap(line => line);
    if (allWords.length === 0) return promptLines;

    // Map each syllable to a word
    const syllableToWord = new Map<AlignedWord, AlignedWord>();
    
    for (const syl of allSyllables) {
        let bestWord = allWords[0];
        let maxScore = -1;
        
        const cleanSyl = syl.word.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

        for (const word of allWords) {
            const overlapStart = Math.max(syl.start_s, word.start_s);
            const overlapEnd = Math.min(syl.end_s, word.end_s);
            let overlap = overlapEnd - overlapStart;
            
            // Add a massive boost if the syllable text is found in the word
            let textBoost = 0;
            const cleanWord = word.word.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            if (cleanSyl && cleanWord && cleanWord.includes(cleanSyl)) {
                textBoost = 1000; // Textual match strongly overrides minor time differences
            } else if (cleanSyl && cleanWord && cleanSyl.includes(cleanWord)) {
                textBoost = 1000;
            }
            
            const score = overlap + textBoost;

            if (score > maxScore) {
                maxScore = score;
                bestWord = word;
            }
        }
        
        // If there's no overlap at all and no text match, assign to the closest word in time
        if (maxScore <= 0) {
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

    const result: AlignedWord[][] = [];
    
    for (const line of promptLines) {
        if (line.length === 0) {
            result.push([]);
            continue;
        }
        
        const lineSyllables: AlignedWord[] = [];
        for (const syl of allSyllables) {
            if (line.includes(syllableToWord.get(syl)!)) {
                // Clean up leading newlines from syllables so they don't break UI
                const cleanText = syl.word.replace(/^\n+/, '');
                lineSyllables.push({ ...syl, word: cleanText });
            }
        }
        result.push(lineSyllables);
    }

    return result;
};
