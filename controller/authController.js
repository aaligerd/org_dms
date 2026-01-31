const bcrypt = require("bcrypt");
const pgClient = require("../db/pgClient");
const { verifyPassword, hashPassword } = require("../utils/bcryptUtil");
const basic_password=process.env.USERDEFAULT_PASS;

/**
 * Employee Login
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    /* ---------------------------------------------
       1️⃣ Fetch employee + login data
    --------------------------------------------- */
    const query = `
     SELECT 
        e.user_id,
		    e.user_name,
		    e.org_id,
        e.user_mail,
        l.password,
        e.dms_role
      FROM tbl_user e
      INNER JOIN tbl_login l ON l.user_id = e.user_id
      WHERE e.user_mail = $1
      LIMIT 1
    `;

    const result = await pgClient.query(query, [email]);

    if (!result.rows.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = result.rows[0];

    /* ---------------------------------------------
       2️⃣ Compare password
    --------------------------------------------- */
    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    console.log(user);
    /* ---------------------------------------------
       3️⃣ Success response
    --------------------------------------------- */
    return res.json({
      success: true,
      data: {
        email: user.user_mail,
        user_name: user.user_name,
        org_id: user.org_id,
        emp_id: user.user_id,
        role: user.dms_role
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


/**
 * Reset Password by emp_id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const resetPasswordByEmpid = async (req, res) => {
  try {
    const { password, user_emp_id } = req.body;

    if (!password || !user_emp_id) {
      return res.status(400).json({
        success: false,
        message: "password and user_emp_id are required"
      });
    }

    /* ---------------------------------------------
       1️⃣ Check employee exists
    --------------------------------------------- */
    const empCheck = await pgClient.query(
      `SELECT user_id FROM tbl_user WHERE user_id = $1 LIMIT 1`,
      [user_emp_id]
    );

    if (!empCheck.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    /* ---------------------------------------------
       2️⃣ Hash new password
    --------------------------------------------- */
    const saltRounds = 10;
    const hashedPassword = await hashPassword(password);

    /* ---------------------------------------------
       3️⃣ Update password
    --------------------------------------------- */
    const updateRes = await pgClient.query(
      `
        UPDATE tbl_login
        SET password = $1,
            last_password_changed = NOW()
        WHERE user_id = $2
      `,
      [hashedPassword, user_emp_id]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Login record not found"
      });
    }

    /* ---------------------------------------------
       4️⃣ Success
    --------------------------------------------- */
    return res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


/**
 * Reset user password to default
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const resetToBasic = async (req, res) => {
  /** @type {{user_id: string}} */
  const { user_id } = req.body;

  try {
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required"
      });
    }

    if (!basic_password) {
      return res.status(500).json({
        success: false,
        message: "Default password not configured"
      });
    }

    /* -----------------------------------
       1️⃣ Hash default password
    ----------------------------------- */
    const hashedPassword = await hashPassword(basic_password);

    /* -----------------------------------
       2️⃣ Update password
    ----------------------------------- */
    const result = await pgClient.query(
      `
      UPDATE tbl_login
      SET password = $1,
          last_password_changed = NOW()
      WHERE user_id = $2
      `,
      [hashedPassword, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    /* -----------------------------------
       3️⃣ Success
    ----------------------------------- */
    return res.json({
      success: true,
      message: "Password reset to default successfully"
    });

  } catch (error) {
    console.error("Reset To Basic Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



module.exports = { loginEmployee, resetPasswordByEmpid, resetToBasic };
