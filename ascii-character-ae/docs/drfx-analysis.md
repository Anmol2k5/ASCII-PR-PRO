# DRFX Analysis

Source package inspected:

`D:\PREMEIR PRO PLUGIN- ASCII\ASCII Character.drfx`

The `.drfx` package is a zip-style DaVinci Resolve effect bundle. It contains
Fusion macro settings and PNG thumbnails, not compiled binaries.

## Extracted File Tree

```text
Edit/Effects/ASCII/fx_ASCII_CustomFP.png
Edit/Effects/ASCII/fx_ASCII_CustomFP.setting
Edit/Effects/ASCII/fx_ASCII_Letters.png
Edit/Effects/ASCII/fx_ASCII_Letters.setting
```

## ASCII Letters Exposed Controls

The main macro is `fx_ASCII_Letters`, a `GroupOperator`.

Image / pixel processing:

| Control | Source node/input | Default | Notes |
| --- | --- | ---: | --- |
| Pixel Levels | label group | 1 | UI section label |
| PixelFrequency | `MosaicBlur2_1.PixelFrequency` | 150 | Mosaic cell density |
| Boost Contrast | `BrightnessContrast_1.Contrast` | 1 | Range shown 0-2 |
| Gain | `BrightnessContrast_1.Gain` | 1 | Image gain |
| Lift | `BrightnessContrast_1.Lift` | 0 | Image lift |
| Gamma | `BrightnessContrast_1.Gamma` | 1 | Image gamma |
| Invert | `InvertColor1_1.Blend` | 1 | Exposed as checkbox |

ASCII controls:

| Control | Source node/input | Default | Notes |
| --- | --- | ---: | --- |
| ASCII Letters | label group | 1 | UI section label |
| ASCII Preset | `Switch1.Source` | 4 | SwitchText preset selector |
| Custom (9 Letters) | `Switch1.Input0` | n/a | Custom text source |

`Switch1` preset names found in the macro:

```text
Custom
Symbols
Alphabet
Alphabet Caps
Number
Pattern
Round
Orthogonal
Diagonal
Detailed
Sh4rks Linear
```

Typography / layout:

| Control | Source node/input | Default |
| --- | --- | ---: |
| Font | `T8.Font` | Open Sans internally |
| Style | `T8.Style` | Bold internally |
| Font Size | `T8.Size` | 1.5 |
| X | `T8.WordSizeX` | 1 |
| Y | `T8.WordSizeY` | 1 |
| Vertical alignment | `T8.VerticalTopCenterBottom` | 0 |
| Horizontal alignment | `T8.HorizontalLeftCenterRight` | n/a |

Colour controls:

| Control | Source node/input | Default | Notes |
| --- | --- | ---: | --- |
| Color Pallette | label group | 1 | Original spelling retained by macro |
| Color Pallette | `Switch1_1_1.Source` | 0 | SwitchGradient selector |
| Custom palette input | `Switch1_1_1.Input0` | n/a | User gradient |
| WheelHue1 | `ColorCorrector1_1.WheelHue1` | n/a | Final correction |
| WheelSaturation1 | `ColorCorrector1_1.WheelSaturation1` | 1 | Final correction |
| WheelTintAngle1 | `ColorCorrector1_1.WheelTintAngle1` | n/a | Final correction |
| WheelTintLength1 | `ColorCorrector1_1.WheelTintLength1` | n/a | Final correction |
| Hue | `ColorCorrector1_1.Hue1` | n/a | Final hue |
| Saturation | `ColorCorrector1_1.Saturation1` | 1 | Final saturation |

Color palette names found in `Switch1_1_1`:

```text
Custom
Monochrome
Candy
Warm Lavender
Atlantis
Fire Ocean
Fresh Violet
Pink Sky
Retro Glow
Dracula
Polar Express
Summer Memories
Matrix
Coast
Mountain
Olive
Warm
Dream
```

## ASCII CustomFP Exposed Controls

`fx_ASCII_CustomFP` is a related `GroupOperator` with five macro inputs:
the main source plus `Input1`, `Input2`, `Input3`, and `Input4`. It appears
to use external/custom foreground picture inputs rather than built text glyphs.

Controls found:

