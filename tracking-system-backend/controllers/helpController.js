const pool = require("../config/db");

let helpTableReady = false;

async function ensureHelpTable() {
  if (helpTableReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS help_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      contact_email VARCHAR(255),
      contact_phone VARCHAR(50),
      description VARCHAR(255) NOT NULL,
      detail_description TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'Open',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  helpTableReady = true;
}

const allowedStatuses = ["Open", "In progress", "Resolved", "Cancelled"];

exports.raiseIssue = async (req, res) => {
  try {
    await ensureHelpTable();

    const { contact_email, contact_phone, description, detail_description } = req.body;

    if (!description || (!contact_email && !contact_phone)) {
      return res.status(400).json({ message: "Description and either email or phone are required." });
    }

    const result = await pool.query(
      `INSERT INTO help_requests (
          user_id,
          contact_email,
          contact_phone,
          description,
          detail_description,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.user.userId || req.user.id,
        contact_email,
        contact_phone,
        description,
        detail_description || null,
        "Open",
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create help request" });
  }
};

exports.getMyIssues = async (req, res) => {
  try {
    await ensureHelpTable();

    const result = await pool.query(
      `SELECT * FROM help_requests WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.userId || req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch help requests" });
  }
};

exports.getAllIssues = async (req, res) => {
  try {
    await ensureHelpTable();

    const result = await pool.query(
      `SELECT h.*, u.first_name, u.last_name, u.email AS user_email, u.phone AS user_phone
       FROM help_requests h
       LEFT JOIN users u ON h.user_id = u.id
       ORDER BY h.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch all help issues" });
  }
};

exports.updateIssueStatus = async (req, res) => {
  try {
    await ensureHelpTable();

    const { id } = req.params;
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const result = await pool.query(
      `UPDATE help_requests
       SET status = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Help request not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update help request status" });
  }
};
