
const getId = (input) => {
  const value = input.value.trim();

  if (!value) {
    alert('Укажите ID');
    return null;
  }

  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    alert('ID должен быть положительным целым числом');
    return null;
  }

  return id;
};

const validateUsername = (input) => {
  if (!input.value.trim()) {
    alert('Укажите username');
    return false;
  }

  return true;
};

const validatePatch = (usernameInput, descriptionInput) => {
  if (!usernameInput.value.trim() && !descriptionInput.value.trim()) {
    alert('Укажите username или description');
    return false;
  }

  return true;
};

const validatePut = (usernameInput, descriptionInput) => {
  if (!usernameInput.value.trim() || !descriptionInput.value.trim()) {
    alert('Для PUT заполните username и description');
    return false;
  }

  return true;
};

module.exports = {
  getId,
  validateUsername,
  validatePatch,
  validatePut
};
