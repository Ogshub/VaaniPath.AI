let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const taskList = document.getElementById('taskList');

// New: Elements for statistics
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');


// --- 1. Load and Render Tasks ---
function renderTasks() {
    taskList.innerHTML = ''; 

    // Sort tasks: Completed tasks go to the bottom, then sort by date/time (earliest first)
    tasks.sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        // Handle tasks without a dateTime by treating them as very far in the future
        const dateA = a.dateTime ? new Date(a.dateTime) : Infinity;
        const dateB = b.dateTime ? new Date(b.dateTime) : Infinity;
        return dateA - dateB;
    });

    tasks.forEach((task, index) => {
        const listItem = document.createElement('li');
        listItem.className = task.completed ? 'completed' : '';

        const taskDetails = document.createElement('span');
        let formattedDate = '';
        
        // Check if Date/Time exists
        if (task.dateTime) {
             formattedDate = new Date(task.dateTime).toLocaleString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }

        taskDetails.innerHTML = `
            <strong>${task.text}</strong> 
            ${formattedDate ? `<br><small>Due: ${formattedDate}</small>` : ''} 
        `;
        
        // ... (rest of the rendering code remains the same) ...
        listItem.appendChild(taskDetails);
        
        const actions = document.createElement('div');
        
        const completeBtn = document.createElement('button');
        completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
        completeBtn.style.backgroundColor = task.completed ? '#f0ad4e' : '#5cb85c';
        completeBtn.onclick = () => toggleComplete(index);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.backgroundColor = '#d9534f';
        deleteBtn.onclick = () => deleteTask(index);

        actions.appendChild(completeBtn);
        actions.appendChild(deleteBtn);
        listItem.appendChild(actions);

        taskList.appendChild(listItem);
    });

    updateStats(); // New function: Update statistics every time we render
    checkAlarms(); 
}

// --- New Function: Update Statistics ---
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalCount.textContent = total;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
}


// --- 2. Add New Task (Updated for Optional Date/Time) ---
function addTask() {
    const text = document.getElementById('taskInput').value.trim();
    const date = document.getElementById('dateInput').value;
    const time = document.getElementById('timeInput').value;
    
    if (!text) {
        alert("Please enter a task.");
        return;
    }

    let dateTime = null;
    
    // Only set dateTime if both date and time inputs are provided
    if (date && time) {
        dateTime = `${date}T${time}`;
    }

    tasks.push({ text, dateTime, completed: false });
    
    // Save to Local Storage (Persistence!)
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Clear inputs
    document.getElementById('taskInput').value = '';
    document.getElementById('dateInput').value = '';
    document.getElementById('timeInput').value = '';

    renderTasks();
}

// --- 3. Manage Tasks (Same) ---
function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

// --- 4. Alarm/Reminder Feature (Updated to check for dateTime presence) ---
function checkAlarms() {
    const now = new Date().getTime();
    
    tasks.forEach(task => {
        // Skip alarm check if dateTime is not set
        if (!task.dateTime) return; 

        const taskTime = new Date(task.dateTime).getTime();
        
        // Check if the task is overdue and not completed
        if (!task.completed && taskTime < now) {
            if (!task.alerted) { 
                alert(`🚨 TASK OVERDUE: ${task.text} was due at ${new Date(task.dateTime).toLocaleTimeString()}`);
                task.alerted = true; 
            }
        } 
    });
}

// Initialize the list when the page loads
renderTasks();

// Optional: Periodically check alarms (e.g., every minute)
setInterval(renderTasks, 1000);