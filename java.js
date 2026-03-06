// Sample Data
let complaints = [
    {
        id: 1,
        title: "Broken Projector in Room 101",
        category: "facility",
        description: "The projector in room 101 is not working properly.",
        status: "pending",
        date: "2024-01-15",
        student: "John Doe"
    },
    {
        id: 2,
        title: "Library Wi-Fi Issues",
        category: "facility",
        description: "Wi-Fi connection is very slow in the library.",
        status: "resolved",
        date: "2024-01-14",
        student: "Jane Smith"
    },
    {
        id: 3,
        title: "Exam Schedule Conflict",
        category: "academic",
        description: "Two exams scheduled on the same day.",
        status: "pending",
        date: "2024-01-13",
        student: "Mike Johnson"
    }
];

let feedbacks = [];
let currentUser = null;
let currentRating = 0;
let activeComplaintFilter = 'all';

const seededUsers = [
    {
        name: 'xyz',
        email: '25200XX@klh.edu.in',
        department: 'Choose from options',
        role: 'student',
        password: 'student@123'
    },
    {
        name: 'Campus Admin',
        email: 'admin@campus.edu',
        department: 'Administration',
        role: 'admin',
        password: 'admin@123'
    }
];

let registeredUsers = [...seededUsers];
const DEFAULT_ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin@123',
    name: 'System Admin'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', evt => {
            const selectedFilter = btn.dataset.filter || 'all';
            filterComplaints(evt, selectedFilter);
        });
    });
    setStudentProfile('John Doe');
    initializeModals();

    filterComplaints(null, 'all');
    updateStats();
    updateStudentActivity();
});

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const identifier = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const role = document.querySelector('input[name="role"]:checked').value;
    
    // Simple validation
    if (!identifier || !password) {
        showToast('Please enter username and password', 'error');
        return;
    }
    
    if (role === 'student') {
        const studentRecord = findRegisteredUser(identifier, 'student');
        if (!studentRecord) {
            showToast('No student account found. Please register first.', 'error');
            return;
        }

        if (studentRecord.password !== password) {
            showToast('Incorrect password. Try again.', 'error');
            return;
        }

        currentUser = { name: studentRecord.name, role: 'student', department: studentRecord.department };
        setStudentProfile(studentRecord.name);
        showScreen('studentDashboard');
        updateStudentActivity();
        showToast(`Welcome back, ${studentRecord.name}!`, 'success');
    } else {
        const adminRecord = findRegisteredUser(identifier, 'admin');

        if (adminRecord) {
            if (adminRecord.password !== password) {
                showToast('Incorrect password. Try again.', 'error');
                return;
            }
            currentUser = { name: adminRecord.name, role: 'admin' };
        } else if (identifier.toLowerCase() === DEFAULT_ADMIN_CREDENTIALS.username && password === DEFAULT_ADMIN_CREDENTIALS.password) {
            currentUser = { name: DEFAULT_ADMIN_CREDENTIALS.name, role: 'admin' };
        } else {
            showToast('Admin credentials not recognized.', 'error');
            return;
        }

        showScreen('adminDashboard');
        filterComplaints(null, activeComplaintFilter);
        updateStats();
        showToast(`Welcome, ${currentUser.name}!`, 'success');
    }

    e.target.reset();
}

// Logout
function logout() {
    currentUser = null;
    document.getElementById('loginForm').reset();
    setStudentProfile('John Doe');
    closeAllModals();
    returnToLogin();
    activeComplaintFilter = 'all';
    filterComplaints(null, 'all');
    updateStats();
    showToast('Logged out successfully', 'success');
}

// Show specific screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function navigateToRegister() {
    showScreen('registerScreen');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function returnToLogin() {
    showScreen('loginScreen');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prefillAdminLogin() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if (usernameInput && passwordInput) {
        usernameInput.value = DEFAULT_ADMIN_CREDENTIALS.username;
        passwordInput.value = DEFAULT_ADMIN_CREDENTIALS.password;
    }
    const adminRadio = document.querySelector('input[name="role"][value="admin"]');
    if (adminRadio) {
        adminRadio.checked = true;
    }
    showToast('Admin credentials filled. Tap login to continue.', 'success');
}

function handleRegister(e) {
    e.preventDefault();

    const fullName = formatName(document.getElementById('regName').value);
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const department = document.getElementById('regDepartment').value;
    const password = document.getElementById('regPassword').value.trim();
    const confirmPassword = document.getElementById('regConfirmPassword').value.trim();
    const role = document.querySelector('input[name="regRole"]:checked').value;

    if (!fullName || !email || !department || !password || !confirmPassword) {
        showToast('Please complete all fields.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('Please enter a valid institutional email.', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters.', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return;
    }

    const existing = registeredUsers.some(user => user.email.toLowerCase() === email);
    if (existing) {
        showToast('An account with this email already exists.', 'error');
        return;
    }

    const newUser = { name: fullName, email, department, role, password };
    registeredUsers.push(newUser);

    showToast(`${role === 'admin' ? 'Admin' : 'Student'} account created successfully!`, 'success');
    e.target.reset();

    const loginField = document.getElementById('username');
    if (loginField) {
        loginField.value = email;
    }
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.value = '';
    }
    const loginRole = document.querySelector(`input[name="role"][value="${role}"]`);
    if (loginRole) {
        loginRole.checked = true;
    }

    returnToLogin();
}

