from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLES = (
        ('admin', 'Admin'),
        ('importer', 'Importer'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLES, default='student')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class CustomRole(models.Model):
    name = models.CharField(max_length=50, unique=True)
    permissions = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name