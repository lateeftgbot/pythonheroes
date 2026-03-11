from flask import Blueprint, jsonify

system_bp = Blueprint('system', __name__)

@system_bp.route('/api/system/test', methods=['GET'])
def test_system():
    return jsonify({"status": "system module active"}), 200
