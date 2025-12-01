// Helper function for demo accounts
window.fillLogin = function (username, password, autoSubmit = false) {
    console.log('fillLogin called', username, autoSubmit);
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (usernameInput && passwordInput) {
        usernameInput.value = username;
        passwordInput.value = password;

        if (autoSubmit) {
            // Create and dispatch submit event
            const form = document.getElementById('loginForm');
            if (form) {
                const submitEvent = new Event('submit', {
                    'bubbles': true,
                    'cancelable': true
                });
                form.dispatchEvent(submitEvent);
            }
        }
    } else {
        console.error('Login inputs not found');
    }
};

// Login Page Handler
console.log('login.js loaded');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.textContent = '';

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await api.post('/auth/login', { username, password });
            api.setToken(response.token);

            // Store user info
            localStorage.setItem('userFullName', response.fullName);
            localStorage.setItem('userRole', response.role);
            localStorage.setItem('username', response.username);

            // Redirect to main dashboard
            window.location.href = '/admin';
        } catch (error) {
            let errorMessage = 'Invalid username or password';
            try {
                if (error.message) {
                    // Try to extract message from error response
                    const match = error.message.match(/message["\s]*:["\s]*([^"}\]]+)/);
                    if (match) {
                        errorMessage = match[1];
                    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                        errorMessage = 'Invalid username or password';
                    }
                }
            } catch (e) {
                console.error('Error parsing error message:', e);
            }
            loginError.textContent = errorMessage;
            console.error('Login error:', error);
        }
    });
}

// Helper function for demo accounts
window.fillLogin = function (username, password, autoSubmit = false) {
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;

    if (autoSubmit) {
        // Create and dispatch submit event
        const form = document.getElementById('loginForm');
        if (form) {
            const submitEvent = new Event('submit', {
                'bubbles': true,
                'cancelable': true
            });
            form.dispatchEvent(submitEvent);
        }
    }
};

