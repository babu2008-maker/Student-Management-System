from django.db import models
from django.core.validators import RegexValidator

class Student(models.Model):
    phone_validator = RegexValidator(
        regex=r'^\+?[0-9\s\-]{7,15}$',
        message="Phone number must contain between 7 and 15 digits, optionally with '+' or '-'."
    )

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100)
    phone = models.CharField(validators=[phone_validator], max_length=20)
    year = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.email})"
