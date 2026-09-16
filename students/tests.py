from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Student

class StudentAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student1 = Student.objects.create(
            name="Alice Smith",
            email="alice@example.com",
            department="Computer Science",
            phone="+1234567890",
            year="3rd Year"
        )
        self.student2 = Student.objects.create(
            name="Bob Johnson",
            email="bob@example.com",
            department="Electrical Engineering",
            phone="+9876543210",
            year="2nd Year"
        )

    def test_list_students(self):
        """Test GET /api/students/ endpoint."""
        response = self.client.get('/api/students/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_retrieve_student(self):
        """Test GET /api/students/<id>/ endpoint."""
        response = self.client.get(f'/api/students/{self.student1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Alice Smith")
        self.assertEqual(response.data['email'], "alice@example.com")

    def test_create_student_success(self):
        """Test POST /api/students/ endpoint with valid data."""
        payload = {
            "name": "Charlie Brown",
            "email": "charlie@example.com",
            "department": "Mechanical Engineering",
            "phone": "+1122334455",
            "year": "1st Year"
        }
        response = self.client.post('/api/students/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Student.objects.count(), 3)
        self.assertEqual(response.data['name'], "Charlie Brown")

    def test_create_student_duplicate_email(self):
        """Test POST /api/students/ fails with duplicate email."""
        payload = {
            "name": "Alice Duplicate",
            "email": "alice@example.com", # Existing email
            "department": "Physics",
            "phone": "+1234567890",
            "year": "1st Year"
        }
        response = self.client.post('/api/students/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_create_student_invalid_inputs(self):
        """Test POST /api/students/ validation errors on empty/invalid inputs."""
        payload = {
            "name": "",
            "email": "invalid-email-format",
            "department": "",
            "phone": "abc", # non-digit phone
            "year": ""
        }
        response = self.client.post('/api/students/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)
        self.assertIn('email', response.data)
        self.assertIn('department', response.data)
        self.assertIn('phone', response.data)
        self.assertIn('year', response.data)

    def test_update_student(self):
        """Test PUT /api/students/<id>/ endpoint."""
        payload = {
            "name": "Alice Smith Updated",
            "email": "alice.updated@example.com",
            "department": "Data Science",
            "phone": "+1234567899",
            "year": "4th Year"
        }
        response = self.client.put(f'/api/students/{self.student1.id}/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student1.refresh_from_db()
        self.assertEqual(self.student1.name, "Alice Smith Updated")
        self.assertEqual(self.student1.department, "Data Science")

    def test_delete_student(self):
        """Test DELETE /api/students/<id>/ endpoint."""
        response = self.client.delete(f'/api/students/{self.student2.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Student.objects.filter(id=self.student2.id).count(), 0)

    def test_search_students(self):
        """Test GET /api/students/?search= query filtering."""
        response = self.client.get('/api/students/?search=Electrical')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Bob Johnson")
