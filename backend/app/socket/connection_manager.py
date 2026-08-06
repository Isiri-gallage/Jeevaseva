import logging
from typing import Dict, List

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Tracks live WebSocket connections, keyed by user id.

    This is in-process state: it works for a single API instance. Running more
    than one replica requires a shared backplane (e.g. Redis pub/sub) so a
    message published on one instance reaches a user connected to another.
    """

    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        """Accept and store a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(
            "User %s connected. Active connections: %d",
            user_id, len(self.active_connections),
        )

    def disconnect(self, user_id: int):
        """Remove a disconnected user"""
        if self.active_connections.pop(user_id, None) is not None:
            logger.info(
                "User %s disconnected. Active connections: %d",
                user_id, len(self.active_connections),
            )

    async def send_personal_message(self, message: dict, user_id: int) -> bool:
        """Deliver a message to a user. Returns False if they are offline."""
        websocket = self.active_connections.get(user_id)
        if websocket is None:
            return False

        try:
            await websocket.send_json(message)
            return True
        except Exception:
            # The socket died without a clean close frame; drop it so we do not
            # keep reporting this user as online.
            logger.warning("Delivery to user %s failed; dropping connection", user_id)
            self.disconnect(user_id)
            return False

    def is_online(self, user_id: int) -> bool:
        """Check if a user is currently online"""
        return user_id in self.active_connections

    def get_online_users(self) -> List[int]:
        """Get list of all online user IDs"""
        return list(self.active_connections.keys())


# Create one global manager used everywhere
manager = ConnectionManager()
