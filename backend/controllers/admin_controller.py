from flask_restx import Namespace, Resource
from flask import request
from services.entity_service import EntityService

bp = Namespace(
    "admin/entities",
    description="Admin: full entity metadata management"
)

@bp.route("")
class EntityList(Resource):
    def get(self):
        """Return full metadata for all entities"""
        return EntityService.list_full(), 200

    def post(self):
        """Create entity with full definition"""
        payload = request.json
        EntityService.create_full(payload)
        return {"id": payload["id"]}, 201


@bp.route("/<string:entity_id>")
class Entity(Resource):
    def get(self, entity_id):
        entity = EntityService.get_full(entity_id)
        if not entity:
            return {"error": "Not found"}, 404
        return entity, 200

    def put(self, entity_id):
        payload = request.json
        EntityService.update_full(entity_id, payload)
        return {"status": "ok"}, 200

    def delete(self, entity_id):
        EntityService.delete(entity_id)
        return "", 204
