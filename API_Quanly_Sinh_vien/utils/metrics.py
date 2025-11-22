import time
# threading là một module của Python để tạo thread, thread là một luồng nhỏ trong chương trình, nó có thể chạy đồng thời với main thread
import threading
# collections là một module của Python để tạo các collection data type như deque, defaultdict, ...
# nhằm giúp tăng tốc độ xử lý và tối ưu hóa code
# deque là một collection data type như list nhưng có thể thêm và xóa phần tử ở cả 2 đầu còn defaultdict là một collection data type như dict nhưng có thể thêm và xóa phần tử ở cả 2 đầu
from collections import deque, defaultdict


ONLINE_WINDOW_SEC = 20  # threshold to consider a user "online"


class MetricsCollector:
    """In-memory metrics for lightweight monitoring.

    Tracks per-request timings, status codes, and active users over rolling windows.
    """

    def __init__(self, window_seconds: int = 900):  # 15 minutes window
        self.window_seconds = window_seconds
        self._lock = threading.Lock()
        self._requests = deque()  # (ts, status, duration_ms, user_id)
        self._heartbeats = {}  # session_id -> (last_seen_ts, user_id)

    def _purge_old(self, now: float):
        cutoff = now - self.window_seconds
        while self._requests and self._requests[0][0] < cutoff:
            self._requests.popleft()

    def record_request(self, status_code: int, duration_ms: float, user_id: int | None):
        now = time.time()
        with self._lock:
            self._requests.append((now, int(status_code), float(duration_ms), user_id))
            self._purge_old(now)

    def snapshot(self):
        now = time.time()
        with self._lock:
            self._purge_old(now)
            items = list(self._requests)
            # Purge old heartbeats (older than window)
            cutoff = now - self.window_seconds
            self._heartbeats = {sid: (ts, uid) for sid, (ts, uid) in self._heartbeats.items() if ts >= cutoff}

        # Aggregate
        total = len(items)
        last_1m = [r for r in items if r[0] >= now - 60]
        last_5m = [r for r in items if r[0] >= now - 300]

        def agg(rows):
            if not rows:
                return {
                    'requests': 0,
                    'errors': 0,
                    'avg_response_ms': 0,
                    'p95_response_ms': 0,
                }
            durations = sorted(r[2] for r in rows)
            p95 = durations[int(0.95 * (len(durations) - 1))] if durations else 0
            return {
                'requests': len(rows),
                'errors': sum(1 for r in rows if r[1] >= 500),
                'avg_response_ms': sum(durations) / len(durations) if durations else 0,
                'p95_response_ms': p95,
            }

        # Unique active users
        active_users_15m = len({r[3] for r in items if r[3] is not None})
        active_users_1m = len({r[3] for r in last_1m if r[3] is not None})

        # Heartbeat-based online metrics (more accurate for "users on site")
        online_clients_1m = len([1 for _, (ts, _) in self._heartbeats.items() if ts >= now - ONLINE_WINDOW_SEC])
        online_users_1m = len({uid for (_, (ts, uid)) in self._heartbeats.items() if ts >= now - ONLINE_WINDOW_SEC and uid is not None})

        by_status = defaultdict(int)
        for _, status, _, _ in items:
            by_status[status] += 1

        return {
            'totals': {
                'requests_15m': total,
                'active_users_15m': active_users_15m,
                'active_users_1m': active_users_1m,
                'online_clients_1m': online_clients_1m,
                'online_users_1m': online_users_1m,
                'by_status_15m': dict(by_status),
            },
            'last_1m': agg(last_1m),
            'last_5m': agg(last_5m),
            'generated_at': int(now),
        }


# Singleton instance used by app
metrics_collector = MetricsCollector()

def record_heartbeat(session_id: str, user_id: int | None):
    now = time.time()
    if not session_id:
        return
    with metrics_collector._lock:
        metrics_collector._heartbeats[session_id] = (now, user_id)


