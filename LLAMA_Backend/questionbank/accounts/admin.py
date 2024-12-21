from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, CustomRole

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['email', 'username', 'role', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Role Information', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Role Information', {'fields': ('role',)}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(CustomRole)
