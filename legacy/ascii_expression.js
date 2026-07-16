// After Effects Expression for "Expression Selector" - Amount
// Used in a Text Animator with "Character Offset"

const sourceLayer = thisComp.layer("Source"); // Name of your footage layer
const density = 100; // Controlled by slider
const charSet = " .:-=+*#%@"; // Char set from darkest to brightest

// Get character index and position
const idx = textIndex - 1;
const cols = Math.floor(thisComp.width / (thisLayer.sourceRectAtTime().width / textTotal));
const x = (idx % cols) * (thisComp.width / cols);
const y = Math.floor(idx / cols) * (thisComp.height / (textTotal / cols));

// Sample luminosity
const sample = sourceLayer.sampleImage([x, y], [5, 5]);
const lum = (sample[0] + sample[1] + sample[2]) / 3;

// Map to character index
const targetCharIdx = Math.floor(lum * (charSet.length - 1));
const currentCharCode = text.sourceText.value.charCodeAt(idx);
const targetCharCode = charSet.charCodeAt(targetCharIdx);

// Return the offset as a percentage (Selector Amount)
(targetCharCode - currentCharCode) 