| Control | Source node/input | Default |
| --- | --- | ---: |
| Pixel Levels | label group | 1 |
| PixelFrequency | `MosaicBlur2.PixelFrequency` | 150 |
| Boost Contrast | `BrightnessContrast.Contrast` | 1 |
| Gain | `BrightnessContrast.Gain` | 1 |
| Lift | `BrightnessContrast.Lift` | 0 |
| Gamma | `BrightnessContrast.Gamma` | 1 |
| Invert | `InvertColor1.Blend` | 1 |
| Color Pallette | `Switch1.Source` | 0 |
| Custom palette input | `Switch1.Input0` | n/a |
| Final Hue | `ColorCorrector1.Hue1` | n/a |
| Final Saturation | `ColorCorrector1.Saturation1` | 1 |

`ASCII CustomFP` is deferred. The native AE MVP focuses on `ASCII Letters`.

## Likely Visual Pipeline

The `ASCII Letters` macro uses this pipeline:

1. Input is routed into `MosaicBlur2_1`.
2. `BrightnessContrast_1` applies contrast, gain, lift, and gamma.
3. `InvertColor1_1` optionally inverts RGB while leaving alpha uninverted.
4. A gradient/image analysis chain drives multiple `TextPlus` layers.
5. Each `TextPlus` layer displays one character from `ASCIISet` using
   expressions like `string.sub(ASCIISet.Value, 1, 1)` through
   `string.sub(ASCIISet.Value, 9, 9)`.
6. The text layers are merged.
7. `SwitchText` chooses an ASCII preset.
8. `SwitchGradient` chooses a color palette.
9. `ColorCorrector1_1` applies final hue/saturation/tint correction.

## Brightness To Character Mapping

The Fusion macro does not contain a conventional loop. Instead, it builds a
stack of text layers where each layer represents one brightness band. The nine
`TextPlus` instances extract characters 1 through 9 from `ASCIISet`. Mosaic and
gradient/merge operations create banded image regions, so darker/lighter regions
reveal different character layers.

The AE plugin recreates this directly in C++:

1. Divide the frame into cells.
2. Average luminance per cell.
3. Apply contrast, brightness, gamma, threshold, posterize, and invert controls.
4. Map the adjusted luminance to an index in the selected character ramp.
5. Draw that character into the cell every frame.

## Exact Versus Approximate Recreation

Can be recreated closely:

- Pixel-level mosaic density behavior.
- Contrast/gain/lift/gamma style preprocessing.
- Invert luminance.
- Brightness-to-character mapping.
- Original/custom ASCII ramps.
- Color mode selection and final color correction concept.
- Frame-by-frame deterministic rendering.

Requires approximation or product redesign:

- Fusion `TextPlus` rendering and font metrics.
- Fusion gradient interpolation details.
- Proprietary preset ramps and palette values.
- Multi-input `ASCII CustomFP` behavior.
- DaVinci-specific label/buttons and creator links.

## Feature Parity Table

| Feature | DRFX Macro | AE MVP | Notes |
| --- | --- | --- | --- |
| Applies to video/image | Yes | Yes | AE effect renders supplied layer frames |
| Adjustment layer support | Resolve effect context | Planned through AE effect semantics | Requires AE host test |
| Pixel density | `MosaicBlur PixelFrequency` | `Pixel Density` | Native grid implementation |
| Contrast/gain/lift/gamma | Yes | Contrast/brightness/gamma MVP | Lift/gain can be added as separate params |
| Invert | Yes | Yes | Inverts mapping, not source alpha |
| 9-character custom set | Yes | Custom text param | Any ASCII length accepted |
| Multiple ASCII presets | Yes | Original presets | Proprietary text not copied |
| Font selector | Fusion TextPlus | Deferred | MVP uses embedded procedural glyph atlas |
| Color palettes | 18 Fusion gradients | Original palettes/presets | Proprietary values not copied |
| Hue/saturation correction | Yes | Params defined | Full HSV transform upgrade pending |
| Alpha preservation | Partial | Yes for 8-bit core | Needs AE host validation |
| 16/32 bpc | Resolve internal | Upgrade path | MVP renders 8-bit |
| Smart Render | n/a | Flags declared | SmartFX checkout still to complete |
