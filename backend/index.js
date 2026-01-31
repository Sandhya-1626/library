const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// In-memory data store for the demo
let stats = {
  totalLogins: 0,
  deptWiseLogins: {
    "Computer Science": 0,
    "Information Technology": 0,
    "ECE": 0,
    "EEE": 0,
    "Mechanical": 0
  },
  studentUsage: [] // { name, startTime, duration, date }
};

const XLSX = require('xlsx');

// Mock data will be overwritten by Excel data if available
let books = [];

function loadBooksFromExcel() {
  try {
    const filePath = path.join(__dirname, '../BooksData(7).xlsx');
    if (!fs.existsSync(filePath)) {
      console.log('Excel file not found, using mock data.');
      return [
        { id: 1, title: 'Python Programming', category: 'Computer Science', pages: ['Basics of Python...', 'Advanced Python...', 'Data Structures'], ratings: [] },
        { id: 2, title: 'Java Basics', category: 'Computer Science', pages: ['Introduction to Java...', 'OOP Concepts...', 'Spring Boot'], ratings: [] }
      ];
    }

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Skip header rows (approx 4 based on inspection)
    const dataRows = rows.slice(4);

    const loadedBooks = dataRows.map((row, index) => {
      if (!row[3]) return null; // Skip empty titles
      const title = row[3];
      const author = row[5];
      const category = row[9] || 'General';
      const pageCount = row[15] || 0;

      // Mock content for the flipbook since Excel only has metadata
      const mockPages = [
        `Title: ${title}\nAuthor: ${author}\nCategory: ${category}\n\n(Cover Page)`,
        `About this Book:\nThis is a digital copy of ${title}.\nPublished by: ${row[11]}\nYear: ${row[16]}`,
        `Chapter 1: Introduction\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
        `Chapter 2: Core Concepts\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
        `Summary:\n\nThis book contains ${pageCount} pages in its physical edition.`
      ];

      return {
        id: index + 1,
        title: title,
        category: category,
        pages: mockPages,
        ratings: []
      };
    }).filter(b => b !== null);

    console.log(`Loaded ${loadedBooks.length} books from Excel.`);
    return loadedBooks;

  } catch (err) {
    console.error('Error loading Excel:', err);
    return [];
  }
}

books = loadBooksFromExcel();

// Manually added book with real PDF page images for the flipbook
books.unshift({
  id: 'edc-notes',
  title: 'EDC Lecture Notes',
  category: 'Electronics and Communication Engg',
  // Using 100 pages for a more complete interactive reading experience
  pages: Array.from({ length: 100 }, (_, i) => `http://localhost:5000/uploads/edc_pages/page_${i + 1}.png`),
  fileName: 'EDC-Lecture-Notes.pdf',
  ratings: [5, 5, 5]
});

let preBookings = [];
let feedbacks = [];

// Login Endpoints
app.post('/api/login/student', (req, res) => {
  const { name, department, rollNo, year } = req.body;
  stats.totalLogins++;
  stats.deptWiseLogins[department] = (stats.deptWiseLogins[department] || 0) + 1;

  const loginEntry = {
    name,
    department,
    rollNo,
    year,
    loginTime: new Date()
  };

  res.json({ success: true, user: loginEntry });
});

app.post('/api/login/admin', (req, res) => {
  const { username, password } = req.body;
  if (username === '12345678' && password === 'sandhya') {
    res.json({ success: true, role: 'admin' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Notifications / Pre-booking
app.post('/api/prebook', (req, res) => {
  const { studentName, bookTitle } = req.body;
  const booking = { studentName, bookTitle, time: new Date(), status: 'pending' };
  preBookings.push(booking);
  res.json({ success: true, message: 'Notification sent to admin' });
});

app.get('/api/admin/notifications', (req, res) => {
  res.json(preBookings);
});

// Feedback Endpoints
app.post('/api/feedback', (req, res) => {
  const { studentName, bookTitle, message, rating } = req.body;
  feedbacks.push({ studentName, bookTitle, message, rating, date: new Date() });

  // Update book rating
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

// Stats for Admin Dashboard
app.get('/api/admin/stats', (req, res) => {
  res.json(stats);
});

app.post('/api/logout', (req, res) => {
  const { name, duration } = req.body;
  stats.studentUsage.push({ name, duration, date: new Date().toLocaleDateString() });
  res.json({ success: true });
});

// Book Management
app.get('/api/books', (req, res) => {
  res.json(books);
});

app.post('/api/books', upload.single('bookFile'), (req, res) => {
  const { title, category, pages } = req.body;

  // If a file was uploaded, we might use it. 
  // For the "swap page" UI, we'll still use the pages provided or mock them from the file.
  const bookPages = pages ? pages.split('\n\n') : ["Content from uploaded file: " + (req.file ? req.file.originalname : "No file")];

  const newBook = {
    id: books.length + 1,
    title,
    category,
    pages: bookPages,
    fileName: req.file ? req.file.filename : null,
    ratings: []
  };

  books.push(newBook);
  res.json(newBook);
});

app.delete('/api/books/:id', (req, res) => {
  const book = books.find(b => b.id == req.params.id);
  if (book && book.fileName) {
    const filePath = path.join(__dirname, 'uploads', book.fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  books = books.filter(b => b.id != req.params.id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
