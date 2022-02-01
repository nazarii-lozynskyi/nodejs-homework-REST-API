const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const { SENDGRID_API_KEY } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const email = {
  to: 'nazarko.l.m@gmail.com',
  from: 'proAuto-SHOP',
  subject: 'New ',
  html: '<p>gghghghhghgh</p>',
};

sgMail
  .send(email)
  .then(() => console.log('Email send success'))
  .catch(error => console.log(error.message));
