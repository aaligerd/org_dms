const express = require('express');
const { getAllDept, addDept } = require('../controller/deptController');
const deptRouter = express.Router();

deptRouter.get('/', getAllDept);
deptRouter.post('/add', addDept);

module.exports = deptRouter;
