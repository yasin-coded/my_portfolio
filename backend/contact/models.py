from django.db import models


class ContactMessage(models.Model):
    """
    Visitor contact submissions.
    Public can create; only owner can read or delete (B-12).
    """
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Contact Message"
        verbose_name_plural = "Contact Messages"

    def __str__(self):
        status = "Read" if self.is_read else "Unread"
        return f"[{status}] {self.subject} from {self.name}"
