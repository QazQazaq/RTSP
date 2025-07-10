from flask import Blueprint, request, jsonify
from utils.db import mongo
from bson import ObjectId

overlays_bp = Blueprint('overlays', __name__)

@overlays_bp.route('/api/overlays', methods=['GET'])
def get_overlays():
    overlays = list(mongo.db.overlays.find())
    for o in overlays:
        o['_id'] = str(o['_id'])  # Make ObjectId JSON serializable
    return jsonify(overlays)

@overlays_bp.route('/api/overlays/<id>', methods=['GET'])
def get_overlay(id):
    overlay = mongo.db.overlays.find_one({'_id': ObjectId(id)})
    if not overlay:
        return jsonify({'error': 'Overlay not found'}), 404
    overlay['_id'] = str(overlay['_id'])
    return jsonify(overlay)

@overlays_bp.route('/api/overlays', methods=['POST'])
def create_overlay():
    data = request.json
    inserted = mongo.db.overlays.insert_one(data)
    return jsonify({'_id': str(inserted.inserted_id), **data})

@overlays_bp.route('/api/overlays/<id>', methods=['PUT'])
def update_overlay(id):
    data = request.json
    mongo.db.overlays.update_one({'_id': ObjectId(id)}, {'$set': data})
    return jsonify({'_id': id, **data})

@overlays_bp.route('/api/overlays/<id>', methods=['DELETE'])
def delete_overlay(id):
    mongo.db.overlays.delete_one({'_id': ObjectId(id)})
    return jsonify({'message': 'Deleted'})
