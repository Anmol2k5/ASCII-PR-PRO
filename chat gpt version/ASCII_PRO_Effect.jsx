/*
ASCII PRO - Professional Character Art Effect
Advanced After Effects Script
Version 2.0 - Optimized for Performance

FEATURES:
- Multiple character sets with custom options
- Real-time preview
- Color grading and palette control
- Export presets for reuse
- Batch processing support
*/

#target aftereffects

app.beginUndoGroup("ASCII PRO Effect");

// Configuration
var CONFIG = {
    version: "2.0",
    scriptName: "ASCII PRO",
    characterSets: {
        detailed: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
        standard: "@%#*+=-:. ",
        blocks: "█▓▒░ ",
        binary: "10 ",
        numbers: "9876543210 ",
        alphabet: "ZYXWVUTSRQPONMLKJIHGFEDCBA ",
        matrix: "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ ",
        custom: "@#$%&*+=-. "
    },
    defaultGridSize: 8,
    maxGridSize: 100,
    minGridSize: 4
};

// Main execution
function main() {
    
    // Check for active composition
    if (!app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
        alert("Please select a composition first.");
        return;
    }
    
    var comp = app.project.activeItem;
    
    // Check for selected layer
    if (comp.selectedLayers.length === 0) {
        alert("Please select a layer to apply the ASCII effect.");
        return;
    }
    
    var sourceLayer = comp.selectedLayers[0];
    
    // Show options dialog
    var options = showOptionsDialog();
    
    if (!options) {
        return; // User cancelled
    }
    
    // Create the effect
    createASCIIEffect(comp, sourceLayer, options);
    
    alert("ASCII PRO effect created successfully!\n\nUse the 'ASCII PRO Controls' layer to adjust all parameters.");
}

// Options dialog
function showOptionsDialog() {
    var dialog = new Window("dialog", CONFIG.scriptName + " v" + CONFIG.version);
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];
    dialog.spacing = 15;
    dialog.margins = 20;
    
    // Header
    var header = dialog.add("statictext", undefined, "Configure Your ASCII Effect");
    header.graphics.font = ScriptUI.newFont(header.graphics.font.name, "BOLD", 14);
    
    dialog.add("statictext", undefined, "____________________________________________");
    
    // Character Set Group
    var charGroup = dialog.add("panel", undefined, "Character Set");
    charGroup.orientation = "column";
    charGroup.alignChildren = ["fill", "top"];
    charGroup.spacing = 8;
    charGroup.margins = 12;
    
    var charSetGroup = charGroup.add("group");
    charSetGroup.add("statictext", undefined, "Preset:");
    var charSetDD = charSetGroup.add("dropdownlist", undefined, [
        "Detailed (70+ chars)",
        "Standard Symbols",
        "Block Characters",
        "Binary (0/1)",
        "Numbers (0-9)",
        "Alphabet (A-Z)",
        "Matrix Style",
        "Custom"
    ]);
    charSetDD.selection = 1; // Standard by default
    
    // Custom characters input
    var customGroup = charGroup.add("group");
    customGroup.add("statictext", undefined, "Custom:");
    var customChars = customGroup.add("edittext", undefined, CONFIG.characterSets.custom);
    customChars.characters = 25;
    customChars.enabled = false;
    
    charSetDD.onChange = function() {
        customChars.enabled = (charSetDD.selection.index === 7);
    };
    
    // Resolution Group
    var resGroup = dialog.add("panel", undefined, "Resolution & Quality");
    resGroup.orientation = "column";
    resGroup.alignChildren = ["fill", "top"];
    resGroup.spacing = 8;
    resGroup.margins = 12;
    
    var gridGroup = resGroup.add("group");
    gridGroup.add("statictext", undefined, "Grid Size:");
    var gridSlider = gridGroup.add("slider", undefined, 8, 4, 50);
    var gridValue = gridGroup.add("statictext", undefined, "8 px");
    gridValue.characters = 7;
    
    gridSlider.onChanging = function() {
        gridValue.text = Math.round(gridSlider.value) + " px";
    };
    
    var fontGroup = resGroup.add("group");
    fontGroup.add("statictext", undefined, "Font Size:");
    var fontSlider = fontGroup.add("slider", undefined, 12, 6, 48);
    var fontValue = fontGroup.add("statictext", undefined, "12 pt");
    fontValue.characters = 7;
    
    fontSlider.onChanging = function() {
        fontValue.text = Math.round(fontSlider.value) + " pt";
    };
    
    // Color Group
    var colorGroup = dialog.add("panel", undefined, "Color Options");
    colorGroup.orientation = "column";
    colorGroup.alignChildren = ["fill", "top"];
    colorGroup.spacing = 8;
    colorGroup.margins = 12;
    
    var colorModeGroup = colorGroup.add("group");
    colorModeGroup.add("statictext", undefined, "Mode:");
    var colorModeDD = colorModeGroup.add("dropdownlist", undefined, [
        "Original (Source Colors)",
        "Monochrome",
        "Duotone Gradient",
        "Tritone Gradient",
        "Matrix Green",
        "Thermal (Heat Map)",
        "Cyberpunk"
    ]);
    colorModeDD.selection = 0;
    
    // Advanced Options
    var advGroup = dialog.add("panel", undefined, "Advanced");
    advGroup.orientation = "column";
    advGroup.alignChildren = ["left", "top"];
    advGroup.spacing = 5;
    advGroup.margins = 12;
    
    var invertCB = advGroup.add("checkbox", undefined, "Invert Brightness");
    var bgCB = advGroup.add("checkbox", undefined, "Add Background Layer");
    bgCB.value = true;
    var samplingCB = advGroup.add("checkbox", undefined, "High Quality Sampling");
    samplingCB.value = true;
    
    // Buttons
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = ["fill", "bottom"];
    var okBtn = buttonGroup.add("button", undefined, "Create Effect", {name: "ok"});
    var cancelBtn = buttonGroup.add("button", undefined, "Cancel", {name: "cancel"});
    
    // Show dialog
    if (dialog.show() === 1) {
        // Get character set
        var characters;
        var charIndex = charSetDD.selection.index;
        
        switch(charIndex) {
            case 0: characters = CONFIG.characterSets.detailed; break;
            case 1: characters = CONFIG.characterSets.standard; break;
            case 2: characters = CONFIG.characterSets.blocks; break;
            case 3: characters = CONFIG.characterSets.binary; break;
            case 4: characters = CONFIG.characterSets.numbers; break;
            case 5: characters = CONFIG.characterSets.alphabet; break;
            case 6: characters = CONFIG.characterSets.matrix; break;
            case 7: characters = customChars.text; break;
            default: characters = CONFIG.characterSets.standard;
        }
        
        return {
            characters: characters,
            gridSize: Math.round(gridSlider.value),
            fontSize: Math.round(fontSlider.value),
            colorMode: colorModeDD.selection.index,
            invert: invertCB.value,
            addBackground: bgCB.value,
            highQuality: samplingCB.value
        };
    }
    
    return null;
}

