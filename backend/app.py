from flask import Flask, Response, json
from flask_cors import CORS
from flask_restx import Api

from controllers.admin import bp as admin_bp
from controllers.entity import bp as entity_bp
from controllers.data import bp as data_bp
from controllers.health import bp as health_check_bp

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

    # Swagger API
    api = Api(app, doc="/docs")

    # Add namespaces
    api.add_namespace(admin_bp, path="/admin")
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
    app.run(host="0.0.0.0", port=3000, debug=True)
