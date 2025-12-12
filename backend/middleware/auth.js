const jwt = require('jsonwebtoken');
const JWT_SECRET = "03d4ca77ecb9b8954b03f34c6d1551e24782fe727b9175a1590103274840f0d08ed89671fba8df9234b2986cc50048e7aeb925d197e3217c0d66c9d5605e7632";


// Verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Check if user is student or admin
const isStudent = (req, res, next) => {
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Student access required' });
    }
    next();
};

module.exports = {
    authenticateToken,
    isAdmin,
    isStudent
};