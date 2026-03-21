export interface Topic {
  id: string;
  name: string;
  important: boolean;
}

export interface PYQ {
  question: string;
  year: number;
  marks: number;
  repeated: number; // times repeated
}

export interface Unit {
  id: string;
  name: string;
  weightage: number; // percentage
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

const semesters: Semester[] = [
  {
    number: 3,
    subjects: [
      {
        id: "dbms",
        name: "Database Management Systems",
        code: "CS301",
        units: [
          {
            id: "dbms-u1",
            name: "Unit 1: Introduction & ER Model",
            weightage: 25,
            topics: [
              { id: "dbms-u1-t1", name: "Database System Architecture", important: true },
              { id: "dbms-u1-t2", name: "Data Models", important: false },
              { id: "dbms-u1-t3", name: "ER Diagram & Extended ER", important: true },
              { id: "dbms-u1-t4", name: "Relational Model", important: true },
              { id: "dbms-u1-t5", name: "Keys & Constraints", important: false },
            ],
            pyqs: [
              { question: "Draw an ER diagram for a university database", year: 2023, marks: 10, repeated: 3 },
              { question: "Explain different types of keys with examples", year: 2022, marks: 5, repeated: 2 },
              { question: "Differentiate between ER and EER model", year: 2023, marks: 5, repeated: 1 },
            ],
            notes: [
              "DBMS provides data abstraction through 3 levels: Physical, Logical, View",
              "ER Model: Entity, Attribute, Relationship — core building blocks",
              "Keys: Super, Candidate, Primary, Foreign, Composite",
            ],
          },
          {
            id: "dbms-u2",
            name: "Unit 2: SQL & Relational Algebra",
            weightage: 25,
            topics: [
              { id: "dbms-u2-t1", name: "SQL DDL & DML", important: true },
              { id: "dbms-u2-t2", name: "Aggregate Functions & Grouping", important: true },
              { id: "dbms-u2-t3", name: "Joins & Subqueries", important: true },
              { id: "dbms-u2-t4", name: "Relational Algebra Operations", important: false },
              { id: "dbms-u2-t5", name: "Views & Indexes", important: false },
            ],
            pyqs: [
              { question: "Write SQL queries for given operations on employee database", year: 2023, marks: 10, repeated: 4 },
              { question: "Explain different types of joins with examples", year: 2022, marks: 5, repeated: 3 },
            ],
            notes: [
              "DDL: CREATE, ALTER, DROP, TRUNCATE",
              "DML: SELECT, INSERT, UPDATE, DELETE",
              "Joins: INNER, LEFT, RIGHT, FULL OUTER, CROSS, SELF",
            ],
          },
          {
            id: "dbms-u3",
            name: "Unit 3: Normalization",
            weightage: 25,
            topics: [
              { id: "dbms-u3-t1", name: "Functional Dependencies", important: true },
              { id: "dbms-u3-t2", name: "Normal Forms (1NF to BCNF)", important: true },
              { id: "dbms-u3-t3", name: "Decomposition", important: false },
              { id: "dbms-u3-t4", name: "Lossless Join & Dependency Preservation", important: true },
            ],
            pyqs: [
              { question: "Normalize the given relation to BCNF", year: 2023, marks: 10, repeated: 5 },
              { question: "Find candidate keys from functional dependencies", year: 2022, marks: 5, repeated: 3 },
            ],
            notes: [
              "1NF: Atomic values, no repeating groups",
              "2NF: No partial dependency",
              "3NF: No transitive dependency",
              "BCNF: Every determinant is a candidate key",
            ],
          },
          {
            id: "dbms-u4",
            name: "Unit 4: Transactions & Concurrency",
            weightage: 25,
            topics: [
              { id: "dbms-u4-t1", name: "ACID Properties", important: true },
              { id: "dbms-u4-t2", name: "Serializability", important: true },
              { id: "dbms-u4-t3", name: "Concurrency Control Protocols", important: false },
              { id: "dbms-u4-t4", name: "Deadlock Handling", important: true },
              { id: "dbms-u4-t5", name: "Recovery Techniques", important: false },
            ],
            pyqs: [
              { question: "Explain ACID properties with examples", year: 2023, marks: 5, repeated: 4 },
              { question: "Check serializability of a given schedule", year: 2022, marks: 10, repeated: 3 },
            ],
            notes: [
              "ACID: Atomicity, Consistency, Isolation, Durability",
              "Two-Phase Locking: Growing phase + Shrinking phase",
              "Deadlock: Prevention, Detection, Avoidance",
            ],
          },
        ],
      },
      {
        id: "os",
        name: "Operating Systems",
        code: "CS302",
        units: [
          {
            id: "os-u1",
            name: "Unit 1: OS Fundamentals",
            weightage: 20,
            topics: [
              { id: "os-u1-t1", name: "Types of OS", important: false },
              { id: "os-u1-t2", name: "System Calls", important: true },
              { id: "os-u1-t3", name: "Process Concepts", important: true },
              { id: "os-u1-t4", name: "Process States & PCB", important: true },
            ],
            pyqs: [
              { question: "Explain different types of operating systems", year: 2023, marks: 5, repeated: 2 },
              { question: "Describe process states with diagram", year: 2022, marks: 5, repeated: 3 },
            ],
            notes: [
              "OS Types: Batch, Time-sharing, Distributed, Real-time",
              "Process states: New, Ready, Running, Waiting, Terminated",
            ],
          },
          {
            id: "os-u2",
            name: "Unit 2: CPU Scheduling & Synchronization",
            weightage: 30,
            topics: [
              { id: "os-u2-t1", name: "Scheduling Algorithms (FCFS, SJF, RR, Priority)", important: true },
              { id: "os-u2-t2", name: "Process Synchronization", important: true },
              { id: "os-u2-t3", name: "Semaphores & Mutex", important: true },
              { id: "os-u2-t4", name: "Classical Sync Problems", important: true },
            ],
            pyqs: [
              { question: "Solve scheduling problem using Round Robin (quantum=3)", year: 2023, marks: 10, repeated: 5 },
              { question: "Explain Producer-Consumer problem using semaphores", year: 2022, marks: 10, repeated: 4 },
            ],
            notes: [
              "FCFS: Non-preemptive, convoy effect",
              "SJF: Optimal avg waiting time, starvation possible",
              "Round Robin: Time quantum based, good response time",
            ],
          },
          {
            id: "os-u3",
            name: "Unit 3: Memory Management",
            weightage: 25,
            topics: [
              { id: "os-u3-t1", name: "Paging & Segmentation", important: true },
              { id: "os-u3-t2", name: "Virtual Memory", important: true },
              { id: "os-u3-t3", name: "Page Replacement Algorithms", important: true },
              { id: "os-u3-t4", name: "Thrashing", important: false },
            ],
            pyqs: [
              { question: "Solve page replacement using LRU algorithm", year: 2023, marks: 10, repeated: 4 },
              { question: "Explain paging with diagram", year: 2022, marks: 5, repeated: 3 },
            ],
            notes: [
              "Paging: Fixed-size blocks, no external fragmentation",
              "Page Replacement: FIFO, LRU, Optimal",
              "Thrashing: Excessive paging, CPU utilization drops",
            ],
          },
          {
            id: "os-u4",
            name: "Unit 4: Deadlocks & File Systems",
            weightage: 25,
            topics: [
              { id: "os-u4-t1", name: "Deadlock Conditions & Prevention", important: true },
              { id: "os-u4-t2", name: "Banker's Algorithm", important: true },
              { id: "os-u4-t3", name: "File System Structure", important: false },
              { id: "os-u4-t4", name: "Disk Scheduling", important: true },
            ],
            pyqs: [
              { question: "Apply Banker's algorithm to check safe state", year: 2023, marks: 10, repeated: 5 },
              { question: "Solve disk scheduling using SCAN algorithm", year: 2022, marks: 5, repeated: 2 },
            ],
            notes: [
              "Deadlock conditions: Mutual exclusion, Hold & Wait, No Preemption, Circular Wait",
              "Banker's: Safety algorithm + Resource request algorithm",
            ],
          },
        ],
      },
      {
        id: "cn",
        name: "Computer Networks",
        code: "CS303",
        units: [
          {
            id: "cn-u1",
            name: "Unit 1: Network Fundamentals",
            weightage: 20,
            topics: [
              { id: "cn-u1-t1", name: "OSI & TCP/IP Models", important: true },
              { id: "cn-u1-t2", name: "Network Topologies", important: false },
              { id: "cn-u1-t3", name: "Transmission Media", important: false },
              { id: "cn-u1-t4", name: "Switching Techniques", important: true },
            ],
            pyqs: [
              { question: "Compare OSI and TCP/IP models", year: 2023, marks: 10, repeated: 4 },
            ],
            notes: [
              "OSI: 7 layers — Physical to Application",
              "TCP/IP: 4 layers — Network Access, Internet, Transport, Application",
            ],
          },
          {
            id: "cn-u2",
            name: "Unit 2: Data Link Layer",
            weightage: 25,
            topics: [
              { id: "cn-u2-t1", name: "Error Detection & Correction", important: true },
              { id: "cn-u2-t2", name: "Flow Control Protocols", important: true },
              { id: "cn-u2-t3", name: "MAC Protocols", important: true },
              { id: "cn-u2-t4", name: "Ethernet & LAN", important: false },
            ],
            pyqs: [
              { question: "Explain sliding window protocol", year: 2023, marks: 10, repeated: 3 },
              { question: "Solve CRC problem", year: 2022, marks: 5, repeated: 2 },
            ],
            notes: [
              "Error Detection: Parity, Checksum, CRC",
              "Flow Control: Stop-and-Wait, Go-Back-N, Selective Repeat",
            ],
          },
          {
            id: "cn-u3",
            name: "Unit 3: Network Layer",
            weightage: 30,
            topics: [
              { id: "cn-u3-t1", name: "IP Addressing & Subnetting", important: true },
              { id: "cn-u3-t2", name: "Routing Algorithms", important: true },
              { id: "cn-u3-t3", name: "IPv4 vs IPv6", important: false },
              { id: "cn-u3-t4", name: "ARP, RARP, ICMP", important: true },
            ],
            pyqs: [
              { question: "Solve subnetting problem for given IP address", year: 2023, marks: 10, repeated: 5 },
              { question: "Apply Dijkstra's algorithm for shortest path routing", year: 2022, marks: 10, repeated: 3 },
            ],
            notes: [
              "IP Classes: A (1-126), B (128-191), C (192-223)",
              "Subnetting: Borrowing host bits for creating subnets",
              "Routing: Distance Vector (RIP), Link State (OSPF)",
            ],
          },
          {
            id: "cn-u4",
            name: "Unit 4: Transport & Application Layer",
            weightage: 25,
            topics: [
              { id: "cn-u4-t1", name: "TCP vs UDP", important: true },
              { id: "cn-u4-t2", name: "TCP Congestion Control", important: true },
              { id: "cn-u4-t3", name: "DNS, HTTP, FTP", important: false },
              { id: "cn-u4-t4", name: "Socket Programming", important: false },
            ],
            pyqs: [
              { question: "Compare TCP and UDP protocols", year: 2023, marks: 5, repeated: 3 },
              { question: "Explain TCP 3-way handshake", year: 2022, marks: 5, repeated: 4 },
            ],
            notes: [
              "TCP: Connection-oriented, reliable, flow control",
              "UDP: Connectionless, fast, no guarantee",
              "DNS: Domain to IP resolution, hierarchical",
            ],
          },
        ],
      },
      {
        id: "java",
        name: "Java Programming",
        code: "CS304",
        units: [
          {
            id: "java-u1",
            name: "Unit 1: OOP Fundamentals",
            weightage: 25,
            topics: [
              { id: "java-u1-t1", name: "Classes & Objects", important: true },
              { id: "java-u1-t2", name: "Constructors & Overloading", important: true },
              { id: "java-u1-t3", name: "Inheritance & Polymorphism", important: true },
              { id: "java-u1-t4", name: "Abstraction & Encapsulation", important: false },
            ],
            pyqs: [
              { question: "Write a program demonstrating inheritance types", year: 2023, marks: 10, repeated: 3 },
              { question: "Explain method overloading vs overriding", year: 2022, marks: 5, repeated: 4 },
            ],
            notes: [
              "4 OOP pillars: Encapsulation, Inheritance, Polymorphism, Abstraction",
              "Java doesn't support multiple inheritance (uses interfaces instead)",
            ],
          },
          {
            id: "java-u2",
            name: "Unit 2: Exception Handling & I/O",
            weightage: 20,
            topics: [
              { id: "java-u2-t1", name: "Try-Catch-Finally", important: true },
              { id: "java-u2-t2", name: "Custom Exceptions", important: false },
              { id: "java-u2-t3", name: "File I/O Streams", important: true },
              { id: "java-u2-t4", name: "Serialization", important: false },
            ],
            pyqs: [
              { question: "Write a program with custom exception handling", year: 2023, marks: 10, repeated: 2 },
            ],
            notes: [
              "Checked exceptions: compile-time (IOException, SQLException)",
              "Unchecked: runtime (NullPointerException, ArrayIndexOutOfBounds)",
            ],
          },
          {
            id: "java-u3",
            name: "Unit 3: Collections & Generics",
            weightage: 30,
            topics: [
              { id: "java-u3-t1", name: "List, Set, Map Interfaces", important: true },
              { id: "java-u3-t2", name: "ArrayList vs LinkedList", important: true },
              { id: "java-u3-t3", name: "HashMap & TreeMap", important: true },
              { id: "java-u3-t4", name: "Generics & Wildcards", important: false },
            ],
            pyqs: [
              { question: "Compare ArrayList and LinkedList with code", year: 2023, marks: 10, repeated: 3 },
              { question: "Write a program using HashMap", year: 2022, marks: 5, repeated: 2 },
            ],
            notes: [
              "Collection hierarchy: Collection → List, Set, Queue",
              "ArrayList: Dynamic array, fast random access",
              "LinkedList: Node-based, fast insert/delete",
            ],
          },
          {
            id: "java-u4",
            name: "Unit 4: Multithreading & JDBC",
            weightage: 25,
            topics: [
              { id: "java-u4-t1", name: "Thread Creation & Lifecycle", important: true },
              { id: "java-u4-t2", name: "Synchronization", important: true },
              { id: "java-u4-t3", name: "JDBC Basics", important: true },
              { id: "java-u4-t4", name: "Prepared Statements", important: false },
            ],
            pyqs: [
              { question: "Write a multithreaded program using Runnable", year: 2023, marks: 10, repeated: 3 },
              { question: "Explain JDBC architecture", year: 2022, marks: 5, repeated: 2 },
            ],
            notes: [
              "Thread: extends Thread or implements Runnable",
              "Thread states: New, Runnable, Running, Blocked, Dead",
              "JDBC: DriverManager → Connection → Statement → ResultSet",
            ],
          },
        ],
      },
      {
        id: "java-lab",
        name: "Java Programming Lab",
        code: "CS305",
        isLab: true,
        units: [],
        labPrograms: [
          {
            title: "Program 1: Class & Objects",
            description: "Create a class Student with name, roll, marks. Implement methods to display and calculate grade.",
            vivaQuestions: ["What is a constructor?", "Difference between class and object?", "What is encapsulation?"],
          },
          {
            title: "Program 2: Inheritance",
            description: "Implement single and multilevel inheritance with Employee and Manager classes.",
            vivaQuestions: ["Types of inheritance in Java?", "Why multiple inheritance not supported?", "What is super keyword?"],
          },
          {
            title: "Program 3: Interface & Abstract Class",
            description: "Create an interface Shape with area() and perimeter() methods. Implement for Circle and Rectangle.",
            vivaQuestions: ["Difference between abstract class and interface?", "Can interface have constructor?", "What is default method?"],
          },
          {
            title: "Program 4: Exception Handling",
            description: "Write a program demonstrating try-catch, custom exceptions, and finally block.",
            vivaQuestions: ["Difference between throw and throws?", "What is finally?", "Checked vs unchecked exceptions?"],
          },
          {
            title: "Program 5: Collections",
            description: "Implement ArrayList, LinkedList, and HashMap with CRUD operations.",
            vivaQuestions: ["ArrayList vs LinkedList?", "What is Iterator?", "HashMap vs TreeMap?"],
          },
          {
            title: "Program 6: Multithreading",
            description: "Create threads using Thread class and Runnable interface. Demonstrate synchronization.",
            vivaQuestions: ["Thread lifecycle?", "What is synchronized?", "Difference between wait() and sleep()?"],
          },
          {
            title: "Program 7: JDBC",
            description: "Connect to MySQL database and perform CRUD operations using JDBC.",
            vivaQuestions: ["JDBC architecture?", "What is PreparedStatement?", "Connection pooling?"],
          },
          {
            title: "Program 8: File I/O",
            description: "Read from and write to files using FileReader, FileWriter, BufferedReader.",
            vivaQuestions: ["Byte stream vs Character stream?", "What is serialization?", "BufferedReader vs Scanner?"],
          },
        ],
      },
      {
        id: "os-lab",
        name: "OS Lab",
        code: "CS306",
        isLab: true,
        units: [],
        labPrograms: [
          {
            title: "Program 1: FCFS Scheduling",
            description: "Implement First Come First Served CPU scheduling algorithm.",
            vivaQuestions: ["What is convoy effect?", "Is FCFS preemptive?", "What is turnaround time?"],
          },
          {
            title: "Program 2: SJF Scheduling",
            description: "Implement Shortest Job First (preemptive and non-preemptive).",
            vivaQuestions: ["SJF vs FCFS?", "What is starvation?", "How to predict burst time?"],
          },
          {
            title: "Program 3: Round Robin",
            description: "Implement Round Robin scheduling with configurable time quantum.",
            vivaQuestions: ["Effect of time quantum?", "Is RR preemptive?", "When is RR best?"],
          },
          {
            title: "Program 4: Banker's Algorithm",
            description: "Implement Banker's algorithm for deadlock avoidance.",
            vivaQuestions: ["What is safe state?", "Conditions for deadlock?", "Banker's vs Wait-for graph?"],
          },
          {
            title: "Program 5: Page Replacement",
            description: "Implement FIFO, LRU, and Optimal page replacement algorithms.",
            vivaQuestions: ["What is Belady's anomaly?", "LRU implementation?", "What is page fault?"],
          },
          {
            title: "Program 6: Disk Scheduling",
            description: "Implement FCFS, SCAN, and C-SCAN disk scheduling algorithms.",
            vivaQuestions: ["SCAN vs C-SCAN?", "What is seek time?", "Best disk scheduling algorithm?"],
          },
        ],
      },
      {
        id: "dbms-lab",
        name: "DBMS Lab",
        code: "CS307",
        isLab: true,
        units: [],
        labPrograms: [
          {
            title: "Program 1: DDL Commands",
            description: "Create tables, alter schema, add constraints using DDL commands.",
            vivaQuestions: ["DDL vs DML?", "What is CASCADE?", "Types of constraints?"],
          },
          {
            title: "Program 2: DML & Queries",
            description: "Write INSERT, UPDATE, DELETE and complex SELECT queries.",
            vivaQuestions: ["Difference between DELETE and TRUNCATE?", "What is a subquery?", "GROUP BY vs HAVING?"],
          },
          {
            title: "Program 3: Joins",
            description: "Write queries using INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN.",
            vivaQuestions: ["Types of joins?", "CROSS JOIN vs INNER JOIN?", "What is self join?"],
          },
          {
            title: "Program 4: PL/SQL",
            description: "Write PL/SQL blocks with cursors, triggers, and stored procedures.",
            vivaQuestions: ["What is a cursor?", "Types of triggers?", "Procedure vs Function?"],
          },
          {
            title: "Program 5: Normalization",
            description: "Normalize given relations to 1NF, 2NF, 3NF, and BCNF.",
            vivaQuestions: ["What is functional dependency?", "Lossless decomposition?", "BCNF vs 3NF?"],
          },
        ],
      },
    ],
  },
  {
    number: 4,
    subjects: [
      {
        id: "daa",
        name: "Design & Analysis of Algorithms",
        code: "CS401",
        units: [
          {
            id: "daa-u1", name: "Unit 1: Fundamentals & Divide-Conquer", weightage: 25,
            topics: [
              { id: "daa-u1-t1", name: "Asymptotic Notations", important: true },
              { id: "daa-u1-t2", name: "Recurrence Relations", important: true },
              { id: "daa-u1-t3", name: "Merge Sort & Quick Sort", important: true },
              { id: "daa-u1-t4", name: "Master Theorem", important: true },
            ],
            pyqs: [
              { question: "Solve recurrence using Master theorem", year: 2023, marks: 10, repeated: 4 },
            ],
            notes: ["O(n) ⊆ O(n log n) ⊆ O(n²) ⊆ O(2ⁿ)", "Master Theorem: T(n) = aT(n/b) + f(n)"],
          },
          {
            id: "daa-u2", name: "Unit 2: Greedy & Dynamic Programming", weightage: 30,
            topics: [
              { id: "daa-u2-t1", name: "Greedy Strategy", important: true },
              { id: "daa-u2-t2", name: "Huffman Coding", important: true },
              { id: "daa-u2-t3", name: "0/1 Knapsack", important: true },
              { id: "daa-u2-t4", name: "LCS & Matrix Chain", important: true },
            ],
            pyqs: [
              { question: "Solve 0/1 Knapsack using DP", year: 2023, marks: 10, repeated: 5 },
              { question: "Find LCS of two strings", year: 2022, marks: 10, repeated: 3 },
            ],
            notes: ["Greedy: Local optimal → Global optimal", "DP: Overlapping subproblems + Optimal substructure"],
          },
          {
            id: "daa-u3", name: "Unit 3: Graph Algorithms", weightage: 25,
            topics: [
              { id: "daa-u3-t1", name: "BFS & DFS", important: true },
              { id: "daa-u3-t2", name: "MST (Prim's, Kruskal's)", important: true },
              { id: "daa-u3-t3", name: "Shortest Path (Dijkstra, Bellman-Ford)", important: true },
            ],
            pyqs: [
              { question: "Find MST using Kruskal's algorithm", year: 2023, marks: 10, repeated: 4 },
            ],
            notes: ["BFS: Queue-based, level-order", "DFS: Stack-based, backtracking", "Dijkstra: No negative weights"],
          },
          {
            id: "daa-u4", name: "Unit 4: Backtracking & NP", weightage: 20,
            topics: [
              { id: "daa-u4-t1", name: "N-Queens Problem", important: true },
              { id: "daa-u4-t2", name: "NP-Complete & NP-Hard", important: true },
              { id: "daa-u4-t3", name: "Branch & Bound", important: false },
            ],
            pyqs: [
              { question: "Solve 4-Queens problem using backtracking", year: 2023, marks: 10, repeated: 3 },
              { question: "Explain P, NP, NP-Complete with examples", year: 2022, marks: 5, repeated: 2 },
            ],
            notes: ["Backtracking: Try → Check → Undo", "P ⊆ NP, NP-Complete = NP ∩ NP-Hard"],
          },
        ],
      },
      {
        id: "se",
        name: "Software Engineering",
        code: "CS402",
        units: [
          {
            id: "se-u1", name: "Unit 1: Software Process Models", weightage: 25,
            topics: [
              { id: "se-u1-t1", name: "Waterfall Model", important: true },
              { id: "se-u1-t2", name: "Agile & Scrum", important: true },
              { id: "se-u1-t3", name: "Spiral Model", important: false },
            ],
            pyqs: [{ question: "Compare Waterfall and Agile models", year: 2023, marks: 10, repeated: 3 }],
            notes: ["Waterfall: Sequential, no going back", "Agile: Iterative, sprint-based"],
          },
          {
            id: "se-u2", name: "Unit 2: Requirements & Design", weightage: 25,
            topics: [
              { id: "se-u2-t1", name: "SRS Document", important: true },
              { id: "se-u2-t2", name: "UML Diagrams", important: true },
              { id: "se-u2-t3", name: "Design Patterns", important: false },
            ],
            pyqs: [{ question: "Draw use case diagram for ATM system", year: 2023, marks: 10, repeated: 4 }],
            notes: ["SRS: Functional + Non-functional requirements", "UML: Use Case, Class, Sequence, Activity"],
          },
          {
            id: "se-u3", name: "Unit 3: Testing", weightage: 25,
            topics: [
              { id: "se-u3-t1", name: "Black Box & White Box Testing", important: true },
              { id: "se-u3-t2", name: "Unit & Integration Testing", important: true },
              { id: "se-u3-t3", name: "Test Case Design", important: false },
            ],
            pyqs: [{ question: "Explain black box testing techniques", year: 2023, marks: 10, repeated: 3 }],
            notes: ["Black Box: Equivalence partitioning, Boundary value", "White Box: Statement, Branch, Path coverage"],
          },
          {
            id: "se-u4", name: "Unit 4: Project Management", weightage: 25,
            topics: [
              { id: "se-u4-t1", name: "Project Estimation (COCOMO)", important: true },
              { id: "se-u4-t2", name: "Risk Management", important: false },
              { id: "se-u4-t3", name: "Software Metrics", important: true },
            ],
            pyqs: [{ question: "Calculate effort using COCOMO model", year: 2023, marks: 10, repeated: 3 }],
            notes: ["COCOMO: Basic, Intermediate, Detailed", "Risk: Identification → Analysis → Mitigation"],
          },
        ],
      },
    ],
  },
];

// Fill remaining semesters with placeholder data
for (let sem = 1; sem <= 8; sem++) {
  if (!semesters.find(s => s.number === sem)) {
    semesters.push({
      number: sem,
      subjects: [
        {
          id: `sem${sem}-sub1`,
          name: sem <= 2 ? ["Mathematics", "Physics", "Chemistry", "English", "Programming in C"][sem - 1] || "Subject 1" : `Subject ${sem}-1`,
          code: `CS${sem}01`,
          units: Array.from({ length: 4 }, (_, i) => ({
            id: `sem${sem}-sub1-u${i + 1}`,
            name: `Unit ${i + 1}`,
            weightage: 25,
            topics: [
              { id: `sem${sem}-sub1-u${i + 1}-t1`, name: `Topic ${i + 1}.1`, important: i === 0 },
              { id: `sem${sem}-sub1-u${i + 1}-t2`, name: `Topic ${i + 1}.2`, important: false },
            ],
            pyqs: [],
            notes: ["Notes coming soon..."],
          })),
        },
      ],
    });
  }
}

export const getAllSemesters = (): Semester[] => semesters.sort((a, b) => a.number - b.number);
export const getSemester = (num: number): Semester | undefined => semesters.find(s => s.number === num);
