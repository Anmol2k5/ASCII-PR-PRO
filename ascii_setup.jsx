/**
 * ASCII Effect Setup Script for After Effects - V3 (ULTRA COMPATIBLE)
 * 
 * INSTRUCTIONS:
 * 1. Open After Effects and a Composition.
 * 2. File > Script > Run Script File... > Select THIS file.
 */

(function() {
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem) || comp == null) {
        alert("CRITICAL: Please open and select a composition in the Project panel first.");
        return;
    }

    app.beginUndoGroup("Setup ASCII Effect V3");

    try {
        // 1. Create a Controller Null
        var ctrl = comp.layers.addNull(comp.duration);
        ctrl.name = "ASCII CONTROLLER";
        
        // Function to safely add sliders
        function addSlider(name, val) {
            var s = ctrl.Effects.addProperty("ADBE Slider Control");
            s.name = name;
            s("Slider").setValue(val);
            return s;
        }

        addSlider("Grid Density", 80);
        addSlider("Boost Contrast", 1.0);
        addSlider("ASCII Preset (1-5)", 1);

        // 2. Create the ASCII Text Layer
        var txtLayer = comp.layers.addText(" ");
        txtLayer.name = "ASCII Output";
        
        var textProp = txtLayer.property("Source Text");
        var textDocument = textProp.value;
        
        // Font logic
        var fonts = ["CascadiaCode-Bold", "Consolas", "Courier New"];
        for (var f = 0; f < fonts.length; f++) {
            try {
                textDocument.font = fonts[f];
                break;
            } catch(e) {}
        }
        
        textDocument.fontSize = 12;
        textDocument.justification = ParagraphJustification.CENTER_JUSTIFY;
        textProp.setValue(textDocument);

        // Source Text Expression
        textProp.expression = 
            "var d = thisComp.layer('ASCII CONTROLLER').effect('Grid Density')('Slider');\n" +
            "var aspect = thisComp.width / thisComp.height;\n" +
            "var cols = Math.max(1, Math.floor(d));\n" +
            "var rows = Math.max(1, Math.floor(d / aspect));\n" +
            "var s = '';\n" +
            "for (var i = 0; i < rows; i++) {\n" +
            "    s += ' '.repeat(cols) + (i < rows - 1 ? '\\r' : '');\n" +
            "}\n" +
            "s;";

        // 3. Add Character Offset Animator
        var animator = txtLayer.Text.Animators.addProperty("ADBE Text Animator");
        animator.name = "ASCII Mapper";
        
        var charOffset = animator.Properties.addProperty("ADBE Text Character Offset");
        charOffset.setValue(1);

        var selector = animator.Selectors.addProperty("ADBE Text Expressible Selector");
        selector.name = "Luminosity Selector";
        
        // Master Expression
        selector.property("Amount").expression = 
            "var ctrl = thisComp.layer('ASCII CONTROLLER');\n" +
            "var pIdx = Math.clamp(Math.floor(ctrl.effect('ASCII Preset (1-5)')('Slider')) - 1, 0, 4);\n" +
            "var sets = [\" .:-=+*#%@\", \" 0123456789\", \" .:oO8@\", \" -_=+*#\", \" .'`^\\\",:;Il!i><~+_-?][}{1)(|\\\\/tfjrxnuvczMW&8%B@$\"];\n" +
            "var charSet = sets[pIdx];\n" +
            "var contrast = ctrl.effect('Boost Contrast')('Slider');\n" +
            "var sourceLayer = thisComp.layer(index + 1);\n\n" +
            "var w = thisComp.width; var h = thisComp.height;\n" +
            "var cols = Math.floor(ctrl.effect('Grid Density')('Slider'));\n" +
            "var x = ((textIndex-1) % cols) * (w/cols) + (w/cols/2);\n" +
            "var y = Math.floor((textIndex-1) / cols) * (h/(cols/ (w/h))) + (h/(cols/(w/h))/2);\n\n" +
            "try {\n" +
            "  var sample = sourceLayer.sampleImage([x, y], [2, 2]);\n" +
            "  var lum = (sample[0] + sample[1] + sample[2]) / 3;\n" +
            "  if (contrast != 1) lum = Math.pow(lum, 1/contrast);\n" +
            "  var targetIdx = Math.floor(lum * (charSet.length - 1));\n" +
            "  targetIdx = Math.clamp(targetIdx, 0, charSet.length-1);\n" +
            "  charSet.charCodeAt(targetIdx) - 32;\n" +
            "} catch(e) { 0; }";

        txtLayer.moveBefore(ctrl);
        
        alert("ASCII Setup V3 SUCCESS!\n\n1. Place your footage layer directly BELOW 'ASCII Output'.\n2. Use 'ASCII CONTROLLER' to adjust result.");

    } catch (err) {
        alert("FATAL ERROR: " + err.message + " (Line: " + err.line + ")");
    }

    app.endUndoGroup();
})();
