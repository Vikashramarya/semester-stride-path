export interface LecturePlaylist {
  id: string;
  unitNumber: number;
  title: string;
  videoId: string;
  playlistId?: string;
  url: string;
}

export interface SubjectLectures {
  subjectId: string;
  subjectName: string;
  units: LecturePlaylist[];
}

export const ytThumb = (videoId: string) =>
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
export const ytWatchUrl = (videoId: string, playlistId?: string) =>
  playlistId
    ? `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`
    : `https://www.youtube.com/watch?v=${videoId}`;
export const ytEmbedUrl = (videoId: string, playlistId?: string) =>
  playlistId
    ? `https://www.youtube.com/embed/${videoId}?list=${playlistId}&rel=0&modestbranding=1`
    : `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;

const mk = (
  subjectId: string,
  unitNumber: number,
  title: string,
  videoId: string,
  playlistId?: string,
): LecturePlaylist => ({
  id: `${subjectId}-u${unitNumber}`,
  unitNumber,
  title,
  videoId,
  playlistId,
  url: ytWatchUrl(videoId, playlistId),
});

export const lectureData: SubjectLectures[] = [
  {
    subjectId: "dbms",
    subjectName: "Database Management System",
    units: [
      mk("dbms", 1, "DBMS Unit 1", "3EJlovevfcA", "PLFnnUST2z6IWHrHx00ozeUObEp9sWvROf"),
      mk("dbms", 2, "DBMS Unit 2", "zYH-e6tUYbw", "PLFnnUST2z6IWM576Wqns5h3-q5PBwhpL-"),
      mk("dbms", 3, "DBMS Unit 3", "5GDTIUVlHB8", "PLFnnUST2z6IVVatNtp5qm9W7p5a_Ze-Qn"),
      mk("dbms", 4, "DBMS Unit 4", "t5hsV9lC1rU", "PLFnnUST2z6IXEnNNYCKV40ar-CtYN_aD8"),
    ],
  },
  {
    subjectId: "os",
    subjectName: "Operating System",
    units: [
      mk("os", 1, "Operating System Unit 1", "WJ-UaAaumNA", "PLFnnUST2z6IV65obsi7zuE2ylbS1cwtrm"),
      mk("os", 2, "Operating System Unit 2", "zFnrUVqtiOY", "PLFnnUST2z6IXHapr2gNLoNTLNO0W4UKAb"),
      mk("os", 3, "Operating System Unit 3", "3Eaw1SSIqRg", "PLFnnUST2z6IVzusrkZE7cR93thuFzzyYs"),
      mk("os", 4, "Operating System Unit 4", "rWFH6PLOIEI", "PLFnnUST2z6IVQQznz38-R3XRAN4dVjQ2c"),
    ],
  },
  {
    subjectId: "cn",
    subjectName: "Computer Network",
    units: [
      mk("cn", 1, "Computer Network Unit 1", "4D55Cmj2t-A", "PLFnnUST2z6IU_d7bqJDHpiwrQDd_Gjk-V"),
      mk("cn", 2, "Computer Network Unit 2", "JRgmPco0KWI", "PLFnnUST2z6IVQHGaA0zDRZ9UgpQ4yMsMy"),
      mk("cn", 3, "Computer Network Unit 3", "q3Z3Qa1UNBA", "PLmXKhU9FNesSjFbXSZGF8JF_4LVwwofCd"),
      mk("cn", 4, "Computer Network Unit 4", "APVCgkqWcQ4"),
    ],
  },
  {
    subjectId: "de",
    subjectName: "Digital Electronics",
    units: [
      mk("de", 1, "Digital Electronics Unit 1", "O0gtKDu_cJc", "PLxCzCOWd7aiGmXg4NoX6R31AsC5LeCPHe"),
      mk("de", 2, "Digital Electronics Unit 2", "4luaoQGaEZQ", "PLgwJf8NK-2e4zRyPzO6HI9sUOR8v-80RT"),
      mk("de", 3, "Digital Electronics Unit 3", "v0pxOfTg18Y", "PLxCzCOWd7aiGmXg4NoX6R31AsC5LeCPHe"),
      mk("de", 4, "Digital Electronics Unit 4", "APVCgkqWcQ4"),
    ],
  },
  {
    subjectId: "cal",
    subjectName: "Calculus and Ordinary Differential Equations",
    units: [
      mk("cal", 1, "Calculus and ODE Unit 1", "TH4Kd9mfIgI", "PLT3bOBUU3L9g0aergP43HK9ihc_UG7Kbx"),
      mk("cal", 2, "Calculus and ODE Unit 2", "swF628VHQDo", "PLMBARyqASPojTZP7JXdi8zb5YB0dzmugY"),
      mk("cal", 3, "Calculus and ODE Unit 3", "E2yfGTX8aoI", "PLT3bOBUU3L9hiaoMvkO_h1Y4u-4r-CuSi"),
      mk("cal", 4, "Calculus and ODE Unit 4", "wGXP5achaLE", "PLT3bOBUU3L9jILVs8OZy3HzzuHG4vO2gN"),
    ],
  },
  {
    subjectId: "ads",
    subjectName: "Advance Data Structure",
    units: [
      mk("ads", 1, "Advance Data Structure Unit 1", "Y3Ckd3OW0_g", "PLxCzCOWd7aiEwaANNt3OqJPVIxwp2ebiT"),
      mk("ads", 2, "Advance Data Structure Unit 2", "z0Vnno96_MA", "PLxCzCOWd7aiEwaANNt3OqJPVIxwp2ebiT"),
      mk("ads", 3, "Advance Data Structure Unit 3", "E9DOBLNB-aE", "PLxCzCOWd7aiEwaANNt3OqJPVIxwp2ebiT"),
      mk("ads", 4, "Advance Data Structure Unit 4", "I16sYpAwBEg", "PLxCzCOWd7aiEwaANNt3OqJPVIxwp2ebiT"),
    ],
  },
  {
    subjectId: "cpp",
    subjectName: "Programming with C++",
    units: [
      mk("cpp", 1, "Programming with C++ Unit 1", "yAfdQGyrYeo", "PLxCzCOWd7aiF6yRNI5OHQsnUJQfl7Geqj"),
      mk("cpp", 2, "Programming with C++ Unit 2", "ipd4SQY0Ehg", "PLxCzCOWd7aiF6yRNI5OHQsnUJQfl7Geqj"),
      mk("cpp", 3, "Programming with C++ Unit 3", "aD6uxHWec-E", "PLxCzCOWd7aiF6yRNI5OHQsnUJQfl7Geqj"),
      mk("cpp", 4, "Programming with C++ Unit 4", "7mqEAihxJks", "PLxCzCOWd7aiF6yRNI5OHQsnUJQfl7Geqj"),
    ],
  },
  {
    subjectId: "aiml",
    subjectName: "Introduction to AI and ML",
    units: [
      mk("aiml", 1, "AI and ML Unit 1", "uB3i-qV6VdM", "PLxCzCOWd7aiHGhOHV-nwb0HR5US5GFKFI"),
      mk("aiml", 2, "AI and ML Unit 2", "kz184QIO4ZQ", "PLRMs2EJPx4DXDtffzY01p6sTIrrBkPj0O"),
      mk("aiml", 3, "AI and ML Unit 3", "EYeF2e2IKEo", "PLRMs2EJPx4DXDtffzY01p6sTIrrBkPj0O"),
      mk("aiml", 4, "AI and ML Unit 4", "HsdiMkKnNLk", "PLRMs2EJPx4DXDtffzY01p6sTIrrBkPj0O"),
    ],
  },
];

export const getAllLectures = (): SubjectLectures[] => lectureData;
export const getLecturesForSubject = (subjectId: string): LecturePlaylist[] =>
  lectureData.find((l) => l.subjectId === subjectId)?.units ?? [];
