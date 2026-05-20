const DEFAULT_USER = {
    name: 'admin',
    email: 'admin@liparking.com',
    password: 'Admin123'
};

if (!localStorage.getItem('appUser')) {
    localStorage.setItem('appUser', JSON.stringify(DEFAULT_USER));
}

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('email').value.trim().toLowerCase();
    const passwordInput = document.getElementById('password').value;

    const storedUser = JSON.parse(localStorage.getItem('appUser'));

    if (
        emailInput === storedUser.email.toLowerCase() &&
        passwordInput === storedUser.password
    ) {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = './dashboard.html';
    } else {
        errorMsg.textContent = 'Invalid email or password.';
        errorMsg.style.color = '#ff4d4d';
    }
});