/**
 *  fetch-books.js
 *  Downloads 5 full public-domain books from Project Gutenberg,
 *  cleans them up, splits into pages, and saves ebooks.json
 *
 *  Run once:  node scripts/fetch-books.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

/* ── Books to download ───────────────────────────────────────────────────── */
const BOOKS = [
    {
        id: 'ebook-artofwar',
        title: 'The Art of War',
        author: 'Sun Tzu',
        category: 'Philosophy & Strategy',
        cover: '⚔️',
        url: 'https://www.gutenberg.org/cache/epub/132/pg132.txt',
    },
    {
        id: 'ebook-alice',
        title: "Alice's Adventures in Wonderland",
        author: 'Lewis Carroll',
        category: 'Classic Literature',
        cover: '🐇',
        url: 'https://www.gutenberg.org/cache/epub/11/pg11.txt',
    },
    {
        id: 'ebook-pride',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        category: 'Classic Literature',
        cover: '🌹',
        url: 'https://www.gutenberg.org/cache/epub/1342/pg1342.txt',
    },
    {
        id: 'ebook-sherlock',
        title: 'A Study in Scarlet',
        author: 'Arthur Conan Doyle',
        category: 'Mystery & Detective Fiction',
        cover: '🔍',
        url: 'https://www.gutenberg.org/cache/epub/244/pg244.txt',
    },
    {
        id: 'ebook-frankenstein',
        title: 'Frankenstein',
        author: 'Mary Shelley',
        category: 'Gothic Fiction',
        cover: '⚡',
        url: 'https://www.gutenberg.org/cache/epub/84/pg84.txt',
    },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** Download a URL and return a string */
function fetchText(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // Follow one redirect
                return fetchText(res.headers.location).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
            }
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
            res.on('error', reject);
        }).on('error', reject);
    });
}

/** Strip Gutenberg boilerplate from start and end */
function stripGutenberg(text) {
    // Remove everything before "*** START OF …"
    const startMarkers = [
        /\*{3}\s*START OF (?:THIS |THE )?PROJECT GUTENBERG.+\*{3}/i,
        /\*{3}\s*START OF (?:THIS |THE )?GUTENBERG.+\*{3}/i,
    ];
    for (const re of startMarkers) {
        const m = text.search(re);
        if (m !== -1) {
            const endOfLine = text.indexOf('\n', m);
            text = text.slice(endOfLine + 1);
            break;
        }
    }
    // Remove everything after "*** END OF …"
    const endMarkers = [
        /\*{3}\s*END OF (?:THIS |THE )?PROJECT GUTENBERG.+\*{3}/i,
        /\*{3}\s*END OF (?:THIS |THE )?GUTENBERG.+\*{3}/i,
    ];
    for (const re of endMarkers) {
        const m = text.search(re);
        if (m !== -1) { text = text.slice(0, m); break; }
    }
    return text.trim();
}

/**
 * Split cleaned text into pages.
 * Target ~1 400 chars per page, always breaking at a blank line
 * so paragraphs are never split mid-sentence.
 */
function splitPages(text, targetLen = 1400) {
    // Normalise line endings
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // Split on blank lines (paragraph boundaries)
    const paragraphs = text.split(/\n{2,}/);
    const pages = [];
    let current = '';

    for (const para of paragraphs) {
        const block = para.trim();
        if (!block) continue;
        if (current.length + block.length + 2 > targetLen && current.length > 0) {
            pages.push(current.trim());
            current = block;
        } else {
            current = current ? current + '\n\n' + block : block;
        }
    }
    if (current.trim()) pages.push(current.trim());
    return pages;
}

/* ── Main ────────────────────────────────────────────────────────────────── */
async function main() {
    const outDir = path.join(__dirname, '..');           // backend/
    const outFile = path.join(outDir, 'ebooks.json');

    const results = [];

    for (const book of BOOKS) {
        process.stdout.write(`⏳  Fetching "${book.title}" … `);
        try {
            const raw = await fetchText(book.url);
            const cleaned = stripGutenberg(raw);
            const pages = splitPages(cleaned, 1400);

            console.log(`✅  ${pages.length} pages`);
            results.push({
                id: book.id,
                title: book.title,
                author: book.author,
                category: book.category,
                cover: book.cover,
                isEbook: true,
                ratings: [],
                pages,
            });
        } catch (err) {
            console.error(`❌  Failed: ${err.message}`);
            // Add a placeholder so the book still appears
            results.push({
                id: book.id,
                title: book.title,
                author: book.author,
                category: book.category,
                cover: book.cover,
                isEbook: true,
                ratings: [],
                pages: [`Could not download "${book.title}".\nError: ${err.message}\n\nPlease run the fetch script again:\n  node scripts/fetch-books.js`],
            });
        }
    }

    fs.writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\n📚  Saved ${results.length} books → ${outFile}`);
    console.log('🚀  Restart the backend to serve the new content.\n');
}

main().catch(err => { console.error(err); process.exit(1); });
