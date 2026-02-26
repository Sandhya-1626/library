import React, { useState, useEffect, useCallback } from 'react';
import {
    X, ChevronLeft, ChevronRight, BookOpen, Star, Download,
    List, Info, FileText, Tag, User, Hash, AlignLeft,
} from 'lucide-react';

/* ─── Metadata map for the 4 engineering books ─────────────────────── */
const BOOK_META = {
    'ebook-edct': {
        subject: 'Electronics Engineering',
        keywords: ['semiconductor', 'diode', 'BJT', 'FET', 'MOSFET', 'op-amp', 'oscillator', 'rectifier', 'amplifier'],
        edition: '11th Edition',
        publisher: 'Pearson Education',
        year: '2015',
        level: 'Undergraduate Engineering (3rd–4th Year)',
        language: 'English',
        summary: 'A comprehensive study of electronic devices starting from semiconductor physics to advanced op-amp circuits. Covers rectifiers, BJT, FET, MOSFET, operational amplifiers, feedback systems, oscillators, and voltage regulators with practical circuit analysis.',
        toc: [
            { ch: 'Cover & Preface', pg: 1 },
            { ch: 'Chapter 1 — Semiconductor Diodes', pg: 2 },
            { ch: 'Chapter 2 — Diode Applications', pg: 3 },
            { ch: 'Chapter 3 — BJT (Bipolar Junction Transistor)', pg: 4 },
            { ch: 'Chapter 4 — Field Effect Transistors (FET/MOSFET)', pg: 5 },
            { ch: 'Chapter 5 — Operational Amplifiers', pg: 6 },
            { ch: 'Chapter 6 — Power Amplifiers & Oscillators', pg: 7 },
        ],
        chapterSummaries: [
            'Introduction to the book — topics covered: semiconductor devices, BJT, FET, op-amps, oscillators, power amplifiers, and voltage regulators.',
            'Covers semiconductor basics (N-type, P-type doping), PN junction formation, diode equation I=Is(e^VD/nVT−1), and types of diodes including Zener, LED, Photodiode, Schottky, and Varactor.',
            'Half-wave, full-wave, and bridge rectifiers with efficiency and ripple factor. Capacitor, inductor, LC filters. Clippers and clampers circuits.',
            'NPN/PNP BJT construction, α and β parameters, CB/CE/CC configurations, and four biasing techniques (Fixed, Collector-to-Base, Voltage Divider, Emitter Bias) with stability analysis.',
            'JFET and MOSFET (Depletion/Enhancement) operation, pinch-off, transconductance (gm), CMOS. FET amplifier configurations (CS, CD, CG). Comparison with BJT.',
            'Ideal vs. practical op-amp (IC741), inverting/non-inverting/summing/difference amplifiers, voltage follower, integrator, differentiator, and comparator circuits.',
            'Amplifier classes (A, B, AB, C, D), Barkhausen criteria for oscillators, RC and LC oscillators (Phase Shift, Wien Bridge, Colpitts, Hartley, Crystal), and voltage regulators (78XX, 79XX, LM317, SMPS).',
        ],
    },
    'ebook-bee': {
        subject: 'Electrical Engineering Fundamentals',
        keywords: ['Ohm\'s law', 'KCL', 'KVL', 'AC circuits', 'transformer', 'induction motor', 'DC machine', 'phasor', 'power factor'],
        edition: '7th Edition',
        publisher: 'S. Chand Publishing',
        year: '2018',
        level: 'First Year Engineering (All Branches)',
        language: 'English',
        summary: 'Comprehensive coverage of electrical engineering fundamentals from basic charge and Ohm\'s law through DC/AC circuit analysis, electromagnetic induction, transformers, electrical machines, and measuring instruments.',
        toc: [
            { ch: 'Cover & Preface', pg: 1 },
            { ch: 'Chapter 1 — Fundamentals of Electricity', pg: 2 },
            { ch: 'Chapter 2 — DC Circuit Analysis', pg: 3 },
            { ch: 'Chapter 3 — Electromagnetism', pg: 4 },
            { ch: 'Chapter 4 — AC Circuits', pg: 5 },
            { ch: 'Chapter 5 — Transformers', pg: 6 },
            { ch: 'Chapter 6 — Electrical Machines & Instruments', pg: 7 },
        ],
        chapterSummaries: [
            'Introduction: covers fundamentals of electricity, DC/AC circuits, electromagnetism, transformers, electrical machines and measuring instruments.',
            'Electric charge (Coulomb), current (I=Q/t), types of DC/AC current, Ohm\'s law (V=IR), resistance formula (R=ρL/A), electrical power (P=VI) and energy (kWh).',
            'Series/parallel circuits, voltage divider rule, Kirchhoff\'s KCL and KVL, mesh analysis, nodal analysis, Superposition, Thevenin\'s, Norton\'s theorems, and Wheatstone bridge.',
            'Magnetic flux (Φ=BA), Faraday\'s law of EMI (e=−NdΦ/dt), Lenz\'s law, self-inductance, mutual inductance, coupling coefficient.',
            'Sinusoidal AC (v=Vm sinωt), RMS value (Vrms=Vm/√2), phasors, impedance (Z=R+jX), series RLC resonance, power in AC (P=VIcosφ), power factor — active, reactive, apparent power.',
            'Transformer principle (turns ratio a=N1/N2=V1/V2), step-up/step-down types, iron losses (hysteresis, eddy current), copper losses, efficiency (η), voltage regulation, auto-transformer.',
            'DC generators/motors (EMF equation, back-EMF, types by field winding), 3-phase induction motor (slip, synchronous speed), synchronous motor, ammeter, voltmeter, wattmeter, oscilloscope.',
        ],
    },
    'ebook-bee10c': {
        subject: 'Basic Electrical Engineering (Diploma Level)',
        keywords: ['Ohm\'s law', 'resistivity', 'series circuit', 'parallel circuit', 'KCL', 'KVL', 'electromagnetism', 'battery', 'wiring safety'],
        edition: '1st Edition',
        publisher: 'Educational Board Press',
        year: '2020',
        level: '10th Grade / Diploma First Year',
        language: 'English',
        summary: 'Designed for diploma-level students, this book covers essential electrical theory: Ohm\'s law, series/parallel DC circuits, power and energy calculations, electromagnetism, primary/secondary cells, and electrical safety and wiring.',
        toc: [
            { ch: 'Cover & Introduction', pg: 1 },
            { ch: 'Unit 1 — Electrical Quantities & Ohm\'s Law', pg: 2 },
            { ch: 'Unit 2 — DC Circuits & Kirchhoff\'s Laws', pg: 3 },
            { ch: 'Unit 3 — Electrical Power & Energy', pg: 4 },
            { ch: 'Unit 4 — Electromagnetism', pg: 5 },
            { ch: 'Unit 5 — Cells & Batteries', pg: 6 },
            { ch: 'Unit 6 — Wiring & Safety (in Unit 5 page)', pg: 6 },
        ],
        chapterSummaries: [
            'A diploma-level textbook for 10C examinations covering 6 units: Electrical Quantities, DC Circuits, Power & Energy, Electromagnetism, Batteries, and Wiring Safety.',
            'Charge, current (I=Q/t), voltage (V=W/Q), resistance (R), Ohm\'s law (V=IR), resistivity formula (R=ρL/A) with examples. Factors affecting resistance.',
            'Series circuits (same I, RT=R1+R2+...), parallel circuits (same V, 1/RT=1/R1+...), KCL, KVL, internal resistance of batteries and terminal voltage.',
            'Power (P=VI=I²R=V²/R), energy in kWh (1 Unit), cost calculation, Joule\'s heating effect, efficiency, fuses, MCB, and ELCB/RCCB protection devices.',
            'Magnetic field lines, Oersted\'s experiment, right hand thumb rule, solenoid, Faraday\'s law, Lenz\'s law. Applications: generator, motor, transformer, induction cooktop.',
            'Primary cells (Dry Cell 1.5V, Mercury, Lithium), secondary cells (Lead-Acid 12V, NiCd, Li-Ion), battery connections (series/parallel), and wiring types and safety rules.',
        ],
    },
    'ebook-beece': {
        subject: 'Electrical Electronics & Computer Engineering',
        keywords: ['network theorems', 'op-amp', 'digital electronics', 'logic gates', 'Boolean algebra', 'flip-flop', 'counter', 'computer organisation', 'C programming'],
        edition: '2nd Edition',
        publisher: 'Laxmi Publications',
        year: '2019',
        level: 'First Year Engineering (Common to all branches)',
        language: 'English',
        summary: 'A unified textbook for first-year engineering across three domains: Electrical fundamentals (AC/DC circuits, transformers), Electronics (semiconductor devices, op-amps, digital circuits), and Computer Engineering (number systems, logic gates, Boolean algebra, computer organisation, C programming basics).',
        toc: [
            { ch: 'Cover & Overview', pg: 1 },
            { ch: 'Part A — Electrical Engineering Fundamentals', pg: 2 },
            { ch: 'Part B — Electronics (Devices & Digital)', pg: 3 },
            { ch: 'Part B — Digital Circuits & Communications', pg: 4 },
            { ch: 'Part C — Computer Engineering', pg: 5 },
        ],
        chapterSummaries: [
            'Overview of the three parts: Electrical, Electronics, and Computer Engineering fundamentals for first-year students.',
            'Ohm\'s law review, Superposition, Thevenin\'s and Norton\'s theorems, Maximum Power Transfer. AC impedance, power (P,Q,S,PF), transformer turns ratio and efficiency.',
            'PN junction diodes, BJT (IC=βIB, CB/CE/CC), FET (JFET, MOSFET), Op-Amp configurations (inverting, non-inverting). Number systems (Binary, Octal, Hex), Logic gates (AND, OR, NOT, NAND, NOR, XOR), Boolean laws, K-map.',
            'Combinational circuits: Half/Full Adder, MUX, DEMUX, Encoder, Decoder. Sequential circuits: SR, D, JK, T Flip-flops, registers, counters. Modulation: AM, FM, ASK, FSK, PSK, QAM.',
            'Computer 5-unit structure, memory hierarchy (Registers→Cache→RAM→HDD), RAM vs ROM, binary arithmetic, 2\'s complement subtraction, IEEE754 floating point, ASCII/Unicode, C programming basics.',
        ],
    },
    'ebook-circuit-theory': {
        subject: 'Network Analysis & Circuit Theory',
        keywords: ['KCL', 'KVL', 'mesh analysis', 'nodal analysis', 'Thevenin', 'Norton', 'resonance', 'two-port network', 'Laplace transform', 'three-phase'],
        edition: '3rd Edition',
        publisher: 'Dhanpat Rai Publications',
        year: '2016',
        level: '2nd/3rd Year Electrical & Electronics Engineering',
        language: 'English',
        summary: 'Advanced circuit theory covering network theorems (Superposition, Thevenin, Norton, Millman, Reciprocity), AC steady-state analysis with phasors, balanced three-phase circuits, series/parallel resonance, coupled circuits with mutual inductance, two-port network parameters (Z, Y, H, ABCD), network topology using graph theory, and Laplace transform circuit analysis.',
        toc: [
            { ch: 'Cover & Preface', pg: 1 },
            { ch: 'Chapter 1 — Basic Concepts & Circuit Elements', pg: 2 },
            { ch: 'Chapter 2 — Network Theorems', pg: 3 },
            { ch: 'Chapter 3 — AC Steady-State & Three-Phase', pg: 4 },
            { ch: 'Chapter 4 — Resonance & Coupled Circuits', pg: 5 },
            { ch: 'Chapter 5 — Network Topology & Laplace Transform', pg: 6 },
        ],
        chapterSummaries: [
            'Preface: DC/AC circuit analysis, network theorems, two-port networks, topology, and Laplace transform methods for 2nd/3rd year EE/ECE students.',
            'Active vs. passive elements, ideal/practical voltage/current sources, source transformation. Element v-i relations (R,L,C). KCL/KVL. Mesh analysis [Z][I]=[V] and Nodal analysis [Y][V]=[I] in matrix form.',
            'Superposition (step-by-step). Thevenin (Vth, Rth) and Norton (IN, RN) theorems. Maximum Power Transfer (DC: RL=Rth; AC: ZL=Zth*). Millman\'s, Substitution, Compensation, and Reciprocity theorems.',
            'Phasor representation, impedance Z=R+jX, admittance Y=G+jB. Series/Parallel RLC. Balanced 3-phase: Star (VL=√3VP) and Delta (IL=√3IP) connections, Y-Δ conversion, three-phase power (P=√3·VL·IL·cosφ).',
            'Series resonance (f₀=1/2π√LC, Q factor, bandwidth). Parallel resonance (Z=∞, dynamic resistance RD=L/CR). Coupled circuits (M=k√L1L2, reflected impedance Zin=Z1+(ωM)²/Z2). Two-port parameters: Z, Y, H, ABCD.',
            'Graph theory: tree, co-tree, links. Tie-set and cut-set matrices. Laplace transform table (step, ramp, impulse, e^-at, sinusoidal). Circuit elements in s-domain. Partial fractions. Transfer function H(s). Initial/Final value theorems.',
        ],
    },
};

/* ─── Format page content into styled HTML sections ─────────────────── */
function renderContent(text) {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Chapter / Part headings (ALL CAPS + ═══)
        if (/^═+$/.test(trimmed)) continue;
        if (/^[A-Z][A-Z\s\d&'()—–]+$/.test(trimmed) && trimmed.length > 4 && /[A-Z]{3}/.test(trimmed)) {
            const prev = elements[elements.length - 1];
            if (prev && prev.type === 'h1') continue;
            elements.push(<h1 key={key++} style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', letterSpacing: '0.04em', marginTop: '1.4rem', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '2px solid #6366f120' }}>{trimmed}</h1>);
            continue;
        }

        // Numbered section headings (1.1 HEADING)
        if (/^\d+\.\d+\s+[A-Z]/.test(trimmed)) {
            elements.push(<h2 key={key++} style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginTop: '1.1rem', marginBottom: '0.3rem' }}>{trimmed}</h2>);
            continue;
        }

        // Bullet points
        if (/^[•\-\*]\s/.test(trimmed)) {
            elements.push(<li key={key++} style={{ marginLeft: '1.2rem', marginBottom: '0.2rem', color: '#475569', fontSize: '0.91rem', lineHeight: 1.7 }}>{trimmed.slice(2)}</li>);
            continue;
        }

        // Formulas / equations (contains = or ∝ or ≈)
        if (/[=∝≈→←∞∑∫∂√α β γ δ ω φ θ Φ η Ω]/.test(trimmed) && trimmed.length < 120 && !/[a-z]{6,}/.test(trimmed)) {
            elements.push(
                <div key={key++} style={{ fontFamily: '"Courier New", monospace', fontSize: '0.88rem', background: '#f1f5ff', border: '1px solid #c7d2fe', borderRadius: 8, padding: '6px 14px', margin: '4px 0', color: '#3730a3', display: 'inline-block', maxWidth: '100%', overflowX: 'auto' }}>
                    {trimmed}
                </div>
            );
            continue;
        }

        // Empty line
        if (!trimmed) {
            elements.push(<div key={key++} style={{ height: '0.6rem' }} />);
            continue;
        }

        // Normal paragraph
        elements.push(<p key={key++} style={{ margin: '0 0 0.3rem 0', color: '#374151', fontSize: '0.92rem', lineHeight: 1.85 }}>{trimmed}</p>);
    }

    return <div>{elements}</div>;
}

/* ─── TOC Sidebar ────────────────────────────────────────────────────── */
function TocSidebar({ toc, currentPage, onGo, onClose }) {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, display: 'flex' }}>
            <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.6)' }} />
            <div style={{
                width: 340, background: '#0f1133', borderLeft: '1px solid rgba(99,102,241,0.25)',
                padding: '2rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <List size={16} color="#818cf8" /> Table of Contents
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}>
                        <X size={18} />
                    </button>
                </div>
                {toc.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => { onGo(item.pg); onClose(); }}
                        style={{
                            background: currentPage === item.pg ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${currentPage === item.pg ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: 10, padding: '0.7rem 1rem', textAlign: 'left', cursor: 'pointer',
                            color: currentPage === item.pg ? '#818cf8' : '#cbd5e1',
                            fontSize: '0.85rem', fontWeight: currentPage === item.pg ? 700 : 400,
                            transition: 'all 0.15s', width: '100%',
                        }}
                    >
                        <span style={{ marginRight: 8, color: '#475569', fontSize: '0.75rem' }}>Pg {item.pg}</span>
                        {item.ch}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ─── Metadata Panel ─────────────────────────────────────────────────── */
function MetaPanel({ book, meta, summary, onClose }) {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)' }}>
            <div style={{
                background: '#0d0f2b', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 24,
                padding: '2rem', maxWidth: 560, width: '92%', maxHeight: '85vh', overflowY: 'auto',
                boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.4rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Info size={18} color="#a855f7" /> Book Metadata
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Title + cover */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.2rem', padding: '1rem', background: 'rgba(99,102,241,0.1)', borderRadius: 14 }}>
                    <div style={{ fontSize: '2.8rem' }}>{book.cover || '📖'}</div>
                    <div>
                        <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem', lineHeight: 1.3 }}>{book.title}</div>
                        <div style={{ color: '#818cf8', fontSize: '0.82rem', marginTop: 4 }}>by {book.author}</div>
                    </div>
                </div>

                {/* Meta rows */}
                {[
                    { icon: <AlignLeft size={14} />, label: 'Subject', value: meta?.subject || book.category },
                    { icon: <User size={14} />, label: 'Author', value: book.author },
                    { icon: <Hash size={14} />, label: 'Edition', value: meta?.edition || 'N/A' },
                    { icon: <FileText size={14} />, label: 'Publisher', value: meta?.publisher || 'N/A' },
                    { icon: <BookOpen size={14} />, label: 'Year', value: meta?.year || 'N/A' },
                    { icon: <BookOpen size={14} />, label: 'Level', value: meta?.level || 'N/A' },
                    { icon: <FileText size={14} />, label: 'Language', value: meta?.language || 'English' },
                    { icon: <Hash size={14} />, label: 'Total Pages', value: `${book.pages?.length || 0} digital pages` },
                ].map(({ icon, label, value }) => (
                    <div key={label} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'flex-start' }}>
                        <span style={{ color: '#6366f1', marginTop: 2, flexShrink: 0 }}>{icon}</span>
                        <span style={{ color: '#64748b', width: 88, flexShrink: 0, fontSize: '0.82rem' }}>{label}</span>
                        <span style={{ color: '#e2e8f0', fontSize: '0.88rem', flex: 1 }}>{value}</span>
                    </div>
                ))}

                {/* Keywords */}
                {meta?.keywords?.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Tag size={12} /> Keywords
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {meta.keywords.map(kw => (
                                <span key={kw} style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 999, padding: '3px 10px', fontSize: '0.75rem', color: '#818cf8' }}>
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Summary */}
                {meta?.summary && (
                    <div style={{ marginTop: '1.2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ color: '#818cf8', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6 }}>📖 BOOK SUMMARY</div>
                        <p style={{ color: '#94a3b8', fontSize: '0.87rem', lineHeight: 1.7, margin: 0 }}>{meta.summary}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Chapter Summary Strip ──────────────────────────────────────────── */
function ChapterSummary({ text }) {
    if (!text) return null;
    return (
        <div style={{
            margin: '0.8rem 0', padding: '0.9rem 1.1rem',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.06))',
            border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12,
            display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>💡</span>
            <div>
                <div style={{ fontWeight: 700, color: '#818cf8', fontSize: '0.75rem', letterSpacing: '0.08em', marginBottom: 4 }}>CHAPTER SUMMARY</div>
                <p style={{ color: '#64748b', fontSize: '0.84rem', lineHeight: 1.6, margin: 0 }}>{text}</p>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   Main BookDetailView Export
═══════════════════════════════════════════════════════════════════════ */
export default function BookDetailView({ book, onClose, onRate, onDownload, downloading }) {
    const [page, setPage] = useState(0);
    const [sliding, setSliding] = useState(false);
    const [showToc, setShowToc] = useState(false);
    const [showMeta, setShowMeta] = useState(false);

    const meta = BOOK_META[book.id] || null;
    const pages = book.pages || [];
    const total = pages.length;
    const progress = total ? Math.round((page / (total + 1)) * 100) : 0;

    // Chapter summary: page index maps to chapterSummaries array (0-indexed, page 1=index 0)
    const chapterSummary = meta?.chapterSummaries && page >= 1 && page <= total
        ? meta.chapterSummaries[page - 1] || null
        : null;

    // TOC to use
    const toc = meta?.toc || pages.map((_, i) => ({ ch: `Page ${i + 1}`, pg: i + 1 }));

    const go = useCallback((dir) => {
        if (sliding) return;
        if (dir > 0 && page >= total) return;
        if (dir < 0 && page <= 0) return;
        setSliding(true);
        setTimeout(() => { setPage(p => p + dir); setSliding(false); }, 150);
    }, [page, total, sliding]);

    useEffect(() => {
        const h = (e) => {
            if (e.key === 'ArrowRight') go(1);
            else if (e.key === 'ArrowLeft') go(-1);
            else if (e.key === 'Escape') { if (showToc) setShowToc(false); else if (showMeta) setShowMeta(false); else onClose(); }
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [go, onClose, showToc, showMeta]);

    const content = page >= 1 && page <= total ? pages[page - 1] : null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(2,3,16,0.97)', display: 'flex', flexDirection: 'column' }}>

            {/* ── Top bar ── */}
            <div style={{
                height: 64, flexShrink: 0,
                background: 'rgba(4,5,26,0.97)', borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 1rem', gap: 8,
            }}>
                {/* Left: info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{book.cover || '📖'}</span>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                            {page === 0 ? 'Cover Page' : page > total ? 'Completed' : `Page ${page} / ${total}`} · {book.category}
                        </div>
                    </div>
                </div>

                {/* Right: actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => setShowToc(true)} title="Table of Contents" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', width: 'auto', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', boxShadow: 'none' }}>
                        <List size={14} /> TOC
                    </button>
                    <button onClick={() => setShowMeta(true)} title="Book Metadata" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', width: 'auto', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc', boxShadow: 'none' }}>
                        <Info size={14} /> Info
                    </button>
                    {book.isEbook && (
                        <button onClick={() => onDownload(book)} disabled={downloading === book.id} style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', width: 'auto', background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                            <Download size={13} /> {downloading === book.id ? '…' : 'Download'}
                        </button>
                    )}
                    <button onClick={onRate} style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', width: 'auto', background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
                        <Star size={13} /> Rate
                    </button>
                    <button onClick={onClose} style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', width: 'auto', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', boxShadow: 'none' }}>
                        <X size={13} /> Close
                    </button>
                </div>
            </div>

            {/* ── Progress bar ── */}
            <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#6366f1,#a855f7)', transition: 'width 0.3s ease' }} />
            </div>

            {/* ── Page area ── */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem 0.5rem', gap: '0.75rem' }}>

                {/* Prev arrow */}
                <button onClick={() => go(-1)} disabled={page === 0} style={{ flexShrink: 0, width: 42, height: 42, borderRadius: '50%', background: page === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.3 : 1, boxShadow: 'none', padding: 0 }}>
                    <ChevronLeft size={20} color="#818cf8" />
                </button>

                {/* Page card */}
                <div style={{
                    width: '100%', maxWidth: 740, height: '100%', maxHeight: 'calc(100vh - 130px)',
                    background: page === 0 ? `linear-gradient(135deg, #6366f1, #a855f7)` : '#fff',
                    borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
                    display: 'flex', flexDirection: 'column',
                    opacity: sliding ? 0 : 1, transform: sliding ? 'scale(0.97)' : 'scale(1)',
                    transition: 'opacity 0.15s, transform 0.15s',
                }}>

                    {page === 0 ? (
                        /* ── Cover ── */
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '5rem', marginBottom: '1.2rem' }}>{book.cover || '📖'}</div>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', lineHeight: 1.3, fontFamily: 'Inter, sans-serif' }}>{book.title}</h2>
                            {book.author && <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '0.2rem', fontSize: '0.95rem' }}>by {book.author}</p>}
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '1rem' }}>{meta?.subject || book.category}</p>
                            {meta && (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1rem' }}>
                                    {[meta.edition, meta.year, meta.level].filter(Boolean).map(v => (
                                        <span key={v} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.72rem', padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)' }}>{v}</span>
                                    ))}
                                </div>
                            )}
                            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.7rem 1.4rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>
                                ✅ {total} Chapters · Press → or click Next to read
                            </div>
                        </div>

                    ) : page > total ? (
                        /* ── Finished ── */
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', background: 'linear-gradient(135deg,#f0f4ff,#fdf4ff)' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                            <h3 style={{ color: '#1e293b', fontSize: '1.4rem', marginBottom: '0.5rem' }}>You finished it!</h3>
                            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>We hope you enjoyed <strong>"{book.title}"</strong>.</p>
                            <button onClick={onRate} style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', padding: '0.65rem 2rem', borderRadius: 999, fontSize: '0.9rem' }}>
                                <Star size={14} /> Leave a Review
                            </button>
                        </div>

                    ) : (
                        /* ── Content ── */
                        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {/* Page header */}
                            <div style={{ padding: '10px 20px 8px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: '#fff' }}>
                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                                    {book.title}
                                </span>
                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', flexShrink: 0 }}>{page} / {total}</span>
                            </div>

                            {/* Scrollable text */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.6rem', fontFamily: '"Georgia", "Times New Roman", serif' }}>
                                {renderContent(content)}
                                <ChapterSummary text={chapterSummary} />
                            </div>

                            {/* Page dots */}
                            <div style={{ padding: '7px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'center', gap: 4, flexShrink: 0 }}>
                                {Array.from({ length: Math.min(total, 14) }).map((_, i) => {
                                    const dp = Math.round((i / Math.max(Math.min(total, 14) - 1, 1)) * (total - 1)) + 1;
                                    return (
                                        <div key={i} onClick={() => setPage(dp)} style={{ width: page === dp ? 18 : 7, height: 7, borderRadius: 999, background: page === dp ? '#6366f1' : '#e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }} />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Next arrow */}
                <button onClick={() => go(1)} disabled={page > total} style={{ flexShrink: 0, width: 42, height: 42, borderRadius: '50%', background: page > total ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page > total ? 'not-allowed' : 'pointer', opacity: page > total ? 0.3 : 1, boxShadow: 'none', padding: 0 }}>
                    <ChevronRight size={20} color="#818cf8" />
                </button>
            </div>

            {/* Hint */}
            <div style={{ textAlign: 'center', padding: '0.4rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.18)', flexShrink: 0 }}>
                ← → Arrow keys to navigate · Esc to close · TOC for chapters · Info for metadata
            </div>

            {/* ── Overlays ── */}
            {showToc && <TocSidebar toc={toc} currentPage={page} onGo={setPage} onClose={() => setShowToc(false)} />}
            {showMeta && <MetaPanel book={book} meta={meta} onClose={() => setShowMeta(false)} />}
        </div>
    );
}
