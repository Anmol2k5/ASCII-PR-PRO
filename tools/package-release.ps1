# package-release.ps1
# Automates the packaging of ASCII PR PRO release ZIP.

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$StagingDir = Join-Path $RepoRoot "build\staging"
$ReleaseZip = Join-Path $RepoRoot "build\ASCII-PR-PRO-v1.0.0.zip"

# Create clean staging directory
if (Test-Path $StagingDir) {
    Remove-Item $StagingDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $StagingDir | Out-Null

# 1. Locate and copy the built plugin binary
$BuiltPluginPaths = @(
    (Join-Path $RepoRoot "build\ASCIICharacter.aex"),
    (Join-Path $RepoRoot "build\Release\ASCIICharacter.aex")
)

$PluginSource = $null
foreach ($Path in $BuiltPluginPaths) {
    if (Test-Path $Path) {
        $PluginSource = $Path
        break
    }
}

if ($null -eq $PluginSource) {
    throw "Plugin binary ASCIICharacter.aex not found in build directories. Please run a Release build first."
}

$PluginDestDir = Join-Path $StagingDir "plugin"
New-Item -ItemType Directory -Force -Path $PluginDestDir | Out-Null
Copy-Item $PluginSource (Join-Path $PluginDestDir "ASCII Character.aex") -Force

# 2. Copy the ScriptUI panel files
$PanelDestDir = Join-Path $StagingDir "panel"
New-Item -ItemType Directory -Force -Path $PanelDestDir | Out-Null
Copy-Item (Join-Path $RepoRoot "panel\ASCII PRO.jsx") $PanelDestDir -Force
Copy-Item (Join-Path $RepoRoot "panel\README.md") (Join-Path $PanelDestDir "README_panel.md") -Force

# 3. Copy presets
$PresetsDestDir = Join-Path $StagingDir "presets"
New-Item -ItemType Directory -Force -Path $PresetsDestDir | Out-Null
Copy-Item (Join-Path $RepoRoot "assets\presets\presets_guide.md") $PresetsDestDir -Force

# 4. Copy root documentation and licenses
Copy-Item (Join-Path $RepoRoot "LICENSE.md") $StagingDir -Force
Copy-Item (Join-Path $RepoRoot "CHANGELOG.md") $StagingDir -Force
Copy-Item (Join-Path $RepoRoot "README.md") $StagingDir -Force

# 5. Copy user manuals
$DocsDestDir = Join-Path $StagingDir "docs"
New-Item -ItemType Directory -Force -Path $DocsDestDir | Out-Null
$Manuals = @("user-guide.md", "installation.md")
foreach ($Manual in $Manuals) {
    Copy-Item (Join-Path $RepoRoot "docs\$Manual") $DocsDestDir -Force
}

# Create Zip archive
if (Test-Path $ReleaseZip) {
    Remove-Item $ReleaseZip -Force
}
Compress-Archive -Path "$StagingDir\*" -DestinationPath $ReleaseZip -Force

Write-Host "=========================================="
Write-Host "Successfully packaged release archive to:"
Write-Host $ReleaseZip
Write-Host "=========================================="
