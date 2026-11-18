/* ai-tutor.js — Nói / Viết điểm quỹ + Thi thử toàn phần trường thi */
(function () {
  "use strict";

  var A = window.YYSD_AUTH;
  if (!A ||!A.requireLogin ||!A.requireLogin()) return;

  var API_BASE = A.API_BASE;
  var SILENCE_MS = 5000;
  var PART2_PREP = 60;
  var PART2_SPEAK = 120;

  var track = "hub"; // hub | speaking-home | practice | tutor | mock | writing
  var writingOnly = (new URLSearchParams(location.search).get("track") || "").toLowerCase() === "writing";
  var sessionId = null;
  var examPack = null;
  var bank = null;
  var writingBank = null;
  var lastQuota = null;
  var busy = false;
  var audioUnlocked = false;
  var lastAssistantText = "";
  var lastAssistantAudioUrl = null;

  // recording
  var recorder = null;
  var chunks = [];
  var recStartedAt = 0;
  var mediaStream = null;
  var silenceTimer = null;
  var audioCtx = null;
  var analyser = null;
  var silenceRaf = null;
  var pendingBlob = null;
  var pendingSec = 0;
  var pendingText = "";
  var recMode = "manual"; // manual | auto
  var hardStopTimer = null;
  var turnLog = []; // {q, a, valid, audioUrl}
  var currentQ = "";

  // mock timers
  var examStartedAt = 0;
  var totalTimer = null;
  var prepTimer = null;
  var phase = "idle"; // idle | waiting | part1 | part2_prep | part2_speak | part3 | done
  var inPart2Speak = false;

  var elQuota = document.getElementById("quota-box");
  var elQuotaHub = document.getElementById("quota-hub");
  var elQuotaWriting = document.getElementById("quota-writing");
  var elList = document.getElementById("session-list");
  var elMsgs = document.getElementById("messages");
  var elHint = document.getElementById("status-hint");
  var elInput = document.getElementById("input");
  var elMic = document.getElementById("btn-mic");
  var elSend = document.getElementById("btn-send");
  var elGrade = document.getElementById("btn-grade");
  var elPicker = document.getElementById("topic-picker");
  var elPracticeBar = document.getElementById("practice-bar");
  var elInputRow = document.getElementById("input-row");
  var elPageBack = document.getElementById("page-back");
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function esc(s) {
    return String(s == null? "": s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c];
    });
  }

  function hint(msg, kind) {
    if (!elHint) return;
    elHint.textContent = msg || "";
    elHint.className = "ai-room__hint-inline" + (kind? " is-" + kind: "");
  }

  // ponytail: quota UX — one place for 429 copy so buttons don't look "dead"
  function quotaMsg(msg) {
    msg = String(msg || " Đã hết hạn mức hôm nay ");
    if (/ ngày mai | ngày mai /.test(msg)) return msg;
    if (/ hạn mức cao nhất | sử dụng hết | khoản độ |quota/i.test(msg)) return msg.replace(/[.!!]?$/, "") + ", hẹn gặp lại ngày mai ";
    return msg;
  }

  function looksLikeJsonLeak(s) {
    s = String(s || "").trim();
    return!s? false: (s.indexOf("WRITING_JSON") >= 0 || s.charAt(0) === "{" || s.charAt(0) === "[");
  }

  function api(path, opts) {
    opts = opts || {};
    var headers = opts.headers || { "Content-Type": "application/json" };
    var t = A.getToken();
    if (t) headers.Authorization = "Bearer " + t;
    return fetch(API_BASE + path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body!= null? JSON.stringify(opts.body): undefined
    }).then(function (r) {
      return r.text().then(function (text) {
        var d = null;
        try { d = text? JSON.parse(text): {}; } catch (e) {
          throw new Error(" Máy chủ phản hồi bất thường (" + r.status + ") ");
        }
        if (!r.ok) {
          var raw = (d && d.error) || "Yêu cầu thất bại";
          var err = new Error(r.status === 429? quotaMsg(raw): raw);
          err.quota = d && d.quota;
          err.status = r.status;
          throw err;
        }
        return d;
      });
    });
  }

  function showView(name) {
    track = name;
    document.body.setAttribute("data-ai-view", name);
    ["view-hub", "view-speaking-home", "view-speak-room", "view-writing"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.hidden = true;
    });
    var map = {
      hub: "view-hub",
      "speaking-home": "view-speaking-home",
      practice: "view-speak-room",
      tutor: "view-speak-room",
      writing: "view-writing"
    };
    var id = map[name];
    if (id) document.getElementById(id).hidden = false;

    var title = document.getElementById("page-title");
    var desc = document.getElementById("page-desc");
    var crumb = document.getElementById("crumb-here");
    if (elPageBack) {
      if (writingOnly && name === "writing") {
        elPageBack.hidden = false;
        elPageBack.setAttribute("data-back", "zone-mock");
      } else if (name === "hub") {
        elPageBack.hidden = true;
      } else if (name === "speaking-home" || name === "writing") {
        elPageBack.hidden = false;
        elPageBack.setAttribute("data-back", "hub");
      } else {
        elPageBack.hidden = false;
        elPageBack.setAttribute("data-back", "speaking-home");
      }
    }
    if (name === "hub") {
      title.textContent = "AI Trợ giảng IELTS ";
      desc.textContent = " trước chọn Nói hoặc Viết, một lần chỉ làm một sự kiện. ";
      crumb.textContent = "AI Trợ giảng IELTS ";
    } else if (name === "speaking-home") {
      title.textContent = "Nói";
      desc.textContent = " Thi thử theo nhịp độ thi thật; Luyện tập có thể chọn câu và ghi âm lại; Trợ giảng có thể gõ chữ. ";
      crumb.textContent = "Nói";
    } else if (name === "practice") {
      title.textContent = " Luyện tập đề thi thật ";
      desc.textContent = " Chọn chủ đề rồi bắt đầu; trả lời bằng micro, có thể nghe lại / ghi âm lại. ";
      crumb.textContent = " Nói · Luyện tập ";
    } else if (name === "tutor") {
      title.textContent = " Trò chuyện cùng Trợ giảng ";
      desc.textContent = " Nói mạch suy nghĩ và biểu đạt vấn đề có thể đánh chữ, cũng có thể Âm thanh. ";
      crumb.textContent = " Nói · phụ đạo ";
    } else if (name === "writing") {
      title.textContent = " Chấm bài Viết ";
      desc.textContent = " Chọn đề làm trước, sau đó dán bài viết và nộp để chấm bài. ";
      crumb.textContent = writingOnly? " IELTS · AI Chấm bài Viết ": "Viết";
    }

    var examOn =!document.getElementById("exam-overlay").hidden;
    document.getElementById("site-header").hidden = examOn;
    document.getElementById("page-head").hidden = examOn;
    document.getElementById("site-footer").hidden = examOn;
  }

  function renderQuota(q) {
    if (q) lastQuota = q;
    var html;
    var exhausted = false;
    if (!q) html = " khoản độ Tải dữ liệu thất bại ";
    else if (q.unlimited) html = " Quản trị viên tài khoản: AI Nói / Viết khoản độ không hạn ";
    else {
      exhausted = (q.textLeft <= 0 && q.voiceSecLeft <= 0 && q.fullMockLeft <= 0);
      html =
        " hôm nay còn thừa: văn tự <b>" + q.textLeft + "</b>/" + q.textLimit +
        " · Âm thanh <b>" + Math.floor(q.voiceSecLeft / 60) + ":" + String(q.voiceSecLeft % 60).padStart(2, "0") + "</b>" +
        " · Thi thử <b>" + q.fullMockLeft + "</b>/" + q.fullMockLimit;
      if (exhausted) html += " · <b> hôm nay Đã dùng hết, hẹn gặp lại ngày mai </b>";
      else if (q.textLeft <= 0) html += " · văn tự khoản độ Đã dùng hết, hẹn gặp lại ngày mai ";
    }
    if (elQuota) elQuota.innerHTML = html;
    if (elQuotaHub) elQuotaHub.innerHTML = html;
    if (elQuotaWriting) elQuotaWriting.innerHTML = html;
    applyQuotaControls();
  }

  function applyQuotaControls() {
    var q = lastQuota;
    var unlimited =!!(q && q.unlimited);
    var textGone =!!(q &&!unlimited && q.textLeft <= 0);
    var voiceGone =!!(q &&!unlimited && q.voiceSecLeft <= 0);
    if (elSend) {
      elSend.disabled = busy || textGone;
      if (textGone) elSend.title = " hôm nay văn tự khoản độ Đã dùng hết, hẹn gặp lại ngày mai ";
      else elSend.removeAttribute("title");
    }
    if (elMic) {
      // keep stoppable while recording even if voice quota just hit
      var micOn = elMic.classList.contains("is-on");
      elMic.disabled =!micOn && (busy || voiceGone);
      if (voiceGone &&!micOn) elMic.title = " hôm nay Âm thanh khoản độ Đã dùng hết, hẹn gặp lại ngày mai ";
      else elMic.removeAttribute("title");
    }
    if (elGrade) {
      elGrade.disabled = busy || textGone;
      if (textGone) elGrade.title = " hôm nay văn tự khoản độ Đã dùng hết, hẹn gặp lại ngày mai ";
      else elGrade.removeAttribute("title");
    }
  }

  function loadQuota() {
    return api("/api/ai-tutor/quota").then(function (d) { renderQuota(d.quota); })
      .catch(function (e) {
        var msg = (e && e.message) || " khoản độ Tải dữ liệu thất bại ";
        if (elQuota) elQuota.textContent = msg;
        if (elQuotaHub) elQuotaHub.textContent = msg;
      });
  }

  function scoreCardHTML(score) {
    if (!score) return "";
    return '<div class="ai-score">' +
      "<h3> Nói cho điểm · Overall " + esc(score.overall) + "</h3>" +
      "<dl>" +
      "<dt>Fluency</dt><dd>" + esc(score.fluency) + "</dd>" +
      "<dt>Lexical</dt><dd>" + esc(score.lexical) + "</dd>" +
      "<dt>Grammar</dt><dd>" + esc(score.grammar) + "</dd>" +
      "<dt>Pronunciation</dt><dd>" + esc(score.pronunciation) + "</dd>" +
      "</dl>" +
      (score.comment? "<p>" + esc(score.comment) + "</p>": "") +
      "</div>";
  }

  function appendMsg(role, content, meta) {
    if (!elMsgs) return;
    var empty = elMsgs.querySelector(".ai-tutor__empty");
    if (empty) empty.remove();
    var div = document.createElement("div");
    div.className = "ai-msg ai-msg--" + (role === "assistant"? "assistant": "user");
    if (meta && meta.answerInvalid) div.classList.add("is-invalid");
    var body = document.createElement("div");
    body.textContent = content;
    div.appendChild(body);
    if (role === "assistant" && content && track === "practice") {
      var actions = document.createElement("div");
      actions.className = "ai-msg__actions";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn--ghost btn--sm";
      btn.textContent = " Nghe lại ";
      btn.addEventListener("click", function () { playTts(content); });
      actions.appendChild(btn);
      div.appendChild(actions);
    }
    elMsgs.appendChild(div);
    if (meta && meta.score) {
      var wrap = document.createElement("div");
      wrap.innerHTML = scoreCardHTML(meta.score);
      if (wrap.firstChild) elMsgs.appendChild(wrap.firstChild);
    }
    elMsgs.scrollTop = elMsgs.scrollHeight;
  }

  function playTts(text) {
    text = String(text || "").trim();
    if (!text) return Promise.resolve();
    lastAssistantText = text;
    return api("/api/ai-tutor/tts", { method: "POST", body: { text: text.slice(0, 600) } })
      .then(function (d) {
        lastAssistantAudioUrl = d.url;
        return new Promise(function (resolve) {
          var audio = new Audio(d.url);
          audio.onended = function () { resolve(); };
          audio.onerror = function () { resolve(); };
          var p = audio.play();
          if (p && p.catch) {
            p.catch(function () {
              try {
                var u = new SpeechSynthesisUtterance(text);
                u.lang = /[àáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/i.test(text) ? "vi-VN" : "en-GB";
                u.onend = function () { resolve(); };
                window.speechSynthesis.speak(u);
              } catch (e) { resolve(); }
            });
          }
        });
      })
      .catch(function () {
        return new Promise(function (resolve) {
          try {
            var u = new SpeechSynthesisUtterance(text);
            u.lang = "en-GB";
            u.onend = function () { resolve(); };
            window.speechSynthesis.speak(u);
          } catch (e) { resolve(); }
        });
      });
  }

  function detectCueCard(text) {
    return /one minute to prepare|You should say|I'd like you to describe|cue card/i.test(text || "");
  }

  function detectPart3(text) {
    return /part\s*3|let'?s (move|talk) (on|about)|more general questions/i.test(text || "");
  }

  function formatClock(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function setExamPhase(p, label) {
    phase = p;
    var el = document.getElementById("exam-phase");
    if (el) el.textContent = label || p;
  }

  function setExamStatus(msg) {
    var el = document.getElementById("exam-status");
    if (el) el.textContent = msg || "";
  }

  function clearSilenceWatch() {
    if (silenceRaf) cancelAnimationFrame(silenceRaf);
    silenceRaf = null;
    if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
    if (analyser && audioCtx) {
      try { audioCtx.close(); } catch (e) {}
    }
    audioCtx = null;
    analyser = null;
  }

  function clearHardStop() {
    if (hardStopTimer) { clearTimeout(hardStopTimer); hardStopTimer = null; }
  }

  function stopTracks() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(function (t) { t.stop(); });
      mediaStream = null;
    }
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(fr.result); };
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  }

  function watchSilence(stream, onSilent) {
    clearSilenceWatch();
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var src = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      var data = new Uint8Array(analyser.frequencyBinCount);
      var silentSince = null;
      function tick() {
        if (!analyser) return;
        analyser.getByteTimeDomainData(data);
        var sum = 0;
        for (var i = 0; i < data.length; i++) {
          var v = (data[i] - 128) / 128;
          sum += v * v;
        }
        var rms = Math.sqrt(sum / data.length);
        if (rms < 0.02) {
          if (!silentSince) silentSince = Date.now();
          else if (Date.now() - silentSince >= SILENCE_MS) {
            clearSilenceWatch();
            onSilent();
            return;
          }
        } else {
          silentSince = null;
        }
        silenceRaf = requestAnimationFrame(tick);
      }
      silenceRaf = requestAnimationFrame(tick);
    } catch (e) {
      // ponytail: no AudioContext → rely on submit / hard-stop only
    }
  }

  function reopenMockMic(msg) {
    if (track!== "mock" || phase === "done" || phase === "part2_prep") return;
    setExamStatus((msg || " phạm sai lầm ") + " — mời lại đáp một lần ");
    // next tick: busy may still be clearing in sendChat.finally
    setTimeout(function () {
      if (track!== "mock" || phase === "done" || phase === "part2_prep") return;
      if (recorder && recorder.state === "recording") return;
      startRec({ auto: true, part2: inPart2Speak });
    }, 80);
  }

  function finishRec(reason) {
    clearSilenceWatch();
    clearHardStop();
    if (!recorder || recorder.state === "inactive") return;
    recorder._stopReason = reason || "manual";
    recorder.stop();
  }

  function startRec(opts) {
    opts = opts || {};
    recMode = opts.auto? "auto": "manual";
    inPart2Speak =!!opts.part2;
    // ponytail: mock auto-open runs inside sendChat while busy=true; don't block system mic
    if (busy &&!opts.auto) return;
    if (!navigator.mediaDevices ||!navigator.mediaDevices.getUserMedia) {
      hint(" trước mắt trình duyệt không hỗ trợ ghi âm ", "error");
      setExamStatus(" không cách nào sử dụng microphone ");
      return;
    }
    if (!sessionId) return;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      mediaStream = stream;
      chunks = [];
      var mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")? "audio/webm;codecs=opus"
        : (MediaRecorder.isTypeSupported("audio/webm")? "audio/webm": "");
      recorder = mime? new MediaRecorder(stream, { mimeType: mime }): new MediaRecorder(stream);
      recorder._stopReason = "manual";
      recorder.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      recorder.onstop = function () {
        var reason = recorder._stopReason || "manual";
        elMic.classList.remove("is-on");
        elMic.setAttribute("aria-pressed", "false");
        applyQuotaControls();
        document.getElementById("btn-exam-submit").hidden = true;
        var sec = Math.max(1, Math.round((Date.now() - recStartedAt) / 1000));
        var blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        stopTracks();
        clearSilenceWatch();
        clearHardStop();

        if (reason === "silence") {
          var url = URL.createObjectURL(blob);
          turnLog.push({ q: currentQ, a: "(silence — invalid)", valid: false, audioUrl: url });
          if (track === "mock") setExamStatus(" Hết thời gian chờ do im lặng, câu trả lời không hợp lệ, chuyển sang câu tiếp theo…");
          else hint(" Hết thời gian chờ do im lặng, câu trả lời tính là không hợp lệ ", "error");
          sendChat({ answerInvalid: true, audioSec: sec });
          return;
        }

        if (track === "practice") {
          pendingBlob = blob;
          pendingSec = sec;
          hint(" Đang nhận diện …");
          blobToDataUrl(blob).then(function (dataUrl) {
            return api("/api/ai-tutor/asr", { method: "POST", body: { audio: dataUrl, audioSec: sec } });
          }).then(function (d) {
            if (d.quota) renderQuota(d.quota);
            pendingText = d.text;
            document.getElementById("btn-rerecord").hidden = false;
            document.getElementById("btn-confirm-rec").hidden = false;
            hint(" phân biệt kết quả: «" + pendingText.slice(0, 80) + (pendingText.length > 80? "…": "") + "» Xác nhận gửi đi hoặc ghi lần nữa chế ");
          }).catch(function (e) {
            if (e.quota) renderQuota(e.quota);
            hint(e.message || " Nhận diện thất bại ", "error");
          });
          return;
        }

        // mock / tutor voice path: send immediately
        hint(" Đang nhận diện …");
        setExamStatus(" Đang nhận diện …");
        blobToDataUrl(blob).then(function (dataUrl) {
          return api("/api/ai-tutor/asr", { method: "POST", body: { audio: dataUrl, audioSec: sec } })
            .then(function (d) {
              if (d.quota) renderQuota(d.quota);
              var url = URL.createObjectURL(blob);
              turnLog.push({ q: currentQ, a: d.text, valid: true, audioUrl: url });
              return sendChat({ content: d.text, audioSec: sec });
            });
        }).catch(function (e) {
          if (e.quota) renderQuota(e.quota);
          hint(e.message || " Âm thanh Nhận diện thất bại ", "error");
          setExamStatus(e.message || " Nhận diện thất bại ");
          reopenMockMic(e.message || " Nhận diện thất bại ");
        });
      };

      recorder.start();
      recStartedAt = Date.now();
      elMic.classList.add("is-on");
      elMic.setAttribute("aria-pressed", "true");
      applyQuotaControls();

      if (opts.auto) {
        document.getElementById("btn-exam-submit").hidden = false;
        setExamStatus(inPart2Speak? " Vui lòng bắt đầu nói (tối đa 2 phút, nói xong có thể nhấn Nộp bài) ": " Mời bạn trả lời (nói xong nhấn Nộp bài; im lặng quá 5 giây câu trả lời sẽ không hợp lệ) ");
        watchSilence(stream, function () { finishRec("silence"); });
        if (inPart2Speak) {
          var left = PART2_SPEAK;
          document.getElementById("exam-subwrap").hidden = false;
          document.getElementById("exam-sublabel").textContent = "Speak";
          document.getElementById("exam-sub").textContent = formatClock(left);
          hardStopTimer = setInterval(function () {
            left -= 1;
            document.getElementById("exam-sub").textContent = formatClock(Math.max(0, left));
            if (left <= 0) {
              clearInterval(hardStopTimer);
              hardStopTimer = null;
              finishRec("hardstop");
            }
          }, 1000);
        } else {
          document.getElementById("exam-subwrap").hidden = true;
        }
      } else {
        hint(" Đang ghi âm… nhấn lại biểu tượng micro để kết thúc ", "rec");
      }
    }).catch(function () {
      hint(" không cách nào sử dụng microphone, mời kiểm tra quyền hạn ", "error");
      setExamStatus(" microphone quyền hạn bị cự tuyệt ");
    });
  }

  function sendChat(opts) {
    opts = opts || {};
    if (busy) return Promise.resolve();
    if (!sessionId) return Promise.resolve();
    busy = true;
    applyQuotaControls();
    var body = {
      sessionId: sessionId,
      content: opts.content || "",
      audioSec: opts.audioSec || 0,
      answerInvalid:!!opts.answerInvalid
    };
    if (!opts.answerInvalid && track!== "mock") {
      appendMsg("user", body.content);
    } else if (opts.answerInvalid && track!== "mock") {
      appendMsg("user", " (Hết thời gian chờ · câu trả lời không hợp lệ) ", { answerInvalid: true });
    }
    if (track === "mock") {
      setExamStatus(" giám khảo trong suy tính …");
    } else {
      hint(" trong suy tính …");
    }

    return api("/api/ai-tutor/chat", { method: "POST", body: body }).then(function (d) {
      if (d.quota) renderQuota(d.quota);
      currentQ = d.reply || "";
      // release busy before auto-mic / TTS follow-up so the next turn can open mic
      busy = false;
      applyQuotaControls();
      if (track!== "mock") {
        appendMsg("assistant", d.reply || "", d.score? { score: d.score }: null);
      }
      if (d.score) {
        handleExamComplete(d.score, d.reply);
        return;
      }
      if (track === "mock") {
        return handleMockExaminerTurn(d.reply || "");
      }
      if (track === "practice" || track === "tutor") {
        return playTts(d.reply || "").then(function () {
          hint(track === "practice"? " Nhấn vào micro để trả lời; có thể nghe lại câu hỏi của giám khảo ": "");
        });
      }
    }).catch(function (e) {
      if (e.quota) renderQuota(e.quota);
      hint(e.message || " Gửi thất bại ", "error");
      setExamStatus(e.message || " Gửi thất bại ");
      reopenMockMic(e.message || " Gửi thất bại ");
    }).then(function () {
      busy = false;
      applyQuotaControls();
      loadSessions();
    });
  }

  function handleExamComplete(score, reply) {
    phase = "done";
    clearSilenceWatch();
    clearHardStop();
    if (totalTimer) { clearInterval(totalTimer); totalTimer = null; }
    if (prepTimer) { clearInterval(prepTimer); prepTimer = null; }
    if (track === "mock") {
      document.getElementById("exam-overlay").hidden = true;
      showReview(score, reply);
    } else {
      hint(" bổn tràng đã chấm dứt ");
      if (reply) playTts(reply);
    }
    showView(track === "mock"? "speaking-home": track);
    document.getElementById("site-header").hidden = false;
    document.getElementById("page-head").hidden = false;
    document.getElementById("site-footer").hidden = false;
  }

  function showReview(score, reply) {
    var ov = document.getElementById("review-overlay");
    ov.hidden = false;
    document.getElementById("review-score").innerHTML = scoreCardHTML(score);
    var tips = (score && score.improvements) || [];
    document.getElementById("review-tips").innerHTML = tips.length
      ? "<h3> cải tiến đề nghị </h3><ul>" + tips.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>"
      : (score && score.comment? "<p>" + esc(score.comment) + "</p>": "");
    if (reply) {
      document.getElementById("review-tips").innerHTML += "<p class=\"ai-review__closing\">" + esc(reply) + "</p>";
    }
    document.getElementById("review-turns").innerHTML =
      "<h3> trục câu xem (ghi âm chỉ Lưu tại thiết bị này lần này) </h3>" +
      turnLog.map(function (t, i) {
        return '<div class="ai-review__turn">' +
          "<b>Q" + (i + 1) + "</b><p>" + esc(t.q || "") + "</p>" +
          "<b>A</b><p class=\"" + (t.valid? "": "is-invalid") + "\">" + esc(t.a || "") + "</p>" +
          (t.audioUrl? '<audio controls src="' + t.audioUrl + '"></audio>': "") +
          "</div>";
      }).join("") || "<p> tạm thời chưa có đáp lại ghi chép </p>";
  }

  function startTotalClock() {
    examStartedAt = Date.now();
    if (totalTimer) clearInterval(totalTimer);
    totalTimer = setInterval(function () {
      var sec = Math.floor((Date.now() - examStartedAt) / 1000);
      document.getElementById("exam-total").textContent = formatClock(sec);
    }, 1000);
  }

  function startPart2Prep() {
    setExamPhase("part2_prep", "Part 2 · Preparation");
    setExamStatus(" mời xem câu tạp, chuẩn bị 1 phút (sau khi kết thúc tự động Bắt đầu trần thuật) ");
    document.getElementById("btn-exam-submit").hidden = true;
    document.getElementById("exam-subwrap").hidden = false;
    document.getElementById("exam-sublabel").textContent = "Prep";
    var left = PART2_PREP;
    document.getElementById("exam-sub").textContent = formatClock(left);
    if (prepTimer) clearInterval(prepTimer);
    prepTimer = setInterval(function () {
      left -= 1;
      document.getElementById("exam-sub").textContent = formatClock(Math.max(0, left));
      if (left <= 0) {
        clearInterval(prepTimer);
        prepTimer = null;
        setExamPhase("part2_speak", "Part 2 · Long turn");
        setExamStatus(" xin bắt đầu trần thuật ");
        startRec({ auto: true, part2: true });
      }
    }, 1000);
  }

  function handleMockExaminerTurn(reply) {
    setExamStatus(reply);
    currentQ = reply;
    if (detectCueCard(reply)) {
      var cue = document.getElementById("exam-cue");
      cue.hidden = false;
      cue.textContent = reply;
      setExamPhase("part2_prep", "Part 2");
      return playTts(reply).then(function () { startPart2Prep(); });
    }
    if (detectPart3(reply)) setExamPhase("part3", "Part 3");
    else if (phase === "idle" || phase === "waiting") setExamPhase("part1", "Part 1");

    return playTts(reply).then(function () {
      if (phase === "part2_prep") return;
      startRec({ auto: true, part2: false });
    });
  }

  function openMockOverlay() {
    document.getElementById("exam-overlay").hidden = false;
    document.getElementById("btn-exam-start").hidden = false;
    document.getElementById("btn-exam-submit").hidden = true;
    document.getElementById("exam-cue").hidden = true;
    document.getElementById("exam-subwrap").hidden = true;
    setExamPhase("waiting", "Ready");
    setExamStatus(" nhấn vào « Bắt đầu cuộc thi » giải tỏa thanh âm đồng tiến nhập Toàn phần quá trình ");
    document.getElementById("site-header").hidden = true;
    document.getElementById("page-head").hidden = true;
    document.getElementById("site-footer").hidden = true;
    document.getElementById("ai-tutor-root").hidden = true;
  }

  function closeMockOverlay() {
    document.getElementById("exam-overlay").hidden = true;
    document.getElementById("ai-tutor-root").hidden = false;
    document.getElementById("site-header").hidden = false;
    document.getElementById("page-head").hidden = false;
    document.getElementById("site-footer").hidden = false;
  }

  function syncSpeakRoomUI() {
    var isPractice = track === "practice";
    var isTutor = track === "tutor";
    document.getElementById("room-label").textContent = isPractice? " Luyện tập đề thi thật ": " Trò chuyện cùng Trợ giảng ";
    document.getElementById("side-title").textContent = isPractice? " Luyện tập hội thoại ": " phụ đạo hội thoại ";
    elPicker.hidden =!(isPractice &&!sessionId);
    elPracticeBar.hidden =!isPractice;
    elInput.hidden =!isTutor;
    elSend.hidden =!isTutor;
    elMic.hidden = false;
    elInputRow.classList.toggle("is-mic-only", isPractice);
    if (isPractice) {
      hint(sessionId? " Chỉ trả lời bằng micro · có thể nghe lại / ghi âm lại ": " Vui lòng chọn đề trước khi bắt đầu luyện tập ");
    } else {
      hint(" Có thể gõ chữ hoặc nhấn vào micro ");
    }
  }

  function renderBankLists() {
    if (!bank) return;
    document.getElementById("bank-title").textContent = (bank.title || " Ngân hàng đề thi thật ") +
      (bank.source? " · " + bank.source: "");
    document.getElementById("part1-list").innerHTML = (bank.part1 || []).map(function (t) {
      return '<label><input type="checkbox" name="p1" value="' + esc(t.id) + '"> <span>' +
        esc(t.topic) + " (" + t.questionCount + ") </span></label>";
    }).join("");
    document.getElementById("part2-list").innerHTML = (bank.part2 || []).map(function (t) {
      return '<label><input type="radio" name="p2" value="' + esc(t.id) + '"> <span>' +
        esc(t.title) + "</span></label>";
    }).join("");
  }

  function loadBank() {
    return api("/api/ai-tutor/bank").then(function (d) {
      bank = d.bank;
      renderBankLists();
    }).catch(function (e) { hint(e.message || " Ngân hàng đề Tải dữ liệu thất bại ", "error"); });
  }

  function renderSessions(sessions) {
    elList.innerHTML = "";
    var filtered = (sessions || []).filter(function (s) {
      if (track === "practice") return s.mode === "examiner" && s.exam_mode === "practice";
      if (track === "tutor") return s.mode === "teacher";
      return true;
    });
    if (!filtered.length) {
      elList.innerHTML = '<li style="padding:8px;color:#5a6b7d;font-size:0.85rem"> tạm thời chưa có Lịch sử </li>';
      return;
    }
    filtered.forEach(function (s) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = s.id === sessionId? "is-active": "";
      var st = s.status === "incomplete"? "Chưa hoàn thành": (s.status === "complete"? "Đã hoàn thành": "");
      var noResume = s.status === "incomplete" &&
        (s.exam_mode === "mock" || (s.mode === "examiner" && s.exam_mode === "practice"));
      btn.innerHTML = "<span>" + esc(s.title || " hội thoại ") + '</span><span class="meta">' +
        esc(st + " · " + String(s.updated_at || "").slice(0, 16).replace("T", " ")) + "</span>";
      if (noResume) {
        btn.disabled = true;
        btn.title = " Chưa hoàn thành, không thể tục khảo thi — mời một lần nữa mở một cuộc ";
      }
      btn.addEventListener("click", function () {
        if (noResume) {
          hint(" Chưa hoàn thành, không thể tục khảo thi — mời một lần nữa mở một cuộc ", "error");
          return;
        }
        openSession(s.id);
      });
      li.appendChild(btn);
      elList.appendChild(li);
    });
  }

  function loadSessions() {
    return api("/api/ai-tutor/sessions").then(function (d) {
      renderSessions(d.sessions || []);
    });
  }

  function openSession(id) {
    if (busy) return;
    sessionId = id;
    return api("/api/ai-tutor/sessions/" + encodeURIComponent(id)).then(function (d) {
      examPack = d.examPack || null;
      elMsgs.innerHTML = "";
      (d.messages || []).forEach(function (m) {
        appendMsg(m.role, m.content, m.meta);
        if (m.role === "assistant") lastAssistantText = m.content;
      });
      syncSpeakRoomUI();
      loadSessions();
    });
  }

  function startPractice() {
    var p1 = Array.prototype.map.call(document.querySelectorAll('input[name="p1"]:checked'), function (el) {
      return el.value;
    });
    var p2el = document.querySelector('input[name="p2"]:checked');
    if (!p1.length) { hint(" mời ít nhất lựa chọn 1 Part 1 chủ đề ", "error"); return; }
    if (!p2el) { hint(" mời lựa chọn 1 Part 2 chủ đề ", "error"); return; }
    if (busy) return;
    busy = true;
    applyQuotaControls();
    hint(" đang tổ cuốn …");
    api("/api/ai-tutor/sessions", {
      method: "POST",
      body: { mode: "examiner", examMode: "practice", part1Ids: p1, part2Id: p2el.value }
    }).then(function (d) {
      if (d.quota) renderQuota(d.quota);
      sessionId = d.session.id;
      examPack = d.examPack;
      elMsgs.innerHTML = "";
      if (d.opener) {
        appendMsg("assistant", d.opener);
        lastAssistantText = d.opener;
        playTts(d.opener);
      }
      syncSpeakRoomUI();
      return loadSessions();
    }).catch(function (e) {
      if (e.quota) renderQuota(e.quota);
      hint(e.message || " Khởi động thất bại ", "error");
    }).then(function () { busy = false; applyQuotaControls(); });
  }

  function startTutor() {
    if (busy) return;
    busy = true;
    applyQuotaControls();
    api("/api/ai-tutor/sessions", { method: "POST", body: { mode: "teacher" } })
      .then(function (d) {
        if (d.quota) renderQuota(d.quota);
        sessionId = d.session.id;
        examPack = null;
        elMsgs.innerHTML = "";
        if (d.opener) appendMsg("assistant", d.opener);
        syncSpeakRoomUI();
        return loadSessions();
      }).catch(function (e) {
        if (e.quota) renderQuota(e.quota);
        hint(e.message || " sáng tạo thất bại ", "error");
      }).then(function () { busy = false; applyQuotaControls(); });
  }

  function startMock() {
    if (busy) return;
    if (lastQuota &&!lastQuota.unlimited && lastQuota.fullMockLeft <= 0) {
      hint(" hôm nay Thi thử số lần Đã dùng hết, hẹn gặp lại ngày mai ", "error");
      return;
    }
    turnLog = [];
    busy = true;
    applyQuotaControls();
    openMockOverlay();
    setExamStatus(" đang tổ cuốn …");
    api("/api/ai-tutor/sessions", { method: "POST", body: { mode: "examiner", examMode: "mock" } })
      .then(function (d) {
        if (d.quota) renderQuota(d.quota);
        sessionId = d.session.id;
        examPack = d.examPack;
        currentQ = d.opener || "";
        setExamStatus(" tổ cuốn hoàn thành. nhấn vào phía dưới Bắt đầu cuộc thi để giải Khóa thanh âm. ");
        document.getElementById("btn-exam-start").dataset.opener = d.opener || "";
      }).catch(function (e) {
        if (e.quota) renderQuota(e.quota);
        setExamStatus(e.message || " Khởi động thất bại ");
        closeMockOverlay();
        showView("speaking-home");
      }).then(function () { busy = false; applyQuotaControls(); });
  }

  function abandonMock() {
    if (!sessionId) {
      closeMockOverlay();
      showView("speaking-home");
      return;
    }
    finishRec("manual");
    clearSilenceWatch();
    clearHardStop();
    if (totalTimer) { clearInterval(totalTimer); totalTimer = null; }
    if (prepTimer) { clearInterval(prepTimer); prepTimer = null; }
    api("/api/ai-tutor/sessions/" + encodeURIComponent(sessionId) + "/abandon", { method: "POST", body: {} })
      .catch(function () {})
      .then(function () {
        sessionId = null;
        closeMockOverlay();
        showView("speaking-home");
        hint(" bổn tràng đã buông tha cho (Chưa hoàn thành), không thể tục khảo thi; có thể một lần nữa mở một cuộc ");
        loadQuota();
        loadSessions();
      });
  }

  /* Writing */
  function fillWritingPrompts() {
    if (!writingBank) return;
    var task = document.getElementById("w-task").value;
    var list = writingBank[task] || [];
    var sel = document.getElementById("w-prompt");
    sel.innerHTML = list.map(function (p) {
      return '<option value="' + esc(p.id) + '">' + esc(p.title) + "</option>";
    }).join("");
    showWritingPrompt();
  }

  function showWritingPrompt() {
    var task = document.getElementById("w-task").value;
    var id = document.getElementById("w-prompt").value;
    var list = (writingBank && writingBank[task]) || [];
    var p = list.filter(function (x) { return x.id === id; })[0];
    document.getElementById("w-prompt-text").textContent = p? p.prompt: "";
  }

  function loadWritingBank() {
    return api("/api/ai-tutor/writing-bank").then(function (d) {
      writingBank = d.bank;
      fillWritingPrompts();
    }).catch(function (e) {
      document.getElementById("w-hint").textContent = e.message || " Viết Ngân hàng đề Tải dữ liệu thất bại ";
    });
  }

  function gradeWriting() {
    var wh = document.getElementById("w-hint");
    var taskType = document.getElementById("w-task").value;
    var promptId = document.getElementById("w-prompt").value;
    var essay = document.getElementById("w-essay").value.trim();
    if (!essay) { wh.textContent = " mời dán viết văn "; wh.className = "ai-write__hint is-error"; return; }
    if (lastQuota &&!lastQuota.unlimited && lastQuota.textLeft <= 0) {
      wh.textContent = " hôm nay văn tự khoản độ Đã dùng hết, hẹn gặp lại ngày mai ";
      wh.className = "ai-write__hint is-error";
      applyQuotaControls();
      return;
    }
    if (busy) return;
    busy = true;
    applyQuotaControls();
    wh.textContent = " Đang chấm bài …";
    wh.className = "ai-write__hint";
    api("/api/ai-tutor/writing-grade", {
      method: "POST",
      body: { taskType: taskType, promptId: promptId, essay: essay }
    }).then(function (d) {
      if (d.quota) renderQuota(d.quota);
      wh.textContent = "";
      var g = d.grade;
      var html = "";
      if (g &&!looksLikeJsonLeak(g.overall)) {
        html += '<div class="ai-score"><h3> Viết cho điểm · Overall ' + esc(g.overall) +
          ' <span style="font-weight:500;font-size:12px;color:#64748b"> (AI cổ phân · không nghi thức điểm thi) </span></h3><dl>' +
          "<dt>Task</dt><dd>" + esc(g.task) + "</dd>" +
          "<dt>Coherence</dt><dd>" + esc(g.coherence) + "</dd>" +
          "<dt>Lexical</dt><dd>" + esc(g.lexical) + "</dd>" +
          "<dt>Grammar</dt><dd>" + esc(g.grammar) + "</dd></dl>" +
          (g.comment &&!looksLikeJsonLeak(g.comment)? "<p>" + esc(g.comment) + "</p>": "") + "</div>";
        var cn = g.criteriaNotes || {};
        if (cn.task || cn.coherence || cn.lexical || cn.grammar) {
          html += "<h3> so sánh chính thức bốn hạng nói rõ </h3><ul>" +
            (cn.task &&!looksLikeJsonLeak(cn.task)? "<li><b>Task</b>: " + esc(cn.task) + "</li>": "") +
            (cn.coherence &&!looksLikeJsonLeak(cn.coherence)? "<li><b>Coherence</b>: " + esc(cn.coherence) + "</li>": "") +
            (cn.lexical &&!looksLikeJsonLeak(cn.lexical)? "<li><b>Lexical</b>: " + esc(cn.lexical) + "</li>": "") +
            (cn.grammar &&!looksLikeJsonLeak(cn.grammar)? "<li><b>Grammar</b>: " + esc(cn.grammar) + "</li>": "") +
            "</ul>";
        }
        if (g.paragraphNotes && g.paragraphNotes.length) {
          html += "<h3> trục đoạn phê bình chú giải </h3><ul>" + g.paragraphNotes.filter(function (n) { return!looksLikeJsonLeak(n); }).map(function (n) {
            return "<li>" + esc(n) + "</li>";
          }).join("") + "</ul>";
        }
        if (g.corrections && g.corrections.length) {
          html += "<h3> Gợi ý sửa lỗi từ vựng & ngữ pháp </h3><ul>" + g.corrections.filter(function (c) {
            return c &&!looksLikeJsonLeak(c.bad) &&!looksLikeJsonLeak(c.good);
          }).map(function (c) {
            return "<li><s>" + esc(c.bad) + "</s> → <b>" + esc(c.good) + "</b>" +
              (c.why? " (" + esc(c.why) + ") ": "") + "</li>";
          }).join("") + "</ul>";
        }
        if (g.nextSteps && g.nextSteps.length) {
          html += "<h3> xách điểm đề nghị </h3><ul>" + g.nextSteps.filter(function (n) { return!looksLikeJsonLeak(n); }).map(function (n) {
            return "<li>" + esc(n) + "</li>";
          }).join("") + "</ul>";
        }
        if (g.modelEssay &&!looksLikeJsonLeak(g.modelEssay)) {
          html += "<h3> cùng câu cao phân bài văn mẫu </h3><pre class=\"ai-write__model\">" + esc(g.modelEssay) + "</pre>";
        }
      }
      var fb = d.feedback? String(d.feedback).trim(): "";
      if (fb &&!looksLikeJsonLeak(fb)) {
        html += "<div class=\"ai-write__hint\">" + esc(fb) + "</div>";
      }
      var emptyMsg = lastQuota &&!lastQuota.unlimited && lastQuota.textLeft <= 0
        ? " Kết quả chấm bài không hoàn chỉnh (hôm nay văn tự khoản độ Đã dùng hết, hẹn gặp lại ngày mai) "
        : " Không nhận được kết quả chấm điểm có cấu trúc, vui lòng nhấn lại «Nộp bài chấm điểm» để thử lại ";
      document.getElementById("w-result").innerHTML = html || "<p>" + emptyMsg + "</p>";
      if (!html) wh.textContent = emptyMsg;
    }).catch(function (e) {
      if (e.quota) renderQuota(e.quota);
      wh.textContent = (e.message || " Chấm bài thất bại ") + (e.status === 502? " — có thể nhấn Nộp bài để thử lại ": "");
      wh.className = "ai-write__hint is-error";
    }).then(function () {
      busy = false;
      applyQuotaControls();
    });
  }

  function updateWordCount() {
    var el = document.getElementById("w-essay");
    var out = document.getElementById("w-wordcount");
    if (!el ||!out) return;
    var n = String(el.value || "").trim().split(/\s+/).filter(Boolean).length;
    out.textContent = n + " từ ";
  }

  /* Events */
  document.getElementById("view-hub").addEventListener("click", function (e) {
    var b = e.target.closest("[data-track]");
    if (!b) return;
    if (b.getAttribute("data-track") === "speaking") {
      showView("speaking-home");
      loadQuota();
    } else {
      showView("writing");
      loadWritingBank();
      loadQuota();
    }
  });

  document.body.addEventListener("click", function (e) {
    var back = e.target.closest("[data-back]");
    if (back) {
      var to = back.getAttribute("data-back");
      sessionId = null;
      examPack = null;
      if (to === "zone-mock") {
        location.href = "zone.html?zone=mock";
        return;
      }
      showView(to === "hub"? "hub": "speaking-home");
      return;
    }
    var sp = e.target.closest("[data-speak]");
    if (!sp) return;
    var kind = sp.getAttribute("data-speak");
    if (kind === "mock") {
      track = "mock";
      startMock();
      return;
    }
    if (kind === "practice") {
      showView("practice");
      sessionId = null;
      syncSpeakRoomUI();
      loadBank();
      loadSessions();
      elMsgs.innerHTML = '<div class="ai-tutor__empty"> Chọn chủ đề Part 1 và một câu Part 2 để bắt đầu luyện tập. Chỉ trả lời bằng micro. </div>';
      return;
    }
    if (kind === "tutor") {
      showView("tutor");
      syncSpeakRoomUI();
      startTutor();
      loadSessions();
    }
  });

  document.getElementById("btn-start-practice").addEventListener("click", startPractice);
  document.getElementById("btn-send").addEventListener("click", function () {
    sendChat({ content: elInput.value, audioSec: 0 }).then(function () { elInput.value = ""; });
  });
  elInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" &&!e.shiftKey) {
      e.preventDefault();
      sendChat({ content: elInput.value, audioSec: 0 }).then(function () { elInput.value = ""; });
    }
  });
  elMic.addEventListener("click", function () {
    if (elMic.classList.contains("is-on")) finishRec("manual");
    else startRec({ auto: false });
  });
  document.getElementById("btn-replay").addEventListener("click", function () {
    if (lastAssistantText) playTts(lastAssistantText);
  });
  document.getElementById("btn-rerecord").addEventListener("click", function () {
    pendingBlob = null;
    pendingText = "";
    document.getElementById("btn-rerecord").hidden = true;
    document.getElementById("btn-confirm-rec").hidden = true;
    startRec({ auto: false });
  });
  document.getElementById("btn-confirm-rec").addEventListener("click", function () {
    if (!pendingText) return;
    var url = pendingBlob? URL.createObjectURL(pendingBlob): null;
    turnLog.push({ q: lastAssistantText, a: pendingText, valid: true, audioUrl: url });
    document.getElementById("btn-rerecord").hidden = true;
    document.getElementById("btn-confirm-rec").hidden = true;
    sendChat({ content: pendingText, audioSec: pendingSec });
    pendingText = "";
    pendingBlob = null;
  });

  document.getElementById("btn-exam-start").addEventListener("click", function () {
    audioUnlocked = true;
    document.getElementById("btn-exam-start").hidden = true;
    startTotalClock();
    var opener = document.getElementById("btn-exam-start").dataset.opener || currentQ;
    setExamPhase("part1", "Part 1");
    handleMockExaminerTurn(opener);
  });
  document.getElementById("btn-exam-submit").addEventListener("click", function () {
    finishRec("manual");
  });
  document.getElementById("btn-abandon").addEventListener("click", abandonMock);
  document.getElementById("btn-review-close").addEventListener("click", function () {
    document.getElementById("review-overlay").hidden = true;
    turnLog.forEach(function (t) { if (t.audioUrl) URL.revokeObjectURL(t.audioUrl); });
    turnLog = [];
    sessionId = null;
    showView("speaking-home");
  });

  document.getElementById("w-task").addEventListener("change", fillWritingPrompts);
  document.getElementById("w-prompt").addEventListener("change", showWritingPrompt);
  document.getElementById("btn-grade").addEventListener("click", gradeWriting);
  document.getElementById("w-essay").addEventListener("input", updateWordCount);

  var elAdmin = document.getElementById("admin-upload");
  if ((A.isAdmin && A.isAdmin()) || (A.isTeacher && A.isTeacher())) {
    elAdmin.hidden = false;
  }
  document.getElementById("btn-upload-jiijing").addEventListener("click", function () {
    var file = document.getElementById("jiijing-file").files[0];
    var uh = document.getElementById("upload-hint");
    if (!file) { uh.textContent = " mời trước lựa chọn PDF"; return; }
    uh.textContent = " Đang tải lên giải thích đáp án…";
    var fr = new FileReader();
    fr.onload = function () {
      api("/api/admin/jiijing/upload", {
        method: "POST",
        body: { pdfBase64: fr.result, title: file.name.replace(/\.pdf$/i, "") }
      }).then(function (d) {
        bank = d.bank;
        uh.textContent = " đã hoán đổi Ngân hàng đề: " + (bank.title || bank.id);
      }).catch(function (e) {
        uh.textContent = e.message || " Tải lên thất bại ";
      });
    };
    fr.readAsDataURL(file);
  });

  if (writingOnly) {
    showView("writing");
    loadWritingBank();
    loadQuota();
  } else {
    showView("hub");
    loadQuota();
  }
})();
