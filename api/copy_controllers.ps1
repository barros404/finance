# Script para copiar os controladores para o diretório correto
$sourceDir = "$PSScriptRoot\controllers\tesouraria"
$destDir = "$PSScriptRoot\src\controllers\tesouraria"

# Garante que o diretório de destino existe
if (-not (Test-Path -Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

# Copia os arquivos
Get-ChildItem -Path $sourceDir -Filter "*.js" | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $destDir -Force
    Write-Host "Copiado: $($_.Name) para $destDir"
}

Write-Host "Cópia concluída!"
