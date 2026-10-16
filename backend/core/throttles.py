from rest_framework.throttling import AnonRateThrottle, SimpleRateThrottle


class AnonGlobalThrottle(AnonRateThrottle):
    """
    SPEC B-17: Anonymous global rate throttle (20/min).
    """
    scope = 'anon'


class CommentCreateThrottle(SimpleRateThrottle):
    """
    SPEC B-17: Comment creation throttle (5/hour per IP).
    """
    scope = 'comment'

    def get_cache_key(self, request, view):
        return self.get_ident(request)


class ContactCreateThrottle(SimpleRateThrottle):
    """
    SPEC B-17: Contact submission throttle (3/hour per IP).
    """
    scope = 'contact'

    def get_cache_key(self, request, view):
        return self.get_ident(request)


class LikeToggleThrottle(SimpleRateThrottle):
    """
    SPEC B-17: Post like toggle throttle (30/min).
    Uses X-Visitor-Id header or IP address.
    """
    scope = 'like'

    def get_cache_key(self, request, view):
        visitor_id = request.headers.get('X-Visitor-Id')
        if visitor_id:
            return f"throttle_like_{visitor_id}"
        return self.get_ident(request)
