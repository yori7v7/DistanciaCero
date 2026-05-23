param(
  [Parameter(Mandatory=$true)]
  [string]$SectionId,

  [Parameter(Mandatory=$true)]
  [string]$FilePath,

  [Parameter(Mandatory=$true)]
  [string]$Title,

  [Parameter(Mandatory=$true)]
  [string]$Artist,

  [double]$Volume = 0.7
)

$ErrorActionPreference = "Stop"

if (!(Test-Path "package.json")) {
  throw "Ejecuta este script desde la raíz del proyecto."
}

if (!(Test-Path $FilePath)) {
  throw "No encontré el archivo de audio: $FilePath"
}

$jsonPath = "src\data\sceneMusic.json"

if (!(Test-Path $jsonPath)) {
  throw "No encontré $jsonPath"
}

New-Item -ItemType Directory -Force -Path "public\audio\scenes" | Out-Null

$extension = [System.IO.Path]::GetExtension($FilePath).ToLower()

if ($extension -notin @(".mp3", ".wav", ".ogg", ".m4a")) {
  throw "Formato no recomendado: $extension. Usa mejor .mp3, .wav, .ogg o .m4a."
}

$safeSection = $SectionId.ToLower() -replace '[^a-z0-9\-]', '-'
$destName = "$safeSection$extension"
$destPath = "public\audio\scenes\$destName"

Copy-Item $FilePath $destPath -Force

$data = Get-Content $jsonPath -Raw | ConvertFrom-Json
$found = $false

foreach ($scene in $data) {
  if ($scene.sectionId -eq $SectionId) {
    $scene.title = $Title
    $scene.artist = $Artist
    $scene.src = "audio/scenes/$destName"
    $scene.volume = [Math]::Max(0, [Math]::Min(1, $Volume))
    $found = $true
  }
}

if (!$found) {
  throw "No existe la sección '$SectionId' en sceneMusic.json"
}

$data | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $jsonPath

Write-Host ""
Write-Host "Canción agregada correctamente." -ForegroundColor Green
Write-Host "Sección: $SectionId" -ForegroundColor Cyan
Write-Host "Archivo copiado a: $destPath" -ForegroundColor Cyan
Write-Host "Título: $Title" -ForegroundColor Cyan
Write-Host "Artista: $Artist" -ForegroundColor Cyan
Write-Host "Volumen base: $Volume" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ahora corre: npm run dev" -ForegroundColor Yellow
