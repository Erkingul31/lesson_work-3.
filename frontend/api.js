
const BASE_API = 'http://localhost:3000/users';

const saveHistory = (method, url, status) => {
  const history = JSON.parse(localStorage.getItem('requestHistory')) || [];

  history.unshift({
    method,
    url,
    status,
    time: new Date().toISOString()
  });

  localStorage.setItem('requestHistory', JSON.stringify(history));
  window.dispatchEvent(new Event('historyUpdated'));
};

const requester = async (method, id, payload) => {
  const needsId = ['PUT', 'PATCH', 'DELETE'];

  if (needsId.includes(method)) {
    const userId = Number(id);

    if (
      id === null ||
      id === undefined ||
      String(id).trim() === '' ||
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      alert('Укажите корректный ID пользователя!');
      return null;
    }

    id = userId;
  }

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) {
      alert('Введите данные пользователя!');
      return null;
    }
  }

  const url = `${BASE_API}${id ? `/${id}` : ''}`;

  try {
    const settings = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (payload) {
      settings.body = JSON.stringify(payload);
    }

    const response = await fetch(url, settings);
    const data = await response.json().catch(() => null);

    saveHistory(method, url, response.status);

    return {
      status: response.status,
      data
    };
  } catch (error) {
    saveHistory(method, url, 'Ошибка');

    return {
      status: 'Ошибка',
      data: error.message
    };
  }
};

const getHistory = () => {
  return JSON.parse(localStorage.getItem('requestHistory')) || [];
};

const clearHistory = () => {
  localStorage.removeItem('requestHistory');
  window.dispatchEvent(new Event('historyUpdated'));
};

module.exports = {
  requester,
  getHistory,
  clearHistory
};
