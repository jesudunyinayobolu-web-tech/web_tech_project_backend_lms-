const express = require('express');
const router = express.Router();
const { borrowBook, getUserBorrows, getAllBorrows, returnBook, getOverdueBooks } = require('../controllers/borrowcontroller');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Routes
router.post('/', authenticateToken, borrowBook);
router.get('/user/:userId', authenticateToken, getUserBorrows);
router.get('/', authenticateToken, isAdmin, getAllBorrows);
router.put('/:id/return', authenticateToken, returnBook);
router.get('/overdue', authenticateToken, isAdmin, getOverdueBooks);

module.exports = router;