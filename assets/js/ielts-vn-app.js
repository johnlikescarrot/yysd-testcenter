(function () {
  "use strict";
  var Core = window.YYSDIELTSVN;
  if (!Core) return;

  var today = new Date();
  var state = Core.loadState(window.localStorage, today);
  var questions = [
    {
      id: "academic-01",
      skill: "vocabulary",
      prompt:
        "The university plans to ______ its library before the new semester.",
      translation: "Trường đại học dự định mở rộng thư viện trước học kỳ mới.",
      options: ["expand", "avoid", "borrow", "reduce"],
      answer: "expand",
      explanation:
        "Expand nghĩa là mở rộng. Dấu hiệu trong câu: thư viện sẽ được nâng cấp trước học kỳ mới.",
    },
    {
      id: "academic-02",
      skill: "vocabulary",
      prompt:
        "Which word is closest in meaning to ‘significant’ in an academic text?",
      translation:
        "Từ nào gần nghĩa nhất với ‘significant’ trong văn bản học thuật?",
      options: ["important", "temporary", "ordinary", "distant"],
      answer: "important",
      explanation:
        "Significant thường có nghĩa là quan trọng hoặc đáng kể, tùy ngữ cảnh.",
    },
    {
      id: "academic-03",
      skill: "vocabulary",
      prompt: "Regular feedback can ______ students to revise their work.",
      translation:
        "Phản hồi thường xuyên có thể khuyến khích học sinh chỉnh sửa bài làm.",
      options: ["encourage", "interrupt", "confuse", "prevent"],
      answer: "encourage",
      explanation:
        "Encourage someone to do something = khuyến khích ai làm việc gì.",
    },
    {
      id: "academic-04",
      skill: "vocabulary",
      prompt:
        "Choose the best connector: The sample was small; ______, the results should be interpreted cautiously.",
      translation:
        "Chọn từ nối phù hợp: Mẫu nghiên cứu nhỏ; vì vậy, cần diễn giải kết quả thận trọng.",
      options: ["therefore", "meanwhile", "instead", "similarly"],
      answer: "therefore",
      explanation:
        "Therefore diễn đạt kết quả hoặc hệ quả hợp lý từ mệnh đề trước.",
    },
    {
      id: "academic-05",
      skill: "vocabulary",
      prompt:
        "The research ______ that sleep is related to memory performance.",
      translation:
        "Nghiên cứu cho thấy giấc ngủ có liên quan đến hiệu quả ghi nhớ.",
      options: ["suggests", "denies", "replaces", "consumes"],
      answer: "suggests",
      explanation:
        "Suggests that là cách diễn đạt thận trọng, phổ biến khi trình bày kết quả nghiên cứu.",
    },
  ];
  var references = [
    {
      authors:
        "Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006).",
      title:
        "Distributed practice in verbal recall tasks: A review and quantitative synthesis.",
      source: "Psychological Bulletin, 132(3), 354–380.",
      doi: "10.1037/0033-2909.132.3.354",
      note: "Tổng hợp nghiên cứu về phân bố các lần luyện tập theo thời gian; khoảng cách ôn phù hợp có thể hỗ trợ ghi nhớ dài hạn.",
    },
    {
      authors: "Karpicke, J. D., & Roediger, H. L. (2008).",
      title: "The critical importance of retrieval for learning.",
      source: "Science, 319(5865), 966–968.",
      doi: "10.1126/science.1152408",
      note: "Cho thấy việc chủ động nhớ lại nội dung đã học là một hoạt động học tập quan trọng, không chỉ là cách kiểm tra.",
    },
    {
      authors: "Roediger, H. L., & Karpicke, J. D. (2006).",
      title:
        "Test-enhanced learning: Taking memory tests improves long-term retention.",
      source: "Psychological Science, 17(3), 249–255.",
      doi: "10.1111/j.1467-9280.2006.01693.x",
      note: "Nghiên cứu về tác động của việc tự kiểm tra đối với khả năng lưu giữ thông tin sau một khoảng thời gian.",
    },
    {
      authors: "Hattie, J., & Timperley, H. (2007).",
      title: "The power of feedback.",
      source: "Review of Educational Research, 77(1), 81–112.",
      doi: "10.3102/003465430298487",
      note: "Phân tích vai trò của phản hồi; thông tin cụ thể về mục tiêu, tiến độ và bước kế tiếp có giá trị hơn lời khen chung chung.",
    },
    {
      authors: "Sung, Y.-T., Chang, K.-E., & Yang, J.-M. (2015).",
      title:
        "How effective are mobile devices for language learning? A meta-analysis.",
      source: "Educational Research Review, 16, 68–84.",
      doi: "10.1016/j.edurev.2015.09.001",
      note: "Tổng quan định lượng về việc dùng thiết bị di động trong học ngôn ngữ; hiệu quả còn phụ thuộc thiết kế và cách tổ chức hoạt động.",
    },
    {
      authors: "Lyster, R., & Saito, K. (2010).",
      title: "Oral feedback in classroom SLA: A meta-analysis.",
      source: "Studies in Second Language Acquisition, 32(2), 265–302.",
      doi: "10.1017/S0272263109990520",
      note: "Tổng hợp nghiên cứu về phản hồi sửa lỗi trong lớp học ngôn ngữ thứ hai, có liên quan đến thiết kế hoạt động nói và sửa lỗi.",
    },
    {
      authors: "Nation, I. S. P. (2001).",
      title: "Learning vocabulary in another language.",
      source: "Cambridge University Press.",
      doi: "",
      note: "Tài liệu nền tảng về học từ vựng, tần suất gặp từ, ghi nhớ và các hoạt động tiếp nhận–sử dụng.",
    },
    {
      authors: "Council of Europe. (2020).",
      title:
        "Common European Framework of Reference for Languages: Companion volume.",
      source: "Council of Europe Publishing.",
      doi: "",
      note: "Khung mô tả năng lực ngôn ngữ và hoạt động giao tiếp; tham khảo khi đặt mục tiêu học tập theo kỹ năng.",
    },
    {
      authors: "IELTS. (n.d.).",
      title: "IELTS writing band descriptors and speaking band descriptors.",
      source: "IELTS.org — tiêu chí chấm chính thức.",
      doi: "",
      url: "https://ielts.org/for-test-takers/how-ielts-is-scored",
      note: "Nguồn chính thức để đọc mô tả tiêu chí chấm; cần xem riêng phiên bản Academic/General Training và yêu cầu của kỳ thi.",
    },
  ];

  var dialog = document.getElementById("practice-dialog");
  var content = document.getElementById("practice-content");
  var toast = document.getElementById("toast");
  var questionIndex = 0;
  var reviewCount = 0;
  var toastTimer;

  function persist() {
    Core.saveState(window.localStorage, state);
    render();
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  function renderGoals() {
    var goals = Core.dailyGoals(state);
    document.getElementById("goal-summary").textContent =
      goals.filter(function (goal) {
        return goal.done;
      }).length + "/3 nhiệm vụ";
    document.getElementById("goal-list").innerHTML = goals
      .map(function (goal) {
        return (
          '<article class="goal-row ' +
          (goal.done ? "is-done" : "") +
          '">' +
          '<span class="goal-check" aria-hidden="true">' +
          (goal.done ? "✓" : "○") +
          "</span>" +
          '<span class="goal-copy"><b>' +
          Core.escapeHtml(goal.label) +
          '</b><span class="goal-meter"><i style="width:' +
          goal.progress +
          '%"></i></span></span>' +
          '<span class="goal-reward">' +
          (goal.claimed ? "✓ Đã nhận" : "✦ " + goal.reward + " XP") +
          "</span></article>"
        );
      })
      .join("");
  }

  function renderWeek() {
    var now = new Date();
    var labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    var day = now.getDay();
    var mondayOffset = (day + 6) % 7;
    var monday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - mondayOffset,
    );
    var dots = labels
      .map(function (label, index) {
        var date = new Date(
          monday.getFullYear(),
          monday.getMonth(),
          monday.getDate() + index,
        );
        var key = Core.localDateKey(date);
        var active = state.history.indexOf(key) !== -1;
        var current = index === mondayOffset;
        return (
          '<span class="week-day ' +
          (active ? "is-done" : "") +
          (current ? " is-today" : "") +
          '" aria-label="' +
          label +
          (active ? ", đã học" : "") +
          '"><i>' +
          (active ? "✓" : "·") +
          "</i><small>" +
          label +
          "</small></span>"
        );
      })
      .join("");
    document.getElementById("week-dots").innerHTML = dots;
  }

  function renderReferences() {
    document.getElementById("reference-list").innerHTML = references
      .map(function (reference) {
        var search = encodeURIComponent(
          reference.authors + " " + reference.title,
        );
        var scholar = "https://scholar.google.com/scholar?q=" + search;
        var doi = reference.doi
          ? '<a href="https://doi.org/' +
            encodeURIComponent(reference.doi) +
            '" rel="noopener noreferrer">DOI ' +
            Core.escapeHtml(reference.doi) +
            "</a>"
          : "";
        var official = reference.url
          ? '<a href="' +
            Core.escapeHtml(reference.url) +
            '" rel="noopener noreferrer">Trang IELTS chính thức</a>'
          : "";
        return (
          '<li class="reference-item"><div><b>' +
          Core.escapeHtml(reference.authors) +
          "</b> <span>" +
          Core.escapeHtml(reference.title) +
          "</span> <i>" +
          Core.escapeHtml(reference.source) +
          "</i></div><p>" +
          Core.escapeHtml(reference.note) +
          '</p><div class="reference-links"><a href="' +
          scholar +
          '" rel="noopener noreferrer">Tra cứu Google Scholar ↗</a>' +
          doi +
          official +
          "</div></li>"
        );
      })
      .join("");
  }

  function render() {
    var level = Core.levelForXp(state.xp);
    document.getElementById("streak-count").textContent = state.streak;
    document.getElementById("hero-streak").textContent = state.streak;
    document.getElementById("total-xp").textContent = state.xp + " XP";
    document.getElementById("level-pill").textContent = "Cấp " + level.level;
    document.getElementById("level-copy").textContent =
      level.current + " / " + level.needed + " XP đến cấp tiếp theo";
    document.getElementById("level-percent").textContent = level.progress + "%";
    document.getElementById("level-bar").style.width = level.progress + "%";
    document.getElementById("weekly-xp").textContent = state.weekXp + " XP";
    renderGoals();
    renderWeek();
  }

  function questionMarkup(question, index, total) {
    return (
      '<div class="practice-top"><span class="eyebrow">TỪ VỰNG HỌC THUẬT · BÀI NGẮN</span><span>' +
      (index + 1) +
      " / " +
      total +
      "</span></div>" +
      '<div class="practice-progress"><span style="width:' +
      Math.round((index / total) * 100) +
      '%"></span></div>' +
      '<h2 id="practice-title">Chọn đáp án phù hợp</h2>' +
      '<p class="question-prompt">' +
      Core.escapeHtml(question.prompt) +
      "</p>" +
      '<p class="question-translation">' +
      Core.escapeHtml(question.translation) +
      "</p>" +
      '<div class="answer-options">' +
      question.options
        .map(function (option, optionIndex) {
          return (
            '<button type="button" class="answer-option" data-answer="' +
            Core.escapeHtml(option) +
            '"><span>' +
            String.fromCharCode(65 + optionIndex) +
            "</span>" +
            Core.escapeHtml(option) +
            "</button>"
          );
        })
        .join("") +
      '</div><div class="answer-feedback" id="answer-feedback" aria-live="polite"></div>'
    );
  }

  function openLesson() {
    questionIndex = 0;
    content.innerHTML = questionMarkup(
      questions[questionIndex],
      questionIndex,
      questions.length,
    );
    dialog.showModal();
    bindAnswerButtons();
  }

  function bindAnswerButtons() {
    Array.prototype.forEach.call(
      content.querySelectorAll("[data-answer]"),
      function (button) {
        button.addEventListener("click", function () {
          var result = Core.applyAnswer(
            state,
            questions[questionIndex],
            button.getAttribute("data-answer"),
            new Date(),
          );
          var rewardResult = Core.claimGoalRewards(result.state, new Date());
          state = rewardResult.state;
          Array.prototype.forEach.call(
            content.querySelectorAll("[data-answer]"),
            function (option) {
              option.disabled = true;
            },
          );
          var feedback = document.getElementById("answer-feedback");
          var correctAnswer = questions[questionIndex].answer;
          feedback.className =
            "answer-feedback " + (result.correct ? "is-correct" : "is-wrong");
          var rewardCopy = rewardResult.reward
            ? " · thưởng nhiệm vụ +" + rewardResult.reward + " XP"
            : "";
          var feedbackTitle = result.correct
            ? "Đúng rồi! +12 XP"
            : "Chưa chính xác — đáp án là “" +
              Core.escapeHtml(correctAnswer) +
              "”. +1 XP";
          feedback.innerHTML =
            "<b>" +
            feedbackTitle +
            rewardCopy +
            "</b><p>" +
            Core.escapeHtml(questions[questionIndex].explanation) +
            '</p><button class="button button-navy" type="button" id="next-question">' +
            (questionIndex === questions.length - 1
              ? "Hoàn thành bài"
              : "Câu tiếp theo") +
            ' <span aria-hidden="true">→</span></button>';
          persist();
          document
            .getElementById("next-question")
            .addEventListener("click", nextQuestion);
        });
      },
    );
  }

  function nextQuestion() {
    questionIndex += 1;
    if (questionIndex >= questions.length) {
      state = Core.completeLesson(state, new Date());
      state = Core.claimGoalRewards(state, new Date()).state;
      persist();
      content.innerHTML =
        '<div class="lesson-finish"><span class="finish-icon" aria-hidden="true">✦</span><p class="eyebrow">HOÀN THÀNH CHẶNG HỌC</p><h2 id="practice-title">Bạn đã tiến thêm một bước.</h2><p>Hôm nay bạn trả lời đúng ' +
        state.correct +
        " trên " +
        state.answers +
        " câu. Tỷ lệ chính xác: " +
        Core.accuracy(state) +
        '%.</p><div class="finish-stats"><span><b>+' +
        state.todayXp +
        "</b><small>XP hôm nay</small></span><span><b>" +
        state.streak +
        '</b><small>ngày liên tục</small></span></div><button class="button button-navy" type="button" id="close-finish">Quay lại lộ trình</button></div>';
      document
        .getElementById("close-finish")
        .addEventListener("click", function () {
          dialog.close();
          showToast("Đã lưu tiến độ học trên thiết bị này.");
        });
      return;
    }
    content.innerHTML = questionMarkup(
      questions[questionIndex],
      questionIndex,
      questions.length,
    );
    bindAnswerButtons();
  }

  function openReview() {
    reviewCount = 0;
    renderReview();
    dialog.showModal();
  }

  function renderReview() {
    var items = [
      {
        word: "allocate",
        meaning: "phân bổ; dành ra",
        sample: "The council allocated funds for public transport.",
      },
      {
        word: "consequently",
        meaning: "do đó; vì vậy",
        sample:
          "The sample was limited; consequently, more research is needed.",
      },
      {
        word: "maintain",
        meaning: "duy trì; bảo dưỡng",
        sample: "It is important to maintain a balanced study routine.",
      },
    ];
    if (reviewCount >= items.length) {
      content.innerHTML =
        '<div class="lesson-finish"><span class="finish-icon" aria-hidden="true">↻</span><p class="eyebrow">ÔN TẬP XONG</p><h2 id="practice-title">Ba từ đã được nhắc lại.</h2><p>Ôn cách quãng giúp bạn chủ động nhớ lại từ và xem lại chúng vào một ngày khác.</p><button class="button button-navy" type="button" id="close-finish">Trở về tổng quan</button></div>';
      document
        .getElementById("close-finish")
        .addEventListener("click", function () {
          dialog.close();
        });
      return;
    }
    var item = items[reviewCount];
    content.innerHTML =
      '<div class="practice-top"><span class="eyebrow">ÔN TẬP THÔNG MINH</span><span>' +
      (reviewCount + 1) +
      " / " +
      items.length +
      '</span></div><div class="practice-progress"><span style="width:' +
      Math.round((reviewCount / items.length) * 100) +
      '%"></span></div><h2 id="practice-title">Nhớ lại nghĩa của từ</h2><div class="review-word">' +
      Core.escapeHtml(item.word) +
      '</div><p class="review-meaning">' +
      Core.escapeHtml(item.meaning) +
      '</p><p class="question-translation">' +
      Core.escapeHtml(item.sample) +
      '</p><button class="button button-navy review-next" type="button" id="review-next">Đã ôn xong · +3 XP <span aria-hidden="true">→</span></button>';
    document
      .getElementById("review-next")
      .addEventListener("click", function () {
        reviewCount += 1;
        state = Core.completeReview(state, new Date());
        state = Core.claimGoalRewards(state, new Date()).state;
        persist();
        renderReview();
      });
  }

  function openReset() {
    content.innerHTML =
      '<div class="lesson-finish"><span class="finish-icon" aria-hidden="true">↺</span><h2 id="practice-title">Xóa tiến độ học?</h2><p>Thao tác này chỉ xóa chuỗi ngày, XP và thành tích lưu trên trình duyệt hiện tại. Không thể hoàn tác.</p><div class="reset-actions"><button class="button button-outline" type="button" id="cancel-reset">Giữ lại</button><button class="button button-danger" type="button" id="confirm-reset">Xóa tiến độ</button></div></div>';
    dialog.showModal();
    document
      .getElementById("cancel-reset")
      .addEventListener("click", function () {
        dialog.close();
      });
    document
      .getElementById("confirm-reset")
      .addEventListener("click", function () {
        window.localStorage.removeItem(Core.STORAGE_KEY);
        state = Core.createInitialState(new Date());
        persist();
        dialog.close();
        showToast("Đã xóa tiến độ trên thiết bị này.");
      });
  }

  function navigateTo(id) {
    var target = document.getElementById(id);
    if (target)
      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
  }

  document.addEventListener("click", function (event) {
    var action = event.target.closest("[data-action]");
    var view = event.target.closest("[data-view]");
    if (action) {
      var type = action.getAttribute("data-action");
      if (type === "lesson") openLesson();
      if (type === "review") openReview();
      if (type === "reset") openReset();
      if (type === "print") {
        document.body.classList.add("print-evidence");
        window.setTimeout(function () {
          window.print();
        }, 40);
      }
    }
    if (view) {
      var targetId = view.getAttribute("data-view");
      if (targetId) {
        event.preventDefault();
        navigateTo(targetId);
        history.replaceState(null, "", "#" + targetId);
      }
    }
  });
  window.addEventListener("afterprint", function () {
    document.body.classList.remove("print-evidence");
  });
  document.getElementById("today-label").textContent = new Intl.DateTimeFormat(
    "vi-VN",
    { weekday: "long", day: "numeric", month: "long" },
  )
    .format(today)
    .toLocaleUpperCase("vi-VN");
  renderReferences();
  render();
})();