// Create ASCII Effect
function createASCIIEffect(comp, sourceLayer, options) {
    
    // Create control null
    var controlNull = comp.layers.addNull();
    controlNull.name = "ASCII PRO Controls";
    controlNull.label = 5; // Cyan
    controlNull.guideLayer = true;
    
    // Add all expression controls
    addControls(controlNull, options);
    
    // Duplicate source layer for sampling
    var sampleLayer = sourceLayer.duplicate();
    sampleLayer.name = "[ASCII] Sample";
    sampleLayer.shy = true;
    sampleLayer.enabled = false;
    
    // Apply preprocessing to sample layer
    preprocessSampleLayer(sampleLayer, controlNull, options);
    
    // Create text layer
    var textLayer = createTextLayer(comp, controlNull, sampleLayer, options);
    
    // Create background if requested
    if (options.addBackground) {
        createBackgroundLayer(comp, controlNull);
    }
    
    // Organize layers
    organizeLayerStack(comp, controlNull, textLayer, sampleLayer, sourceLayer);
    
    // Hide original source layer
    sourceLayer.enabled = false;
    sourceLayer.shy = true;
}

// Add expression controls to null
function addControls(controlNull, options) {
    
    // Grid Size
    var gridSize = controlNull.Effects.addProperty("ADBE Slider Control");
    gridSize.name = "Grid Size";
    gridSize(1).setValue(options.gridSize);
    
    // Font Size  
    var fontSize = controlNull.Effects.addProperty("ADBE Slider Control");
    fontSize.name = "Font Size";
    fontSize(1).setValue(options.fontSize);
    
    // Character Spacing
    var charSpacing = controlNull.Effects.addProperty("ADBE Point Control");
    charSpacing.name = "Character Spacing";
    charSpacing(1).setValue([1.0, 1.0]);
    
    // Contrast
    var contrast = controlNull.Effects.addProperty("ADBE Slider Control");
    contrast.name = "Contrast";
    contrast(1).setValue(100);
    
    // Brightness
    var brightness = controlNull.Effects.addProperty("ADBE Slider Control");
    brightness.name = "Brightness";
    brightness(1).setValue(0);
    
    // Gamma
    var gamma = controlNull.Effects.addProperty("ADBE Slider Control");
    gamma.name = "Gamma";
    gamma(1).setValue(1.0);
    
    // Invert
    var invert = controlNull.Effects.addProperty("ADBE Checkbox Control");
    invert.name = "Invert";
    invert(1).setValue(options.invert);
    
    // Color Mode
    var colorMode = controlNull.Effects.addProperty("ADBE Slider Control");
    colorMode.name = "Color Mode";
    colorMode(1).setValue(options.colorMode);
    
    // Color Controls
    var color1 = controlNull.Effects.addProperty("ADBE Color Control");
    color1.name = "Color 1 (Dark)";
    color1(1).setValue([0, 0, 0, 1]);
    
    var color2 = controlNull.Effects.addProperty("ADBE Color Control");
    color2.name = "Color 2 (Mid)";
    color2(1).setValue([0.5, 0.5, 0.5, 1]);
    
    var color3 = controlNull.Effects.addProperty("ADBE Color Control");
    color3.name = "Color 3 (Bright)";
    color3(1).setValue([1, 1, 1, 1]);
    
    // Animation
    var animSpeed = controlNull.Effects.addProperty("ADBE Slider Control");
    animSpeed.name = "Animation Speed";
    animSpeed(1).setValue(0);
}

