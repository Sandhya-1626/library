const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
const PORT = 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Multer ──────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// ── In-memory store ─────────────────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════════
//  5 FEATURED E-BOOKS  (full chapter content — readable & downloadable)
// ═══════════════════════════════════════════════════════════════════════════
const FEATURED_EBOOKS = [
  {
    id: 'ebook-python',
    title: 'Introduction to Python Programming',
    author: 'Smart Library Press',
    category: 'Computer Science',
    cover: '🐍',
    ratings: [5, 4, 5, 5, 4],
    isEbook: true,
    pages: [
      // Page 1 – Cover / Preface
      `INTRODUCTION TO PYTHON PROGRAMMING
═══════════════════════════════════
Author  : Smart Library Press
Edition : 2024 (Open Edition)
Category: Computer Science

PREFACE
───────
Python is one of the world's most popular, beginner-friendly,
and versatile programming languages. Used by Google, NASA,
Netflix, and millions of developers worldwide, Python powers
everything from simple scripts to complex AI systems.

This book guides you from zero to confident programmer in a
clear, step-by-step approach with practical examples.

Topics Covered:
  • Variables, Data Types & Operators
  • Control Flow (if/else, loops)
  • Functions & Modules
  • Object-Oriented Programming
  • File Handling & Exceptions
  • Libraries: NumPy, Pandas, Matplotlib

Happy Coding! 🐍`,

      // Page 2 – Chapter 1
      `CHAPTER 1: GETTING STARTED WITH PYTHON
═══════════════════════════════════════

1.1  What is Python?
─────────────────────
Python is a high-level, interpreted, general-purpose programming
language created by Guido van Rossum in 1991. It emphasises
code readability with its notable use of significant indentation.

1.2  Installing Python
──────────────────────
1. Visit https://www.python.org/downloads/
2. Download the latest version (3.x)
3. Run the installer – tick "Add Python to PATH"
4. Verify: open a terminal and type  python --version

1.3  Your First Program
────────────────────────
  # hello_world.py
  print("Hello, World!")
  print("Welcome to Python!")

Run it:  python hello_world.py

1.4  Python Interactive Shell (REPL)
──────────────────────────────────────
Type  python  in your terminal to enter the shell:
  >>> 2 + 3
  5
  >>> print("Hello")
  Hello`,

      // Page 3 – Chapter 2
      `CHAPTER 2: VARIABLES & DATA TYPES
══════════════════════════════════

2.1  Variables
───────────────
Variables store data. No type declaration needed in Python.

  name    = "Alice"        # String
  age     = 21             # Integer
  gpa     = 9.5            # Float
  is_cs   = True           # Boolean

2.2  Basic Data Types
──────────────────────
  Type        Example          Notes
  ─────────────────────────────────────────
  int         42               Whole number
  float       3.14             Decimal
  str         "hello"          Text (use '' or "")
  bool        True / False     Logic
  list        [1, 2, 3]        Ordered, mutable
  tuple       (1, 2, 3)        Ordered, immutable
  dict        {"a": 1}         Key-value pairs
  set         {1, 2, 3}        Unique values

2.3  Type Conversion
─────────────────────
  x = int("42")       # str → int
  y = str(3.14)       # float → str
  z = float(5)        # int → float

2.4  Operators
───────────────
  Arithmetic : +  -  *  /  //  %  **
  Comparison : ==  !=  >  <  >=  <=
  Logical    : and  or  not`,

      // Page 4 – Chapter 3
      `CHAPTER 3: CONTROL FLOW
═══════════════════════

3.1  if / elif / else
──────────────────────
  score = 85

  if score >= 90:
      print("Grade: A")
  elif score >= 75:
      print("Grade: B")
  elif score >= 60:
      print("Grade: C")
  else:
      print("Grade: F")

3.2  for Loop
──────────────
  # Loop over a list
  fruits = ["apple", "banana", "cherry"]
  for fruit in fruits:
      print(fruit)

  # Loop with range
  for i in range(1, 6):   # 1 to 5
      print(i)

3.3  while Loop
────────────────
  count = 1
  while count <= 5:
      print(f"Count: {count}")
      count += 1

3.4  Loop Control
──────────────────
  for i in range(10):
      if i == 5:
          break       # exit loop
      if i % 2 == 0:
          continue    # skip even
      print(i)

3.5  List Comprehension
────────────────────────
  squares = [x**2 for x in range(1, 6)]
  # [1, 4, 9, 16, 25]`,

      // Page 5 – Chapter 4
      `CHAPTER 4: FUNCTIONS & MODULES
═══════════════════════════════

4.1  Defining Functions
────────────────────────
  def greet(name):
      """Return a greeting message."""
      return f"Hello, {name}!"

  print(greet("Alice"))   # Hello, Alice!

4.2  Default & Keyword Arguments
──────────────────────────────────
  def power(base, exp=2):
      return base ** exp

  print(power(3))     # 9  (exp defaults to 2)
  print(power(2, 10)) # 1024

4.3  *args and **kwargs
────────────────────────
  def add(*numbers):
      return sum(numbers)

  print(add(1, 2, 3, 4))   # 10

4.4  Lambda Functions
──────────────────────
  square = lambda x: x ** 2
  print(square(7))    # 49

4.5  Built-in Modules
──────────────────────
  import math
  print(math.sqrt(144))   # 12.0
  print(math.pi)           # 3.14159...

  import random
  print(random.randint(1, 100))

  import datetime
  print(datetime.date.today())`,

      // Page 6 – Chapter 5
      `CHAPTER 5: OBJECT-ORIENTED PROGRAMMING
════════════════════════════════════════

5.1  Classes & Objects
───────────────────────
  class Student:
      def __init__(self, name, roll):
          self.name = name
          self.roll = roll

      def display(self):
          print(f"Name: {self.name}, Roll: {self.roll}")

  s1 = Student("Alice", "CS001")
  s1.display()

5.2  Inheritance
─────────────────
  class Person:
      def __init__(self, name):
          self.name = name

      def speak(self):
          return f"Hi, I am {self.name}"

  class Teacher(Person):
      def teach(self):
          return f"{self.name} is teaching."

  t = Teacher("Dr. Smith")
  print(t.speak())
  print(t.teach())

5.3  Encapsulation (Private variables)
────────────────────────────────────────
  class BankAccount:
      def __init__(self, balance):
          self.__balance = balance   # private

      def deposit(self, amount):
          self.__balance += amount

      def get_balance(self):
          return self.__balance`,

      // Page 7 – Chapter 6
      `CHAPTER 6: FILE HANDLING & EXCEPTIONS
══════════════════════════════════════

6.1  Reading a File
────────────────────
  with open("data.txt", "r") as f:
      content = f.read()
      print(content)

  # Read line by line
  with open("data.txt") as f:
      for line in f:
          print(line.strip())

6.2  Writing a File
────────────────────
  with open("output.txt", "w") as f:
      f.write("Hello, File!\n")
      f.write("Second line.")

6.3  Append Mode
─────────────────
  with open("log.txt", "a") as f:
      f.write("New log entry\n")

6.4  Exception Handling
────────────────────────
  try:
      num = int(input("Enter number: "))
      result = 100 / num
      print(result)
  except ZeroDivisionError:
      print("Cannot divide by zero!")
  except ValueError:
      print("Please enter a valid number.")
  finally:
      print("Execution complete.")

6.5  Raising Exceptions
────────────────────────
  def check_age(age):
      if age < 0:
          raise ValueError("Age cannot be negative!")
      return age`,

      // Page 8 – Summary
      `SUMMARY & NEXT STEPS
════════════════════

Congratulations on completing this book! 🎉

What You've Learned:
─────────────────────
  ✅ Python installation & setup
  ✅ Variables, data types & operators
  ✅ Control flow: if/else, for, while
  ✅ Functions, lambda, modules
  ✅ Object-Oriented Programming
  ✅ File handling & exceptions

Recommended Next Steps:
────────────────────────
  1. Practice on HackerRank / LeetCode
  2. Build a small project (calculator, to-do app)
  3. Explore Django or Flask for web development
  4. Learn NumPy & Pandas for data science
  5. Try machine learning with scikit-learn

Useful Resources:
──────────────────
  • Official docs : https://docs.python.org
  • Tutorial      : https://www.w3schools.com/python
  • Practice      : https://replit.com

Keep coding, keep growing! 🐍🚀

                     — Smart Library Press, 2024`,
    ],
  },

  {
    id: 'ebook-dsa',
    title: 'Data Structures & Algorithms',
    author: 'Smart Library Press',
    category: 'Computer Science',
    cover: '📊',
    ratings: [5, 5, 4, 5],
    isEbook: true,
    pages: [
      `DATA STRUCTURES & ALGORITHMS
═════════════════════════════
Author  : Smart Library Press
Edition : 2024 (Open Edition)
Category: Computer Science

PREFACE
───────
Data Structures and Algorithms (DSA) form the backbone of
efficient software engineering. Every great programmer
understands how to organise data and solve problems optimally.

This book covers fundamental data structures and the most
important algorithms used in technical interviews and
real-world software development.

Topics Covered:
  • Arrays, Linked Lists, Stacks, Queues
  • Trees (BST, AVL, Heap)
  • Graphs (BFS, DFS)
  • Sorting Algorithms
  • Searching Algorithms
  • Dynamic Programming
  • Time & Space Complexity (Big-O)`,

      `CHAPTER 1: ARRAYS & COMPLEXITY ANALYSIS
════════════════════════════════════════

1.1  Arrays
────────────
An array is a collection of elements stored at contiguous
memory locations. It is the simplest and most widely used
data structure.

  # Python list (dynamic array)
  arr = [10, 20, 30, 40, 50]
  print(arr[0])       # 10 (index starts at 0)
  arr.append(60)      # Add to end  O(1)
  arr.pop()           # Remove from end  O(1)
  arr.insert(2, 99)   # Insert at index  O(n)

1.2  Big-O Notation
────────────────────
Big-O describes worst-case time complexity.

  Notation    Name          Example
  ──────────────────────────────────────────
  O(1)        Constant      Array index lookup
  O(log n)    Logarithmic   Binary search
  O(n)        Linear        Linear search
  O(n log n)  Linearithmic  Merge sort
  O(n²)       Quadratic     Bubble sort
  O(2ⁿ)       Exponential   Recursive Fibonacci

1.3  Two-Pointer Technique
───────────────────────────
  def two_sum(arr, target):
      left, right = 0, len(arr) - 1
      while left < right:
          s = arr[left] + arr[right]
          if s == target:   return (left, right)
          elif s < target:  left += 1
          else:             right -= 1`,

      `CHAPTER 2: LINKED LISTS, STACKS & QUEUES
══════════════════════════════════════════

2.1  Singly Linked List
────────────────────────
  class Node:
      def __init__(self, data):
          self.data = data
          self.next = None

  class LinkedList:
      def __init__(self):
          self.head = None

      def append(self, data):
          new_node = Node(data)
          if not self.head:
              self.head = new_node; return
          cur = self.head
          while cur.next: cur = cur.next
          cur.next = new_node

2.2  Stack (LIFO)
──────────────────
  stack = []
  stack.append(1)    # push
  stack.append(2)
  stack.pop()        # pop → 2
  # Use: undo operations, bracket matching

2.3  Queue (FIFO)
──────────────────
  from collections import deque
  q = deque()
  q.append(1)        # enqueue
  q.append(2)
  q.popleft()        # dequeue → 1
  # Use: BFS, task scheduling

2.4  Bracket Matching with Stack
──────────────────────────────────
  def is_balanced(s):
      stack, match = [], {')':'(', ']':'[', '}':'{'}
      for ch in s:
          if ch in '([{': stack.append(ch)
          elif ch in ')]}':
              if not stack or stack[-1]!=match[ch]:
                  return False
              stack.pop()
      return len(stack) == 0`,

      `CHAPTER 3: SORTING ALGORITHMS
═══════════════════════════════

3.1  Bubble Sort  — O(n²)
──────────────────────────
  def bubble_sort(arr):
      n = len(arr)
      for i in range(n):
          for j in range(0, n-i-1):
              if arr[j] > arr[j+1]:
                  arr[j], arr[j+1] = arr[j+1], arr[j]

3.2  Merge Sort  — O(n log n)
──────────────────────────────
  def merge_sort(arr):
      if len(arr) <= 1: return arr
      mid = len(arr) // 2
      L = merge_sort(arr[:mid])
      R = merge_sort(arr[mid:])
      return merge(L, R)

  def merge(L, R):
      result, i, j = [], 0, 0
      while i < len(L) and j < len(R):
          if L[i] <= R[j]: result.append(L[i]); i+=1
          else:             result.append(R[j]); j+=1
      return result + L[i:] + R[j:]

3.3  Quick Sort  — O(n log n) avg
───────────────────────────────────
  def quick_sort(arr):
      if len(arr) <= 1: return arr
      pivot = arr[len(arr)//2]
      left  = [x for x in arr if x < pivot]
      mid   = [x for x in arr if x == pivot]
      right = [x for x in arr if x > pivot]
      return quick_sort(left) + mid + quick_sort(right)

Algorithm Comparison:
  Algorithm    Best     Avg       Worst    Stable?
  ─────────────────────────────────────────────────
  Bubble       O(n)     O(n²)     O(n²)    Yes
  Merge        O(nlogn) O(nlogn)  O(nlogn) Yes
  Quick        O(nlogn) O(nlogn)  O(n²)    No`,

      `CHAPTER 4: TREES & GRAPHS
══════════════════════════

4.1  Binary Search Tree (BST)
──────────────────────────────
  class TreeNode:
      def __init__(self, val):
          self.val   = val
          self.left  = None
          self.right = None

  BST Property:
    left.val < node.val < right.val

  Search: O(log n) average
  Insert: O(log n) average

4.2  Tree Traversals
─────────────────────
  def inorder(root):    # Left → Root → Right
      if root:
          inorder(root.left)
          print(root.val)
          inorder(root.right)

  def preorder(root):   # Root → Left → Right
      if root:
          print(root.val)
          preorder(root.left)
          preorder(root.right)

4.3  Graphs
────────────
  Represented as: Adjacency List

  graph = {
      'A': ['B', 'C'],
      'B': ['A', 'D'],
      'C': ['A'],
      'D': ['B']
  }

4.4  BFS (Breadth-First Search)
────────────────────────────────
  from collections import deque
  def bfs(graph, start):
      visited, queue = set(), deque([start])
      while queue:
          node = queue.popleft()
          if node not in visited:
              visited.add(node)
              print(node)
              queue.extend(graph[node])`,

      `CHAPTER 5: DYNAMIC PROGRAMMING
════════════════════════════════

5.1  What is DP?
─────────────────
Dynamic Programming solves problems by breaking them into
overlapping subproblems and storing results (memoisation).

Key signals: "minimum/maximum", "count ways", "is it possible?"

5.2  Fibonacci — Naive vs DP
─────────────────────────────
  # Naive: O(2ⁿ)
  def fib_naive(n):
      if n <= 1: return n
      return fib_naive(n-1) + fib_naive(n-2)

  # Memoisation: O(n)
  def fib_memo(n, memo={}):
      if n in memo: return memo[n]
      if n <= 1:    return n
      memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)
      return memo[n]

  # Bottom-up: O(n) time, O(1) space
  def fib_dp(n):
      a, b = 0, 1
      for _ in range(n): a, b = b, a+b
      return a

5.3  0/1 Knapsack
──────────────────
  def knapsack(W, weights, values, n):
      dp = [[0]*(W+1) for _ in range(n+1)]
      for i in range(1, n+1):
          for w in range(W+1):
              dp[i][w] = dp[i-1][w]
              if weights[i-1] <= w:
                  dp[i][w] = max(dp[i][w],
                      values[i-1] + dp[i-1][w-weights[i-1]])
      return dp[n][W]`,

      `SUMMARY & PRACTICE PROBLEMS
════════════════════════════

Topics Mastered:
─────────────────
  ✅ Arrays & Big-O complexity
  ✅ Linked Lists, Stacks, Queues
  ✅ Sorting: Bubble, Merge, Quick
  ✅ Trees (BST, traversals)
  ✅ Graphs (BFS, DFS)
  ✅ Dynamic Programming

Top Interview Questions:
─────────────────────────
  1. Two Sum (Array)
  2. Reverse a Linked List
  3. Valid Parentheses (Stack)
  4. Binary Search
  5. Maximum Subarray (Kadane's Algorithm)
  6. Climbing Stairs (DP)
  7. Merge Two Sorted Arrays
  8. Level Order Traversal (BFS)

Practice Platforms:
────────────────────
  • LeetCode          : https://leetcode.com
  • GeeksForGeeks     : https://geeksforgeeks.org
  • HackerRank        : https://hackerrank.com
  • Codeforces        : https://codeforces.com

Recommended Reading:
─────────────────────
  • CLRS – Introduction to Algorithms
  • Cracking the Coding Interview

                     — Smart Library Press, 2024`,
    ],
  },

  {
    id: 'ebook-webdev',
    title: 'Web Development: HTML, CSS & JavaScript',
    author: 'Smart Library Press',
    category: 'Information Technology',
    cover: '🌐',
    ratings: [5, 4, 5],
    isEbook: true,
    pages: [
      `WEB DEVELOPMENT: HTML, CSS & JAVASCRIPT
════════════════════════════════════════
Author  : Smart Library Press
Edition : 2024 (Open Edition)
Category: Information Technology

PREFACE
───────
The web is built on three core technologies:
  • HTML  — Structure & Content
  • CSS   — Style & Layout
  • JavaScript — Behaviour & Interactivity

Together, they power every website and web application
you use daily. This book takes you from your first
HTML file to building interactive, styled web pages.

Topics Covered:
  • HTML5 Semantic Elements
  • CSS Selectors, Flexbox & Grid
  • CSS Animations & Transitions
  • JavaScript DOM Manipulation
  • Events & Forms
  • Fetch API & JSON
  • Responsive Design`,

      `CHAPTER 1: HTML FUNDAMENTALS
═════════════════════════════

1.1  Basic Structure
─────────────────────
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width,initial-scale=1.0">
    <title>My First Page</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
    <p>Welcome to web development.</p>
  </body>
  </html>

1.2  Semantic HTML5 Elements
──────────────────────────────
  <header>   — Top of page / section
  <nav>      — Navigation links
  <main>     — Primary content
  <section>  — Thematic grouping
  <article>  — Self-contained content
  <aside>    — Sidebar content
  <footer>   — Bottom of page

1.3  Common Tags
─────────────────
  <h1>–<h6>    Headings
  <p>           Paragraph
  <a href="">   Hyperlink
  <img src="">  Image
  <ul><li>      Unordered list
  <ol><li>      Ordered list
  <table>       Table
  <form>        Form container
  <input>       Input field
  <button>      Clickable button`,

      `CHAPTER 2: CSS STYLING
══════════════════════

2.1  CSS Selectors
───────────────────
  /* Element selector */
  p { color: blue; }

  /* Class selector */
  .card { background: white; border-radius: 8px; }

  /* ID selector */
  #header { background: #6366f1; }

  /* Pseudo-class */
  a:hover { color: purple; }
  li:first-child { font-weight: bold; }

2.2  Box Model
───────────────
  Every element is a box:
  [margin [border [padding [content]]]]

  div {
    width: 300px;
    padding: 20px;
    border: 2px solid black;
    margin: 10px auto;
  }

2.3  Flexbox
─────────────
  .container {
    display: flex;
    justify-content: center;   /* horizontal */
    align-items: center;       /* vertical   */
    gap: 16px;
    flex-wrap: wrap;
  }

2.4  CSS Grid
──────────────
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

2.5  CSS Variables
───────────────────
  :root {
    --primary: #6366f1;
    --text: #1e293b;
  }
  button { background: var(--primary); }`,

      `CHAPTER 3: JAVASCRIPT ESSENTIALS
══════════════════════════════════

3.1  Variables & Types
───────────────────────
  let   name  = "Alice";     // reassignable
  const PI    = 3.14159;     // constant
  var   count = 0;           // old style (avoid)

3.2  Functions
───────────────
  // Declaration
  function add(a, b) { return a + b; }

  // Arrow function
  const multiply = (a, b) => a * b;

  // Async/Await
  async function fetchData(url) {
    const res  = await fetch(url);
    const data = await res.json();
    return data;
  }

3.3  DOM Manipulation
──────────────────────
  // Select elements
  const title = document.getElementById("title");
  const cards = document.querySelectorAll(".card");

  // Modify content
  title.textContent = "New Title";
  title.style.color = "purple";

  // Create elements
  const div = document.createElement("div");
  div.className = "card";
  document.body.appendChild(div);

3.4  Events
────────────
  const btn = document.getElementById("myBtn");
  btn.addEventListener("click", () => {
    alert("Button clicked!");
  });

  // Form submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();   // stop page reload
    console.log("Form submitted");
  });`,

      `CHAPTER 4: FETCH API & JSON
════════════════════════════

4.1  What is JSON?
───────────────────
JSON (JavaScript Object Notation) is a lightweight data
format used to exchange data between client and server.

  {
    "name": "Alice",
    "age": 21,
    "courses": ["Math", "CS", "Physics"],
    "address": {
      "city": "Chennai",
      "state": "Tamil Nadu"
    }
  }

4.2  Fetch API
───────────────
  // GET request
  fetch("https://api.example.com/books")
    .then(res  => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));

  // POST request
  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin",
                           password: "1234" })
  }).then(res => res.json())
    .then(data => {
      if (data.success) alert("Logged in!");
    });

4.3  Async/Await Pattern
─────────────────────────
  async function loadBooks() {
    try {
      const res  = await fetch("/api/books");
      const books = await res.json();
      books.forEach(book => renderCard(book));
    } catch (error) {
      console.error("Failed:", error);
    }
  }`,

      `CHAPTER 5: RESPONSIVE DESIGN
══════════════════════════════

5.1  Viewport Meta Tag
───────────────────────
  <meta name="viewport"
        content="width=device-width, initial-scale=1.0">

5.2  Media Queries
───────────────────
  /* Mobile first */
  .grid { grid-template-columns: 1fr; }

  @media (min-width: 640px) {
    .grid { grid-template-columns: repeat(2,1fr); }
  }

  @media (min-width: 1024px) {
    .grid { grid-template-columns: repeat(3,1fr); }
  }

5.3  Fluid Typography
──────────────────────
  h1 {
    font-size: clamp(1.5rem, 4vw, 3rem);
  }

5.4  CSS Animations
────────────────────
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .card {
    animation: fadeIn 0.5s ease forwards;
  }

  .btn:hover {
    transform: translateY(-3px);
    transition: transform 0.2s ease;
  }

5.5  Common Breakpoints
────────────────────────
  Mobile  : < 640px
  Tablet  : 640px – 1024px
  Desktop : > 1024px`,

      `SUMMARY & PROJECT IDEAS
═══════════════════════

Skills Acquired:
─────────────────
  ✅ HTML5 semantic structure
  ✅ CSS selectors, Flexbox, Grid
  ✅ Responsive design & media queries
  ✅ JavaScript DOM & events
  ✅ Fetch API & JSON
  ✅ CSS animations

Project Ideas to Build:
────────────────────────
  1. Personal Portfolio Website
  2. To-Do List App (LocalStorage)
  3. Weather App (OpenWeatherMap API)
  4. Quiz Application
  5. E-commerce Product Page
  6. Blog with Search Feature

Next Technologies to Learn:
─────────────────────────────
  • React.js / Vue.js (UI frameworks)
  • Node.js + Express (backend)
  • MongoDB / PostgreSQL (databases)
  • TypeScript (typed JavaScript)
  • TailwindCSS (utility CSS)

Resources:
───────────
  MDN Web Docs   : https://developer.mozilla.org
  W3Schools      : https://www.w3schools.com
  FreeCodeCamp   : https://freecodecamp.org

                     — Smart Library Press, 2024`,
    ],
  },

  {
    id: 'ebook-ml',
    title: 'Machine Learning Fundamentals',
    author: 'Smart Library Press',
    category: 'Computer Science',
    cover: '🤖',
    ratings: [5, 5, 5, 4, 5],
    isEbook: true,
    pages: [
      `MACHINE LEARNING FUNDAMENTALS
══════════════════════════════
Author  : Smart Library Press
Edition : 2024 (Open Edition)
Category: Computer Science / AI

PREFACE
───────
Machine Learning (ML) is the science of getting computers
to learn and act like humans, and to improve their learning
over time autonomously.

ML powers: Google Search, Netflix Recommendations,
face recognition, chatbots, self-driving cars, fraud
detection, and much more.

This book covers the foundations of machine learning with
practical Python examples you can run today.

Prerequisites:
  • Basic Python programming
  • High-school mathematics (algebra, statistics)

Topics Covered:
  • Types of Machine Learning
  • Linear & Logistic Regression
  • Decision Trees & Random Forests
  • Neural Networks basics
  • Model Evaluation & Metrics
  • scikit-learn library`,

      `CHAPTER 1: TYPES OF MACHINE LEARNING
═════════════════════════════════════

1.1  Supervised Learning
─────────────────────────
The model learns from labelled training data.
Goal: predict output for new, unseen inputs.

  Examples:
  • Email spam detection  (classify: spam / not-spam)
  • House price prediction (regression)
  • Image classification   (cat vs dog)

  Algorithms: Linear Regression, Logistic Regression,
              SVM, Decision Tree, Neural Networks

1.2  Unsupervised Learning
───────────────────────────
The model finds patterns in unlabelled data.

  Examples:
  • Customer segmentation
  • Anomaly detection
  • Topic modelling

  Algorithms: K-Means, DBSCAN, PCA, Autoencoder

1.3  Reinforcement Learning
────────────────────────────
An agent learns by interacting with an environment,
receiving rewards for good actions.

  Examples:
  • AlphaGo (game playing)
  • Robot motion control
  • Self-driving cars

1.4  ML Pipeline
─────────────────
  Raw Data → Preprocessing → Feature Engineering
  → Model Training → Evaluation → Deployment`,

      `CHAPTER 2: LINEAR REGRESSION
══════════════════════════════

2.1  Concept
─────────────
Predicts a continuous value (y) given input (x).
  y = mx + b
  y = w₁x₁ + w₂x₂ + ... + b   (multi-variable)

2.2  With scikit-learn
───────────────────────
  from sklearn.linear_model import LinearRegression
  from sklearn.model_selection import train_test_split
  import numpy as np

  # Sample data: study hours → exam score
  X = np.array([[1],[2],[3],[4],[5],[6],[7],[8]])
  y = np.array([35, 45, 55, 62, 70, 78, 85, 92])

  X_train, X_test, y_train, y_test = \
      train_test_split(X, y, test_size=0.2)

  model = LinearRegression()
  model.fit(X_train, y_train)

  # Predict
  print(model.predict([[9]]))  # ~99 expected

2.3  Evaluation Metrics
────────────────────────
  from sklearn.metrics import mean_squared_error, r2_score

  y_pred = model.predict(X_test)
  print("MSE :", mean_squared_error(y_test, y_pred))
  print("R²  :", r2_score(y_test, y_pred))

  MSE (Mean Squared Error)  — lower is better
  R² Score                  — closer to 1 is better`,

      `CHAPTER 3: DECISION TREES & RANDOM FORESTS
═══════════════════════════════════════════

3.1  Decision Tree
───────────────────
A flowchart-like model that splits data using feature
thresholds to make decisions.

  from sklearn.tree import DecisionTreeClassifier
  from sklearn.datasets import load_iris

  data = load_iris()
  X, y = data.data, data.target

  X_train, X_test, y_train, y_test = \
      train_test_split(X, y, test_size=0.3)

  dt = DecisionTreeClassifier(max_depth=3)
  dt.fit(X_train, y_train)
  print("Accuracy:", dt.score(X_test, y_test))

3.2  Random Forest
───────────────────
An ensemble of decision trees — each tree votes,
majority wins. More accurate, less overfit.

  from sklearn.ensemble import RandomForestClassifier

  rf = RandomForestClassifier(n_estimators=100,
                               random_state=42)
  rf.fit(X_train, y_train)
  print("RF Accuracy:", rf.score(X_test, y_test))

3.3  Feature Importance
────────────────────────
  importances = rf.feature_importances_
  for name, imp in zip(data.feature_names, importances):
      print(f"{name}: {imp:.3f}")

  # Shows which features matter most for prediction`,

      `CHAPTER 4: NEURAL NETWORKS BASICS
══════════════════════════════════

4.1  Biological Inspiration
────────────────────────────
A neural network is modelled after the human brain.

  Input Layer → Hidden Layers → Output Layer

Each "neuron" receives inputs, applies an activation function,
and passes output to the next layer.

4.2  Activation Functions
──────────────────────────
  • ReLU    : max(0, x)         — hidden layers
  • Sigmoid : 1/(1+e^-x)       — binary output
  • Softmax : e^x / Σe^x       — multi-class output
  • Tanh    : (e^x-e^-x)/...   — normalised output

4.3  Simple Neural Network (Keras)
────────────────────────────────────
  from tensorflow.keras.models import Sequential
  from tensorflow.keras.layers import Dense

  model = Sequential([
      Dense(64, activation='relu', input_shape=(4,)),
      Dense(32, activation='relu'),
      Dense(3,  activation='softmax')  # 3 classes
  ])

  model.compile(
      optimizer='adam',
      loss='sparse_categorical_crossentropy',
      metrics=['accuracy']
  )

  model.fit(X_train, y_train,
            epochs=50, batch_size=16,
            validation_split=0.2)

4.4  Key Concepts
──────────────────
  Epoch       : One full pass through training data
  Batch size  : Samples processed together
  Overfitting : Learns training set too well, fails on new data
  Dropout     : Randomly disabling neurons to prevent overfitting`,

      `CHAPTER 5: MODEL EVALUATION & BEST PRACTICES
═════════════════════════════════════════════

5.1  Train / Validation / Test Split
──────────────────────────────────────
  Common ratio: 70% train, 15% validation, 15% test

  from sklearn.model_selection import train_test_split
  X_train, X_temp, y_train, y_temp = \
      train_test_split(X, y, test_size=0.30)
  X_val, X_test, y_val, y_test = \
      train_test_split(X_temp, y_temp, test_size=0.50)

5.2  Classification Metrics
─────────────────────────────
  from sklearn.metrics import (
      accuracy_score, precision_score,
      recall_score, f1_score, confusion_matrix
  )

  print("Accuracy :", accuracy_score(y_test, y_pred))
  print("Precision:", precision_score(y_test, y_pred,
                                      average='macro'))
  print("Recall   :", recall_score(y_test, y_pred,
                                    average='macro'))
  print("F1 Score :", f1_score(y_test, y_pred,
                                average='macro'))

5.3  Cross-Validation
──────────────────────
  from sklearn.model_selection import cross_val_score
  scores = cross_val_score(rf, X, y, cv=5)
  print(f"CV Accuracy: {scores.mean():.2f} ± {scores.std():.2f}")

5.4  Overfitting vs Underfitting
─────────────────────────────────
  Underfitting: Model too simple — high bias, high error
  Overfitting : Model too complex — low train error, high test error

  Fix Overfitting:
  • Add more training data
  • Use Dropout / Regularisation
  • Reduce model complexity`,

      `SUMMARY & NEXT STEPS IN AI/ML
══════════════════════════════

Topics Mastered:
─────────────────
  ✅ Supervised, Unsupervised, Reinforcement Learning
  ✅ Linear & Logistic Regression
  ✅ Decision Trees & Random Forests
  ✅ Neural Network architecture
  ✅ Model evaluation metrics

Libraries & Tools:
───────────────────
  • scikit-learn  — classical ML
  • TensorFlow    — deep learning
  • PyTorch       — deep learning (research)
  • Pandas        — data manipulation
  • NumPy         — numerical computing
  • Matplotlib    — data visualisation

Project Ideas:
───────────────
  1. House price predictor (regression)
  2. Spam email classifier
  3. Handwritten digit recogniser (MNIST)
  4. Movie recommendation system
  5. Sentiment analysis on reviews

Learning Path:
───────────────
  Python → NumPy/Pandas → scikit-learn
  → TensorFlow/PyTorch → Advanced Deep Learning → MLOps

Resources:
───────────
  • fast.ai         : https://fast.ai
  • Kaggle          : https://kaggle.com
  • Coursera ML     : Andrew Ng's ML Course

                     — Smart Library Press, 2024`,
    ],
  },

  {
    id: 'ebook-networks',
    title: 'Computer Networks & Security',
    author: 'Smart Library Press',
    category: 'Electronics & Communication',
    cover: '🔐',
    ratings: [4, 5, 4, 5],
    isEbook: true,
    pages: [
      `COMPUTER NETWORKS & SECURITY
══════════════════════════════
Author  : Smart Library Press
Edition : 2024 (Open Edition)
Category: Electronics & Communication

PREFACE
───────
Computer Networks form the foundation of the modern
connected world. Every email, video call, website visit,
and online transaction relies on networking concepts.

Network Security protects data from unauthorised access,
corruption, and attacks — an essential skill for every
engineer in today's digital landscape.

Topics Covered:
  • OSI & TCP/IP Models
  • IP Addressing & Subnetting
  • Protocols: HTTP, TCP, UDP, DNS, DHCP
  • Routing & Switching
  • Network Security Fundamentals
  • Cryptography & SSL/TLS
  • Firewalls, VPNs & Intrusion Detection`,

      `CHAPTER 1: NETWORK MODELS
══════════════════════════

1.1  OSI Model (7 Layers)
──────────────────────────
  Layer  Name            Protocol/Example
  ──────────────────────────────────────────────────
  7      Application     HTTP, FTP, SMTP, DNS
  6      Presentation    SSL/TLS, JPEG, MPEG
  5      Session         NetBIOS, RPC
  4      Transport       TCP, UDP
  3      Network         IP, ICMP, OSPF
  2      Data Link       Ethernet, Wi-Fi (IEEE 802.11)
  1      Physical        Cables, Hubs, Repeaters

Mnemonic: "All People Seem To Need Data Processing"

1.2  TCP/IP Model (4 Layers)
──────────────────────────────
  Layer 4 – Application   (HTTP, DNS, FTP)
  Layer 3 – Transport     (TCP, UDP)
  Layer 2 – Internet      (IP, ICMP)
  Layer 1 – Network Access(Ethernet, Wi-Fi)

1.3  TCP vs UDP
────────────────
  TCP (Transmission Control Protocol):
  • Connection-oriented (3-way handshake)
  • Reliable, ordered delivery
  • Flow & congestion control
  • Use: web browsing, email, file transfer

  UDP (User Datagram Protocol):
  • Connectionless, no handshake
  • Fast, no delivery guarantee
  • Use: video streaming, gaming, DNS, VoIP`,

      `CHAPTER 2: IP ADDRESSING & SUBNETTING
══════════════════════════════════════

2.1  IPv4 Address Structure
────────────────────────────
  32-bit address, written as 4 octets:
  192.168.1.100

  Classes:
  A: 1.0.0.0   – 126.255.255.255  (large networks)
  B: 128.0.0.0 – 191.255.255.255  (medium networks)
  C: 192.0.0.0 – 223.255.255.255  (small networks)

2.2  Private IP Ranges (RFC 1918)
──────────────────────────────────
  10.0.0.0     – 10.255.255.255   (/8)
  172.16.0.0   – 172.31.255.255   (/12)
  192.168.0.0  – 192.168.255.255  (/16)

2.3  Subnet Mask
─────────────────
  255.255.255.0  = /24  → 254 hosts
  255.255.0.0    = /16  → 65,534 hosts
  255.0.0.0      = /8   → 16,777,214 hosts

  CIDR: 192.168.1.0/24
  Network : 192.168.1.0
  Broadcast: 192.168.1.255
  Hosts    : .1 to .254

2.4  IPv6
──────────
  128-bit address, written in hex:
  2001:0db8:85a3:0000:0000:8a2e:0370:7334

  Features: larger address space, no NAT needed,
            built-in IPsec, stateless auto-configuration`,

      `CHAPTER 3: KEY PROTOCOLS
═════════════════════════

3.1  HTTP / HTTPS
──────────────────
  HTTP  — Hypertext Transfer Protocol (port 80)
  HTTPS — HTTP + TLS encryption (port 443)

  Methods: GET, POST, PUT, DELETE, PATCH

  Status Codes:
  200 OK          — Success
  301 Moved       — Redirect
  400 Bad Request — Client error
  401 Unauthorised— Auth required
  404 Not Found   — Resource missing
  500 Server Error— Server crashed

3.2  DNS (Domain Name System)  Port 53
────────────────────────────────────────
  Translates domain → IP address
  google.com → 142.250.183.46

  Record Types:
  A     — domain → IPv4
  AAAA  — domain → IPv6
  CNAME — alias → canonical name
  MX    — mail server
  TXT   — verification strings

3.3  DHCP (Dynamic Host Configuration Protocol)
────────────────────────────────────────────────
  Automatically assigns: IP, Subnet, Gateway, DNS
  Process: DORA
    Discover → Offer → Request → Acknowledge

3.4  FTP / SFTP / SSH
──────────────────────
  FTP  : File Transfer Protocol  (port 21, plaintext)
  SFTP : Secure FTP over SSH     (port 22, encrypted)
  SSH  : Secure Shell            (port 22)
  SMTP : Send email              (port 25/587)
  IMAP : Receive email           (port 143/993)`,

      `CHAPTER 4: NETWORK SECURITY
═════════════════════════════

4.1  Common Threats
────────────────────
  Phishing      : Fake website/email to steal credentials
  DDoS          : Overwhelm server with traffic
  Man-in-Middle : Attacker intercepts communication
  SQL Injection : Malicious DB queries via input fields
  XSS           : Inject scripts into web pages
  Brute Force   : Guess passwords systematically

4.2  Cryptography
──────────────────
  Symmetric Encryption (same key):
  • AES-256  — Advanced Encryption Standard
  • DES      — Data Encryption Standard (old)

  Asymmetric Encryption (public + private key):
  • RSA      — Rivest–Shamir–Adleman
  • ECC      — Elliptic Curve Cryptography

  Hashing (one-way):
  • MD5, SHA-1 (weak — avoid)
  • SHA-256, SHA-3 (strong — use these)
  • bcrypt, Argon2 (for passwords)

4.3  SSL/TLS Handshake
───────────────────────
  1. Client   → Server: "Hello, here's my supported ciphers"
  2. Server   → Client: "Hello, here's my certificate"
  3. Client  verifies server certificate (CA trust chain)
  4. Key exchange (Diffie-Hellman or RSA)
  5. Encrypted session begins

4.4  Firewall
──────────────
  Monitors and filters incoming/outgoing traffic.
  Types:
  • Packet Filter   — checks IP/port
  • Stateful        — tracks connections
  • Application     — inspects application layer (WAF)`,

      `CHAPTER 5: WIRELESS & MODERN NETWORKING
════════════════════════════════════════

5.1  Wi-Fi Standards (IEEE 802.11)
────────────────────────────────────
  Standard  Name     Speed          Band
  ──────────────────────────────────────────
  802.11b   Wi-Fi 1  11 Mbps        2.4GHz
  802.11g   Wi-Fi 3  54 Mbps        2.4GHz
  802.11n   Wi-Fi 4  600 Mbps       2.4/5GHz
  802.11ac  Wi-Fi 5  3.5 Gbps       5GHz
  802.11ax  Wi-Fi 6  9.6 Gbps       2.4/5/6GHz

5.2  VPN (Virtual Private Network)
────────────────────────────────────
  Creates an encrypted tunnel over the internet.
  Protocols: OpenVPN, WireGuard, IPsec, L2TP

  Uses:
  • Access company network remotely
  • Bypass geo-restrictions
  • Protect public Wi-Fi traffic

5.3  Network Topologies
────────────────────────
  Bus    : All devices on one cable (legacy)
  Star   : All connect to central switch (most common)
  Ring   : Devices form a loop
  Mesh   : Every device connected to every other
  Hybrid : Combination of above

5.4  SDN (Software-Defined Networking)
────────────────────────────────────────
  • Separates control plane from data plane
  • Network managed via software/APIs
  • Used in cloud computing (AWS, Azure, GCP)`,

      `SUMMARY & CERTIFICATIONS
═════════════════════════

Topics Mastered:
─────────────────
  ✅ OSI & TCP/IP models
  ✅ IP addressing & subnetting
  ✅ Protocols: HTTP, DNS, DHCP, FTP, SSH
  ✅ Network security threats
  ✅ Cryptography & SSL/TLS
  ✅ Wireless networking
  ✅ VPN & firewalls

Industry Certifications:
─────────────────────────
  Entry Level:
  • CompTIA Network+ — networking fundamentals
  • CompTIA Security+ — security fundamentals

  Intermediate:
  • Cisco CCNA — network associate
  • Certified Ethical Hacker (CEH)

  Advanced:
  • Cisco CCNP / CCIE
  • CISSP — security professional
  • Offensive Security OSCP

Useful Tools:
──────────────
  Wireshark  — packet analyser
  Nmap       — network scanner
  Metasploit — penetration testing
  Burp Suite — web security testing

                     — Smart Library Press, 2024`,
    ],
  },
];

