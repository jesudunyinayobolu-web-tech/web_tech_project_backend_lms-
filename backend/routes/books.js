const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAllBooks, getBookById, addBook, updateBook, deleteBook } = require('../controllers/bookController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Validation rules
const bookValidation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('isbn').trim().notEmpty().withMessage('ISBN is required'),
    body('total_copies').optional().isInt({ min: 1 }).withMessage('Total copies must be at least 1')
];

// Routes
router.get('/', authenticateToken, getAllBooks);
router.get('/:id', authenticateToken, getBookById);
router.post('/', authenticateToken, isAdmin, bookValidation, addBook);
router.put('/:id', authenticateToken, isAdmin, bookValidation, updateBook);
router.delete('/:id', authenticateToken, isAdmin, deleteBook);

module.exports = router;