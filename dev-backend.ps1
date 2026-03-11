# dev-backend.ps1
# This script runs the Flask backend with auto-reload enabled.
$env:FLASK_APP="backend.app"
$env:FLASK_DEBUG="1"
flask run --port 5001
