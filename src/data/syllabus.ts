export interface Topic {
  id: string;
  name: string;
  important: boolean;
}

export interface PYQ {
  question: string;
  year: number;
  marks: number;
  repeated: number;
}

export interface Unit {
  id: string;
  name: string;
  weightage: number;
  topics: Topic[];
  pyqs: PYQ[];
  notes: string[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  units: Unit[];
  isLab?: boolean;
  labPrograms?: { title: string; description: string; vivaQuestions: string[] }[];
}

export interface Semester {
  number: number;
  subjects: Subject[];
}

// ---------- helpers ----------
const placeholderUnits = (id: string): Unit[] =>
  Array.from({ length: 4 }, (_, i) => ({
    id: `${id}-u${i + 1}`,
    name: `Unit ${i + 1}`,
    weightage: 25,
    topics: [
      { id: `${id}-u${i + 1}-t1`, name: `Topic ${i + 1}.1`, important: i === 0 },
      { id: `${id}-u${i + 1}-t2`, name: `Topic ${i + 1}.2`, important: false },
      { id: `${id}-u${i + 1}-t3`, name: `Topic ${i + 1}.3`, important: false },
    ],
    pyqs: [],
    notes: ["Detailed notes coming soon..."],
  }));

const sub = (id: string, name: string, code: string, units?: Unit[]): Subject => ({
  id,
  name,
  code,
  units: units ?? placeholderUnits(id),
});

// ---------- rich unit data (kept from previous content) ----------
const dbmsUnits: Unit[] = [
  {
    id: "dbms-u1",
    name: "Unit 1: Database System Architecture & Data Models",
    weightage: 25,
    topics: [
      { id: "dbms-u1-t1", name: "Data Abstraction & Independence", important: true },
      { id: "dbms-u1-t2", name: "DDL & DML", important: true },
      { id: "dbms-u1-t3", name: "ER Model", important: true },
      { id: "dbms-u1-t4", name: "Network & Relational Models", important: false },
      { id: "dbms-u1-t5", name: "Object-Oriented Data Models", important: false },
      { id: "dbms-u1-t6", name: "Integrity Constraints & DML Operations", important: true },
    ],
    pyqs: [
      { question: "Explain 3-level architecture and data independence", year: 2023, marks: 10, repeated: 4 },
      { question: "Draw an ER diagram for a university database", year: 2022, marks: 10, repeated: 3 },
    ],
    notes: [
      "3 levels of abstraction: Physical, Logical, View",
      "DDL: CREATE/ALTER/DROP; DML: SELECT/INSERT/UPDATE/DELETE",
      "ER Model: Entity, Attribute, Relationship",
      "Integrity: Entity, Referential, Domain constraints",
    ],
  },
  {
    id: "dbms-u2",
    name: "Unit 2: Relational Query Languages, Design & Query Optimization",
    weightage: 25,
    topics: [
      { id: "dbms-u2-t1", name: "Relational Algebra", important: true },
      { id: "dbms-u2-t2", name: "Tuple & Domain Relational Calculus", important: true },
      { id: "dbms-u2-t3", name: "SQL3 — DDL & DML constructs", important: true },
      { id: "dbms-u2-t4", name: "MySQL, Oracle, DB2, SQL Server", important: false },
      { id: "dbms-u2-t5", name: "Armstrong's Axioms & Normal Forms", important: true },
      { id: "dbms-u2-t6", name: "Dependency Preservation & Lossless Design", important: true },
      { id: "dbms-u2-t7", name: "Query Equivalence & Join Strategies", important: true },
      { id: "dbms-u2-t8", name: "Query Optimization Algorithms", important: false },
    ],
    pyqs: [
      { question: "Normalize the given relation to BCNF", year: 2023, marks: 10, repeated: 5 },
      { question: "Convert relational algebra expression to SQL", year: 2022, marks: 10, repeated: 3 },
    ],
    notes: [
      "Relational Algebra: σ, π, ⋈, ∪, −, ×",
      "Normal Forms: 1NF → 2NF → 3NF → BCNF → 4NF → 5NF",
      "Join strategies: Nested-loop, Sort-merge, Hash join",
    ],
  },
  {
    id: "dbms-u3",
    name: "Unit 3: Transaction Processing & Storage Strategies",
    weightage: 25,
    topics: [
      { id: "dbms-u3-t1", name: "ACID Properties", important: true },
      { id: "dbms-u3-t2", name: "Serializability of Schedules", important: true },
      { id: "dbms-u3-t3", name: "Locking & Timestamp Schedulers", important: true },
      { id: "dbms-u3-t4", name: "Multi-version & Optimistic CC", important: false },
      { id: "dbms-u3-t5", name: "Database Recovery", important: true },
      { id: "dbms-u3-t6", name: "Indices, B-Trees & Hashing", important: true },
    ],
    pyqs: [
      { question: "Explain ACID with examples", year: 2023, marks: 5, repeated: 4 },
      { question: "Check serializability of a given schedule", year: 2022, marks: 10, repeated: 3 },
    ],
    notes: [
      "ACID: Atomicity, Consistency, Isolation, Durability",
      "2PL: Growing + Shrinking phases",
      "Recovery: Log-based, Shadow paging, Checkpoints",
      "B-Tree: Balanced multi-way search tree for indexing",
    ],
  },
  {
    id: "dbms-u4",
    name: "Unit 4: Database Security & Advanced Topics",
    weightage: 25,
    topics: [
      { id: "dbms-u4-t1", name: "Authentication & Authorization", important: true },
      { id: "dbms-u4-t2", name: "DAC, MAC & RBAC Models", important: true },
      { id: "dbms-u4-t3", name: "Intrusion Detection & SQL Injection", important: true },
      { id: "dbms-u4-t4", name: "Object-Oriented & Object-Relational DBs", important: false },
      { id: "dbms-u4-t5", name: "Distributed & Web Databases", important: true },
      { id: "dbms-u4-t6", name: "Data Warehousing & Data Mining", important: true },
    ],
    pyqs: [
      { question: "Explain DAC, MAC and RBAC with examples", year: 2023, marks: 10, repeated: 3 },
      { question: "What is SQL injection? How to prevent it?", year: 2022, marks: 5, repeated: 4 },
    ],
    notes: [
      "DAC: owner-controlled; MAC: system-enforced labels; RBAC: role-based",
      "SQL Injection: use parameterized queries / prepared statements",
      "OLTP vs OLAP; ETL pipelines for warehousing",
    ],
  },
];

const deUnits: Unit[] = [
  {
    id: "de-u1",
    name: "Unit 1: Fundamentals of Digital Systems & Logic Families",
    weightage: 25,
    topics: [
      { id: "de-u1-t1", name: "Digital Signals & Circuits", important: false },
      { id: "de-u1-t2", name: "Logic Gates (AND/OR/NOT/NAND/NOR/XOR)", important: true },
      { id: "de-u1-t3", name: "Boolean Algebra", important: true },
      { id: "de-u1-t4", name: "Number Systems (Binary/Octal/Hex)", important: true },
      { id: "de-u1-t5", name: "1's & 2's Complement Arithmetic", important: true },
      { id: "de-u1-t6", name: "Codes & Error Detection/Correction", important: true },
    ],
    pyqs: [
      { question: "Perform binary subtraction using 2's complement", year: 2023, marks: 5, repeated: 4 },
      { question: "Explain Hamming code for error correction", year: 2022, marks: 10, repeated: 3 },
    ],
    notes: [
      "Universal gates: NAND, NOR",
      "2's complement = 1's complement + 1",
      "Hamming code: parity bits at 2^k positions",
    ],
  },
  {
    id: "de-u2",
    name: "Unit 2: Combinational Digital Circuits",
    weightage: 25,
    topics: [
      { id: "de-u2-t1", name: "K-Map Simplification & Don't Cares", important: true },
      { id: "de-u2-t2", name: "MUX, DEMUX, Decoders", important: true },
      { id: "de-u2-t3", name: "Adders, Subtractors & BCD Arithmetic", important: true },
      { id: "de-u2-t4", name: "Carry Look-Ahead & Serial Adder", important: true },
      { id: "de-u2-t5", name: "ALU & MSI Chips", important: false },
      { id: "de-u2-t6", name: "Comparators, Parity, Code Converters", important: false },
      { id: "de-u2-t7", name: "Quine-McCluskey Method", important: true },
    ],
    pyqs: [
      { question: "Simplify the given function using K-map", year: 2023, marks: 10, repeated: 5 },
      { question: "Design a 4-bit carry look-ahead adder", year: 2022, marks: 10, repeated: 3 },
    ],
    notes: [
      "SOP and POS standard forms",
      "MUX: 2^n inputs → 1 output; DEMUX: 1 → 2^n",
      "Q-M: tabular method for >5 variable minimization",
    ],
  },
  {
    id: "de-u3",
    name: "Unit 3: Sequential Circuits & Systems",
    weightage: 25,
    topics: [
      { id: "de-u3-t1", name: "Bistable Latch & SR Flip-Flop", important: true },
      { id: "de-u3-t2", name: "JK, T, D Flip-Flops", important: true },
      { id: "de-u3-t3", name: "Shift Registers & Converters", important: true },
      { id: "de-u3-t4", name: "Ring Counter & Sequence Generator", important: false },
      { id: "de-u3-t5", name: "Asynchronous & Synchronous Counters", important: true },
      { id: "de-u3-t6", name: "Counter Design using Flip-Flops", important: true },
    ],
    pyqs: [
      { question: "Design a mod-10 synchronous counter using JK flip-flops", year: 2023, marks: 10, repeated: 4 },
      { question: "Differentiate ripple and synchronous counters", year: 2022, marks: 5, repeated: 3 },
    ],
    notes: [
      "Latch: level-triggered; Flip-flop: edge-triggered",
      "JK = SR with race condition removed",
      "Synchronous counters share a common clock",
    ],
  },
  {
    id: "de-u4",
    name: "Unit 4: A/D and D/A Converters",
    weightage: 25,
    topics: [
      { id: "de-u4-t1", name: "Weighted Resistor & R-2R Ladder DAC", important: true },
      { id: "de-u4-t2", name: "DAC Specifications & ICs", important: false },
      { id: "de-u4-t3", name: "Sample & Hold Circuit", important: true },
      { id: "de-u4-t4", name: "Quantization & Encoding", important: true },
      { id: "de-u4-t5", name: "Parallel Comparator (Flash) ADC", important: true },
      { id: "de-u4-t6", name: "Successive Approximation ADC", important: true },
      { id: "de-u4-t7", name: "Counting & Dual-Slope ADC", important: true },
    ],
    pyqs: [
      { question: "Explain R-2R ladder DAC with diagram", year: 2023, marks: 10, repeated: 4 },
      { question: "Compare flash and successive approximation ADC", year: 2022, marks: 10, repeated: 3 },
    ],
    notes: [
      "Resolution = V_ref / 2^n",
      "Flash ADC: fastest, 2^n - 1 comparators",
      "Dual-slope: high accuracy, slow, noise-immune",
    ],
  },
];

const adsUnits: Unit[] = [
  {
    id: "ads-u1",
    name: "Unit 1: Review of Linear DS, Dictionaries & Hashing",
    weightage: 25,
    topics: [
      { id: "ads-u1-t1", name: "Linked List Operations", important: true },
      { id: "ads-u1-t2", name: "Doubly & Circular Linked List", important: true },
      { id: "ads-u1-t3", name: "Stack/Queue using Linked List", important: true },
      { id: "ads-u1-t4", name: "Dictionary ADT", important: false },
      { id: "ads-u1-t5", name: "Hash Functions", important: true },
      { id: "ads-u1-t6", name: "Collision Resolution (Chaining, Open Addressing)", important: true },
      { id: "ads-u1-t7", name: "Linear/Quadratic/Double Hashing", important: true },
      { id: "ads-u1-t8", name: "Rehashing & Extendible Hashing", important: false },
    ],
    pyqs: [
      { question: "Insert keys into a hash table using quadratic probing", year: 2023, marks: 10, repeated: 4 },
      { question: "Write algorithm for insertion in doubly linked list", year: 2022, marks: 10, repeated: 3 },
    ],
    notes: [
      "Good hash: uniform, deterministic, fast",
      "Chaining: linked list at each bucket",
      "Load factor α = n/m",
    ],
  },
  {
    id: "ads-u2",
    name: "Unit 2: Advanced Trees",
    weightage: 25,
    topics: [
      { id: "ads-u2-t1", name: "BST Review", important: false },
      { id: "ads-u2-t2", name: "AVL Trees & Rotations (LL/RR/LR/RL)", important: true },
      { id: "ads-u2-t3", name: "Red-Black Trees", important: true },
      { id: "ads-u2-t4", name: "2-3 Trees", important: true },
      { id: "ads-u2-t5", name: "B-Trees & B+ Trees", important: true },
      { id: "ads-u2-t6", name: "Splay Trees", important: false },
    ],
    pyqs: [
      { question: "Insert keys into AVL tree and show rotations", year: 2023, marks: 10, repeated: 5 },
      { question: "Differentiate B-tree and B+ tree", year: 2022, marks: 5, repeated: 4 },
    ],
    notes: [
      "AVL: |balance factor| ≤ 1",
      "Red-Black: O(log n) guaranteed",
      "B+ trees store data only in leaves (used in DBs)",
    ],
  },
  {
    id: "ads-u3",
    name: "Unit 3: Sets & Files",
    weightage: 25,
    topics: [
      { id: "ads-u3-t1", name: "Set Representation & Operations", important: true },
      { id: "ads-u3-t2", name: "Applications of Sets", important: false },
      { id: "ads-u3-t3", name: "File Concepts & Organization", important: true },
      { id: "ads-u3-t4", name: "Files and Streams (I/O)", important: false },
      { id: "ads-u3-t5", name: "Sequential File Organization", important: true },
      { id: "ads-u3-t6", name: "Direct File Organization", important: true },
      { id: "ads-u3-t7", name: "Indexed Sequential Organization", important: true },
    ],
    pyqs: [
      { question: "Compare sequential, direct and indexed sequential files", year: 2023, marks: 10, repeated: 3 },
      { question: "Explain set operations with examples", year: 2022, marks: 5, repeated: 2 },
    ],
    notes: ["Set ops: union, intersection, difference", "ISAM = index + sequential"],
  },
  {
    id: "ads-u4",
    name: "Unit 4: Graphs",
    weightage: 25,
    topics: [
      { id: "ads-u4-t1", name: "Graph Representation (Matrix/List)", important: true },
      { id: "ads-u4-t2", name: "BFS & DFS Traversal", important: true },
      { id: "ads-u4-t3", name: "Connected Components", important: false },
      { id: "ads-u4-t4", name: "Topological Sort", important: true },
      { id: "ads-u4-t5", name: "Dijkstra's Algorithm", important: true },
      { id: "ads-u4-t6", name: "Floyd-Warshall Algorithm", important: true },
      { id: "ads-u4-t7", name: "Network Flow Problems", important: false },
    ],
    pyqs: [
      { question: "Find shortest path using Dijkstra's algorithm", year: 2023, marks: 10, repeated: 5 },
      { question: "Apply Floyd-Warshall on given graph", year: 2022, marks: 10, repeated: 4 },
    ],
    notes: [
      "Adjacency matrix: O(V²) space; list: O(V+E)",
      "Dijkstra: no negative edges",
      "Floyd-Warshall: all-pairs shortest path O(V³)",
    ],
  },
];

const cppUnits: Unit[] = [
  {
    id: "cpp-u1",
    name: "Unit 1: OOP Concepts, Classes & Objects",
    weightage: 25,
    topics: [
      { id: "cpp-u1-t1", name: "Procedural vs OOP Paradigm", important: true },
      { id: "cpp-u1-t2", name: "Objects, Classes & Abstraction", important: true },
      { id: "cpp-u1-t3", name: "Encapsulation, Inheritance, Polymorphism", important: true },
      { id: "cpp-u1-t4", name: "Specifying a Class & Access Specifiers", important: true },
      { id: "cpp-u1-t5", name: "Static Members & const Keyword", important: false },
      { id: "cpp-u1-t6", name: "Friend Functions & Nested Classes", important: true },
      { id: "cpp-u1-t7", name: "Abstract & Container Classes", important: false },
    ],
    pyqs: [
      { question: "Differentiate procedural and OOP with examples", year: 2023, marks: 5, repeated: 4 },
      { question: "Explain friend function with program", year: 2022, marks: 10, repeated: 3 },
    ],
    notes: [
      "4 OOP pillars: Encapsulation, Inheritance, Polymorphism, Abstraction",
      "Access: private, protected, public",
      "Static members shared across all instances",
    ],
  },
  {
    id: "cpp-u2",
    name: "Unit 2: Inheritance & Pointers / Dynamic Memory",
    weightage: 25,
    topics: [
      { id: "cpp-u2-t1", name: "Forms of Inheritance", important: true },
      { id: "cpp-u2-t2", name: "Multiple & Multipath Inheritance Ambiguity", important: true },
      { id: "cpp-u2-t3", name: "Virtual Base Class", important: true },
      { id: "cpp-u2-t4", name: "Object Slicing & Composition", important: false },
      { id: "cpp-u2-t5", name: "Pointers & Pointer Arithmetic", important: true },
      { id: "cpp-u2-t6", name: "new / delete & this Pointer", important: true },
      { id: "cpp-u2-t7", name: "Dangling Pointers & Memory Leaks", important: true },
    ],
    pyqs: [
      { question: "Demonstrate virtual base class with program", year: 2023, marks: 10, repeated: 4 },
      { question: "Explain dangling pointer with example", year: 2022, marks: 5, repeated: 3 },
    ],
    notes: [
      "Diamond problem solved via virtual inheritance",
      "new returns pointer; delete frees memory",
      "Memory leak: heap memory not freed",
    ],
  },
  {
    id: "cpp-u3",
    name: "Unit 3: Constructors, Operator Overloading & Polymorphism",
    weightage: 25,
    topics: [
      { id: "cpp-u3-t1", name: "Constructors & Destructors", important: true },
      { id: "cpp-u3-t2", name: "Copy & Dynamic Constructors", important: true },
      { id: "cpp-u3-t3", name: "Explicit Constructors & Initializer Lists", important: false },
      { id: "cpp-u3-t4", name: "Operator Overloading Rules", important: true },
      { id: "cpp-u3-t5", name: "Type Conversion", important: true },
      { id: "cpp-u3-t6", name: "Early vs Late Binding", important: true },
      { id: "cpp-u3-t7", name: "Virtual & Pure Virtual Functions", important: true },
      { id: "cpp-u3-t8", name: "Virtual Destructors", important: false },
    ],
    pyqs: [
      { question: "Overload + operator for complex numbers", year: 2023, marks: 10, repeated: 5 },
      { question: "Explain pure virtual function with example", year: 2022, marks: 10, repeated: 3 },
    ],
    notes: [
      "Copy constructor: deep vs shallow copy",
      "Cannot overload: ::, ., .*, ?:, sizeof",
      "Abstract class: ≥1 pure virtual function",
    ],
  },
  {
    id: "cpp-u4",
    name: "Unit 4: Exception Handling & Templates",
    weightage: 25,
    topics: [
      { id: "cpp-u4-t1", name: "Exception Handling Mechanism", important: true },
      { id: "cpp-u4-t2", name: "try / throw / catch", important: true },
      { id: "cpp-u4-t3", name: "Rethrowing & Exception Specification", important: false },
      { id: "cpp-u4-t4", name: "Function Templates", important: true },
      { id: "cpp-u4-t5", name: "Class Templates", important: true },
    ],
    pyqs: [
      { question: "Write a class template for a stack", year: 2023, marks: 10, repeated: 4 },
      { question: "Explain exception handling with try-catch program", year: 2022, marks: 10, repeated: 4 },
    ],
    notes: [
      "throw raises exception; catch handles it",
      "Templates enable generic programming",
      "Function template: template<typename T>",
    ],
  },
];

const calUnits: Unit[] = [
  {
    id: "cal-u1",
    name: "Unit 1: Multivariable Differential Calculus",
    weightage: 25,
    topics: [
      { id: "cal-u1-t1", name: "Limit & Continuity", important: true },
      { id: "cal-u1-t2", name: "Partial Derivatives", important: true },
      { id: "cal-u1-t3", name: "Homogeneous Functions & Euler's Theorem", important: true },
      { id: "cal-u1-t4", name: "Total Derivative", important: true },
      { id: "cal-u1-t5", name: "Maxima, Minima & Saddle Points", important: true },
      { id: "cal-u1-t6", name: "Lagrange's Multipliers", important: true },
    ],
    pyqs: [
      { question: "Verify Euler's theorem for given homogeneous function", year: 2023, marks: 10, repeated: 5 },
      { question: "Find maxima/minima using Lagrange's multipliers", year: 2022, marks: 10, repeated: 4 },
    ],
    notes: ["Euler's theorem: x∂u/∂x + y∂u/∂y = nu", "Saddle: rt − s² < 0", "Lagrange: ∇f = λ∇g"],
  },
  {
    id: "cal-u2",
    name: "Unit 2: Multivariable Integral Calculus",
    weightage: 25,
    topics: [
      { id: "cal-u2-t1", name: "Double Integrals", important: true },
      { id: "cal-u2-t2", name: "Change of Order of Integration", important: true },
      { id: "cal-u2-t3", name: "Change of Variables (Jacobian)", important: true },
      { id: "cal-u2-t4", name: "Area Enclosed by Plane Curves", important: true },
      { id: "cal-u2-t5", name: "Triple Integrals", important: true },
    ],
    pyqs: [
      { question: "Evaluate double integral by changing order", year: 2023, marks: 10, repeated: 5 },
      { question: "Find area enclosed between two curves", year: 2022, marks: 10, repeated: 3 },
    ],
    notes: ["Jacobian J = ∂(x,y)/∂(u,v)", "Polar: dx dy = r dr dθ"],
  },
  {
    id: "cal-u3",
    name: "Unit 3: ODEs of First Order",
    weightage: 25,
    topics: [
      { id: "cal-u3-t1", name: "Linear & Bernoulli Equations", important: true },
      { id: "cal-u3-t2", name: "Exact Differential Equations", important: true },
      { id: "cal-u3-t3", name: "Reducible to Exact (Integrating Factor)", important: true },
      { id: "cal-u3-t4", name: "Applications: Electric Circuits", important: true },
      { id: "cal-u3-t5", name: "Newton's Law of Cooling", important: true },
      { id: "cal-u3-t6", name: "Orthogonal Trajectories", important: false },
    ],
    pyqs: [
      { question: "Solve Bernoulli's differential equation", year: 2023, marks: 10, repeated: 4 },
      { question: "Apply Newton's law of cooling problem", year: 2022, marks: 5, repeated: 3 },
    ],
    notes: ["Linear form: dy/dx + Py = Q", "Exact: ∂M/∂y = ∂N/∂x", "IF for linear ODE: e^∫P dx"],
  },
  {
    id: "cal-u4",
    name: "Unit 4: ODEs of Second & Higher Order",
    weightage: 25,
    topics: [
      { id: "cal-u4-t1", name: "Linear ODEs of Higher Order", important: true },
      { id: "cal-u4-t2", name: "CF + PI (Complete Solution)", important: true },
      { id: "cal-u4-t3", name: "Method of Variation of Parameters", important: true },
      { id: "cal-u4-t4", name: "Cauchy & Legendre Linear Equations", important: true },
      { id: "cal-u4-t5", name: "Simultaneous Linear ODEs", important: false },
      { id: "cal-u4-t6", name: "Applications: Oscillatory Circuits", important: true },
    ],
    pyqs: [
      { question: "Solve second-order ODE using variation of parameters", year: 2023, marks: 10, repeated: 5 },
      { question: "Solve Cauchy's homogeneous linear equation", year: 2022, marks: 10, repeated: 4 },
    ],
    notes: ["Complete solution = CF + PI", "Cauchy form: x²y'' + xy' + y = f(x)", "Substitute x = e^t for constant coeff"],
  },
];

const aimlUnits: Unit[] = [
  {
    id: "aiml-u1",
    name: "Unit 1: Introduction to AI & Machine Learning",
    weightage: 25,
    topics: [
      { id: "aiml-u1-t1", name: "What is AI & Turing Test", important: true },
      { id: "aiml-u1-t2", name: "History & AI Techniques", important: false },
      { id: "aiml-u1-t3", name: "Advantages, Limitations & Impact of AI", important: true },
      { id: "aiml-u1-t4", name: "Applications of AI by Domain", important: true },
      { id: "aiml-u1-t5", name: "Introduction to Machine Learning", important: true },
      { id: "aiml-u1-t6", name: "Supervised / Unsupervised / Semi / RL", important: true },
    ],
    pyqs: [
      { question: "Explain Turing test and its limitations", year: 2023, marks: 5, repeated: 4 },
      { question: "Differentiate supervised and unsupervised learning", year: 2022, marks: 10, repeated: 5 },
    ],
    notes: ["AI types: Narrow, General, Super", "ML = Statistics + CS + Optimization", "RL = agent + environment + reward"],
  },
  {
    id: "aiml-u2",
    name: "Unit 2: Intelligent & Multi-Agent Systems",
    weightage: 25,
    topics: [
      { id: "aiml-u2-t1", name: "Nature of Agents & Rationality", important: true },
      { id: "aiml-u2-t2", name: "Task Environment & Properties", important: true },
      { id: "aiml-u2-t3", name: "Types of Agents", important: true },
      { id: "aiml-u2-t4", name: "Agents vs Objects vs Expert Systems", important: false },
      { id: "aiml-u2-t5", name: "Multi-Agent System Structure", important: true },
      { id: "aiml-u2-t6", name: "Semantic Web & Ontologies", important: false },
      { id: "aiml-u2-t7", name: "Agent Communication & Tools", important: false },
    ],
    pyqs: [
      { question: "Describe PEAS for an autonomous taxi agent", year: 2023, marks: 10, repeated: 4 },
      { question: "Explain types of agents with examples", year: 2022, marks: 10, repeated: 3 },
    ],
    notes: ["PEAS: Performance, Environment, Actuators, Sensors", "Agent types: Simple reflex, Model-based, Goal-based, Utility-based, Learning"],
  },
  {
    id: "aiml-u3",
    name: "Unit 3: Knowledge Representation & Reasoning",
    weightage: 25,
    topics: [
      { id: "aiml-u3-t1", name: "Procedural vs Declarative Knowledge", important: true },
      { id: "aiml-u3-t2", name: "Matching & Conflict Resolution", important: false },
      { id: "aiml-u3-t3", name: "Propositional & Predicate Logic", important: true },
      { id: "aiml-u3-t4", name: "Resolution & Unification", important: true },
      { id: "aiml-u3-t5", name: "Bayesian Probability & Belief Networks", important: true },
      { id: "aiml-u3-t6", name: "Forward & Backward Reasoning", important: true },
      { id: "aiml-u3-t7", name: "Fuzzy Logic & Dempster-Shafer", important: true },
    ],
    pyqs: [
      { question: "Apply unification on given expressions", year: 2023, marks: 10, repeated: 5 },
      { question: "Explain Bayesian belief network with example", year: 2022, marks: 10, repeated: 4 },
    ],
    notes: ["Resolution: proof by refutation", "Bayes: P(A|B) = P(B|A)P(A)/P(B)", "Fuzzy: degree of truth in [0,1]"],
  },
  {
    id: "aiml-u4",
    name: "Unit 4: Planning & Learning",
    weightage: 25,
    topics: [
      { id: "aiml-u4-t1", name: "Planning Problem & State Space Search", important: true },
      { id: "aiml-u4-t2", name: "Partial Order & Planning Graphs", important: true },
      { id: "aiml-u4-t3", name: "Hierarchical & Conditional Planning", important: false },
      { id: "aiml-u4-t4", name: "Continuous & Multi-Agent Planning", important: false },
      { id: "aiml-u4-t5", name: "Types of Learning", important: true },
      { id: "aiml-u4-t6", name: "Identification Trees & EBL", important: true },
      { id: "aiml-u4-t7", name: "Neural Networks & Expert Systems", important: true },
    ],
    pyqs: [
      { question: "Explain partial-order planning with example", year: 2023, marks: 10, repeated: 4 },
      { question: "Differentiate rote learning and inductive learning", year: 2022, marks: 5, repeated: 3 },
    ],
    notes: ["STRIPS: actions with preconditions & effects", "ID3: information gain based tree induction", "Expert system = KB + Inference engine"],
  },
];

const osUnits: Unit[] = [
  {
    id: "os-u1", name: "Unit 1: OS Fundamentals", weightage: 20,
    topics: [
      { id: "os-u1-t1", name: "Types of OS", important: false },
      { id: "os-u1-t2", name: "System Calls", important: true },
      { id: "os-u1-t3", name: "Process Concepts", important: true },
      { id: "os-u1-t4", name: "Process States & PCB", important: true },
    ],
    pyqs: [{ question: "Describe process states with diagram", year: 2022, marks: 5, repeated: 3 }],
    notes: ["OS Types: Batch, Time-sharing, Distributed, Real-time", "Process states: New, Ready, Running, Waiting, Terminated"],
  },
  {
    id: "os-u2", name: "Unit 2: CPU Scheduling & Synchronization", weightage: 30,
    topics: [
      { id: "os-u2-t1", name: "Scheduling Algorithms (FCFS, SJF, RR)", important: true },
      { id: "os-u2-t2", name: "Process Synchronization", important: true },
      { id: "os-u2-t3", name: "Semaphores & Mutex", important: true },
      { id: "os-u2-t4", name: "Classical Sync Problems", important: true },
    ],
    pyqs: [{ question: "Solve scheduling problem using Round Robin", year: 2023, marks: 10, repeated: 5 }],
    notes: ["FCFS: Non-preemptive, convoy effect", "SJF: Optimal avg waiting time", "RR: Time quantum based"],
  },
  {
    id: "os-u3", name: "Unit 3: Memory Management", weightage: 25,
    topics: [
      { id: "os-u3-t1", name: "Paging & Segmentation", important: true },
      { id: "os-u3-t2", name: "Virtual Memory", important: true },
      { id: "os-u3-t3", name: "Page Replacement Algorithms", important: true },
      { id: "os-u3-t4", name: "Thrashing", important: false },
    ],
    pyqs: [{ question: "Solve page replacement using LRU", year: 2023, marks: 10, repeated: 4 }],
    notes: ["Paging: Fixed-size blocks", "Page Replacement: FIFO, LRU, Optimal", "Thrashing: Excessive paging"],
  },
  {
    id: "os-u4", name: "Unit 4: Deadlocks & File Systems", weightage: 25,
    topics: [
      { id: "os-u4-t1", name: "Deadlock Conditions & Prevention", important: true },
      { id: "os-u4-t2", name: "Banker's Algorithm", important: true },
      { id: "os-u4-t3", name: "File System Structure", important: false },
      { id: "os-u4-t4", name: "Disk Scheduling", important: true },
    ],
    pyqs: [{ question: "Apply Banker's algorithm to check safe state", year: 2023, marks: 10, repeated: 5 }],
    notes: ["Deadlock conditions: Mutual exclusion, Hold & Wait, No Preemption, Circular Wait"],
  },
];

const cnUnits: Unit[] = [
  {
    id: "cn-u1", name: "Unit 1: Network Fundamentals", weightage: 20,
    topics: [
      { id: "cn-u1-t1", name: "OSI & TCP/IP Models", important: true },
      { id: "cn-u1-t2", name: "Network Topologies", important: false },
      { id: "cn-u1-t3", name: "Transmission Media", important: false },
      { id: "cn-u1-t4", name: "Switching Techniques", important: true },
    ],
    pyqs: [{ question: "Compare OSI and TCP/IP models", year: 2023, marks: 10, repeated: 4 }],
    notes: ["OSI: 7 layers", "TCP/IP: 4 layers"],
  },
  {
    id: "cn-u2", name: "Unit 2: Data Link Layer", weightage: 25,
    topics: [
      { id: "cn-u2-t1", name: "Error Detection & Correction", important: true },
      { id: "cn-u2-t2", name: "Flow Control Protocols", important: true },
      { id: "cn-u2-t3", name: "MAC Protocols", important: true },
      { id: "cn-u2-t4", name: "Ethernet & LAN", important: false },
    ],
    pyqs: [{ question: "Explain sliding window protocol", year: 2023, marks: 10, repeated: 3 }],
    notes: ["Error Detection: Parity, Checksum, CRC", "Flow Control: Stop-and-Wait, Go-Back-N, Selective Repeat"],
  },
  {
    id: "cn-u3", name: "Unit 3: Network Layer", weightage: 30,
    topics: [
      { id: "cn-u3-t1", name: "IP Addressing & Subnetting", important: true },
      { id: "cn-u3-t2", name: "Routing Algorithms", important: true },
      { id: "cn-u3-t3", name: "IPv4 vs IPv6", important: false },
      { id: "cn-u3-t4", name: "ARP, RARP, ICMP", important: true },
    ],
    pyqs: [{ question: "Solve subnetting problem for given IP address", year: 2023, marks: 10, repeated: 5 }],
    notes: ["IP Classes: A, B, C", "Routing: Distance Vector (RIP), Link State (OSPF)"],
  },
  {
    id: "cn-u4", name: "Unit 4: Transport & Application Layer", weightage: 25,
    topics: [
      { id: "cn-u4-t1", name: "TCP vs UDP", important: true },
      { id: "cn-u4-t2", name: "TCP Congestion Control", important: true },
      { id: "cn-u4-t3", name: "DNS, HTTP, FTP", important: false },
      { id: "cn-u4-t4", name: "Socket Programming", important: false },
    ],
    pyqs: [{ question: "Explain TCP 3-way handshake", year: 2022, marks: 5, repeated: 4 }],
    notes: ["TCP: Connection-oriented, reliable", "UDP: Connectionless, fast"],
  },
];

const javaUnits: Unit[] = [
  {
    id: "java-u1", name: "Unit 1: OOP Fundamentals", weightage: 25,
    topics: [
      { id: "java-u1-t1", name: "Classes & Objects", important: true },
      { id: "java-u1-t2", name: "Constructors & Overloading", important: true },
      { id: "java-u1-t3", name: "Inheritance & Polymorphism", important: true },
      { id: "java-u1-t4", name: "Abstraction & Encapsulation", important: false },
    ],
    pyqs: [{ question: "Write a program demonstrating inheritance types", year: 2023, marks: 10, repeated: 3 }],
    notes: ["4 OOP pillars: Encapsulation, Inheritance, Polymorphism, Abstraction"],
  },
  {
    id: "java-u2", name: "Unit 2: Exception Handling & I/O", weightage: 20,
    topics: [
      { id: "java-u2-t1", name: "Try-Catch-Finally", important: true },
      { id: "java-u2-t2", name: "Custom Exceptions", important: false },
      { id: "java-u2-t3", name: "File I/O Streams", important: true },
      { id: "java-u2-t4", name: "Serialization", important: false },
    ],
    pyqs: [{ question: "Write a program with custom exception handling", year: 2023, marks: 10, repeated: 2 }],
    notes: ["Checked: compile-time", "Unchecked: runtime"],
  },
  {
    id: "java-u3", name: "Unit 3: Collections & Generics", weightage: 30,
    topics: [
      { id: "java-u3-t1", name: "List, Set, Map Interfaces", important: true },
      { id: "java-u3-t2", name: "ArrayList vs LinkedList", important: true },
      { id: "java-u3-t3", name: "HashMap & TreeMap", important: true },
      { id: "java-u3-t4", name: "Generics & Wildcards", important: false },
    ],
    pyqs: [{ question: "Compare ArrayList and LinkedList with code", year: 2023, marks: 10, repeated: 3 }],
    notes: ["Collection hierarchy: Collection → List, Set, Queue"],
  },
  {
    id: "java-u4", name: "Unit 4: Multithreading & JDBC", weightage: 25,
    topics: [
      { id: "java-u4-t1", name: "Thread Creation & Lifecycle", important: true },
      { id: "java-u4-t2", name: "Synchronization", important: true },
      { id: "java-u4-t3", name: "JDBC Basics", important: true },
      { id: "java-u4-t4", name: "Prepared Statements", important: false },
    ],
    pyqs: [{ question: "Write a multithreaded program using Runnable", year: 2023, marks: 10, repeated: 3 }],
    notes: ["Thread states: New, Runnable, Running, Blocked, Dead"],
  },
];

const daaUnits: Unit[] = [
  {
    id: "daa-u1", name: "Unit 1: Fundamentals & Divide-Conquer", weightage: 25,
    topics: [
      { id: "daa-u1-t1", name: "Asymptotic Notations", important: true },
      { id: "daa-u1-t2", name: "Recurrence Relations", important: true },
      { id: "daa-u1-t3", name: "Merge Sort & Quick Sort", important: true },
      { id: "daa-u1-t4", name: "Master Theorem", important: true },
    ],
    pyqs: [{ question: "Solve recurrence using Master theorem", year: 2023, marks: 10, repeated: 4 }],
    notes: ["Master Theorem: T(n) = aT(n/b) + f(n)"],
  },
  {
    id: "daa-u2", name: "Unit 2: Greedy & Dynamic Programming", weightage: 30,
    topics: [
      { id: "daa-u2-t1", name: "Greedy Strategy", important: true },
      { id: "daa-u2-t2", name: "Huffman Coding", important: true },
      { id: "daa-u2-t3", name: "0/1 Knapsack", important: true },
      { id: "daa-u2-t4", name: "LCS & Matrix Chain", important: true },
    ],
    pyqs: [{ question: "Solve 0/1 Knapsack using DP", year: 2023, marks: 10, repeated: 5 }],
    notes: ["Greedy: Local optimal → Global optimal", "DP: Overlapping subproblems + Optimal substructure"],
  },
  {
    id: "daa-u3", name: "Unit 3: Graph Algorithms", weightage: 25,
    topics: [
      { id: "daa-u3-t1", name: "BFS & DFS", important: true },
      { id: "daa-u3-t2", name: "MST (Prim's, Kruskal's)", important: true },
      { id: "daa-u3-t3", name: "Shortest Path (Dijkstra, Bellman-Ford)", important: true },
    ],
    pyqs: [{ question: "Find MST using Kruskal's algorithm", year: 2023, marks: 10, repeated: 4 }],
    notes: ["BFS: Queue", "DFS: Stack/recursion", "Dijkstra: No negative weights"],
  },
  {
    id: "daa-u4", name: "Unit 4: Backtracking & NP", weightage: 20,
    topics: [
      { id: "daa-u4-t1", name: "N-Queens Problem", important: true },
      { id: "daa-u4-t2", name: "NP-Complete & NP-Hard", important: true },
      { id: "daa-u4-t3", name: "Branch & Bound", important: false },
    ],
    pyqs: [{ question: "Solve 4-Queens problem using backtracking", year: 2023, marks: 10, repeated: 3 }],
    notes: ["Backtracking: Try → Check → Undo", "P ⊆ NP"],
  },
];

// ---------- semesters ----------
const semesters: Semester[] = [
  {
    number: 1,
    subjects: [
      sub("cse101", "Programming for Problem Solving using C", "CSE-101"),
      sub("bsm101", "Mathematics-I", "BSM-101"),
      sub("bsp101", "Physics", "BSP-101"),
      sub("hse101", "Communication Skills in English", "HSE-101"),
      sub("env101", "Basics of Environmental Science", "ENV-101"),
    ],
  },
  {
    number: 2,
    subjects: [
      sub("bsm102", "Mathematics-II", "BSM-102"),
      sub("hsv102", "Human Values & Soft Skills", "HSV-102"),
      sub("eee101", "Basics of Electrical & Electronics Engineering", "EEE-101"),
      sub("cse102", "Data Structures using C", "CSE-102"),
      sub("cse104", "Object Oriented Concepts & Python Programming", "CSE-104"),
    ],
  },
  {
    number: 3,
    subjects: [
      sub("digital-electronics", "Digital Electronics", "CSE-201", deUnits),
      sub("ads", "Advanced Data Structures", "CSE-203", adsUnits),
      sub("dbms", "Database Management Systems with SQL", "CSE-205", dbmsUnits),
      sub("cpp", "Programming with C++", "CSE-207", cppUnits),
      sub("intro-aiml", "Introduction to AI and ML", "CSE-209", aimlUnits),
      sub("calculus-ode", "Calculus & Ordinary Differential Equations", "BSM-201", calUnits),
    ],
  },
  {
    number: 4,
    subjects: [
      sub("os", "Operating System", "CSE-202", osUnits),
      sub("r-prog", "R-Programming", "CSE-204"),
      sub("java", "Programming in Java", "CSE-206", javaUnits),
      sub("mpmc", "Microprocessor & Microcontroller", "CSE-208"),
      sub("dm", "Discrete Mathematics", "BSM-202"),
      sub("coa", "Computer Organization & Architecture", "CSE-210"),
    ],
  },
  {
    number: 5,
    subjects: [
      sub("daa", "Design & Analysis of Algorithms", "CSE-301", daaUnits),
      sub("flat", "Formal Languages & Automata", "CSE-303"),
      sub("web-tech", "Web Technology", "CSE-305"),
      sub("cn", "Computer Networks", "CSE-307", cnUnits),
      sub("cloud", "Cloud Computing", "CSE-309"),
      sub("pt1", "Practical Training 1", "CSE-311"),
    ],
  },
  {
    number: 6,
    subjects: [
      sub("compiler", "Compiler Design", "CSE-302"),
      sub("adv-java", "Advanced Java Programming", "CSE-304"),
      sub("ml-apps", "Machine Learning and its Applications", "CSE-306"),
      sub("iot", "Internet of Things", "CSE-308"),
      sub("mad", "Mobile Application Development", "CSE-310"),
      sub("project1", "Project 1", "CSE-312"),
    ],
  },
  {
    number: 7,
    subjects: [
      sub("nn", "Neural Networks", "CSE-401"),
      sub("ob", "Organizational Behaviour", "HSE-401"),
      sub("aca", "Advanced Computer Architecture", "CSE-403"),
      sub("data-science", "Data Science", "CSE-405"),
      sub("project2", "Project 2", "CSE-407"),
    ],
  },
  {
    number: 8,
    subjects: [
      sub("project3", "Project 3", "CSE-402"),
      sub("mooc1", "MOOC - I", "CSE-404"),
      sub("mooc2", "MOOC - II", "CSE-406"),
    ],
  },
];

export const getAllSemesters = (): Semester[] => semesters.sort((a, b) => a.number - b.number);
export const getSemester = (num: number): Semester | undefined => semesters.find(s => s.number === num);
