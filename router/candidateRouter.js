const express = require('express');
const { genTempCodeAndSendMail, checkTempCode, saveCandidateData, uploadDoc } = require('../controller/candidateController');
const candidateRouter = express.Router();
const multer = require('multer');
const path=require('path');

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

candidateRouter.post('/gen/temp',genTempCodeAndSendMail)
candidateRouter.post('/check/tempcode',checkTempCode)
candidateRouter.post('/upload/doc',upload.any(),uploadDoc)
candidateRouter.post('/save',saveCandidateData)

module.exports = candidateRouter;
