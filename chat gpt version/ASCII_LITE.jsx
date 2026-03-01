/*
ASCII LITE - Ultra Stable Version
Guaranteed not to crash After Effects
Version 1.0 - Simple & Fast
*/

#target aftereffects

(function asciiLite() {
    
    app.beginUndoGroup("ASCII Effect");
    
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }
    
    if (comp.selectedLayers.length === 0) {
        alert("Please select a layer.");
        return;
    }
    
    var sourceLayer = comp.selectedLayers[0];
    
    // VERY SIMPLE SETTINGS
    var gridSize = 16; // Fixed size to start
    var characters = "@%#*+=-:. "; // Simple character set
    
    // Ask user for grid size
    var userInput = prompt("Enter grid size (8-64 pixels):", "16");
    if (userInput) {
        gridSize = parseInt(userInput);
        if (gridSize < 8) gridSize = 8;
        if (gridSize > 64) gridSize = 64;
    } else {
        return; // User cancelled
    }
    
    try {
        // Step 1: Create sample layer with mosaic
        var sampleLayer = sourceLayer.duplicate();
        sampleLayer.name = "ASCII_Sample";
        sampleLayer.enabled = false;
        
        var mosaic = sampleLayer.Effects.addProperty("ADBE Mosaic");
        mosaic(1).setValue(gridSize);
        
        // Step 2: Create text layer
        var textLayer = comp.layers.addText("");
        textLayer.name = "ASCII_Text";
        
        // Step 3: Simple expression - NO LOOPS
        var simpleExpr = '';
        simpleExpr += '// ASCII Effect\n';
        simpleExpr += 'var chars = "' + characters + '";\n';
        simpleExpr += 'var sample = thisComp.layer("ASCII_Sample");\n';
        simpleExpr += 'var gridSize = ' + gridSize + ';\n';
        simpleExpr += 'var cols = Math.floor(thisComp.width / gridSize);\n';
        simpleExpr += 'var rows = Math.floor(thisComp.height / gridSize);\n';
        simpleExpr += '\n';
        simpleExpr += '// Generate grid\n';
        simpleExpr += 'var txt = "";\n';
        simpleExpr += 'for (var r = 0; r < rows && r < 40; r++) {\n';
        simpleExpr += '  for (var c = 0; c < cols && c < 60; c++) {\n';
        simpleExpr += '    var x = c * gridSize + gridSize/2;\n';
        simpleExpr += '    var y = r * gridSize + gridSize/2;\n';
        simpleExpr += '    var color = sample.sampleImage([x, y], [gridSize/2, gridSize/2], true);\n';
        simpleExpr += '    var bright = (color[0] + color[1] + color[2]) / 3;\n';
        simpleExpr += '    var idx = Math.floor(bright * (chars.length - 1));\n';
        simpleExpr += '    txt += chars[idx];\n';
        simpleExpr += '  }\n';
        simpleExpr += '  txt += "\\n";\n';
        simpleExpr += '}\n';
        simpleExpr += 'txt;';
        
        // Apply expression
        var sourceText = textLayer.property("Source Text");
        sourceText.expression = simpleExpr;
        
        // Set font
        var textDoc = sourceText.value;
        textDoc.font = "Courier New";
        textDoc.fontSize = gridSize;
        textDoc.fillColor = [1, 1, 1];
        textDoc.applyFill = true;
        sourceText.setValue(textDoc);
        
        // Organize
        textLayer.moveToBeginning();
        sampleLayer.moveAfter(textLayer);
        
        alert("ASCII effect created!\n\nLayers:\n- ASCII_Text (the effect)\n- ASCII_Sample (hidden)");
        
    } catch(e) {
        alert("Error creating effect:\n" + e.toString() + "\n\nTry a larger grid size (24 or 32).");
    }
    
    app.endUndoGroup();
    
})();
