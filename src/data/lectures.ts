export interface LectureVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
  unitId: string;
}

export interface SubjectLectures {
  subjectId: string;
  subjectName: string;
  lectures: LectureVideo[];
}

export const lectureData: SubjectLectures[] = [
  {
    subjectId: "dbms",
    subjectName: "Database Management Systems",
    lectures: [
      {
        id: "dbms-v1", title: "ER Diagrams - Complete Tutorial", channel: "Gate Smashers",
        duration: "32:15", thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=225&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=6XL3ISnCbPo", unitId: "dbms-u1",
      },
      {
        id: "dbms-v2", title: "SQL Queries - From Basics to Advanced", channel: "CodeWithHarry",
        duration: "45:30", thumbnailUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY", unitId: "dbms-u2",
      },
      {
        id: "dbms-v3", title: "Normalization (1NF to BCNF) Explained", channel: "Jenny's Lectures",
        duration: "28:45", thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=ABwD8IYByfk", unitId: "dbms-u3",
      },
      {
        id: "dbms-v4", title: "Transaction & Concurrency Control", channel: "Gate Smashers",
        duration: "38:20", thumbnailUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=T7xtIV9xzLg", unitId: "dbms-u4",
      },
    ],
  },
  {
    subjectId: "os",
    subjectName: "Operating Systems",
    lectures: [
      {
        id: "os-v1", title: "Process Management & System Calls", channel: "Neso Academy",
        duration: "25:10", thumbnailUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&h=225&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=dz9Tk6KCMlQ", unitId: "os-u1",
      },
      {
        id: "os-v2", title: "CPU Scheduling Algorithms - All in One", channel: "Gate Smashers",
        duration: "52:00", thumbnailUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=225&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=Jkmy2YLUbIY", unitId: "os-u2",
      },
      {
        id: "os-v3", title: "Page Replacement Algorithms (FIFO, LRU, Optimal)", channel: "Jenny's Lectures",
        duration: "35:40", thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=225&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=16kaPQtYo28", unitId: "os-u3",
      },
      {
        id: "os-v4", title: "Banker's Algorithm - Deadlock Avoidance", channel: "Gate Smashers",
        duration: "30:55", thumbnailUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=225&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=bYFVbzLK6zI", unitId: "os-u4",
      },
    ],
  },
  {
    subjectId: "cn",
    subjectName: "Computer Networks",
    lectures: [
      {
        id: "cn-v1", title: "OSI vs TCP/IP Model - Complete Comparison", channel: "Gate Smashers",
        duration: "22:30", thumbnailUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=225&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=vv4y_uOneC0", unitId: "cn-u1",
      },
      {
        id: "cn-v2", title: "Sliding Window Protocol & Error Detection", channel: "Neso Academy",
        duration: "40:15", thumbnailUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=LnbvhoxHn8M", unitId: "cn-u2",
      },
      {
        id: "cn-v3", title: "IP Addressing & Subnetting Made Easy", channel: "Practical Networking",
        duration: "48:20", thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=ecCuyq-Wprc", unitId: "cn-u3",
      },
      {
        id: "cn-v4", title: "TCP 3-Way Handshake & Congestion Control", channel: "Gate Smashers",
        duration: "28:45", thumbnailUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=400&h=225&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=xMtP5ZB3wSk", unitId: "cn-u4",
      },
    ],
  },
  {
    subjectId: "java",
    subjectName: "Java Programming",
    lectures: [
      {
        id: "java-v1", title: "OOPs Concepts in Java - Full Course", channel: "Apna College",
        duration: "55:00", thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910auj8?w=400&h=225&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=bSrm9RXwBaI", unitId: "java-u1",
      },
      {
        id: "java-v2", title: "Exception Handling in Java", channel: "CodeWithHarry",
        duration: "30:15", thumbnailUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=225&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=W-N2ltgU-X4", unitId: "java-u2",
      },
      {
        id: "java-v3", title: "Java Collections Framework - Complete", channel: "Telusko",
        duration: "42:30", thumbnailUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fc9?w=400&h=225&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=rzA7UJ-hQn4", unitId: "java-u3",
      },
      {
        id: "java-v4", title: "Multithreading in Java - Full Tutorial", channel: "Apna College",
        duration: "38:50", thumbnailUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=225&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=4Xd-4cthW7Y", unitId: "java-u4",
      },
    ],
  },
];

export const getLecturesForSubject = (subjectId: string): LectureVideo[] => {
  return lectureData.find(l => l.subjectId === subjectId)?.lectures || [];
};

export const getAllLectures = (): SubjectLectures[] => lectureData;
