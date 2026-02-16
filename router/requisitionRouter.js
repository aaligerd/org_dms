const express = require('express');
const { addRequisition, getAllRequisition, searchRequisition, getRequisitionById, updateRequisitionById, getOpenPositionList } = require('../controller/requisitionController');
const requisitionRouter = express.Router();

requisitionRouter.get('/',getAllRequisition);
requisitionRouter.post('/search',searchRequisition);
requisitionRouter.post('/get/byid',getRequisitionById);
requisitionRouter.post('/add',addRequisition);
requisitionRouter.post('/update/byid',updateRequisitionById);
requisitionRouter.get('/get/position',getOpenPositionList);


module.exports = requisitionRouter;
