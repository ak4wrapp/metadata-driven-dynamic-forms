from flask_restx import Namespace, Resource
from flask import request
from services.entity_service import EntityService
from services.column_service import ColumnService
from services.field_service import FieldService

bp = Namespace(
    "admin",
    description="Admin: manage entities, columns, and fields"
)

# ---------------- Entities ----------------

@bp.route("/")
class EntityList(Resource):
    def get(self):
        """List all entities (admin view)"""
        return EntityService.list(), 200

    def post(self):
        """Create a new entity"""
        return {"id": EntityService.create(request.json)}, 201

@bp.route("/full")
class EntityFullList(Resource):
    def get(self):
        """
        Admin-only: full dump of all entities and schema
        Useful for AG Grid, schema inspectors, debugging.
        """
        return EntityService.list_full(), 200
    
@bp.route("/<string:entity_id>/full")
class EntityFull(Resource):
    def get(self, entity_id):
        """
        Admin-only full entity schema
        """
        entity = EntityService.get_full(entity_id)
        if not entity:
            return {"error": "Entity not found"}, 404
        return entity, 200

@bp.route("/<string:entity_id>")
class Entity(Resource):
    def get(self, entity_id):
        entity = EntityService.get(entity_id)
        if not entity:
            return {"error": "Entity not found"}, 404
        return entity, 200

    def put(self, entity_id):
        EntityService.update(entity_id, request.json)
        return {"status": "ok"}, 200

    def delete(self, entity_id):
        EntityService.delete(entity_id)
        return {"status": "deleted"}, 204


# ---------------- Columns ----------------

@bp.route("/<string:entity_id>/columns")
class ColumnList(Resource):
    def get(self, entity_id):
        return ColumnService.list(entity_id), 200

    def post(self, entity_id):
        column_id = ColumnService.create(entity_id, request.json)
        return {"id": column_id}, 201


@bp.route("/<string:entity_id>/columns/<int:column_id>")
class Column(Resource):
    def put(self, entity_id, column_id):
        ColumnService.update(entity_id, column_id, request.json)
        return {"status": "ok"}, 200

    def delete(self, entity_id, column_id):
        ColumnService.delete(entity_id, column_id)
        return {"status": "deleted"}, 204


# ---------------- Fields ----------------

@bp.route("/<string:entity_id>/fields")
class FieldList(Resource):
    def get(self, entity_id):
        return FieldService.list(entity_id), 200

    def post(self, entity_id):
        field_id = FieldService.create(entity_id, request.json)
        return {"id": field_id}, 201


@bp.route("/<string:entity_id>/fields/<int:field_id>")
class Field(Resource):
    def put(self, entity_id, field_id):
        FieldService.update(entity_id, field_id, request.json)
        return {"status": "ok"}, 200

    def delete(self, entity_id, field_id):
        FieldService.delete(entity_id, field_id)
        return {"status": "deleted"}, 204
