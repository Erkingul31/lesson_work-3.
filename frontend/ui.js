
const moment = require('moment');
require('moment/locale/ru');
moment.locale('ru');

const uniq = require('uniq');

const { requester, getHistory, clearHistory } = require('./api');

const {
  getId,
  validateUsername,
  validatePatch,
  validatePut
} = require('./validation');

const output = document.getElementById('output');
const statusElement = document.getElementById('status');
const result = document.getElementById('result');

const idInput = document.getElementById('userId');
const usernameInput = document.getElementById('username');
const descriptionInput = document.getElementById('description');

const usersTable = document.getElementById('usersTable');
const usersBody = document.getElementById('usersBody');
const filters = document.getElementById('filters');

const historyBody = document.getElementById('historyBody');
const clearHistoryButton = document.getElementById('clear-history');

const btnGetAll = document.getElementById('btn-get-all');
const btnGetDetail = document.getElementById('btn-get-one');
const btnPost = document.getElementById('btn-post');
const btnPut = document.getElementById('btn-put');
const btnPatch = document.getElementById('btn-patch');
const btnDelete = document.getElementById('btn-delete');

let users = [];
let activeFilter = 'Все';

const trimmed = (input) => input.value.trim();

const showResult = (status, data) => {
  output.style.display = 'block';

  statusElement.textContent = `Статус: ${status}`;
  statusElement.className =
    status === 'Ошибка' || status >= 400
      ? 'status err'
      : 'status ok';

  if (Array.isArray(data)) {
    result.style.display = 'none';
    usersTable.style.display = 'table';
    filters.style.display = 'flex';

    users = data;
    renderFilters();
    renderUsers();
  } else {
    result.style.display = 'block';
    result.textContent = JSON.stringify(data, null, 2);
    usersTable.style.display = 'none';
    filters.style.display = 'none';
  }
};

const renderUsers = () => {
  usersBody.innerHTML = '';

  const filteredUsers = activeFilter === 'Все'
    ? users
    : users.filter(user => user.description === activeFilter);

  filteredUsers.forEach(user => {
    const row = document.createElement('tr');

    [user.id, user.username, user.description].forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value ?? '';
      row.appendChild(cell);
    });

    row.addEventListener('click', () => {
      idInput.value = user.id;
      usernameInput.value = user.username ?? '';
      descriptionInput.value = user.description ?? '';
    });

    usersBody.appendChild(row);
  });
};

const renderFilters = () => {
  filters.innerHTML = '';

  const descriptions = users
    .map(user => user.description)
    .filter(description => description);

  const uniqueDescriptions = uniq(descriptions.sort());

  const filterValues = ['Все', ...uniqueDescriptions];

  filterValues.forEach(description => {
    const button = document.createElement('button');

    button.textContent = description;
    button.className = activeFilter === description ? 'active' : '';

    button.addEventListener('click', () => {
      activeFilter = description;
      renderFilters();
      renderUsers();
    });

    filters.appendChild(button);
  });
};

const renderHistory = () => {
  historyBody.innerHTML = '';

  getHistory().forEach(item => {
    const row = document.createElement('tr');

    const values = [
      item.method,
      item.url,
      item.status,
      moment(item.time).format('DD.MM.YYYY HH:mm:ss'),
      moment(item.time).fromNow()
    ];

    values.forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });

    historyBody.appendChild(row);
  });
};

const runRequest = async (method, id, payload) => {
  const response = await requester(method, id, payload);

  if (!response) return;

  showResult(response.status, response.data);
  renderHistory();

  if (
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) &&
    response.status >= 200 &&
    response.status < 300
  ) {
    activeFilter = 'Все';
    const updatedUsers = await requester('GET');

    if (updatedUsers) {
      showResult(updatedUsers.status, updatedUsers.data);
    }

    renderHistory();
  }
};

const getAll = () => {
  activeFilter = 'Все';
  runRequest('GET');
};

const getOne = () => {
  const id = getId(idInput);
  if (id === null) return;

  runRequest('GET', id);
};

const create = () => {
  if (!validateUsername(usernameInput)) return;

  runRequest('POST', null, {
    username: trimmed(usernameInput),
    description: trimmed(descriptionInput)
  });
};

const put = () => {
  const id = getId(idInput);
  if (id === null) return;

  if (!validatePut(usernameInput, descriptionInput)) return;

  runRequest('PUT', id, {
    username: trimmed(usernameInput),
    description: trimmed(descriptionInput)
  });
};

const patch = () => {
  const id = getId(idInput);
  if (id === null) return;

  if (!validatePatch(usernameInput, descriptionInput)) return;

  const payload = {};

  if (trimmed(usernameInput)) {
    payload.username = trimmed(usernameInput);
  }

  if (trimmed(descriptionInput)) {
    payload.description = trimmed(descriptionInput);
  }

  runRequest('PATCH', id, payload);
};

const deleteUser = () => {
  const id = getId(idInput);
  if (id === null) return;

  runRequest('DELETE', id);
};

const clearHistoryButtonHandler = () => {
  clearHistory();
  renderHistory();
};

btnGetAll.addEventListener('click', getAll);
btnGetDetail.addEventListener('click', getOne);
btnPost.addEventListener('click', create);
btnPut.addEventListener('click', put);
btnPatch.addEventListener('click', patch);
btnDelete.addEventListener('click', deleteUser);

clearHistoryButton.addEventListener('click', clearHistoryButtonHandler);

window.addEventListener('historyUpdated', renderHistory);

output.style.display = 'block';

renderHistory();

setInterval(renderHistory, 1000);