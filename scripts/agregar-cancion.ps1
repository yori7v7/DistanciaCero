param(
  [Parameter(Mandatory=$true)][string]$SectionId,
  [Parameter(Mandatory=$true)][string]$FilePath,
  [Parameter(Mandatory=$true)][string]$Title,
  [Parameter(Mandatory=$true)][string]$Artist,
  [double]$Volume = 0.7
)

$ErrorActionPreference = 'Stop'

# Validate the whole operation before creating directories or replacing audio.
$projectPath = (Get-Location).ProviderPath
if (-not (Test-Path -LiteralPath (Join-Path $projectPath 'package.json') -PathType Leaf)) {
  throw 'Ejecuta este script desde la raíz del proyecto.'
}
if ([string]::IsNullOrWhiteSpace($Title) -or [string]::IsNullOrWhiteSpace($Artist)) {
  throw 'El título y el artista deben contener texto.'
}
if ([double]::IsNaN($Volume) -or [double]::IsInfinity($Volume)) {
  throw 'El volumen debe ser un número finito.'
}
if ($SectionId -cnotmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$') {
  throw 'Usa el identificador exacto de una sección de sceneMusic.json.'
}
$source = Get-Item -LiteralPath $FilePath
if ($source.PSIsContainer) { throw 'El origen debe ser un archivo de audio.' }
if (($source.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'El archivo de audio origen no puede ser un enlace simbólico.' }
$extension = $source.Extension.ToLowerInvariant()
if ($extension -notin @('.mp3', '.wav', '.ogg', '.m4a')) {
  throw "Formato no recomendado: $extension. Usa .mp3, .wav, .ogg o .m4a."
}

$jsonPath = Join-Path $projectPath 'src/data/sceneMusic.json'
if (-not (Test-Path -LiteralPath $jsonPath -PathType Leaf)) { throw 'No encontré src/data/sceneMusic.json.' }
$previousJson = [System.IO.File]::ReadAllBytes($jsonPath)
try { $jsonText = ([System.Text.UTF8Encoding]::new($false, $true)).GetString($previousJson).TrimStart([char]0xFEFF) } catch { throw 'sceneMusic.json debe estar codificado en UTF-8. No se cambiaron archivos.' }
try {
  # Assign first: PS5.1 emits a JSON array as one pipeline object; PS7 enumerates it.
  $parsedJson = $jsonText | ConvertFrom-Json
  $data = @($parsedJson)
} catch { throw 'sceneMusic.json no contiene JSON válido. No se cambiaron archivos.' }
if (-not $jsonText.TrimStart().StartsWith('[')) { throw 'sceneMusic.json debe contener una lista de secciones.' }
$matchingScenes = @($data | Where-Object { $_.sectionId -is [string] -and $_.sectionId -ceq $SectionId })
if ($matchingScenes.Count -ne 1) { throw "No existe una única sección '$SectionId' en sceneMusic.json. No se cambiaron archivos." }

$destinationDirectory = [System.IO.Path]::GetFullPath((Join-Path $projectPath 'public/audio/scenes'))
$destinationPath = [System.IO.Path]::GetFullPath((Join-Path $destinationDirectory "$SectionId$extension"))
if (-not $destinationPath.StartsWith($destinationDirectory + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'El destino no está dentro de public/audio/scenes.'
}
if (Test-Path -LiteralPath $destinationPath -PathType Container) { throw 'El destino de audio corresponde a un directorio.' }
# A textual path inside the project must not write through a directory junction.
$directories = @((Join-Path $projectPath 'public'), (Join-Path $projectPath 'public/audio'), $destinationDirectory)
foreach ($path in @($directories) + @((Join-Path $projectPath 'src'), (Join-Path $projectPath 'src/data'), $destinationPath, $jsonPath)) {
  if (Test-Path -LiteralPath $path) {
    $item = Get-Item -LiteralPath $path -Force
    if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
      throw "El destino no puede ser un enlace o directorio redirigido: $path"
    }
  }
}
$scene = $matchingScenes[0]
$scene.title = $Title.Trim()
$scene.artist = $Artist.Trim()
$scene.src = "audio/scenes/$SectionId$extension"
$scene.volume = [Math]::Max([double]0, [Math]::Min([double]1, $Volume))
$newJson = ConvertTo-Json -InputObject $data -Depth 32
$utf8 = New-Object System.Text.UTF8Encoding($false)

$sameFile = [string]::Equals($source.FullName, $destinationPath, [System.StringComparison]::OrdinalIgnoreCase)
$audioExisted = Test-Path -LiteralPath $destinationPath -PathType Leaf
$previousAudio = $null
if ($audioExisted -and -not $sameFile) { $previousAudio = [System.IO.File]::ReadAllBytes($destinationPath) }
$previousAttributes = if ($audioExisted) { (Get-Item -LiteralPath $destinationPath -Force).Attributes } else { $null }
$audioAttempted = $false
$jsonAttempted = $false
try {
  foreach ($directory in $directories) {
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
      New-Item -ItemType Directory -Path $directory | Out-Null
    }
  }
  if (-not $sameFile) {
    $audioAttempted = $true
    Copy-Item -LiteralPath $source.FullName -Destination $destinationPath -Force
  }
  $jsonAttempted = $true
  [System.IO.File]::WriteAllText($jsonPath, $newJson + [Environment]::NewLine, $utf8)
} catch {
  $failure = $_.Exception.Message
  $recoveryErrors = New-Object 'System.Collections.Generic.List[string]'
  if ($audioAttempted) {
    try {
      if ($audioExisted) {
        if (Test-Path -LiteralPath $destinationPath) {
          [System.IO.File]::SetAttributes($destinationPath, [System.IO.FileAttributes]::Normal)
        }
        [System.IO.File]::WriteAllBytes($destinationPath, [byte[]]$previousAudio)
        [System.IO.File]::SetAttributes($destinationPath, $previousAttributes)
      } elseif (Test-Path -LiteralPath $destinationPath) {
        Remove-Item -LiteralPath $destinationPath -Force
      }
    } catch { $recoveryErrors.Add('audio') }
  }
  if ($jsonAttempted) {
    try {
      # A blocked write can leave JSON intact. Preserve its exact bytes and BOM.
      $currentJson = [System.IO.File]::ReadAllBytes($jsonPath)
      $unchanged = $currentJson.Length -eq $previousJson.Length
      for ($index = 0; $unchanged -and $index -lt $currentJson.Length; $index++) {
        if ($currentJson[$index] -ne $previousJson[$index]) { $unchanged = $false }
      }
      if (-not $unchanged) { [System.IO.File]::WriteAllBytes($jsonPath, $previousJson) }
    } catch { $recoveryErrors.Add('sceneMusic.json') }
  }
  if ($recoveryErrors.Count -gt 0) {
    throw "No se pudo agregar la canción y la recuperación quedó incompleta ($($recoveryErrors -join ', ')). Conserva tus archivos originales. Error: $failure"
  }
  throw "No se pudo agregar la canción. Se conservaron el audio y la configuración anteriores. Error: $failure"
}

Write-Host 'Canción agregada correctamente.' -ForegroundColor Green
Write-Host "Sección: $SectionId"
Write-Host "Archivo: $destinationPath"
Write-Host 'Ahora corre: npm run dev'
