const $ = selector => document.querySelector(selector);
let registerMode = false;
async function api(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}
function toggleMode() {
  registerMode = !registerMode;
  $('#authTitle').textContent = registerMode ? 'Create your account' : 'Sign in to order';
  $('#authSubmit').textContent = registerMode ? 'Create account' : 'Sign in';
  $('#nameLabel').classList.toggle('hidden', !registerMode);
  $('#authText').innerHTML = registerMode ? 'Already have an account? <button type="button" class="link-button" id="toggleAuth">Sign in</button>' : 'New here? <button type="button" class="link-button" id="toggleAuth">Create an account</button>';
  $('#toggleAuth').onclick = toggleMode;
}
$('#toggleAuth').onclick = toggleMode;
$('#authForm').onsubmit = async event => {
  event.preventDefault();
  $('#authError').textContent = '';
  try {
    const body = registerMode ? { name: $('#name').value, email: $('#email').value, password: $('#password').value } : { email: $('#email').value, password: $('#password').value };
    const result = await api(registerMode ? '/api/auth/register' : '/api/auth/login', { method: 'POST', body: JSON.stringify(body) });
    localStorage.setItem('tb_token', result.token);
    localStorage.setItem('tb_user', JSON.stringify(result.user));
    window.location.assign('/index.html');
  } catch (error) { $('#authError').textContent = error.message; }
};