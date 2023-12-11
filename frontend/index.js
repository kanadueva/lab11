// Адрес для запроса на бэк
const BASE_URL = 'http://localhost:3000/api';

/**
 * Класс с бизнес логикой. Не имееет зависимостей - ядро приложения.
 */
class UsersModel {
  users = [];

  constructor() {
    this.users = [];
  }

  async fetchAllUsers() {
    try {
      const users = await fetch(`${BASE_URL}/getAll`, this._headersForGET());
      return users.json();
    } catch (e) {
      console.error(e);
      this.users = [];
      return [];
    }
  }

  async addUser(username, age, email) {
    try {
      const response = await fetch(
        `${BASE_URL}/post`,
        this._headersForPOST({ name: username, age: age, email: email })
      );
      return response.json();
    } catch (e) {
      console.error(e);
    }
  }

  async removeUser(id) {
    try {
      const response = await fetch(`${BASE_URL}/delete/${id}`, {
        method: 'DELETE',
      });
      console.log(response);
    } catch (e) {
      console.error(e);
    }
  }

  _headersForGET = () => {
    return {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    };
  };
  _headersForPOST = (body) => {
    return {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };
  };
}

/**
 * Класс-посрденик межу UI и моделью данных.
 * Зависит от модели.
 */
class UsersController {
  model;

  constructor(model) {
    this.model = model;
  }

  async handleGetAllUsers() {
    return await this.model.fetchAllUsers();
  }

  // Перед созданием пользователя (перед обращением к модели), провалидируем данные.
  async handleCreate(name, age, email) {
    if (!name || !age || !email) {
      alert('Заполнены не все поля формы');
      throw new Error('Заполнены не все поля формы');
    }

    if (email !== '') {
      const isValid = String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|.('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
      if (isValid === null) {
        alert('Невалидный email!');
        throw new Error('Невалидный email!');
      }
    }

    return await this.model.addUser(name, age, email);
  }

  handleRemove(id) {
    return this.model.removeUser(id);
  }
}

/**
 * Класс отвечает за UI (карточки, заголовок), а также обрабатывает пользовательские события.
 * Зависит от контроллера.
 */
class UsersView {
  controller;
  root;

  form;
  users;
  usernameInput;
  ageInput;
  emailInput;
  createButton;

  constructor(root, controller) {
    // Корневой HTML-элемент.
    this.root = root;
    // Контроллер управления (вызывается при обработке пользовательских действий).
    this.controller = controller;

    // Форма создания пользователя.
    this.createUserForm();
    // Отображение карточек пользователей.
    this.createUsersList();
    // Привяжем слушателей событий.
    this.bindListeners();
  }

  bindListeners() {
    this.createButton.addEventListener('click', this.onCreateClick);
  }

  onCreateClick = async () => {
    try {
      const newUser = await this.controller.handleCreate(
        this.usernameInput.value,
        Number(this.ageInput.value),
        this.emailInput.value
      );
      this.renderNewUser(newUser);
    } catch (e) {
      console.error(e);
    }
  };

  createUsersList() {
    this.users = document.createElement('div');
    this.users.className = 'users';
  }

  renderNewUser(user) {
    const userNode = document.createElement('div');
    userNode.appendChild(this.getUserElement(user));
    this.users.appendChild(userNode);
  }

  getUserElement(user) {
    const userWrapper = document.createElement('div');
    userWrapper.className = 'user';
    const userName = document.createElement('p');
    userName.innerText = `Client: ${user.name}`;
    const age = document.createElement('p');
    age.innerText = `Age: ${user.age}`;
    const email = document.createElement('p');
    email.innerText = `Email: ${user.email}`;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Удалить';
    removeBtn.className = 'remove_btn';
    removeBtn.addEventListener('click', () => {
      this.removeUser(userWrapper, user._id);
    });

    userWrapper.appendChild(userName);
    userWrapper.appendChild(age);
    userWrapper.appendChild(email);
    userWrapper.appendChild(removeBtn);

    return userWrapper;
  }

  async removeUser(userWrapper, userId) {
    await this.controller.handleRemove(userId);
    userWrapper.remove();
  }

  async renderUsers() {
    const users = await this.controller.handleGetAllUsers();
    users.map((user) => {
      this.users.appendChild(this.getUserElement(user));
      return this.getUserElement(user);
    });
  }

  createUserForm() {
    this.form = document.createElement('div');
    this.usernameInput = document.createElement('input');
    this.usernameInput.placeholder = 'Введите имя клиента';
    this.ageInput = document.createElement('input');
    this.ageInput.placeholder = 'Введите возраст';
    this.emailInput = document.createElement('input');
    this.emailInput.placeholder = 'Введите почту';
    this.createButton = document.createElement('button');
    this.createButton.className = 'create_btn';
    this.createButton.innerText = 'Создать';
    this.form.appendChild(this.usernameInput);
    this.form.appendChild(this.ageInput);
    this.form.appendChild(this.emailInput);
    this.form.appendChild(this.createButton);
  }

  mount() {
    this.root.innerHTML = `<h1>Клиенты</h1>`;
    this.root.appendChild(this.form);
    this.root.appendChild(this.users);
    this.renderUsers();
  }
}

const usersModel = new UsersModel();
// Передаем зависимоси от модели через конструктор.
const usersController = new UsersController(usersModel);
const usersView = new UsersView(
  document.getElementById('root'),
  usersController
);
// Рисуем UI.
usersView.mount();
