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

    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.getElementById('mainMenu');
    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = mainMenu.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
        });

        mainMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                mainMenu.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const currentYear = document.getElementById('currentYear');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
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

function handleRegister(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = formData.get('email')?.trim() || '';
    const phone = formData.get('phone')?.trim() || '';
    const password = formData.get('password') || '';

    if (!validateEmail(email)) {
        showError('registerEmailError', 'Ingresa un correo válido.');
        return false;
    }

    if (!/^\+?[0-9\s()-]{7,}$/.test(phone)) {
        showError('phoneError', 'Ingresa un número de teléfono válido.');
        return false;
    }

    if (password.length < 6) {
        showError('registerPasswordError', 'La contraseña debe tener al menos 6 caracteres.');
        return false;
    }

    localStorage.setItem('veterinariaSanMarcosRegisteredUser', JSON.stringify({
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email,
        phone,
        password
    }));

    alert('Registro completado correctamente.');
    window.location.href = 'login.html';
    return false;
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
window.handleRegister = handleRegister;
window.togglePassword = togglePassword;
