# User Guide

## Quick Start

1. Apply `ASCII Character` to a layer.
2. Set `Pixel Density` until the character grid has the right detail.
3. Choose a `Character Set`.
4. Tune `Contrast` and `Gamma`.
5. Choose a `Colour Mode`.
6. Adjust `Character Scale` and spacing.

## Good Defaults

For 1080p footage:

- Pixel Density: 90-120.
- Character Set: Classic.
- Contrast: 1.0-1.3.
- Gamma: 1.0.
- Colour Mode: Monochrome or Gradient.

For 4K footage:

- Pixel Density: 140-220.
- Character Set: Dense or Classic.
- Quality: High after look development.

## Starter Presets

Preset definitions live in:

```text
assets/presets/starter-presets.json
```

They define:

- Classic ASCII
- White on Black
- Green Terminal
- Orange Terminal
- Blue Print
- High Contrast
- Soft Minimal
- Block Characters
- Original Colour ASCII

## MVP Limitation

The native AE MVP uses preset character ramps. A freeform custom character text
field is deferred to the custom UI/arbitrary-data parameter pass because the
basic AE effect parameter set does not provide a simple cross-version text box.
