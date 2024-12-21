from django.db import models
from accounts.models import User
from django.conf import settings

class Form(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_forms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class FormField(models.Model):
    class FieldType(models.TextChoices):
        TEXT = 'TEXT', 'Text'
        NUMBER = 'NUMBER', 'Number'
        DATE = 'DATE', 'Date'
        SELECT = 'SELECT', 'Select'
        MULTISELECT = 'MULTISELECT', 'Multi Select'
        FILE = 'FILE', 'File Upload'

    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='fields')
    label = models.CharField(max_length=100)
    field_type = models.CharField(max_length=20, choices=FieldType.choices)
    is_required = models.BooleanField(default=False)
    options = models.JSONField(default=list, blank=True)  # For SELECT/MULTISELECT fields
    order = models.PositiveIntegerField()
    
    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.form.title} - {self.label}"

class FormResponse(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='responses')
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='form_responses')
    responses = models.JSONField()  # Stores field_id: value pairs
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.form.title} - Response by {self.submitted_by.email}"

def book_file_path(instance, filename):
    # Sanitize category and grade names
    category_name = instance.category.name.lower().replace(' ', '_')
    grade_name = instance.grade.name.lower().replace(' ', '_')
    
    # Sanitize filename to remove special characters
    import re
    clean_filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    
    # Create path: books/category/grade/filename
    return f'books/{category_name}/{grade_name}/{clean_filename}'

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

class Grade(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE)
    file = models.FileField(upload_to=book_file_path)
    file_type = models.CharField(max_length=10)
    file_size = models.IntegerField()
    uploaded_by = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Author(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name