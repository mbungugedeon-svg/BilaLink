# backend/wsgi.py
# Point d'entrée pour un serveur de production (gunicorn, waitress, etc.),
# au lieu du serveur de développement intégré à Flask (app.run()), qui n'est
# pas conçu pour tenir une charge réelle ni pour être exposé publiquement.
#
# Lancement en production :
#   gunicorn -w 2 -b 0.0.0.0:$PORT wsgi:app
#
# (voir Procfile pour la commande utilisée automatiquement par la plupart
# des hébergeurs de type Render/Railway/Heroku)

from app import create_app

app = create_app()
