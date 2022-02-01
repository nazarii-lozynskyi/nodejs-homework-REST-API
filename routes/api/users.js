const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const jimp = require('jimp');
const { NotFound, BadRequest } = require('http-errors');

const { SITE_NAME } = process.env;

const { User } = require('../../model');
const { authenticate, upload } = require('../../middleware');
const { sendEmail } = require('../../sendgrid/helpers');

const router = express.Router();

const avatarDir = path.join(__dirname, '../../', 'public', 'avatars');

router.get('/current', authenticate, async (req, res, next) => {
  const { name, email } = req.user;

  res.json({ user: { name, email } });
});

router.get('/logout', authenticate, async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });

  res.status(204).send();
});

router.patch(
  '/avatars',
  authenticate,
  upload.single('avatar'),
  async (req, res, next) => {
    try {
      const { path: tempUpload, filename } = req.file;

      const image = await jimp.read(tempUpload);
      await image.resize(250, 250);
      await image.writeAsync(tempUpload);

      const [extension] = filename.split('.').reverse();
      const newFileName = `${req.user._id}.${extension}`;
      const fileUpload = path.join(avatarDir, newFileName);

      await fs.rename(tempUpload, fileUpload);

      const avatarURL = path.join('avatars', newFileName);

      await User.findByIdAndUpdate(req.user._id, { avatarURL }, { new: true });

      res.json({ avatarURL });
    } catch (error) {
      if (error.message.includes('Not authorized')) {
        error.status = 401;
      }
      next(error);
    }
  }
);

router.get('/verify:verificationToken', async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      throw new NotFound('User not found');
    }

    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });

    res.json({ message: 'Verification successful' });
  } catch (error) {
    next(error);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new BadRequest('Missing required field email');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFound('User not found');
    }

    if (user.verify) {
      throw new BadRequest('Verification has already been passed');
    }

    const { verificationToken } = user;
    const data = {
      to: email,
      subject: 'Verification email',
      html: `<a target="_blank" href="${SITE_NAME}/users/verify/${verificationToken}">Verification email</a>`,
    };

    await sendEmail(data);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
