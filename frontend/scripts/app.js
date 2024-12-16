let token = '';

async function signup() {
  const username = document.getElementById('signup-username').value;
  const password = document.getElementById('signup-password').value;

  await fetch('http://localhost:5000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  alert('Signup successful! You can now login.');
}

async function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  token = data.token;

  if (token) {
    document.getElementById('task-section').style.display = 'block';
    fetchTasks();
  }
}

async function fetchTasks() {
  const res = await fetch('http://localhost:5000/api/tasks', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const tasks = await res.json();
  const taskList = document.getElementById('tasks');
  taskList.innerHTML = tasks
    .map(
      (task) => `
    <li data-id="${task._id}" class="${task.editing ? 'editing' : ''}">
      <input 
        id="edit-${task._id}" 
        value="${task.title}" 
        onfocus="editTask('${task._id}')" 
        onblur="saveTask('${task._id}', this.value)"
      >
      <button class="delete" onclick="deleteTask('${task._id}')">Delete</button>
    </li>
  `
    )
    .join('');
}

async function createTask() {
  const title = document.getElementById('task-title').value;

  await fetch('http://localhost:5000/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title }),
  });

  fetchTasks();
}

async function deleteTask(id) {
  await fetch(`http://localhost:5000/api/tasks/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  fetchTasks();
}

function editTask(id) {
  const listItem = document.querySelector(`li[data-id="${id}"]`);
  listItem.classList.add('editing'); // Add underline to indicate edit mode
  const input = listItem.querySelector('input');
  input.focus(); // Ensure cursor blinks in the input field
}

async function saveTask(id, newTitle) {
  const listItem = document.querySelector(`li[data-id="${id}"]`);
  listItem.classList.remove('editing'); // Remove underline after saving changes

  await fetch(`http://localhost:5000/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: newTitle }),
  });

  fetchTasks();
}
