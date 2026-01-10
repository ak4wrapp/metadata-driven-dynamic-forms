from flask_restx import Namespace, Resource
from services.entity_service import EntityService

bp = Namespace(
    "entity_meta",
    description="Runtime metadata for forms and tables"
)

@bp.route("/")
class EntityMetaList(Resource):
    def get(self):
        """
        List entities available to the frontend
        """
        return EntityService.list(), 200


@bp.route("/<string:entity_id>")
class EntityMeta(Resource):
    def get(self, entity_id):
        """
        Get full metadata for a single entity
        """
        meta = EntityService.get_full(entity_id)
        if not meta:
            return {"error": "Entity not found"}, 404
        return meta, 200
