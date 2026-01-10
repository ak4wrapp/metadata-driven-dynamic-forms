from flask import Flask
from flask_cors import CORS
from flask_restx import Api

from controllers.admin import bp as admin_bp
from controllers.entity import bp as entity_bp
from controllers.data import bp as data_bp
from controllers.health import bp as health_check_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    api = Api(app, doc="/docs")  # Swagger UI at /docs

    # Add namespaces
    api.add_namespace(admin_bp, path="/admin")
    api.add_namespace(entity_bp, path="/api/entity")
    api.add_namespace(data_bp, path="/api/data")
    api.add_namespace(health_check_bp, path="/health")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=3000, debug=True)
