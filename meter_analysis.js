// Meter analysis logic in JavaScript (shared by both frontend and API)
// This script classifies syllables as Laghu (L) or Guru (G), detects script, and finds metrical patterns.



function analyzeMeter(text, selectedMeter = null) {
    // Define script-specific patterns for vowels, consonants, and special characters
		const scriptPatterns = {
			devanagari: {
				shortVowels: /[अइउऋऌएओ]/, // Laghu
				longVowels: /[आईऊॠॡऐऔ]/, // Guru
				consonants: /[क-ह]/,
				shortVowelMarks: /[िुॆॊ]/, // Short dependent vowel markers
				longVowelMarks: /[ीूेैोौ]/, // Long dependent vowel markers
				anusvaraVisarga: /[ंः]/,
				virama: /्/
			},
			kannada: {
				shortVowels: /[ಅಇಉಋಎಒ]/,
				longVowels: /[ಆಈಊೠಐಔ]/,
				consonants: /[ಕ-ಹ]/,
				shortVowelMarks: /[ಿುೆೊ]/,
				longVowelMarks: /[ೀೂೇೈೋೌ]/,
				anusvaraVisarga: /[ಂಃ]/,
				virama: /್/
			}
		};

    let detectedScript = "Unknown";
    let pattern = [];
    let syllables = [];

    // Step 1: Detect the script by majority consonants occurrence
    let scriptCounts = {};
    for (const script in scriptPatterns) {
        scriptCounts[script] = (text.match(scriptPatterns[script].consonants) || []).length;
    }
    detectedScript = Object.keys(scriptCounts).reduce((a, b) => scriptCounts[a] > scriptCounts[b] ? a : b);

    // Fallback: If no script detected, return empty segmentation
    if (!scriptCounts[detectedScript]) {
        return { pattern: [], detectedScript: "Unknown", detectedmeter: "Unknown", aproxmeters: [], selectedMeter };
    }

    // Function to correctly segment text into syllables and classify Laghu (L) or Guru (G)
    function segmentSyllables(text) {
        let segmented = [];
        let buffer = "";

        const { consonants, shortVowelMarks, longVowelMarks, shortVowels, longVowels, anusvaraVisarga, virama } = scriptPatterns[detectedScript];

        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            let nextChar = text[i + 1] || "";
            let nextNextChar = text[i + 2] || "";
            let classification = "";
            let syllable = char;

            if (consonants.test(char)) {
                if (shortVowelMarks.test(nextChar)) {
                    syllable += nextChar;
                    classification = "L";
                    i++;
                } else if (longVowelMarks.test(nextChar)) {
                    syllable += nextChar;
                    classification = "G";
                    i++;
                } else if (anusvaraVisarga.test(nextChar)) {
                    syllable += nextChar;
                    classification = "G";
                    i++;
                } else if (virama.test(nextChar)) {
                    buffer += char + nextChar;
                    i++;
                    continue;
                } else {
                    classification = "G";
                    if (buffer) {
                        syllable = buffer + char;
                        buffer = "";
                    }
                }
            } else if (shortVowelMarks.test(char) || shortVowels.test(char)) {
                classification = "L";
            } else if (longVowelMarks.test(char) || longVowels.test(char) || anusvaraVisarga.test(char)) {
                classification = "G";
            }
            segmented.push({ syllable, classification });
        }
        return segmented;
    }

    syllables = segmentSyllables(text);
    
    // Step 2: Store the pattern directly from segmentation
    let detailedPattern = syllables.map(({ syllable, classification }) => ({ syllable, expected: "", actual: classification }));
    
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
