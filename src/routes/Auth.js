const express  = require("express");
const router = express.Router();

const authctr  = require("../controller/Auth");

router.post('/signin',authctr.auth_sign_in);
router.post('/signup',authctr.auth_sign_up);
router.get("/:id/screen/varifyotp",authctr.get_otp_sceen);
router.post("/varifyotp",authctr.auth_varify_otp);
router.get("/:id/sendotp",authctr.send_otp);

module.exports=router;