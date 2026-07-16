# tools/install-local.ps1
param(
    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Debug",
    [string]$AeVersion = "2024"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot

# Check standard multi-config path first
$BuiltPlugin = Join-Path $RepoRoot "build\$Configuration\ASCIICharacter.aex"
if (!(Test-Path $BuiltPlugin)) {
    # Fall back to single-config output path
    $BuiltPlugin = Join-Path $RepoRoot "build\ASCIICharacter.aex"
}

$Destination = "C:\Program Files\Adobe\Adobe After Effects $AeVersion\Support Files\Plug-ins\ASCII Character"

if (!(Test-Path $BuiltPlugin)) {
    throw "Plugin not found: $BuiltPlugin"
}

New-Item -ItemType Directory -Force -Path $Destination | Out-Null
Copy-Item $BuiltPlugin (Join-Path $Destination "ASCII Character.aex") -Force
Write-Host "Installed to $Destination"
