from flask import Flask
from flask_cors import CORS
from flask_restx import Api

from controllers.admin_entities import bp as admin_entities_bp
from controllers.user_records import bp as user_records_bp
from controllers.health import bp as health_check_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    api = Api(app, doc="/docs")  # Swagger UI at /docs

    # Add namespaces
    api.add_namespace(admin_entities_bp, path="/admin/entities")
    api.add_namespace(user_records_bp, path="/api")
    api.add_namespace(health_check_bp, path="/health")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=3000, debug=True)