// ─── Load books from Excel ───────────────────────────────────────────────────
function loadBooksFromExcel() {
  try {
    const filePath = path.join(__dirname, '../BooksData(7).xlsx');
    if (!fs.existsSync(filePath)) {
      console.log('Excel file not found – using mock data only.');
      return [];
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
      return {
        id: `excel-${index + 1}`,
        title,
        category,
        pages: [
          `Title: ${title}\nAuthor: ${author}\nCategory: ${category}\n\n(Cover Page)`,
          `About this Book:\nThis is a digital copy of "${title}".\nPublished by: ${row[11] || 'N/A'}\nYear: ${row[16] || 'N/A'}`,
          `Chapter 1: Introduction\n\nThis book "${title}" is part of the ${category} collection.\nPhysical edition contains ${pageCount} pages.\n\nContent preview available in the physical copy at the library counter.`,
          `Chapter 2: Core Concepts\n\nPlease visit the library for the complete physical edition of this book.\n\nYou may Pre-Book a physical copy using the Pre-Book button on the book card.`,
          `Summary:\n\nThis book "${title}" is available for physical borrowing.\nUse the Pre-Book feature to reserve your copy today!`,
        ],
        ratings: [],
        isEbook: false,
      };
    }).filter(Boolean);

    console.log(`✅ Loaded ${loaded.length} books from Excel.`);
    return loaded;
  } catch (err) {
    console.error('Error loading Excel:', err.message);
    return [];
  }
}

