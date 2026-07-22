#!/usr/bin/env bash
# backend/run.sh
# Équivalent Mac/Linux de run.ps1 : génère et réutilise une clé secrète locale
# automatiquement, pour ne jamais avoir à taper "export SECRET_KEY=...".
#
# Utilisation :
#   cd backend
#   chmod +x run.sh   (une seule fois)
#   ./run.sh

set -e
cd "$(dirname "$0")"

if [ ! -f .secret_key ]; then
  echo "Première génération d'une clé secrète locale..."
  python3 -c "import secrets; print(secrets.token_hex(32))" > .secret_key
fi

export SECRET_KEY=$(cat .secret_key)
export FORCE_HTTPS=0
export FLASK_DEBUG=0

echo "🚀 Démarrage de BilaLink sur http://localhost:5000 ..."
python3 app.py
