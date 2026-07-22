# backend/run.ps1
# Lance BilaLink en local sur Windows, sans jamais avoir à taper $env:SECRET_KEY.
#
# La première fois, ce script génère une clé secrète et la sauvegarde dans
# un fichier local ".secret_key" (jamais envoyé sur Git — voir .gitignore).
# Les fois suivantes, il réutilise la même clé automatiquement.
#
# Utilisation : ouvre PowerShell dans le dossier backend/ et tape simplement
#     .\run.ps1
#
# Si Windows bloque l'exécution de scripts, lance d'abord (une seule fois) :
#     Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

$ErrorActionPreference = "Stop"
$secretFile = Join-Path $PSScriptRoot ".secret_key"

if (-not (Test-Path $secretFile)) {
    Write-Host "Première génération d'une clé secrète locale..."
    $key = python -c "import secrets; print(secrets.token_hex(32))"
    Set-Content -Path $secretFile -Value $key -NoNewline
}

$env:SECRET_KEY   = (Get-Content $secretFile -Raw).Trim()
$env:FORCE_HTTPS  = "0"   # on est en local en HTTP simple, pas derrière un vrai HTTPS
$env:FLASK_DEBUG  = "0"   # jamais de debug ici : on veut tester comme en vraie prod

Write-Host "🚀 Démarrage de BilaLink sur http://localhost:5000 ..."
python app.py