// ─── Assemble full books list (featured e-books first) ──────────────────────
let books = [
  ...FEATURED_EBOOKS,
  ...loadBooksFromExcel(),
];

// ═══════════════════════════════════════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// ── Auth ────────────────────────────────────────────────────────────────────
app.post('/api/login/student', (req, res) => {
  const { name, department, rollNo, year } = req.body;
  if (!name || !rollNo)
    return res.status(400).json({ success: false, message: 'Name and Roll Number are required.' });

  stats.totalLogins++;
  stats.deptWiseLogins[department] = (stats.deptWiseLogins[department] || 0) + 1;
  res.json({ success: true, user: { name, department, rollNo, year, loginTime: new Date() } });
});

app.post('/api/login/admin', (req, res) => {
  const { username, password } = req.body;
  if (username === '12345678' && password === 'sandhya')
    res.json({ success: true, role: 'admin' });
  else
    res.status(401).json({ success: false, message: 'Invalid credentials. Check your Admin ID and password.' });
});

// ── Logout ──────────────────────────────────────────────────────────────────
app.post('/api/logout', (req, res) => {
  const { name, duration } = req.body;
  stats.studentUsage.push({ name, duration, date: new Date().toLocaleDateString() });
  res.json({ success: true });
});

// ── Pre-booking ──────────────────────────────────────────────────────────────
app.post('/api/prebook', (req, res) => {
  const { studentName, bookTitle } = req.body;
  preBookings.push({ studentName, bookTitle, time: new Date(), status: 'pending' });
  res.json({ success: true });
});
app.get('/api/admin/notifications', (req, res) => res.json(preBookings));

