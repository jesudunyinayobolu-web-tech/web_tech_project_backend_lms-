const { query } = require('../config/database');

// Borrow a book
const borrowBook = async (req, res) => {
    try {
        const { book_id } = req.body;
        const user_id = req.user.id;

        // Check if book exists and is available
        const bookResult = await query('SELECT * FROM books WHERE id = $1', [book_id]);
        
        if (bookResult.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const book = bookResult.rows[0];

        if (book.available_copies <= 0) {
            return res.status(400).json({ message: 'Book is not available for borrowing' });
        }

        // Check if user already borrowed this book and hasn't returned it
        const existingBorrow = await query(
            'SELECT * FROM borrows WHERE user_id = $1 AND book_id = $2 AND status = $3',
            [user_id, book_id, 'borrowed']
        );

        if (existingBorrow.rows.length > 0) {
            return res.status(400).json({ message: 'You have already borrowed this book' });
        }

        // Calculate due date (14 days from now)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        // Create borrow record
        const borrowResult = await query(
            `INSERT INTO borrows (user_id, book_id, due_date) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [user_id, book_id, dueDate]
        );

        // Update book available copies
        await query(
            'UPDATE books SET available_copies = available_copies - 1 WHERE id = $1',
            [book_id]
        );

        res.status(201).json({
            message: 'Book borrowed successfully',
            borrow: borrowResult.rows[0]
        });
    } catch (error) {
        console.error('Borrow book error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's borrowed books
const getUserBorrows = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user is requesting their own borrows or is admin
        if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await query(
            `SELECT b.*, bk.title as book_title, bk.author as book_author, bk.isbn
             FROM borrows b
             JOIN books bk ON b.book_id = bk.id
             WHERE b.user_id = $1
             ORDER BY b.created_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get user borrows error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all borrows (admin only)
const getAllBorrows = async (req, res) => {
    try {
        const result = await query(
            `SELECT b.*, 
             u.name as user_name, u.email as user_email,
             bk.title as book_title, bk.author as book_author, bk.isbn
             FROM borrows b
             JOIN users u ON b.user_id = u.id
             JOIN books bk ON b.book_id = bk.id
             ORDER BY b.created_at DESC`
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get all borrows error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Return a book
const returnBook = async (req, res) => {
    try {
        const { id } = req.params;

        // Get borrow record
        const borrowResult = await query('SELECT * FROM borrows WHERE id = $1', [id]);
        
        if (borrowResult.rows.length === 0) {
            return res.status(404).json({ message: 'Borrow record not found' });
        }

        const borrow = borrowResult.rows[0];

        // Check if user owns this borrow or is admin
        if (req.user.id !== borrow.user_id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (borrow.status === 'returned') {
            return res.status(400).json({ message: 'Book already returned' });
        }

        // Update borrow record
        await query(
            `UPDATE borrows 
             SET status = $1, return_date = CURRENT_DATE 
             WHERE id = $2`,
            ['returned', id]
        );

        // Update book available copies
        await query(
            'UPDATE books SET available_copies = available_copies + 1 WHERE id = $1',
            [borrow.book_id]
        );

        res.json({ message: 'Book returned successfully' });
    } catch (error) {
        console.error('Return book error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get overdue books (admin only)
const getOverdueBooks = async (req, res) => {
    try {
        const result = await query(
            `SELECT b.*, 
             u.name as user_name, u.email as user_email,
             bk.title as book_title, bk.author as book_author
             FROM borrows b
             JOIN users u ON b.user_id = u.id
             JOIN books bk ON b.book_id = bk.id
             WHERE b.status = $1 AND b.due_date < CURRENT_DATE
             ORDER BY b.due_date ASC`,
            ['borrowed']
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get overdue books error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    borrowBook,
    getUserBorrows,
    getAllBorrows,
    returnBook,
    getOverdueBooks
};