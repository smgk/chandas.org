// Meter analysis logic in JavaScript (shared by both frontend and PHP API)
function analyzeMeter(text) {
    const scriptPatterns = {
        devanagari: {
            shortVowels: /[अइउऋऌएओ]/,
            longVowels: /[आईऊॠॡऐऔ]/,
            consonants: /[क-ह]/,
            vowelMarks: /[ा-ौ]/,
            anusvaraVisarga: /[ंः]/,
            virama: /्/
        },
        kannada: {
            shortVowels: /[ಅಇಉಋಎಒ]/,
            longVowels: /[ಆಈಊೠಐಔ]/,
            consonants: /[ಕ-ಹ]/,
            vowelMarks: /[ಾ-ೌ]/,
            anusvaraVisarga: /[ಂಃ]/,
            virama: /್/
        },
        telugu: {
            shortVowels: /[అఇఉఋఎఒ]/,
            longVowels: /[ఆఈఊౠఐఔ]/,
            consonants: /[క-హ]/,
            vowelMarks: /[ా-ౌ]/,
            anusvaraVisarga: /[ంః]/,
            virama: /్/
        }
    };

    let detectedScript = "Unknown";
    let pattern = [];
    let syllables = [];

    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        let nextChar = text[i + 1] || "";
        let classified = false;

        for (const script in scriptPatterns) {
            const { shortVowels, longVowels, consonants, vowelMarks, anusvaraVisarga, virama } = scriptPatterns[script];
            
            detectedScript = script;
            
            if (consonants.test(char)) {
                if (vowelMarks.test(nextChar)) {
                    syllables.push(char + nextChar);
                    i++;
                } else {
                    syllables.push(char);
                }
                classified = true;
                break;
            }
            
            if (shortVowels.test(char)) {
                syllables.push(char);
                classified = true;
                break;
            }
            
            if (longVowels.test(char) || anusvaraVisarga.test(char)) {
                syllables.push(char);
                classified = true;
                break;
            }
        }
        
        if (!classified) {
            syllables.push(char);
        }
    }
    
    for (let syllable of syllables) {
        for (const script in scriptPatterns) {
            const { shortVowels, longVowels, consonants, vowelMarks, anusvaraVisarga } = scriptPatterns[script];
            
            if (shortVowels.test(syllable)) {
                pattern.push(`${syllable}L`);
                break;
            }
            
            if (longVowels.test(syllable) || anusvaraVisarga.test(syllable) || (consonants.test(syllable) && !vowelMarks.test(syllable))) {
                pattern.push(`${syllable}G`);
                break;
            }
        }
    }
    
    return { pattern: pattern.join(" "), detectedScript };
}

// Export for both browser and Node.js compatibility
if (typeof module !== "undefined" && module.exports) {
    module.exports = analyzeMeter;
}
