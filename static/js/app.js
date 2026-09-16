/**
 * Student Management System - Frontend App Module
 * Pure Vanilla JavaScript handling REST API communication, dynamic DOM rendering,
 * modal states, client-side & server-side validation, and toast notifications.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- API Configuration ---
    const API_BASE_URL = '/api/students/';

    // --- DOM Elements ---
    const studentTableBody = document.getElementById('student-table-body');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const studentTable = document.getElementById('student-table');
    const totalCountBadge = document.getElementById('total-count');
    
    // Search Elements
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    // Add / Edit Modal Elements
    const studentModal = document.getElementById('student-modal');
    const modalTitle = document.getElementById('modal-title');
    const studentForm = document.getElementById('student-form');
    const studentIdInput = document.getElementById('student-id');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const departmentInput = document.getElementById('department');
    const phoneInput = document.getElementById('phone');
    const yearInput = document.getElementById('year');
    const formAlert = document.getElementById('form-alert');
    const openAddModalBtn = document.getElementById('open-add-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const saveStudentBtn = document.getElementById('save-student-btn');
    const emptyAddBtn = document.getElementById('empty-add-btn');

    // View Modal Elements
    const viewModal = document.getElementById('view-modal');
    const closeViewModalBtn = document.getElementById('close-view-modal-btn');
    const closeViewBtn = document.getElementById('close-view-btn');
    const viewEditBtn = document.getElementById('view-edit-btn');
    const viewId = document.getElementById('view-id');
    const viewName = document.getElementById('view-name');
    const viewEmail = document.getElementById('view-email');
    const viewDepartment = document.getElementById('view-department');
    const viewPhone = document.getElementById('view-phone');
    const viewYear = document.getElementById('view-year');

    // Delete Modal Elements
    const deleteModal = document.getElementById('delete-modal');
    const closeDeleteModalBtn = document.getElementById('close-delete-modal-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const deleteStudentName = document.getElementById('delete-student-name');

    // Toast Container
    const toastContainer = document.getElementById('toast-container');

    // State Variables
    let currentStudents = [];
    let selectedStudentForDelete = null;
    let selectedStudentForView = null;
    let searchTimeout = null;

    // --- Helper Functions ---

    /**
     * Show Toast Notification
     */
    function showToast(title, message, type = 'success', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const iconClass = type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation';
        
        toast.innerHTML = `
            <div class="toast-icon"><i class="fa-solid ${iconClass}"></i></div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Get CSRF Token from cookie
     */
    function getCsrfToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === ('csrftoken=')) {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    }

    /**
     * Clear field validation errors
     */
    function clearValidationErrors() {
        const fieldErrors = document.querySelectorAll('.field-error');
        fieldErrors.forEach(el => el.textContent = '');

        const inputContainers = document.querySelectorAll('.input-with-icon');
        inputContainers.forEach(el => el.classList.remove('has-error'));

        formAlert.style.display = 'none';
        formAlert.textContent = '';
    }

    /**
     * Display field-specific error message
     */
    function setFieldError(fieldName, message) {
        const errorEl = document.getElementById(`error-${fieldName}`);
        const inputEl = document.getElementById(fieldName);

        if (errorEl) {
            errorEl.textContent = message;
        }
        if (inputEl && inputEl.closest('.input-with-icon')) {
            inputEl.closest('.input-with-icon').classList.add('has-error');
        }
    }

    /**
     * Frontend Form Validation
     */
    function validateForm() {
        clearValidationErrors();
        let isValid = true;

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const department = departmentInput.value.trim();
        const phone = phoneInput.value.trim();
        const year = yearInput.value.trim();

        // Validate Name
        if (!name) {
            setFieldError('name', 'Student name is required.');
            isValid = false;
        } else if (name.length < 2) {
            setFieldError('name', 'Name must be at least 2 characters long.');
            isValid = false;
        }

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setFieldError('email', 'Email address is required.');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            setFieldError('email', 'Please enter a valid email address (e.g. user@domain.com).');
            isValid = false;
        }

        // Validate Department
        if (!department) {
            setFieldError('department', 'Department is required.');
            isValid = false;
        }

        // Validate Phone
        const phoneDigits = phone.replace(/[\s\-\+\(\)]/g, '');
        if (!phone) {
            setFieldError('phone', 'Phone number is required.');
            isValid = false;
        } else if (!/^\d+$/.test(phoneDigits)) {
            setFieldError('phone', 'Phone number must contain numbers only.');
            isValid = false;
        } else if (phoneDigits.length < 7 || phoneDigits.length > 15) {
            setFieldError('phone', 'Phone number must be between 7 and 15 digits.');
            isValid = false;
        }

        // Validate Year
        if (!year) {
            setFieldError('year', 'Academic year selection is required.');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Open Modal
     */
    function openModal(modalEl) {
        modalEl.classList.add('active');
        modalEl.setAttribute('aria-hidden', 'false');
    }

    /**
     * Close Modal
     */
    function closeModal(modalEl) {
        modalEl.classList.remove('active');
        modalEl.setAttribute('aria-hidden', 'true');
    }

    /**
     * Reset Add/Edit Form
     */
    function resetForm() {
        studentForm.reset();
        studentIdInput.value = '';
        clearValidationErrors();
    }

    // --- API Calls & Core Logic ---

    /**
     * Fetch all students from API (Read Operation & Search)
     */
    async function loadStudents(query = '') {
        loadingState.style.display = 'block';
        studentTable.style.display = 'none';
        emptyState.style.display = 'none';

        let url = API_BASE_URL;
        if (query.trim() !== '') {
            url += `?search=${encodeURIComponent(query.trim())}`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load students (Status: ${response.status})`);
            }
            const data = await response.json();
            currentStudents = data;
            renderStudentsTable(data, query);
        } catch (error) {
            console.error('Error fetching students:', error);
            showToast('API Error', error.message || 'Could not connect to server.', 'error');
            loadingState.style.display = 'none';
            emptyState.style.display = 'block';
            document.getElementById('empty-title').textContent = 'Server Communication Error';
            document.getElementById('empty-subtitle').textContent = 'Please make sure backend server is running.';
        }
    }

    /**
     * Render Students Table
     */
    function renderStudentsTable(students, query = '') {
        loadingState.style.display = 'none';
        studentTableBody.innerHTML = '';

        totalCountBadge.textContent = students.length;

        if (students.length === 0) {
            studentTable.style.display = 'none';
            emptyState.style.display = 'block';
            if (query) {
                document.getElementById('empty-title').textContent = 'No matching records found';
                document.getElementById('empty-subtitle').textContent = `No student matches "${query}". Try a different search term.`;
            } else {
                document.getElementById('empty-title').textContent = 'No Students Found';
                document.getElementById('empty-subtitle').textContent = 'Get started by adding a new student to the system.';
            }
            return;
        }

        emptyState.style.display = 'none';
        studentTable.style.display = 'table';

        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="id-badge">#${student.id}</span></td>
                <td><span class="student-name">${escapeHtml(student.name)}</span></td>
                <td><span class="student-email">${escapeHtml(student.email)}</span></td>
                <td>${escapeHtml(student.department)}</td>
                <td>${escapeHtml(student.phone)}</td>
                <td><span class="year-tag">${escapeHtml(student.year)}</span></td>
                <td class="text-center">
                    <div class="action-buttons">
                        <button type="button" class="btn btn-outline btn-icon view-btn" data-id="${student.id}" title="View Details">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button type="button" class="btn btn-secondary btn-icon edit-btn" data-id="${student.id}" title="Edit Student">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button type="button" class="btn btn-danger btn-icon delete-btn" data-id="${student.id}" title="Delete Student">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            `;
            studentTableBody.appendChild(row);
        });

        attachRowEventListeners();
    }

    /**
     * Attach Row Action Button Listeners
     */
    function attachRowEventListeners() {
        // View Button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                openViewModal(id);
            });
        });

        // Edit Button
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                openEditModal(id);
            });
        });

        // Delete Button
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                openDeleteModal(id);
            });
        });
    }

    /**
     * Open View Modal (Read Detail)
     */
    function openViewModal(id) {
        const student = currentStudents.find(s => s.id == id);
        if (!student) return;

        selectedStudentForView = student;
        viewId.textContent = `#${student.id}`;
        viewName.textContent = student.name;
        viewEmail.textContent = student.email;
        viewDepartment.textContent = student.department;
        viewPhone.textContent = student.phone;
        viewYear.textContent = student.year;

        openModal(viewModal);
    }

    /**
     * Open Edit Modal (Update Operation Setup)
     */
    function openEditModal(id) {
        const student = currentStudents.find(s => s.id == id);
        if (!student) return;

        resetForm();
        modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Student Information`;
        studentIdInput.value = student.id;
        nameInput.value = student.name;
        emailInput.value = student.email;
        departmentInput.value = student.department;
        phoneInput.value = student.phone;
        yearInput.value = student.year;

        saveStudentBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Update Student`;

        openModal(studentModal);
    }

    /**
     * Open Delete Confirmation Modal
     */
    function openDeleteModal(id) {
        const student = currentStudents.find(s => s.id == id);
        if (!student) return;

        selectedStudentForDelete = student;
        deleteStudentName.textContent = `${student.name} (#${student.id})`;
        openModal(deleteModal);
    }

    /**
     * Submit Student Form (Create or Update)
     */
    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const id = studentIdInput.value;
        const isEdit = Boolean(id);

        const payload = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            department: departmentInput.value.trim(),
            phone: phoneInput.value.trim(),
            year: yearInput.value.trim(),
        };

        const url = isEdit ? `${API_BASE_URL}${id}/` : API_BASE_URL;
        const method = isEdit ? 'PUT' : 'POST';

        saveStudentBtn.disabled = true;
        saveStudentBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken() || ''
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                // Server validation errors returned
                if (typeof data === 'object') {
                    let hasFieldErrors = false;
                    for (const key in data) {
                        if (['name', 'email', 'department', 'phone', 'year'].includes(key)) {
                            const errMsg = Array.isArray(data[key]) ? data[key].join(' ') : data[key];
                            setFieldError(key, errMsg);
                            hasFieldErrors = true;
                        }
                    }
                    if (!hasFieldErrors) {
                        const genericErr = data.detail || JSON.stringify(data);
                        formAlert.textContent = genericErr;
                        formAlert.style.display = 'block';
                    }
                } else {
                    formAlert.textContent = 'Failed to save student record.';
                    formAlert.style.display = 'block';
                }
                showToast('Validation Error', 'Please correct the errors in the form.', 'error');
                return;
            }

            // Success
            closeModal(studentModal);
            resetForm();
            showToast(
                isEdit ? 'Student Updated' : 'Student Added',
                `Successfully ${isEdit ? 'updated' : 'created'} student record for ${data.name}.`,
                'success'
            );
            loadStudents(searchInput.value);

        } catch (error) {
            console.error('Error saving student:', error);
            showToast('Save Failed', error.message || 'An unexpected error occurred.', 'error');
        } finally {
            saveStudentBtn.disabled = false;
            saveStudentBtn.innerHTML = isEdit ? 
                `<i class="fa-solid fa-floppy-disk"></i> Update Student` : 
                `<i class="fa-solid fa-check"></i> Save Student`;
        }
    });

    /**
     * Delete Student (Delete Operation)
     */
    confirmDeleteBtn.addEventListener('click', async () => {
        if (!selectedStudentForDelete) return;

        const id = selectedStudentForDelete.id;
        const name = selectedStudentForDelete.name;

        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Deleting...`;

        try {
            const response = await fetch(`${API_BASE_URL}${id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCsrfToken() || ''
                }
            });

            if (!response.ok && response.status !== 204) {
                throw new Error(`Deletion failed (Status ${response.status})`);
            }

            closeModal(deleteModal);
            showToast('Student Deleted', `Record for ${name} has been deleted.`, 'success');
            selectedStudentForDelete = null;
            loadStudents(searchInput.value);

        } catch (error) {
            console.error('Error deleting student:', error);
            showToast('Delete Failed', error.message || 'Could not delete record.', 'error');
        } finally {
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i> Yes, Delete Record`;
        }
    });

    // --- Search & Filter Handling ---
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        
        if (query.trim()) {
            clearSearchBtn.style.display = 'block';
        } else {
            clearSearchBtn.style.display = 'none';
        }

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadStudents(query);
        }, 300);
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        loadStudents('');
    });

    // --- Modal Control Buttons ---
    openAddModalBtn.addEventListener('click', () => {
        resetForm();
        modalTitle.innerHTML = `<i class="fa-solid fa-user-plus"></i> Add New Student`;
        saveStudentBtn.innerHTML = `<i class="fa-solid fa-check"></i> Save Student`;
        openModal(studentModal);
    });

    emptyAddBtn.addEventListener('click', () => {
        openAddModalBtn.click();
    });

    closeModalBtn.addEventListener('click', () => closeModal(studentModal));
    cancelModalBtn.addEventListener('click', () => closeModal(studentModal));

    closeViewModalBtn.addEventListener('click', () => closeModal(viewModal));
    closeViewBtn.addEventListener('click', () => closeModal(viewModal));

    viewEditBtn.addEventListener('click', () => {
        closeModal(viewModal);
        if (selectedStudentForView) {
            openEditModal(selectedStudentForView.id);
        }
    });

    closeDeleteModalBtn.addEventListener('click', () => closeModal(deleteModal));
    cancelDeleteBtn.addEventListener('click', () => closeModal(deleteModal));

    // Close Modals on Overlay Click
    [studentModal, viewModal, deleteModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Utility: HTML Escape helper
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // --- Initial Load ---
    loadStudents();
});
