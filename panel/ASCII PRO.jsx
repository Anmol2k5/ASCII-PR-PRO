// ASCII PRO - After Effects ScriptUI Helper Panel
// Match Name: com.anmolsaini.ascii-character

(function(thisObj) {
    // Parameter Indices (1-based, matching C++ ParamId excluding INPUT)
    var P_DENSITY = 1;
    var P_ASPECT = 2;
    var P_SCALE = 3;
    var P_SPACING_X = 4;
    var P_SPACING_Y = 5;
    var P_BLEND = 6;
    var P_PRESERVE_ALPHA = 7;
    var P_INVERT_LUM = 8;
    var P_CONTRAST = 9;
    var P_BRIGHTNESS = 10;
    var P_GAMMA = 11;
    var P_THRESHOLD = 12;
    var P_POSTERIZE = 13;
    var P_CHAR_SET = 14;
    var P_CHAR_ORDER = 15;
    var P_COLOR_MODE = 16;
    var P_FG = 17;
    var P_BG = 18;
    var P_GSTART = 19;
    var P_GEND = 20;
    var P_HUE_SHIFT = 21;
    var P_SATURATION = 22;
    var P_H_ALIGN = 23;
    var P_V_ALIGN = 24;
    var P_OFFSET_X = 25;
    var P_OFFSET_Y = 26;
    var P_ROTATION = 27;
    var P_QUALITY = 28;
    var P_ANTIALIAS = 29;
    var P_NTH_CELL = 30;

    function buildUI(thisObj) {
        var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "ASCII PRO Helper", undefined, {resizeable: true});
        
        myPanel.orientation = "column";
        myPanel.alignChildren = ["fill", "top"];
        myPanel.spacing = 10;
        myPanel.margins = 15;

        // --- Status Panel ---
        var statusGrp = myPanel.add("group");
        statusGrp.orientation = "horizontal";
        statusGrp.alignChildren = ["left", "center"];
        
        var statusLbl = statusGrp.add("statictext", undefined, "Plugin Status: ");
        var statusVal = statusGrp.add("statictext", undefined, "Checking...");
        statusVal.graphics.foregroundColor = statusVal.graphics.newPen(statusVal.graphics.PenType.SOLID_COLOR, [0.8, 0.8, 0.8], 1);

        // --- Actions Section ---
        var actionTitle = myPanel.add("statictext", undefined, "ACTIONS");
        actionTitle.graphics.font = ScriptUI.newFont(actionTitle.graphics.font.name, "BOLD", 10);
        
        var applyBtn = myPanel.add("button", undefined, "Apply ASCII Character");
        applyBtn.onClick = function() {
            var activeComp = app.project.activeItem;
            if (activeComp && activeComp instanceof CompItem) {
                app.beginUndoGroup("Apply ASCII Character");
                var layers = activeComp.selectedLayers;
                if (layers.length === 0) {
                    alert("Please select at least one layer.");
                    app.endUndoGroup();
                    return;
                }
                for (var i = 0; i < layers.length; i++) {
                    var effect = layers[i].property("Effects").addProperty("com.anmolsaini.ascii-character");
                    if (effect) {
                        effect.name = "ASCII Character";
                    }
                }
                app.endUndoGroup();
            } else {
                alert("Please open a composition.");
            }
        };

        var resetBtn = myPanel.add("button", undefined, "Reset to Defaults");
        resetBtn.onClick = function() {
            var activeComp = app.project.activeItem;
            if (activeComp) {
                app.beginUndoGroup("Reset ASCII Character");
                var layers = activeComp.selectedLayers;
                for (var i = 0; i < layers.length; i++) {
                    var effects = layers[i].property("Effects");
                    for (var j = 1; j <= effects.numProperties; j++) {
                        var eff = effects.property(j);
                        if (eff.matchName === "com.anmolsaini.ascii-character") {
                            eff.property(P_DENSITY).setValue(90);
                            eff.property(P_ASPECT).setValue(55);
                            eff.property(P_SCALE).setValue(92);
                            eff.property(P_SPACING_X).setValue(100);
                            eff.property(P_SPACING_Y).setValue(100);
                            eff.property(P_BLEND).setValue(0);
                            eff.property(P_PRESERVE_ALPHA).setValue(true);
                            eff.property(P_INVERT_LUM).setValue(false);
                            eff.property(P_CONTRAST).setValue(100);
                            eff.property(P_BRIGHTNESS).setValue(0);
                            eff.property(P_GAMMA).setValue(100);
                            eff.property(P_THRESHOLD).setValue(0);
                            eff.property(P_POSTERIZE).setValue(0);
                            eff.property(P_CHAR_SET).setValue(1); // Classic
                            eff.property(P_CHAR_ORDER).setValue(1); // Dark to Light
                            eff.property(P_COLOR_MODE).setValue(2); // Monochrome
                            eff.property(P_FG).setValue([1.0, 1.0, 1.0]);
                            eff.property(P_BG).setValue([0.0, 0.0, 0.0]);
                            eff.property(P_HUE_SHIFT).setValue(0);
                            eff.property(P_SATURATION).setValue(100);
                            eff.property(P_H_ALIGN).setValue(2); // Center
                            eff.property(P_V_ALIGN).setValue(2); // Center
                            eff.property(P_OFFSET_X).setValue(0);
                            eff.property(P_OFFSET_Y).setValue(0);
                            eff.property(P_ROTATION).setValue(0);
                            eff.property(P_QUALITY).setValue(2); // Normal
                            eff.property(P_ANTIALIAS).setValue(true);
                            eff.property(P_NTH_CELL).setValue(1);
                        }
                    }
                }
                app.endUndoGroup();
            }
        };

        // --- Presets Section ---
        var presetTitle = myPanel.add("statictext", undefined, "STYLE PRESETS");
        presetTitle.graphics.font = ScriptUI.newFont(presetTitle.graphics.font.name, "BOLD", 10);

        var matrixBtn = myPanel.add("button", undefined, "Matrix Digital Rain");
        matrixBtn.onClick = function() {
            applyPresetConfig(function(eff) {
                eff.property(P_DENSITY).setValue(10);
                eff.property(P_ASPECT).setValue(130);
                eff.property(P_SCALE).setValue(120);
                eff.property(P_CHAR_SET).setValue(3); // Minimal
                eff.property(P_COLOR_MODE).setValue(1); // Original Source
                eff.property(P_FG).setValue([0.0, 1.0, 0.4]);
                eff.property(P_BG).setValue([0.0, 0.0, 0.0]);
                eff.property(P_CONTRAST).setValue(150);
                eff.property(P_BRIGHTNESS).setValue(10);
                eff.property(P_GAMMA).setValue(120);
            });
        };

        var retroBtn = myPanel.add("button", undefined, "Retro Terminal");
        retroBtn.onClick = function() {
            applyPresetConfig(function(eff) {
                eff.property(P_DENSITY).setValue(8);
                eff.property(P_ASPECT).setValue(90);
                eff.property(P_SCALE).setValue(100);
                eff.property(P_CHAR_SET).setValue(1); // Classic
                eff.property(P_COLOR_MODE).setValue(5); // Custom Foreground/Background
                eff.property(P_FG).setValue([0.2, 1.0, 0.2]);
                eff.property(P_BG).setValue([0.02, 0.04, 0.02]);
                eff.property(P_CONTRAST).setValue(100);
                eff.property(P_BRIGHTNESS).setValue(0);
                eff.property(P_GAMMA).setValue(100);
            });
        };

        var anaglyphBtn = myPanel.add("button", undefined, "Anaglyph ASCII");
        anaglyphBtn.onClick = function() {
            applyPresetConfig(function(eff) {
                eff.property(P_DENSITY).setValue(16);
                eff.property(P_ASPECT).setValue(100);
                eff.property(P_SCALE).setValue(90);
                eff.property(P_CHAR_SET).setValue(4); // Blocks
                eff.property(P_COLOR_MODE).setValue(3); // Two Tone
                eff.property(P_FG).setValue([1.0, 0.0, 0.33]);
                eff.property(P_BG).setValue([0.0, 1.0, 1.0]);
                eff.property(P_CONTRAST).setValue(120);
                eff.property(P_BRIGHTNESS).setValue(-10);
                eff.property(P_GAMMA).setValue(80);
                eff.property(P_ROTATION).setValue(15);
                eff.property(P_QUALITY).setValue(1); // Draft
            });
        };

        // --- Demo Section ---
        var demoTitle = myPanel.add("statictext", undefined, "UTILITIES");
        demoTitle.graphics.font = ScriptUI.newFont(demoTitle.graphics.font.name, "BOLD", 10);

        var demoBtn = myPanel.add("button", undefined, "Create Demo Composition");
        demoBtn.onClick = function() {
            app.beginUndoGroup("Create ASCII Demo Comp");
            var comp = app.project.items.addComp("ASCII PR PRO Demo", 1920, 1080, 1.0, 10.0, 24);
            if (comp) {
                var bgSolid = comp.layers.addSolid([0.1, 0.1, 0.15], "Background", 1920, 1080, 1.0);
                var textLayer = comp.layers.addText("ASCII");
                textLayer.property("Position").setValue([960, 540]);
                
                var eff = textLayer.property("Effects").addProperty("com.anmolsaini.ascii-character");
                if (eff) {
                    eff.name = "ASCII Character";
                    eff.property(P_DENSITY).setValue(12);
                    eff.property(P_COLOR_MODE).setValue(5); // Custom Fg/Bg
                    eff.property(P_FG).setValue([0.0, 1.0, 0.8]);
                    eff.property(P_BG).setValue([0.05, 0.05, 0.08]);
                }
                comp.openInViewer();
            }
            app.endUndoGroup();
        };

        var helpBtn = myPanel.add("button", undefined, "Help & Docs");
        helpBtn.onClick = function() {
            alert("ASCII PR PRO v1.0.0\n\nApply the ASCII Character effect to any layer, then load one of our optimized styles to get started. Adjust Pixel Density and Spacing to control text grids.");
        };

        // --- Check Installation ---
        function checkInstallation() {
            var activeComp = app.project.activeItem;
            var isInstalled = false;
            var tempSolid = null;
            if (activeComp && activeComp instanceof CompItem) {
                try {
                    tempSolid = activeComp.layers.addSolid([0,0,0], "TempCheck", 4, 4, 1);
                    var eff = tempSolid.property("Effects").addProperty("com.anmolsaini.ascii-character");
                    if (eff) {
                        isInstalled = true;
                        eff.remove();
                    }
                    tempSolid.remove();
                } catch(e) {
                    isInstalled = false;
                    if (tempSolid) tempSolid.remove();
                }
            } else {
                // Fallback: check if we can add to comp by creating a hidden comp
                try {
                    var tempComp = app.project.items.addComp("TempCheckComp", 4, 4, 1.0, 1.0, 24);
                    tempSolid = tempComp.layers.addSolid([0,0,0], "TempCheck", 4, 4, 1);
                    var eff2 = tempSolid.property("Effects").addProperty("com.anmolsaini.ascii-character");
                    if (eff2) {
                        isInstalled = true;
                    }
                    tempComp.remove();
                } catch(e) {
                    isInstalled = false;
                }
            }

            if (isInstalled) {
                statusVal.text = "Installed & Active";
                statusVal.graphics.foregroundColor = statusVal.graphics.newPen(statusVal.graphics.PenType.SOLID_COLOR, [0.0, 0.9, 0.5], 1);
            } else {
                statusVal.text = "Not Found";
                statusVal.graphics.foregroundColor = statusVal.graphics.newPen(statusVal.graphics.PenType.SOLID_COLOR, [1.0, 0.2, 0.3], 1);
            }
        }

        function applyPresetConfig(presetFn) {
            var activeComp = app.project.activeItem;
            if (!activeComp) {
                alert("Please select a composition.");
                return;
            }
            var layers = activeComp.selectedLayers;
            if (layers.length === 0) {
                alert("Please select at least one layer with the ASCII Character effect applied.");
                return;
            }

            app.beginUndoGroup("Apply ASCII Style Preset");
            for (var i = 0; i < layers.length; i++) {
                var effects = layers[i].property("Effects");
                var eff = null;
                for (var j = 1; j <= effects.numProperties; j++) {
                    if (effects.property(j).matchName === "com.anmolsaini.ascii-character") {
                        eff = effects.property(j);
                        break;
                    }
                }
                
                // If effect not present, add it
                if (!eff) {
                    eff = effects.addProperty("com.anmolsaini.ascii-character");
                    if (eff) eff.name = "ASCII Character";
                }

                if (eff) {
                    presetFn(eff);
                }
            }
            app.endUndoGroup();
        }

        // Run check initially
        checkInstallation();

        myPanel.layout.layout(true);
        return myPanel;
    }

    var win = buildUI(thisObj);
    if (win instanceof Window) {
        win.center();
        win.show();
    }
})(this);
