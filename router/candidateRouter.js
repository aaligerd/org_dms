const express = require('express');
const { genTempCodeAndSendMail } = require('../controller/candidateController');
const candidateRouter = express.Router();

candidateRouter.post('/gen/temp',genTempCodeAndSendMail)

module.exports = candidateRouter;
