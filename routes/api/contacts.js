const express = require('express');
const router = express.Router();

const { NotFound, BadRequest } = require('http-errors');

const Joi = require('joi');

const contactsOperations = require('../../model/contacts');

const joiSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
});

router.get('/', async (req, res, next) => {
  try {
    const contacts = await contactsOperations.getAll();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const contact = await contactsOperations.getById(id);

    if (!contact) {
      throw new NotFound();
    }

    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);

    if (error) {
      throw new BadRequest(error.message);
    }

    const newContact = await contactsOperations.add(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);

    if (error) {
      throw new BadRequest(error.message);
    }

    const { id } = req.params;
    const updateContact = await contactsOperations.updateById({
      id,
      ...req.body,
    });

    if (!updateContact) {
      throw new NotFound();
    }

    res.json(updateContact);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleteContact = await contactsOperations.removeById(id);

    if (!deleteContact) {
      throw new NotFound();
    }

    // res.json({ message: 'Contact delete' });

    res.json(deleteContact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
