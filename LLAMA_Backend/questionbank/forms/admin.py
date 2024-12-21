from django.contrib import admin
from .models import Form, FormField, FormResponse, Book, Category, Grade

admin.site.register(Form)
admin.site.register(FormField)
admin.site.register(FormResponse)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'grade', 'uploaded_at')
    list_filter = ('category', 'grade')
    search_fields = ('title', 'author__username')
    date_hierarchy = 'uploaded_at'
