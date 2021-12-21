const { v1 } = require('uuid');

const getAll = require('./getAll');
const updateContacts = require('./updateContacts');

const add = async data => {
  const newContact = { id: v1(), ...data };
  const contacts = await getAll();
  contacts.push(newContact);

  await updateContacts(contacts);

  return newContact;
};

module.exports = add;
