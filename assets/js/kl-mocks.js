/* nâng bằng tay họChính thứcche đậy họ 01-15(viết tắt của Tân Cươngphương ĐôngChính thứcThi thử)— miễn phíhọ thậtThi thử,không tiến lên mở ngoại động từ hoặc nội động từ họhệ thống.
   dữ liệutài liệutồn tại library/toefl/kl-set-*.json(bò sátsản phẩm);thời lượnglàm với tư cách mỗi cuộn lại modules timeSec thậtcộng tổng. */
(function (w) {
  "use strict";
  var Y = w.YYSD = w.YYSD || {};
  var MOCKS = [
    { id: "kl-set-1", no: "01", title: "nâng bằng tay họChính thứcche đậy họ 01", en: "Official Mock 01", tag: "new", tagZh: "mới nhất", desc: "Chính thứcmới nhấtche đậy họ,bốn ngành họchoàn chỉnhquy trình,bề mặt tiếp xúcđo thời giangiốngthậtPhòng thi.", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-2", no: "02", title: "nâng bằng tay họChính thứcche đậy họ 02", en: "Official Mock 02", tag: "hot", tagZh: "Tần suất cao", desc: "Tần suất caoChủ đềtoàn bộ bộ sưu tậpluyện tập,phù hợpthứ haiGiai đoạnđo thời gianhuấn luyện.", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-3", no: "03", title: "nâng bằng tay họChính thứcche đậy họ 03", en: "Official Mock 03", tag: "forecast", tagZh: "dự báo", desc: "phổ biếnhướngdự báocuộn lại,đánh trướcnắm rõ tình hìnhhọ rò rỉ.", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-4", no: "04", title: "nâng bằng tay họChính thứcche đậy họ 04", en: "Official Mock 04", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-5", no: "05", title: "nâng bằng tay họChính thứcche đậy họ 05", en: "Official Mock 05", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-6", no: "06", title: "nâng bằng tay họChính thứcche đậy họ 06", en: "Official Mock 06", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-7", no: "07", title: "nâng bằng tay họChính thứcche đậy họ 07", en: "Official Mock 07", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-8", no: "08", title: "nâng bằng tay họChính thứcche đậy họ 08", en: "Official Mock 08", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-9", no: "09", title: "nâng bằng tay họChính thứcche đậy họ 09", en: "Official Mock 09", duration: 99, r: 28, l: 40, w: 21, s: 11 },
    { id: "kl-set-10", no: "10", title: "nâng bằng tay họChính thứcche đậy họ 10", en: "Official Mock 10", duration: 99, r: 27, l: 40, w: 21, s: 11 },
    { id: "kl-set-11", no: "11", title: "nâng bằng tay họChính thứcche đậy họ 11", en: "Official Mock 11", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-12", no: "12", title: "nâng bằng tay họChính thứcche đậy họ 12", en: "Official Mock 12", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-13", no: "13", title: "nâng bằng tay họChính thứcche đậy họ 13", en: "Official Mock 13", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-14", no: "14", title: "nâng bằng tay họChính thứcche đậy họ 14", en: "Official Mock 14", duration: 92, r: 21, l: 40, w: 21, s: 11 },
    { id: "kl-set-15", no: "15", title: "nâng bằng tay họChính thứcche đậy họ 15", en: "Official Mock 15", duration: 92, r: 21, l: 40, w: 21, s: 11 }
  ];
  Y.KL_MOCKS = MOCKS;
  /* họ ngành họcthời lượngphút,đến từ một nơimỗi cuộn lại modules timeSec thậtcộng tổng */
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
})(typeof window !== "undefined" ? window : global);
