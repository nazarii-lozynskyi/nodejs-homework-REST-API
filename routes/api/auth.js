const express = require('express');
const gravatar = require('gravatar');

const { BadRequest, Conflict, Unauthorized } = require('http-errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

const { User } = require('../../model');
const { joiRegisterSchema, joiLoginSchema } = require('../../model/user');
const { sendEmail } = require('../../sendgrid/helpers');

const router = express.Router();

const { SECRET_KEY, SITE_NAME } = process.env;

// router.post('/singup')
router.post('/register', async (req, res, next) => {
  try {
    const { error } = joiRegisterSchema.validate(req.body);

    if (error) {
      throw new BadRequest(error.message);
    }
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      throw new Conflict('User already exist');
    }

    // const newUser = new User({ name, email });
    // newUser.setPassword(password);
    // const result = newUser.save();

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const verificationToken = nanoid();

    const avatarURL = gravatar.url(email);

    const newUser = await User.create({
      name,
      email,
      verificationToken,
      password: hashPassword,
      avatarURL,
    });

    const data = {
      to: email,
      subject: 'Verification email',
      html: `<a target="_blank" href="${SITE_NAME}/users/verify/${verificationToken}">Verification email</a>`,
    };

    await sendEmail(data);

    res
      .status(201)
      .json({ user: { name: newUser.name, email: newUser.email } });
  } catch (error) {
    next(error);
  }
});

// router.post('/singin')
router.post('/login', async (req, res, next) => {
  try {
    const { error } = joiLoginSchema.validate(req.body);

    if (error) {
      throw new BadRequest(error.message);
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new Unauthorized('Email or password is wrong');
    }

    if (!user.verify) {
      throw new Unauthorized('Email not verify');
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw new Unauthorized('Email or password is wrong');
    }

    //if (!user) {
    //  throw new Unauthorized('Email not found');
    //}

    //// const passwordCompare = user.comparePassword(password);
    //const passwordCompare = await bcrypt.compare(password, user.password);

    //if (!passwordCompare) {
    //  throw new Unauthorized('Password wrong');
    //}

    const { _id, name } = user;
    const payload = { id: _id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
    await User.findByIdAndUpdate(_id, { token });
    res.json({ token, user: { email, name } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
