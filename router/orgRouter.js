const express = require('express');
const { getAllOrg, addOrg } = require('../controller/orgController');

const orgRouter = express.Router();

orgRouter.get('/', getAllOrg);
orgRouter.post('/add', addOrg);

module.exports = orgRouter;
