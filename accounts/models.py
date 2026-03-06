from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.decorators import user_passes_test

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
        ('store_manager', 'Store Manager'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')

def is_store_manager(user):
    return user.role == "store_manager"

@user_passes_test(is_store_manager)
def manage_store(request):
    # Logic to manage store
    pass