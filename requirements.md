# Chandas Meter Analyzer - Requirements Document
# Auto generated at the end of first session

## Overview
Chandas Meter Analyzer is a web-based tool designed to analyze Sanskrit and other Indian-language poetry meters. The tool consists of a **frontend (index.html)** and a **backend logic module (meter_analysis.js)**. It identifies the script, segments text into syllables, classifies syllables as Laghu (L) or Guru (G), and detects possible meters.

---

## Functional Requirements

### 1. **Frontend (index.html)**
- Provides a **text area** for users to input text.
- Detects meter **as the user types** (real-time analysis).
- Displays:
  - **Meter Pattern** with Laghu (L) and Guru (G) classification.
  - **Detected Script** (Devanagari, Kannada, Telugu, etc.).
  - **Number of Syllables & Maatras per Line.**
  - **Closest Approximate Meters.**
- Allows the user to **select a predefined meter** for comparison.
- Highlights **deviations from the selected meter** in red.
- Uses **smooth CSS animations** for UI updates.

### 2. **Backend Logic (meter_analysis.js)**
- Segments the input text into **syllables** based on:
  - **Consonant + Dependent Vowel + Anusvara/Visarga** (e.g., ಕುಂ, ಕಾಂ, ನಿಃ, ನೀಃ)
  - **Consonant + Dependent Vowel + Conjunct** (e.g., ಕುಕ್ in ಕುಕ್ಕೆ)
- Classifies syllables as **Laghu (L) or Guru (G)** based on:
  - Short vowels → Laghu
  - Long vowels, anusvara, visarga, or standalone consonants → Guru
- **Detects the script** based on character patterns.
- **Matches against predefined meters** (e.g., Anushtubh, Indravajra, Upendravajra).
- Returns JSON output with:
  - `pattern`: List of syllables with their classification
  - `detectedScript`: Identified script
  - `detectedMeter`: Exact meter match (if found)
  - `approxMeters`: List of closest matching meters
  - `selectedMeter`: User-selected meter (if any)

---

## Technical Requirements

### **Frontend (index.html)**
- Uses **Vanilla JavaScript** (no external frameworks required).
- Has a **meter selection dropdown**.
- Uses **CSS animations** for smooth UI transitions.
- Provides **real-time feedback** as the user types.

### **Backend (meter_analysis.js)**
- Can be **run in a browser** (frontend integration).
- Can be **executed from the command line** using:
  ```sh
  node meter_analysis.js input.txt [selected_meter]
  ```
- **Outputs JSON** with analysis results.
- Includes **console logs for debugging** (segmenting syllables, Guru/Laghu classification, script detection).

---

## Usage Instructions

### **1. Running Locally**
- Open `index.html` in a browser to use the web interface.
- Run the backend manually with:
  ```sh
  node meter_analysis.js input.txt Anushtubh
  ```

### **2. Input Format**
- User enters text **in an Indian script**.
- Lines are processed **individually**.
- Output is displayed in **real-time**.

### **3. Expected JSON Output (Example)**
```json
{
    "pattern": [
        {"syllable": "ಕುಂ", "expected": "G", "actual": "G"},
        {"syllable": "ಕಾರ", "expected": "L", "actual": "L"}
    ],
    "detectedScript": "kannada",
    "detectedMeter": "Unknown",
    "approxMeters": ["Indravajra", "Anushtubh"],
    "selectedMeter": "Anushtubh"
}
```

---

## Future Enhancements
- Support **more Indian scripts**.
- Add **phonetic-based segmentation** for accuracy.
- Integrate **a Twitter bot for meter analysis.**
- Add **clipboard copy and social sharing options**.

---

## Summary
This document serves as the **baseline requirements** for the Chandas Meter Analyzer. Any future updates should ensure compatibility with this specification.

🚀 **Ready for testing and deployment!** 🚀

