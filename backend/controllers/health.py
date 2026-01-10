from flask_restx import Namespace, Resource

bp = Namespace("health", description="Health check endpoints")

@bp.route('/')
class HealthCheck(Resource):
    def get(self):
        """API health check"""
        return {"status": "ok"}
