/*
    ascii-toolkit.jsx
    Stage 1 dockable ScriptUI panel for Adobe After Effects.

    Install as a dockable panel:
    Save this file to:
    Windows: C:\Program Files\Adobe\Adobe After Effects 2024\Support Files\Scripts\ScriptUI Panels\ascii-toolkit.jsx
    macOS: /Applications/Adobe After Effects 2024/Scripts/ScriptUI Panels/ascii-toolkit.jsx

    Restart After Effects, then open:
    Window > ascii-toolkit.jsx

    This JSX panel is for workflow automation. It does not replace the native
    C++ ASCII renderer. The ASCII buttons can prepare controls, build a sample
    setup, and try to apply the native "ASCII Character" effect if installed.
*/

(function asciiToolkit(thisObj) {
    function showError(message) {
        alert("ascii-toolkit\n\n" + message);
    }

    function showInfo(message) {
        alert("ascii-toolkit\n\n" + message);
    }

    function getActiveComp() {
        var item = app.project.activeItem;
        if (item === null || !(item instanceof CompItem)) {
            showError("Please open or select a composition first.");
            return null;
        }
        return item;
    }

    function getSelectedLayers(comp) {
        if (comp === null) {
            return null;
        }
        if (comp.selectedLayers.length < 1) {
            showError("Please select at least one layer.");
            return null;
        }
        return comp.selectedLayers;
    }

    function frameDuration(comp) {
        return 1 / comp.frameRate;
    }

    function runOperation(name, operationFunction) {
        app.beginUndoGroup(name);
        try {
            operationFunction();
        } catch (err) {
            showError(name + " failed:\n" + err.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    function addSliderControl(layer, controlName, value) {
        var effects = layer.property("ADBE Effect Parade");
        var effect = effects.addProperty("ADBE Slider Control");
        effect.name = controlName;
        effect.property(1).setValue(value);
        return effect;
    }

    function addCheckboxControl(layer, controlName, value) {
        var effects = layer.property("ADBE Effect Parade");
        var effect = effects.addProperty("ADBE Checkbox Control");
        effect.name = controlName;
        effect.property(1).setValue(value);
        return effect;
    }

    function addColorControl(layer, controlName, colorValue) {
        var effects = layer.property("ADBE Effect Parade");
        var effect = effects.addProperty("ADBE Color Control");
        effect.name = controlName;
        effect.property(1).setValue(colorValue);
        return effect;
    }

    function tryAddEffect(layer, effectName) {
        var effects = layer.property("ADBE Effect Parade");
        try {
            return effects.addProperty(effectName);
        } catch (err) {
            return null;
        }
    }

    function createComp(name, width, height) {
        runOperation("Create " + name, function () {
            if (app.project === null) {
                app.newProject();
            }
            var comp = app.project.items.addComp(name, width, height, 1, 10, 30);
            comp.openInViewer();
        });
    }

    function create1080Comp() {
        createComp("ASCII Toolkit 1080p Comp", 1920, 1080);
    }

    function create4KComp() {
        createComp("ASCII Toolkit 4K Comp", 3840, 2160);
    }

    function addNullLayer() {
        runOperation("Add Null", function () {
            var comp = getActiveComp();
            if (comp === null) {
                return;
            }
            var layer = comp.layers.addNull();
            layer.name = "ASCII Toolkit Null";
            layer.property("Transform").property("Position").setValue([comp.width / 2, comp.height / 2]);
        });
    }

    function addAdjustmentLayer() {
        runOperation("Add Adjustment Layer", function () {
            var comp = getActiveComp();
            if (comp === null) {
                return;
            }
            var layer = comp.layers.addSolid([1, 1, 1], "ASCII Toolkit Adjustment", comp.width, comp.height, comp.pixelAspect, comp.duration);
            layer.adjustmentLayer = true;
            layer.property("Transform").property("Position").setValue([comp.width / 2, comp.height / 2]);
        });
    }

    function addSolidLayer() {
        runOperation("Add Solid", function () {
            var comp = getActiveComp();
            if (comp === null) {
                return;
            }
            var layer = comp.layers.addSolid([0.05, 0.05, 0.05], "ASCII Toolkit Solid", comp.width, comp.height, comp.pixelAspect, comp.duration);
            layer.property("Transform").property("Position").setValue([comp.width / 2, comp.height / 2]);
        });
    }

    function addTextLayer() {
        runOperation("Add Text", function () {
            var comp = getActiveComp();
            if (comp === null) {
                return;
            }
            var layer = comp.layers.addText("ASCII");
            var textProp = layer.property("Source Text");
            var textDocument = textProp.value;
            textDocument.fontSize = 96;
            textDocument.justification = ParagraphJustification.CENTER_JUSTIFY;
            textProp.setValue(textDocument);
            layer.property("Transform").property("Position").setValue([comp.width / 2, comp.height / 2]);
        });
    }

    function centerSelectedLayers() {
        runOperation("Center Selected Layers", function () {
            var comp = getActiveComp();
            var layers = getSelectedLayers(comp);
            var i;
            if (layers === null) {
                return;
            }
            for (i = 0; i < layers.length; i++) {
                layers[i].property("Transform").property("Position").setValue([comp.width / 2, comp.height / 2]);
            }
        });
    }

    function resetSelectedTransforms() {
        runOperation("Reset Selected Transforms", function () {
            var comp = getActiveComp();
            var layers = getSelectedLayers(comp);
            var i;
            if (layers === null) {
                return;
            }
            for (i = 0; i < layers.length; i++) {
                layers[i].property("Transform").property("Position").setValue([comp.width / 2, comp.height / 2]);
                layers[i].property("Transform").property("Scale").setValue([100, 100]);
                layers[i].property("Transform").property("Rotation").setValue(0);
                layers[i].property("Transform").property("Opacity").setValue(100);
            }
        });
    }

    function trimSelectedToWorkArea() {
        runOperation("Trim Selected To Work Area", function () {
            var comp = getActiveComp();
            var layers = getSelectedLayers(comp);
            var startTime;
            var endTime;
            var i;
            if (layers === null) {
                return;
            }
            startTime = comp.workAreaStart;
            endTime = comp.workAreaStart + comp.workAreaDuration;
            for (i = 0; i < layers.length; i++) {
                layers[i].inPoint = startTime;
                layers[i].outPoint = endTime;
            }
        });
    }

    function precomposeSelectedLayers() {
        runOperation("Precompose Selected Layers", function () {
            var comp = getActiveComp();
            var layers = getSelectedLayers(comp);
            var indices = [];
            var i;
            if (layers === null) {
                return;
            }
            for (i = 0; i < layers.length; i++) {
                indices.push(layers[i].index);
            }
            comp.layers.precompose(indices, "ASCII Toolkit Precomp", true);
        });
    }

    function sequenceSelectedLayers() {
        runOperation("Sequence Selected Layers", function () {
            var comp = getActiveComp();
            var layers = getSelectedLayers(comp);
            var currentTime;
            var i;
            if (layers === null) {
                return;
            }
            currentTime = comp.time;
            for (i = layers.length - 1; i >= 0; i--) {
                layers[i].startTime = currentTime;
                currentTime = currentTime + (layers[i].outPoint - layers[i].inPoint);
            }
        });
    }

    function staggerSelectedLayersFiveFrames() {
        runOperation("Stagger Selected Layers", function () {
            var comp = getActiveComp();
            var layers = getSelectedLayers(comp);
            var offset;
            var baseTime;
            var i;
            if (layers === null) {
                return;
            }
            offset = frameDuration(comp) * 5;
            baseTime = comp.time;
            for (i = 0; i < layers.length; i++) {
                layers[i].startTime = baseTime + (offset * i);
            }
        });
    }

    function shySelectedLayers() {
        runOperation("Shy Selected Layers", function () {
            var comp = getActiveComp();
            var layers = getSelectedLayers(comp);
            var i;
            if (layers === null) {
                return;
            }
            for (i = 0; i < layers.length; i++) {
                layers[i].shy = true;
            }
            comp.hideShyLayers = true;
        });
    }

    function unshyAllLayers() {
        runOperation("Unshy All Layers", function () {
            var comp = getActiveComp();
            var i;
            if (comp === null) {
                return;
            }
            for (i = 1; i <= comp.numLayers; i++) {
                comp.layer(i).shy = false;
            }
            comp.hideShyLayers = false;
        });
    }

    function removeEffectsFromSelectedLayers() {
        runOperation("Remove Effects", function () {
            var comp = getActiveComp();
            var layers = getSelectedLayers(comp);
            var i;
            var effects;
            if (layers === null) {
                return;
            }
            for (i = 0; i < layers.length; i++) {
                effects = layers[i].property("ADBE Effect Parade");
                while (effects !== null && effects.numProperties > 0) {
                    effects.property(1).remove();
                }
            }
        });
    }

    function addDaVinciInspiredAsciiControls() {
        runOperation("Add ASCII Controls", function () {
            var comp = getActiveComp();
            var layers = getSelectedLayers(comp);
            var i;
            if (layers === null) {
                return;
            }
            for (i = 0; i < layers.length; i++) {
                addSliderControl(layers[i], "ASCII Pixel Density", 90);
                addSliderControl(layers[i], "ASCII Boost Contrast", 100);
                addSliderControl(layers[i], "ASCII Gain", 100);
                addSliderControl(layers[i], "ASCII Lift", 0);
                addSliderControl(layers[i], "ASCII Gamma", 100);
                addCheckboxControl(layers[i], "ASCII Invert", 0);
                addColorControl(layers[i], "ASCII Foreground", [0.4, 1, 0.45]);
                addColorControl(layers[i], "ASCII Background", [0, 0, 0]);
            }
        });
    }

    function tryApplyNativeAsciiEffect() {
        runOperation("Apply Native ASCII Effect", function () {
            var comp = getActiveComp();
            var layers = getSelectedLayers(comp);
            var appliedCount = 0;
            var effect;
            var i;
            if (layers === null) {
                return;
            }
            for (i = 0; i < layers.length; i++) {
                effect = tryAddEffect(layers[i], "ASCII Character");
                if (effect === null) {
                    effect = tryAddEffect(layers[i], "com.codex.ascii-character");
                }
                if (effect !== null) {
                    appliedCount++;
                }
            }
            if (appliedCount === 0) {
                showInfo("The native ASCII Character effect was not found.\n\nBuild and install the .aex plugin first, then try this button again.");
            }
        });
    }

    function applyGreenTerminalLook() {
        runOperation("Apply Green Terminal Look", function () {
            var comp = getActiveComp();
            var layers = getSelectedLayers(comp);
            var i;
            var fillEffect;
            if (layers === null) {
                return;
            }
            for (i = 0; i < layers.length; i++) {
                fillEffect = tryAddEffect(layers[i], "ADBE Fill");
                if (fillEffect !== null) {
                    fillEffect.name = "ASCII Green Terminal";
                    fillEffect.property(1).setValue([0.2, 1, 0.25]);
                }
                addDaVinciNoteMarker(layers[i], "DaVinci-inspired terminal palette: green foreground on black background.");
            }
        });
    }

    function addDaVinciNoteMarker(layer, commentText) {
        var markerValue = new MarkerValue(commentText);
        layer.property("Marker").setValueAtTime(layer.containingComp.time, markerValue);
    }

    function createAsciiSampleComp() {
        runOperation("Create ASCII Sample Comp", function () {
            var comp;
            var background;
            var textLayer;
            var textProp;
            var textDocument;
            var controls;
            var ramp;
            var repeatedRamp;
            var i;
            if (app.project === null) {
                app.newProject();
            }
            comp = app.project.items.addComp("ascii-toolkit sample", 1920, 1080, 1, 10, 30);
            background = comp.layers.addSolid([0, 0, 0], "Black Background", comp.width, comp.height, comp.pixelAspect, comp.duration);
            background.moveToEnd();
            ramp = "@%#*+=-:. ";
            repeatedRamp = "";
            for (i = 0; i < 220; i++) {
                repeatedRamp = repeatedRamp + ramp;
                if (i % 11 === 10) {
                    repeatedRamp = repeatedRamp + "\r";
                }
            }
            textLayer = comp.layers.addText(repeatedRamp);
            textLayer.name = "ASCII Ramp Preview";
            textProp = textLayer.property("Source Text");
            textDocument = textProp.value;
            textDocument.fontSize = 22;
            textDocument.fillColor = [0.35, 1, 0.45];
            textDocument.justification = ParagraphJustification.LEFT_JUSTIFY;
            textProp.setValue(textDocument);
            textLayer.property("Transform").property("Position").setValue([90, 120]);
            controls = comp.layers.addNull();
            controls.name = "ASCII Controls";
            addSliderControl(controls, "Pixel Density", 90);
            addSliderControl(controls, "Boost Contrast", 100);
            addSliderControl(controls, "Gamma", 100);
            addCheckboxControl(controls, "Invert", 0);
            addColorControl(controls, "Foreground", [0.35, 1, 0.45]);
            addColorControl(controls, "Background", [0, 0, 0]);
            comp.openInViewer();
        });
    }

    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "ascii-toolkit", undefined, {resizeable: true});

        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 6;
        win.margins = 8;

        function addSection(title) {
            var panel = win.add("panel", undefined, title);
            panel.orientation = "column";
            panel.alignChildren = ["fill", "top"];
            panel.spacing = 4;
            panel.margins = 8;
            return panel;
        }

        function addButton(parent, label, helpText, clickFunction) {
            var button = parent.add("button", undefined, label);
            button.helpTip = helpText;
            button.onClick = clickFunction;
            return button;
        }

        function addButtonRow(parent) {
            var row = parent.add("group");
            row.orientation = "row";
            row.alignChildren = ["fill", "center"];
            row.spacing = 4;
            return row;
        }

        var asciiPanel = addSection("ASCII");
        var asciiRow1 = addButtonRow(asciiPanel);
        addButton(asciiRow1, "Controls", "Add DaVinci-inspired ASCII controls to selected layers.", addDaVinciInspiredAsciiControls);
        addButton(asciiRow1, "Native FX", "Try to apply the native ASCII Character .aex effect.", tryApplyNativeAsciiEffect);
        var asciiRow2 = addButtonRow(asciiPanel);
        addButton(asciiRow2, "Terminal", "Apply a simple green terminal look to selected layers.", applyGreenTerminalLook);
        addButton(asciiRow2, "Sample", "Create a simple ASCII starter composition.", createAsciiSampleComp);

        var compPanel = addSection("Comp");
        var compRow = addButtonRow(compPanel);
        addButton(compRow, "1080", "Create a 1920x1080 composition.", create1080Comp);
        addButton(compRow, "4K", "Create a 3840x2160 composition.", create4KComp);

        var createPanel = addSection("Create");
        var createRow1 = addButtonRow(createPanel);
        addButton(createRow1, "Null", "Add a centered null layer.", addNullLayer);
        addButton(createRow1, "Adjust", "Add a comp-sized adjustment layer.", addAdjustmentLayer);
        var createRow2 = addButtonRow(createPanel);
        addButton(createRow2, "Solid", "Add a comp-sized dark solid.", addSolidLayer);
        addButton(createRow2, "Text", "Add centered text.", addTextLayer);

        var layerPanel = addSection("Layer");
        var layerRow1 = addButtonRow(layerPanel);
        addButton(layerRow1, "Center", "Move selected layers to comp center.", centerSelectedLayers);
        addButton(layerRow1, "Reset", "Reset selected layer transforms.", resetSelectedTransforms);
        var layerRow2 = addButtonRow(layerPanel);
        addButton(layerRow2, "Trim", "Trim selected layers to the work area.", trimSelectedToWorkArea);
        addButton(layerRow2, "Precomp", "Precompose selected layers.", precomposeSelectedLayers);

        var timingPanel = addSection("Timing");
        var timingRow = addButtonRow(timingPanel);
        addButton(timingRow, "Sequence", "Place selected layers one after another.", sequenceSelectedLayers);
        addButton(timingRow, "+5 Frames", "Stagger selected layers by five frames.", staggerSelectedLayersFiveFrames);

        var utilityPanel = addSection("Utility");
        var utilityRow1 = addButtonRow(utilityPanel);
        addButton(utilityRow1, "Shy", "Shy selected layers and hide shy layers.", shySelectedLayers);
        addButton(utilityRow1, "Unshy", "Unshy all layers in the active comp.", unshyAllLayers);
        var utilityRow2 = addButtonRow(utilityPanel);
        addButton(utilityRow2, "No FX", "Remove all effects from selected layers.", removeEffectsFromSelectedLayers);

        win.onResizing = win.onResize = function () {
            this.layout.resize();
        };

        win.layout.layout(true);
        return win;
    }

    var panel = buildUI(thisObj);
    if (panel instanceof Window) {
        panel.center();
        panel.show();
    }
})(this);
