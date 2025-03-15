// Meter analysis logic in JavaScript (shared by both frontend and API)
// This script classifies syllables as Laghu (L) or Guru (G), detects script, and finds metrical patterns.

function analyzeMeter(text, selectedMeter = null) {
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
    let detailedPattern = [];
    for (let syllable of syllables) {
        let classification = "";
        for (const script in scriptPatterns) {
            const { shortVowels, longVowels, consonants, vowelMarks, anusvaraVisarga } = scriptPatterns[script];
            
            if (shortVowels.test(syllable)) {
                classification = "L";
                break;
            }
            
            if (longVowels.test(syllable) || anusvaraVisarga.test(syllable) || (consonants.test(syllable) && !vowelMarks.test(syllable))) {
                classification = "G";
                break;
            }
        }
        detailedPattern.push({ syllable, expected: "", actual: classification });
    }
    
    let meterPatterns = {
        "Anushtubh": "GLGL GLGL GLGL GLGL",
        "Indravajra": "GGLG GGLG GGLG",
        "Upendravajra": "GLGG GLGG GLGG"
    };
    
    let detectedMeter = "Unknown";
    let approxMeters = [];
    let patternString = detailedPattern.map(item => item.actual).join(" ");

    for (const [meter, meterPattern] of Object.entries(meterPatterns)) {
        if (patternString === meterPattern) {
            detectedMeter = meter;
            break;
        } else if (patternString.length === meterPattern.length) {
            approxMeters.push(meter);
        }
    }

    // If user has selected a meter, set expected values
    if (selectedMeter && meterPatterns[selectedMeter]) {
        let expectedPattern = meterPatterns[selectedMeter].split(" ");
        detailedPattern.forEach((item, index) => {
            item.expected = expectedPattern[index] || "";
        });
    }
    
    return {
        pattern: detailedPattern,
        detectedScript,
        detectedmeter: detectedMeter,
        aproxmeters: approxMeters,
        selectedMeter
    };
}

// Export for both browser and Node.js compatibility
if (typeof module !== "undefined" && module.exports) {
    module.exports = analyzeMeter;
}

// Command-line support for file input with optional meter selection
if (typeof require !== "undefined" && require.main === module) {
    const fs = require("fs");

    // Read input from a file passed as a command-line argument
    const inputFile = process.argv[2];
    const selectedMeter = process.argv[3] || null;

    if (!inputFile) {
        console.error("Usage: node meter_analysis.js <input_file> [selected_meter]");
        process.exit(1);
    }

    fs.readFile(inputFile, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            process.exit(1);
        }
        const result = analyzeMeter(data.trim(), selectedMeter);
        console.log(JSON.stringify(result, null, 2));
    });
}
