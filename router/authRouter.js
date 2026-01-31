const express = require('express');
const { loginEmployee,resetPasswordByEmpid, resetToBasic } = require('../controller/authController');

const authRouter = express.Router();


authRouter.post('/login',loginEmployee);
authRouter.post('/password/reset',resetPasswordByEmpid);
authRouter.post('/password/reset/basic',resetToBasic);


module.exports = authRouter;
