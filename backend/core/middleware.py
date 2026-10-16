import time
import logging

logger = logging.getLogger('devfolio.request')


class ResponseLoggingMiddleware:
    """
    SPEC B-19: Log METHOD /path → status (xx ms) and add X-Response-Time header.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.perf_counter()
        response = self.get_response(request)
        elapsed_ms = (time.perf_counter() - start_time) * 1000

        # Attach custom header
        response['X-Response-Time'] = f"{elapsed_ms:.2f}ms"

        # Print / log the timing and status
        log_line = f"{request.method} {request.get_full_path()} -> {response.status_code} ({elapsed_ms:.2f} ms)"
        print(log_line)
        logger.info(log_line)

        return response
