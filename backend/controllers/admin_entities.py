from flask_restx import Namespace, Resource
from flask import request
from services.entity_service import EntityService
from services.column_service import ColumnService
from services.field_service import FieldService

bp = Namespace("admin_entities", description="Admin entities operations")

# ---------------- Entities ----------------
@bp.route('/')
class EntityList(Resource):
    def get(self):
        """List all entities"""
        return EntityService.list()

    def post(self):
        """Create a new entity"""
        return EntityService.create(request.json)

@bp.route('/full')
class EntityFull(Resource):
    def get(self):
        """List all entities with columns and fields"""
        return EntityService.list_full()
    
@bp.route('/<string:entity_id>')
class Entity(Resource):
    def get(self, entity_id):
        """Get single entity"""
        return EntityService.get(entity_id)

    def put(self, entity_id):
        """Update an entity"""
        return EntityService.update(entity_id, request.json)

    def delete(self, entity_id):
        """Delete an entity"""
        return EntityService.delete(entity_id)

# ---------------- Columns ----------------
@bp.route('/<string:entity_id>/columns')
class ColumnList(Resource):
    def get(self, entity_id):
        return ColumnService.list(entity_id)

    def post(self, entity_id):
        return ColumnService.create(entity_id, request.json)

@bp.route('/<string:entity_id>/columns/<int:column_id>')
class Column(Resource):
    def put(self, entity_id, column_id):
        return ColumnService.update(entity_id, column_id, request.json)

    def delete(self, entity_id, column_id):
        return ColumnService.delete(entity_id, column_id)

# ---------------- Fields ----------------
@bp.route('/<string:entity_id>/fields')
class FieldList(Resource):
    def get(self, entity_id):
        return FieldService.list(entity_id)

    def post(self, entity_id):
        return FieldService.create(entity_id, request.json)

@bp.route('/<string:entity_id>/fields/<int:field_id>')
class Field(Resource):
    def put(self, entity_id, field_id):
        return FieldService.update(entity_id, field_id, request.json)

    def delete(self, entity_id, field_id):
        return FieldService.delete(entity_id, field_id)
