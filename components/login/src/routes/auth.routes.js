const express = require('express');
const { signinHandler, signupHandler } = require('../controllers/auth.controller');
const checkExistingUser = require('../middlewares/verifySignup');
const multer = require('multer');
// Set storage engine
const storage = multer.memoryStorage();

// Initialize multer upload
const upload = multer({ storage });

const router = express.Router();

  router.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.post('/signup', checkExistingUser, signupHandler);
  router.post('/signin', signinHandler);


module.exports = router;
