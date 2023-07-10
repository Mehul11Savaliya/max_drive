var express = require('express');
var router = express.Router();

let PageUtil = require('../utils/PageData');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('auth-sign-in.ejs', { data: PageUtil.generateSigninPageData() });
});
router.get('/signup', function(req, res, next) {
  res.render('auth-sign-up.ejs', { data: PageUtil.generateSignupPageData() });
});

module.exports = router;
