import os
from django.core.exceptions import ValidationError


def validate_image_file(file_obj):
    """
    SPEC B-21: Images max 2 MB (.jpg/.jpeg/.png/.webp).
    """
    max_size = 2 * 1024 * 1024  # 2 MB
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']

    if file_obj.size > max_size:
        raise ValidationError("Image file size cannot exceed 2 MB.")

    ext = os.path.splitext(file_obj.name)[1].lower()
    if ext not in valid_extensions:
        raise ValidationError(f"Unsupported image format. Allowed formats: {', '.join(valid_extensions)}")


def validate_pdf_file(file_obj):
    """
    SPEC B-21: Resume PDF only, max 5 MB.
    """
    max_size = 5 * 1024 * 1024  # 5 MB
    valid_extensions = ['.pdf']

    if file_obj.size > max_size:
        raise ValidationError("Resume file size cannot exceed 5 MB.")

    ext = os.path.splitext(file_obj.name)[1].lower()
    if ext not in valid_extensions:
        raise ValidationError("Resume must be a PDF document (.pdf).")
