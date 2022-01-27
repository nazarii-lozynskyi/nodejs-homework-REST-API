const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const jimp = require('jimp');

const { User } = require('../../model');
const { authenticate, upload } = require('../../middleware');

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

module.exports = router;
