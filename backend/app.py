import os
import shutil
import subprocess
from flask import Flask, Response, json
from flask_cors import CORS
from flask_restx import Api

from controllers.admin_controller import bp as admin_bp
from controllers.entity_controller import bp as entity_bp
from controllers.data_controller import bp as data_bp
from controllers.health_controller import bp as health_check_bp

# Helper functions
def to_camel_case(snake_str):
    parts = snake_str.split('_')
    return parts[0] + ''.join(word.capitalize() for word in parts[1:])

def convert_keys_to_camel_case(obj):
    if isinstance(obj, list):
        return [convert_keys_to_camel_case(i) for i in obj]
    elif isinstance(obj, dict):
        return {to_camel_case(k): convert_keys_to_camel_case(v) for k, v in obj.items()}
    else:
        return obj

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Path to your database file
    DB_FILE = "metadata.db"

    # Determine which python command is available
    python_cmd = shutil.which("python3") or shutil.which("python")
    if not python_cmd:
        raise RuntimeError("No Python interpreter found!")

    # Check if the database exists
    if not os.path.exists(DB_FILE):
        print(f"{DB_FILE} not found. Initializing database and seeding data...")
        # Run init.db.py
        subprocess.run([python_cmd, "init_db.py"], check=True)
        # Run seed_data.py
        subprocess.run([python_cmd, "seed_data.py"], check=True)
        print("Database created and seeded!")

    # Your existing Flask routes
    @app.route("/")
    def home():
        return "Hello, Flask is running!"

    # Swagger API
    api = Api(app, doc="/docs")

    # Add namespaces
    api.add_namespace(admin_bp, path="/api/admin/entities")
    api.add_namespace(entity_bp, path="/api/entity")
    api.add_namespace(data_bp, path="/api/data")
    api.add_namespace(health_check_bp, path="/health")

    # After request hook - must be registered **after app is created**
    @app.after_request
    def camel_case_response(response: Response):
        try:
            if response.content_type == "application/json":
                data = json.loads(response.get_data())
                camel_data = convert_keys_to_camel_case(data)
                response.set_data(json.dumps(camel_data))
        except Exception:
            pass
        return response

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5050, debug=True)

