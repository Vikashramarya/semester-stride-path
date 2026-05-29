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
];

export const getAllLectures = (): SubjectLectures[] => lectureData;
export const getLecturesForSubject = (subjectId: string): LecturePlaylist[] =>
  lectureData.find((l) => l.subjectId === subjectId)?.units ?? [];
