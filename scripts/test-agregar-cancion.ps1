# Isolated regression harness; no Pester dependency and no project data changes.
$ErrorActionPreference = 'Stop'
$scriptPath = Join-Path $PSScriptRoot 'agregar-cancion.ps1'
$originalLocation = (Get-Location).ProviderPath
$tempParent = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$testRoot = Join-Path $tempParent ('distancia-cero-song-tests-' + [guid]::NewGuid().ToString('N'))
$utf8 = New-Object System.Text.UTF8Encoding($false)
$passed = 0

function Assert-True([bool]$Condition, [string]$Message) {
  if (-not $Condition) { throw $Message }
}
function New-Fixture([string]$Name) {
  $root = Join-Path $testRoot $Name
  New-Item -ItemType Directory -Path (Join-Path $root 'src/data') -Force | Out-Null
  New-Item -ItemType Directory -Path (Join-Path $root 'public/audio/scenes') -Force | Out-Null
  [System.IO.File]::WriteAllText((Join-Path $root 'package.json'), '{}', $utf8)
  [System.IO.File]::WriteAllText((Join-Path $root 'src/data/sceneMusic.json'), '[{"sectionId":"inicio","title":"Anterior","artist":"Artista","src":"audio/scenes/inicio.mp3","volume":0.5},{"sectionId":"historia","title":"Conservar","artist":"Otro","src":"","volume":0.7}]', $utf8)
  [System.IO.File]::WriteAllBytes((Join-Path $root 'source [1].mp3'), [byte[]](1, 2, 3, 4))
  return $root
}
function Snapshot([string]$Root) {
  $files = @(Get-ChildItem -LiteralPath $Root -Recurse -File | Sort-Object FullName)
  return (($files | ForEach-Object { $_.FullName + ':' + (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash }) -join "`n")
}
function Invoke-Add([string]$Root, [hashtable]$Changes = @{}) {
  $parameters = @{ SectionId = 'inicio'; FilePath = (Join-Path $Root 'source [1].mp3'); Title = ' Mi canción '; Artist = ' Artista '; Volume = 0.8 }
  foreach ($key in $Changes.Keys) { $parameters[$key] = $Changes[$key] }
  Push-Location -LiteralPath $Root
  try { & $scriptPath @parameters | Out-Null } finally { Pop-Location }
}
function Assert-FailsWithoutChanges([string]$Root, [hashtable]$Changes, [string]$ExpectedMessage = '') {
  $before = Snapshot $Root
  $failed = $false
  $message = ''
  try { Invoke-Add $Root $Changes } catch { $failed = $true; $message = $_.Exception.Message }
  Assert-True $failed 'La operación inválida debió fallar.'
  if ($ExpectedMessage) { Assert-True ($message.Contains($ExpectedMessage)) "Mensaje inesperado: $message" }
  Assert-True ((Snapshot $Root) -ceq $before) 'Una operación inválida modificó archivos.'
}

try {
  New-Item -ItemType Directory -Path $testRoot | Out-Null
  $root = New-Fixture 'unknown-section'
  [System.IO.File]::WriteAllBytes((Join-Path $root 'public/audio/scenes/inicio-.mp3'), [byte[]](90, 91))
  Assert-FailsWithoutChanges $root @{ SectionId = 'inicio/' }
  Assert-FailsWithoutChanges $root @{ SectionId = 'inexistente' }
  Assert-FailsWithoutChanges $root @{ SectionId = 'INICIO' }
  $passed++

  $root = New-Fixture 'damaged-json'
  [System.IO.File]::WriteAllBytes((Join-Path $root 'public/audio/scenes/inicio.mp3'), [byte[]](90, 91))
  [System.IO.File]::WriteAllText((Join-Path $root 'src/data/sceneMusic.json'), '{JSON roto', $utf8)
  Assert-FailsWithoutChanges $root @{}
  $passed++

  $root = New-Fixture 'invalid-input'
  foreach ($changes in @(@{ Title = '   ' }, @{ Artist = ' ' }, @{ Volume = [double]::NaN }, @{ Volume = [double]::PositiveInfinity }, @{ FilePath = (Join-Path $root 'missing.mp3') }, @{ FilePath = (Join-Path $root 'package.json') }, @{ FilePath = (Join-Path $root 'public') })) {
    Assert-FailsWithoutChanges $root $changes
  }
  $passed++

  $root = New-Fixture 'valid'
  $sourceHash = (Get-FileHash -LiteralPath (Join-Path $root 'source [1].mp3')).Hash
  Invoke-Add $root
  $data = Get-Content -LiteralPath (Join-Path $root 'src/data/sceneMusic.json') -Raw -Encoding UTF8 | ConvertFrom-Json
  $data = @($data)
  Assert-True ($data.Count -eq 2 -and $data[0].title -ceq 'Mi canción' -and $data[0].artist -ceq 'Artista' -and $data[0].volume -eq 0.8) 'No se guardaron los datos normalizados.'
  Assert-True ($data[1].title -ceq 'Conservar' -and $data[1].src -ceq '') 'Se alteró otra sección.'
  Assert-True ((Get-FileHash -LiteralPath (Join-Path $root 'source [1].mp3')).Hash -ceq $sourceHash) 'Se alteró el archivo fuente.'
  Assert-True ((Get-FileHash -LiteralPath (Join-Path $root 'public/audio/scenes/inicio.mp3')).Hash -ceq $sourceHash) 'La copia no coincide con la fuente.'
  Invoke-Add $root @{ Volume = -5 }
  $data = Get-Content -LiteralPath (Join-Path $root 'src/data/sceneMusic.json') -Raw -Encoding UTF8 | ConvertFrom-Json
  $data = @($data)
  Assert-True ($data[0].volume -eq 0) 'No se conservó el clamp inferior.'
  Invoke-Add $root @{ Volume = 5 }
  $data = Get-Content -LiteralPath (Join-Path $root 'src/data/sceneMusic.json') -Raw -Encoding UTF8 | ConvertFrom-Json
  $data = @($data)
  Assert-True ($data[0].volume -eq 1) 'No se conservó el clamp superior.'
  $passed++

  $root = New-Fixture 'same-file'
  $audio = Join-Path $root 'public/audio/scenes/inicio.mp3'
  [System.IO.File]::WriteAllBytes($audio, [byte[]](7, 8, 9))
  $before = (Get-FileHash -LiteralPath $audio).Hash
  Invoke-Add $root @{ FilePath = $audio }
  Assert-True ((Get-FileHash -LiteralPath $audio).Hash -ceq $before) 'Origen=destino alteró el audio.'
  $passed++

  foreach ($existing in @($false, $true)) {
    $root = New-Fixture ('json-write-failure-' + $existing)
    $audio = Join-Path $root 'public/audio/scenes/inicio.mp3'
    if ($existing) { [System.IO.File]::WriteAllBytes($audio, [byte[]](20, 21, 22)) }
    $json = Join-Path $root 'src/data/sceneMusic.json'
    [System.IO.File]::SetAttributes($json, [System.IO.FileAttributes]::ReadOnly)
    try { Assert-FailsWithoutChanges $root @{} 'Se conservaron el audio y la configuración anteriores.' } finally { [System.IO.File]::SetAttributes($json, [System.IO.FileAttributes]::Normal) }
    $passed++
  }
  Write-Host "$passed grupos aprobados; fixtures aislados, sin modificar el proyecto."
} finally {
  Set-Location -LiteralPath $originalLocation
  $resolved = [System.IO.Path]::GetFullPath($testRoot)
  $parent = $tempParent.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
  if (-not $resolved.StartsWith($parent, [System.StringComparison]::OrdinalIgnoreCase) -or (Split-Path -Leaf $resolved) -notlike 'distancia-cero-song-tests-*') {
    throw 'Se rechazó la limpieza fuera del directorio temporal de pruebas.'
  }
  if (Test-Path -LiteralPath $resolved -PathType Container) {
    Get-ChildItem -LiteralPath $resolved -Recurse -File | ForEach-Object { [System.IO.File]::SetAttributes($_.FullName, [System.IO.FileAttributes]::Normal) }
    Remove-Item -LiteralPath $resolved -Recurse -Force
  }
}
