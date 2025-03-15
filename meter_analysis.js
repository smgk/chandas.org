// Meter analysis logic in JavaScript (shared by both frontend and API)
// This script classifies syllables as Laghu (L) or Guru (G), detects script, and finds metrical patterns.

function analyzeMeter(text) {
    // Define script-specific patterns for vowels, consonants, and special characters
    const scriptPatterns = {
        devanagari: {
            shortVowels: /[अइउऋऌएओ]/, // Laghu
            longVowels: /[आईऊॠॡऐऔ]/, // Guru
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

    // Step 1: Detect script and segment text into syllables
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
    
    // Step 2: Classify each syllable as Laghu (L) or Guru (G)
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
    
    let meterPatterns = {
        "Anushtubh": "GLGL GLGL GLGL GLGL",
        "Indravajra": "GGLG GGLG GGLG",
        "Upendravajra": "GLGG GLGG GLGG"
    };
    
    let detectedMeter = "Unknown";
    let approxMeters = [];
    let patternString = pattern.join(" ");

    for (const [meter, meterPattern] of Object.entries(meterPatterns)) {
        if (patternString === meterPattern) {
            detectedMeter = meter;
            break;
        } else if (patternString.length === meterPattern.length) {
            approxMeters.push(meter);
        }
    }
    
    return {
        pattern: patternString,
        detectedScript,
        detectedmeter: detectedMeter,
        aproxmeters: approxMeters
    };
}

// Export for both browser and Node.js compatibility
if (typeof module !== "undefined" && module.exports) {
    module.exports = analyzeMeter;
}
