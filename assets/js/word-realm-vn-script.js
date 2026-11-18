/* =========================================================================
   word-realm-vn-script.js — Phase 0+1 scripts (EN + ZH subtitles)
   ========================================================================= */
window.YYSD_WORD_REALM_VN_SCRIPT = {
  portraits: {
    hero: "assets/img/word-realm/hero.png",
    "hero-determined": "assets/img/word-realm/hero-determined.png",
    "hero-hurt": "assets/img/word-realm/hero-hurt.png",
    ella: "assets/img/word-realm/ella.png",
    "ella-smile": "assets/img/word-realm/ella-smile.png",
    "ella-worry": "assets/img/word-realm/ella-worry.png",
    "ella-fierce": "assets/img/word-realm/ella-fierce.png",
    prince: "assets/img/word-realm/hero.png",
    enemy: "assets/img/word-realm/enemy-fog-tongue.png",
    boss: "assets/img/word-realm/boss-fog-tongue.png",
    "map-mist": "assets/img/word-realm/map-mist.png",
    "map-stone": "assets/img/word-realm/map-stone.png",
    "map-ash": "assets/img/word-realm/map-ash.png",
    "map-throne": "assets/img/word-realm/map-throne.png",
    "cut-boss": "assets/img/word-realm/cut-mist-boss.png",
    "cut-clear": "assets/img/word-realm/cut-mist-clear.png",
    "cut-village": "assets/img/word-realm/cut-mist-village.png",
    "cut-road": "assets/img/word-realm/cut-mist-road.png",
    "cut-sky": "assets/img/word-realm/cut-mist-sky.png",
    "cut-shrine": "assets/img/word-realm/cut-mist-shrine.png",
    "cut-names": "assets/img/word-realm/cut-mist-names.png"
  },

  prologue: {
    id: "prologue",
    title: "Prologue · Before the Starlight",
    nodes: [
      {
        id: "p0", type: "line", speaker: "Narrator", portrait: "map-mist",
        en: "In the age before kingdoms learned their own names, there was Lex World — where every remembered word was a line of living law.",
        zh: " tại vương quốc học được kêu gọi tên mình lúc trước, trước có từ chi thế giới —— mỗi một bị nhớ từ, đều là sự thật vận hành một cái luật pháp. "
      },
      {
        id: "p1", type: "line", speaker: "Narrator", portrait: "map-mist",
        en: "Sky stayed blue only while someone still knew the word blue. Bridges held because weight still meant something.",
        zh: " bầu trời bởi vì có người nhớ rõ « xanh thẳm » mà bảo trì xanh thẳm; cầu bởi vì « thừa trọng » nhưng có ý nghĩa mà cắn hợp. "
      },
      {
        id: "p2", type: "line", speaker: "Narrator", portrait: "map-ash",
        en: "Then the Word-Eaters came. They did not swing swords. They made people forget.",
        zh: " sau đó phệ từ người đã đến. họ không động đao kiếm —— họ làm cho người ta quên đi. "
      },
      {
        id: "p3", type: "line", speaker: "Narrator", portrait: "map-ash",
        en: "Soldiers forgot passwords. Markets forgot fairness. The first city crumbled in silence — walls intact, the word home gone.",
        zh: " binh sĩ đã quên khẩu lệnh, chợ đã quên công bằng. tòa thành thứ nhất đang trầm mặc Vừa vỡ vụn: tường vẫn còn, home lại không có. "
      },
      {
        id: "p4", type: "line", speaker: "Narrator", portrait: "map-throne",
        en: "People fought bravely — while they could still speak. Then courage itself began to vanish from their tongues.",
        zh: " mọi người từng anh dũng phản kháng —— tại còn có thể nói chuyện trong cuộc sống. thẳng đến dũng khí một từ, cũng từ đầu lưỡi biến mất. "
      },
      {
        id: "p5", type: "cutscene",
        panels: [
          {
            art: "map-throne",
            en: "On the third night, Prince Lex stood alone in the Word Hospital, reading wounded words back into the page.",
            zh: " thứ ba đêm, Vương tử Lai Khắc Tư một mình canh giữ ở từ bệnh viện, đem thương tổn từ đọc chậm quay về mặt giấy. "
          },
          {
            art: "map-throne",
            en: "A nameless god answered: Memory Power is loaned only to those who remember for others.",
            zh: " vô danh thần minh đáp lại: trí nhớ chi lực, chỉ cấp cho nguyện ý thay người khác nhớ người. "
          },
          {
            art: "map-ash",
            en: "He trained. He rose. He burned his life to reclaim half a world of stolen words — and shattered into starlight.",
            zh: " anh ấy rèn luyện, quật khởi, hết sinh mệnh đoạt lại nửa cái thế giới từ —— sau đó vỡ thành sao mảnh. "
          }
        ]
      },
      {
        id: "p6", type: "line", speaker: "Ella", portrait: "ella",
        en: "Hey. Don't freeze. Starlight doesn't pick statues.",
        zh: " cho ăn, đừng cứng đờ. sao mảnh cũng sẽ không chọn một pho tượng. "
      },
      {
        id: "p7", type: "line", speaker: "Ella", portrait: "ella",
        en: "I'm Ella — scribe of the old hospital. I kept the scraps. Tonight the scraps kept you.",
        zh: " ta là Ella, xưa cũ bệnh viện thư lại. tôi trông coi Trang cổ; tối nay, Trang cổ giữ được bạn. "
      },
      {
        id: "p8", type: "cutscene",
        panels: [
          {
            art: "hero",
            en: "Starlight settles on your shoulders. The second invasion has already begun — softer, crueler: doubt, delay, and the lie that remembering is worthless.",
            zh: " sao mảnh rơi vào bạn trên vai. tấn công lần thứ hai đã bắt đầu —— mềm hơn, cũng càng hung ác: hoài nghi, kéo dài, cũng như « nhớ kỹ không có chút ý nghĩa nào » nói dối. "
          },
          {
            art: "map-mist",
            en: "Mistvale waits. Fog-Tongues lick names off the stone. Your first quest is simple: remember, and strike.",
            zh: " sương sớm bình nguyên đang chờ đợi. sương mù lưỡi đang liếm sạch trên tấm bia đá tên. của bạn hạng thứ nhất nhiệm vụ rất đơn giản: nhớ kỹ, sau đó xuất kiếm. "
          }
        ]
      },
      {
        id: "p9", type: "choice", portrait: "ella",
        en: "Ella watches you. How do you answer the starlight?",
        zh: " Ella nhìn xem bạn. ngươi muốn như thế nào đáp lại sao mảnh? ",
        options: [
          { en: "I'll remember for others.", zh: " tôi nguyện ý thay người khác nhớ kỹ. ", flag: "vow_others", next: "p10a" },
          { en: "I'll get strong enough to win.", zh: " ta sẽ trở nên đầy đủ mạnh mẽ, đi thắng được một trận. ", flag: "vow_strength", next: "p10b" }
        ]
      },
      {
        id: "p10a", type: "line", speaker: "Ella", portrait: "ella", next: "p11",
        en: "Good. That's the prince's condition. Don't forget it when the fog gets loud.",
        zh: " rất tốt. đó là vương tử điều kiện. sương mù quá lớn thời điểm, đừng quên. "
      },
      {
        id: "p10b", type: "line", speaker: "Ella", portrait: "ella", next: "p11",
        en: "Strength is fine — just aim it outward. Memory Power hates hoarders.",
        zh: " trở nên mạnh mẽ có thể —— nhưng muốn đem lưỡi đao hướng ra ngoài. trí nhớ chi lực chán ghét trữ hàng người. "
      },
      {
        id: "p11", type: "line", speaker: "Ella", portrait: "ella", next: "end",
        en: "Open the map. Mistvale has eight shrine-lights. Clear them — and the Adult Fog-Tongue will wake.",
        zh: " mở bản đồ. sương sớm có tám tòa từ đèn. thắp sáng chúng —— sương mù lưỡi thành thể sẽ tỉnh lại. "
      },
      { id: "end", type: "end" }
    ]
  },

  mist_enter: {
    id: "mist_enter",
    title: "Chapter I · Mistvale",
    nodes: [
      {
        id: "e0", type: "cutscene",
        panels: [
          {
            art: "cut-road",
            en: "Mistvale was once a land of naming festivals. Lanterns sang the names of children into the dusk.",
            zh: " sương sớm bình nguyên từng có đặt tên Lễ hội. đèn lồng đem con đám bọn chúng tên hát tiến hoàng hôn. "
          },
          {
            art: "cut-road",
            en: "Now the road-signs are licked blank. Fog curls where words used to stand.",
            zh: " hôm nay biển báo giao thông bị thè lưỡi ra liếm thành chỗ trống. từ đã từng đứng yên địa phương, chỉ còn quyển khúc sương mù. "
          }
        ]
      },
      {
        id: "e1", type: "line", speaker: "Ella", portrait: "ella-worry",
        en: "Welcome to Mistvale — first wound of Lex World. Ordinary words dry up like dew.",
        zh: " hoan nghênh đi vào sương sớm bình nguyên —— Vương quốc Từ trước hết nhất bị xé nứt miệng vết thương. Đời sống chi từ như sương sớm, một quên tựu giữ. "
      },
      {
        id: "e2", type: "line", speaker: "Ella", portrait: "enemy",
        en: "Those curling shapes? Fog-Tongues. They lick names, hope, even the color of the sky.",
        zh: " những mục đó quyển khúc bóng dáng? sương mù lưỡi. chúng thè lưỡi ra liếm đi tên, hy vọng, thậm chí bầu trời màu sắc. "
      },
      {
        id: "e3", type: "line", speaker: "Ella", portrait: "ella-fierce",
        en: "Light the shrines one by one. Each true spelling is a sword-stroke. I'll mark every deed.",
        zh: " một tòa một tòa thắp sáng từ miếu. mỗi một lần chính xác Chính tả đều là một kiếm. ta nhớ hạ của bạn mỗi một bút công lao sự nghiệp. "
      },
      {
        id: "e4", type: "line", speaker: "Narrator", portrait: "hero-determined", next: "end",
        en: "Three lights make a first legend. Eight lights wake the Adult. How far will your fire go tonight?",
        zh: " ba chén đèn, ghi thành sơ truyền; tám chụp đèn, tỉnh lại thành thể. tối nay của bạn Hỏa, có thể đi thật xa? "
      },
      { id: "end", type: "end" }
    ]
  },

  mist_after_01: {
    id: "mist_after_01", title: "Mistvale · First Light",
    nodes: [
      {
        id: "a0", type: "cutscene",
        panels: [
          {
            art: "cut-shrine",
            en: "The first shrine answers. Golden runes climb the stone like waking veins.",
            zh: " đệ nhất tòa từ đáp lại. màu vàng ký hiệu(*phù văn) xuôi theo mặt đá trèo lên, như thức tỉnh mạch lạc. "
          }
        ]
      },
      { id: "a", type: "line", speaker: "Ella", portrait: "ella-smile",
        en: "First shrine lit. Feel that? The fog stepped back half a pace — for you.",
        zh: " đệ nhất tòa từ sáng. cảm thấy không? sương mù cho bạn lui bán bộ. " },
      { id: "b", type: "line", speaker: "Villager", portrait: "cut-village",
        en: "I… I remember my name again. It was almost gone. Thank you, traveler.",
        zh: " tôi …… lại nghĩ tới tên của mình rồi. nó thiếu một ít biến mất. Cảm ơn bạn, lữ nhân. " },
      { id: "c", type: "line", speaker: "Ella", portrait: "ella", next: "end",
        en: "Write that feeling down in your bones. This is what Memory Power is for.",
        zh: " đem loại cảm giác này ghi vào đầu khớp xương. trí nhớ chi lực, chính là vì loại này lập tức tồn tại. " },
      { id: "end", type: "end" }
    ]
  },

  mist_after_02: {
    id: "mist_after_02", title: "Mistvale · Stone Letters",
    nodes: [
      { id: "a", type: "line", speaker: "Ella", portrait: "ella-smile",
        en: "The melted letters crawled back onto the stele. Ugly handwriting — but alive.",
        zh: " hòa tan chữ bò lại bia mặt. chữ viết khó coi —— nhưng còn sống. " },
      { id: "b", type: "line", speaker: "Ella", portrait: "enemy",
        en: "Fog-Tongues hate letters that refuse to blur. Keep your blade sharp — every syllable a cut.",
        zh: " sương mù lưỡi chán ghét không chịu mơ hồ chữ cái. mũi kiếm lại lợi chút ít —— từng âm tiết đều là chém. " },
      { id: "c", type: "line", speaker: "Hero", portrait: "hero-determined", next: "end",
        en: "(You tighten your grip. The mist flinches first.)",
        zh: " (bạn nắm chặt lòng bàn tay. sương mù, trước tiên lui rụt.) " },
      { id: "end", type: "end" }
    ]
  },

  mist_after_03: {
    id: "mist_after_03", title: "Mistvale · Three Lights",
    nodes: [
      { id: "a", type: "line", speaker: "Ella", portrait: "ella-smile",
        en: "Three shrines lit. Not bad for a newborn host.",
        zh: " ba tòa từ sáng. với tư cách mới kí sinh chủ, còn không lại. " },
      {
        id: "b", type: "cutscene",
        panels: [
          {
            art: "cut-village",
            en: "In a half-swallowed village, a child reaches for a name almost faded from stone.",
            zh: " nửa tòa thôn trang bị sương mù nuốt. hài tử thò tay đi đủ trên đá nhanh biến mất tên. "
          },
          {
            art: "cut-shrine",
            en: "Your third light reaches them first. The name holds — trembling, then true.",
            zh: " của bạn thứ ba chụp đèn tới trước. tên ổn định: vốn là run rẩy, sau đó chân thật. "
          }
        ]
      },
      { id: "c", type: "line", speaker: "Ella", portrait: "ella-worry", next: "end",
        en: "Rest if you need. The Adult still sleeps under the eighth stone — for now.",
        zh: " cần liền nghỉ ngơi. thành thể còn ngủ ở thứ tám khối dưới đá —— tạm thời như thế. " },
      { id: "end", type: "end" }
    ]
  },

  mist_after_04: {
    id: "mist_after_04", title: "Mistvale · Nameless Beast",
    nodes: [
      { id: "a", type: "line", speaker: "Ella", portrait: "enemy",
        en: "That beast stopped spinning. It remembered what it was called — briefly.",
        zh: " đầu kia thú không hề đảo quanh. nó ngắn ngủi nhớ tới tên của mình. " },
      { id: "b", type: "line", speaker: "Ella", portrait: "ella",
        en: "Memory Power isn't only for humans. Even monsters want a name.",
        zh: " trí nhớ chi lực không chỉ làm cho người ta. ngay cả quái vật cũng muốn một cái tên. " },
      { id: "c", type: "line", speaker: "Ella", portrait: "ella-smile", next: "end",
        en: "If you can name a fear, you can cut it. Remember that when the Adult wakes.",
        zh: " có thể mệnh danh sợ hãi, có thể chặt đứt nó. thành thể tỉnh lại thì, nhớ rõ những lời này. " },
      { id: "end", type: "end" }
    ]
  },

  mist_after_05: {
    id: "mist_after_05", title: "Mistvale · Blue Returns",
    nodes: [
      {
        id: "a0", type: "cutscene",
        panels: [
          {
            art: "cut-sky",
            en: "A missing patch of sky stitches itself shut. Gold light writes the word blue back into heaven.",
            zh: " bầu trời thiếu một ít khối bị khâu lại. màu vàng quang, đem blue ghi xoay chuyển trời đất khung. "
          }
        ]
      },
      { id: "a", type: "line", speaker: "Narrator", portrait: "cut-sky",
        en: "Someone nearby whispers the word as if tasting rain for the first time.",
        zh: " có người nhẹ giọng đọc lên cái từ kia, như lần thứ nhất nếm đến mưa. " },
      { id: "b", type: "line", speaker: "Ella", portrait: "ella-smile", next: "end",
        en: "Color is a word too. Never let them tell you adjectives are useless.",
        zh: " màu sắc cũng là từ. đừng tin ai nói tính từ vô dụng. " },
      { id: "end", type: "end" }
    ]
  },

  mist_after_06: {
    id: "mist_after_06", title: "Mistvale · Hope",
    nodes: [
      { id: "a", type: "line", speaker: "Child", portrait: "cut-village",
        en: "Hope… hope… I can say it again!",
        zh: " hy vọng …… hy vọng …… tôi lại có thể nói ra! " },
      { id: "b", type: "line", speaker: "Ella", portrait: "ella-smile",
        en: "Smoke from the chimneys again. That's what a correct answer looks like on a map.",
        zh: " khói bếp lại nổi lên đã đến. Đáp án đúng tại trên địa đồ, dài như vậy. " },
      { id: "c", type: "line", speaker: "Ella", portrait: "ella-fierce", next: "end",
        en: "Two lights left before the ground starts knocking. Stay with me.",
        zh: " lại hai ngọn đèn, dưới mặt đất sẽ gõ cửa. theo sát tôi. " },
      { id: "end", type: "end" }
    ]
  },

  mist_after_07: {
    id: "mist_after_07", title: "Mistvale · Before the Boss",
    nodes: [
      {
        id: "a0", type: "cutscene",
        panels: [
          {
            art: "cut-boss",
            en: "Seven lights. The plain holds its breath. Something under the eighth stone rewrites foundation.",
            zh: " bảy chụp đèn. bình nguyên ngừng thở. thứ tám khối dưới đá, có cái gì tại sửa « căn cơ ». "
          }
        ]
      },
      { id: "a", type: "line", speaker: "Ella", portrait: "ella-worry",
        en: "The Adult Fog-Tongue is waking. It will try to erase who you are — and who they are.",
        zh: " sương mù lưỡi · thành thể tại tỉnh lại. nó sẽ biến mất ngươi là ai —— cũng như bọn họ là ai. " },
      { id: "b", type: "line", speaker: "Ella", portrait: "ella-fierce",
        en: "Check your title. Steady your breath. Then we go loud.",
        zh: " thấy rõ danh xưng. ổn định hô hấp. sau đó, lớn tiếng xuất kiếm. " },
      { id: "c", type: "line", speaker: "Hero", portrait: "hero-determined", next: "end",
        en: "(Starlight burns hotter. You step toward the last shrine.)",
        zh: " (sao mảnh càng bị phỏng. bạn đi về hướng cuối cùng một tòa từ.) " },
      { id: "end", type: "end" }
    ]
  },

  mist_boss_pre: {
    id: "mist_boss_pre",
    title: "Boss · Adult Fog-Tongue",
    nodes: [
      {
        id: "b0", type: "cutscene",
        panels: [
          {
            art: "cut-boss",
            en: "The mist wrings itself dry. Lamps die until only your shrine remains.",
            zh: " sương mù như bị vắt khô bố. ngọn đèn dầu dập tắt, chỉ còn bạn chỗ này từ quang. "
          },
          {
            art: "boss",
            en: "From the fog rises a tongue large enough to lick a name off a city.",
            zh: " trong sương mù bay lên một đoạn đầu lưỡi, lớn đến có thể liếm sạch một tòa thành tên. "
          }
        ]
      },
      {
        id: "b1", type: "line", speaker: "Ella", portrait: "ella-fierce",
        en: "Don't look for me — look at its tongue. It's trying to erase who am I.",
        zh: " đừng tìm tôi —— xem nó đầu lưỡi. nó tại biến mất who am I. "
      },
      {
        id: "b2", type: "line", speaker: "Adult Fog-Tongue", portrait: "boss",
        en: "Forget… forget… you were never anyone…",
        zh: " đã quên …… đã quên …… bạn chưa bao giờ là ai ……"
      },
      {
        id: "b3", type: "choice", portrait: "hero-determined",
        en: "Your Memory Power flares. What do you declare?",
        zh: " trí nhớ chi lực dấy lên. ngươi muốn tuyên cáo gì? ",
        options: [
          { en: "I remember my name!", zh: " ta nhớ được tên của ta! ", flag: "boss_name", next: "b4" },
          { en: "I remember theirs!", zh: " ta nhớ được tên của bọn hắn! ", flag: "boss_others", next: "b4a" }
        ]
      },
      {
        id: "b4", type: "line", speaker: "Ella", portrait: "ella-fierce", next: "b5",
        en: "Good. Then prove it — every correct spelling is a slash across that tongue!",
        zh: " rất tốt. vậy chứng minh —— mỗi một lần Đúng Chính tả, đều là chém về phía cái kia đoạn đầu lưỡi một kiếm! "
      },
      {
        id: "b4a", type: "line", speaker: "Ella", portrait: "ella-smile", next: "b5",
        en: "That's the prince's vow. Hold it when the fog screams loudest.",
        zh: " đó là vương tử lời thề. sương mù rất vang lên thời điểm, bắt lấy nó. "
      },
      {
        id: "b5", type: "line", speaker: "Ella", portrait: "ella-fierce", next: "end",
        en: "Timed answers. Miss and it bites. Hit true — and cut.",
        zh: " Thời gian đáp lại. bỏ qua liền lần lượt cắn. trả lời —— liền trảm! "
      },
      { id: "end", type: "end" }
    ]
  },

  mist_boss_post: {
    id: "mist_boss_post",
    title: "Chapter I · Cleared",
    nodes: [
      {
        id: "c0", type: "cutscene",
        panels: [
          {
            art: "cut-boss",
            en: "The Adult Fog-Tongue tears into dew. Mistvale exhales for the first time in years.",
            zh: " sương mù lưỡi · thành thể vỡ thành sương sớm. sương sớm bình nguyên nhiều năm qua lần thứ nhất thở ra một hơi. "
          },
          {
            art: "cut-names",
            en: "Children shout their names across the plain. Lanterns answer like a second sunrise.",
            zh: " bọn nhỏ tại bên trên bình nguyên hô lên tên của mình. đèn lồng đáp lại, như đợt thứ hai mặt trời mọc. "
          },
          {
            art: "cut-clear",
            en: "Far east, empty stelae begin to open their eyes.",
            zh: " Viễn Đông, chỗ trống bia đang trợn mắt. "
          }
        ]
      },
      {
        id: "c1", type: "line", speaker: "Prince Lex (echo)", portrait: "prince",
        en: "Names are the shortest epics. You learned to fight. Next — remember for others.",
        zh: " tên là ngắn nhất sử thi. bạn học xong chiến đấu. bước tiếp theo —— thay người khác nhớ rõ. "
      },
      {
        id: "c2", type: "line", speaker: "Ella", portrait: "ella-smile",
        en: "Chapter I — done. I'm writing it down before I cry. Don't look.",
        zh: " Chương 1: —— hết. tôi trước nhớ kỹ, miễn cho khóc lên. đừng nhìn tôi. "
      },
      {
        id: "c3", type: "line", speaker: "Ella", portrait: "map-stone", next: "end",
        en: "Glyph Gorge waits when you're ready. Definitions have been hollowed out — and something worse learned to yawn.",
        zh: " chuẩn bị cho tốt liền đi thạch lời nói hạp cốc. định nghĩa bị đào rỗng —— có càng hỏng bét đồ vật học xong ngáp. "
      },
      { id: "end", type: "end" }
    ]
  },

  /* Phase 1.5 — mid-chapter field events (non-battle) */
  mist_event_04: {
    id: "mist_event_04",
    title: "Mistvale · The Nameless Road",
    nodes: [
      {
        id: "m00", type: "cutscene",
        panels: [
          {
            art: "cut-road",
            en: "Halfway across Mistvale, the road forgets it is a road. Stones rearrange into a question.",
            zh: " sương mù nguyên trên đường, đường quên mất mình là đường. hòn đá xếp thành một cái dấu chấm hỏi(???). "
          }
        ]
      },
      {
        id: "m1", type: "line", speaker: "Lost Traveler", portrait: "cut-village",
        en: "Which way to the village? I… I forgot the word for left.",
        zh: " đi thôn bên nào đi? tôi …… đã quên « trái » cái từ này. "
      },
      {
        id: "m2", type: "choice", portrait: "ella-worry",
        en: "Ella glances at you. How do you answer?",
        zh: " Ella nhìn ngươi liếc. bạn như thế nào đáp? ",
        options: [
          { en: "Point left. Say the word aloud.", zh: " chỉ hướng bên trái, nói lớn tiếng ra cái từ kia. ", flag: "mid_left", next: "m3a" },
          { en: "Walk with them until the word returns.", zh: " cùng họ đi, thẳng đến từ trở về. ", flag: "mid_walk", next: "m3b" }
        ]
      },
      {
        id: "m3a", type: "line", speaker: "Ella", portrait: "ella-fierce", next: "m4",
        en: "Good. Speaking a word into the fog is half a sword-stroke.",
        zh: " rất tốt. đối với sương mù nói ra một cái từ, cũng đã là nửa kiếm. "
      },
      {
        id: "m3b", type: "line", speaker: "Ella", portrait: "ella-smile", next: "m4",
        en: "Patience is also Memory Power. The fog hates company.",
        zh: " kiên nhẫn cũng là trí nhớ chi lực. sương mù ghét nhất có người cùng. "
      },
      {
        id: "m4", type: "line", speaker: "Lost Traveler", portrait: "cut-village", next: "end",
        en: "Left… left! Thank you. The fourth shrine is ahead — it smells like fear.",
        zh: " trái …… trái! Cảm ơn. thứ tư tòa từ ở phía trước —— ngửi như sợ hãi. "
      },
      { id: "end", type: "end" }
    ]
  },

  mist_event_06: {
    id: "mist_event_06",
    title: "Mistvale · Chimney Smoke",
    nodes: [
      {
        id: "n0", type: "cutscene",
        panels: [
          {
            art: "cut-village",
            en: "Smoke climbs again from three chimneys. A mother writes hope on a child's palm.",
            zh: " ba sợi khói bếp lại thăng lên. mẫu thân tại hài tử lòng bàn tay viết xuống hope. "
          },
          {
            art: "cut-sky",
            en: "Above them, a thin ribbon of blue refuses to fade.",
            zh: " khi bọn hắn phía trên, nhất đạo tế tế lam, cự tuyệt phai màu. "
          }
        ]
      },
      {
        id: "n1", type: "line", speaker: "Ella", portrait: "ella-worry",
        en: "Six lights almost. The Adult under the eighth stone is dreaming louder.",
        zh: " nhanh sáu chụp đèn rồi. thứ tám khối dưới đá thành thể, giấc mơ được vang hơn. "
      },
      {
        id: "n2", type: "line", speaker: "Child", portrait: "cut-village",
        en: "Hero! When you win… will the sky stay blue?",
        zh: " dũng giả! ngươi thắng về sau …… bầu trời sẽ vẫn là màu xanh không? "
      },
      {
        id: "n3", type: "line", speaker: "Hero", portrait: "hero-determined", next: "end",
        en: "(You nod. The spark in your palm answers for you.)",
        zh: " (bạn gật đầu. lòng bàn tay sao mảnh thay bạn trả lời.) "
      },
      { id: "end", type: "end" }
    ]
  },

  mist_revisit: {
    id: "mist_revisit",
    title: "Mistvale · After the Rain",
    nodes: [
      {
        id: "r0", type: "line", speaker: "Ella", portrait: "ella-smile",
        en: "You're back. Mistvale smells like wet stone and remembered names.",
        zh: " bạn đã trở về. sương sớm ngửi như ẩm ướt tảng đá, còn có bị nhớ lại tên. "
      },
      {
        id: "r1", type: "line", speaker: "Villager", portrait: "cut-names",
        en: "The Adult is gone. We keep a lamp on the eighth shrine for you.",
        zh: " thành thể không có. thứ tám tòa từ chúng tôi giữ lại cho bạn một chiếc đèn. "
      },
      {
        id: "r2", type: "line", speaker: "Ella", portrait: "map-stone", next: "end",
        en: "Revisit if you want. The real road is east — Glyph Gorge won't wait forever.",
        zh: " muốn thăm đáp lễ trở về tìm hiểu. chân chính đường tại phía đông —— thạch lời nói hạp cốc sẽ không vĩnh viễn chờ ngươi. "
      },
      { id: "end", type: "end" }
    ]
  }
};

// Back-compat alias used by Phase 0 boot hook
window.YYSD_WORD_REALM_VN_SCRIPT.mist_clear3 = window.YYSD_WORD_REALM_VN_SCRIPT.mist_after_03;
