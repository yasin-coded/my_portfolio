from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """
    SPEC B-18: Standard pagination returning count, next, previous, results.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ProjectPagination(PageNumberPagination):
    """
    SPEC §4: Projects 9 per page.
    """
    page_size = 9
    page_size_query_param = 'page_size'
    max_page_size = 50


class PostPagination(PageNumberPagination):
    """
    SPEC §4: Posts 6 per page.
    """
    page_size = 6
    page_size_query_param = 'page_size'
    max_page_size = 50


class TenPerPagePagination(PageNumberPagination):
    """
    SPEC §4: Comments and contact messages 10 per page.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50
