const pgClient = require('../db/pgClient');
const dotenv=require('dotenv').config();
const {createAdminLog}=require('../utils/logWriter.js')
const basic_password=process.env.USERDEFAULT_PASS;
const { hashPassword } = require('../utils/bcryptUtil');


/**
* @param {import('express').Request} req
* @param {import('express').Response} res
*/
const getAllUsers = async (req, res) => {

    const getAllOrgQ = 'select user_id,user_name,user_mail,user_emp_code from tbl_user order by user_id;';
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
const addUser = async (req, res) => {
    /** @type {{org_name:String}} */
    const { user_name,user_mail,user_emp_code,org_id,dept_id,user="TEST9999" } = req.body;
    const insertUserQ = `
        INSERT INTO tbl_user (user_name, user_mail, user_emp_code,org_id,dept_id)
        VALUES ($1, $2, $3,$4,$5)
        RETURNING user_id;
    `;
    const createLoginQ = `
        INSERT INTO tbl_login (user_id, password)
        VALUES ($1, $2);
    `;
    try {
        await pgClient.query('BEGIN');
        const userResult = await pgClient.query(insertUserQ, [
            user_name,
            user_mail,
            user_emp_code,org_id,dept_id
        ]);
        const user_id = userResult.rows[0].user_id;
        const hashedPassword = await hashPassword(basic_password);
        await pgClient.query(createLoginQ, [
            user_id,
            hashedPassword,
        ]);
        await pgClient.query('COMMIT');
        createAdminLog(`New user created ID: ${user_id}`,user);
        return res.status(201).send({
            msg: 'User created successfully',
            user_id,
        });

    } catch (error) {
        await pgClient.query('ROLLBACK');
        console.error(error);
        return res.status(500).send({
            msg: 'Error creating user '+error.detail || error.message,
        });
    }
}

module.exports = { getAllUsers, addUser };
