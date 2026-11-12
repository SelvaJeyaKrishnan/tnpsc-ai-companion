import pytest
from app.rate_limiter import login_limiter, register_limiter, ai_limiter, room_limiter

@pytest.fixture(autouse=True)
def reset_all_rate_limiters():
    login_limiter.reset()
    register_limiter.reset()
    ai_limiter.reset()
    room_limiter.reset()
    yield
