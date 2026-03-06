document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    
    try {
      const response = await fetch('/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = '/admin';
      } else {
        showError(data.error || 'Login failed');
      }
    } catch (error) {
      showError('Network error. Please try again.');
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  }
});
