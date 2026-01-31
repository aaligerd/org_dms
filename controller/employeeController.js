const fs = require('fs');
const path = require('path');
const pgClient = require('../db/pgClient');


/**
 * Add Employee Controller
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const addEmployee = async (req, res) => {
  try {
    const {
      emp_name,
      emp_org_id,
      org_id,
      dept_id,
      contact_number,
      emergency_contact_number,
      emergency_contact_person_name,
      address,
      designation,
      email,
      pan_card_number,
      aadhar_card_number,
      uan_number,
      old_org_name,
      bank_name,
      ifsc_code,
      bank_account_number,
      join_date
    } = req.body;

    /* -------------------- FILE FIELD DEFINITIONS -------------------- */

    const fileFields = [
      "pan_card_pic",
      "aadhaar_card_pic",
      "offer_letter",
      "joining_letter",
      "old_company_release_letter",
      "confirmation_letter",
      "release_letter"
    ];

    /* -------------------- EMPLOYEE FOLDER -------------------- */

    const emp_folder_name = `${emp_org_id}`;

    const folderPath = path.join(
      __dirname,
      "..",
      "uploads",
      "employees",
      emp_folder_name
    );

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    /* -------------------- MOVE FILES -------------------- */

    for (const file of req.files) {
      const destination = path.join(folderPath, file.filename);
      fs.renameSync(file.path, destination);
    }

    /* -------------------- SINGLE FILE COLUMNS -------------------- */

    const getFileName = (field) =>
      req.files.find(f => f.fieldname === field)?.filename || null;

    const pan_pic = getFileName("pan_card_pic");
    const aadhaar_pic = getFileName("aadhaar_card_pic");
    const joining_letter = getFileName("joining_letter");
    const offer_letter = getFileName("offer_letter");
    const old_company_release_letter = getFileName("old_comapny_release_letter");
    const old_pay_slip = getFileName("old_pay_slip");
    const confirmation_letter = getFileName("confirmation_letter");
    const release_letter = getFileName("release_letter");

    /* -------------------- MARKSHEETS & CERTIFICATES -------------------- */

    const marksheetKeys = Object.keys(req.body).filter(k =>
      k.startsWith("marksheet")
    );
    const certificateKeys = Object.keys(req.body).filter(k =>
      k.startsWith("certificate")
    );

    const marksheetFiles = req.files.filter(f =>
      f.fieldname.startsWith("marksheet_file")
    );
    const certificateFiles = req.files.filter(f =>
      f.fieldname.startsWith("certificate_file")
    );

    let marksheets = null;
    let certificates = null;

    if (marksheetKeys.length) {
      marksheets = {};
      marksheetKeys.forEach((key, index) => {
        if (marksheetFiles[index]) {
          marksheets[req.body[key]] = marksheetFiles[index].filename;
        }
      });
    }

    if (certificateKeys.length) {
      certificates = {};
      certificateKeys.forEach((key, index) => {
        if (certificateFiles[index]) {
          certificates[req.body[key]] = certificateFiles[index].filename;
        }
      });
    }

    marksheets = marksheets ? JSON.stringify(marksheets) : null;
    certificates = certificates ? JSON.stringify(certificates) : null;

    /* -------------------- DATABASE INSERT -------------------- */

    const query = `
      INSERT INTO tbl_employee (
        emp_name,
        emp_org_id,
        org_id,
        dept_id,
        contact_number,
        emergency_contact_number,
        emergency_contact_person_name,
        address,
        designation,
        email,
        pan_number,
        pan_pic,
        aadhaar_number,
        aadhaar_pic,
        uan,
        old_org_name,
        bank_name,
        ifsc,
        account_number,
        joining_letter,
        offer_letter,
        old_company_release_letter,
        confirmation_letter,
        release_letter,
        marksheets,
        certificates,
        old_pay_slip,
        join_date
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,
        $20,$21,$22,$23,$24,$25,$26,$27,$28
      )
      RETURNING emp_id;
    `;
    const values = [
      emp_name,
      emp_org_id,
      org_id,
      dept_id,
      contact_number,
      emergency_contact_number,
      emergency_contact_person_name,
      address,
      designation,
      email,
      pan_card_number,
      pan_pic,
      aadhar_card_number,
      aadhaar_pic,
      uan_number,
      old_org_name,
      bank_name,
      ifsc_code,
      bank_account_number,
      joining_letter,
      offer_letter,
      old_company_release_letter,
      confirmation_letter,
      release_letter,
      marksheets,
      certificates,
      old_pay_slip,
      join_date
    ];

    const result = await pgClient.query(query, values)

    return res.status(201).json({
      success: true,
      emp_id: result.rows[0].emp_id
    });

  } catch (error) {
    console.error("Add Employee Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: "+error
    });
  }
};

