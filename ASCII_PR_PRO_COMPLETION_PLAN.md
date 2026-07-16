# ASCII-PR-PRO Completion Implementation Plan

> **For agentic workers:** Implement this document task-by-task. Do not jump directly to UI polish or licensing. Every task ends with a testable deliverable and a commit.
>
> **Repository:** `Anmol2k5/ASCII-PR-PRO`  
> **Audited branch:** `master`  
> **Audit basis:** current repository state through commit `22d0b932ea91a683175d386ae76064eb979bf551`  
> **Primary target:** Native Adobe After Effects effect plugin for Windows  
> **Secondary target:** A small optional ScriptUI helper panel  
> **Not part of v1:** Premiere Pro support, macOS build, online licensing, or a general-purpose AE utility toolkit

---

## 1. Goal

Turn the current collection of prototypes into a stable, installable, visually correct Adobe After Effects ASCII effect that:

- Loads as a native `.aex` effect.
- Renders recognizable ASCII glyphs rather than procedural line patterns.
- Correctly handles Adobe pixel formats, alpha, row bytes, and premultiplied colour.
- Makes every visible control functional.
- Works in the Composition viewer, Render Queue, and Adobe Media Encoder.
- Supports 8-bpc, 16-bpc, and 32-bpc projects.
- Ships with presets, documentation, a clean release package, and repeatable tests.

---

## 2. Product decision

The repository currently contains three different products:

1. `ASCII_PRO_v1.0.jsx` — expression-driven ASCII generator.
2. `ascii-character-ae/` — native C++ After Effects effect.
3. `ascii-toolkit.jsx` — broad AE utility panel.

The finished product must use this structure:

- **Native C++ effect:** the actual renderer and commercial product.
- **Focused ScriptUI helper:** optional convenience layer for applying presets, checking installation, and creating a demo composition.
- **Legacy scripts:** kept only for reference and fallback testing.
- **General AE utilities:** moved to a different repository or archived outside the release.

Do not continue developing all three implementations in parallel. That will create inconsistent controls, duplicate bugs, and impossible support requirements.

---

## 3. Definition of done

The plugin is considered complete only when all of the following are true.

### Installation

- [ ] A clean checkout can be configured with a documented Adobe After Effects SDK path.
- [ ] A Release build produces `ASCII Character.aex`.
- [ ] After Effects discovers the effect without missing-entry-point or PiPL errors.
- [ ] The effect appears under `Effect > Stylize > ASCII Character`.
- [ ] The same binary works in the documented supported AE versions.

### Rendering

- [ ] Output uses recognizable `@`, `%`, `#`, `*`, `+`, `=`, `-`, `.`, and other real glyphs.
- [ ] Dark-to-light and light-to-dark ramps are visually correct.
- [ ] Source colour, monochrome, two-tone, gradient, and custom foreground/background modes work.
- [ ] Transparent footage and semi-transparent edges render correctly.
- [ ] 8-bpc, 16-bpc, and 32-bpc comps produce equivalent-looking output.
- [ ] Render Queue output matches the Composition viewer.
- [ ] Multiple instances can exist in the same project without cross-instance state.

### Controls

- [ ] Every control shown in Effect Controls changes the result.
- [ ] Parameters that are not implemented are not exposed.
- [ ] Invalid or extreme values do not crash AE or produce out-of-bounds memory access.
- [ ] Resetting the effect restores stable defaults.
- [ ] Animation/keyframes work for all numeric and colour parameters.

### Performance

- [ ] 1080p editing remains interactive at default density.
- [ ] 4K frames render without multi-second UI freezes at normal settings.
- [ ] Draft quality is meaningfully faster than High quality.
- [ ] Rendering does not leak memory across long sequences.

### Release

- [ ] The release ZIP contains only the plugin, optional panel, presets, licence, changelog, user guide, and troubleshooting guide.
- [ ] No local machine paths, copied SDK files, old ZIPs, experimental folders, or proprietary reference assets are shipped.
- [ ] Version numbers match in C++, PiPL, changelog, package name, and About dialog.
- [ ] A manual compatibility matrix has been completed.

---

# 4. Final architecture

```text
ASCII-PR-PRO/
├── README.md
├── CHANGELOG.md
├── LICENSE.md
├── CMakeLists.txt
├── cmake/
│   ├── FindAfterEffectsSDK.cmake
│   └── ConfigurePiPL.cmake
├── plugin/
│   ├── include/
│   │   ├── ASCIICharacter.h
│   │   ├── Parameters.h
│   │   ├── RenderTypes.h
│   │   ├── PixelAdapter.h
│   │   ├── GridLayout.h
│   │   ├── GlyphAtlas.h
│   │   ├── CharacterSets.h
│   │   ├── ColorTransforms.h
│   │   └── RenderEngine.h
│   ├── src/
│   │   ├── ASCIICharacter.cpp
│   │   ├── Parameters.cpp
│   │   ├── PixelAdapter.cpp
│   │   ├── GridLayout.cpp
│   │   ├── GlyphAtlas.cpp
│   │   ├── CharacterSets.cpp
│   │   ├── ColorTransforms.cpp
│   │   └── RenderEngine.cpp
│   └── resources/
│       ├── ASCIICharacterPiPL.r
│       ├── ASCIICharacter.rc
│       └── resource.h
├── assets/
│   ├── fonts/
│   │   ├── OFL.txt
│   │   └── README.md
│   ├── glyphs/
│   │   └── ascii_atlas_generated.h
│   └── presets/
│       ├── Classic ASCII.ffx
│       ├── Green Terminal.ffx
│       ├── Orange Terminal.ffx
│       ├── Blueprint.ffx
│       ├── High Contrast.ffx
│       └── Original Colour.ffx
├── panel/
│   ├── ASCII PRO.jsx
│   └── README.md
├── tools/
│   ├── generate_glyph_atlas.py
│   ├── configure-windows.ps1
│   ├── build-windows.ps1
│   ├── install-local.ps1
│   ├── uninstall-local.ps1
│   └── package-release.ps1
├── tests/
│   ├── unit/
│   │   ├── test_character_sets.cpp
│   │   ├── test_grid_layout.cpp
│   │   ├── test_color_transforms.cpp
│   │   ├── test_glyph_atlas.cpp
│   │   └── test_render_engine.cpp
│   ├── golden/
│   │   ├── input_gradient.ppm
│   │   ├── input_alpha.ppm
│   │   └── expected/
│   └── ae-manual/
│       ├── TEST_MATRIX.md
│       └── expected-screenshots/
├── docs/
│   ├── BUILDING.md
│   ├── INSTALLATION.md
│   ├── USER_GUIDE.md
│   ├── TROUBLESHOOTING.md
│   ├── ARCHITECTURE.md
│   └── RELEASE_CHECKLIST.md
└── legacy/
    ├── ASCII_PRO_v1.3.jsx
    ├── ascii_setup.jsx
    ├── ascii_expression.js
    ├── ascii-toolkit-original.jsx
    └── chat-gpt-versions/
```

