import os
import sys

# Add the current directory to sys.path so we can import backend as a package
sys.path.append(os.getcwd())

from backend.app import create_app

app = create_app()
print("-" * 50)
for rule in app.url_map.iter_rules():
    print(f"{rule.endpoint}: {rule.rule} [{', '.join(rule.methods)}]")
print("-" * 50)
