/**
 * ASCII PRO v1.3 - After Effects ScriptUI Plugin
 * 
 * TO INSTALL: 
 * Copy to: Scripts/ScriptUI Panels/
 * Or run via: File > Script > Run Script File...
 */

(function(thisObj) {
    function buildUI(container) {
        var win = (container instanceof Panel) ? container : new Window("palette", "ASCII PRO v1.3", undefined, {resizeable: true});
        win.orientation = "column"; win.spacing = 10; win.margins = 16; win.alignChildren = ["fill", "top"];

        // Banner
        var banner = win.add("statictext", undefined, "ASCII PRO EFFECT", {justification: "center"});
        banner.graphics.font = ScriptUI.newFont("Verdana", "BOLD", 16);

        // Settings
        var settingsPanel = win.add("panel", undefined, "Generator Settings");
        settingsPanel.orientation = "column"; settingsPanel.spacing = 8; settingsPanel.margins = 12;

        var setGroup = settingsPanel.add("group");
        setGroup.add("statictext", undefined, "Char Set:");
        var charDropdown = setGroup.add("dropdownlist", undefined, ["Standard", "Numbers", "Minimal", "Binary", "Matrix"]);
        charDropdown.selection = 0; charDropdown.alignment = ["fill", "center"];

        var denGroup = settingsPanel.add("group");
        denGroup.add("statictext", undefined, "Density:");
        var denSlider = denGroup.add("slider", undefined, 80, 20, 250);
        var denVal = denGroup.add("statictext", undefined, "80");
        denVal.characters = 3;
        denSlider.onChanging = function() { denVal.text = Math.floor(denSlider.value); };

        var createBtn = win.add("button", undefined, "GENERATE ASCII EFFECT");

        createBtn.onClick = function() {
            var comp = app.project.activeItem;
            if (!(comp instanceof CompItem)) { alert("Please select a composition."); return; }
            
            app.beginUndoGroup("Generate ASCII PRO V1.3");
            try {
                // Find selected layer to use as source
                var sourceLayer = (comp.selectedLayers.length > 0) ? comp.selectedLayers[0] : null;
                generateEffect(comp, Math.floor(denSlider.value), charDropdown.selection.index, sourceLayer);
            } catch(e) { alert("Error: " + e.message + " (line " + e.line + ")"); }
            app.endUndoGroup();
        };

        win.layout.layout(true);
        return win;
    }

    function generateEffect(comp, density, setIdx, sourceLayer) {
        // 1. Controller
        var ctrl = comp.layers.addNull();
        ctrl.name = "ASCII PRO CONTROLLER";
        ctrl.label = 13;

        function addSlug(name, val) {
            var s = ctrl.Effects.addProperty("ADBE Slider Control");
            s.name = name; s(1).setValue(val);
            return s;
        }

        addSlug("Grid Density", density);
        addSlug("Contrast", 1.0);
        addSlug("Preset (1-5)", setIdx + 1);

        // 2. Text Layer
        var txtLayer = comp.layers.addText(" ");
        txtLayer.name = "ASCII OUTPUT";
        
        var textProp = txtLayer.property("Source Text");
        var textDoc = textProp.value;
        textDoc.font = "Courier";
        textDoc.fontSize = 12;
        textDoc.autoLeading = true;
        textDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
        textProp.setValue(textDoc);

        // Reset Scale and Blending for safety
        txtLayer.property("Scale").setValue([100, 100]);
        if (txtLayer.Text.Property.MoreOptions) {
            txtLayer.Text.Property.MoreOptions.property("Inter-character Blending").setValue(1); // 1 = Normal
        }

        var sourceName = sourceLayer ? sourceLayer.name : "Footage Name Here";

        // Source Text Expression
        textProp.expression = 
            "var d = thisComp.layer('"+ctrl.name+"').effect('Grid Density')('Slider');\n" +
            "var aspect = thisComp.width / thisComp.height;\n" +
            "var cols = Math.max(1, Math.floor(d));\n" +
            "var rows = Math.max(1, Math.floor(d / aspect));\n" +
            "var total = Math.min(cols * rows, 30000);\n" +
            "var s = ' '.repeat(total);\n" +
            "s.replace(new RegExp('(.{' + cols + '})', 'g'), '$1\\r');";

        // 3. Animator
        var animator = txtLayer.Text.Animators.addProperty("ADBE Text Animator");
        animator.name = "ASCII Engine";
        var offset = animator.Properties.addProperty("ADBE Text Character Offset");
        offset.setValue(255);

        var selector = animator.Selectors.addProperty("ADBE Text Expressible Selector");
        selector.name = "Luminosity Sampler";
        
        // Final Mapping Expression - Smart Source Detection
        selector.property("Amount").expression = 
            "var ctrl = thisComp.layer('"+ctrl.name+"');\n" +
            "var sets = [\" .:-=+*#%@\", \" 0123456789\", \" .:oO8@\", \" -_=+*#\", \" .'`^\\\",:;Il!i><~+_-?][}{1)(|\\\\/tfjrxnuvczMW&8%B@$\"];\n" +
            "var pIdx = Math.clamp(Math.floor(ctrl.effect('Preset (1-5)')('Slider'))-1, 0, 4);\n" +
            "var charSet = sets[pIdx];\n" +
            "var contrast = ctrl.effect('Contrast')('Slider');\n\n" +
            "// TRY TO FIND FOOTAGE\n" +
            "var sourceLayer;\n" +
            "try { sourceLayer = thisComp.layer('"+sourceName+"'); } catch(e) { sourceLayer = thisComp.layer(index + 1); }\n" +
            "if (sourceLayer.name == ctrl.name) sourceLayer = thisComp.layer(index + 2);\n" +
            "if (!sourceLayer || !sourceLayer.active) value;\n\n" +
            "// Coord Mapping\n" +
            "var w = thisComp.width; var h = thisComp.height;\n" +
            "var cols = Math.max(1, Math.floor(ctrl.effect('Grid Density')('Slider')));\n" +
            "var charW = w / cols;\n" +
            "var idx = textIndex - 1;\n" +
            "var x = (idx % cols) * charW + (charW/2);\n" +
            "var y = Math.floor(idx / cols) * charW + (charW/2);\n\n" +
            "try {\n" +
            "  var s = sourceLayer.sampleImage([x, y], [1, 1]);\n" +
            "  var lum = (s[0] + s[1] + s[2]) / 3;\n" +
            "  if (contrast != 1) lum = Math.pow(Math.clamp(lum, 0.001, 1), 1/contrast);\n\n" +
            "  var targetIdx = Math.floor(lum * (charSet.length - 1));\n" +
            "  var targetCode = charSet.charCodeAt(Math.clamp(targetIdx, 0, charSet.length-1));\n" +
            "  ((targetCode - 32) / 255) * 100;\n" +
            "} catch(e) { 0; }";

        txtLayer.moveBefore(ctrl);
        if (sourceLayer) txtLayer.moveBefore(sourceLayer);

        alert("ASCII PRO V1.3 SUCCESS!\n\n1. Target Layer Linked: " + sourceName + "\n2. Adjust settings on 'ASCII PRO CONTROLLER'.");
    }

    var myPanel = buildUI(thisObj);
    if (myPanel instanceof Window) { myPanel.center(); myPanel.show(); }
})(this);
