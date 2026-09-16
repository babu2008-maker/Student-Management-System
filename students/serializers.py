import re
from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'name', 'email', 'department', 'phone', 'year', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Student name cannot be empty.")
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Student name must be at least 2 characters long.")
        return value.strip()

    def validate_email(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Email address cannot be empty.")
        email_clean = value.strip().lower()
        
        # Check uniqueness manually for consistent error structure across DRF validations
        student_id = self.instance.id if self.instance else None
        if Student.objects.filter(email__iexact=email_clean).exclude(id=student_id).exists():
            raise serializers.ValidationError("A student with this email address already exists.")
        return email_clean

    def validate_department(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Department cannot be empty.")
        return value.strip()

    def validate_phone(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Phone number cannot be empty.")
        phone_clean = value.strip()
        digits_only = re.sub(r'[\s\-\+\(\)]', '', phone_clean)
        if not digits_only.isdigit():
            raise serializers.ValidationError("Phone number must contain valid digits.")
        if len(digits_only) < 7 or len(digits_only) > 15:
            raise serializers.ValidationError("Phone number must contain between 7 and 15 digits.")
        return phone_clean

    def validate_year(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Year cannot be empty.")
        return value.strip()
