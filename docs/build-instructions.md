# Build Instructions

## Requirements

- Windows 10 or 11.
- Visual Studio 2022 with Desktop development with C++.
- CMake 3.22 or newer.
- Adobe After Effects installed.
- Official Adobe After Effects SDK downloaded from Adobe.

## Configure

1. Download and extract the After Effects SDK, for example:

   ```text
   C:\SDKs\Adobe\AfterEffectsSDK
   ```

2. Open "Developer PowerShell for VS 2022".

3. Configure the project:

   ```powershell
   cd <path-to-repository-root>
   cmake -S . -B build -G "Visual Studio 17 2022" -A x64 -DAE_SDK_ROOT="C:\SDKs\Adobe\AfterEffectsSDK"
   ```

## Build Debug

```powershell
cmake --build build --config Debug
```

The generated file should be under:

```text
build\Debug\ASCIICharacter.aex
```

## Build Release

```powershell
cmake --build build --config Release
```

The generated file should be under:

```text
build\Release\ASCIICharacter.aex
```

## Install In After Effects

1. Close After Effects.
2. Copy the `.aex` to one of these plugin folders:

   ```text
   C:\Program Files\Adobe\Adobe After Effects 2026\Support Files\Plug-ins\ASCII Character\
   ```

   or the shared MediaCore folder:

   ```text
   C:\Program Files\Adobe\Common\Plug-ins\7.0\MediaCore\ASCII Character\
   ```

3. Start After Effects.
4. Create or open a composition.
5. Apply the effect from the Effects menu. The expected display name is
   `ASCII Character`.

## Current Build Limitation

This repository does not include Adobe SDK headers or PiPL resources. If your
SDK version requires a PiPL `.r` resource file, add it following the SDK sample
project closest to your installed AE version, then keep the same match name:

```text
com.codex.ascii-character
```