## Component boundaries

### `ASCIICharacter.cpp`

Owns only Adobe SDK integration:

- Entry point.
- Global setup.
- Parameter registration.
- Smart Render callbacks.
- Pixel-format detection.
- Converting Adobe parameters to `RenderSettings`.
- Dispatching to the host-independent renderer.

It must not contain glyph drawing, colour maths, or grid algorithms.

### `RenderEngine`

Owns frame rendering:

- Grid iteration.
- Cell sampling.
- Luminance mapping.
- Glyph placement.
- Blending with source.

It must not include Adobe SDK headers.

### `PixelAdapter`

Owns Adobe pixel memory:

- `PF_Pixel8`
- `PF_Pixel16`
- `PF_PixelFloat`
- Row-byte traversal
- Premultiplication/unpremultiplication
- Conversion to and from normalized internal RGBA

### `GlyphAtlas`

Owns real glyph data and lookup.

### `GridLayout`

Owns cell size, offsets, alignment, rotation origin, and output bounds.

### `ColorTransforms`

Owns:

- Contrast
- Brightness
- Gamma
- Threshold
- Posterization
- Saturation
- Hue shift
- Gradient interpolation
- Premultiplied alpha-safe blending

---

# 5. Global constraints

- Windows-first v1.
- Visual Studio 2022.
- CMake 3.22 or newer.
- C++17.
- Do not commit Adobe SDK headers or libraries.
- Do not reinterpret Adobe host pixels as a custom pixel struct.
- Do not use runtime platform font rendering in render threads.
- Use an embedded glyph atlas generated from an open-licence monospace font.
- Do not expose a UI parameter until its render behavior exists and is tested.
- Keep rendering deterministic for identical source pixels and settings.
- No internet access or licence-server dependency inside the renderer.
- Keep the native renderer usable without the ScriptUI panel.
- The JSX panel must find the native effect by match name, not display name.
- The final match name should be vendor-owned, for example:
  `com.anmolsaini.ascii-character`
- Preserve old match names only through a documented migration strategy if users already have projects using them.

---

# 6. Parameter contract

Use one source of truth for parameter IDs and behavior.

| Parameter | Type | Default | v1 behavior |
|---|---|---:|---|
| Input | Layer | current | Host input |
| Pixel Density | Integer | 90 | Number of columns |
| Cell Aspect Ratio | Float | 0.55 | Cell height relation |
| Character Scale | Float | 0.92 | Glyph size inside cell |
| Spacing X | Float | 1.0 | Horizontal cell step multiplier |
| Spacing Y | Float | 1.0 | Vertical cell step multiplier |
| Blend With Original | Percent | 0 | Source/effect blend |
| Preserve Source Alpha | Boolean | On | Alpha from cell source |
| Transparent Background | Boolean | Off | Empty glyph area alpha = 0 |
| Invert Luminance | Boolean | Off | Reverse luminance |
| Contrast | Float | 1.0 | Pivot around 0.5 |
| Brightness | Float | 0 | Additive normalized offset |
| Gamma | Float | 1.0 | Positive gamma transform |
| Threshold | Integer | 0 | Disabled at 0 |
| Posterize Levels | Integer | 0 | Disabled at 0/1 |
| Character Set | Popup | Classic | Built-in ramp |
| Character Order | Popup | Dark to Light | Ramp direction |
| Colour Mode | Popup | Monochrome | Source/mono/two-tone/gradient/custom |
| Foreground | Colour | White | Main ink |
| Background | Colour | Black | Empty cell/background |
| Gradient Start | Colour | Green | Low-luminance gradient |
| Gradient End | Colour | White | High-luminance gradient |
| Hue Shift | Angle | 0° | HSV hue rotation |
| Saturation | Float | 1.0 | HSV saturation scale |
| Horizontal Alignment | Popup | Center | Grid placement |
| Vertical Alignment | Popup | Center | Grid placement |
| Offset X | Integer | 0 | Pixel offset after alignment |
| Offset Y | Integer | 0 | Pixel offset after alignment |
| Rotation | Angle | 0° | Grid rotation |
| Quality | Popup | Normal | Sampling and glyph coverage quality |
| Anti-aliasing | Boolean | On | Smooth glyph edges |
| Render Every Nth Cell | Integer | 1 | Stylized skip and draft control |

## Important parameter policy

During development, choose one of these two actions for every unfinished parameter:

1. Implement it and test it.
2. Remove it from `PF_Cmd_PARAMS_SETUP`.

Never leave a parameter visible but inert.

---

# 7. Phase plan

---

## Phase 0 — Repository cleanup and product isolation

### Task 0.1: Create the final directory structure

**Actions**

- Move `ascii-character-ae/src/plugin/*` into `plugin/include` and `plugin/src`.
- Move active native docs into `docs/`.
- Move old JSX implementations into `legacy/`.
- Rename the current `ascii-toolkit.jsx` to `legacy/ascii-toolkit-original.jsx`.
- Keep the original `.drfx` only under `reference/` if redistribution is legally allowed. Otherwise remove it from Git history and document that it was locally inspected.
- Remove generated ZIPs and duplicate versions from the active source tree.

**Acceptance**

- `find`/Explorer shows one active native implementation.
- Root README clearly says this is an After Effects plugin.
- No release instructions point users toward the legacy expression version.

**Commit**

```bash
git add -A
git commit -m "chore: isolate native plugin and archive legacy prototypes"
```

### Task 0.2: Replace machine-specific documentation

Remove paths such as:

```text
C:\Users\Mayur\Documents\Codex\...
```

Use repository-relative PowerShell examples:

```powershell
$RepoRoot = Split-Path -Parent $PSScriptRoot
cmake -S $RepoRoot -B "$RepoRoot\build" `
  -G "Visual Studio 17 2022" -A x64 `
  -DAE_SDK_ROOT="C:\SDKs\Adobe\AfterEffectsSDK"
```

**Acceptance**

```powershell
Select-String -Path .\**\* -Pattern "C:\\Users\\" -SimpleMatch
```

Expected: no source or documentation matches.

---

## Phase 1 — Produce a real loadable `.aex`

### Problem being solved

The current CMake configuration only builds a DLL-like module with an `.aex` suffix. That does not guarantee After Effects can discover it. A correct Adobe effect requires PiPL metadata and SDK-compatible resource integration.

### Task 1.1: Start from the Adobe SDK Skeleton sample

Do not invent PiPL integration from scratch.

1. Download the official AE SDK matching the newest supported AE release.
2. Locate the native effect sample commonly named `Skeleton`.
3. Build the unmodified sample first.
4. Install it into AE and verify that it loads.
5. Copy only the necessary project/resource patterns into this repository.
6. Keep Adobe SDK source outside the repository.

**Acceptance**

