# ASCII Character

ASCII Character is a native Adobe After Effects effect plugin that converts
footage into a luminance-driven ASCII character render.

This repository is Windows-first and structured for the official Adobe After
Effects C++ SDK. The first MVP implements an 8-bit renderer and documents the
path to 16-bit, 32-bit, SmartFX checkout, bundled glyph atlas rendering, and
commercial packaging.

## Current Status

- Native AE SDK effect entry point scaffold: present.
- Frame-by-frame 8-bit ASCII render core: present.
- Exact `.aex` build: requires the Adobe After Effects SDK and Visual Studio.
- DaVinci `.drfx` source reuse: none.

## Build

See [docs/build-instructions.md](docs/build-instructions.md).
