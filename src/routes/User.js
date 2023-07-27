const express = require('express');
const router  = express.Router();

const controller  = require('../controller/User');

const tokenmdwr  = require('../middleware/Token');
const usermdwr  = require('../middleware/User');

router.get('/',tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_user_home);

router.get('/:page',tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_pages)

router.get('/folder/:id',tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_folder_pages)
module.exports=router;
