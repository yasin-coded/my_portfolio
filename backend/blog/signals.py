import os
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings

from blog.models import Comment, Post


@receiver(post_save, sender=Comment)
def comment_awaiting_approval_notification(sender, instance, created, **kwargs):
    """
    SPEC B-20: Console email / notification alert when a new comment is submitted.
    """
    if created and not instance.is_approved:
        subject = f"[DevFolio] New comment awaiting approval on '{instance.post.title}'"
        message = (
            f"A new comment was submitted by {instance.name} ({instance.email}):\n\n"
            f"Post: {instance.post.title}\n"
            f"Content:\n{instance.content}\n\n"
            f"Approve or reject this comment via the owner dashboard at /dashboard/comments."
        )
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email='notifications@devfolio.local',
                recipient_list=['admin@devfolio.local'],
                fail_silently=True,
            )
        except Exception:
            pass
        print(f"\n[ALERT] {subject}\nComment ID: {instance.id}\n")


@receiver(post_delete, sender=Post)
def cleanup_post_cover_image(sender, instance, **kwargs):
    """
    SPEC B-20: Clean up cover image file on disk when a Post is deleted.
    """
    if instance.cover_image:
        try:
            if os.path.isfile(instance.cover_image.path):
                os.remove(instance.cover_image.path)
        except Exception:
            pass
