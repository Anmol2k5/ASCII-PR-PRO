/**
 * ASCII PRO v1.0 - After Effects ScriptUI Plugin
 * 
 * TO INSTALL: 
 * Copy to: Scripts/ScriptUI Panels/
 * Or run via: File > Script > Run Script File...
 */

(function(thisObj) {
    function buildUI(container) {
        var win = (container instanceof Panel) ? container : new Window("palette", "ASCII PRO v1.0", undefined, {resizeable: true});
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
        createBtn.graphics.backgroundColor = createBtn.graphics.newBrush(createBtn.graphics.BrushType.SOLID_COLOR, [0.2, 0.4, 0.8, 1]);

        createBtn.onClick = function() {
            var comp = app.project.activeItem;
            if (!(comp instanceof CompItem)) { alert("Please select a composition."); return; }
            
            app.beginUndoGroup("Generate ASCII PRO");
            try {
                generateEffect(comp, Math.floor(denSlider.value), charDropdown.selection.index);
            } catch(e) { alert("Error: " + e.message); }
            app.endUndoGroup();
        };

        win.layout.layout(true);
        return win;
    }

    function generateEffect(comp, density, setIdx) {
        // 1. Controller
        var ctrl = comp.layers.addNull();
        ctrl.name = "ASCII PRO CONTROLLER";
        ctrl.label = 13; // Greenish

        function addSlug(name, val) {
            var s = ctrl.Effects.addProperty("ADBE Slider Control");
            s.name = name; s(1).setValue(val);
            return s;
        }

        addSlug("Grid Density", density);
        addSlug("Contrast", 1.0);
        var pSlider = addSlug("Preset (1-5)", setIdx + 1);

        // 2. Text Layer
        var txtLayer = comp.layers.addText(" ");
        txtLayer.name = "ASCII OUTPUT";
        
        var textProp = txtLayer.property("Source Text");
        var textDoc = textProp.value;
        textDoc.font = "Courier"; // Safe default
        textDoc.fontSize = 12;
        textDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
        textProp.setValue(textDoc);

        // Source Text Expression (fills with spaces)
        textProp.expression = 
            "var d = thisComp.layer('"+ctrl.name+"').effect('Grid Density')('Slider');\n" +
            "var aspect = thisComp.width / thisComp.height;\n" +
            "var cols = Math.max(1, Math.floor(d));\n" +
            "var rows = Math.max(1, Math.floor(d / aspect));\n" +
            "''.repeat(cols*rows).replace(/(.{' + cols + '})/g, '$1\\r');";

        // 3. Animator
        var animator = txtLayer.Text.Animators.addProperty("ADBE Text Animator");
        animator.name = "ASCII Engine";
        
        // Use a large offset range (255) to allow mapping any character
        var offset = animator.Properties.addProperty("ADBE Text Character Offset");
        offset.setValue(255);

        // Add Expression Selector
        var selector = animator.Selectors.addProperty("ADBE Text Expressible Selector");
        selector.name = "Luminosity Sampler";
        
        // Mapping Expression
        selector.property("Amount").expression = 
            "var ctrl = thisComp.layer('"+ctrl.name+"');\n" +
            "var sets = [\" .:-=+*#%@\", \" 0123456789\", \" .:oO8@\", \" -_=+*#\", \" .'`^\\\",:;Il!i><~+_-?][}{1)(|\\\\/tfjrxnuvczMW&8%B@$\"];\n" +
            "var pIdx = Math.clamp(Math.floor(ctrl.effect('Preset (1-5)')('Slider'))-1, 0, 4);\n" +
            "var charSet = sets[pIdx];\n" +
            "var contrast = ctrl.effect('Contrast')('Slider');\n" +
            "var sourceLayer = thisComp.layer(index + 1);\n\n" +
            "// Coord Mapping - Pixel Perfect\n" +
            "var w = thisComp.width; var h = thisComp.height;\n" +
            "var cols = Math.floor(ctrl.effect('Grid Density')('Slider'));\n" +
            "var charW = w / cols;\n" +
            "var charH = charW; // Square grid\n" +
            "var idx = textIndex - 1;\n" +
            "var x = (idx % cols) * charW + (charW/2);\n" +
            "var y = Math.floor(idx / cols) * charH + (charH/2);\n\n" +
            "try {\n" +
            "  var sample = sourceLayer.sampleImage([x, y], [2, 2]);\n" +
            "  var lum = (sample[0] + sample[1] + sample[2]) / 3;\n" +
            "  if (contrast != 1) lum = Math.pow(lum, 1/contrast);\n\n" +
            "  var targetIdx = Math.floor(lum * (charSet.length - 1));\n" +
            "  var targetCode = charSet.charCodeAt(targetIdx);\n" +
            "  var baseCode = 32; // Source is spaces (code 32)\n" +
            "  \n" +
            "  // Return as percentage of the Property Value (255)\n" +
            "  var diff = targetCode - baseCode;\n" +
            "  (diff / 255) * 100;\n" +
            "} catch(e) { 0; }";

        txtLayer.moveBefore(ctrl);
        alert("ASCII PRO GENERATED!\n\nMove your image layer directly below 'ASCII OUTPUT'.");
    }

    var myPanel = buildUI(thisObj);
    if (myPanel instanceof Window) { myPanel.center(); myPanel.show(); }
})(this);