- The untouched Adobe sample loads.
- The plugin project uses the same PiPL resource build path as that sample.

### Task 1.2: Add SDK discovery

Create `cmake/FindAfterEffectsSDK.cmake`.

The module must validate these expected paths:

```text
${AE_SDK_ROOT}/Examples/Headers/AEConfig.h
${AE_SDK_ROOT}/Examples/Headers/AE_Effect.h
${AE_SDK_ROOT}/Examples/Headers/entry.h
${AE_SDK_ROOT}/Examples/Util/AEFX_SuiteHelper.h
```

Fail configuration with a useful error:

```cmake
if(NOT EXISTS "${AE_SDK_ROOT}/Examples/Headers/AE_Effect.h")
    message(FATAL_ERROR
        "AE_SDK_ROOT is invalid. Expected Examples/Headers/AE_Effect.h under: ${AE_SDK_ROOT}")
endif()
```

### Task 1.3: Add PiPL metadata

Create:

```text
plugin/resources/ASCIICharacterPiPL.r
plugin/resources/ASCIICharacter.rc
plugin/resources/resource.h
```

Base the resource file on the SDK Skeleton sample and replace only:

- Name: `ASCII Character`
- Category: `Stylize`
- Entry point: `EffectMain`
- Match name: `com.anmolsaini.ascii-character`
- Version: same values as `ASCIICharacter.h`
- Supported architecture: Win64
- Out flags: exactly matching implemented callbacks

Do not copy arbitrary PiPL syntax from a blog. SDK versions vary.

### Task 1.4: Fix exported entry point

Keep:

```cpp
extern "C" DllExport PF_Err EffectMain(...)
```

Add an automated post-build validation:

```powershell
dumpbin /exports .\build\Release\ASCIICharacter.aex |
    Select-String "EffectMain"
```

Expected: one exported `EffectMain`.

### Task 1.5: Add build scripts

Create `tools/configure-windows.ps1`:

```powershell
param(
    [Parameter(Mandatory = $true)]
    [string]$AeSdkRoot,
    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Debug"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$BuildDir = Join-Path $RepoRoot "build"

cmake -S $RepoRoot -B $BuildDir `
    -G "Visual Studio 17 2022" `
    -A x64 `
    -DAE_SDK_ROOT="$AeSdkRoot" `
    -DASCII_CHARACTER_BUILD_PLUGIN=ON `
    -DASCII_CHARACTER_BUILD_TESTS=ON

cmake --build $BuildDir --config $Configuration
```

Create `tools/install-local.ps1`:

```powershell
param(
    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Debug",
    [string]$AeVersion = "2026"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$BuiltPlugin = Join-Path $RepoRoot "build\$Configuration\ASCIICharacter.aex"
$Destination = "C:\Program Files\Adobe\Adobe After Effects $AeVersion\Support Files\Plug-ins\ASCII Character"

if (!(Test-Path $BuiltPlugin)) {
    throw "Plugin not found: $BuiltPlugin"
}

New-Item -ItemType Directory -Force -Path $Destination | Out-Null
Copy-Item $BuiltPlugin (Join-Path $Destination "ASCII Character.aex") -Force
Write-Host "Installed to $Destination"
```

### Phase 1 acceptance checklist

- [ ] Debug build succeeds.
- [ ] Release build succeeds.
- [ ] `dumpbin` lists `EffectMain`.
- [ ] AE launches without plugin loading error.
- [ ] `ASCII Character` appears in `Stylize`.
- [ ] About dialog shows correct version.
- [ ] Applying the effect does not crash.

**Commit**

```bash
git add CMakeLists.txt cmake plugin/resources tools docs/BUILDING.md
git commit -m "build: add reproducible AE SDK and PiPL integration"
```

---

## Phase 2 — Correct Adobe pixel handling

### Problem being solved

The current renderer casts `PF_LayerDef::data` to a custom RGBA structure. Adobe host memory must instead be read through the actual Adobe pixel type and row-byte layout.

### Task 2.1: Introduce normalized internal colour

Create `plugin/include/RenderTypes.h`:

```cpp
#pragma once

namespace ascii_character {

struct LinearRgba {
    float r = 0.0f;
    float g = 0.0f;
    float b = 0.0f;
    float a = 1.0f;
};

struct ImageView {
    int width = 0;
    int height = 0;
    int rowBytes = 0;
    void* data = nullptr;
};

} // namespace ascii_character
```

Use normalized values in the renderer. Do not let the renderer depend on 8-bit storage.

### Task 2.2: Add host pixel adapters

Create `plugin/include/PixelAdapter.h` with an interface like:

```cpp
#pragma once

#include "RenderTypes.h"

namespace ascii_character {

enum class HostPixelFormat {
    Argb8,
    Argb16,
    Argb32Float
};

class PixelReader {
public:
    virtual ~PixelReader() = default;
    virtual LinearRgba read(int x, int y) const = 0;
    virtual int width() const = 0;
    virtual int height() const = 0;
};

class PixelWriter {
public:
    virtual ~PixelWriter() = default;
    virtual void write(int x, int y, const LinearRgba& pixel) = 0;
    virtual int width() const = 0;
    virtual int height() const = 0;
};

} // namespace ascii_character
```

Concrete adapters may remain internal to `PixelAdapter.cpp`.

### Task 2.3: Respect channel order and row bytes

For 8-bpc, use the SDK type directly:

```cpp
const auto* row = reinterpret_cast<const PF_Pixel8*>(
    reinterpret_cast<const A_u_char*>(layer.data) + y * layer.rowbytes);

const PF_Pixel8& source = row[x];
```

Map explicitly:

```cpp
LinearRgba result;
result.a = source.alpha / 255.0f;
result.r = source.red   / 255.0f;
result.g = source.green / 255.0f;
result.b = source.blue  / 255.0f;
```

Perform the reverse mapping when writing.

Do not rely on the in-memory order of a custom struct.

### Task 2.4: Handle premultiplied alpha

Choose and document one internal convention:

- Internal `LinearRgba` is **straight alpha**.
- Adobe input is converted to straight alpha when read.
- Adobe output is premultiplied when written.

Unpremultiply safely:

```cpp
if (pixel.a > 1e-6f) {
    pixel.r /= pixel.a;
    pixel.g /= pixel.a;
    pixel.b /= pixel.a;
} else {
    pixel.r = pixel.g = pixel.b = 0.0f;
}
```

Premultiply before writing:

```cpp
pixel.r *= pixel.a;
pixel.g *= pixel.a;
pixel.b *= pixel.a;
```

Clamp all channels to `[0, 1]`.

### Task 2.5: Add adapter tests

Tests must cover:

- Non-packed row bytes.
- Red-only input remains red.
- Green-only input remains green.
- Blue-only input remains blue.
- 50% alpha white round-trips without colour fringe.
- Fully transparent pixels have zero RGB after output premultiplication.

### Phase 2 acceptance

- [ ] A red solid renders red in Source Colour mode.
- [ ] Alpha is not mistaken for red.
- [ ] Transparent PNG edges do not produce dark or coloured halos.
- [ ] A row-byte padding test passes.
- [ ] The native renderer no longer contains `reinterpret_cast<Pixel8*>`.

**Commit**

```bash
git add plugin/include/RenderTypes.h plugin/include/PixelAdapter.h \
        plugin/src/PixelAdapter.cpp tests/unit/test_pixel_adapter.cpp
git commit -m "fix: add explicit Adobe pixel adapters and alpha handling"
```

---

## Phase 3 — Replace fake glyphs with real ASCII glyphs

### Problem being solved

The current `glyphCoverage()` uses bits from the character code to draw abstract strokes. It does not render recognizable glyphs.

### Recommended solution

Use an embedded grayscale bitmap atlas generated at development time from an open-licence monospace font.

Do not use Windows GDI, DirectWrite, or runtime font discovery inside render callbacks. Runtime font output can vary by machine and is risky in multithreaded rendering.

### Task 3.1: Select an open font

Recommended choices:

- JetBrains Mono
- IBM Plex Mono
- Source Code Pro
- DejaVu Sans Mono

Requirements:

- Licence permits embedding.
- Licence file is included under `assets/fonts/`.
- Font contains every character used by built-in ramps.
- Font remains readable at small sizes.

Record the selected font and exact version in `assets/fonts/README.md`.

### Task 3.2: Generate the atlas

Create `tools/generate_glyph_atlas.py`.

Inputs:

- Font file path.
- Cell width.
- Cell height.
- Character list.
- Output header path.

Recommended first atlas:

- Cell size: `16×24`.
- Coverage: grayscale `0–255`.
- Character set: printable ASCII characters 32–126.
- Baseline and centering fixed during generation.
- Output header: `assets/glyphs/ascii_atlas_generated.h`.

The generated header should contain:

```cpp
constexpr int kGlyphWidth = 16;
constexpr int kGlyphHeight = 24;
constexpr int kFirstGlyph = 32;
constexpr int kLastGlyph = 126;
constexpr unsigned char kGlyphCoverage[] = {
    // generated values
};
```

Add deterministic generation:

```powershell
python .\tools\generate_glyph_atlas.py `
  --font .\local-assets\JetBrainsMono-Regular.ttf `
  --font-size 22 `
  --cell-width 16 `
  --cell-height 24 `
  --output .\assets\glyphs\ascii_atlas_generated.h
```

The font binary does not have to be committed if the licence or size policy discourages it, but the generated atlas and licence must be committed.

### Task 3.3: Add `GlyphAtlas`

Interface:

```cpp
class GlyphAtlas {
public:
    static const GlyphAtlas& builtIn();
    float coverage(char character, float normalizedX, float normalizedY, bool antialias) const;
    bool contains(char character) const;
};
```

Behavior:

- Unsupported characters fall back to `?`.
- Space returns zero coverage.
- Coordinates outside `[0, 1]` return zero.
- Nearest-neighbour lookup when anti-aliasing is off.
- Bilinear interpolation when anti-aliasing is on.

### Task 3.4: Update `RenderEngine::drawGlyph`

Remove procedural `glyphCoverage()`.

For each output pixel inside the scaled glyph rectangle:

1. Convert output position to normalized glyph coordinates.
2. Sample the atlas.
3. Blend foreground over background using glyph coverage.
4. Preserve intended alpha behavior.

Coverage blend:

```cpp
const float coverage = atlas.coverage(character, u, v, settings.antiAlias);
LinearRgba pixel = lerp(background, ink, coverage);
```

### Task 3.5: Visual tests

Add golden outputs for:

- `@%#*+=-:. `
- Dense ramp.
- Binary ramp.
- Editorial ramp.
- Fine Dots ramp.

Each character must be visually recognizable in the generated test image.

### Phase 3 acceptance

- [ ] `@` looks like `@`.
- [ ] `M`, `W`, `8`, `%`, `.`, and space are distinct.
- [ ] Anti-aliasing visibly smooths diagonal/curved glyphs.
- [ ] The same frame renders identically on two Windows machines.
- [ ] Font licence is included.

**Commit**

```bash
git add tools/generate_glyph_atlas.py assets/fonts assets/glyphs \
        plugin/include/GlyphAtlas.h plugin/src/GlyphAtlas.cpp \
        plugin/src/RenderEngine.cpp tests/unit/test_glyph_atlas.cpp
git commit -m "feat: render real ASCII glyphs from an embedded atlas"
```

---

## Phase 4 — Build a correct grid and sampling model

### Task 4.1: Separate grid calculation

Create `GridLayout`.

Input:

```cpp
struct GridSettings {
    int frameWidth;
    int frameHeight;
    int pixelDensity;
    float cellAspectRatio;
    float spacingX;
    float spacingY;
    HorizontalAlignment horizontalAlignment;
    VerticalAlignment verticalAlignment;
    float offsetX;
    float offsetY;
    float rotationDegrees;
};
```

Output:

```cpp
struct Cell {
    int column;
    int row;
    float centerX;
    float centerY;
    float width;
    float height;
};
```

### Task 4.2: Define density precisely

`Pixel Density` means the number of columns across the unrotated frame.

```cpp
cellWidth = frameWidth / pixelDensity;
cellHeight = cellWidth / cellAspectRatio;
stepX = cellWidth * spacingX;
stepY = cellHeight * spacingY;
```

Clamp:

- `pixelDensity >= 4`
- `cellAspectRatio >= 0.1`
- `spacingX >= 0.05`
- `spacingY >= 0.05`

### Task 4.3: Implement alignment

Calculate total grid bounds before applying offsets.

Horizontal:

- Left: grid begins at frame left.
- Center: equal overflow/margin on both sides.
- Right: grid ends at frame right.

Vertical:

- Top
- Center
- Bottom

Apply `Offset X/Y` after alignment.

### Task 4.4: Implement rotation

Rotate every cell center around the selected grid origin:

```cpp
rotatedX = cosA * localX - sinA * localY + originX;
rotatedY = sinA * localX + cosA * localY + originY;
```

Sampling and glyph drawing must use the same transform so the source region and visible glyph remain aligned.

For the first implementation, use inverse mapping from each glyph output pixel into the unrotated glyph cell. Avoid holes created by forward-only rasterization.

### Task 4.5: Correct source sampling

Do not sample only one center pixel in High quality.

Quality policy:

- Draft: center sample.
- Normal: fixed 2×2 or 3×3 stratified sample.
- High: average the covered source cell using an integral image or complete bounded average.

For static correctness first, full average is acceptable. Optimize after tests pass.

### Phase 4 acceptance

- [ ] Portrait, square, 1080p, and 4K grids fill the expected area.
- [ ] Alignment controls visibly work.
- [ ] Offsets do not cause out-of-bounds access.
- [ ] Rotation does not detach glyphs from their sampled source region.
- [ ] Draft, Normal, and High produce distinct performance/quality behavior.

**Commit**

```bash
git add plugin/include/GridLayout.h plugin/src/GridLayout.cpp \
        plugin/src/RenderEngine.cpp tests/unit/test_grid_layout.cpp
git commit -m "feat: add deterministic grid layout, alignment, and rotation"
```

---

## Phase 5 — Complete colour and image controls

### Task 5.1: Consolidate luminance operations

Apply operations in this order:

1. Convert source RGB to luminance.
2. Brightness.
3. Contrast around 0.5.
4. Gamma.
5. Threshold if enabled.
6. Posterize if enabled.
7. Invert if enabled.
8. Clamp.

Recommended implementation:

```cpp
float adjustLuminance(float value, const RenderSettings& s) {
    value += s.brightness;
    value = (value - 0.5f) * s.contrast + 0.5f;
    value = clamp01(value);

    if (s.gamma > 0.001f) {
        value = std::pow(value, 1.0f / s.gamma);
    }

    if (s.threshold > 0.0f) {
        value = value >= s.threshold ? 1.0f : 0.0f;
    }

    if (s.posterizeLevels >= 2) {
        const float steps = static_cast<float>(s.posterizeLevels - 1);
        value = std::round(value * steps) / steps;
    }

    if (s.invertLuminance) {
        value = 1.0f - value;
    }

    return clamp01(value);
}
```

### Task 5.2: Implement hue and saturation

Convert straight-alpha RGB to HSV/HSL, apply:

```text
hue = wrap(hue + hueShiftDegrees / 360)
saturation = clamp(saturation * saturationScale)
```

Then convert back to RGB.

Apply hue/saturation to the chosen ink colour, not the luminance value.

### Task 5.3: Correct colour modes

#### Source Colour

Ink = adjusted average source colour.  
Background = selected background or transparent background.

#### Monochrome

Ink = foreground.  
Background = background.

#### Two Tone

Use a threshold or luminance midpoint:

- Below midpoint: background or dark tone.
- Above midpoint: foreground.

Clearly document whether glyph shape still comes from the character ramp. Recommended: yes.

#### Gradient

Ink = linear interpolation between Gradient Start and Gradient End using adjusted luminance.

#### Custom Foreground/Background

Ink = foreground.  
Cell background = background.

Remove all hardcoded black backgrounds.

### Task 5.4: Transparent background

Add a checkbox:

- Off: glyph empty space uses selected background colour.
- On: glyph empty space alpha is zero.

When preserving source alpha:

```text
final glyph alpha = coverage × source alpha
```

When not preserving source alpha:

```text
final glyph alpha = coverage
```

### Task 5.5: Blend with original

Blend in straight-alpha space or use a correct premultiplied blend helper.

`Blend With Original = 0%` means only ASCII output.  
`100%` means only original source.

### Phase 5 acceptance

- [ ] Every colour mode uses the selected background consistently.
- [ ] Hue Shift changes visible colour.
- [ ] Saturation at zero produces grayscale ink.
- [ ] Transparent Background exports real transparency.
- [ ] Blend With Original works correctly on transparent footage.
- [ ] No visible colour fringes at glyph edges.

**Commit**

```bash
git add plugin/include/ColorTransforms.h plugin/src/ColorTransforms.cpp \
        plugin/src/RenderEngine.cpp tests/unit/test_color_transforms.cpp
git commit -m "feat: complete colour modes, HSV controls, and transparency"
```

---

## Phase 6 — Wire and validate every parameter

### Task 6.1: Make `RenderSettings` complete

`settingsFromParams()` must assign every registered parameter.

Add tests or compile-time review for:

- Hue shift.
- Saturation.
- Horizontal alignment.
- Vertical alignment.
- Rotation.
- Quality.
- Anti-aliasing.
- Transparent background.

### Task 6.2: Use correct popup indexing

Adobe popup values are usually one-based. Convert explicitly instead of relying on enum layout:

```cpp
CharacterOrder readCharacterOrder(A_long value) {
    return value == 2
        ? CharacterOrder::LightToDark
        : CharacterOrder::DarkToLight;
}
```

Repeat for colour mode, alignment, and quality.

### Task 6.3: Add parameter groups

Organize the Effect Controls panel into logical groups if supported by the SDK version:

```text
Grid
Characters
Image
Colour
Transform
Quality
```

Do not let users scroll through an unstructured list of 30 controls.

### Task 6.4: Add dependency-based UI behavior

Where SDK support allows:

- Disable Gradient colours unless Gradient mode is selected.
- Disable Foreground/Background only when irrelevant.
- Disable Threshold value when thresholding is off, or retain zero-as-disabled with clear naming.
- Disable anti-aliasing in Draft if Draft intentionally ignores it.

If dynamic UI is too fragile for the first stable version, keep all controls visible but make each one functional and document mode relevance.

### Task 6.5: Parameter migration

Before changing parameter order, decide whether any users already have saved AE projects using the current build.

If no external users exist:

- Reorder and rename freely before v1.

If users exist:

- Never reuse a previous parameter ID for a new meaning.
- Append new parameters.
- Keep match name stable.
- Add migration handling where possible.

### Phase 6 acceptance

- [ ] Every exposed control changes output.
- [ ] Popup mappings match labels.
- [ ] Saving and reopening an AE project preserves settings.
- [ ] Duplicating the effect preserves settings.
- [ ] Keyframed parameters animate without crashes.

**Commit**

```bash
git add plugin/include/Parameters.h plugin/src/Parameters.cpp \
        plugin/src/ASCIICharacter.cpp tests/unit/test_parameter_mapping.cpp
git commit -m "feat: complete and validate native effect parameter wiring"
```

---

## Phase 7 — Smart Render and deep colour

### Problem being solved

A production AE effect should not depend only on legacy `PF_Cmd_RENDER`, and it must handle 16-bpc and 32-bpc frames correctly.

### Task 7.1: Implement Smart Pre-Render

Handle:

```cpp
PF_Cmd_SMART_PRE_RENDER
```

Responsibilities:

- Checkout input layer.
- Request the required source rectangle.
- Union input result/max rectangles into output.
- Store no unsafe global mutable state.

### Task 7.2: Implement Smart Render

Handle:

```cpp
PF_Cmd_SMART_RENDER
```

Responsibilities:

- Checkout input pixels.
- Checkout output.
- Determine pixel format through the Pixel Format Suite.
- Construct appropriate reader/writer adapters.
- Render.
- Check in layers.
- Return SDK errors without swallowing them.

### Task 7.3: Add 16-bpc adapter

Use `PF_Pixel16` and the SDK’s correct channel maximum, not a guessed `65535` if the SDK defines a different nominal maximum.

Normalize through SDK constants/macros.

### Task 7.4: Add 32-bpc float adapter

Use `PF_PixelFloat`.

Policy:

- Preserve HDR values for source blending where possible.
- Clamp only when mapping luminance to glyph indices.
- Do not clamp all source RGB to `[0,1]` before colour processing unless the effect specification requires it.
- Output valid float premultiplied RGBA.

### Task 7.5: Set correct out flags

Only advertise capabilities that exist.

After Smart Render and deep colour pass:

- Smart Render flag.
- Deep colour aware flag.
- Pixel independent/thread-safe flags only after verifying code has no mutable shared state.

Follow the exact SDK sample for flag names in the installed SDK.

### Phase 7 acceptance

- [ ] 8-bpc comp works.
- [ ] 16-bpc comp works without fallback corruption.
- [ ] 32-bpc comp works.
- [ ] Render Queue works.
- [ ] Media Encoder test works or limitation is explicitly documented.
- [ ] Viewer and final render match.

**Commit**

```bash
git add plugin/src/ASCIICharacter.cpp plugin/src/PixelAdapter.cpp \
        tests docs/ARCHITECTURE.md docs/BUILDING.md
git commit -m "feat: add Smart Render and 8/16/32-bpc support"
```

---

## Phase 8 — Presets and focused helper panel

### Product decision

Do not make JSON presets the only user-facing preset system. After Effects users expect `.ffx` animation presets.

### Task 8.1: Create official `.ffx` presets

Create and test:

- Classic ASCII.
- Green Terminal.
- Orange Terminal.
- Blueprint.
- High Contrast.
- Soft Minimal.
- Original Colour.
- Binary.
- Dense Matrix.

Each preset must be made from the final parameter contract.

Store under `assets/presets/`.

### Task 8.2: Rewrite the helper panel

Create `panel/ASCII PRO.jsx`.

It should only provide:

- Plugin status.
- Apply effect to selected layer(s).
- Apply a bundled preset.
- Reset selected ASCII effect.
- Create demo composition.
- Open installation/help instructions.

Remove:

- Generic null creation.
- Generic solid creation.
- Shy/unshy.
- Remove all effects.
- Layer sequencing.
- General precompose tools.

### Task 8.3: Find effect by match name

Use:

```text
com.anmolsaini.ascii-character
```

Do not depend only on display name because it can be localized or renamed.

### Task 8.4: Avoid disconnected controls

The panel must not add standalone Slider Controls named “ASCII Density” unless those controls are expression-linked to the native effect.

Preferred behavior:

- Apply native effect.
- Set native effect parameter values directly.
- Apply `.ffx` preset.

### Task 8.5: Instance safety

The panel must operate on each selected layer’s actual effect instance.

Do not create shared controller layers or fixed names like:

```text
ASCII PRO CONTROLLER
ASCII OUTPUT
```

for the native workflow.

### Phase 8 acceptance

- [ ] Panel accurately reports whether native effect is installed.
- [ ] Apply button adds the native effect.
- [ ] Preset buttons modify native parameters.
- [ ] Multiple selected layers work.
- [ ] No generic toolkit buttons remain.
- [ ] Plugin remains fully usable without the panel.

**Commit**

```bash
git add panel assets/presets docs/USER_GUIDE.md
git commit -m "feat: add focused helper panel and AE presets"
```

---

## Phase 9 — Testing strategy

### Task 9.1: Use CTest

Enable tests by default for developer builds:

```cmake
include(CTest)

if(BUILD_TESTING)
    add_executable(ascii_character_tests
        tests/unit/test_main.cpp
        tests/unit/test_character_sets.cpp
        tests/unit/test_grid_layout.cpp
        tests/unit/test_color_transforms.cpp
        tests/unit/test_glyph_atlas.cpp
        tests/unit/test_render_engine.cpp
        plugin/src/RenderEngine.cpp
        plugin/src/GridLayout.cpp
        plugin/src/GlyphAtlas.cpp
        plugin/src/CharacterSets.cpp
        plugin/src/ColorTransforms.cpp
    )

    target_include_directories(ascii_character_tests PRIVATE plugin/include)
    add_test(NAME ascii_character_tests COMMAND ascii_character_tests)
endif()
```

A small vendored test framework may be used, or implement a minimal assertion runner. Do not require AE SDK for host-independent tests.

### Task 9.2: Replace the weak smoke test

The current “non-black pixel exists” assertion is insufficient.

Minimum unit tests:

#### Character sets

- Correct number of sets.
- Every ramp is non-empty.
- Space exists where expected.
- Light/dark order maps endpoints correctly.

#### Grid

- Exact cell count for known frame/density.
- No zero-sized cells.
- Alignment offsets.
- Rotation around origin.
- Negative offsets remain bounds-safe.

#### Colour

- Contrast identity at 1.
- Gamma identity at 1.
- Saturation zero.
- Hue shift wrap.
- Threshold boundaries.
- Posterize levels.

#### Glyph atlas

- Space has zero coverage.
- `@` has non-zero coverage.
- Unsupported glyph falls back safely.
- Bilinear and nearest sampling remain in range.

#### Alpha

- Transparent input.
- 50% alpha.
- Transparent background.
- Source blend.

#### Renderer

- Deterministic output.
- Character order reversal.
- Every colour mode.
- Every quality mode.
- Extreme parameter values.
- Odd frame sizes.
- Row-byte padding through adapter tests.

### Task 9.3: Golden image tests

Use a simple file format such as PPM/PAM for host-independent tests.

For each golden test:

1. Generate output.
2. Compare dimensions.
3. Compare per-pixel error with tolerance.
4. Print a diff image on failure.

Golden images:

- Horizontal grayscale gradient.
- Colour bars.
- Alpha circle.
- Checkerboard.
- Portrait gradient.
- High-frequency noise.

### Task 9.4: Add public CI for core tests

Create `.github/workflows/core-tests.yml`.

It should:

- Run on Windows.
- Configure with plugin build off.
- Build host-independent tests.
- Run CTest.
- Upload diff artifacts on failure.

Do not attempt to download or commit the Adobe SDK in public CI.

Suggested commands:

```powershell
cmake -S . -B build `
  -G "Visual Studio 17 2022" -A x64 `
  -DASCII_CHARACTER_BUILD_PLUGIN=OFF `
  -DBUILD_TESTING=ON

cmake --build build --config Release
ctest --test-dir build -C Release --output-on-failure
```

### Task 9.5: Manual AE matrix

Create `tests/ae-manual/TEST_MATRIX.md`.

Test at minimum:

| Area | Cases |
|---|---|
| AE versions | newest three supported versions |
| Bit depth | 8, 16, 32 |
| Resolution | 1080p, 4K, 1080×1920, 1080×1080 |
| Source | video, still, solid, precomp, transparent PNG |
| Render | viewer, Render Queue, Media Encoder |
| Instances | one, duplicated, stacked |
| Project | save, close, reopen |
| Animation | density, contrast, colour, rotation |
| Hardware | at least two Windows machines |

### Phase 9 acceptance

- [ ] Public core CI passes.
- [ ] Golden tests pass.
- [ ] Manual AE matrix is completed for release candidate.
- [ ] No known crash is left undocumented.

**Commit**

```bash
git add tests .github/workflows/core-tests.yml CMakeLists.txt
git commit -m "test: add unit, golden, CI, and AE validation suites"
```

---

## Phase 10 — Performance work

Do not optimize before correctness tests exist.

### Task 10.1: Add timing instrumentation in debug builds

Measure:

- Source sampling.
- Glyph rendering.
- Blending.
- Complete frame time.

Do not log per cell.

### Task 10.2: Optimize cell averaging

If High quality is slow, use summed-area tables/integral images:

- Build one luminance integral image.
- Optionally build R/G/B/A integrals.
- Compute each rectangular cell average in O(1).

This changes total averaging cost from repeated area loops to:

```text
O(frame pixels + number of cells)
```

### Task 10.3: Tile or iterate safely

Use Adobe iteration suites or internal parallelism only after confirming:

- No global mutable state.
- Atlas is immutable.
- Render settings are immutable.
- Writers never touch the same output region concurrently.

Prefer Adobe SDK iteration utilities where appropriate.

### Task 10.4: Make Quality meaningful

Recommended policy:

| Quality | Sampling | Glyph sampling | Intended use |
|---|---|---|---|
| Draft | center | nearest | interactive preview |
| Normal | 2×2/3×3 | bilinear | editing |
| High | full/integral average | bilinear/high precision | final render |

### Performance targets

Record actual hardware when measuring.

Suggested initial targets:

- 1080p Normal/default density: under 33–50 ms per frame on a modern desktop CPU.
- 4K Normal/default density: under 150 ms per frame.
- Draft should be at least 1.5× faster than High.

These are goals, not claims. Publish only measured values.

**Commit**

```bash
git add plugin/src tests docs/ARCHITECTURE.md
git commit -m "perf: optimize cell sampling and quality modes"
```

---

## Phase 11 — Packaging and release

### Task 11.1: Finalise versioning

Use semantic versioning:

- `0.1.0-alpha`: loads and renders, internal only.
- `0.5.0-beta`: real glyphs, 8-bpc, testers.
- `0.9.0-rc.1`: deep colour, presets, packaging.
- `1.0.0`: public stable release.

Synchronize:

- `ASCIICharacter.h`
- PiPL
- About text
- `CHANGELOG.md`
- Package folder
- ZIP filename
- Panel version

### Task 11.2: Replace placeholder licence

The existing licence explicitly says it is temporary.

For an open-source release:

- Choose MIT, Apache-2.0, GPL-3.0, or another deliberate licence.
- Ensure font/atlas licensing is compatible.

For a commercial closed-source release:

- Add final EULA.
- Add third-party notices.
- Do not publish the C++ source unless intended.

### Task 11.3: Package only runtime files

Release ZIP:

```text
ASCII-Character-1.0.0-Windows/
├── Plug-ins/
│   └── ASCII Character.aex
├── Scripts/
│   └── ScriptUI Panels/
│       └── ASCII PRO.jsx
├── Presets/
│   ├── Classic ASCII.ffx
│   └── ...
├── Documentation/
│   ├── INSTALLATION.pdf-or-md
│   ├── USER_GUIDE.pdf-or-md
│   └── TROUBLESHOOTING.pdf-or-md
├── LICENSE.txt
├── THIRD_PARTY_NOTICES.txt
└── CHANGELOG.md
```

Do not ship:

- Source files.
- Adobe SDK.
- CMake build output.
- `.pdb` files in public Release package.
- Original `.drfx`.
- Legacy JSX.
- `chat gpt version`.
- Local paths.
- Test fixtures.

### Task 11.4: Improve packaging script

`tools/package-release.ps1` must:

- Require version.
- Require existing Release `.aex`.
- Create a clean temporary package directory.
- Copy only allow-listed files.
- Create SHA-256 checksum.
- Produce versioned ZIP.
- Fail if placeholder text is detected.

Example checks:

```powershell
$ForbiddenPatterns = @(
    "yourproduct.com",
    "support@yourproduct.com",
    "C:\Users\Mayur",
    "Development build",
    "Replace this file"
)
```

### Task 11.5: Code signing

Before commercial distribution:

- Obtain a Windows code-signing certificate.
- Sign `.aex`.
- Verify signature.
- Timestamp signature.
- Include signing in private release pipeline, never public CI secrets.

### Task 11.6: Compatibility matrix

Publish tested combinations, not guesses.

Example:

| Plugin | AE | Windows | Status |
|---|---|---|---|
| 1.0.0 | AE 2024 | Windows 11 | Supported |
| 1.0.0 | AE 2025 | Windows 11 | Supported |
| 1.0.0 | AE 2026 | Windows 11 | Supported |

### Phase 11 acceptance

- [ ] Fresh machine installation succeeds.
- [ ] Uninstall instructions work.
- [ ] ZIP contains no forbidden files.
- [ ] SHA-256 checksum generated.
- [ ] Release binary is signed for commercial distribution.
- [ ] Documentation matches actual UI.

**Commit**

```bash
git add tools docs README.md CHANGELOG.md LICENSE.md
git commit -m "release: add clean packaging and release documentation"
```

---

# 8. Legacy JSX strategy

## `ASCII_PRO_v1.3.jsx`

Keep it only under `legacy/`.

Fix only critical safety issues if it remains available:

- Escape layer names before inserting into expressions.
- Do not use a fixed controller name.
- Replace name lookup with Layer Control where possible.
- Stop expression execution cleanly when source is missing.
- Prevent high-density grids from silently truncating.
- Calculate font size, leading, and tracking from grid geometry.
- Display a warning that it is slower and less reliable than the native effect.

Do not market it as the primary plugin.

## Original `ascii-toolkit.jsx`

Move generic AE utilities to a separate repository if they are worth keeping.

The final ASCII helper should not include unrelated workflow buttons because:

- It confuses the product’s purpose.
- It increases testing scope.
- “Remove all effects” can destroy user work.
- Generic tools do not improve the ASCII renderer.

---

# 9. Known current bugs and direct fixes

| Current issue | Direct solution |
|---|---|
| `.aex` suffix without complete AE resource integration | Base build on SDK Skeleton and add PiPL/resource compilation |
| Custom RGBA struct cast onto AE memory | Use `PF_Pixel8/16/Float` adapters |
| Fake procedural glyphs | Embedded open-licence bitmap atlas |
| Hue Shift visible but unused | Implement HSV transform or hide parameter |
| Saturation stored but unused | Apply saturation in colour pipeline |
| Alignment visible but unused | Implement in `GridLayout` |
| Rotation visible but unused | Inverse-map rotated grid |
| Quality visible but unused | Bind to sampling strategy |
| Anti-aliasing visible but unused | Nearest/bilinear glyph sampling |
| Hardcoded black cell backgrounds | Use selected background in all modes |
| Preset JSON never loaded | Ship `.ffx` presets and optional helper panel |
| Palette functions unused | Remove dead palette code or wire it into actual presets |
| Only 8-bpc legacy render | Smart Render plus 16/32 adapters |
| Weak “any non-black pixel” test | Unit + golden + manual AE matrix |
| Machine-specific build path | Repository-relative PowerShell scripts |
| Placeholder licence/contact text | Final licence and real support information |
| Multiple disconnected prototypes | Native effect as source of truth; archive legacy |
| Fixed JSX controller names | Layer controls or unique instance IDs |
| Unescaped JSX layer names | Escape backslash, quote, CR, and LF |
| Character grid capped at 30,000 silently | Compute supported maximum and show validation error |
| Source expression guard continues after failure | Use explicit branch returning valid value |

---

# 10. Recommended milestone sequence

## Milestone A — Loadable alpha

Deliverables:

- PiPL integration.
- Reproducible build.
- Correct 8-bit pixel adapter.
- Current renderer loads and runs.

Do not add new controls.

## Milestone B — Visually real beta

Deliverables:

- Real glyph atlas.
- Correct grid.
- Correct background and alpha.
- Core controls.
- 1080p and 4K tests.

Release only to a small tester group.

## Milestone C — Feature-complete release candidate

Deliverables:

- All controls.
- Smart Render.
- 16/32 bpc.
- Presets.
- Focused panel.
- CI and golden tests.

## Milestone D — v1.0

Deliverables:

- Performance pass.
- Compatibility matrix.
- Packaging.
- Signing.
- Final docs.
- No known P0/P1 bugs.

---

# 11. Bug severity policy

## P0 — Release blocker

- AE crashes.
- Plugin does not load.
- Memory corruption.
- Render Queue produces invalid output.
- Project cannot reopen.
- Data-destructive helper action.

## P1 — Must fix before public beta

- Wrong channel order.
- Broken alpha.
- Control does nothing.
- Viewer/render mismatch.
- Major output region missing.
- Multiple instances interfere.

## P2 — Must fix before v1

- Minor visual inconsistency.
- Preset mismatch.
- Poor error message.
- Documentation gap.
- Performance below target at extreme settings.

## P3 — Post-v1

- macOS support.
- GPU renderer.
- Online preset browser.
- Licensing dashboard.
- Premiere Pro port.
- Custom font import.

---

# 12. Instructions for an AI coding agent

Use the following execution rules when handing this document to Codex, Claude Code, or another coding agent.

## Agent operating rules

1. Work on one phase at a time.
2. Before editing, inspect the exact current files and Adobe SDK sample used by the local machine.
3. Do not claim plugin loading success without opening After Effects and verifying it.
4. Run host-independent tests after every renderer change.
5. Keep Adobe SDK headers outside Git.
6. Never expose an unimplemented effect parameter.
7. Do not modify legacy JSX while native build blockers remain.
8. Commit at each task boundary.
9. After every task, report:
   - Files changed.
   - Commands run.
   - Test output.
   - Remaining known limitations.
10. Stop and surface the exact compiler or AE loading error when blocked. Do not hide it behind a generic fallback.

## Copyable agent prompt

```text
You are completing the native After Effects plugin in this repository.

Read ASCII_PR_PRO_COMPLETION_PLAN.md fully before editing.

The native C++ plugin is the source of truth. The old expression-based JSX and
general ascii-toolkit are legacy and must not be expanded unless the current
task explicitly says so.

Implement only the next unchecked task. Use test-driven development:
1. Add or update a failing host-independent test where possible.
2. Run it and show the failure.
3. Make the smallest production change that solves the task.
4. Run all relevant tests.
5. Build the plugin when the task touches AE integration.
6. Report exact commands and results.
7. Commit with the message specified in the task.

Hard constraints:
- Never reinterpret AE pixels as a custom RGBA struct.
- Never expose a parameter whose behavior is not implemented.
- Never commit Adobe SDK files.
- Never replace real glyph rendering with procedural placeholders.
- Never claim AE compatibility without manual verification.
- Keep the renderer independent from Adobe SDK headers.
- Preserve alpha correctly using a documented straight/premultiplied policy.

Start with Phase 0, then Phase 1. Do not skip ahead to presets, UI, licensing,
or marketing.
```

---

# 13. Final release checklist

## Build

- [ ] Clean configure works.
- [ ] Clean Debug build works.
- [ ] Clean Release build works.
- [ ] `EffectMain` export exists.
- [ ] PiPL metadata is correct.
- [ ] No SDK files are committed.

## Render correctness

- [ ] Real recognizable glyphs.
- [ ] Correct RGB channel order.
- [ ] Correct premultiplied alpha.
- [ ] Correct transparent background.
- [ ] Correct character order.
- [ ] Correct colour modes.
- [ ] Correct alignment and rotation.
- [ ] Correct 8/16/32-bpc output.

## Stability

- [ ] Empty/missing frames do not crash.
- [ ] Extreme density does not divide by zero.
- [ ] Negative offsets remain safe.
- [ ] Multiple instances work.
- [ ] Save/reopen works.
- [ ] Undo/redo works.
- [ ] Render Queue works.
- [ ] Media Encoder tested.

## Performance

- [ ] Draft faster than Normal.
- [ ] Normal faster than High.
- [ ] 1080p target measured.
- [ ] 4K target measured.
- [ ] No memory growth over long render.

## UX

- [ ] Every visible control works.
- [ ] Controls grouped logically.
- [ ] Presets tested.
- [ ] Panel is focused.
- [ ] Error messages explain the corrective action.

## Packaging

- [ ] Final licence.
- [ ] Font licence.
- [ ] Third-party notices.
- [ ] Version synchronized.
- [ ] Changelog updated.
- [ ] Compatibility matrix complete.
- [ ] Release binary signed.
- [ ] Checksum generated.
- [ ] Clean-machine installation tested.
- [ ] Uninstallation tested.

---

# 14. Recommended immediate next action

Begin with **Phase 1, Task 1.1**:

1. Download the official AE SDK matching the installed After Effects version.
2. Build and load Adobe’s unmodified Skeleton effect sample.
3. Copy its working PiPL/resource integration into this repository.
4. Produce the first verified loadable `ASCII Character.aex`.

Do not replace the glyph renderer before the plugin reliably loads.  
Do not polish the panel before pixel handling is correct.  
Do not implement licensing before the output is visually and technically stable.

The shortest path to a real beta is:

```text
Loadable .aex
→ correct Adobe pixels
→ real glyph atlas
→ complete controls
→ Smart Render/deep colour
→ presets/panel
→ tests/performance
→ packaging
```
