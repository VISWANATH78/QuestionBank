from rest_framework import serializers
from .models import User, CustomRole

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'role', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class CustomRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomRole
        fields = ['id', 'name', 'permissions', 'created_at', 'updated_at']