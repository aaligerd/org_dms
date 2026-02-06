const express = require('express');
const { addEmployee, getEmployeeById, searchEmployee, updateEmployee } = require('../controller/employeeController');
const multer = require('multer');
const path=require('path');
const employeeRouter = express.Router();

const filepath_os=path.join(__dirname,"..","uploads/temp")
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,filepath_os);
    },
    filename:function(req,file,cb){
        const suffix=Date.now()+"_"+Math.round(Math.random()*1e5);
        cb(null,suffix+"_"+file.originalname);
    },
});

const upload=multer({storage});

// employeeRouter.get('/', getAllDept);
employeeRouter.post('/add',upload.any(),addEmployee);
employeeRouter.get('/search',searchEmployee);
employeeRouter.get('/:emp_id/:org_id',getEmployeeById);
employeeRouter.put('/update/:emp_org_id',upload.any(),updateEmployee );

module.exports = employeeRouter;
