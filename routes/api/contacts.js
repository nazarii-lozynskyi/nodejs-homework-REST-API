const express = require('express');
const router = express.Router();

const { NotFound, BadRequest } = require('http-errors');

//const Joi = require('joi');
const { joiSchema } = require('../../model/contact');

const { Contact } = require('../../model');

router.get('/', async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const contact = await Contact.findById(id);

    if (!contact) {
      throw new NotFound();
    }

    res.json(contact);
  } catch (error) {
    if (error.message.includes('Cast to ObjectId failed')) {
      error.status = 404;
    }
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);

    if (error) {
      throw new BadRequest(error.message);
    }

    const newContact = await Contact.create(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    if (error.message.includes('Cast to ObjectId failed')) {
      error.status = 400;
    }
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    //const { error } = joiSchema.validate(req.body);

    //if (error) {
    //  throw new BadRequest(error.message);
    //}

    const { id } = req.params;
    const updateContact = await Contact.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updateContact) {
      throw new NotFound();
    }

    res.json(updateContact);
  } catch (error) {
    if (error.message.includes('Cast to ObjectId failed')) {
      error.status = 400;
    }

    next(error);
  }
});

router.patch('/:id/favorite', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { favorite } = req.body;

    const updateContact = await Contact.findByIdAndUpdate(
      id,
      { favorite },
      {
        new: true,
      }
    );

    if (!updateContact) {
      throw new NotFound();
    }

    res.json(updateContact);
  } catch (error) {
    if (error.message.includes('Cast to ObjectId failed')) {
      error.status = 400;
    }

    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleteContact = await Contact.findByIdAndRemove(id);

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
