const express = require('express');
const { getAllUsers, addUser } = require('../controller/userController');

const userRouter = express.Router();

userRouter.get('/', getAllUsers);
userRouter.post('/add', addUser);


module.exports = userRouter;
