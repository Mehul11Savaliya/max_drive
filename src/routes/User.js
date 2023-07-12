const express = require('express');
const router  = express.Router();

const controller  = require('../controller/User');

const tokenmdwr  = require('../middleware/Token');
const usermdwr  = require('../middleware/User');

router.get('/',tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_user_home);

module.exports=router;
