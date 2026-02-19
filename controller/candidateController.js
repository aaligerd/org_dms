const pgClient = require('../db/pgClient');
const { generatePublicToken } = require('../utils/crypto');
const { getDateAfter3Days } = require('../utils/getDateAfterDays');
const { sendSignupLinkMail } = require('../utils/mailSender');
const fs = require('fs');
const path = require('path');
const { createAdminLog } = require('../utils/logWriter');

/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const genTempCodeAndSendMail = async (req, res) => {
    /** @type {{email:String,position_id:Number}} */
    let { email, position_id } = req.body;
    let insertQ = "insert into tbl_candidate (temp_id, temp_id_valid_upto, email, req_id) values($1,$2,$3,$4);";
    try {
        const getReqRole = await getRoleById(position_id);
        if (!getReqRole) {
            return res.status(500).send({ msg: "Open position is not valid." });
        }
        const tempToken = generatePublicToken();
        const validUpto = getDateAfter3Days();
        console.log(tempToken, validUpto, email, position_id)
        const { rowCount } = await pgClient.query(insertQ, [tempToken, validUpto, email, position_id]);
        if (rowCount === 1) {
            //send mail
            const mail_response = await sendSignupLinkMail(email, getReqRole, tempToken, validUpto);
            return res.status(200).send({ msg: "Mail Send to candidate." });
        }
        return res.status(200).send({ msg: "Mail send" });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error: ' + error });
    }
}


/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const checkTempCode = async (req, res) => {
    /** @type {{temp_code:String}} */
    const { temp_code } = req.body;
    const getTokenQ = "select temp_id_valid_upto from tbl_candidate where temp_id=$1;";
    try {
        const { rowCount, rows } = await pgClient.query(getTokenQ, [temp_code]);
        if (rowCount === 1) {
            const temp_date = new Date(rows[0]['temp_id_valid_upto']);
            const currentDate = new Date();
            if (currentDate.getDate() <= temp_date.getDate()) {
                return res.status(200).send({ msg: "Link valid.", valid: true });
            } else {
                return res.status(200).send({ msg: "Link expired", valid: false });
            }
        } else {
            return res.status(500).send({ msg: "Invalid token." });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error: ' + error });
    }
}

/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const uploadDoc = async (req, res) => {
    /** @type {{doc_name:String}} */
    // const docNamesWithCols = {
    //     resume: "cv",
    //     photo: "photo"
    // }
    const { doc_name } = req.body;
    try {
        // if (!docNamesWithCols[doc_name]) {
        //     return res.status(500).send({ msg: "Invalid field name." });
        // }
        // const colname = docNamesWithCols[doc_name];
        const saveFolderName = path.join(__dirname, "..", "uploads/candidates")
        checkFolderAndCreateIfNotAvailable(saveFolderName);
        const fileName = req.files[0]['filename'];
        const filePath = req.files[0]['path'];
        const newFilePath = path.join(saveFolderName, fileName);
        fs.renameSync(filePath, newFilePath);
        return res.status(200).send({msg:"File saved.",filepath:fileName});
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error: ' + error });
    }
}


/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const saveCandidateData = async (req, res) => {
    /** @type {{cname:String,phone:String,photo:String,cv:String,temp_code:String}} */
    const { cname,phone,photo,cv,temp_code } = req.body;
        if(!cname||cname.trim()===""||!phone||phone.trim()===""||!photo||photo.trim()===""||!cv|| cv.trim()===""||!temp_code||temp_code.trim()===""){
            return res.status(500).send({msg:"Please provide mandetory fields"});
        }
        const updateQ="update tbl_candidate set name=$1,phone=$2,cv=$3,photo=$4,candidate_temp_url_status='close' where temp_id=$5 and temp_id_valid_upto<date_add(NOW(),'1 day') and candidate_temp_url_status='open'";
    try {
        const{rowCount}=await pgClient.query(updateQ,[cname,phone,cv,photo,temp_code]);
        if(rowCount===1){
            return res.status(200).send({msg:"You data updated."});
        }else{
            return res.status(500).send({msg:"Data already updated."});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error: ' + error });
    }
}

const getRoleById = async (role_id) => {
    const getQ = "select req_pos_title from tbl_req where req_id=$1;"
    try {
        const { rows, rowCount } = await pgClient.query(getQ, [role_id]);
        if (rowCount === 1) {
            return rows[0]['req_pos_title'];
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

const checkFolderAndCreateIfNotAvailable = (foldername) => {
    if (!fs.existsSync(foldername)) {
        fs.mkdirSync(foldername);
    }
}


module.exports = { genTempCodeAndSendMail, checkTempCode, saveCandidateData, uploadDoc }