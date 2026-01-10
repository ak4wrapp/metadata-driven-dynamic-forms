from flask_restx import Namespace, Resource
from flask import request
from services.record_service import RecordService

bp = Namespace("user_records", description="User records operations")

@bp.route('/<string:entity_id>')
class RecordList(Resource):
    def get(self, entity_id):
        """List all records for an entity"""
        return RecordService.list(entity_id)

    def post(self, entity_id):
        """Create a record for an entity"""
        return RecordService.create(entity_id, request.json)

@bp.route('/<string:entity_id>/<string:record_id>')
class Record(Resource):
    def put(self, entity_id, record_id):
        """Update a record"""
        return RecordService.update(entity_id, record_id, request.json)

    def delete(self, entity_id, record_id):
        """Delete a record"""
        return RecordService.delete(entity_id, record_id)
