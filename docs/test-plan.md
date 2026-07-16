# Test Plan

## Composition Formats

- 1920x1080 landscape.
- 3840x2160 4K.
- 1080x1920 portrait.
- 1080x1080 square.

## Source Layer Types

- Video layer.
- Still image layer.
- Solid.
- Transparent PNG.
- Precomp.
- Adjustment layer.

## Image Conditions

- Fast-moving footage.
- Dark footage.
- Bright footage.
- Smooth gradients.
- High-noise footage.
- Alpha edges and semi-transparent pixels.

## Plugin Behavior

- Pixel Density from minimum to maximum.
- Character Set dropdown.
- Custom character text field after the custom UI/arbitrary-data parameter pass.
- Dark-to-light and light-to-dark order.
- Monochrome, two-tone, gradient, source color, and custom foreground/background.
- Blend With Original.
- Preserve Source Alpha on/off.
- Duplicated effects on the same layer.
- Undo/redo after changing parameters.
- Render Queue output.
- Media Encoder output if AE routes the plugin successfully.

## Bit Depth

- 8 bpc: expected MVP path.
- 16 bpc: verify fallback or upgrade implementation.
- 32 bpc: verify fallback or upgrade implementation.

## Stability

- Missing source frame should not crash.
- Empty custom character set should fall back to Classic.
- Extreme offsets should not write out of bounds.
- Render Only Every Nth Cell should never divide by zero.
