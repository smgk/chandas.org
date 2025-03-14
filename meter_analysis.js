// Meter analysis logic in JavaScript (shared by both frontend and PHP API)
// This script is designed to analyze meter by classifying syllables as Laghu (L) or Guru (G)
// It supports multiple Indian scripts, detects the script used, and returns a metrical pattern

function analyzeMeter(text) {
    // Define script-specific patterns for vowels, consonants, and special characters
    const scriptPatterns = {
        devanagari: {
            shortVowels: /[अइउऋऌएओ]/, // Short vowels (Laghu)
            longVowels: /[आईऊॠॡऐऔ]/, // Long vowels (Guru)
            consonants: /[क-ह]/, // Consonant range
            vowelMarks: /[ा-ौ]/, // Dependent vowel diacritics
            anusvaraVisarga: /[ंः]/, // Anusvara (ं) and Visarga (ः) are always Guru
            virama: /्/ // Virama (्) marks conjunct consonants
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

    let detectedScript = "Unknown"; // Initialize script detection
    let pattern = []; // Store the Laghu (L) / Guru (G) pattern
    let syllables = []; // Store segmented syllables

    // Step 1: Segment text into syllables
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        let nextChar = text[i + 1] || "";
        let classified = false;

        // Identify the script and apply appropriate rules
        for (const script in scriptPatterns) {
            const { shortVowels, longVowels, consonants, vowelMarks, anusvaraVisarga, virama } = scriptPatterns[script];
            
            detectedScript = script;
            
            // Handling consonants
            if (consonants.test(char)) {
                if (vowelMarks.test(nextChar)) {
                    // Consonant + Vowel Mark forms a full syllable
                    syllables.push(char + nextChar);
                    i++; // Move to next character
                } else {
                    // Standalone consonant
                    syllables.push(char);
                }
                classified = true;
                break;
            }
            
            // Handling independent short vowels
            if (shortVowels.test(char)) {
                syllables.push(char);
                classified = true;
                break;
            }
            
            // Handling long vowels and anusvara/visarga (always Guru)
            if (longVowels.test(char) || anusvaraVisarga.test(char)) {
                syllables.push(char);
                classified = true;
                break;
            }
        }
        
        if (!classified) {
            syllables.push(char); // Add any unclassified character as-is
        }
    }
    
    // Step 2: Classify each syllable as Laghu (L) or Guru (G)
    for (let syllable of syllables) {
        for (const script in scriptPatterns) {
            const { shortVowels, longVowels, consonants, vowelMarks, anusvaraVisarga } = scriptPatterns[script];
            
            if (shortVowels.test(syllable)) {
                pattern.push(`${syllable}L`); // Laghu syllable
                break;
            }
            
            if (longVowels.test(syllable) || anusvaraVisarga.test(syllable) || (consonants.test(syllable) && !vowelMarks.test(syllable))) {
                pattern.push(`${syllable}G`); // Guru syllable
                break;
            }
        }
    }
    
    return { pattern: pattern.join(" "), detectedScript }; // Return final result
}

// Export for both browser and Node.js compatibility
if (typeof module !== "undefined" && module.exports) {
    module.exports = analyzeMeter;
}
