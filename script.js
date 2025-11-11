// script.js — DOM selection & manipulation starter

// Contract (simple):
// - Inputs: user types todo text and submits the form
// - Outputs: renders a list item with toggle and remove controls
// - Error modes: empty input is ignored by HTML 'required'

// Key DOM references
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const countEl = document.getElementById('count');

// In-memory model (array of {id, text, done})
let todos = [];
let idCounter = 1;

function render() {
	// Clear list
	todoList.innerHTML = '';

	// Render each todo
	todos.forEach(todo => {
		// Create elements
		const li = document.createElement('li');
		li.dataset.id = todo.id;
		li.className = todo.done ? 'completed' : '';

		const text = document.createElement('div');
		text.className = 'text';
		text.textContent = todo.text;

		const controls = document.createElement('div');
		controls.className = 'controls';

		const toggleBtn = document.createElement('button');
		toggleBtn.type = 'button';
		toggleBtn.className = 'toggle-btn';
		toggleBtn.textContent = todo.done ? 'Undo' : 'Done';

		const removeBtn = document.createElement('button');
		removeBtn.type = 'button';
		removeBtn.className = 'remove-btn';
		removeBtn.textContent = 'Remove';

		// Assemble
		controls.appendChild(toggleBtn);
		controls.appendChild(removeBtn);
		li.appendChild(text);
		li.appendChild(controls);
		todoList.appendChild(li);
	});

	// Update count
	countEl.textContent = `${todos.length} item${todos.length !== 1 ? 's' : ''}`;
}

// Event: add todo
todoForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const value = todoInput.value.trim();
	if (!value) return;

	const newTodo = { id: idCounter++, text: value, done: false };
	todos.push(newTodo);
	todoInput.value = '';
	render();
	todoInput.focus();
});

// Event delegation: handle clicks on toggle/remove buttons
todoList.addEventListener('click', (e) => {
	const btn = e.target.closest('button');
	if (!btn) return;

	const li = btn.closest('li');
	if (!li) return;
	const id = Number(li.dataset.id);

	if (btn.classList.contains('remove-btn')) {
		// Remove from model
		todos = todos.filter(t => t.id !== id);
		render();
	} else if (btn.classList.contains('toggle-btn')) {
		// Toggle done
		todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
		render();
	}
});

// Initial render (empty)
render();

// Expose for debugging in the console (optional)
window._todos = todos;
