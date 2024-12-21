from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'forms', views.FormViewSet)
router.register(r'responses', views.FormResponseViewSet)
router.register(r'books', views.BookViewSet)
router.register(r'categories', views.CategoryViewSet)
router.register(r'grades', views.GradeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]