const express  = require("express");
const router = express.Router();

const authctr  = require("../controller/Auth");

router.post('/signin',authctr.auth_sign_in);
router.post('/signup',authctr.auth_sign_up);

module.exports=router;