export interface LectureVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  videoId: string; // YouTube video ID (verified educational content)
  unitId: string;
  topic?: string;
}

export interface SubjectLectures {
  subjectId: string;
  subjectName: string;
  lectures: LectureVideo[];
}

// Helper to derive thumbnail + URLs from a YouTube videoId
export const ytThumb = (videoId: string) =>
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
export const ytWatchUrl = (videoId: string) =>
  `https://www.youtube.com/watch?v=${videoId}`;
export const ytEmbedUrl = (videoId: string) =>
  `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;

// Curated lecture videos — verified to be CSE educational content from
// well-known channels (Gate Smashers, Neso Academy, Apna College, Knowledge Gate, etc.)
export const lectureData: SubjectLectures[] = [
  {
    subjectId: "dbms",
    subjectName: "Database Management Systems",
    lectures: [
      { id: "dbms-v1", title: "Introduction to DBMS", channel: "Gate Smashers", duration: "12:30", videoId: "FRAMfu5wXnE", unitId: "dbms-u1", topic: "DBMS Basics" },
      { id: "dbms-v2", title: "ER Model — Entities, Attributes, Relationships", channel: "Gate Smashers", duration: "15:42", videoId: "QpdhBUYk7Kk", unitId: "dbms-u1", topic: "ER Diagrams" },
      { id: "dbms-v3", title: "SQL Queries — Complete Tutorial", channel: "Knowledge Gate", duration: "1:02:15", videoId: "BPHAr4QGGVE", unitId: "dbms-u2", topic: "SQL" },
      { id: "dbms-v4", title: "Normalization (1NF, 2NF, 3NF, BCNF)", channel: "Gate Smashers", duration: "18:20", videoId: "GFQaEYEc8_8", unitId: "dbms-u3", topic: "Normalization" },
      { id: "dbms-v5", title: "Transactions & ACID Properties", channel: "Gate Smashers", duration: "11:45", videoId: "pomxsOFgRGg", unitId: "dbms-u4", topic: "Transactions" },
      { id: "dbms-v6", title: "Concurrency Control & Locking", channel: "Gate Smashers", duration: "13:08", videoId: "oI2mJpHAjgM", unitId: "dbms-u4", topic: "Concurrency" },
    ],
  },
  {
    subjectId: "os",
    subjectName: "Operating Systems",
    lectures: [
      { id: "os-v1", title: "Introduction to Operating Systems", channel: "Gate Smashers", duration: "10:35", videoId: "vBURTt97EkA", unitId: "os-u1", topic: "OS Basics" },
      { id: "os-v2", title: "Process & Process States", channel: "Gate Smashers", duration: "11:12", videoId: "OZHaKL3eQEo", unitId: "os-u1", topic: "Processes" },
      { id: "os-v3", title: "CPU Scheduling — FCFS, SJF, Round Robin", channel: "Gate Smashers", duration: "16:25", videoId: "EWkQl0n0w5M", unitId: "os-u2", topic: "Scheduling" },
      { id: "os-v4", title: "Deadlock — Detection & Avoidance", channel: "Gate Smashers", duration: "14:50", videoId: "0t-rB7YA0HU", unitId: "os-u2", topic: "Deadlock" },
      { id: "os-v5", title: "Paging & Page Replacement (FIFO, LRU, Optimal)", channel: "Gate Smashers", duration: "17:08", videoId: "qdkxXygc3rE", unitId: "os-u3", topic: "Memory Management" },
      { id: "os-v6", title: "File System Implementation", channel: "Knowledge Gate", duration: "21:40", videoId: "4OvR-x5QfaE", unitId: "os-u4", topic: "File Systems" },
    ],
  },
  {
    subjectId: "cn",
    subjectName: "Computer Networks",
    lectures: [
      { id: "cn-v1", title: "OSI Reference Model — All 7 Layers", channel: "Gate Smashers", duration: "13:55", videoId: "vv4y_uOneC0", unitId: "cn-u1", topic: "OSI Model" },
      { id: "cn-v2", title: "TCP/IP Model Explained", channel: "Gate Smashers", duration: "10:20", videoId: "F5rRx2OW-DE", unitId: "cn-u1", topic: "TCP/IP" },
      { id: "cn-v3", title: "Sliding Window Protocol", channel: "Gate Smashers", duration: "12:45", videoId: "GjOMweFInhE", unitId: "cn-u2", topic: "Data Link Layer" },
      { id: "cn-v4", title: "IP Addressing & Subnetting", channel: "Gate Smashers", duration: "19:30", videoId: "ecCuyq-Wprc", unitId: "cn-u3", topic: "Network Layer" },
      { id: "cn-v5", title: "TCP 3-Way Handshake", channel: "Gate Smashers", duration: "9:18", videoId: "Fx3ZGZmhRn4", unitId: "cn-u4", topic: "Transport Layer" },
      { id: "cn-v6", title: "DNS — Domain Name System", channel: "Gate Smashers", duration: "11:25", videoId: "72snZctFFtA", unitId: "cn-u4", topic: "Application Layer" },
    ],
  },
  {
    subjectId: "java",
    subjectName: "Java Programming",
    lectures: [
      { id: "java-v1", title: "Java Basics & First Program", channel: "Apna College", duration: "23:14", videoId: "rDFP9SisLOQ", unitId: "java-u1", topic: "Java Intro" },
      { id: "java-v2", title: "OOP in Java — Classes & Objects", channel: "Apna College", duration: "33:08", videoId: "Bn-r6Ye5kRY", unitId: "java-u1", topic: "OOP" },
      { id: "java-v3", title: "Inheritance & Polymorphism in Java", channel: "Apna College", duration: "28:42", videoId: "yhd23l1qY9c", unitId: "java-u2", topic: "OOP" },
      { id: "java-v4", title: "Exception Handling in Java", channel: "Telusko", duration: "17:30", videoId: "1XAfapkBQjk", unitId: "java-u2", topic: "Exceptions" },
      { id: "java-v5", title: "Collections Framework", channel: "Telusko", duration: "26:18", videoId: "GdAon80-0KA", unitId: "java-u3", topic: "Collections" },
      { id: "java-v6", title: "Multithreading in Java", channel: "Apna College", duration: "31:55", videoId: "TwR0wYsB230", unitId: "java-u4", topic: "Threads" },
    ],
  },
];

export const getLecturesForSubject = (subjectId: string): LectureVideo[] =>
  lectureData.find((l) => l.subjectId === subjectId)?.lectures ?? [];

export const getAllLectures = (): SubjectLectures[] => lectureData;
