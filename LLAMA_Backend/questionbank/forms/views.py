from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import ValidationError
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters import rest_framework as filters
import logging

from .models import Form, FormResponse, Book, Category, Grade
from .serializers import (
    FormSerializer, FormResponseSerializer, BookSerializer,
    CategorySerializer, GradeSerializer
)
from accounts.permissions import IsAdminOrImporter

logger = logging.getLogger(__name__)

class IsAdminOrUploader(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow if admin or the original uploader
        return (
            request.user.role == 'ADMIN' or 
            obj.uploaded_by == request.user
        )

class FormViewSet(viewsets.ModelViewSet):
    queryset = Form.objects.all()
    serializer_class = FormSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def add_fields(self, request, pk=None):
        form = self.get_object()
        serializer = FormFieldSerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save(form=form)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FormResponseViewSet(viewsets.ModelViewSet):
    queryset = FormResponse.objects.all()
    serializer_class = FormResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Admin can see all responses, others can only see their own
        if self.request.user.role == 'ADMIN':
            return FormResponse.objects.all()
        return FormResponse.objects.filter(submitted_by=self.request.user)

    def perform_create(self, serializer):
        form = Form.objects.get(pk=self.request.data.get('form'))
        serializer.save(
            submitted_by=self.request.user,
            form=form
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.method in ['POST', 'PUT', 'PATCH']:
            context['form'] = Form.objects.get(pk=self.request.data.get('form'))
        return context

class BookFilter(filters.FilterSet):
    category = filters.CharFilter(field_name='category__id')
    grade = filters.CharFilter(field_name='grade__id')
    
    class Meta:
        model = Book
        fields = ['category', 'grade']

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.select_related('category', 'grade').all()
    serializer_class = BookSerializer
    parser_classes = (MultiPartParser, FormParser)
    filter_backends = [filters.DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BookFilter
    search_fields = ['title', 'author']
    ordering_fields = ['uploaded_at', 'title']

    def get_permissions(self):
        """
        List/Retrieve - Any authenticated user
        Create/Update/Delete - Admin or Importer only
        """
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsAdminOrImporter()]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        book = self.get_object()
        if book.file_type.upper() != 'PDF':
            return Response(
                {"error": "This book is not in PDF format"},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response({
            "pdf_url": request.build_absolute_uri(book.file.url)
        })

    def create(self, request, *args, **kwargs):
        try:
            # Add file validation
            if 'file' not in request.FILES:
                return Response(
                    {'detail': 'No file was uploaded'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            file = request.FILES['file']
            # Add file size validation (e.g., 50MB limit)
            if file.size > 52428800:  # 50MB in bytes
                return Response(
                    {'detail': 'File size too large. Maximum size is 50MB'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            logger.info(f"Book upload attempt by user: {request.user}")
            logger.info(f"Request data: {request.data}")
            
            # Validate required fields
            required_fields = ['title', 'author', 'category', 'grade']
            for field in required_fields:
                if field not in request.data:
                    return Response(
                        {'detail': f'Missing required field: {field}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                logger.error(f"Validation errors: {serializer.errors}")
                return Response(
                    {'detail': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            logger.error(f"Validation error: {str(e)}")
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error creating book")
            return Response(
                {'detail': 'An error occurred while uploading the book'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        logger.info(f"Books being sent: {serializer.data}")
        return Response(serializer.data)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        logger.info(f"Categories being sent: {serializer.data}")
        return Response(serializer.data)

class GradeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        logger.info(f"Grades being sent: {serializer.data}")
        return Response(serializer.data)