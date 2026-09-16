from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, index_view

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')

urlpatterns = [
    path('', index_view, name='index'),
    path('api/', include(router.urls)),
]
