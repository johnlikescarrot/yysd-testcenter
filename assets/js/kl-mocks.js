/* Bộ đề TOEFL chính thức 01-15 (mới phương Đông chính thức Thi thử) — miễn phí Thi thử toàn phần, không vào mở bao hệ thống.
    Tệp dữ liệu tại library/toefl/kl-set-*.json; thời lượng là tổng timeSec thực tế của tất cả modules. */
(function (w) {
  "use strict";
  var Y = w.YYSD = w.YYSD || {};
  var MOCKS = [
    { id: "kl-set-1", no: "01", title: " Bộ đề TOEFL chính thức 01", en: "Official Mock 01", tag: "new", tagZh: " mới nhất ", desc: " Bộ đề chính thức mới nhất, đầy đủ quy trình 4 kỹ năng, giao diện và thời gian bấm giờ giống như phòng thi thật. ", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-2", no: "02", title: " Bộ đề TOEFL chính thức 02", en: "Official Mock 02", tag: "hot", tagZh: " Tần suất cao ", desc: " Tần suất cao chủ đề trọn bộ luyện, thích hợp giai đoạn thứ hai tính theo thời gian huấn luyện. ", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-3", no: "03", title: " Bộ đề TOEFL chính thức 03", en: "Official Mock 03", tag: "forecast", tagZh: " dự đoán ", desc: " đứng đầu phương hướng dự đoán cuốn, trước khi thi hiểu rõ tra rò. ", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-4", no: "04", title: " Bộ đề TOEFL chính thức 04", en: "Official Mock 04", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-5", no: "05", title: " Bộ đề TOEFL chính thức 05", en: "Official Mock 05", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-6", no: "06", title: " Bộ đề TOEFL chính thức 06", en: "Official Mock 06", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-7", no: "07", title: " Bộ đề TOEFL chính thức 07", en: "Official Mock 07", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-8", no: "08", title: " Bộ đề TOEFL chính thức 08", en: "Official Mock 08", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-9", no: "09", title: " Bộ đề TOEFL chính thức 09", en: "Official Mock 09", duration: 99, r: 28, l: 40, w: 21, s: 11 },
    { id: "kl-set-10", no: "10", title: " Bộ đề TOEFL chính thức 10", en: "Official Mock 10", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-11", no: "11", title: " Bộ đề TOEFL chính thức 11", en: "Official Mock 11", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-12", no: "12", title: " Bộ đề TOEFL chính thức 12", en: "Official Mock 12", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-13", no: "13", title: " Bộ đề TOEFL chính thức 13", en: "Official Mock 13", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-14", no: "14", title: " Bộ đề TOEFL chính thức 14", en: "Official Mock 14", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-15", no: "15", title: " Bộ đề TOEFL chính thức 15", en: "Official Mock 15", duration: 92, r: 21, l: 40, w: 21, s: 11 }
  ];
  Y.KL_MOCKS = MOCKS;
  /* Thời lượng từng kỹ năng (phút), tính từ tổng timeSec thực tế của tất cả modules */
  function skillMin(m, skill) { return m[skill[0]]; }
  var SKILL_ZH = { reading: "Đọc", listening: "Nghe", writing: "Viết", speaking: "Nói" };
  function reg(listName, skill) {
    if (!Y[listName]) Y[listName] = [];
    MOCKS.forEach(function (m) {
      Y[listName].push({
        id: m.id,
        title: m.title + " · " + SKILL_ZH[skill],
        file: "library/toefl/" + m.id + "-" + skill + ".json",
        duration: skillMin(m, skill),
        desc: m.title
      });
    });
  }
  reg("TOEFL_READING", "reading");
  reg("TOEFL_LISTENING", "listening");
  reg("TOEFL_WRITING", "writing");
  reg("TOEFL_SPEAKING", "speaking");
})(typeof window!== "undefined"? window: global);
