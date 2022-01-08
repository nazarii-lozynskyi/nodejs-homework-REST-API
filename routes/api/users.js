const express = require('express');

const { User } = require('../../model');
const { authenticate } = require('../../middleware');

const router = express.Router();

router.get('/current', authenticate, async (req, res, next) => {
  const { name, email } = req.user;

  res.json({ user: { name, email } });
});

router.get('/logout', authenticate, async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });

  res.status(204).send();
});

module.exports = router;
