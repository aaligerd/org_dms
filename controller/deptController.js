const pgClient = require('../db/pgClient');

/**
* @param {import('express').Request} req
* @param {import('express').Response} res
*/
const getAllDept = async (req, res) => {

    const getAllOrgQ = 'select dept_id,dept_name from tbl_dept order by dept_id;';
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
const addDept = async (req, res) => {
    /** @type {{dept_name:String}} */
    const { dept_name } = req.body;
    const insertQ = "insert into tbl_dept(dept_name) values ($1);";
    try {
        const { rows, rowCount } = await pgClient.query(insertQ, [dept_name.toUpperCase()]);
        if (rowCount === 0) {
            return res.status(500).send({ msg: "Undable to add department." });
        } else {
            return res.status(200).send({ msg: "Department added." });
        }

    } catch (error) {   
        console.log(error);
        return res.status(500).send({ msg: 'Error: ' + error.detail });
    }
}

module.exports = { getAllDept, addDept };
