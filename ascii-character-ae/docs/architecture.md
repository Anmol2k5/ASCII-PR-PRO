# Architecture

## Product Shape

`ASCII Character` is a native Adobe After Effects effect plugin. ExtendScript is
reserved for optional automation panels and presets; it is not used to render
the effect.

## Components

```text
src/plugin/ASCIICharacter.cpp   AE SDK command handler and parameter setup
src/plugin/Parameters.*         Parameter identifiers
src/plugin/RenderEngine.*       Host-independent ASCII render core
src/plugin/CharacterSets.*      Original luminance ramps
src/plugin/ColorPalettes.*      Original color presets
src/plugin/Utilities.*          Small shared helpers
assets/presets/                 Starter preset data
packaging/                      Release packaging scripts
```

## Rendering Algorithm

For every output frame:

1. Read the input frame from AE.
2. Divide it into a grid from `Pixel Density` and `Cell Aspect Ratio`.
3. Average luminance for each cell.
4. Apply image controls: contrast, brightness, gamma, threshold, posterize, and
   invert luminance.
5. Map luminance to a character in the selected ramp.
6. Draw the glyph into the output cell.
7. Apply color mode and preserve source alpha when enabled.
8. Optionally blend the result with the original frame.

## Glyph Rendering Decision

Evaluated options:

| Option | Pros | Cons | MVP Decision |
| --- | --- | --- | --- |
| Rasterized glyph atlas | Fast, deterministic, shippable | Requires asset generation and font license tracking | Best commercial path |
| Embedded bitmap atlas | Very reliable | Less flexible typography | Best first production implementation |
| Platform font rendering | Familiar font selection | Cross-machine differences and AE threading risks | Deferred |
| Custom vector renderer | Portable | Too much type work for MVP | Not first |

The current code uses a procedural monochrome glyph mask as a placeholder for a
bundled atlas. The next production step is replacing `glyphCoverage()` with an
embedded atlas generated from an open-license monospace font, with the font
license stored in `assets/fonts/LICENSE.md`.

## AE SDK Integration

The wrapper registers the MVP controls and calls `RenderEngine::render8`.
The first source pass intentionally does not declare Smart Render or deep-color
support until those callbacks are implemented. The upgrade path is:

1. Replace direct `PF_Cmd_RENDER` pixel access with SmartFX checkout.
2. Add row iterators for `PF_Pixel16` and `PF_PixelFloat`.
3. Normalize all samples into float RGBA.
4. Reuse the same luminance and glyph placement code.
5. Convert back to the host output pixel format.

## Safety

- Bounds checks are used for all output writes.
- Missing or empty frames return without crashing.
- Rendering is deterministic for identical settings and source pixels.
- No user-specific paths are required by the plugin.
- Development builds have no licensing lockout.
