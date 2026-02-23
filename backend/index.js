const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
const PORT = 5000;

// ── Middleware ──
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
// Express 5 has built-in json/urlencoded — no body-parser needed
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Multer ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// ── In-memory store ──
let stats = {
  totalLogins: 0,
  deptWiseLogins: {
    'Computer Science': 0,
    'Information Technology': 0,
    'Electronics & Communication': 0,
    'Electrical & Electronics': 0,
    'Mechanical Engineering': 0,
  },
  studentUsage: [],
};

let preBookings = [];
let feedbacks = [];

// ── Load books from Excel ──
function loadBooksFromExcel() {
  try {
    const filePath = path.join(__dirname, '../BooksData(7).xlsx');
    if (!fs.existsSync(filePath)) {
      console.log('Excel file not found – using mock data.');
      return [
        { id: 1, title: 'Python Programming', category: 'Computer Science', pages: ['Basics of Python...', 'Advanced Python...', 'Data Structures'], ratings: [] },
        { id: 2, title: 'Java Essentials', category: 'Computer Science', pages: ['Introduction to Java...', 'OOP Concepts...', 'Spring Boot'], ratings: [] },
      ];
    }

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const dataRows = rows.slice(4);

    const loaded = dataRows.map((row, index) => {
      if (!row[3]) return null;
      const title = row[3];
      const author = row[5] || 'Unknown';
      const category = row[9] || 'General';
      const pageCount = row[15] || 0;

      const mockPages = [
        `Title: ${title}\nAuthor: ${author}\nCategory: ${category}\n\n(Cover Page)`,
        `About this Book:\nThis is a digital copy of "${title}".\nPublished by: ${row[11] || 'N/A'}\nYear: ${row[16] || 'N/A'}`,
        `Chapter 1: Introduction\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.`,
        `Chapter 2: Core Concepts\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor.`,
        `Summary\n\nThis book contains ${pageCount} pages in its physical edition.`,
      ];

      return {
        id: index + 1,
        title,
        category,
        pages: mockPages,
        ratings: [],
      };
    }).filter(Boolean);

    console.log(`✅ Loaded ${loaded.length} books from Excel.`);
    return loaded;
  } catch (err) {
    console.error('Error loading Excel:', err.message);
    return [];
  }
}

let books = loadBooksFromExcel();

// Prepend the EDC demo book
books.unshift({
  id: 'edc-notes',
  title: 'EDC Lecture Notes',
  category: 'Electronics & Communication',
  pages: Array.from({ length: 100 }, (_, i) => `http://localhost:5000/uploads/edc_pages/page_${i + 1}.png`),
  fileName: 'EDC-Lecture-Notes.pdf',
  ratings: [5, 5, 5],
});

// ── Auth ──
app.post('/api/login/student', (req, res) => {
  const { name, department, rollNo, year } = req.body;
  if (!name || !rollNo) {
    return res.status(400).json({ success: false, message: 'Name and Roll Number are required.' });
  }
  stats.totalLogins++;
  stats.deptWiseLogins[department] = (stats.deptWiseLogins[department] || 0) + 1;
  const user = { name, department, rollNo, year, loginTime: new Date() };
  res.json({ success: true, user });
});

app.post('/api/login/admin', (req, res) => {
  const { username, password } = req.body;
  if (username === '12345678' && password === 'sandhya') {
    res.json({ success: true, role: 'admin' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials. Check your Admin ID and password.' });
  }
});

// ── Logout / session tracking ──
app.post('/api/logout', (req, res) => {
  const { name, duration } = req.body;
  stats.studentUsage.push({ name, duration, date: new Date().toLocaleDateString() });
  res.json({ success: true });
});

// ── Pre-booking ──
app.post('/api/prebook', (req, res) => {
  const { studentName, bookTitle } = req.body;
  preBookings.push({ studentName, bookTitle, time: new Date(), status: 'pending' });
  res.json({ success: true, message: 'Pre-booking confirmed. Admin notified.' });
});

app.get('/api/admin/notifications', (req, res) => {
  res.json(preBookings);
});

// ── Feedback ──
app.post('/api/feedback', (req, res) => {
  const { studentName, bookTitle, message, rating } = req.body;
  feedbacks.push({ studentName, bookTitle, message, rating: Number(rating), date: new Date() });
  const book = books.find(b => b.title === bookTitle);
  if (book) {
    if (!book.ratings) book.ratings = [];
    book.ratings.push(Number(rating));
  }
  res.json({ success: true });
});

app.get('/api/admin/feedbacks', (req, res) => {
  res.json(feedbacks);
});

// ── Stats ──
app.get('/api/admin/stats', (req, res) => {
  res.json(stats);
});

// ── Books CRUD ──
app.get('/api/books', (req, res) => {
  res.json(books);
});

app.post('/api/books', upload.single('bookFile'), (req, res) => {
  const { title, category, pages } = req.body;
  const bookPages = pages
    ? pages.split('\n\n').filter(p => p.trim())
    : [`Content from uploaded file: ${req.file ? req.file.originalname : 'No file'}`];

  const newBook = {
    id: Date.now(),
    title,
    category,
    pages: bookPages.length ? bookPages : [`This is "${title}" — digital preview coming soon.`],
    fileName: req.file ? req.file.filename : null,
    ratings: [],
  };
  books.push(newBook);
  res.json(newBook);
});

app.delete('/api/books/:id', (req, res) => {
  const book = books.find(b => String(b.id) === String(req.params.id));
  if (book && book.fileName) {
    const fp = path.join(__dirname, 'uploads', book.fileName);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  books = books.filter(b => String(b.id) !== String(req.params.id));
  res.json({ success: true });
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`🚀 Smart Library backend running at http://localhost:${PORT}`);
});
