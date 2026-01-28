const express=require('express');
const dotenv=require('dotenv').config();
const cors=require('cors');
const port=process.env.PORT || 3300
const pgClient = require('./db/pgClient');

const app=express();

app.use(cors("*"));
app.use(express.json());

//dataabse connection
pgClient.connect()
.then((c)=>{console.log("Database Connected.");})
.catch(e=>{console.log(e);});


app.get('/s4/health',(req,res)=>{
    return res.status(200).send({msg:"Health ok"});
})

app.use('/s4/api/v1/org',require('./router/orgRouter'));
app.use('/s4/api/v1/dept',require('./router/deptRouter'));
app.use('/s4/api/v1/user',require('./router/userRouter'));

app.listen(port,()=>{
console.log(`Server running: http://localhost:${port}/`);
})

