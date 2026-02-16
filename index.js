const express=require('express');
const dotenv=require('dotenv').config();
const cors=require('cors');
const fs=require('fs');
const path=require('path');
const port=process.env.PORT || 3300
const pgClient = require('./db/pgClient');

const app=express();

app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded());


//dataabse connection
pgClient.connect()
.then((c)=>{console.log("Database Connected.");})
.catch(e=>{console.log(e);});

const tempDirectory=path.join(__dirname, "uploads", "temp");
const employeeDir=path.join(__dirname, "uploads", "employees");

if(!fs.existsSync(tempDirectory)){
  fs.mkdirSync(tempDirectory,{recursive:true})
}

if(!fs.existsSync(employeeDir)){
  fs.mkdirSync(employeeDir,{recursive:true})
}



app.use(
  "/static",
  express.static(path.join(__dirname, "uploads", "employees"))
);


app.get('/s4/health',(req,res)=>{
    return res.status(200).send({msg:"Health ok"});
})

app.use('/s4/api/v1/org',require('./router/orgRouter'));
app.use('/s4/api/v1/dept',require('./router/deptRouter'));
app.use('/s4/api/v1/user',require('./router/userRouter'));
app.use('/s4/api/v1/employee',require('./router/employeeRouter'));
app.use('/s4/api/v1/auth',require('./router/authRouter'));
app.use('/s4/api/v1/requisition',require('./router/requisitionRouter'));
app.use('/s4/api/v1/candidate',require('./router/candidateRouter'));

app.listen(port,()=>{
console.log(`Server running: http://localhost:${port}/`);
})