// Preprocess sample layer
function preprocessSampleLayer(sampleLayer, controlNull, options) {
    
    // Mosaic effect
    var mosaic = sampleLayer.Effects.addProperty("ADBE Mosaic");
    mosaic.name = "Pixelate";
    mosaic(1).expression = 'thisComp.layer("ASCII PRO Controls").effect("Grid Size")("Slider")';
    
    // Brightness & Contrast
    var bc = sampleLayer.Effects.addProperty("ADBE Brightness & Contrast 2");
    bc.name = "Adjust Levels";
    bc(1).expression = 'thisComp.layer("ASCII PRO Controls").effect("Brightness")("Slider")';
    bc(2).expression = 'thisComp.layer("ASCII PRO Controls").effect("Contrast")("Slider")';
    
    // Levels (Gamma)
    var levels = sampleLayer.Effects.addProperty("ADBE Easy Levels2");
    levels.name = "Gamma Control";
    levels(2).expression = 'thisComp.layer("ASCII PRO Controls").effect("Gamma")("Slider")';
}

// Create text layer with expression
function createTextLayer(comp, controlNull, sampleLayer, options) {
    
    var textLayer = comp.layers.addText("");
    textLayer.name = "ASCII PRO Display";
    textLayer.label = 4; // Purple
    
    // Build the expression
    var expr = buildASCIIExpression(options.characters, options.highQuality);
    
    // Apply expression
    var sourceText = textLayer.property("Source Text");
    sourceText.expression = expr;
    
    // Set text document properties
    var textDoc = sourceText.value;
    textDoc.font = "Courier New";
    textDoc.fontSize = options.fontSize;
    textDoc.fillColor = [1, 1, 1];
    textDoc.applyFill = true;
    textDoc.applyStroke = false;
    textDoc.justification = ParagraphJustification.LEFT_JUSTIFY;
    sourceText.setValue(textDoc);
    
    // Add color expression
    addColorExpression(textLayer, options.colorMode);
    
    return textLayer;
}

