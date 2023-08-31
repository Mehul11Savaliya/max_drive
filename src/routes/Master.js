const express = require("express");
const router = express.Router();

const controller  = require("../controller/Master");

router.get("/filter",controller.get_master_filter);
router.post("/",controller.post_master);

module.exports=router;