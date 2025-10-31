from flask import Blueprint, request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from utils.metrics import record_heartbeat

monitor_bp = Blueprint('monitor', __name__)

@monitor_bp.route('/heartbeat', methods=['POST'])
def heartbeat():
    """Receive frontend heartbeats to track 'users currently on site'.
    Accepts JSON: { "client_id": "uuid" }
    JWT token is optional; if present, associates the user id.
    """
    try:
        data = request.get_json(silent=True) or {}
        client_id = (data.get('client_id') or '').strip()
        # Optional user id from JWT
        user_id = None
        try:
            verify_jwt_in_request(optional=True)
            ident = get_jwt_identity()
            if ident is not None:
                user_id = int(ident)
        except Exception:
            user_id = None

        record_heartbeat(client_id, user_id)
        return jsonify({ 'ok': True }), 200
    except Exception as e:
        return jsonify({ 'error': str(e) }), 500


