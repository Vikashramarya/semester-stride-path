# Architecture rules

- Build Exam & Viva Mode as a new route over the existing syllabus and `ProgressContext`; avoid parallel syllabus or topic-progress stores because the current progress system is authoritative.