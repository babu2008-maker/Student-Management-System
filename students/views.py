from django.shortcuts import render
from django.db.models import Q
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from .models import Student
from .serializers import StudentSerializer

def index_view(request):
    """
    Render main Single-Page Dashboard for Student Management System.
    """
    return render(request, 'index.html')

class StudentViewSet(viewsets.ModelViewSet):
    """
    API ViewSet for Student CRUD operations.
    Supports GET, POST, PUT, PATCH, DELETE operations.
    Also supports search filtering via ?search= query parameter.
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'email', 'department', 'phone', 'year']

    def get_queryset(self):
        queryset = Student.objects.all()
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(email__icontains=search_query) |
                Q(department__icontains=search_query) |
                Q(phone__icontains=search_query) |
                Q(year__icontains=search_query)
            )
        return queryset
