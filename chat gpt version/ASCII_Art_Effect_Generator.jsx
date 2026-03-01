/*
ASCII Art Effect Generator for After Effects
Professional character-based pixel art effect creator
Version 1.0
*/

(function asciiArtEffectGenerator() {
    
    // Main function
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "ASCII Art Effect", undefined);
        
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 10;
        win.margins = 16;
        
        // Title
        var titleGroup = win.add("group");
        titleGroup.add("statictext", undefined, "ASCII Art Effect Generator", {multiline: false});
        
        // Settings Group
        var settingsGroup = win.add("panel", undefined, "Effect Settings");
        settingsGroup.orientation = "column";
        settingsGroup.alignChildren = ["fill", "top"];
        settingsGroup.spacing = 8;
        settingsGroup.margins = 10;
        
        // Character Set Selection
        var charSetGroup = settingsGroup.add("group");
        charSetGroup.add("statictext", undefined, "Character Set:");
        var charSetDropdown = charSetGroup.add("dropdownlist", undefined, [
            "Symbols (Dense to Light)",
            "Alphabet (a-z)",
            "Numbers (0-9)",
            "Binary (0 1)",
            "Custom Characters"
        ]);
        charSetDropdown.selection = 0;
        
        // Resolution
        var resGroup = settingsGroup.add("group");
        resGroup.add("statictext", undefined, "Grid Size:");
        var resSlider = resGroup.add("slider", undefined, 50, 10, 200);
        var resText = resGroup.add("edittext", undefined, "50");
        resText.characters = 5;
        
        resSlider.onChanging = function() {
            resText.text = Math.round(resSlider.value);
        };
        
        resText.onChange = function() {
            resSlider.value = parseInt(resText.text) || 50;
        };
        
        // Color Options
        var colorGroup = settingsGroup.add("group");
        colorGroup.add("statictext", undefined, "Color Mode:");
        var colorDropdown = colorGroup.add("dropdownlist", undefined, [
            "Original Colors",
            "Monochrome",
            "Gradient (Custom)",
            "Duotone",
            "Matrix Green"
        ]);
        colorDropdown.selection = 0;
        
        // Create Button
        var createBtn = win.add("button", undefined, "Create ASCII Effect");
        
        // Help text
        var helpText = win.add("statictext", undefined, "Select a layer and click Create", {multiline: true});
        helpText.alignment = ["fill", "top"];
        
        // Create Effect Function
        createBtn.onClick = function() {
            app.beginUndoGroup("Create ASCII Art Effect");
            
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) {
                alert("Please select a composition.");
                return;
            }
            
            var layers = comp.selectedLayers;
            if (layers.length === 0) {
                alert("Please select a layer.");
                return;
            }
            
            var sourceLayer = layers[0];
            var gridSize = parseInt(resText.text);
            var charSet = charSetDropdown.selection.index;
            var colorMode = colorDropdown.selection.index;
            
            createASCIIEffect(comp, sourceLayer, gridSize, charSet, colorMode);
            
            app.endUndoGroup();
            alert("ASCII Art Effect created successfully!");
        };
        
        win.layout.layout(true);
        return win;
    }
    
    // Main effect creation function
    function createASCIIEffect(comp, sourceLayer, gridSize, charSetType, colorMode) {
        
        // Create control null
        var controlNull = comp.layers.addNull();
        controlNull.name = "ASCII Controls";
        controlNull.label = 1; // Red
        
        // Add expression controls
        var gridSizeControl = controlNull.Effects.addProperty("ADBE Slider Control");
        gridSizeControl.name = "Grid Size";
        gridSizeControl(1).setValue(gridSize);
        
        var charSpacingControl = controlNull.Effects.addProperty("ADBE Slider Control");
        charSpacingControl.name = "Character Spacing";
        charSpacingControl(1).setValue(1.0);
        
        var contrastControl = controlNull.Effects.addProperty("ADBE Slider Control");
        contrastControl.name = "Contrast";
        contrastControl(1).setValue(100);
        
        var brightnessControl = controlNull.Effects.addProperty("ADBE Slider Control");
        brightnessControl.name = "Brightness";
        brightnessControl(1).setValue(0);
        
        var invertControl = controlNull.Effects.addProperty("ADBE Checkbox Control");
        invertControl.name = "Invert";
        
        var colorControl1 = controlNull.Effects.addProperty("ADBE Color Control");
        colorControl1.name = "Color 1";
        colorControl1(1).setValue([0, 0, 0, 1]);
        
        var colorControl2 = controlNull.Effects.addProperty("ADBE Color Control");
        colorControl2.name = "Color 2";
        colorControl2(1).setValue([1, 1, 1, 1]);
        
        // Create sampling layer (duplicate of source)
        var sampleLayer = sourceLayer.duplicate();
        sampleLayer.name = "ASCII Sample";
        sampleLayer.enabled = false;
        
        // Add Mosaic effect for pixelation
        var mosaic = sampleLayer.Effects.addProperty("ADBE Mosaic");
        mosaic(1).expression = 'thisComp.layer("ASCII Controls").effect("Grid Size")("Slider")';
        
        // Add brightness/contrast
        var brightContrast = sampleLayer.Effects.addProperty("ADBE Brightness & Contrast 2");
        brightContrast(1).expression = 'thisComp.layer("ASCII Controls").effect("Brightness")("Slider")';
        brightContrast(2).expression = 'thisComp.layer("ASCII Controls").effect("Contrast")("Slider")';
        
        // Create text layer for ASCII characters
        var textLayer = comp.layers.addText("");
        textLayer.name = "ASCII Display";
        
        // Get character set
        var characters = getCharacterSet(charSetType);
        
        // Create the main expression for the text layer
        var textExpression = createTextExpression(characters, colorMode);
        
        // Apply expression to source text
        var sourceText = textLayer.property("Source Text");
        sourceText.expression = textExpression;
        
        // Set text properties
        var textProp = sourceText.value;
        textProp.fontSize = 12;
        textProp.font = "Courier New";
        textProp.fillColor = [1, 1, 1];
        textProp.applyFill = true;
        textProp.applyStroke = false;
        sourceText.setValue(textProp);
        
        // Parent text layer to control null
        textLayer.parent = controlNull;
        
        // Organize layers
        sourceLayer.moveAfter(textLayer);
        sampleLayer.moveAfter(sourceLayer);
        controlNull.moveToBeginning();
        
        return controlNull;
    }
    
    // Get character set based on type
    function getCharacterSet(type) {
        switch(type) {
            case 0: // Symbols
                return "@%#*+=-:. ";
            case 1: // Alphabet
                return "abcdefghijklmnopqrstuvwxyz";
            case 2: // Numbers
                return "0123456789";
            case 3: // Binary
                return "01 ";
            case 4: // Custom
                return "@#$%&*+=- ";
            default:
                return "@%#*+=-:. ";
        }
    }
    
    // Create the text expression
    function createTextExpression(characters, colorMode) {
        var expr = '';
        expr += '// ASCII Art Effect Expression\n';
        expr += 'var chars = "' + characters + '";\n';
        expr += 'var ctrl = thisComp.layer("ASCII Controls");\n';
        expr += 'var sample = thisComp.layer("ASCII Sample");\n';
        expr += 'var gridSize = ctrl.effect("Grid Size")("Slider");\n';
        expr += 'var spacing = ctrl.effect("Character Spacing")("Slider");\n';
        expr += 'var invert = ctrl.effect("Invert")("Checkbox");\n';
        expr += '\n';
        expr += 'var cols = Math.floor(thisComp.width / gridSize);\n';
        expr += 'var rows = Math.floor(thisComp.height / gridSize);\n';
        expr += '\n';
        expr += 'var result = "";\n';
        expr += '\n';
        expr += 'for (var y = 0; y < rows; y++) {\n';
        expr += '    for (var x = 0; x < cols; x++) {\n';
        expr += '        var posX = (x + 0.5) * gridSize;\n';
        expr += '        var posY = (y + 0.5) * gridSize;\n';
        expr += '        \n';
        expr += '        var sampledColor = sample.sampleImage([posX, posY]);\n';
        expr += '        var brightness = (sampledColor[0] + sampledColor[1] + sampledColor[2]) / 3;\n';
        expr += '        \n';
        expr += '        if (invert) brightness = 1 - brightness;\n';
        expr += '        \n';
        expr += '        var charIndex = Math.floor(brightness * (chars.length - 1));\n';
        expr += '        charIndex = Math.max(0, Math.min(chars.length - 1, charIndex));\n';
        expr += '        \n';
        expr += '        result += chars[charIndex];\n';
        expr += '    }\n';
        expr += '    result += "\\n";\n';
        expr += '}\n';
        expr += '\n';
        expr += 'result;\n';
        
        return expr;
    }
    
    // Show the UI
    var win = buildUI(this);
    
    if (win instanceof Window) {
        win.center();
        win.show();
    } else {
        win.layout.layout(true);
    }
    
})();
