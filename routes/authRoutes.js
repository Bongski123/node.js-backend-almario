const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const {authenticateToken} = require('../authentication/middleware');
const config = require('../app/middleware/config');
const secretKey = config.secretKey;
const router = express.Router();
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const getUserQuery = 'SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.email = ?';
        const [row] = await db.promise().execute(getUserQuery, [email]);

        if (row.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = row[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ Id: user.user_id, email: user.email, roleName: user.role_name }, secretKey, { expiresIn: '24h' });

        res.status(200).json({ token, roleName: user.role_name });

    } catch (error) {
        console.error('Error logging in user!', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;