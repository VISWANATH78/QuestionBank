from rest_framework import permissions
from .models import User

class HasRolePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated 

class IsAdminOrImporter(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role == 'admin' or 
            request.user.role == 'importer'
        )

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and (
            request.user.role in ['admin', 'importer'] or
            obj.uploaded_by == request.user
        ) 