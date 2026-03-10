const API_BASE = 'http://localhost:3000/api';

let currentUser = null;
let authToken = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuth() {
    authToken = localStorage.getItem('token');
    if (authToken) {
        fetchCurrentUser();
    } else {
        showPage('loginPage');
    }
}

// Fetch current user
async function fetchCurrentUser() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            if (currentUser.role === 'admin') {
                showPage('adminDashboard');
                loadAdminDashboard();
            } else {
                showPage('studentDashboard');
                loadStudentDashboard();
            }
        } else {
            localStorage.removeItem('token');
            showPage('loginPage');
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        showPage('loginPage');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('registerRole').addEventListener('change', toggleStudentFields);
    
    // Student forms
    document.getElementById('roomRequestForm').addEventListener('submit', handleRoomRequest);
    document.getElementById('complaintForm').addEventListener('submit', handleComplaint);
    
    // Admin forms
    document.getElementById('addHostelForm').addEventListener('submit', handleAddHostel);
    document.getElementById('addRoomForm').addEventListener('submit', handleAddRoom);
}

// Show page
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// Toggle student fields in register form
function toggleStudentFields() {
    const role = document.getElementById('registerRole').value;
    const studentFields = document.querySelectorAll('#studentFields');
    studentFields.forEach(field => {
        field.style.display = role === 'student' ? 'block' : 'block';
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('token', authToken);
            currentUser = data.user;
            
            if (currentUser.role === 'admin') {
                showPage('adminDashboard');
                loadAdminDashboard();
            } else {
                showPage('studentDashboard');
                loadStudentDashboard();
            }
        } else {
            showMessage('loginPage', data.message, 'error');
        }
    } catch (error) {
        showMessage('loginPage', 'Login failed. Please try again.', 'error');
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    const role = document.getElementById('registerRole').value;
    
    const userData = {
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        role: role,
        studentId: role === 'student' ? document.getElementById('registerStudentId').value : null,
        contact: document.getElementById('registerContact').value,
        gender: document.getElementById('registerGender').value
    };

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('token', authToken);
            currentUser = data.user;
            showMessage('registerPage', 'Registration successful!', 'success');
            setTimeout(() => {
                if (currentUser.role === 'admin') {
                    showPage('adminDashboard');
                    loadAdminDashboard();
                } else {
                    showPage('studentDashboard');
                    loadStudentDashboard();
                }
            }, 1000);
        } else {
            showMessage('registerPage', data.message, 'error');
        }
    } catch (error) {
        showMessage('registerPage', 'Registration failed. Please try again.', 'error');
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    authToken = null;
    currentUser = null;
    showPage('loginPage');
}

