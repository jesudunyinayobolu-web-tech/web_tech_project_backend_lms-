const { query } = require('../config/database');
const { validationResult } = require('express-validator');

// Get all books with optional search and filter
const getAllBooks = async (req, res) => {
    try {
        const { search, category } = req.query;
        let queryText = 'SELECT * FROM books';
        let params = [];
        let conditions = [];

        if (search) {
            conditions.push(`(LOWER(title) LIKE $${params.length + 1} OR LOWER(author) LIKE $${params.length + 1} OR isbn LIKE $${params.length + 1})`);
            params.push(`%${search.toLowerCase()}%`);
        }

        if (category) {
            conditions.push(`category = $${params.length + 1}`);
            params.push(category);
        }

        if (conditions.length > 0) {
            queryText += ' WHERE ' + conditions.join(' AND ');
        }

        queryText += ' ORDER BY created_at DESC';

        const result = await query(queryText, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single book by ID
const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM books WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add new book (admin only)
const addBook = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, author, isbn, category, total_copies } = req.body;
        const available_copies = total_copies || 1;

        // Check if ISBN already exists
        const existingBook = await query('SELECT * FROM books WHERE isbn = $1', [isbn]);
        if (existingBook.rows.length > 0) {
            return res.status(400).json({ message: 'Book with this ISBN already exists' });
        }

        const result = await query(
            `INSERT INTO books (title, author, isbn, category, total_copies, available_copies) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [title, author, isbn, category || null, total_copies || 1, available_copies]
        );

        res.status(201).json({
            message: 'Book added successfully',
            book: result.rows[0]
        });
    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update book (admin only)
const updateBook = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { title, author, isbn, category, total_copies } = req.body;

        // Check if book exists
        const bookExists = await query('SELECT * FROM books WHERE id = $1', [id]);
        if (bookExists.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Check if ISBN is taken by another book
        const isbnCheck = await query('SELECT * FROM books WHERE isbn = $1 AND id != $2', [isbn, id]);
        if (isbnCheck.rows.length > 0) {
            return res.status(400).json({ message: 'ISBN already used by another book' });
        }

        // Calculate new available copies
        const oldBook = bookExists.rows[0];
        const borrowedCopies = oldBook.total_copies - oldBook.available_copies;
        const newAvailableCopies = Math.max(0, total_copies - borrowedCopies);

        const result = await query(
            `UPDATE books 
             SET title = $1, author = $2, isbn = $3, category = $4, total_copies = $5, available_copies = $6
             WHERE id = $7 
             RETURNING *`,
            [title, author, isbn, category || null, total_copies, newAvailableCopies, id]
        );

        res.json({
            message: 'Book updated successfully',
            book: result.rows[0]
        });
    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete book (admin only)
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if book has active borrows
        const activeBorrows = await query(
            'SELECT * FROM borrows WHERE book_id = $1 AND status = $2',
            [id, 'borrowed']
        );

        if (activeBorrows.rows.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete book with active borrows. Please wait for returns.' 
            });
        }

        const result = await query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllBooks,
    getBookById,
    addBook,
    updateBook,
    deleteBook
};