/**
 * Get Employee by emp_id (actually emp_org_id)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getEmployeeById = async (req, res) => {
  try {
    const { emp_id } = req.params; // emp_org_id

    if (!emp_id) {
      return res.status(400).json({
        success: false,
        message: "emp_id is required"
      });
    }

    const query = `
      SELECT
        emp_id,
        emp_name,
        emp_org_id,
        org_id,
        dept_id,
        contact_number,
        emergency_contact_number,
        emergency_contact_person_name,
        address,
        designation,
        email,
        pan_number,
        pan_pic,
        aadhaar_number,
        aadhaar_pic,
        uan,
        old_org_name,
        bank_name,
        ifsc,
        account_number,
        joining_letter,
        offer_letter,
        old_company_release_letter,
        confirmation_letter,
        release_letter,
        old_pay_slip,
        marksheets,
        certificates,
        join_date,
        created_at
      FROM tbl_employee
      WHERE emp_org_id = $1
      LIMIT 1;
    `;

    const { rows } = await pgClient.query(query, [emp_id]);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    const employee = rows[0];
    const baseUrl = `${req.protocol}://${req.get("host")}/static/${employee.emp_org_id}`;

    /* ---------------- FILE URL MAPPING ---------------- */

    const fileUrl = (filename) =>
      filename ? `${baseUrl}/${filename}` : null;

    employee.pan_pic_url = fileUrl(employee.pan_pic);
    employee.aadhaar_pic_url = fileUrl(employee.aadhaar_pic);
    employee.joining_letter_url = fileUrl(employee.joining_letter);
    employee.offer_letter_url = fileUrl(employee.offer_letter);
    employee.old_company_release_letter_url = fileUrl(employee.old_company_release_letter);
    employee.confirmation_letter_url = fileUrl(employee.confirmation_letter);
    employee.release_letter_url = fileUrl(employee.release_letter);
    employee.old_pay_slip_url = fileUrl(employee.old_pay_slip);

    /* ---------------- JSON FILE URLS ---------------- */

    employee.marksheets = safeJsonParse(employee.marksheets);
    employee.certificates = safeJsonParse(employee.certificates);

    employee.marksheets_urls = {};
    for (const key in employee.marksheets) {
      employee.marksheets_urls[key] = fileUrl(employee.marksheets[key]);
    }

    employee.certificates_urls = {};
    for (const key in employee.certificates) {
      employee.certificates_urls[key] = fileUrl(employee.certificates[key]);
    }

    return res.status(200).json({
      success: true,
      data: employee
    });

  } catch (error) {
    console.error("Get Employee Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



/**
 * Search Employees
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const searchEmployee = async (req, res) => {
  try {
    const { org_id, dept_id, emp_org_id } = req.query;
    let conditions = [];
    let values = [];
    let index = 1;

    if (org_id) {
      conditions.push(`org_id = $${index++}`);
      values.push(org_id);
    }

    if (dept_id) {
      conditions.push(`dept_id = $${index++}`);
      values.push(dept_id);
    }

    if (emp_org_id) {
      conditions.push(`emp_org_id ILIKE $${index++}`);
      values.push(`%${emp_org_id}%`);
    }

    if (!conditions.length) {
      return res.status(400).json({
        success: false,
        message: "At least one search parameter is required"
      });
    }

    const query = `
      SELECT
        emp_org_id as emp_id,
        emp_name,
        email,
        join_date
      FROM tbl_employee
      WHERE ${conditions.join(" AND ")}
      ORDER BY join_date DESC;
    `;

    const { rows } = await pgClient.query(query, values);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    console.error("Search Employee Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



/**
 * Safe JSON parse
 */
const safeJsonParse = (val) => {
  try {
    if (!val) return {};
    if (typeof val === "object") return val;
    return JSON.parse(val);
  } catch {
    return {};
  }
};


/**
 * Update Employee (PUT)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const updateEmployee = async (req, res) => {
  try {
    const { emp_org_id } = req.params;
    if (!emp_org_id) {
      return res.status(400).json({ message: "emp_org_id is required" });
    }

    /* ------------------------------------------------
       1️⃣ Fetch existing employee
    ------------------------------------------------ */
    const empRes = await pgClient.query(
      `SELECT * FROM tbl_employee WHERE emp_org_id=$1 LIMIT 1`,
      [emp_org_id]
    );

    if (!empRes.rows.length) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const oldEmp = empRes.rows[0];

    /* ------------------------------------------------
       2️⃣ Ensure employee folder exists
    ------------------------------------------------ */
    const empFolder = path.join(
      __dirname,
      "..",
      "uploads",
      "employees",
      emp_org_id
    );

    if (!fs.existsSync(empFolder)) {
      fs.mkdirSync(empFolder, { recursive: true });
    }

    /* ------------------------------------------------
       3️⃣ Move uploaded files
    ------------------------------------------------ */
    const uploadedFiles = {}; // fieldname -> filename

    if (Array.isArray(req.files)) {
      for (const file of req.files) {
        const dest = path.join(empFolder, file.filename);
        fs.renameSync(file.path, dest);
        uploadedFiles[file.fieldname] = file.filename;
      }
    }

    /* ------------------------------------------------
       4️⃣ Normal field updates
    ------------------------------------------------ */
    const body = req.body;

    const updatedData = {
      emp_name: body.emp_name ?? oldEmp.emp_name,
      org_id: body.org_id ?? oldEmp.org_id,
      dept_id: body.dept_id ?? oldEmp.dept_id,
      contact_number: body.contact_number ?? oldEmp.contact_number,
      emergency_contact_number:
        body.emergency_contact_number ?? oldEmp.emergency_contact_number,
      emergency_contact_person_name:
        body.emergency_contact_person_name ??
        oldEmp.emergency_contact_person_name,
      address: body.address ?? oldEmp.address,
      designation: body.designation ?? oldEmp.designation,
      email: body.email ?? oldEmp.email,
      pan_number: body.pan_number ?? oldEmp.pan_number,
      aadhaar_number: body.aadhaar_number ?? oldEmp.aadhaar_number,
      uan: body.uan ?? oldEmp.uan,
      old_org_name: body.old_org_name ?? oldEmp.old_org_name,
      bank_name: body.bank_name ?? oldEmp.bank_name,
      ifsc: body.ifsc ?? oldEmp.ifsc,
      account_number: body.account_number ?? oldEmp.account_number,
      join_date: body.join_date ?? oldEmp.join_date
    };

    /* ------------------------------------------------
       5️⃣ Single file columns
    ------------------------------------------------ */
    const fileFields = [
      "pan_pic",
      "aadhaar_pic",
      "joining_letter",
      "offer_letter",
      "old_company_release_letter",
      "confirmation_letter",
      "release_letter",
      "old_pay_slip"
    ];

    fileFields.forEach((field) => {
      updatedData[field] = uploadedFiles[field] ?? oldEmp[field];
    });

    /* ------------------------------------------------
       6️⃣ MARKSHEETS & CERTIFICATES (🔥 FIXED PART)
    ------------------------------------------------ */
    let marksheets = safeJsonParse(oldEmp.marksheets) || {};
    let certificates = safeJsonParse(oldEmp.certificates) || {};

    // keys like: marksheet_10th, certificate_java
    const marksheetKeys = Object.keys(body).filter(k =>
      k.startsWith("marksheet")
    );
    const certificateKeys = Object.keys(body).filter(k =>
      k.startsWith("certificate")
    );

    // files like: marksheet_file_0, certificate_file_1
    const marksheetFiles = req.files.filter(f =>
      f.fieldname.startsWith("marksheet_file")
    );
    const certificateFiles = req.files.filter(f =>
      f.fieldname.startsWith("certificate_file")
    );

    // Merge marksheets
    marksheetKeys.forEach((key, index) => {
      if (marksheetFiles[index]) {
        marksheets[body[key]] = marksheetFiles[index].filename;
      }
    });

    // Merge certificates
    certificateKeys.forEach((key, index) => {
      if (certificateFiles[index]) {
        certificates[body[key]] = certificateFiles[index].filename;
      }
    });

    updatedData.marksheets =
      Object.keys(marksheets).length ? JSON.stringify(marksheets) : null;

    updatedData.certificates =
      Object.keys(certificates).length ? JSON.stringify(certificates) : null;

    /* ------------------------------------------------
       7️⃣ Update DB
    ------------------------------------------------ */
    const updateQuery = `
      UPDATE tbl_employee SET
        emp_name=$1,
        org_id=$2,
        dept_id=$3,
        contact_number=$4,
        emergency_contact_number=$5,
        emergency_contact_person_name=$6,
        address=$7,
        designation=$8,
        email=$9,
        pan_number=$10,
        pan_pic=$11,
        aadhaar_number=$12,
        aadhaar_pic=$13,
        uan=$14,
        old_org_name=$15,
        bank_name=$16,
        ifsc=$17,
        account_number=$18,
        joining_letter=$19,
        offer_letter=$20,
        old_company_release_letter=$21,
        confirmation_letter=$22,
        release_letter=$23,
        old_pay_slip=$24,
        marksheets=$25,
        certificates=$26,
        join_date=$27,
        last_modified_at=NOW()
      WHERE emp_org_id=$28
    `;

    const values = [
      updatedData.emp_name,
      updatedData.org_id,
      updatedData.dept_id,
      updatedData.contact_number,
      updatedData.emergency_contact_number,
      updatedData.emergency_contact_person_name,
      updatedData.address,
      updatedData.designation,
      updatedData.email,
      updatedData.pan_number,
      updatedData.pan_pic,
      updatedData.aadhaar_number,
      updatedData.aadhaar_pic,
      updatedData.uan,
      updatedData.old_org_name,
      updatedData.bank_name,
      updatedData.ifsc,
      updatedData.account_number,
      updatedData.joining_letter,
      updatedData.offer_letter,
      updatedData.old_company_release_letter,
      updatedData.confirmation_letter,
      updatedData.release_letter,
      updatedData.old_pay_slip,
      updatedData.marksheets,
      updatedData.certificates,
      updatedData.join_date,
      emp_org_id
    ];

    await pgClient.query(updateQuery, values);

    return res.json({
      success: true,
      message: "Employee updated successfully"
    });

  } catch (error) {
    console.error("Update Employee Error:", error);
    return res.status(500).json({ message: "Internal server error: "+error });
  }
};






module.exports = { addEmployee, getEmployeeById, searchEmployee, updateEmployee }