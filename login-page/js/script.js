/**
 * Exofo Login Page - Interactive Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const loginForm = document.getElementById('loginForm');
  const loginIdInput = document.getElementById('loginId');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const eyeOpenIcon = document.querySelector('.eye-open-icon');
  const eyeClosedIcon = document.querySelector('.eye-closed-icon');
  const loginButton = document.getElementById('loginButton');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const toastContainer = document.getElementById('toastContainer');

  // Preview Mode Elements
  const btnFullView = document.getElementById('btnFullView');
  const btnPhoneView = document.getElementById('btnPhoneView');

  // --------------------------------------------------------------------------
  // 1. Password Visibility Toggle
  // --------------------------------------------------------------------------
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isPassword = passwordInput.getAttribute('type') === 'password';

      if (isPassword) {
        passwordInput.setAttribute('type', 'text');
        eyeOpenIcon.style.display = 'none';
        eyeClosedIcon.style.display = 'block';
        togglePasswordBtn.setAttribute('aria-label', 'Hide password');
        togglePasswordBtn.setAttribute('title', 'Hide password');
      } else {
        passwordInput.setAttribute('type', 'password');
        eyeOpenIcon.style.display = 'block';
        eyeClosedIcon.style.display = 'none';
        togglePasswordBtn.setAttribute('aria-label', 'Show password');
        togglePasswordBtn.setAttribute('title', 'Show password');
      }

      passwordInput.focus();
    });
  }

  // --------------------------------------------------------------------------
  // 2. Clear Field Validation Error on Typing
  // --------------------------------------------------------------------------
  function clearError(fieldGroup, errorElement) {
    fieldGroup.classList.remove('has-error');
    errorElement.textContent = '';
  }

  function setError(fieldGroup, errorElement, message) {
    fieldGroup.classList.add('has-error');
    errorElement.textContent = message;

    // Subtle shake animation
    fieldGroup.classList.remove('shake');
    void fieldGroup.offsetWidth; // trigger reflow
    fieldGroup.classList.add('shake');
  }

  const groupLoginId = document.getElementById('groupLoginId');
  const errorLoginId = document.getElementById('errorLoginId');
  const groupPassword = document.getElementById('groupPassword');
  const errorPassword = document.getElementById('errorPassword');

  loginIdInput.addEventListener('input', () => {
    if (groupLoginId.classList.contains('has-error')) {
      clearError(groupLoginId, errorLoginId);
    }
  });

  passwordInput.addEventListener('input', () => {
    if (groupPassword.classList.contains('has-error')) {
      clearError(groupPassword, errorPassword);
    }
  });

  // --------------------------------------------------------------------------
  // 3. Form Submission Handling
  // --------------------------------------------------------------------------
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    const loginIdValue = loginIdInput.value.trim();
    const passwordValue = passwordInput.value;

    if (!loginIdValue) {
      setError(groupLoginId, errorLoginId, 'Please enter your login ID');
      if (isValid) loginIdInput.focus();
      isValid = false;
    } else {
      clearError(groupLoginId, errorLoginId);
    }

    if (!passwordValue) {
      setError(groupPassword, errorPassword, 'Please enter your password');
      if (isValid) passwordInput.focus();
      isValid = false;
    } else {
      clearError(groupPassword, errorPassword);
    }

    if (!isValid) return;

    // Show Loading state
    loginButton.classList.add('loading');
    loginButton.disabled = true;

    // Simulate authenticating with Exofo Backend
    setTimeout(() => {
      loginButton.classList.remove('loading');
      loginButton.disabled = false;

      showToast(`Welcome back, ${loginIdValue}! Signing into Exofo...`, 'success');

      // Optional demo: clear password
      passwordInput.value = '';
    }, 1200);
  });

  // --------------------------------------------------------------------------
  // 4. Forgot Password Flow
  // --------------------------------------------------------------------------
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      const loginId = loginIdInput.value.trim();
      if (loginId) {
        showToast(`Password recovery link dispatched for "${loginId}".`, 'success');
      } else {
        showToast('Please enter your login ID first to recover your password.', 'error');
        loginIdInput.focus();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. Toast Notification System
  // --------------------------------------------------------------------------
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconSvg = type === 'success' 
      ? `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
      : `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    toast.innerHTML = `
      ${iconSvg}
      <span>${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'all 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-15px) scale(0.95)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function escapeHtml(string) {
    const div = document.createElement('div');
    div.textContent = string;
    return div.innerHTML;
  }

  // --------------------------------------------------------------------------
  // 6. Preview Mode Controls (Responsive vs Mobile Frame)
  // --------------------------------------------------------------------------
  if (btnFullView && btnPhoneView) {
    btnFullView.addEventListener('click', () => {
      document.body.classList.remove('phone-frame-active');
      btnFullView.classList.add('active');
      btnPhoneView.classList.remove('active');
    });

    btnPhoneView.addEventListener('click', () => {
      document.body.classList.add('phone-frame-active');
      btnPhoneView.classList.add('active');
      btnFullView.classList.remove('active');
    });
  }
});

