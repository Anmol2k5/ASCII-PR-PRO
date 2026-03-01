/*
ASCII FIXED - Proper Character Handling
Fixes the "invalid character" error
*/

#target aftereffects

(function() {
    
    app.beginUndoGroup("ASCII Effect");
    
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        alert("Please open a composition.");
        app.endUndoGroup();
        return;
    }
    
    if (comp.selectedLayers.length === 0) {
        alert("Please select a layer.");
        app.endUndoGroup();
        return;
    }
    
    var sourceLayer = comp.selectedLayers[0];
    var gridSize = 20;
    
    // Ask for grid size
    var userGrid = prompt("Enter grid size (16-48 recommended):", "20");
    if (userGrid) {
        gridSize = parseInt(userGrid);
    } else {
        app.endUndoGroup();
        return;
    }
    
    try {
        // Duplicate source layer
        var sampleLayer = sourceLayer.duplicate();
        sampleLayer.name = "SampleLayer";
        sampleLayer.enabled = false;
        
        // Add mosaic effect
        var mosaicEffect = sampleLayer.Effects.addProperty("ADBE Mosaic");
        mosaicEffect(1).setValue(gridSize);
        
        // Create text layer
        var textLayer = comp.layers.addText("");
        textLayer.name = "ASCII_Output";
        
        // BUILD EXPRESSION - Use character codes instead of strings
        var expressionText = '';
        expressionText += '// ASCII Art Expression\n';
        expressionText += 'var charCodes = [64, 35, 37, 42, 43, 61, 45, 46, 32];\n'; // @#%*+=-.  (space=32)
        expressionText += 'var chars = "";\n';
        expressionText += 'for (var i = 0; i < charCodes.length; i++) {\n';
        expressionText += '  chars += String.fromCharCode(charCodes[i]);\n';
        expressionText += '}\n';
        expressionText += '\n';
        expressionText += 'var sampleLayer = thisComp.layer("SampleLayer");\n';
        expressionText += 'var gridSize = ' + gridSize + ';\n';
        expressionText += 'var cols = Math.floor(thisComp.width / gridSize);\n';
        expressionText += 'var rows = Math.floor(thisComp.height / gridSize);\n';
        expressionText += '\n';
        expressionText += '// Limit to prevent crashes\n';
        expressionText += 'cols = Math.min(cols, 100);\n';
        expressionText += 'rows = Math.min(rows, 60);\n';
        expressionText += '\n';
        expressionText += 'var output = "";\n';
        expressionText += 'for (var row = 0; row < rows; row++) {\n';
        expressionText += '  for (var col = 0; col < cols; col++) {\n';
        expressionText += '    var xPos = col * gridSize + gridSize * 0.5;\n';
        expressionText += '    var yPos = row * gridSize + gridSize * 0.5;\n';
        expressionText += '    var sampledColor = sampleLayer.sampleImage([xPos, yPos]);\n';
        expressionText += '    var brightness = (sampledColor[0] + sampledColor[1] + sampledColor[2]) / 3;\n';
        expressionText += '    var charIndex = Math.floor(brightness * (chars.length - 1));\n';
        expressionText += '    charIndex = Math.max(0, Math.min(chars.length - 1, charIndex));\n';
        expressionText += '    output += chars.charAt(charIndex);\n';
        expressionText += '  }\n';
        expressionText += '  output += "\\n";\n';
        expressionText += '}\n';
        expressionText += 'output;';
        
        // Apply expression
        var sourceTextProp = textLayer.property("Source Text");
        sourceTextProp.expression = expressionText;
        
        // Set text properties
        var textDocument = sourceTextProp.value;
        textDocument.font = "Courier New";
        textDocument.fontSize = gridSize;
        textDocument.fillColor = [1, 1, 1];
        textDocument.applyFill = true;
        sourceTextProp.setValue(textDocument);
        
        // Organize layers
        textLayer.moveToBeginning();
        sampleLayer.moveAfter(textLayer);
        sourceLayer.moveAfter(sampleLayer);
        sourceLayer.enabled = false;
        
        alert("ASCII effect created!\n\nYou can now see the ASCII version.\n\nLayer: ASCII_Output");
        
    } catch(error) {
        alert("Error occurred:\n" + error.toString() + "\n\nLine: " + error.line);
    }
    
    app.endUndoGroup();
    
})();
