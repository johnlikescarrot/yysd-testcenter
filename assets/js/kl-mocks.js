/* TOEFL chính phủ che đậy chủ đề 01-15(viết tắt của Tân Cương phương Đông chính phủ bắt chước đánh)- miễn phí tất cả thật bắt chước đánh, không tiến lên mở che phủ hệ thống 
   dữ liệu tài liệu tồn tại library/toefl/kl-set-*.json(bò sát sản phẩm); thời lượng làm mỗi cuộn lại modules timeSec thật cộng tổng  */
(function (w) {
  "use strict";
  var Y = w.YYSD = w.YYSD || {};
  var MOCKS = [
    { id: "kl-set-1", no: "01", title: " TOEFL chính phủ che đậy chủ đề 01", en: "Official Mock 01", tag: "new", tagZh: " mới nhất ", desc: " chính phủ mới nhất che đậy chủ đề, bốn ngành học hoàn chỉnh quy trình, bề mặt tiếp xúc biến thể của | đo thời gian giống thật phòng thi ", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-2", no: "02", title: " TOEFL chính phủ che đậy chủ đề 02", en: "Official Mock 02", tag: "hot", tagZh: " tần số cao ", desc: " tần số cao chủ đề toàn bộ bộ sưu tập luyện tập, phù hợp thứ hai giai đoạn đo thời gian huấn luyện ", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-3", no: "03", title: " TOEFL chính phủ che đậy chủ đề 03", en: "Official Mock 03", tag: "forecast", tagZh: " dự báo ", desc: " phổ biến hướng dự báo cuộn lại, đánh trước nắm rõ tình hình nghiên cứu rò rỉ ", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-4", no: "04", title: " TOEFL chính phủ che đậy chủ đề 04", en: "Official Mock 04", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-5", no: "05", title: " TOEFL chính phủ che đậy chủ đề 05", en: "Official Mock 05", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-6", no: "06", title: " TOEFL chính phủ che đậy chủ đề 06", en: "Official Mock 06", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-7", no: "07", title: " TOEFL chính phủ che đậy chủ đề 07", en: "Official Mock 07", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-8", no: "08", title: " TOEFL chính phủ che đậy chủ đề 08", en: "Official Mock 08", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-9", no: "09", title: " TOEFL chính phủ che đậy chủ đề 09", en: "Official Mock 09", duration: 99, r: 28, l: 40, w: 21, s: 11 },
    { id: "kl-set-10", no: "10", title: " TOEFL chính phủ che đậy chủ đề 10", en: "Official Mock 10", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-11", no: "11", title: " TOEFL chính phủ che đậy chủ đề 11", en: "Official Mock 11", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-12", no: "12", title: " TOEFL chính phủ che đậy chủ đề 12", en: "Official Mock 12", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-13", no: "13", title: " TOEFL chính phủ che đậy chủ đề 13", en: "Official Mock 13", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-14", no: "14", title: " TOEFL chính phủ che đậy chủ đề 14", en: "Official Mock 14", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-15", no: "15", title: " TOEFL chính phủ che đậy chủ đề 15", en: "Official Mock 15", duration: 92, r: 21, l: 40, w: 21, s: 11 }
  ];
  Y.KL_MOCKS = MOCKS;
  /* hóa đơn ngành học thời lượng phút, đến từ mỗi cuộn lại modules timeSec thật cộng tổng */
  function skillMin(m, skill) { return m[skill[0]]; }
  var SKILL_ZH = { reading: " Đọc hiểu ", listening: " Nghe hiểu ", writing: " Viết ", speaking: " Nói " };
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
})(typeof window !== "undefined" ? window : global);
