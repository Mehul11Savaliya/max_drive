const express = require('express');
const router  = express.Router();

const controller  = require('../controller/User');

router.get('/',controller.get_user_home);

module.exports=router;
