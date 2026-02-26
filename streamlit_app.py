"""
Smart Digital Library — Streamlit Frontend
Connects to Node.js backend on http://localhost:5000
Run: python -m streamlit run streamlit_app.py
"""

import streamlit as st
import requests
import pandas as pd
import json
import time
from datetime import datetime

# ─── Config ───────────────────────────────────────────────────────────────────
BACKEND = "http://localhost:5000/api"

st.set_page_config(
    page_title="📚 Smart Digital Library",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── Premium CSS ──────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&family=Georgia:ital@0;1&display=swap');

*, html, body { font-family: 'Inter', sans-serif !important; }
.stApp { background: radial-gradient(ellipse at top, #1a1040 0%, #04051a 60%); }
[data-testid="stSidebar"] {
    background: rgba(4,5,26,0.98) !important;
    border-right: 1px solid rgba(99,102,241,0.15) !important;
}
[data-testid="stSidebar"] * { color: #e2e8f0 !important; }
h1, h2, h3 { color: #f1f5f9 !important; }
p, span, div { color: #cbd5e1; }
.stButton > button {
    background: linear-gradient(135deg, #6366f1, #a855f7) !important;
    color: #fff !important; border: none !important; border-radius: 12px !important;
    font-weight: 600 !important; transition: all 0.3s !important;
    padding: 0.55rem 1.2rem !important;
}
.stButton > button:hover { opacity: 0.9 !important; transform: translateY(-1px) !important; }
.stTextInput > div > div > input {
    background: rgba(255,255,255,0.06) !important;
    color: #f1f5f9 !important; border: 1px solid rgba(99,102,241,0.3) !important;
    border-radius: 10px !important;
}
.stSelectbox > div > div {
    background: rgba(255,255,255,0.06) !important;
    border: 1px solid rgba(99,102,241,0.3) !important; border-radius: 10px !important;
}
.stSelectbox label, .stTextInput label, .stSlider label {
    color: #94a3b8 !important; font-size: 0.82rem !important; font-weight: 600 !important;
}
.stSlider > div > div { color: #818cf8 !important; }
hr { border-color: rgba(255,255,255,0.08) !important; }

/* Cards */
.book-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 18px; padding: 1.3rem;
    margin-bottom: 1rem; cursor: pointer;
    transition: all 0.3s ease;
    position: relative; overflow: hidden;
}
.book-card:hover {
    border-color: rgba(99,102,241,0.5);
    background: rgba(99,102,241,0.07);
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
}
.book-cover {
    font-size: 3.5rem; text-align: center;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    padding: 1.5rem; border-radius: 12px; margin-bottom: 0.8rem;
}
.ebook-badge {
    display: inline-block; padding: 2px 10px; border-radius: 999px;
    font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em;
    background: rgba(16,185,129,0.2); color: #10b981;
    border: 1px solid rgba(16,185,129,0.3);
}

/* Reader */
.reader-page {
    background: #fffef9; border-radius: 16px;
    padding: 2.5rem 3rem; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    font-family: 'Georgia', serif !important; color: #1e293b !important;
    font-size: 1rem; line-height: 1.9; min-height: 480px;
    border: 1px solid #e2e8f0;
}
.reader-page h1 { font-size: 1.2rem !important; color: #1e1b4b !important;
    font-family: 'Inter', sans-serif !important; font-weight: 800 !important;
    border-bottom: 2px solid #e0e7ff; padding-bottom: 0.4rem; margin-bottom: 0.8rem !important; }
.reader-page h2 { font-size: 1rem !important; color: #312e81 !important;
    font-family: 'Inter', sans-serif !important; font-weight: 700 !important; margin-top: 0.8rem !important; }
.reader-page code {
    background: #eef2ff; color: #4338ca; border-radius: 5px;
    padding: 2px 6px; font-size: 0.88rem; border: 1px solid #c7d2fe; }
.formula-box {
    background: #f1f5ff; border: 1px solid #c7d2fe; border-radius: 8px;
    padding: 8px 14px; margin: 4px 0; color: #3730a3 !important;
    font-family: 'Courier New', monospace !important; font-size: 0.9rem;
    display: block;
}

/* Stat card */
.stat-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 1.25rem; text-align: center;
}
.stat-value {
    font-size: 2.2rem; font-weight: 800;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

/* Header gradient text */
.grad { background: linear-gradient(135deg,#6366f1,#a855f7);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    font-weight: 900; }

/* Alert boxes */
.alert-success {
    background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3);
    border-radius: 10px; padding: 0.7rem 1rem; color: #10b981 !important;
    font-weight: 600; margin-bottom: 1rem;
}
.alert-error {
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
    border-radius: 10px; padding: 0.7rem 1rem; color: #ef4444 !important;
    font-weight: 600; margin-bottom: 1rem;
}
</style>
""", unsafe_allow_html=True)

# ─── Helpers ──────────────────────────────────────────────────────────────────
def api(endpoint, timeout=6):
    try:
        r = requests.get(f"{BACKEND}{endpoint}", timeout=timeout)
        if r.status_code == 200:
            return r.json(), None
        return None, f"HTTP {r.status_code}"
    except requests.exceptions.ConnectionError:
        return None, "Backend Not Running"
    except requests.exceptions.Timeout:
        return None, "Request Timed Out"
    except Exception as e:
        return None, str(e)

def post_api(endpoint, payload, timeout=6):
    try:
        r = requests.post(f"{BACKEND}{endpoint}", json=payload, timeout=timeout)
        return r.json(), None
    except Exception as e:
        return None, str(e)

def backend_status():
    _, err = api("/books")
    return err is None

def render_page_content(text: str) -> str:
    """Convert plaintext book page to styled HTML for the reader."""
    if not text:
        return "<p><em>Empty page</em></p>"

    lines = text.split('\n')
    html_parts = []
    math_chars = set('=∝≈→←∞∑∫∂√αβγδωφθΦηΩ×÷±')

    for line in lines:
        stripped = line.strip()
        if not stripped:
            html_parts.append('<div style="height:0.5rem"></div>')
            continue

        # Skip dividers
        if set(stripped).issubset({'═', '─', '=', '-', ' '}):
            html_parts.append('<hr style="border-top:1px solid #e2e8f0; margin:0.6rem 0"/>')
            continue

        # ALL CAPS headings (chapter title)
        if stripped.isupper() and len(stripped) > 4 and len(stripped) < 120:
            html_parts.append(f'<h1>{stripped}</h1>')
            continue

        # Numbered subsection headings like "1.1 SOMETHING"
        import re
        if re.match(r'^\d+\.\d+\s+[A-Z]', stripped):
            html_parts.append(f'<h2>{stripped}</h2>')
            continue

        # Bullet points
        if stripped.startswith(('• ', '- ', '* ', '→ ')):
            content = stripped[2:] if stripped[1] == ' ' else stripped[1:]
            html_parts.append(f'<li style="margin-left:1.2rem;margin-bottom:0.2rem;color:#374151;font-size:0.94rem">{content}</li>')
            continue

        # Formulas / equation lines (short, contains math chars)
        has_math = any(c in math_chars for c in stripped)
        if has_math and len(stripped) < 100 and not re.search(r'[a-z]{5,}', stripped):
            html_parts.append(f'<code class="formula-box">{stripped}</code>')
            continue

        # Normal paragraph
        html_parts.append(f'<p style="margin:0 0 0.35rem;color:#374151;font-size:0.96rem;line-height:1.85">{stripped}</p>')

    return '\n'.join(html_parts)

# ─── Session State ────────────────────────────────────────────────────────────
if 'page' not in st.session_state: st.session_state.page = 'home'
if 'reading_book' not in st.session_state: st.session_state.reading_book = None
if 'book_page' not in st.session_state: st.session_state.book_page = 0
if 'user' not in st.session_state: st.session_state.user = None
if 'role' not in st.session_state: st.session_state.role = None
if 'search' not in st.session_state: st.session_state.search = ''

# ─── Sidebar ──────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("""
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:1.5rem">
        <div style="width:42px;height:42px;background:linear-gradient(135deg,#6366f1,#a855f7);
                    border-radius:12px;display:flex;align-items:center;justify-content:center;
                    font-size:22px;flex-shrink:0">📚</div>
        <div>
            <div style="font-size:1.05rem;font-weight:800;color:#f1f5f9">Smart Library</div>
            <div style="font-size:0.72rem;color:#64748b">Digital Portal · Streamlit</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    connected = backend_status()
    if connected:
        st.markdown('<div class="alert-success">✅ Backend Connected · Port 5000</div>', unsafe_allow_html=True)
    else:
        st.markdown('<div class="alert-error">❌ Backend Offline!</div>', unsafe_allow_html=True)
        st.info("Start backend:\n```\ncd backend\nnode index.js\n```")

    st.markdown("---")

    if st.session_state.user:
        st.markdown(f"""
        <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);
                    border-radius:12px;padding:10px 14px;margin-bottom:1rem">
            <div style="font-weight:700;color:#fff;font-size:0.88rem">
                {st.session_state.user.get('name','Admin')}
            </div>
            <div style="font-size:0.72rem;color:#64748b">
                {st.session_state.role.upper()} · {st.session_state.user.get('rollNo','')}
            </div>
        </div>
        """, unsafe_allow_html=True)

    nav_items = [("🏠", "Home", "home"), ("📖", "Browse & Read", "browse"),
                 ("🌟", "E-Books", "ebooks"), ("📊", "Admin Panel", "admin")]

    for icon, label, key in nav_items:
        selected = "color:#a855f7;font-weight:700" if st.session_state.page == key else "color:#94a3b8"
        if st.button(f"{icon} {label}", key=f"nav_{key}", use_container_width=True):
            st.session_state.page = key
            st.session_state.reading_book = None
            st.rerun()

    st.markdown("---")

    # Login panel
    if not st.session_state.user:
        with st.expander("🔐 Quick Login"):
            login_type = st.selectbox("Login as", ["Student", "Admin"], key="login_type_select")
            if login_type == "Student":
                name = st.text_input("Name", key="s_name")
                roll = st.text_input("Roll No", key="s_roll")
                dept = st.selectbox("Department", [
                    "Computer Science", "Information Technology",
                    "Electronics & Communication", "Electrical & Electronics",
                    "Mechanical Engineering"], key="s_dept")
                year = st.selectbox("Year", ["1st Year","2nd Year","3rd Year","4th Year"], key="s_year")
                if st.button("Login as Student", use_container_width=True):
                    data, err = post_api("/login/student", {"name":name,"rollNo":roll,"department":dept,"year":year})
                    if data and data.get("success"):
                        st.session_state.user = data.get("user", {"name": name})
                        st.session_state.role = "student"
                        st.success("Logged in!")
                        time.sleep(0.5)
                        st.rerun()
                    else:
                        st.error(err or "Login failed")
            else:
                uid = st.text_input("Admin ID", value="12345678", key="a_id")
                pwd = st.text_input("Password", type="password", value="sandhya", key="a_pwd")
                if st.button("Login as Admin", use_container_width=True):
                    data, err = post_api("/login/admin", {"username":uid,"password":pwd})
                    if data and data.get("success"):
                        st.session_state.user = {"name": "Administrator"}
                        st.session_state.role = "admin"
                        st.success("Admin logged in!")
                        time.sleep(0.5)
                        st.rerun()
                    else:
                        st.error("Invalid credentials")
    else:
        if st.button("🚪 Logout", use_container_width=True):
            st.session_state.user = None
            st.session_state.role = None
            st.session_state.reading_book = None
            st.rerun()

# ═══════════════════════════════════════════════════════════════════════════════
# BOOK READER (full-screen overlay logic via session state)
# ═══════════════════════════════════════════════════════════════════════════════
if st.session_state.reading_book:
    book = st.session_state.reading_book
    pages = book.get("pages", [])
    total = len(pages)
    pg = st.session_state.book_page

    st.markdown(f"""
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:1rem;
                padding:1rem 1.4rem;background:rgba(4,5,26,0.8);border-radius:14px;
                border:1px solid rgba(99,102,241,0.25)">
        <span style="font-size:2.2rem">{book.get('cover','📖')}</span>
        <div style="flex:1;min-width:0">
            <div style="font-size:1.1rem;font-weight:800;color:#fff;
                        overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                {book['title']}
            </div>
            <div style="font-size:0.78rem;color:#64748b">
                {'Cover' if pg==0 else f'Page {pg} of {total}'} · {book.get('category','')}
                {'· ' + book.get('author','') if book.get('author') else ''}
            </div>
        </div>
        <div style="background:rgba(99,102,241,0.2);border-radius:8px;padding:4px 10px;
                    color:#818cf8;font-size:0.75rem;font-weight:600;flex-shrink:0">
            {round((pg / max(total,1)) * 100)}% read
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Progress bar
    if total > 0:
        st.progress(pg / total)

    # Navigation
    col_prev, col_info, col_next = st.columns([1, 3, 1])
    with col_prev:
        if st.button("◀ Prev", disabled=(pg <= 0), use_container_width=True):
            st.session_state.book_page = max(0, pg - 1)
            st.rerun()
    with col_info:
        page_jump = st.slider("Jump to page", 0, total, pg, key="page_slider",
                               label_visibility="collapsed")
        if page_jump != pg:
            st.session_state.book_page = page_jump
            st.rerun()
    with col_next:
        if st.button("Next ▶", disabled=(pg >= total), use_container_width=True):
            st.session_state.book_page = min(total, pg + 1)
            st.rerun()

    st.markdown("<div style='height:0.5rem'></div>", unsafe_allow_html=True)

    # Page content
    if pg == 0:
        # Cover page
        st.markdown(f"""
        <div style="background:linear-gradient(135deg,#6366f1,#a855f7);
                    border-radius:20px;padding:4rem 2rem;text-align:center;
                    min-height:380px;display:flex;flex-direction:column;
                    align-items:center;justify-content:center;gap:1rem">
            <div style="font-size:6rem">{book.get('cover','📖')}</div>
            <h1 style="font-size:2rem !important;color:#fff !important;
                       font-family:Inter,sans-serif !important;margin:0 !important">
                {book['title']}
            </h1>
            <p style="color:rgba(255,255,255,0.7);font-size:1.1rem;margin:0">
                by {book.get('author','Unknown')}
            </p>
            <p style="color:rgba(255,255,255,0.45);font-size:0.85rem;margin:0">
                {book.get('category','')} · {total} pages available
            </p>
            <div style="background:rgba(255,255,255,0.15);border-radius:999px;
                        padding:6px 20px;color:#fff;font-size:0.8rem;font-weight:600">
                ✅ Full content available — click Next ▶ to begin reading
            </div>
        </div>
        """, unsafe_allow_html=True)
    elif pg > total:
        st.markdown("""
        <div style="text-align:center;padding:4rem 0">
            <div style="font-size:4rem">🎉</div>
            <h2 style="color:#10b981 !important">You finished the book!</h2>
            <p style="color:#64748b">Rate &amp; review it below.</p>
        </div>
        """, unsafe_allow_html=True)
    else:
        page_text = pages[pg - 1]
        rendered = render_page_content(page_text)
        st.markdown(f'<div class="reader-page">{rendered}</div>', unsafe_allow_html=True)

    st.markdown("---")
    col_close, col_dl = st.columns([1, 1])
    with col_close:
        if st.button("✖ Close Reader", use_container_width=True):
            st.session_state.reading_book = None
            st.session_state.book_page = 0
            st.rerun()
    with col_dl:
        if book.get("isEbook") and total > 0:
            full_text = f"{book['title']}\nby {book.get('author','Unknown')}\n\n" + "\n\n" + "—"*60 + "\n\n"
            full_text += "\n\n".join(pages)
            st.download_button("⬇ Download as .txt", data=full_text,
                               file_name=f"{book['title'][:40].replace(' ','_')}.txt",
                               mime="text/plain", use_container_width=True)
    st.stop()

# ═══════════════════════════════════════════════════════════════════════════════
# PAGE: HOME
# ═══════════════════════════════════════════════════════════════════════════════
if st.session_state.page == "home":
    st.markdown("""
    <h1 style="font-size:3rem;margin-bottom:0.2rem">
        Welcome to the <span class="grad">Smart Digital Library</span>
    </h1>
    <p style="font-size:1.1rem;color:#64748b;margin-bottom:2rem">
        Explore hundreds of engineering books, read full e-books online, and pre-book physical copies.
    </p>
    """, unsafe_allow_html=True)

    books, err = api("/books")

    if err:
        st.markdown(f"""
        <div class="alert-error">
            ⚠️ {err} — The backend is not reachable.<br>
            <strong>Fix:</strong> Open a terminal, <code>cd backend</code>, then run <code>node index.js</code>
        </div>
        """, unsafe_allow_html=True)
        books = []
    else:
        ebooks = [b for b in books if b.get("isEbook")]

        # Stat cards
        c1, c2, c3, c4 = st.columns(4)
        for col, icon, label, val, clr in [
            (c1, "📚", "Total Books", len(books), "#6366f1"),
            (c2, "⚡", "E-Books", len(ebooks), "#a855f7"),
            (c3, "🔖", "Categories", len(set(b.get('category','') for b in books)), "#06b6d4"),
            (c4, "✅", "Backend", "Online", "#10b981"),
        ]:
            with col:
                st.markdown(f"""
                <div class="stat-card">
                    <div style="font-size:1.8rem;margin-bottom:4px">{icon}</div>
                    <div class="stat-value" style="background:linear-gradient(135deg,{clr},{clr}aa);
                         -webkit-background-clip:text;-webkit-text-fill-color:transparent">
                         {val}
                    </div>
                    <div style="font-size:0.78rem;color:#64748b;margin-top:2px">{label}</div>
                </div>
                """, unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)

        # Featured E-Books row
        if ebooks:
            st.markdown('<h2>🌟 Featured <span class="grad">E-Books</span></h2>', unsafe_allow_html=True)
            cols = st.columns(min(len(ebooks), 5))
            for idx, book in enumerate(ebooks[:5]):
                with cols[idx]:
                    st.markdown(f"""
                    <div class="book-card">
                        <div class="book-cover">{book.get('cover','📖')}</div>
                        <div style="font-weight:700;font-size:0.88rem;color:#fff;
                                    min-height:2.4rem;overflow:hidden">{book['title']}</div>
                        <div style="font-size:0.72rem;color:#64748b;margin:4px 0">
                            {book.get('category','')}
                        </div>
                        <span class="ebook-badge">FULL E-BOOK</span>
                    </div>
                    """, unsafe_allow_html=True)
                    if st.button("📖 Read Now", key=f"home_read_{book['id']}", use_container_width=True):
                        # Fetch full book
                        full, ferr = api(f"/books/{book['id']}")
                        if full:
                            st.session_state.reading_book = full
                            st.session_state.book_page = 0
                            st.rerun()
                        else:
                            st.error(f"Cannot load: {ferr}")

# ═══════════════════════════════════════════════════════════════════════════════
# PAGE: E-BOOKS
# ═══════════════════════════════════════════════════════════════════════════════
elif st.session_state.page == "ebooks":
    st.markdown('<h1>⚡ Engineering <span class="grad">E-Books</span></h1>', unsafe_allow_html=True)
    st.markdown('<p style="color:#64748b">Full chapter-by-chapter content available online. No download required.</p>', unsafe_allow_html=True)

    books, err = api("/books")
    if err:
        st.error(f"Cannot reach backend: {err}")
    else:
        ebooks = [b for b in books if b.get("isEbook")]
        if not ebooks:
            st.info("No e-books found. Make sure the backend has ebooks.json loaded.")
        else:
            for book in ebooks:
                with st.container():
                    col_cover, col_info, col_btn = st.columns([1, 5, 2])
                    with col_cover:
                        st.markdown(f"""
                        <div style="background:linear-gradient(135deg,#6366f1,#a855f7);
                                    border-radius:14px;height:110px;display:flex;
                                    align-items:center;justify-content:center;font-size:3rem">
                            {book.get('cover','📖')}
                        </div>
                        """, unsafe_allow_html=True)
                    with col_info:
                        st.markdown(f"""
                        <div style="padding-left:0.5rem">
                            <div style="font-size:1.15rem;font-weight:800;color:#fff">
                                {book['title']}
                            </div>
                            <div style="color:#818cf8;font-size:0.85rem;margin:2px 0">
                                by {book.get('author','Unknown')}
                            </div>
                            <div style="color:#64748b;font-size:0.78rem">
                                {book.get('category','')} · {book.get('pageCount',0)} chapters
                            </div>
                            <span class="ebook-badge">FULL E-BOOK AVAILABLE</span>
                        </div>
                        """, unsafe_allow_html=True)
                    with col_btn:
                        if st.button("📖 Read Full Book", key=f"ebook_read_{book['id']}", use_container_width=True):
                            full, ferr = api(f"/books/{book['id']}")
                            if full:
                                st.session_state.reading_book = full
                                st.session_state.book_page = 0
                                st.rerun()
                            else:
                                st.error(f"Load error: {ferr}")
                    st.markdown("---")

# ═══════════════════════════════════════════════════════════════════════════════
# PAGE: BROWSE & READ
# ═══════════════════════════════════════════════════════════════════════════════
elif st.session_state.page == "browse":
    st.markdown('<h1>📖 Browse <span class="grad">All Books</span></h1>', unsafe_allow_html=True)

    books, err = api("/books")
    if err:
        st.error(f"Cannot reach backend: {err}")
    else:
        # Search and filter
        col_s, col_f = st.columns([3, 1])
        with col_s:
            search = st.text_input("🔍 Search by title...", value=st.session_state.search)
            st.session_state.search = search
        with col_f:
            cats = ["All"] + sorted(set(b.get("category","") for b in books if b.get("category")))
            cat = st.selectbox("Category", cats)

        filtered = [b for b in books
                    if search.lower() in b.get("title","").lower()
                    and (cat == "All" or b.get("category") == cat)]

        st.markdown(f'<p style="color:#64748b;margin-bottom:1rem">Showing {len(filtered)} books</p>', unsafe_allow_html=True)

        if not filtered:
            st.warning("No books match your search.")
        else:
            for book in filtered[:50]:
                col1, col2, col3 = st.columns([1, 5, 2])
                with col1:
                    st.markdown(f"""<div style="background:linear-gradient(135deg,#6366f1,#a855f7);
                        border-radius:12px;height:90px;display:flex;align-items:center;
                        justify-content:center;font-size:2.4rem">{book.get('cover','📖')}</div>""",
                        unsafe_allow_html=True)
                with col2:
                    avg = ""
                    if book.get("ratings"):
                        a = round(sum(book["ratings"]) / len(book["ratings"]), 1)
                        avg = f" · ⭐ {a}"
                    ebook_tag = ' · <span class="ebook-badge">E-BOOK</span>' if book.get("isEbook") else ""
                    st.markdown(f"""
                    <div style="padding-left:0.5rem">
                        <div style="font-weight:700;color:#fff;font-size:1rem">{book['title']}</div>
                        <div style="color:#64748b;font-size:0.78rem;margin-top:3px">
                            {book.get('category','')} · {book.get('author','Unknown')}{avg}
                        </div>
                        {ebook_tag}
                    </div>
                    """, unsafe_allow_html=True)
                with col3:
                    if st.button("📖 Read", key=f"browse_read_{book['id']}", use_container_width=True):
                        full, ferr = api(f"/books/{book['id']}")
                        if full:
                            st.session_state.reading_book = full
                            st.session_state.book_page = 0
                            st.rerun()
                        else:
                            st.error(ferr)
                st.markdown("---")

# ═══════════════════════════════════════════════════════════════════════════════
# PAGE: ADMIN
# ═══════════════════════════════════════════════════════════════════════════════
elif st.session_state.page == "admin":
    if st.session_state.role != "admin":
        st.warning("⚠️ Please log in as Admin to access this panel. Use sidebar → Admin login (ID: 12345678 / Password: sandhya)")
        st.stop()

    st.markdown('<h1>📊 Admin <span class="grad">Dashboard</span></h1>', unsafe_allow_html=True)

    stats, serr = api("/admin/stats")
    books, berr = api("/books")
    notifs, nerr = api("/admin/notifications")
    feedbacks, ferr = api("/admin/feedbacks")

    if serr:
        st.error(f"Cannot load stats: {serr}")
    else:
        # Stats row
        dept_logins = stats.get("deptWiseLogins", {})
        c1, c2, c3, c4 = st.columns(4)
        for col, icon, label, val in [
            (c1, "👥", "Total Logins", stats.get("totalLogins", 0)),
            (c2, "📚", "Total Books", len(books) if books else 0),
            (c3, "🔖", "Pre-Bookings", len(notifs) if notifs else 0),
            (c4, "⭐", "Feedbacks", len(feedbacks) if feedbacks else 0),
        ]:
            with col:
                st.markdown(f"""
                <div class="stat-card">
                    <div style="font-size:1.8rem">{icon}</div>
                    <div class="stat-value">{val}</div>
                    <div style="font-size:0.78rem;color:#64748b">{label}</div>
                </div>
                """, unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)

        # Department logins chart
        if dept_logins and any(v > 0 for v in dept_logins.values()):
            st.markdown("### 📊 Logins by Department")
            df = pd.DataFrame({"Department": list(dept_logins.keys()),
                               "Logins": list(dept_logins.values())})
            st.bar_chart(df.set_index("Department"), color="#6366f1")
        else:
            st.info("No login data yet — students need to log in through the React frontend.")

        # Pre-bookings table
        if notifs:
            st.markdown("### 🔖 Pre-Booking Requests")
            rows = [{"Student": n.get("studentName"), "Book": n.get("bookTitle"),
                     "Time": n.get("time",""), "Status": "Pending"} for n in notifs]
            st.dataframe(pd.DataFrame(rows), use_container_width=True)

        # Feedback
        if feedbacks:
            st.markdown("### 💬 Student Feedback")
            rows = [{"Student": f.get("studentName"), "Book": f.get("bookTitle"),
                     "Rating": "⭐"*int(f.get("rating",0)), "Message": f.get("message","")}
                    for f in feedbacks]
            st.dataframe(pd.DataFrame(rows), use_container_width=True)

        # Books table
        if books:
            st.markdown("### 📚 All Books in Collection")
            rows = [{"Title": b["title"], "Category": b.get("category",""),
                     "Author": b.get("author",""), "E-Book": "✅" if b.get("isEbook") else "❌",
                     "Pages": b.get("pageCount",0)} for b in books]
            st.dataframe(pd.DataFrame(rows), use_container_width=True)

# ─── Footer ───────────────────────────────────────────────────────────────────
st.markdown("""
<div style="text-align:center;padding:2rem 0 0.5rem;
            color:rgba(255,255,255,0.15);font-size:0.72rem">
    Smart Digital Library · Built with Streamlit + Node.js Express · 2026
</div>
""", unsafe_allow_html=True)
