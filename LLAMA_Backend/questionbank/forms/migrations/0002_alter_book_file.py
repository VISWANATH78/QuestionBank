# Generated by Django 5.1.3 on 2024-11-24 06:51

import forms.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forms', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='book',
            name='file',
            field=models.FileField(upload_to=forms.models.book_file_path),
        ),
    ]
