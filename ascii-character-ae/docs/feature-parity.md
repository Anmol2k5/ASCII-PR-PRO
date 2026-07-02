# Feature Parity

| Area | DaVinci `ASCII Letters` | Native AE MVP | Status |
| --- | --- | --- | --- |
| Effect type | Fusion macro | Native C++ AE effect | Rebuilt, not converted |
| Pixel density | Mosaic Blur PixelFrequency | Pixel Density grid | Implemented |
| Contrast | BrightnessContrast | Contrast | Implemented |
| Gain/lift | BrightnessContrast | Brightness approximation | Partial |
| Gamma | BrightnessContrast | Gamma | Implemented |
| Invert | InvertColor blend | Invert Luminance | Implemented |
| ASCII presets | SwitchText, 11 names | Original ramps | Implemented without copying proprietary ramps |
| Custom set | 9 letters | Deferred | AE effect text input requires a custom UI/arbitrary-data path |
| Text rendering | Fusion TextPlus | Procedural glyph placeholder | MVP, atlas next |
| Font | Open Sans/Bold controls | Monospace atlas target | Deferred |
| Alignment | TextPlus alignment | Params registered | Partial |
| Color palettes | SwitchGradient, 18 names | Original palettes | Partial |
| Hue/saturation | ColorCorrector | Params registered | Partial |
| Alpha | Fusion alpha modes | Preserve source alpha | Implemented in 8-bit core |
| Bit depth | Resolve managed | 8-bit MVP | 16/32-bpc deferred |
| CustomFP | Multi-input custom foreground | Not built | Deferred |