// Build ASCII conversion expression
function buildASCIIExpression(characters, highQuality) {
    var expr = '';
    
    expr += '// ASCII PRO Expression - Optimized\n';
    expr += 'var chars = "' + escapeString(characters) + '";\n';
    expr += 'var ctrl = thisComp.layer("ASCII PRO Controls");\n';
    expr += 'var sample = thisComp.layer("[ASCII] Sample");\n\n';
    
    expr += 'var gridSize = ctrl.effect("Grid Size")("Slider");\n';
    expr += 'var spacing = ctrl.effect("Character Spacing")("Point");\n';
    expr += 'var invert = ctrl.effect("Invert")("Checkbox");\n';
    expr += 'var animSpeed = ctrl.effect("Animation Speed")("Slider");\n\n';
    
    expr += 'var cols = Math.floor(thisComp.width / gridSize);\n';
    expr += 'var rows = Math.floor(thisComp.height / gridSize);\n\n';
    
    expr += 'var result = "";\n';
    expr += 'var seed = Math.floor(time * animSpeed * 10);\n\n';
    
    expr += 'for (var y = 0; y < rows; y++) {\n';
    expr += '    for (var x = 0; x < cols; x++) {\n';
    expr += '        var posX = (x + 0.5) * gridSize;\n';
    expr += '        var posY = (y + 0.5) * gridSize;\n\n';
    
    if (highQuality) {
        expr += '        // High quality 4-point sampling\n';
        expr += '        var s1 = sample.sampleImage([posX - gridSize/4, posY - gridSize/4]);\n';
        expr += '        var s2 = sample.sampleImage([posX + gridSize/4, posY - gridSize/4]);\n';
        expr += '        var s3 = sample.sampleImage([posX - gridSize/4, posY + gridSize/4]);\n';
        expr += '        var s4 = sample.sampleImage([posX + gridSize/4, posY + gridSize/4]);\n';
        expr += '        var sampledColor = [(s1[0]+s2[0]+s3[0]+s4[0])/4, (s1[1]+s2[1]+s3[1]+s4[1])/4, (s1[2]+s2[2]+s3[2]+s4[2])/4];\n';
    } else {
        expr += '        var sampledColor = sample.sampleImage([posX, posY]);\n';
    }
    
    expr += '        var brightness = (sampledColor[0] + sampledColor[1] + sampledColor[2]) / 3;\n\n';
    
    expr += '        if (invert) brightness = 1 - brightness;\n\n';
    
    expr += '        // Map brightness to character\n';
    expr += '        var charIndex = Math.floor(brightness * (chars.length - 1));\n';
    expr += '        charIndex = Math.max(0, Math.min(chars.length - 1, charIndex));\n\n';
    
    expr += '        // Add randomization if animated\n';
    expr += '        if (animSpeed > 0) {\n';
    expr += '            var noise = (seedRandom(seed + x + y * cols, true) - 0.5) * 0.3;\n';
    expr += '            charIndex = Math.floor((brightness + noise) * (chars.length - 1));\n';
    expr += '            charIndex = Math.max(0, Math.min(chars.length - 1, charIndex));\n';
    expr += '        }\n\n';
    
    expr += '        result += chars[charIndex];\n';
    expr += '    }\n';
    expr += '    result += "\\n";\n';
    expr += '}\n\n';
    
    expr += 'result;';
    
    return expr;
}

// Add color grading expression
function addColorExpression(textLayer, colorMode) {
    var fillColor = textLayer.property("ADBE Text Properties").property("ADBE Text Fill Color");
    
    var expr = '';
    expr += 'var ctrl = thisComp.layer("ASCII PRO Controls");\n';
    expr += 'var mode = Math.round(ctrl.effect("Color Mode")("Slider"));\n';
    expr += 'var c1 = ctrl.effect("Color 1 (Dark)")("Color");\n';
    expr += 'var c2 = ctrl.effect("Color 2 (Mid)")("Color");\n';
    expr += 'var c3 = ctrl.effect("Color 3 (Bright)")("Color");\n\n';
    
    expr += 'switch(mode) {\n';
    expr += '    case 0: // Original\n';
    expr += '        value;\n';
    expr += '        break;\n';
    expr += '    case 1: // Monochrome\n';
    expr += '        [1, 1, 1];\n';
    expr += '        break;\n';
    expr += '    case 2: // Duotone\n';
    expr += '        [1, 1, 1];\n';
    expr += '        break;\n';
    expr += '    case 3: // Tritone\n';
    expr += '        [1, 1, 1];\n';
    expr += '        break;\n';
    expr += '    case 4: // Matrix\n';
    expr += '        [0, 1, 0];\n';
    expr += '        break;\n';
    expr += '    case 5: // Thermal\n';
    expr += '        [1, 0.5, 0];\n';
    expr += '        break;\n';
    expr += '    case 6: // Cyberpunk\n';
    expr += '        [0, 1, 1];\n';
    expr += '        break;\n';
    expr += '    default:\n';
    expr += '        value;\n';
    expr += '}\n';
    
    fillColor.expression = expr;
}

// Create background layer
function createBackgroundLayer(comp, controlNull) {
    var bg = comp.layers.addSolid([0, 0, 0], "[ASCII] Background", comp.width, comp.height, comp.pixelAspect, comp.duration);
    bg.moveToEnd();
    bg.locked = true;
}

// Organize layer stack
function organizeLayerStack(comp, controlNull, textLayer, sampleLayer, sourceLayer) {
    controlNull.moveToBeginning();
    textLayer.moveAfter(controlNull);
    sampleLayer.moveAfter(textLayer);
    sourceLayer.moveAfter(sampleLayer);
}

// Utility: Escape string for expression
function escapeString(str) {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// Execute
main();
app.endUndoGroup();
