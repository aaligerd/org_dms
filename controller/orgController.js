const pgClient = require('../db/pgClient');

/**
* @param {import('express').Request} req
* @param {import('express').Response} res
*/
const getAllOrg = async (req, res) => {

    const getAllOrgQ = 'select org_id,org_name from tbl_org order by org_id;';
    try {
        const { rows, rowCount } = await pgClient.query(getAllOrgQ);
        return res.status(200).send({ data: rows, rowCount });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ msg: 'Error: ' + error.detail });
    }
};


/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const addOrg = async (req, res) => {
    /** @type {{org_name:String}} */
    const { org_name } = req.body;
    const insertQ = "insert into tbl_org(org_name) values ($1);";
    try {
        const { rows, rowCount } = await pgClient.query(insertQ, [org_name.toUpperCase()]);
        if (rowCount === 0) {
            return res.status(500).send({ msg: "Undable to add organisation." });
        } else {
            return res.status(200).send({ msg: "Organisation added." });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error: ' + error.detail });
    }
}

module.exports = { getAllOrg, addOrg };
