// API Configuration - Update this with your droplet IP or domain
const API_BASE_URL = 'https://api.quadrantbrowser.com'; // Use HTTPS domain

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeButtons = document.querySelectorAll('.close');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const forgotPasswordLink = document.getElementById('forgotPassword');

// Forms
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Check if user is already logged in
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // User is logged in, change button text
        loginBtn.textContent = 'Dashboard';
        loginBtn.href = '#dashboard';
        loginBtn.onclick = () => window.location.href = 'dashboard.html';
    }
}

// Modal Functions
function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function showMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

function hideMessage(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = 'none';
}

// Loading States
function setLoading(form, isLoading) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner"></div> Loading...';
    } else {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Login Function
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Store the JWT token and user info
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', email);
            
            showMessage('successMessage', 'Login successful! Redirecting to dashboard...', false);
            
            // Update navigation
            setTimeout(() => {
                closeModal(loginModal);
                checkAuthStatus();
                // Redirect to dashboard or show dashboard modal
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showMessage('errorMessage', data.message || 'Login failed. Please check your credentials.', true);
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('errorMessage', 'Network error. Please try again.', true);
    }
}

// Register Function
async function register(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('registerSuccessMessage', 'Account created successfully! You can now log in.', false);
            
            // Clear form and switch to login
            setTimeout(() => {
                registerForm.reset();
                closeModal(registerModal);
                openModal(loginModal);
            }, 2000);
        } else {
            showMessage('registerErrorMessage', data.message || 'Registration failed. Please try again.', true);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('registerErrorMessage', 'Network error. Please try again.', true);
    }
}

// Event Listeners - only add if elements exist (for homepage)
if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!localStorage.getItem('authToken')) {
            openModal(loginModal);
        }
    });
}

// Close modal when clicking X - only add if elements exist
if (closeButtons.length > 0) {
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeModal(loginModal);
            closeModal(registerModal);
        });
    });
}

// Close modal when clicking outside - only add if modals exist
if (loginModal || registerModal) {
    window.addEventListener('click', (e) => {
        if (loginModal && e.target === loginModal) {
            closeModal(loginModal);
        }
        if (registerModal && e.target === registerModal) {
            closeModal(registerModal);
        }
    });
}

// Switch between login and register modals - only add if elements exist
if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        openModal(registerModal);
    });
}

if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(registerModal);
        openModal(loginModal);
    });
}

// Forgot password - only add if element exists
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        if (email) {
            // You can implement password reset here
            alert('Password reset functionality will be implemented soon.');
        } else {
            alert('Please enter your email address first.');
        }
    });
}

// Login form submission - only add if element exists
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Basic validation
        if (!email || !password) {
            showMessage('errorMessage', 'Please fill in all fields.', true);
            return;
        }
        
        if (!email.includes('@')) {
            showMessage('errorMessage', 'Please enter a valid email address.', true);
            return;
        }
        
        hideMessage('errorMessage');
        hideMessage('successMessage');
        setLoading(loginForm, true);
        
        try {
            await login(email, password);
        } finally {
            setLoading(loginForm, false);
        }
    });
}

// Register form submission - only add if element exists
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Basic validation
        if (!email || !password || !confirmPassword) {
            showMessage('registerErrorMessage', 'Please fill in all fields.', true);
            return;
        }
        
        if (!email.includes('@')) {
            showMessage('registerErrorMessage', 'Please enter a valid email address.', true);
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('registerErrorMessage', 'Passwords do not match.', true);
        }
        
        if (password.length < 6) {
            showMessage('registerErrorMessage', 'Password must be at least 6 characters long.', true);
            return;
        }
        
        if (!agreeTerms) {
            showMessage('registerErrorMessage', 'Please agree to the Terms of Service.', true);
            return;
        }
        
        hideMessage('registerErrorMessage');
        hideMessage('registerSuccessMessage');
        setLoading(registerForm, true);
        
        try {
            await register(email, password);
        } finally {
            setLoading(registerForm, false);
        }
    });
}

// Initialize auth status on page load - only if we're on the homepage
document.addEventListener('DOMContentLoaded', () => {
    if (loginBtn) { // Only run on homepage
        checkAuthStatus();
    }
});

// Logout function (can be called from dashboard)
function logout() {
    console.log('Auth.js logout function called');
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    
    // Only update login button if it exists (for homepage)
    if (loginBtn) {
        loginBtn.textContent = 'Login';
        loginBtn.href = '#';
        loginBtn.onclick = (e) => {
            e.preventDefault();
            openModal(loginModal);
        };
    }
    
    console.log('Auth data cleared, redirecting to homepage...');
    // Force redirect to homepage with cache busting
    window.location.replace('index.html?logout=' + Date.now());
} 