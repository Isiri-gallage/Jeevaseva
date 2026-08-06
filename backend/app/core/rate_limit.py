from slowapi import Limiter
from slowapi.util import get_remote_address

# Defined here rather than in main.py so routers can apply @limiter.limit(...)
# without importing the app and creating a circular import.
#
# Note: keyed on client IP and stored in memory. Behind a reverse proxy, make
# sure the proxy sets X-Forwarded-For and the app runs with --proxy-headers,
# otherwise every request looks like it comes from the proxy. For more than one
# API replica, point slowapi at shared Redis storage instead.
limiter = Limiter(key_func=get_remote_address)

# Endpoints that hand out or change credentials get the tightest budgets.
LOGIN_RATE_LIMIT = "10/minute"
REGISTER_RATE_LIMIT = "5/minute"
PASSWORD_CHANGE_RATE_LIMIT = "5/minute"
