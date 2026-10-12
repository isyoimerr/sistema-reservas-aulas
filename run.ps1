$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$phpCommand = Get-Command php -ErrorAction SilentlyContinue

if ($phpCommand) {
    $phpPath = $phpCommand.Source
} else {
    $candidates = @(
        "C:\xampp\php\php.exe",
        "C:\wamp64\bin\php\php.exe"
    )

    $phpPath = $null
    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            $phpPath = $candidate
            break
        }
    }
}

if (-not $phpPath) {
    Write-Error "PHP no está instalado o no está disponible en PATH. Instálalo o agrega la ruta de XAMPP/WAMP."
    exit 1
}

Write-Host "Ejecutando proyecto desde: $projectPath"
& $phpPath -S localhost:8000 -t $projectPath
