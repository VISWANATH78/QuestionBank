from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, CustomRole
from .serializers import UserSerializer, CustomRoleSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == User.Role.ADMIN

class HasRolePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            role = CustomRole.objects.get(name=f"{request.user.role} Role")
            required_permission = self.get_required_permission(view.action)
            return role.permissions.get(required_permission, False)
        except CustomRole.DoesNotExist:
            return False

    def get_required_permission(self, action):
        permission_map = {
            'create': 'can_create_forms',
            'update': 'can_edit_forms',
            'partial_update': 'can_edit_forms',
            'destroy': 'can_delete_forms',
            'list': 'can_view_forms',
            'retrieve': 'can_view_forms',
        }
        return permission_map.get(action, 'can_view_forms')

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class CustomRoleViewSet(viewsets.ModelViewSet):
    queryset = CustomRole.objects.all()
    serializer_class = CustomRoleSerializer
    permission_classes = [IsAdminUser]

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer