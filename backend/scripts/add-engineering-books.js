const fs = require('fs');
const path = require('path');

const BOOKS = [
    {
        id: 'ebook-edct',
        title: 'Electronic Devices and Circuit Theory',
        author: 'Boylestad & Nashelsky',
        category: 'Electronics & Communication',
        cover: '⚡',
        isEbook: true,
        ratings: [],
        pages: [
            `ELECTRONIC DEVICES AND CIRCUIT THEORY
══════════════════════════════════════
Author   : Boylestad & Nashelsky
Subject  : Electronics Engineering
Level    : Undergraduate Engineering

PREFACE
This textbook comprehensively covers the fundamentals of electronic
devices and circuit analysis. From basic semiconductor physics to
advanced amplifier configurations, each chapter builds on the last
to give you a complete and practical understanding of electronics.

Topics Covered:
  • Semiconductor Diodes
  • Bipolar Junction Transistors (BJT)
  • Field Effect Transistors (FET & MOSFET)
  • Small Signal Models & Amplifiers
  • Operational Amplifiers
  • Feedback & Oscillators
  • Power Amplifiers
  • Voltage Regulators`,

            `CHAPTER 1 — SEMICONDUCTOR DIODES
════════════════════════════════

1.1 SEMICONDUCTOR BASICS
A semiconductor is a material with electrical conductivity between a
conductor and an insulator. Silicon (Si) and Germanium (Ge) are most
common. Pure semiconductors are called intrinsic; when doped with
impurities they become extrinsic.

• N-type: Doped with pentavalent atoms (P, As). Majority carriers = electrons.
• P-type: Doped with trivalent atoms (B, Al). Majority carriers = holes.

1.2 P-N JUNCTION
When P-type and N-type semiconductors are joined, a depletion region
forms at the junction. A built-in potential (Vbi) of ~0.7V (Si) or
~0.3V (Ge) develops.

Forward Bias: External +ve to P-side, depletion region narrows, current flows.
Reverse Bias: External +ve to N-side, depletion widens, only leakage current.

1.3 DIODE EQUATION
  I = Is(e^(VD/nVT) - 1)
  where:
    Is = reverse saturation current
    VT = thermal voltage = kT/q ≈ 26mV at 25°C
    n  = ideality factor (1 for Ge, 2 for Si)

1.4 DIODE TYPES
  • Rectifier diode  — General purpose (1N4007)
  • Zener diode      — Voltage regulation (operates in reverse breakdown)
  • LED              — Light emission when forward biased
  • Photodiode       — Current proportional to light intensity
  • Schottky diode   — Metal-semiconductor, very fast switching
  • Varactor diode   — Variable capacitance with reverse voltage`,

            `CHAPTER 2 — DIODE APPLICATIONS
════════════════════════════════

2.1 HALF-WAVE RECTIFIER
Only one half (positive or negative) of the AC cycle passes through.
  • PIV (Peak Inverse Voltage) = Vm
  • Average output Vdc = Vm/π ≈ 0.318 Vm
  • Ripple factor r = 1.21
  • Efficiency η = 40.6%

2.2 FULL-WAVE RECTIFIER (Centre Tap)
Both halves of AC cycle are utilized.
  • Vdc = 2Vm/π ≈ 0.636 Vm
  • Ripple factor r = 0.482
  • Efficiency η = 81.2%
  • PIV = 2Vm

2.3 BRIDGE RECTIFIER
Uses 4 diodes, no centre-tap transformer needed.
  • Vdc = 2Vm/π
  • PIV = Vm (advantage over CT rectifier)
  • Most commonly used in power supplies

2.4 FILTERS
Capacitor filter: C placed in parallel with load reduces ripple.
  Ripple Voltage Vr = Vdc / (f × C × RL)
Inductor filter: L placed in series, opposes current changes.
LC filter: Combination giving lowest ripple.

2.5 CLIPPERS & CLAMPERS
Clipper: Removes portion of waveform above/below a reference level.
  • Series clipper, Shunt clipper, Biased clipper
Clamper: Shifts the DC level of a waveform up or down.
  • Positive clamper, Negative clamper`,

            `CHAPTER 3 — BIPOLAR JUNCTION TRANSISTOR (BJT)
═══════════════════════════════════════════════

3.1 CONSTRUCTION & OPERATION
BJT has three terminals: Base (B), Collector (C), Emitter (E).
Types: NPN and PNP.

In NPN (active mode):
  • E-B junction: forward biased
  • C-B junction: reverse biased
  • Electrons from emitter cross base to collector
  • IC = βIB,  IE = IC + IB

Key Parameters:
  α (alpha) = IC/IE  ≈ 0.95 – 0.99
  β (beta)  = IC/IB  ≈ 20 – 500
  β = α/(1-α)

3.2 BJT CONFIGURATIONS
Common Base (CB):
  • Input: IE, Output: IC
  • Current gain < 1, Voltage gain high
  • Used in high-frequency applications

Common Emitter (CE):
  • Input: IB, Output: IC
  • Current gain β, Voltage gain high
  • Most widely used configuration

Common Collector (CC) / Emitter Follower:
  • Input: IB, Output: IE
  • Voltage gain ≈ 1, Current gain β+1
  • Used for impedance matching

3.3 BIASING TECHNIQUES
1. Fixed Bias:        RB from VCC to Base. Simple but β-dependent.
2. Collector-to-Base: Feedback from collector. More stable.
3. Voltage Divider:   R1, R2 from VCC. Most stable, β-independent.
4. Emitter Bias:      Dual supply. Excellent stability.

Stability Factor S = ΔIC/ΔICO (lower = more stable)
Voltage Divider: S ≈ 1 + RB/RE  (best stability)`,

            `CHAPTER 4 — FIELD EFFECT TRANSISTORS
══════════════════════════════════════

4.1 JFET (Junction FET)
Terminals: Gate (G), Drain (D), Source (S).
Types: N-channel and P-channel.
Controlled by voltage at gate (VGS), not current.

Operating Regions:
  Ohmic/Triode:  VDS < VGS - VGS(off)
  Saturation:    ID = IDSS(1 - VGS/VP)²
  Cutoff:        VGS ≤ VP

Key Parameters:
  IDSS = Drain current when VGS = 0
  VP   = Pinch-off (threshold) voltage
  gm   = transconductance = 2IDSS/|VP| × (1 - VGS/VP)

4.2 MOSFET
Metal-Oxide-Semiconductor FET. Gate is insulated by SiO2 (oxide).

Depletion MOSFET: Can operate with +ve or -ve VGS. 
Enhancement MOSFET: Requires VGS > VTH to turn ON.
  ID = k(VGS - VTH)²VDS  (linear region)
  ID = k(VGS - VTH)²/2   (saturation)

CMOS (Complementary MOS): P-channel + N-channel MOSFET.
  Used in all modern digital ICs. Very low static power consumption.

4.3 FET AMPLIFIERS
CD (Common Drain) = Source follower: gain ≈ 1
CS (Common Source): Voltage gain AV = -gm × RD
CG (Common Gate): Low input impedance, used at high frequencies

4.4 FET vs BJT
  FET: High input impedance, unipolar, voltage-controlled, less noise
  BJT: Higher gain, bipolar, current-controlled, faster in some circuits`,

            `CHAPTER 5 — OPERATIONAL AMPLIFIERS
════════════════════════════════════

5.1 OP-AMP BASICS
An ideal op-amp has:
  • Infinite open-loop gain (A = ∞)
  • Infinite input impedance (Zin = ∞)
  • Zero output impedance (Zout = 0)
  • Infinite bandwidth
  • Zero offset voltage

Practical IC 741 Op-Amp:
  • Open-loop gain: ~200,000
  • Input impedance: 2 MΩ
  • Output impedance: 75 Ω
  • Supply voltage: ±15V typical

5.2 KEY CONFIGURATIONS

Inverting Amplifier:
  Vout = -(Rf/R1) × Vin
  Input impedance = R1

Non-Inverting Amplifier:
  Vout = (1 + Rf/R1) × Vin
  Input impedance = very high (ideal = ∞)

Voltage Follower (Buffer):
  Vout = Vin, Gain = 1
  Used for impedance matching

Summing Amplifier:
  Vout = -Rf × (V1/R1 + V2/R2 + V3/R3)

Difference Amplifier:
  Vout = (Rf/R1)(V2 - V1)

Integrator:  Vout = -(1/RC)∫Vin dt
Differentiator: Vout = -RC × dVin/dt

5.3 COMPARATOR
Non-inverting: Vout = +Vsat if V+ > V-
Used in zero-crossing detectors, Schmitt triggers, window comparators.`,

            `CHAPTER 6 — POWER AMPLIFIERS & OSCILLATORS
════════════════════════════════════════════

6.1 AMPLIFIER CLASSES
Class A:  Q-point at centre of load line. Conduction 360°.
  Efficiency max = 25% (resistive) or 50% (transformer coupled).
  Best linearity, most distortion-free.

Class B:  Two transistors, each conducts 180°. 
  Efficiency max = 78.5%. Push-pull configuration.
  Crossover distortion is a problem.

Class AB: Slight forward bias removes crossover distortion.
  Used in most audio amplifiers. Efficiency 50-78%.

Class C:  Conduction < 180°. High efficiency >80%. 
  High distortion — used only for RF amplifiers with tuned circuits.

Class D:  Switching amplifier. PWM. Efficiency >90%.
  Used in modern audio systems and motor drives.

6.2 OSCILLATORS
Barkhausen Criteria: For sustained oscillations:
  |Aβ| = 1  and  ∠Aβ = 0° (or 360°)

RC Oscillators (audio range):
  • Phase Shift: f = 1/(2π√6 RC)
  • Wien Bridge: f = 1/(2πRC), used in signal generators

LC Oscillators (RF range):
  • Colpitts:  f = 1/(2π√(L × C1C2/(C1+C2)))
  • Hartley:   f = 1/(2π√((L1+L2)C))
  • Clapp:     More stable version of Colpitts

Crystal Oscillator:
  Uses piezoelectric crystal. Extremely stable frequency.
  Q factor = millions. Used in clocks, communication systems.

6.3 VOLTAGE REGULATORS
Zener Regulator: Simple but inefficient.
IC 78XX Series: Positive fixed regulators (7805 = +5V, 7812 = +12V)
IC 79XX Series: Negative fixed regulators.
LM317: Adjustable output 1.25V to 37V.
Switch-mode power supply (SMPS): High efficiency >85%.`,
        ],
    },

    {
        id: 'ebook-bee',
        title: 'Basics of Electrical Engineering',
        author: 'V.K. Mehta & Rohit Mehta',
        category: 'Electrical Engineering',
        cover: '🔌',
        isEbook: true,
        ratings: [],
        pages: [
            `BASICS OF ELECTRICAL ENGINEERING
══════════════════════════════════
Author   : V.K. Mehta & Rohit Mehta
Subject  : Electrical Engineering Fundamentals
Level    : First Year Engineering

PREFACE
This comprehensive textbook covers the fundamental principles of
electrical engineering. It begins with basic concepts such as charge,
voltage, and current, and progresses through DC circuits, AC circuits,
transformers, electrical machines, and measuring instruments.

Chapters:
  1. Fundamentals of Electricity
  2. DC Circuit Analysis
  3. Electromagnetism & Inductance
  4. AC Circuits & Phasors
  5. Transformers
  6. Electrical Machines
  7. Measuring Instruments`,

            `CHAPTER 1 — FUNDAMENTALS OF ELECTRICITY
═════════════════════════════════════════

1.1 ELECTRIC CHARGE
Charge (Q) is a fundamental property of matter. Unit: Coulomb (C).
  1 electron has charge = -1.6 × 10⁻¹⁹ C.
  1 Coulomb = 6.24 × 10¹⁸ electrons.

1.2 ELECTRIC CURRENT
Current (I) = rate of flow of charge.
  I = Q/t     Unit: Ampere (A) = Coulomb/second

Types:
  Direct Current (DC): Flows in one direction. Battery, DC generator.
  Alternating Current (AC): Reverses direction periodically. Generator, mains supply.
  Conventional current flows from + to -. Electron flow is opposite.

1.3 ELECTROMOTIVE FORCE & POTENTIAL DIFFERENCE
  EMF (E): Energy per unit charge provided by a source. Unit: Volt.
  PD (V):  Voltage drop across a component. Unit: Volt.
  
1.4 OHM'S LAW
  V = I × R
  I = V/R
  R = V/I
Conditions: Temperature constant, conductor must be ohmic.

Resistance (R): Opposition to current flow. Unit: Ohm (Ω).
  R = ρL/A
  where ρ = resistivity, L = length, A = cross-sectional area.

Resistivity (ρ):
  Conductors: ~10⁻⁸ Ω·m (Copper = 1.72 × 10⁻⁸ Ω·m)
  Insulators:  >10⁸ Ω·m
  Semiconductors: in between

1.5 ELECTRICAL POWER & ENERGY
  P = VI = I²R = V²/R     Unit: Watt (W)
  Energy E = P × t        Unit: Joule (J) or kWh
  1 kWh = 3.6 × 10⁶ J (1 unit of electricity)`,

            `CHAPTER 2 — DC CIRCUIT ANALYSIS
═════════════════════════════════

2.1 SERIES CIRCUITS
Resistors in series: RT = R1 + R2 + R3 + ...
Same current flows through all. Voltage divides.
Voltage divider: V1 = V × R1/RT

2.2 PARALLEL CIRCUITS
Resistors in parallel: 1/RT = 1/R1 + 1/R2 + 1/R3
Same voltage across all. Current divides.
For 2 resistors: RT = R1×R2/(R1+R2)

2.3 KIRCHHOFF'S LAWS
KCL (Current Law): Sum of currents entering a node = sum leaving.
  ΣI_in = ΣI_out   (Conservation of charge)

KVL (Voltage Law): Sum of all voltages around any closed loop = 0.
  ΣV = 0           (Conservation of energy)

2.4 MESH ANALYSIS
Assign mesh currents I1, I2... (clockwise).
Write KVL for each mesh. Solve simultaneous equations.

2.5 NODAL ANALYSIS
Choose reference node (ground). Assign node voltages V1, V2...
Apply KCL at each node. Solve for unknown voltages.

2.6 NETWORK THEOREMS
Superposition: Each source acts independently; responses are added.
  (Only for linear circuits)

Thevenin's: Any two-terminal linear circuit →
  Vth (open circuit voltage) + Rth (internal resistance) in series.

Norton's: Any two-terminal linear circuit →
  IN (short circuit current) + RN in parallel.
  IN = Vth/Rth, RN = Rth.

Maximum Power Transfer: RL = Rth → maximum power to load.
  Pmax = Vth²/(4Rth)

2.7 WHEATSTONE BRIDGE
Balanced condition: R1/R2 = R3/R4, galvanometer reads zero.
Used for precise resistance measurement.`,

            `CHAPTER 3 — ELECTROMAGNETISM
══════════════════════════════

3.1 MAGNETIC FIELD & FLUX
Magnetic flux (Φ): Total field lines passing through a surface.
  Φ = B × A × cosθ     Unit: Weber (Wb)

Magnetic flux density (B): Flux per unit area.
  B = Φ/A              Unit: Tesla (T)

Magnetomotive Force (MMF): Drives flux through a magnetic circuit.
  F = N × I            Unit: Ampere-turns (AT)

Reluctance (S): Opposition to magnetic flux.
  S = L/(μA)           Unit: AT/Wb
  where μ = permeability, L = length, A = area

3.2 ELECTROMAGNETIC INDUCTION
Faraday's Law: EMF induced = -dΦ/dt
  e = -N × dΦ/dt

Lenz's Law: Induced EMF opposes the cause producing it.

3.3 SELF INDUCTANCE
An inductor opposes change in current through it.
  e = -L × dI/dt
  L = NΦ/I             Unit: Henry (H)

Inductors in series: LT = L1 + L2 + ...
Inductors in parallel: 1/LT = 1/L1 + 1/L2 + ...

Energy stored in inductor: W = ½LI²

3.4 MUTUAL INDUCTANCE
  M = k√(L1×L2)
  k = coupling coefficient (0 ≤ k ≤ 1)
  Induced EMF in secondary: e2 = -M × dI1/dt`,

            `CHAPTER 4 — AC CIRCUITS
════════════════════════

4.1 AC FUNDAMENTALS
Sinusoidal voltage: v = Vm sin(ωt + φ)
  Vm = peak value
  ω  = angular frequency = 2πf
  f  = frequency (Hz), T = 1/f (period)
  φ  = phase angle

RMS Value (Root Mean Square):
  Vrms = Vm/√2 ≈ 0.707 Vm   (for sinusoidal)
  Irms = Im/√2

Average Value: Vavg = 2Vm/π ≈ 0.637 Vm

Form factor = Vrms/Vavg = 1.11
Peak factor  = Vm/Vrms   = 1.414

4.2 PHASORS
A phasor represents a sinusoidal quantity as a rotating vector.
Impedance Z = R + jX (complex number)
  |Z| = √(R² + X²)
  φ   = arctan(X/R)

Resistor R: V and I in phase. Z = R
Inductor L: V leads I by 90°. XL = ωL = 2πfL
Capacitor C: I leads V by 90°. XC = 1/ωC = 1/2πfC

4.3 SERIES RLC CIRCUIT
Z = R + j(XL - XC)
Resonance: XL = XC → Z = R (minimum, current maximum)
  fr = 1/(2π√LC)
  Q  = fr/BW = ωL/R = (1/ωC)/R

4.4 POWER IN AC CIRCUITS
  Active Power P = VIcosφ               Unit: Watt (W)
  Reactive Power Q = VIsinφ             Unit: VAR
  Apparent Power S = VI                 Unit: VA
  Power Factor PF = cosφ = P/S
  S = √(P² + Q²)

Unity PF: pure resistive (best, no reactive power)
Lagging PF: inductive loads (motors, transformers)
Leading PF: capacitive loads`,

            `CHAPTER 5 — TRANSFORMERS
═════════════════════════

5.1 PRINCIPLE
A transformer works on the principle of mutual induction.
An AC voltage applied to primary induces voltage in secondary.
  Turns ratio:     a = N1/N2 = V1/V2 = I2/I1
  No-load EMF:     E = 4.44 × f × N × Φmax (RMS)

5.2 TYPES
Step-up:   N2 > N1  → V2 > V1  (e.g. power transmission)
Step-down: N2 < N1  → V2 < V1  (e.g. household supply, 11kV → 230V)
Isolation: N1 = N2  → V2 = V1  (safety, noise isolation)

5.3 LOSSES
Core (Iron) Losses:
  Hysteresis: Ph = Kh × Bmax^1.6 × f     (energy lost in magnetizing)
  Eddy Current: Pe = Ke × Bmax² × f²     (laminating core reduces this)

Copper Losses:
  PCu = I1²R1 + I2²R2   (heat in windings)

5.4 EFFICIENCY
  η = Pout/Pin × 100%
  η = Pout/(Pout + PCu + Piron) × 100%
  Max efficiency when Cu losses = Iron losses.

5.5 VOLTAGE REGULATION
  VR% = (VNL - VFL)/VFL × 100%
  Lower VR% = better transformer performance.

5.6 AUTO-TRANSFORMER
Single winding with a tap. Part of winding is common.
  • Smaller, lighter, cheaper than 2-winding transformer
  • Not electrically isolated — safety concern
  • Used for motor starters, Variac (variable auto-transformer)`,

            `CHAPTER 6 — ELECTRICAL MACHINES & INSTRUMENTS
══════════════════════════════════════════════

6.1 DC MACHINES (Motors & Generators)
Parts: Armature (rotating), Field winding, Commutator, Brushes, Yoke.

DC Generator: Mechanical → Electrical energy (Faraday's law).
  EMF generated: E = (ΦZNP)/(60A)
  where Φ=flux, Z=conductors, N=speed, P=poles, A=parallel paths

DC Motor: Electrical → Mechanical energy.
  Back EMF: Eb = E - IaRa
  Torque: T = (ΦZIA P)/(2πA)
  Speed: N ∝ (V - IaRa)/Φ

Types (by field connection):
  Series: High starting torque. Speed varies with load.
  Shunt:  Nearly constant speed. Used in lathes, fans.
  Compound: Combination. Used in elevators, cranes.

6.2 AC MACHINES
Induction Motor (3-phase, most common motor):
  Works on rotating magnetic field principle.
  Slip: s = (Ns - N)/Ns × 100%  (Ns = synchronous speed)
  Ns = 120f/P   (P = number of poles)
  Torque ∝ sR2E2²/(R2² + (sX2)²)
  At full load: slip ≈ 3–5%

Synchronous Motor: Runs at exactly synchronous speed.
  Used for power factor correction (leading PF).

6.3 MEASURING INSTRUMENTS
Ammeter: Measures current. Connected in SERIES.
  Uses a shunt resistor in parallel with galvanometer.

Voltmeter: Measures voltage. Connected in PARALLEL.
  Uses a multiplier resistor in series.

Wattmeter: Measures power. Has current coil + pressure coil.

Multimeter: Combines all. Can measure V, I, R.
Oscilloscope: Displays waveform vs time. Measures Vp, f, phase.`,
        ],
    },

    {
        id: 'ebook-bee10c',
        title: 'Basic of Electric Engineering (10 C)',
        author: 'Educational Board Press',
        category: 'Electrical Engineering',
        cover: '🔋',
        isEbook: true,
        ratings: [],
        pages: [
            `BASIC OF ELECTRIC ENGINEERING (10 C)
════════════════════════════════════
Level    : 10th Grade / Diploma First Year
Subject  : Electrical Engineering Basics

INTRODUCTION
This book is designed for students appearing for their 10 C
(10th level Certificate) examinations in electrical engineering.
The content covers essential theoretical and practical concepts
required for the examination.

Units Covered:
  Unit 1 — Electrical Quantities & Ohm's Law
  Unit 2 — DC Circuits & Kirchhoff's Laws
  Unit 3 — Electrical Work, Power & Energy
  Unit 4 — Electromagnetism
  Unit 5 — Primary & Secondary Cells
  Unit 6 — Wiring & Safety`,

            `UNIT 1 — ELECTRICAL QUANTITIES & OHM'S LAW
══════════════════════════════════════════

ELECTRIC CHARGE
All matter is made of atoms containing:
  • Protons (positive charge)
  • Neutrons (no charge)
  • Electrons (negative charge)
When electrons move, electric current is created.

CURRENT (I)
Flow of electric charge (electrons) through a conductor.
  I = Q/t
  Unit: Ampere (A)
  Instruments: Ammeter (connected in series)

VOLTAGE (V)
The "pressure" that drives current through a circuit.
  V = W/Q (work done per unit charge)
  Unit: Volt (V)
  Instruments: Voltmeter (connected in parallel)

RESISTANCE (R)
Opposition offered by a material to the flow of current.
  Unit: Ohm (Ω)
  Symbol: R
  Instruments: Ohmmeter or multimeter

OHM'S LAW
At constant temperature, current is directly proportional to voltage.
  V = IR    or    I = V/R    or    R = V/I

Example:
  A 12V battery connected to a 4Ω resistor.
  I = V/R = 12/4 = 3A

RESISTIVITY
  R = ρL/A
  ρ for Copper = 1.7 × 10⁻⁸ Ω·m (good conductor)
  ρ for Rubber > 10¹³ Ω·m (insulator)

Factors affecting resistance:
  • Length:       ↑ Length → ↑ Resistance
  • Area:         ↑ Area → ↓ Resistance
  • Material:     depends on ρ
  • Temperature:  for metals, ↑ Temp → ↑ Resistance`,

            `UNIT 2 — DC CIRCUITS
══════════════════════

SERIES CIRCUIT
Components connected end-to-end. Single current path.
  • Same current through all: I = I1 = I2 = I3
  • Total resistance: RT = R1 + R2 + R3
  • Voltage divides: V = V1 + V2 + V3
  • V1/V2 = R1/R2 (voltage divider rule)

Example: R1=2Ω, R2=3Ω, V=10V
  RT = 5Ω,  I = 10/5 = 2A
  V1 = 2×2 = 4V,  V2 = 2×3 = 6V

PARALLEL CIRCUIT
Components connected between same two nodes.
  • Same voltage across all: V = V1 = V2 = V3
  • Total resistance: 1/RT = 1/R1 + 1/R2 + 1/R3
  • Current divides: I = I1 + I2 + I3

Example: R1=6Ω, R2=3Ω, V=6V
  RT = 6×3/(6+3) = 2Ω
  I = 6/2 = 3A,  I1 = 1A,  I2 = 2A

KIRCHHOFF'S LAWS
KCL: At any junction, ΣI_in = ΣI_out
KVL: Around any closed loop, ΣV = 0

INTERNAL RESISTANCE
Real batteries have internal resistance (r).
  Terminal voltage: V = E - Ir
  Short circuit current: Isc = E/r
  Maximum power transfer: RL = r`,

            `UNIT 3 — ELECTRICAL POWER & ENERGY
════════════════════════════════════

ELECTRICAL POWER
Power = rate of doing work or consuming energy.
  P = VI = I²R = V²/R
  Unit: Watt (W)
  1 kW = 1000 W

ELECTRICAL ENERGY
Energy = Power × Time
  E = P × t       Unit: Joule (J)
  E = P(kW) × t(hours)   Unit: kWh (kilowatt-hour)

1 kWh = 1 unit of electrical energy
Cost = Number of units × Rate per unit

Example:
  A 100W bulb used for 10 hours:
  Energy = 100×10 = 1000 Wh = 1 kWh = 1 unit
  If rate = ₹5/unit, Cost = ₹5

HEATING EFFECT OF CURRENT (Joule's Law)
Heat produced: H = I²Rt (Joules) = I²Rt/4.2 (Calories)
Applications: Electric iron, heater, toaster, incandescent bulb.

EFFICIENCY
  η = (Output power / Input power) × 100%
  η = (Pout / Pin) × 100%
  Energy losses occur due to: heat, friction, magnetic losses.

FUSES & CIRCUIT BREAKERS
Fuse: A thin wire that melts when excess current flows.
  Purpose: Protect circuits and appliances.
  Fuse wire material: Tin-lead alloy (low melting point).
MCB (Miniature Circuit Breaker): Reusable, trips on overload.
ELCB/RCCB: Protects against earth leakage / shock.`,

            `UNIT 4 — ELECTROMAGNETISM
══════════════════════════

MAGNETIC FIELD
Exists around every magnet and current-carrying conductor.
Represented by magnetic field lines:
  • Form closed loops from N to S (outside)
  • Do not intersect each other
  • Closer lines = stronger field

OERSTED'S EXPERIMENT (1820)
A current-carrying wire deflects a compass needle.
→ Proves that electric current creates magnetic field.

RIGHT HAND THUMB RULE
For a straight wire: Wrap right hand with thumb pointing in
direction of current; fingers indicate direction of field (circular).

For a coil (solenoid): Fingers wrap in current direction;
thumb points to North pole.

SOLENOID
Coil of wire. When current flows, it acts like a bar magnet.
  • Adding iron core increases magnetic strength
  • Applications: Relays, electromagnets, transformers

FARADAY'S LAW OF ELECTROMAGNETIC INDUCTION
EMF is induced in a conductor when it moves in a magnetic field
or when the magnetic flux through a coil changes.
  e = -N × dΦ/dt

LENZ'S LAW
The induced EMF is always in a direction to oppose the change
in flux that caused it (conservation of energy).

APPLICATIONS
  • Electric Generator: Converts mechanical → electrical
  • Electric Motor:     Converts electrical → mechanical
  • Transformer:        Changes AC voltage level
  • Induction cooktop:  Eddy currents heat cooking vessel`,

            `UNIT 5 — CELLS & BATTERIES
═══════════════════════════

PRIMARY CELLS (Not rechargeable)
Dry Cell (Leclanché Cell):
  Anode (-): Zinc can
  Cathode (+): Carbon rod
  Electrolyte: Ammonium chloride paste
  EMF: 1.5V
  Uses: Torches, clocks, remote controls

Mercury Cell: 1.35V, stable EMF, used in watches, hearing aids.
Lithium Cell: 3V, used in calculators, cameras.

SECONDARY CELLS (Rechargeable)
Lead-Acid Battery:
  Positive plate: Lead dioxide (PbO2)
  Negative plate: Sponge lead (Pb)
  Electrolyte: Dilute sulphuric acid (H2SO4)
  EMF: 2V per cell; 12V car battery = 6 cells
  Capacity: measured in Ampere-hours (Ah)

During Discharge: PbO2 + Pb + 2H2SO4 → 2PbSO4 + 2H2O
During Charge:   2PbSO4 + 2H2O → PbO2 + Pb + 2H2SO4

Nickel-Cadmium (NiCd): Rechargeable, 1.2V, portable devices.
Lithium-Ion (Li-Ion): Lightweight, high energy density, smartphones.

BATTERY CONNECTIONS
Series: ET = E1+E2+..., IT = I (same current capacity)
Parallel: ET = E (same voltage), IT = I1+I2+... (more current)

UNIT 6 — WIRING & ELECTRICAL SAFETY
Wiring types: Cleat, Casing-capping, Conduit, Concealed.
Safety rules:
  1. Always switch OFF before working.
  2. Earth all metal parts of appliances.
  3. Use correct fuse rating.
  4. Never touch live wires with wet hands.
  5. Use ISI-marked equipment only.`,
        ],
    },

    {
        id: 'ebook-beece',
        title: 'Basic Electrical Electronics and Computer Engineering',
        author: 'R.K. Rajput',
        category: 'Electrical Engineering',
        cover: '💻',
        isEbook: true,
        ratings: [],
        pages: [
            `BASIC ELECTRICAL ELECTRONICS AND COMPUTER ENGINEERING
══════════════════════════════════════════════════════
Author  : R.K. Rajput
Level   : First Year Engineering (Common to all branches)
Subject : BEECE / BEECF

OVERVIEW
This combined textbook serves as the foundation for all engineering
branches. It bridges three key domains:

Part A — Electrical Engineering
  • DC & AC circuits
  • Electromagnetic principles
  • Electrical machines & transformers

Part B — Electronics Engineering
  • Semiconductor devices
  • Digital electronics
  • Signal and communication basics

Part C — Computer Engineering
  • Number systems
  • Logic gates & Boolean algebra
  • Computer organisation
  • Programming fundamentals`,

            `PART A — ELECTRICAL ENGINEERING FUNDAMENTALS
══════════════════════════════════════════════

OHM'S LAW REVIEW
V = IR,  I = V/R,  R = V/I
Power: P = VI = I²R = V²/R

NETWORK THEOREMS
Superposition Theorem:
  Response = sum of individual source responses.
  Deactivate: voltage sources → short, current sources → open.

Thevenin's Theorem:
  Any linear network = Vth (open circuit voltage) + Rth in series.
  Vth: Open-circuit voltage at output terminals.
  Rth: Resistance seen from output with all sources deactivated.

Norton's Theorem:
  Any linear network = IN (short circuit current) + RN in parallel.
  IN = Vth/Rth, RN = Rth.

Maximum Power Transfer: RL = Rth → Pmax = Vth²/4Rth

AC CIRCUITS
Impedance: Z = R + jX
  Resistor: Z = R (in phase)
  Inductor: Z = jωL (V leads I by 90°)
  Capacitor: Z = 1/jωC (I leads V by 90°)

Power in AC:
  P = VIcosφ (active, Watts)
  Q = VIsinφ (reactive, VAR)
  S = VI (apparent, VA)
  PF = cosφ = P/S

TRANSFORMERS REVIEW
Turns ratio:  a = N1/N2 = V1/V2 = I2/I1
Efficiency:   η = Pout/(Pout + Plosses) × 100%
Types: Step-up, Step-down, Isolation, Auto-transformer`,

            `PART B — ELECTRONICS ENGINEERING
══════════════════════════════════

SEMICONDUCTOR DIODES
PN junction: Forward bias → conducts; Reverse bias → blocks.
Diode equation: I = IS(e^(V/VT) - 1)
Applications: Rectifiers (HW, FW, Bridge), clippers, clampers.

TRANSISTORS
BJT (NPN/PNP): Current-controlled. IC = βIB.
  Configurations: CB, CE, CC.
  Biasing: Fixed, VD, emitter bias.

FET: Voltage-controlled. High input impedance.
  JFET, MOSFET (Depletion/Enhancement type).

OP-AMP (Operational Amplifier):
  Ideal: Infinite gain, infinite Zin, zero Zout.
  Inverting amp: Vout = -(Rf/Rin)Vin
  Non-inverting: Vout = (1 + Rf/Rin)Vin
  Applications: Amplifier, comparator, integrator, differentiator.

DIGITAL ELECTRONICS
Number Systems:
  Binary (base 2): 0,1
  Octal (base 8):  0–7
  Hexadecimal (base 16): 0–9,A–F
  Conversions: Binary↔Decimal, Binary↔Hex, Binary↔Octal

Logic Gates:
  AND: Y = A·B       OR: Y = A+B      NOT: Y = A'
  NAND: Y = (A·B)'   NOR: Y = (A+B)'
  XOR: Y = A⊕B = A'B + AB'
  XNOR: Y = (A⊕B)' = A'B' + AB

Boolean Algebra Laws:
  Identity: A+0=A, A·1=A
  Null: A+1=1, A·0=0
  Idempotent: A+A=A, A·A=A
  De Morgan's: (A+B)'=A'B', (A·B)'=A'+B'

Karnaugh Map (K-Map): Simplify Boolean expressions visually.
  Group 1s in groups of 1,2,4,8. Simplify to minimal SOP/POS form.`,

            `PART B — DIGITAL CIRCUITS & COMMUNICATIONS
═══════════════════════════════════════════

COMBINATIONAL CIRCUITS
Half Adder:  Sum = A⊕B,  Carry = AB
Full Adder:  Sum = A⊕B⊕Cin,  Cout = AB + Cin(A⊕B)
Multiplexer (MUX): Many inputs → 1 output (data selector)
Demultiplexer (DEMUX): 1 input → many outputs
Encoder: Converts decimal/octal to binary code
Decoder: Converts binary to decimal/octal

SEQUENTIAL CIRCUITS
Flip-Flops (bistable, memory element):
  SR Flip-flop: Set-Reset. Forbidden state: S=R=1.
  D Flip-flop:  Data. Output follows input at clock edge.
  JK Flip-flop: No forbidden state. Toggle when J=K=1.
  T Flip-flop:  Toggles output on each clock edge.

Registers: Group of flip-flops storing multi-bit data.
  SISO, SIPO, PISO, PIPO (shift registers).

Counters:
  Ripple/Asynchronous: Simple, has propagation delay.
  Synchronous: All FF clocked simultaneously. Faster.
  MOD-N counter: Counts 0 to N-1.

COMMUNICATION BASICS
Modulation: Superimposing information on a carrier wave.
  AM (Amplitude Modulation): Amplitude varies with signal.
  FM (Frequency Modulation): Frequency varies with signal.
    FM is less susceptible to noise than AM.

Digital Modulation:
  ASK (Amplitude Shift Keying)
  FSK (Frequency Shift Keying)
  PSK (Phase Shift Keying)
  QAM (Quadrature Amplitude Modulation) — used in Wi-Fi, 4G/5G`,

            `PART C — COMPUTER ENGINEERING
══════════════════════════════

COMPUTER ORGANISATION
Computer has 5 functional units:
  1. Input Unit        — Keyboard, mouse, scanner
  2. Output Unit       — Monitor, printer, speaker
  3. Memory Unit       — RAM (primary), Hard disk (secondary)
  4. ALU               — Arithmetic & Logic operations
  5. Control Unit (CU) — Directs operations of all units
     CU + ALU = CPU (Central Processing Unit)

MEMORY HIERARCHY
Registers → Cache → RAM → Hard Disk → Optical/Tape
Speed decreases, capacity and cost decrease as we go down.

RAM: Volatile. Data lost when power off. SRAM, DRAM.
ROM: Non-volatile. Stores firmware/BIOS. PROM, EPROM, EEPROM.

BINARY ARITHMETIC
Addition:  0+0=0, 0+1=1, 1+1=10 (sum=0,carry=1)
Subtraction using 2's complement:
  1's complement: invert all bits.
  2's complement: 1's complement + 1.
  A - B = A + (2's complement of B)

DATA REPRESENTATION
Integer: Sign-magnitude, 1's complement, 2's complement.
Floating point: IEEE 754 standard.
  Single precision: 1 sign + 8 exponent + 23 mantissa bits.

CHARACTER CODES
ASCII: 7-bit code, 128 characters (A=65, a=97, 0=48).
Unicode (UTF-8): Supports all world languages.

PROGRAMMING BASICS (C Language)
  #include <stdio.h>
  int main() {
    int a = 10, b = 20;
    printf("Sum = %d", a+b);
    return 0;
  }
Variables, Data types, Control structures (if, for, while),
Functions, Arrays, Pointers — building blocks of C programming.`,
        ],
    },

    {
        id: 'ebook-circuit-theory',
        title: 'Circuit Theory',
        author: 'A. Chakrabarti',
        category: 'Electrical Engineering',
        cover: '🔁',
        isEbook: true,
        ratings: [],
        pages: [
            `CIRCUIT THEORY
══════════════
Author  : A. Chakrabarti
Subject : Network Analysis & Circuit Theory
Level   : 2nd/3rd Year Electrical / Electronics Engineering

PREFACE
Circuit Theory is the mathematics of electrical networks. Starting
from fundamental definitions, this book covers DC circuit analysis,
AC steady-state analysis, network theorems, two-port networks,
network topology, and the Laplace transform method.

Chapters:
  1. Basic Concepts & Circuit Elements
  2. Network Theorems
  3. AC Steady-State Analysis
  4. Resonance
  5. Coupled Circuits & Mutual Inductance
  6. Two-Port Networks
  7. Network Topology
  8. Laplace Transform in Circuit Analysis`,

            `CHAPTER 1 — BASIC CONCEPTS
═══════════════════════════

1.1 CIRCUIT ELEMENTS
Active elements: Supply energy — Voltage source (V), Current source (I).
Passive elements: Absorb/store energy — R, L, C.

Ideal Voltage Source: V is constant regardless of current drawn.
Ideal Current Source: I is constant regardless of voltage across.
Practical sources have internal resistance.

Source Transformation:
  Voltage source V with series R ↔ Current source I=V/R with shunt R.

1.2 ELEMENT RELATIONSHIPS
Resistor:  v = Ri  (power: P = v²/R = i²R)
Inductor:  v = L di/dt  (energy: W = ½Li²)
Capacitor: i = C dv/dt  (energy: W = ½Cv²)

KCL: ΣI = 0 at any node (algebraic sum)
KVL: ΣV = 0 around any loop (algebraic sum)

1.3 MESH & NODAL ANALYSIS
Mesh: Planar circuit. Assign mesh currents. KVL per mesh. Solve [Z][I]=[V].
Nodal: Choose ref. node. Assign node voltages. KCL at nodes. Solve [Y][V]=[I].

Matrix form of Mesh:  [Z][I] = [E]
  Diagonal Zii = sum of all impedances in mesh i.
  Off-diagonal Zij = -(shared impedance between mesh i and j).

Matrix form of Nodal: [Y][V] = [I]
  Diagonal Yii = sum of all admittances at node i.
  Off-diagonal Yij = -(admittance between node i and j).`,

            `CHAPTER 2 — NETWORK THEOREMS
══════════════════════════════

SUPERPOSITION THEOREM
For linear networks with multiple sources:
  Total response = algebraic sum of individual responses.
Steps:
  1. Keep one source, deactivate others (V→short, I→open).
  2. Calculate response.
  3. Repeat for each source.
  4. Algebraically add all responses.
Valid only for linear circuits.

THEVENIN'S THEOREM
Replace any linear two-terminal network with:
  Vth (in series with Rth).
Finding Vth: Open circuit voltage at terminals.
Finding Rth: Deactivate sources; find equivalent resistance.
  (or Rth = Voc/Isc if dependent sources present)

NORTON'S THEOREM
Replace any linear two-terminal network with:
  IN (in parallel with RN).
  IN = Short circuit current, RN = Rth = Vth/IN.

MAXIMUM POWER TRANSFER
For DC: PL is maximum when RL = Rth.
  Pmax = Vth²/(4Rth)
For AC: ZL = Zth* (complex conjugate) for max power.
  If ZL must be purely resistive: RL = |Zth|.

MILLMAN'S THEOREM
For n sources V1,V2,...Vn with series impedances Z1,...Zn:
  Veq = (V1/Z1 + V2/Z2 + ... + Vn/Zn) / (1/Z1 + ... + 1/Zn)
  Zeq = 1/(1/Z1 + ... + 1/Zn)

SUBSTITUTION THEOREM
Any branch in a network can be replaced by a voltage source
equal to the branch voltage or current source equal to branch current.

COMPENSATION THEOREM
Change ΔZ in a branch → change in current ΔI throughout the network
can be calculated by inserting voltage source ΔV = ΔZ × I0.

RECIPROCITY THEOREM
For a linear, bilateral network:
  Ratio of response at one point to excitation at another = same
  when excitation and response points are interchanged.`,

            `CHAPTER 3 — AC STEADY-STATE ANALYSIS
═════════════════════════════════════

3.1 PHASOR REPRESENTATION
Sinusoidal: x(t) = Xm cos(ωt + φ)
Phasor: X = Xm∠φ  (or complex form X = Xm e^jφ)

3.2 IMPEDANCE & ADMITTANCE
Impedance: Z = V/I = R + jX  (Ω)
  XL = ωL  (inductive reactance)
  XC = -1/ωC (capacitive reactance)
Admittance: Y = 1/Z = G + jB  (Siemens)
  G = conductance, B = susceptance

Series RLC: Z = R + j(ωL - 1/ωC)
Parallel RLC: Y = 1/R + j(ωC - 1/ωL)

3.3 BALANCED THREE-PHASE CIRCUITS
Three-phase: three sinusoids 120° apart.
  Phase sequence: RYB (positive) or RBY (negative).

Star (Y) connection:
  Line voltage VL = √3 × Phase voltage VP
  Line current IL = Phase current IP

Delta (Δ) connection:
  Line voltage VL = Phase voltage VP
  Line current IL = √3 × Phase current IP

Star-Delta Conversion:
  Y→Δ:  ZΔ = Z1Z2 + Z2Z3 + Z3Z1 / Zy  (for each branch)
  Δ→Y:  ZY = ZΔ-product / sum of ZΔ

Three-phase power:
  P = √3 × VL × IL × cosφ
  Q = √3 × VL × IL × sinφ
  S = √3 × VL × IL`,

            `CHAPTER 4 — RESONANCE & COUPLED CIRCUITS
══════════════════════════════════════════

4.1 SERIES RESONANCE
Condition: XL = XC  →  ωL = 1/ωC
Resonant frequency: ω0 = 1/√LC  →  f0 = 1/(2π√LC)
At resonance:
  Z = R (minimum, real)
  I = V/R (maximum)
  VL = VC = QR × V (Q times supply voltage!)

Quality factor: Q = ω0L/R = 1/(ω0RC) = (1/R)√(L/C)
Bandwidth: BW = f0/Q = R/L (rad/s)
Half-power frequencies: f1,f2 = f0 ± BW/2

4.2 PARALLEL RESONANCE
Pure LC parallel: resonance at ω0 = 1/√LC, Z = ∞.
Practical (with R in series with L):
  ω0 = √(1/LC - R²/L²)
At resonance: Impedance is maximum, current is minimum.
Dynamic resistance: RD = L/(CR)

4.3 COUPLED CIRCUITS
Two magnetically coupled coils:
  M = k √(L1L2),  k = coupling coefficient (0 to 1)
  k=0: No coupling, k=1: Perfect coupling.

Mesh equations for coupled circuits:
  V1 = Z1I1 ± jωM I2
  V2 = ±jωM I1 + Z2I2
  (+ for aiding, - for opposing flux)

Input impedance with coupling:
  Zin = Z1 + (ωM)²/Z2  (reflected impedance)

4.4 TWO-PORT NETWORKS
Described by port voltages V1,V2 and currents I1,I2.
Z-parameters (open circuit): V = [Z][I]
  Z11=V1/I1|I2=0, Z12=V1/I2|I1=0, etc.
Y-parameters (admittance): I = [Y][V]
H-parameters (hybrid): Used for transistors.
ABCD parameters (transmission): Used for transmission lines.`,

            `CHAPTER 5 — NETWORK TOPOLOGY & LAPLACE TRANSFORM
══════════════════════════════════════════════════

5.1 GRAPH THEORY
Network graph: Nodes (vertices) + Branches (edges).
  Tree: Connected, no loops. Has (N-1) branches for N nodes.
  Co-tree/Link: Branches not in tree.
  Number of links: L = B - (N-1)

Tie-set matrix (circuit/loop): For mesh/loop analysis.
Cut-set matrix: For nodal analysis.

5.2 NETWORK TOPOLOGY ANALYSIS
  Number of independent loops = L = B - N + 1
  Number of independent nodes = N - 1
  Mesh analysis uses loop currents.
  Nodal analysis uses node voltages.

5.3 LAPLACE TRANSFORM IN CIRCUIT ANALYSIS
L{f(t)} = F(s) = ∫₀^∞ f(t)e^(-st) dt

Key transforms:
  Unit step u(t):      1/s
  Ramp t u(t):         1/s²
  Impulse δ(t):        1
  e^(-at)u(t):         1/(s+a)
  sin(ωt)u(t):         ω/(s²+ω²)
  cos(ωt)u(t):         s/(s²+ω²)

Circuit element in s-domain:
  Resistor R:          R (no change)
  Inductor L:          sL (with initial condition LI0 source)
  Capacitor C:         1/sC (with initial condition V0/s)

Initial Value Theorem: f(0+) = lim s→∞ [sF(s)]
Final Value Theorem:   f(∞)  = lim s→0 [sF(s)]

Partial Fraction Expansion:
  Distinct poles: F(s) = K1/(s-p1) + K2/(s-p2) + ...
  Ki = (s-pi)F(s)|s=pi
  Repeated poles require derivative terms.

Transfer Function: H(s) = Vout(s)/Vin(s)
Poles and zeros determine stability and frequency response.`,
        ],
    },
];

// ── Merge into existing ebooks.json ─────────────────────────────────────────
const outFile = path.join(__dirname, '..', 'ebooks.json');
let existing = [];
if (fs.existsSync(outFile)) {
    existing = JSON.parse(fs.readFileSync(outFile, 'utf-8'));
    // Remove any existing copies of these books
    const newIds = BOOKS.map(b => b.id);
    existing = existing.filter(b => !newIds.includes(b.id));
}
const merged = [...existing, ...BOOKS];
fs.writeFileSync(outFile, JSON.stringify(merged, null, 2), 'utf-8');

console.log(`\n✅  Added ${BOOKS.length} engineering books:`);
BOOKS.forEach(b => console.log(`   ${b.cover}  ${b.title}  (${b.pages.length} pages)`));
console.log(`\n📚  Total e-books now: ${merged.length}`);
console.log('🚀  Restart the backend to serve the new books.\n');
