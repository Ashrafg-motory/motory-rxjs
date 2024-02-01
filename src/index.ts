
import { Observable , BehaviorSubject } from 'rxjs';
import { map, tap, filter } from 'rxjs/operators';

interface Todo {
  id: number;
  name: string;
  completed: boolean;
}

class TodoService {
  private todoList: Todo[] = [];
  private todoListSubject = new BehaviorSubject<Todo[]>([]);
  private nextId: number = 1;

  constructor() {
    this.getTodos();
  }

  private getTodos(): void {
    const storedData = localStorage.getItem('todoList');
    this.todoList = storedData ? JSON.parse(storedData) : [];
    this.updateNextId();
  }

  private updateNextId(): void {
    this.nextId = Math.max(...this.todoList.map((todo) => todo.id), 0) + 1;
  }

  public selectState(): Observable<Todo[]> {
    return this.todoListSubject.asObservable();
  }

  addTodo(name: string, completed: boolean = false): void {
    if (name.trim() !== '') {
      const newItem: Todo = { name, completed, id: this.nextId };
      this.todoList.unshift(newItem);
      this.nextId++;
      this.saveToLocalStorage();
      this.todoListSubject.next(this.todoList); // Emit new state
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('todoList', JSON.stringify(this.todoList));
  }

  removeTodo(id: number): void {
    this.todoList = this.todoList.filter((item) => item.id !== id);
      this.todoListSubject.next(this.todoList);
    this.saveToLocalStorage();
    this.renderTodoList();
  }

  toggleTodoStatus(id: number, completed: boolean = true): void {
    this.todoList = this.todoList.map((item) => item.id === id ? { ...item, completed } : item);
    this.todoListSubject.next(this.todoList);
    this.saveToLocalStorage();
    this.renderTodoList();
  }

  public renderTodoList(): void {
    const todoListContainer = document.getElementById('todoListContainer');
    if (todoListContainer) {
      todoListContainer.innerHTML = '';

      this.todoList.forEach((todo) => {
        const listItem = document.createElement('li');
        listItem.className = `list-item ${todo.completed ? 'checked' : ''}`;

        const contentDiv = document.createElement('div');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.classList.add('w-auto');
        checkbox.addEventListener('change', () => this.toggleTodoStatus(todo.id, checkbox.checked));
        
        contentDiv.appendChild(checkbox);

        const span = document.createElement('span');
        span.textContent = todo.name;

        contentDiv.appendChild(span);

        listItem.appendChild(contentDiv);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fa fa-trash"></i>';
        deleteButton.className = 'delete-btn';
        deleteButton.addEventListener('click', () => this.removeTodo(todo.id));

        listItem.appendChild(deleteButton);
        todoListContainer.appendChild(listItem);
      });
    }
  }
}

function initAppComponent(): void {
  const newTodo = document.getElementById('newTodo') as HTMLInputElement;
  const addBtn = document.getElementById('addBtn') as HTMLButtonElement;

  const todoService = new TodoService();

  function add(): void {
    if (newTodo.value) {
      todoService.addTodo(newTodo.value);
      newTodo.value = '';
    }
  }

  function onEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      add();
    }
  }

  function renderTodoList(): void {
    todoService.selectState().subscribe(() => {
      todoService.renderTodoList();
    });
  }

  addBtn.addEventListener('click', add);
  newTodo.addEventListener('keypress', onEnterKey);
  renderTodoList();
}

initAppComponent();