// Show Feedback Form
function showFeedbackForm() {
    if (!requireStudentContext()) {
        return;
    }
    resetFeedbackForm();
    openModal('feedbackModal');
}

// Show Complaint Form
function showComplaintForm() {
    if (!requireStudentContext()) {
        return;
    }
    openModal('complaintModal');
}

// Close Modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        return;
    }
    modal.style.display = 'none';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        return;
    }
    modal.style.display = 'flex';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function initializeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', evt => {
            if (evt.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    document.addEventListener('keydown', evt => {
        if (evt.key === 'Escape') {
            closeAllModals();
        }
    });
}

function requireStudentContext() {
    if (!currentUser || currentUser.role !== 'student') {
        showToast('Please log in as a student to continue.', 'error');
        return false;
    }
    return true;
}

function setStudentProfile(fullName) {
    const safeName = formatName(fullName || 'John Doe');
    const firstName = safeName.split(' ')[0];
    document.getElementById('studentName').textContent = firstName;
    document.getElementById('studentNameDisplay').textContent = safeName;
}

function formatName(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) {
        return 'Student';
    }
    return trimmed
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
}

function findRegisteredUser(identifier, role) {
    if (!identifier) {
        return null;
    }
    const normalized = identifier.trim().toLowerCase();
    return registeredUsers.find(user => {
        if (user.role !== role) {
            return false;
        }
        const fullName = user.name.toLowerCase();
        const firstName = fullName.split(' ')[0];
        return (
            user.email.toLowerCase() === normalized ||
            fullName === normalized ||
            firstName === normalized
        );
    }) || null;
}

function isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

function normalizeStatus(statusValue) {
    return (statusValue || '').toString().trim().toLowerCase();
}

// Set Rating
function setRating(rating) {
    currentRating = rating;
    document.getElementById('rating').value = rating;
    
    const stars = document.querySelectorAll('.stars i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
}

// Reset Feedback Form
function resetFeedbackForm() {
    currentRating = 0;
    document.getElementById('rating').value = '0';
    document.getElementById('comments').value = '';
    
    const stars = document.querySelectorAll('.stars i');
    stars.forEach(star => {
        star.classList.remove('fas', 'active');
        star.classList.add('far');
    });
}

// Submit Feedback
function submitFeedback(e) {
    e.preventDefault();
    
    const rating = document.getElementById('rating').value;
    const comments = document.getElementById('comments').value;
    
    if (rating === '0') {
        showToast('Please select a rating', 'error');
        return;
    }
    
    if (!comments.trim()) {
        showToast('Please enter your comments', 'error');
        return;
    }
    
    const feedback = {
        id: feedbacks.length + 1,
        rating: parseInt(rating),
        comments: comments,
        date: new Date().toISOString().split('T')[0],
        student: currentUser ? currentUser.name : 'John Doe'
    };
    
    feedbacks.push(feedback);
    closeModal('feedbackModal');
    showToast('Thank you for your feedback!', 'success');
    updateStudentActivity();
}

// Submit Complaint
function submitComplaint(e) {
    e.preventDefault();
    
    const title = document.getElementById('complaintTitle').value;
    const category = document.getElementById('complaintCategory').value;
    const description = document.getElementById('complaintDescription').value;
    
    if (!title || !description) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    const complaint = {
        id: complaints.length + 1,
        title: title,
        category: category,
        description: description,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        student: currentUser ? currentUser.name : 'John Doe'
    };
    
    complaints.push(complaint);
    closeModal('complaintModal');
    document.getElementById('complaintForm').reset();
    
    showToast('Complaint submitted successfully!', 'success');
    filterComplaints(null, activeComplaintFilter);
    updateStats();
    updateStudentActivity();
}

// Filter Complaints
function filterComplaints(evt, filter) {
    const targetFilter = filter || 'all';
    activeComplaintFilter = targetFilter;
    updateFilterButtons(evt, targetFilter);
    updateComplaintsList(targetFilter);
}

function updateFilterButtons(evt, filter) {
    const explicitTarget = evt ? evt.currentTarget : null;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const matches = explicitTarget ? btn === explicitTarget : btn.dataset.filter === filter;
        btn.classList.toggle('active', Boolean(matches));
    });
}

