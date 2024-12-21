from rest_framework import permissions

class IsAdminOrUploader(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow if admin or the original uploader
        return (
            request.user.role == 'ADMIN' or 
            obj.uploaded_by == request.user
        )

class IsAdminOrImporter(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or 
            request.user.role == 'importer'
        )