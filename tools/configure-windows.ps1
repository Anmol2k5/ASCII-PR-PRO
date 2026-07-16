# tools/configure-windows.ps1
param(
    [string]$AeSdkRoot = "",
    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Debug"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot

# Load Visual Studio compiler environment if cl.exe is not in PATH
if (!(Get-Command "cl.exe" -ErrorAction SilentlyContinue)) {
    $VcVarsPath = "C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\VC\Auxiliary\Build\vcvarsall.bat"
    if (Test-Path $VcVarsPath) {
        Write-Host "Loading Visual Studio compiler environment from $VcVarsPath..."
        cmd.exe /c "call `"$VcVarsPath`" x64 && set" | Foreach-Object {
            if ($_ -match "^([^=]+)=(.*)$") {
                [System.Environment]::SetEnvironmentVariable($Matches[1], $Matches[2])
            }
        }
    } else {
        Write-Warning "Visual Studio compiler environment script (vcvarsall.bat) not found at expected path: $VcVarsPath"
    }
}

# Default to the workspace SDK folder if not specified
if ([string]::IsNullOrEmpty($AeSdkRoot)) {
    $AeSdkRoot = Join-Path $RepoRoot "AfterEffectsSDK"
}

$BuildDir = Join-Path $RepoRoot "build"

# Use absolute path to cmake if not in PATH
$CmakePath = "cmake"
if (!(Get-Command "cmake" -ErrorAction SilentlyContinue)) {
    $CmakePath = "C:\Program Files\CMake\bin\cmake.exe"
}

# Ensure the build configuration is set
# For NMake Makefiles, CMAKE_BUILD_TYPE should be set
Write-Host "Configuring build using SDK at: $AeSdkRoot"
& $CmakePath -S $RepoRoot -B $BuildDir `
    -G "NMake Makefiles" `
    -DCMAKE_BUILD_TYPE=$Configuration `
    -DAE_SDK_ROOT="$AeSdkRoot" `
    -DASCII_CHARACTER_BUILD_PLUGIN=ON `
    -DASCII_CHARACTER_BUILD_TESTS=ON

Write-Host "Building target configuration: $Configuration"
& $CmakePath --build $BuildDir --config $Configuration