// Update Complaints List
function updateComplaintsList(filter) {
    const complaintsList = document.getElementById('complaintsList');
    const normalizedFilter = (filter || 'all').toLowerCase();
    let filteredComplaints = complaints;
    const showActions = currentUser && currentUser.role === 'admin';
    
    if (normalizedFilter === 'pending') {
        filteredComplaints = complaints.filter(c => normalizeStatus(c.status) === 'pending');
    } else if (normalizedFilter === 'resolved') {
        filteredComplaints = complaints.filter(c => normalizeStatus(c.status) === 'resolved');
    }
    
    if (filteredComplaints.length === 0) {
        complaintsList.innerHTML = '<div class="no-data">No complaints found</div>';
        return;
    }
    
    complaintsList.innerHTML = filteredComplaints.map(complaint => {
        const statusValue = normalizeStatus(complaint.status);
        const statusLabel = (complaint.status || '').toString().trim().toUpperCase() || (statusValue ? statusValue.toUpperCase() : 'PENDING');
        const statusClass = statusValue === 'pending' ? 'status-pending' : 'status-resolved';
        const nextStatus = statusValue === 'pending' ? 'resolved' : 'pending';
        const actionText = statusValue === 'pending' ? 'Mark Resolved' : 'Reopen Case';
        const actionMarkup = showActions ? `
                <button class="complaint-action-btn" data-id="${complaint.id}" data-status="${nextStatus}">${actionText}</button>
        ` : '';
        return `
        <div class="complaint-item ${statusValue}">
            <div class="complaint-info">
                <h4>${complaint.title}</h4>
                <p>${complaint.description}</p>
                <div class="complaint-meta">
                    <span><i class="fas fa-user"></i> ${complaint.student}</span>
                    <span><i class="fas fa-calendar"></i> ${complaint.date}</span>
                    <span><i class="fas fa-tag"></i> ${complaint.category}</span>
                </div>
            </div>
            <div class="complaint-status-block">
                <div class="complaint-status ${statusClass}">
                    ${statusLabel}
                </div>
                ${actionMarkup}
            </div>
        </div>
    `;
    }).join('');

    attachComplaintActionHandlers();
}

function attachComplaintActionHandlers() {
    if (!currentUser || currentUser.role !== 'admin') {
        return;
    }

    document.querySelectorAll('.complaint-action-btn').forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            const complaintId = parseInt(button.dataset.id, 10);
            const targetStatus = button.dataset.status || '';
            if (Number.isNaN(complaintId) || !targetStatus) {
                return;
            }
            updateComplaintStatus(complaintId, targetStatus);
        });
    });
}

function updateComplaintStatus(complaintId, newStatus) {
    const normalizedStatus = normalizeStatus(newStatus);
    const complaint = complaints.find(c => c.id === complaintId);

    if (!complaint) {
        showToast('Complaint not found.', 'error');
        return;
    }

    const currentStatus = normalizeStatus(complaint.status);
    if (currentStatus === normalizedStatus) {
        return;
    }

    complaint.status = normalizedStatus;
    const message = normalizedStatus === 'resolved'
        ? 'Complaint marked as resolved.'
        : 'Complaint reopened and set to pending.';

    showToast(message, 'success');
    filterComplaints(null, activeComplaintFilter);
    updateStats();
    updateStudentActivity();
}

// Update Stats
function updateStats() {
    const pending = complaints.filter(c => normalizeStatus(c.status) === 'pending').length;
    const resolved = complaints.filter(c => normalizeStatus(c.status) === 'resolved').length;
    const total = complaints.length;
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('resolvedCount').textContent = resolved;
    document.getElementById('totalCount').textContent = total;
}

// Update Student Activity
function updateStudentActivity() {
    const activityList = document.getElementById('studentActivityList');
    const studentName = currentUser ? currentUser.name : 'John Doe';
    
    // Get student's activities
    const studentComplaints = complaints.filter(c => c.student === studentName);
    const studentFeedbacks = feedbacks.filter(f => f.student === studentName);
    
    const activities = [];
    
    studentComplaints.forEach(c => {
        activities.push({
            type: 'complaint',
            title: c.title,
            status: c.status,
            date: c.date
        });
    });
    
    studentFeedbacks.forEach(f => {
        activities.push({
            type: 'feedback',
            rating: f.rating,
            date: f.date
        });
    });
    
    // Sort by date (most recent first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (activities.length === 0) {
        activityList.innerHTML = '<div class="no-data">No recent activities</div>';
        return;
    }
    
    activityList.innerHTML = activities.slice(0, 5).map(activity => {
        if (activity.type === 'complaint') {
            return `
                <div class="activity-item">
                    <div class="activity-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="activity-details">
                        <strong>Complaint submitted:</strong> ${activity.title}
                        <br>
                        <small>Status: ${activity.status} | ${activity.date}</small>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="activity-item">
                    <div class="activity-icon"><i class="fas fa-star"></i></div>
                    <div class="activity-details">
                        <strong>Feedback submitted:</strong> ${activity.rating} stars
                        <br>
                        <small>${activity.date}</small>
                    </div>
                </div>
            `;
        }
    }).join('');
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconClass = type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation';
    toast.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
    }, 2600);

    setTimeout(() => {
        toast.remove();
    }, 3200);
}