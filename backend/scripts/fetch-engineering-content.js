/**
 * fetch-engineering-content.js
 * Fetches real Wikipedia content for 5 engineering textbooks
 * and writes to ebooks.json
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchWiki(title) {
    return new Promise((resolve, reject) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=false&explaintext=true&titles=${encodeURIComponent(title)}&format=json&redirects=1`;
        https.get(url, { headers: { 'User-Agent': 'LibraryBot/1.0' } }, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const pages = json.query.pages;
                    const page = pages[Object.keys(pages)[0]];
                    resolve(page.extract || '');
                } catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

function chunkText(text, maxLen = 3000) {
    // Split by section headings (== Section ==)
    const sections = text.split(/\n(?===[^=])/);
    const chunks = [];
    let current = '';
    for (const sec of sections) {
        if ((current + sec).length > maxLen && current.length > 0) {
            chunks.push(current.trim());
            current = sec;
        } else {
            current += '\n' + sec;
        }
    }
    if (current.trim()) chunks.push(current.trim());
    // If a chunk is still too large, hard-split
    const result = [];
    for (const c of chunks) {
        if (c.length > maxLen * 1.5) {
            for (let i = 0; i < c.length; i += maxLen) {
                result.push(c.slice(i, i + maxLen).trim());
            }
        } else {
            result.push(c);
        }
    }
    return result.filter(c => c.length > 100);
}

async function fetchMultiple(titles) {
    const texts = [];
    for (const t of titles) {
        try {
            console.log(`  Fetching: ${t}`);
            const txt = await fetchWiki(t);
            if (txt) texts.push(`${'='.repeat(60)}\n${t}\n${'='.repeat(60)}\n\n${txt}`);
            // Be polite to Wikipedia API
            await new Promise(r => setTimeout(r, 800));
        } catch (e) {
            console.warn(`  ⚠ Could not fetch "${t}": ${e.message}`);
        }
    }
    return texts.join('\n\n');
}

async function main() {
    const BOOK_TOPICS = [
        {
            id: 'ebook-edct',
            title: 'Electronic Devices and Circuit Theory',
            author: 'Boylestad & Nashelsky',
            category: 'Electronics & Communication',
            cover: '⚡',
            topics: [
                'Semiconductor device',
                'P–n junction',
                'Diode',
                'Bipolar junction transistor',
                'MOSFET',
                'Field-effect transistor',
                'Operational amplifier',
                'Electronic amplifier',
                'Electronic oscillator',
                'Voltage regulator',
                'Rectifier',
            ],
        },
        {
            id: 'ebook-bee',
            title: 'Basics of Electrical Engineering',
            author: 'V.K. Mehta & Rohit Mehta',
            category: 'Electrical Engineering',
            cover: '🔌',
            topics: [
                "Ohm's law",
                'Electric current',
                'Electric potential',
                'Electrical resistance and conductance',
                "Kirchhoff's circuit laws",
                'Electrical network',
                'Alternating current',
                'Electric power',
                'Transformer',
                'Electric motor',
                'Electrical measuring instrument',
            ],
        },
        {
            id: 'ebook-bee10c',
            title: 'Basic of Electric Engineering (10 C)',
            author: 'Educational Board Press',
            category: 'Electrical Engineering',
            cover: '🔋',
            topics: [
                'Electricity',
                'Electric charge',
                'Electric current',
                'Voltage',
                'Electrical resistance and conductance',
                'Series and parallel circuits',
                'Electromagnetism',
                'Electromagnetic induction',
                'Electric battery',
                'Electrical safety',
                'Electric power',
            ],
        },
        {
            id: 'ebook-beece',
            title: 'Basic Electrical Electronics and Computer Engineering',
            author: 'R.K. Rajput',
            category: 'Electrical Engineering',
            cover: '💻',
            topics: [
                'Digital electronics',
                'Logic gate',
                'Boolean algebra',
                'Number system',
                'Computer architecture',
                'Flip-flop (electronics)',
                'Multiplexer',
                'Analog-to-digital converter',
                'Modulation',
                'Integrated circuit',
                'Computer programming',
            ],
        },
        {
            id: 'ebook-circuit-theory',
            title: 'Circuit Theory',
            author: 'A. Chakrabarti',
            category: 'Electrical Engineering',
            cover: '🔁',
            topics: [
                'Network analysis (electrical circuits)',
                "Thévenin's theorem",
                "Norton's theorem",
                'Superposition theorem',
                'RLC circuit',
                'Resonance',
                'Electrical impedance',
                'Laplace transform',
                'Two-port network',
                'Mesh analysis',
                'Nodal analysis',
            ],
        },
    ];

    const results = [];

    for (const book of BOOK_TOPICS) {
        console.log(`\n📖 Fetching content for: ${book.title}`);
        const combined = await fetchMultiple(book.topics);
        const pages = chunkText(combined, 3000);
        console.log(`   ✅ ${pages.length} pages built`);

        // Prepend a title/cover page
        const coverPage = `${book.cover}  ${book.title.toUpperCase()}
${'═'.repeat(60)}
Author   : ${book.author}
Category : ${book.category}
Source   : Wikipedia (CC BY-SA 4.0)
Topics   : ${book.topics.join(', ')}

This e-book contains real encyclopedic content on the core
topics of "${book.title}", compiled from Wikipedia.
Navigate using the arrows below to read each chapter.`;

        results.push({
            id: book.id,
            title: book.title,
            author: book.author,
            category: book.category,
            cover: book.cover,
            isEbook: true,
            ratings: [],
            pages: [coverPage, ...pages],
        });
    }

    const outFile = path.join(__dirname, '..', 'ebooks.json');
    fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
    console.log(`\n✅ ebooks.json updated with ${results.length} books.`);
    console.log('   Total pages:', results.reduce((s, b) => s + b.pages.length, 0));
    console.log('\n🚀 Restart the backend to serve the new content.\n');
}

main().catch(console.error);
