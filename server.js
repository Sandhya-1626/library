import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Helper to read/write data
const getData = async () => await fs.readJson(DATA_FILE);
const saveData = async (data) => await fs.writeJson(DATA_FILE, data, { spaces: 2 });

// Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Admin Login
app.post('/api/login/admin', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.json({ success: true, message: 'Admin logged in', user: { username, role: 'admin' } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
});

// Student Register
app.post('/api/register', async (req, res) => {
    const { name, rollNo, department, year } = req.body;
    const data = await getData();
    if (data.users.find(u => u.rollNo === rollNo)) {
        return res.status(400).json({ success: false, message: 'Roll number already registered' });
    }
    const newUser = { name, rollNo, department, year };
    data.users.push(newUser);
    await saveData(data);
    res.json({ success: true, message: 'Registration successful', user: newUser });
});

// Student Login
app.post('/api/login/student', async (req, res) => {
    const { name, rollNo } = req.body;
    const data = await getData();
    const user = data.users.find(u => u.rollNo === rollNo && u.name === name);

    if (user) {
        // Log the login
        data.logs.push({ name, rollNo, department: user.department, date: new Date().toISOString() });
        await saveData(data);
        res.json({ success: true, message: 'Student logged in', user: { ...user, role: 'student' } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid Name or Roll Number. Please register first.' });
    }
});

// Student Logout (log duration)
app.post('/api/logout', async (req, res) => {
    const { name, duration } = req.body;
    console.log(`Student ${name} logged out after ${duration} seconds`);
    res.json({ success: true });
});

// Books CRUD
app.get('/api/books', async (req, res) => {
    const data = await getData();
    res.json(data.books);
});

app.post('/api/books', upload.single('bookFile'), async (req, res) => {
    const { title, category, pages } = req.body;
    const data = await getData();
    const newBook = {
        id: Date.now(),
        title,
        category,
        pages: pages ? pages.split('\n\n') : [], // Split by double newline for pages
        fileName: req.file ? req.file.filename : null,
        ratings: []
    };
    data.books.push(newBook);
    await saveData(data);
    res.json({ success: true, book: newBook });
});

app.delete('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    const data = await getData();
    data.books = data.books.filter(b => b.id != id);
    await saveData(data);
    res.json({ success: true });
});

// Pre-booking
app.post('/api/prebook', async (req, res) => {
    const { studentName, bookTitle } = req.body;
    const data = await getData();
    data.notifications.push({ studentName, bookTitle, time: new Date().toISOString() });
    await saveData(data);
    res.json({ success: true });
});

// Feedback
app.post('/api/feedback', async (req, res) => {
    const { studentName, bookTitle, message, rating } = req.body;
    const data = await getData();
    data.feedbacks.push({ studentName, bookTitle, message, rating, date: new Date().toISOString() });

    // Update book rating
    const book = data.books.find(b => b.title === bookTitle);
    if (book) {
        if (!book.ratings) book.ratings = [];
        book.ratings.push(Number(rating));
    }

    await saveData(data);
    res.json({ success: true });
});

// Track book views
app.post('/api/track-view', async (req, res) => {
    const { studentName, rollNo, bookTitle, bookId } = req.body;
    const data = await getData();

    if (!data.bookViews) data.bookViews = [];

    data.bookViews.push({
        studentName,
        rollNo,
        bookTitle,
        bookId,
        timestamp: new Date().toISOString()
    });

    await saveData(data);
    res.json({ success: true });
});

// Admin Stats
app.get('/api/admin/stats', async (req, res) => {
    const data = await getData();
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = data.logs.filter(l => l.date.startsWith(today));

    const deptWiseLogins = {};
    todayLogs.forEach(l => {
        deptWiseLogins[l.department] = (deptWiseLogins[l.department] || 0) + 1;
    });

    res.json({
        totalLogins: todayLogs.length,
        deptWiseLogins: deptWiseLogins,
    });
});

app.get('/api/admin/users', async (req, res) => {
    const data = await getData();
    res.json(data.users || []);
});

app.get('/api/admin/logs', async (req, res) => {
    const data = await getData();
    res.json((data.logs || []).reverse());
});

app.get('/api/admin/book-views', async (req, res) => {
    const data = await getData();
    res.json((data.bookViews || []).reverse());
});

app.get('/api/admin/notifications', async (req, res) => {
    const data = await getData();
    res.json(data.notifications.reverse());
});

app.get('/api/admin/feedbacks', async (req, res) => {
    const data = await getData();
    res.json(data.feedbacks.reverse());
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
