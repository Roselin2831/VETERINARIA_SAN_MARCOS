document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const toggleButton = document.querySelector('.toggle-password');

    if (form) {
        form.addEventListener('submit', handleLogin);
    }

    if (toggleButton && passwordInput) {
        toggleButton.addEventListener('click', togglePassword);
    }

    const rememberedUser = localStorage.getItem('veterinariaSanMarcosUser');
    if (rememberedUser && emailInput) {
        emailInput.value = rememberedUser;
    }
});

function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearErrors() {
    showError('emailError', '');
    showError('passwordError', '');
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function handleLogin(event) {
    event.preventDefault();
    clearErrors();

    const email = document.getElementById('email')?.value.trim() || '';
    const password = document.getElementById('password')?.value.trim() || '';
    const remember = document.getElementById('remember')?.checked || false;

    let isValid = true;

    if (!email) {
        showError('emailError', 'El correo o usuario es obligatorio.');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('emailError', 'Ingresa un correo válido.');
        isValid = false;
    }

    if (!password) {
        showError('passwordError', 'La contraseña es obligatoria.');
        isValid = false;
    }

    if (!isValid) {
        return false;
    }

    if (remember) {
        localStorage.setItem('veterinariaSanMarcosUser', email);
    } else {
        localStorage.removeItem('veterinariaSanMarcosUser');
    }

    console.log('Inicio de sesión exitoso para:', email);
    alert('¡Bienvenido! Inicio de sesión exitoso.');
    window.location.href = 'index.html';

    return false;
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.toggle-password');

    if (!passwordInput || !toggleButton) {
        return;
    }

    const isPasswordHidden = passwordInput.type === 'password';
    passwordInput.type = isPasswordHidden ? 'text' : 'password';
    toggleButton.textContent = isPasswordHidden ? '🙈' : '👁️';
}

window.handleLogin = handleLogin;
window.togglePassword = togglePassword;
