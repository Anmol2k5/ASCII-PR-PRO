param(
    [Parameter(Mandatory=$true)]
    [string]$BuiltAex,
    [string]$OutDir = "$PSScriptRoot\..\release"
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
Copy-Item -LiteralPath $BuiltAex -Destination (Join-Path $OutDir "ASCII Character.aex") -Force
Copy-Item -LiteralPath "$PSScriptRoot\..\README.md" -Destination $OutDir -Force
Copy-Item -LiteralPath "$PSScriptRoot\..\LICENSE.md" -Destination $OutDir -Force
Compress-Archive -Path (Join-Path $OutDir "*") -DestinationPath (Join-Path $OutDir "ASCII-Character-AE-Windows.zip") -Force
Write-Host "Packaged release at $OutDir"