// ── Feedback ─────────────────────────────────────────────────────────────────
app.post('/api/feedback', (req, res) => {
  const { studentName, bookTitle, message, rating } = req.body;
  feedbacks.push({ studentName, bookTitle, message, rating: Number(rating), date: new Date() });
  const book = books.find(b => b.title === bookTitle);
  if (book) { if (!book.ratings) book.ratings = []; book.ratings.push(Number(rating)); }
  res.json({ success: true });
});
app.get('/api/admin/feedbacks', (req, res) => res.json(feedbacks));

// ── Stats ─────────────────────────────────────────────────────────────────────
app.get('/api/admin/stats', (req, res) => res.json(stats));

// ── Books CRUD ────────────────────────────────────────────────────────────────
app.get('/api/books', (req, res) => res.json(books));

// ── Download a book as .txt ───────────────────────────────────────────────────
app.get('/api/books/:id/download', (req, res) => {
  const book = books.find(b => String(b.id) === String(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found.' });

  const content = book.pages.join('\n\n' + '═'.repeat(60) + '\n\n');
  const filename = book.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') + '.txt';

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(content);
});

// ── Add book ──────────────────────────────────────────────────────────────────
app.post('/api/books', upload.single('bookFile'), (req, res) => {
  const { title, category, pages } = req.body;
  const bookPages = pages
    ? pages.split('\n\n').filter(p => p.trim())
    : [`Content from uploaded file: ${req.file ? req.file.originalname : 'No file'}`];

  const newBook = {
    id: `custom-${Date.now()}`,
    title, category,
    pages: bookPages.length ? bookPages : [`This is "${title}" — digital preview coming soon.`],
    fileName: req.file ? req.file.filename : null,
    ratings: [],
    isEbook: false,
  };
  books.push(newBook);
  res.json(newBook);
});

// ── Delete book ───────────────────────────────────────────────────────────────
app.delete('/api/books/:id', (req, res) => {
  const book = books.find(b => String(b.id) === String(req.params.id));
  if (book && book.fileName) {
    const fp = path.join(__dirname, 'uploads', book.fileName);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  books = books.filter(b => String(b.id) !== String(req.params.id));
  res.json({ success: true });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Smart Library backend → http://localhost:${PORT}`);
  console.log(`📚 Featured e-books     : ${FEATURED_EBOOKS.length}`);
  console.log(`📖 Total books loaded   : ${books.length}`);
});
