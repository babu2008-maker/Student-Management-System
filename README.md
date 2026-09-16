# Student Management System

A complete full-stack **Student Management System** web application built with **Python (Django + Django REST Framework)** on the backend, **SQLite** database, and a clean, responsive **HTML5/CSS3/Vanilla JavaScript** single-page dashboard on the frontend.

---

## Features & CRUD Workflow

1. **Create (Add Student)**:
   - Interactive form modal with real-time client-side validation and backend uniqueness/format checking.
   - Supports Full Name, Email Address, Department, Phone Number, and Academic Year.

2. **Read (View Students)**:
   - Responsive table displaying student ID, Name, Email, Department, Phone, Year, and action buttons.
   - Detail view modal showing comprehensive student profile details.
   - Real-time search filter across Name, Email, Department, Phone, and Academic Year.

3. **Update (Edit Student)**:
   - Pre-filled edit form modal allowing seamless updates to existing student records with validation feedback.

4. **Delete (Remove Student)**:
   - Safe deletion flow with custom confirmation modal dialog.

5. **Validation & Feedback**:
   - Non-empty name validation (min 2 characters).
   - Email format validation & strict backend email uniqueness check.
   - Phone number format validation (7 to 15 digits).
   - Field-level error highlights and floating animated toast notifications.

---

## Technology Stack

- **Backend Framework**: Python 3, Django 6.1, Django REST Framework (DRF)
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3 (Flexbox/Grid, CSS Variables), Vanilla JavaScript (ES6+ Fetch API)
- **Icons & Styling**: Font Awesome 6, Google Fonts (Inter)
- **API Testing**: Postman / cURL compatible JSON REST API

---

## Directory Structure

```text
student_management/
├── manage.py                  # Django management script
├── db.sqlite3                 # SQLite database file
├── README.md                  # Documentation
├── venv/                      # Python virtual environment
├── student_management/        # Django project settings & main router
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── students/                  # Students application module
│   ├── models.py              # Student database model
│   ├── serializers.py         # DRF StudentSerializer with field validations
│   ├── views.py               # API ViewSet & Dashboard View
│   ├── urls.py                # REST API routes (/api/students/)
│   ├── tests.py               # Automated unit tests
│   └── migrations/            # Django database migrations
├── templates/
│   └── index.html             # Single-Page Dashboard HTML template
└── static/
    ├── css/
    │   └── style.css          # Custom responsive CSS styles
    └── js/
        └── app.js             # Vanilla JS frontend application module
```

---

## Installation & Setup Guide

### 1. Clone / Open Project Directory
Navigate to the project root directory:
```bash
cd "student management system"
```

### 2. Create & Activate Virtual Environment
On Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\Activate
```
On macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Required Dependencies
```bash
pip install django djangorestframework django-cors-headers
```

### 4. Run Database Migrations
Apply the initial SQLite migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

---

## Running the Application

Start the Django development server:
```bash
python manage.py runserver 8000
```

Open your browser and navigate to:
```text
http://127.0.0.1:8000/
```

---

## REST API Endpoints Specification

All API communication uses standard JSON format.

| HTTP Method | Endpoint | Description | Sample Payload / Params |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/students/` | List all students | Optional query `?search=alex` |
| **POST** | `/api/students/` | Create a new student | JSON payload (see below) |
| **GET** | `/api/students/<id>/` | Retrieve student details | Response: Student JSON object |
| **PUT/PATCH** | `/api/students/<id>/` | Update student details | Partial/Full JSON payload |
| **DELETE** | `/api/students/<id>/` | Delete student record | Response status `204 No Content` |

### Sample JSON Payload (POST / PUT)
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@university.edu",
  "department": "Computer Science",
  "phone": "+15551234567",
  "year": "3rd Year"
}
```

---

## Postman API Testing Guide

1. **GET All Students**: Set request type to `GET` and URL to `http://127.0.0.1:8000/api/students/`.
2. **POST Add Student**: Set request type to `POST`, URL to `http://127.0.0.1:8000/api/students/`, select `Body` > `raw` > `JSON`, and paste the payload above.
3. **GET Student Detail**: Set request type to `GET` and URL to `http://127.0.0.1:8000/api/students/1/`.
4. **PUT Update Student**: Set request type to `PUT`, URL to `http://127.0.0.1:8000/api/students/1/`, and pass modified JSON body.
5. **DELETE Student**: Set request type to `DELETE` and URL to `http://127.0.0.1:8000/api/students/1/`.

---

## Automated Testing

Run the included unit tests to verify database models, field validation, and REST API behavior:
```bash
python manage.py test students
```
