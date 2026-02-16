const pgClient = require('../db/pgClient');
const { generatePublicToken } = require('../utils/crypto');
const { getDateAfter3Days } = require('../utils/getDateAfterDays');
const { sendSignupLinkMail } = require('../utils/mailSender');


/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const genTempCodeAndSendMail=async(req,res)=>{
/** @type {{email:String,position_id:Number}} */
let {email,position_id}=req.body;
    let insertQ="insert into tbl_candidate (temp_id, temp_id_valid_upto, email, req_id) values($1,$2,$3,$4);";
try{
    const getReqRole=await getRoleById(position_id);
    if(!getReqRole){
        return res.status(500).send({msg:"Open position is not valid."});
    }
    const tempToken=generatePublicToken();
    const validUpto=getDateAfter3Days();
    console.log(tempToken,validUpto,email,position_id)
    const {rowCount}=await pgClient.query(insertQ,[tempToken,validUpto,email,position_id]);
    if(rowCount===1){
        //send mail
        const mail_response=await sendSignupLinkMail(email,getReqRole,tempToken,validUpto);
        console.log(mail_response);
        return res.status(200).send({msg:"Mail Send to candidate."});
    }
    return res.status(200).send({msg:"Mail send"});
}catch(error){
console.log(error);
return res.status(500).send({msg:'Error: '+error});
}
}

const getRoleById=async(role_id)=>{
    const getQ="select req_pos_title from tbl_req where req_id=$1;"
    try {
        const {rows,rowCount}=await pgClient.query(getQ,[role_id]);
        if(rowCount===1){
            return rows[0]['req_pos_title'];
        }else{
            return null;
        }
    } catch (error) {
        return null;
    }
}


module.exports={genTempCodeAndSendMail}