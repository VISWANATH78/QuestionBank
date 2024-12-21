from rest_framework import serializers
from .models import Form, FormField, FormResponse, Book, Category, Grade, Author

class FormFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormField
        fields = ['id', 'label', 'field_type', 'is_required', 'options', 'order']

class FormSerializer(serializers.ModelSerializer):
    fields = FormFieldSerializer(many=True, read_only=True)
    created_by = serializers.ReadOnlyField(source='created_by.email')

    class Meta:
        model = Form
        fields = ['id', 'title', 'description', 'created_by', 'created_at', 'updated_at', 'is_active', 'fields']

class FormResponseSerializer(serializers.ModelSerializer):
    submitted_by = serializers.ReadOnlyField(source='submitted_by.email')

    class Meta:
        model = FormResponse
        fields = ['id', 'form', 'submitted_by', 'responses', 'submitted_at']
        read_only_fields = ['submitted_at']

    def validate_responses(self, value):
        """
        Validate that all required fields are present in the response
        """
        form = self.context['form']
        required_fields = form.fields.filter(is_required=True).values_list('id', flat=True)
        
        for field_id in required_fields:
            if str(field_id) not in value:
                raise serializers.ValidationError(f"Required field {field_id} is missing")
        
        return value

class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_size_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'category', 'grade',
            'category_name', 'grade_name', 
            'file', 'file_type', 'file_size', 'file_size_display', 
            'file_url', 'uploaded_by', 'uploaded_at'
        ]
        read_only_fields = ['file_size', 'uploaded_by', 'uploaded_at', 'file_url', 'file_size_display']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url') and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_file_size_display(self, obj):
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ['id', 'name']