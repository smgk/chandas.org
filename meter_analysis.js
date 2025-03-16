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
				longVowelMarks: /[ೀೂೇೈೋೌಾ]/,
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
	
	// Function to extract ottakshara/conjuncts
	function countRepeatingConsonantViramaPairs(arr, startIndex = 0) {
		const { consonants, virama } = scriptPatterns[detectedScript];
		let count = 0;
		let i = startIndex;
	
		while (i < arr.length - 2 && consonants.test(arr[i]) && virama.test(arr[i + 1])) {
			count += 2; // Increment by 2 for each pair found
			i += 2; // Move to the next potential pair
		}
		return count;
	}
	
	// Example usage:
	//const textArray = ['ಕ', 'ಾ', 'ಕ', 'ು', 'ತ', '್', 'ಸ', '್', 'ಥ', 'ಂ'];
	//const x = 3; // Starting index
	
	// Pass the array and the starting index
	//const repeatingPairCount = countRepeatingConsonantViramaPairs(textArray, x);
	//console.log(repeatingPairCount); // Output will depend on the subarray

    // Function to correctly segment text into syllables and classify Laghu (L) or Guru (G)
	// 1. A syllable starts with consonant or an independent vowel
	// 2. if consonant, it is optionally followed by a dependant vowel
	// 3. then it is optionally followed by anuswara
	// 4. then it is optionally followed by pair(s) of consonant+virama
	// 5. 
    function segmentSyllables(text) {
        let segmented = [];
        let state = "START";
    
        const { consonants, shortVowelMarks, longVowelMarks, shortVowels, longVowels, anusvaraVisarga, virama } = scriptPatterns[detectedScript];
    
		// Parse the text one unicode character at a time, peeking into the next.
		let i=0;
		let slurpCount = 0;
		let conjunctCount = 0;
		let classification = "L";
		let syllable = "";



		while (i < text.length) {
            let char = text[i];
            let nextChar = text[i + 1] || "";
			let nextNextChar = text[i + 2] || "";

            switch (state) {
                case "START":
					//TODO slurp the leading conjunct special here.
					if (i==0){
						conjunctCount = countRepeatingConsonantViramaPairs(text,0)
						if (conjunctCount>0){
							syllable = text.slice(0, conjunctCount); //prepend the conjunct
							i=conjunctCount; //move the index up
							char = text[i];
							nextChar = text[i + 1] || "";
							nextNextChar = text[i + 2] || "";
						}
					}
                    if (consonants.test(char)) {
						console.log("consonant");
						slurpCount++;
						if (shortVowelMarks.test(nextChar) || longVowelMarks.test(nextChar)){
							slurpCount++;
							if (longVowelMarks.test(nextChar)){
								classification = "G";
							}
							if (anusvaraVisarga.test(nextNextChar)){
									slurpCount++;
									classification = "G";
								}							
						} else if (anusvaraVisarga.test(nextChar)){
								slurpCount++;
								classification = "G";
							}							
						
						//TODO deal with conjuncts across new line. pre process it out.
						conjunctCount = countRepeatingConsonantViramaPairs(text,i+slurpCount);

                    } else if (shortVowels.test(char)|| longVowels.test(char)) {
						console.log("vowel");
						slurpCount++;
						if (longVowels.test(char)){
							classification = "G";
						}
						if (anusvaraVisarga.test(nextChar)){
								slurpCount++;
								classification = "G";
						}
						//TODO deal with conjuncts across new line. pre process it out.
						conjunctCount = countRepeatingConsonantViramaPairs(text,i+slurpCount);
                    } else {
						console.log("no hit\n");
						i++;
					}

					if (conjunctCount>0){
							slurpCount +=conjunctCount
							classification = "G" 
					}
					
					state = "SYLLABLE_COMPLETE";
                    break;
                case "SYLLABLE_COMPLETE":
					syllable = syllable + text.slice(i, i + slurpCount);
					segmented.push({ syllable, classification });
					console.log({ i, char, nextChar, nextNextChar, classification, syllable, slurpCount, conjunctCount, state,detectedScript });

					state = "START";
					i=i+slurpCount;
					slurpCount = 0;
					conjunctCount = 0;
					classification = "L";
					syllable = '';

                    break;
            }
        }
    
        return segmented;
    }

    // Trim the text to remove leading and trailing spaces
    text = text.trim();

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
