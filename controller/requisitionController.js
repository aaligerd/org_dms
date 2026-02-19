const pgClient = require('../db/pgClient');

/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const addRequisition = async (req, res) => {
    /** @type {{req_pos_title:String,req_org:String,req_dept:String,req_reqst_by:String,req_person_need:Number,req_reason:String,req_brif:String}} */
    let { req_pos_title, req_org, req_dept, req_reqst_by, req_person_need, req_reason, req_brif } = req.body;

    if (!req_pos_title || req_pos_title.trim().length === 0 || !req_org || !req_dept || !req_reqst_by || req_reqst_by.trim().length === 0 || !req_person_need) {
        return res.status(500).send({ msg: "Please send all mendetory fields." });
    }
    const insertq = "INSERT INTO tbl_req(req_pos_title, req_org, req_dept, req_reqst_by, req_person_need, req_reason, req_brif) VALUES ($1,$2,$3,$4,$5,$6,$7);"
    try {
        req_reason = req_reason && req_reason.trim().length >= 10 ? req_reason : "Reason not disclosed";
        req_brif = req_brif && req_brif.trim().length >= 10 ? req_brif : "No brif desc";
        const { rowCount } = await pgClient.query(insertq, [req_pos_title, req_org, req_dept, req_reqst_by, req_person_need, req_reason, req_brif]);

        if (rowCount === 1) {
            return res.status(200).send({ msg: "Requisition submitted." });
        } else {
            return res.status(500).send({ msg: "Some error occured." });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error: ' + error.detail });
    }
}


/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const getAllRequisition = async (req, res) => {
    const getAllReq = 'Select * from tbl_req order by req_date;';
    try {
        const { rows } = await pgClient.query(getAllReq);
        return res.status(200).send({ msg: "Data fetched", data: rows });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error: ' + error });
    }
}


const searchRequisition = async (req, res) => {
    try {
        const { org_id, dept_id } = req.query;
        let conditions = [];
        let values = [];
        let index = 1;

        if (org_id) {
            conditions.push(`req_org = $${index++}`);
            values.push(org_id);
        }

        if (dept_id) {
            conditions.push(`req_dept = $${index++}`);
            values.push(dept_id);
        }

        if (!conditions.length) {
            return res.status(400).json({
                success: false,
                message: "At least one search parameter is required"
            });
        }

        const query = `
      SELECT
        *
      FROM tbl_req
      WHERE ${conditions.join(" AND ")}
      ORDER BY req_date DESC;
    `;

        const { rows } = await pgClient.query(query, values);

        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error("Search Requisition Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const getRequisitionById = async (req, res) => {
    /** @type {{req_id:Number}} */
    const { req_id } = req.body;
    if (!req_id || req_id <= 1000) {
        return res.status(500).send({ msg: "Invalid requisition id" });
    }
    const getRequisitionQ = "Select * from tbl_req where req_id=$1;";

    try {
        const { rowCount, rows } = await pgClient.query(getRequisitionQ, [req_id]);
        if (rowCount === 1) {
            return res.status(200).send({ msg: "Data fetched", data: rows });
        } else {
            return res.status(500).send({ msg: "Invalid Data fetched" });
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
const updateRequisitionById = async (req, res) => {
    /** @type {{req_pos_title:String,req_org:String,req_dept:String,req_reqst_by:String,req_person_need:Number,req_reason:String,req_brif:String,req_status:String,req_id:Number}} */
    let { req_pos_title, req_org, req_dept, req_reqst_by, req_person_need, req_reason, req_brif, req_status, req_id } = req.body;
    if (!req_id || req_id <= 1000 || !req_pos_title || req_pos_title.trim().length === 0 || !req_org || !req_dept || !req_reqst_by || req_reqst_by.trim().length === 0 || !req_person_need || !req_status || req_status.trim().length == 0) {
        return res.status(500).send({ msg: "Mandetory fields needed." });
    }

    const updateReq = "Update tbl_req set req_pos_title=$1,req_org=$2,req_dept=$3,req_reqst_by=$4,req_person_need=$5,req_reason=$6,req_brif=$7,req_status=$8 where req_id=$9";
    try {
        req_reason = req_reason && req_reason.trim().length >= 10 ? req_reason : "Reason not disclosed";
        req_brif = req_brif && req_brif.trim().length >= 10 ? req_brif : "No brif desc";
        const { rowCount } = await pgClient.query(updateReq, [req_pos_title, req_org, req_dept, req_reqst_by, req_person_need, req_reason, req_brif, req_status, req_id]);
        if (rowCount === 1) {
            return res.status(200).send({ msg: "Requisition updated." });
        } else {
            return res.status(500).send({ msg: "Error occured." });
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
const getOpenPositionList = async (req, res) => {
    const getQ = `select 
    tr.req_id,
	tr.req_pos_title,
	tor.org_name,
	tdp.dept_name
    from tbl_req tr
    join tbl_org tor on tor.org_id=tr.req_org
    join tbl_dept tdp on tdp.dept_id=tr.req_dept
    where tr.req_status='OPEN' order by tr.req_date desc;`

    try {
        const {rows}=await pgClient.query(getQ);
        return res.status(200).send({msg:"Data fetched",data:rows});
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error: ' + error });
    }
}

module.exports = { addRequisition, getAllRequisition, searchRequisition, getRequisitionById, updateRequisitionById,getOpenPositionList }