// Show message
function showMessage(pageId, message, type) {
    const page = document.getElementById(pageId);
    const existingMessage = page.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    page.querySelector('.container').insertBefore(messageDiv, page.querySelector('.container').firstChild);

    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Student Dashboard Functions
function showStudentTab(tab) {
    document.querySelectorAll('#studentDashboard .tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#studentDashboard .tab-btn').forEach(b => b.classList.remove('active'));
    
    if (tab === 'dashboard') {
        document.getElementById('studentDashboardTab').classList.add('active');
        document.querySelectorAll('#studentDashboard .tab-btn')[0].classList.add('active');
    } else if (tab === 'request') {
        document.getElementById('studentRequestTab').classList.add('active');
        document.querySelectorAll('#studentDashboard .tab-btn')[1].classList.add('active');
        loadRoomRequestPage();
    } else if (tab === 'complaints') {
        document.getElementById('studentComplaintsTab').classList.add('active');
        document.querySelectorAll('#studentDashboard .tab-btn')[2].classList.add('active');
        loadComplaintsPage();
    }
}

async function loadStudentDashboard() {
    document.getElementById('studentName').textContent = currentUser.name;
    await loadRoomAllocation();
    await loadStudentComplaintsSummary();
}

async function loadRoomAllocation() {
    try {
        const response = await fetch(`${API_BASE}/requests`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const requests = await response.json();
        const approvedRequest = requests.find(r => r.status === 'Approved');

        const container = document.getElementById('roomAllocationDetails');
        if (approvedRequest && approvedRequest.roomId) {
            container.innerHTML = `
                <p><strong>Hostel:</strong> ${approvedRequest.hostelId.name}</p>
                <p><strong>Room Number:</strong> ${approvedRequest.roomId.roomNumber}</p>
                <p><strong>Room Type:</strong> ${approvedRequest.roomId.type}</p>
                <span class="status-badge status-approved">Approved</span>
            `;
        } else {
            container.innerHTML = '<p class="empty-state">No room allocated yet. Please request a room.</p>';
        }
    } catch (error) {
        console.error('Error loading room allocation:', error);
    }
}

async function loadStudentComplaintsSummary() {
    try {
        const response = await fetch(`${API_BASE}/complaints`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const complaints = await response.json();
        const pendingCount = complaints.filter(c => c.status === 'Pending').length;
        const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

        document.getElementById('complaintsSummary').innerHTML = `
            <p><strong>Pending:</strong> ${pendingCount}</p>
            <p><strong>Resolved:</strong> ${resolvedCount}</p>
        `;
    } catch (error) {
        console.error('Error loading complaints summary:', error);
    }
}

async function loadRoomRequestPage() {
    await loadHostels();
    await loadMyRequests();
}

async function loadHostels() {
    try {
        const response = await fetch(`${API_BASE}/hostels`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const hostels = await response.json();
        
        const select = document.getElementById('requestHostel');
        select.innerHTML = '<option value="">Select Hostel</option>';
        hostels.forEach(hostel => {
            const option = document.createElement('option');
            option.value = hostel._id;
            option.textContent = `${hostel.name} (${hostel.type})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading hostels:', error);
    }
}

async function loadMyRequests() {
    try {
        const response = await fetch(`${API_BASE}/requests`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const requests = await response.json();

        const container = document.getElementById('myRequests');
        if (requests.length === 0) {
            container.innerHTML = '<p class="empty-state">No requests yet.</p>';
        } else {
            container.innerHTML = requests.map(request => `
                <div class="list-item">
                    <h4>Request #${request.requestId}</h4>
                    <p><strong>Hostel:</strong> ${request.hostelId.name}</p>
                    ${request.roomId ? `<p><strong>Room:</strong> ${request.roomId.roomNumber}</p>` : ''}
                    <p><strong>Date:</strong> ${new Date(request.requestDate).toLocaleDateString()}</p>
                    <span class="status-badge status-${request.status.toLowerCase()}">${request.status}</span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

async function handleRoomRequest(e) {
    e.preventDefault();
    const hostelId = document.getElementById('requestHostel').value;

    try {
        const response = await fetch(`${API_BASE}/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ hostelId })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('studentDashboard', 'Room request submitted successfully!', 'success');
            document.getElementById('roomRequestForm').reset();
            loadMyRequests();
        } else {
            showMessage('studentDashboard', data.message, 'error');
        }
    } catch (error) {
        showMessage('studentDashboard', 'Failed to submit request. Please try again.', 'error');
    }
}

async function loadComplaintsPage() {
    await loadStudentRooms();
    await loadMyComplaints();
}

async function loadStudentRooms() {
    try {
        const response = await fetch(`${API_BASE}/requests`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const requests = await response.json();
        const approvedRequest = requests.find(r => r.status === 'Approved' && r.roomId);

        const select = document.getElementById('complaintRoom');
        if (approvedRequest && approvedRequest.roomId) {
            select.innerHTML = `<option value="${approvedRequest.roomId._id}">${approvedRequest.roomId.roomNumber}</option>`;
        } else {
            select.innerHTML = '<option value="">No room allocated</option>';
            select.disabled = true;
        }
    } catch (error) {
        console.error('Error loading student rooms:', error);
    }
}

async function loadMyComplaints() {
    try {
        const response = await fetch(`${API_BASE}/complaints`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const complaints = await response.json();

        const container = document.getElementById('myComplaints');
        if (complaints.length === 0) {
            container.innerHTML = '<p class="empty-state">No complaints submitted yet.</p>';
        } else {
            container.innerHTML = complaints.map(complaint => `
                <div class="list-item">
                    <h4>Complaint #${complaint.complaintId}</h4>
                    <p><strong>Room:</strong> ${complaint.roomId.roomNumber}</p>
                    <p><strong>Category:</strong> ${complaint.category}</p>
                    <p><strong>Description:</strong> ${complaint.description}</p>
                    <p><strong>Date:</strong> ${new Date(complaint.createdAt).toLocaleDateString()}</p>
                    <span class="status-badge status-${complaint.status.toLowerCase()}">${complaint.status}</span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading complaints:', error);
    }
}

async function handleComplaint(e) {
    e.preventDefault();
    const roomId = document.getElementById('complaintRoom').value;
    const category = document.getElementById('complaintCategory').value;
    const description = document.getElementById('complaintDescription').value;

    try {
        const response = await fetch(`${API_BASE}/complaints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ roomId, category, description })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('studentDashboard', 'Complaint submitted successfully!', 'success');
            document.getElementById('complaintForm').reset();
            loadMyComplaints();
        } else {
            showMessage('studentDashboard', data.message, 'error');
        }
    } catch (error) {
        showMessage('studentDashboard', 'Failed to submit complaint. Please try again.', 'error');
    }
}

// Admin Dashboard Functions
function showAdminTab(tab) {
    document.querySelectorAll('#adminDashboard .tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#adminDashboard .tab-btn').forEach(b => b.classList.remove('active'));
    
    const tabs = ['dashboard', 'hostels', 'rooms', 'requests', 'complaints'];
    const index = tabs.indexOf(tab);
    if (index !== -1) {
        document.querySelectorAll('#adminDashboard .tab-content')[index].classList.add('active');
        document.querySelectorAll('#adminDashboard .tab-btn')[index].classList.add('active');
    }

    if (tab === 'hostels') {
        loadHostelsList();
    } else if (tab === 'rooms') {
        loadRoomsList();
    } else if (tab === 'requests') {
        loadPendingRequests();
    } else if (tab === 'complaints') {
        loadAllComplaints();
    }
}

async function loadAdminDashboard() {
    document.getElementById('adminName').textContent = currentUser.name;
    await loadReports();
}

async function loadReports() {
    try {
        const response = await fetch(`${API_BASE}/reports`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const reports = await response.json();

        document.getElementById('statTotalHostels').textContent = reports.totalHostels;
        document.getElementById('statTotalRooms').textContent = reports.totalRooms;
        document.getElementById('statAvailableRooms').textContent = reports.availableRooms;
        document.getElementById('statOccupiedRooms').textContent = reports.occupiedRooms;
        document.getElementById('statPendingRequests').textContent = reports.pendingRequests;
        document.getElementById('statActiveComplaints').textContent = reports.activeComplaints;
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

async function handleAddHostel(e) {
    e.preventDefault();
    const name = document.getElementById('hostelName').value;
    const type = document.getElementById('hostelType').value;
    const totalRooms = document.getElementById('hostelTotalRooms').value;
    const address = document.getElementById('hostelAddress').value;

    try {
        const response = await fetch(`${API_BASE}/hostels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name, type, totalRooms, address })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('adminDashboard', 'Hostel added successfully!', 'success');
            document.getElementById('addHostelForm').reset();
            loadHostelsList();
            loadReports();
        } else {
            showMessage('adminDashboard', data.message, 'error');
        }
    } catch (error) {
        showMessage('adminDashboard', 'Failed to add hostel. Please try again.', 'error');
    }
}

async function loadHostelsList() {
    try {
        const response = await fetch(`${API_BASE}/hostels`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const hostels = await response.json();

        const container = document.getElementById('hostelsList');
        if (hostels.length === 0) {
            container.innerHTML = '<p class="empty-state">No hostels added yet.</p>';
        } else {
            container.innerHTML = hostels.map(hostel => `
                <div class="list-item">
                    <h4>${hostel.name}</h4>
                    <p><strong>Type:</strong> ${hostel.type}</p>
                    <p><strong>Total Rooms:</strong> ${hostel.totalRooms}</p>
                    <p><strong>Address:</strong> ${hostel.address}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading hostels:', error);
    }
}

async function handleAddRoom(e) {
    e.preventDefault();
    const hostelId = document.getElementById('roomHostel').value;
    const roomNumber = document.getElementById('roomNumber').value;
    const type = document.getElementById('roomType').value;
    const capacity = document.getElementById('roomCapacity').value;

    try {
        const response = await fetch(`${API_BASE}/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ hostelId, roomNumber, type, capacity })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('adminDashboard', 'Room added successfully!', 'success');
            document.getElementById('addRoomForm').reset();
            loadRoomsList();
            loadReports();
        } else {
            showMessage('adminDashboard', data.message, 'error');
        }
    } catch (error) {
        showMessage('adminDashboard', 'Failed to add room. Please try again.', 'error');
    }
}

async function loadRoomsList() {
    try {
        const response = await fetch(`${API_BASE}/rooms`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const rooms = await response.json();

        // Load hostels for room form
        const hostelResponse = await fetch(`${API_BASE}/hostels`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const hostels = await hostelResponse.json();
        
        const select = document.getElementById('roomHostel');
        select.innerHTML = '<option value="">Select Hostel</option>';
        hostels.forEach(hostel => {
            const option = document.createElement('option');
            option.value = hostel._id;
            option.textContent = `${hostel.name} (${hostel.type})`;
            select.appendChild(option);
        });

        const container = document.getElementById('roomsList');
        if (rooms.length === 0) {
            container.innerHTML = '<p class="empty-state">No rooms added yet.</p>';
        } else {
            container.innerHTML = rooms.map(room => `
                <div class="list-item">
                    <h4>Room ${room.roomNumber}</h4>
                    <p><strong>Hostel:</strong> ${room.hostelId.name}</p>
                    <p><strong>Type:</strong> ${room.type}</p>
                    <p><strong>Capacity:</strong> ${room.capacity}</p>
                    <p><strong>Occupied:</strong> ${room.occupiedCount}</p>
                    <span class="status-badge status-${room.status.toLowerCase()}">${room.status}</span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

async function loadPendingRequests() {
    try {
        const response = await fetch(`${API_BASE}/requests`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const requests = await response.json();
        const pendingRequests = requests.filter(r => r.status === 'Pending');

        const container = document.getElementById('pendingRequests');
        if (pendingRequests.length === 0) {
            container.innerHTML = '<p class="empty-state">No pending requests.</p>';
        } else {
            container.innerHTML = pendingRequests.map(request => `
                <div class="list-item">
                    <h4>Request #${request.requestId}</h4>
                    <p><strong>Student:</strong> ${request.studentId.name} (${request.studentId.studentId || 'N/A'})</p>
                    <p><strong>Email:</strong> ${request.studentId.email}</p>
                    <p><strong>Hostel:</strong> ${request.hostelId.name}</p>
                    <p><strong>Date:</strong> ${new Date(request.requestDate).toLocaleDateString()}</p>
                    <div class="action-buttons">
                        <button class="btn btn-success" onclick="approveRequest('${request._id}')">Approve</button>
                        <button class="btn btn-danger" onclick="rejectRequest('${request._id}')">Reject</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

async function approveRequest(requestId) {
    try {
        const response = await fetch(`${API_BASE}/requests/${requestId}/approve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({})
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('adminDashboard', 'Request approved successfully!', 'success');
            loadPendingRequests();
            loadReports();
        } else {
            showMessage('adminDashboard', data.message, 'error');
        }
    } catch (error) {
        showMessage('adminDashboard', 'Failed to approve request. Please try again.', 'error');
    }
}

async function rejectRequest(requestId) {
    try {
        const response = await fetch(`${API_BASE}/requests/${requestId}/reject`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('adminDashboard', 'Request rejected.', 'success');
            loadPendingRequests();
        } else {
            showMessage('adminDashboard', data.message, 'error');
        }
    } catch (error) {
        showMessage('adminDashboard', 'Failed to reject request. Please try again.', 'error');
    }
}

async function loadAllComplaints() {
    try {
        const response = await fetch(`${API_BASE}/complaints`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const complaints = await response.json();

        const container = document.getElementById('allComplaints');
        if (complaints.length === 0) {
            container.innerHTML = '<p class="empty-state">No complaints yet.</p>';
        } else {
            container.innerHTML = complaints.map(complaint => `
                <div class="list-item">
                    <h4>Complaint #${complaint.complaintId}</h4>
                    <p><strong>Student:</strong> ${complaint.studentId.name} (${complaint.studentId.studentId || 'N/A'})</p>
                    <p><strong>Room:</strong> ${complaint.roomId.roomNumber}</p>
                    <p><strong>Category:</strong> ${complaint.category}</p>
                    <p><strong>Description:</strong> ${complaint.description}</p>
                    <p><strong>Date:</strong> ${new Date(complaint.createdAt).toLocaleDateString()}</p>
                    <span class="status-badge status-${complaint.status.toLowerCase()}">${complaint.status}</span>
                    ${complaint.status === 'Pending' ? `
                        <div class="action-buttons">
                            <button class="btn btn-success" onclick="resolveComplaint('${complaint._id}')">Mark as Resolved</button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading complaints:', error);
    }
}

async function resolveComplaint(complaintId) {
    try {
        const response = await fetch(`${API_BASE}/complaints/${complaintId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status: 'Resolved' })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('adminDashboard', 'Complaint marked as resolved!', 'success');
            loadAllComplaints();
            loadReports();
        } else {
            showMessage('adminDashboard', data.message, 'error');
        }
    } catch (error) {
        showMessage('adminDashboard', 'Failed to update complaint. Please try again.', 'error');
    }
}

