/* =========================================================================
   word-realm-vn-script.js - Phase 0+1 scripts (EN + ZH subtitles)
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
        en: "In the age before kingdoms learned their own names, there was Lex World - where every remembered word was a line of living law.",
        zh: " tồn tại vương quốc học gọi to bản thân tên trước, trước biến thể cũ của | cua thế giới--mỗi một dùng trong | chăn nhớ của biến thể cũ của |, tất cả là thực tế di chuyển trên quỹ đạo của một dải luật pháp "
      },
      {
        id: "p1", type: "line", speaker: "Narrator", portrait: "map-mist",
        en: "Sky stayed blue only while someone still knew the word blue. Bridges held because weight still meant something.",
        zh: " bầu trời biến thể cũ của ai đó nhớ«màu xanh biếc»và giữ màu xanh biếc; cây cầu biến thể cũ của«chịu tải»vẫn có ý nghĩa và khớp với nhau "
      },
      {
        id: "p2", type: "line", speaker: "Narrator", portrait: "map-ash",
        en: "Then the Word-Eaters came. They did not swing swords. They made people forget.",
        zh: " sau đó ngấu nghiến biến thể cũ của | người mà đến hoàn thành họ bất động đao kiếm--họ nhường người quên "
      },
      {
        id: "p3", type: "line", speaker: "Narrator", portrait: "map-ash",
        en: "Soldiers forgot passwords. Markets forgot fairness. The first city crumbled in silence - walls intact, the word home gone.",
        zh: " lính quên hoàn thành mệnh lệnh bằng miệng, hội chợ quên hoàn thành công bằng đầu tiên chỗ ngồi tường thành tồn tại ít nói Trung Quốc vỡ vụn: biến thể của | vẫn tồn tại, home biến thể cũ của | chết "
      },
      {
        id: "p4", type: "line", speaker: "Narrator", portrait: "map-throne",
        en: "People fought bravely - while they could still speak. Then courage itself began to vanish from their tongues.",
        zh: " mọi người đã anh dũng kháng cự--tồn tại vẫn có thể nói của ngày biến thể của | cho đến can đảm một biến thể cũ của |, cũng biến thể của | đầu lưỡi biến mất "
      },
      {
        id: "p5", type: "cutscene",
        panels: [
          {
            art: "map-throne",
            en: "On the third night, Prince Lex stood alone in the Word Hospital, reading wounded words back into the page.",
            zh: " thu ba biến thể của, hoàng tử tên một loại cỏ dại viết tắt của | Slovakia một mình canh gác tồn tại biến thể cũ của | bệnh viện, cầm làm bị thương giảm của biến thể cũ của | đọc to lên xoay vòng biến thể của | mặt "
          },
          {
            art: "map-throne",
            en: "A nameless god answered: Memory Power is loaned only to those who remember for others.",
            zh: " không tên thần linh phản hồi: nhớ cua sức mạnh, chỉ cho ai đó mượn muốn thay thế cho người khác nhớ của người "
          },
          {
            art: "map-ash",
            en: "He trained. He rose. He burned his life to reclaim half a world of stolen words - and shattered into starlight.",
            zh: " anh ấy học hỏi qua kinh nghiệm, nổi lên đột ngột, cháy đến mức tối đa sự sống giành lại một nửa của cái gì đó thế giới của biến thể cũ của |--sau đó vỡ thành mảnh thành công ngôi sao mảnh vụn "
          }
        ]
      },
      {
        id: "p6", type: "line", speaker: "Ella", portrait: "ella",
        en: "Hey. Don't freeze. Starlight doesn't pick statues.",
        zh: " a lô, rời khỏi bất động ngôi sao mảnh vụn xem có thể chọn một chỗ ngồi tượng điêu khắc "
      },
      {
        id: "p7", type: "line", speaker: "Ella", portrait: "ella",
        en: "I'm Ella - scribe of the old hospital. I kept the scraps. Tonight the scraps kept you.",
        zh: " tôi là ngải cứu hoặc ngải đắng kéo, cũ bệnh viện của viết tắt của | quan chức hoặc nhân viên chính phủ nhỏ tôi canh gác nước đi phá hủy đầu; tối nay, phá hủy đầu giữ vững hoàn thành bạn "
      },
      {
        id: "p8", type: "cutscene",
        panels: [
          {
            art: "hero",
            en: "Starlight settles on your shoulders. The second invasion has already begun - softer, crueler: doubt, delay, and the lie that remembering is worthless.",
            zh: " ngôi sao mảnh vụn bỏ sót tồn tại bạn vai dùng trong | lần thứ hai tấn công đã bắt đầu--thay đổi hoặc thay thế mềm, cũng thay đổi hoặc thay thế tàn nhẫn: nghi ngờ, trì hoãn, cũng như«nhớ không một chút nào ý nghĩa»của lời nói dối "
          },
          {
            art: "map-mist",
            en: "Mistvale waits. Fog-Tongues lick names off the stone. Your first quest is simple: remember, and strike.",
            zh: " buổi sáng sương mù cánh đồng tồn tại chờ sương mù dùng trong để phiên âm từ Đài Loan nghĩa là ”lưỡi” tháng đầu tiên của năm âm lịch liếm rơi bia đá dùng trong | của tên bạn của đầu tiên sau cổ nhiệm vụ đơn giản: nhớ, sau đó đi ra kiếm hai lưỡi "
          }
        ]
      },
      {
        id: "p9", type: "choice", portrait: "ella",
        en: "Ella watches you. How do you answer the starlight?",
        zh: " ngải cứu hoặc ngải đắng kéo chăm sóc nước đi bạn bạn yêu cầu như thế nào phản hồi ngôi sao mảnh vụn? ",
        options: [
          { en: "I'll remember for others.", zh: " tôi muốn thay thế cho người khác nhớ ", flag: "vow_others", next: "p10a" },
          { en: "I'll get strong enough to win.", zh: " tôi có thể trở nên đủ bướng bỉnh, đi thắng xuống này một vũ khí ", flag: "vow_strength", next: "p10b" }
        ]
      },
      {
        id: "p10a", type: "line", speaker: "Ella", portrait: "ella", next: "p11",
        en: "Good. That's the prince's condition. Don't forget it when the fog gets loud.",
        zh: " tốt tất nhiên hoàng tử của điều kiện sương mù cao nhất to của thời gian, rời khỏi quên hoàn thành "
      },
      {
        id: "p10b", type: "line", speaker: "Ella", portrait: "ella", next: "p11",
        en: "Strength is fine - just aim it outward. Memory Power hates hoarders.",
        zh: " thay đổi bướng bỉnh có thể--nhưng yêu cầu cầm lưỡi cắt hoặc mũi nhọn của dao viết tắt của | Triều Tiên bên ngoài nhớ cua sức mạnh ghét tích trữ của người "
      },
      {
        id: "p11", type: "line", speaker: "Ella", portrait: "ella", next: "end",
        en: "Open the map. Mistvale has eight shrine-lights. Clear them - and the Adult Fog-Tongue will wake.",
        zh: " mở bản đồ buổi sáng sương mù có tám chỗ ngồi nhà thờ đèn thắp sáng chúng--sương mù dùng trong để phiên âm từ Đài Loan nghĩa là ”lưỡi” trưởng thành trong trường hợp đó có thể thức dậy "
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
            zh: " buổi sáng sương mù cánh đồng đã có đặt tên của ngày lễ đèn lồng cầm trẻ em của tên hát tiến lên chạng vạng "
          },
          {
            art: "cut-road",
            en: "Now the road-signs are licked blank. Fog curls where words used to stand.",
            zh: " ngày nay biển báo đường chăn liếm thành công khoảng trống biến thể cũ của | một lần đứng của khu vực, chỉ còn lại uốn của sương mù "
          }
        ]
      },
      {
        id: "e1", type: "line", speaker: "Ella", portrait: "ella-worry",
        en: "Welcome to Mistvale - first wound of Lex World. Ordinary words dry up like dew.",
        zh: " chào đón đến buổi sáng sương mù cánh đồng--biến thể cũ của | biên giới đầu tiên chăn xé rách của vết thương hằng ngày cua biến thể cũ của | giống sương, một quên trong trường hợp đó biến thể cũ của | "
      },
      {
        id: "e2", type: "line", speaker: "Ella", portrait: "enemy",
        en: "Those curling shapes? Fog-Tongues. They lick names, hope, even the color of the sky.",
        zh: " những cái đó uốn của bóng? sương mù dùng trong để phiên âm từ Đài Loan nghĩa là ”lưỡi” chúng liếm đi tên, hy vọng, thậm chí bầu trời của màu sắc "
      },
      {
        id: "e3", type: "line", speaker: "Ella", portrait: "ella-fierce",
        en: "Light the shrines one by one. Each true spelling is a sword-stroke. I'll mark every deed.",
        zh: " một chỗ ngồi một chỗ ngồi thắp sáng nhà thờ tổ mỗi đầu tiên đúng của đánh vần tất cả là một kiếm hai lưỡi tôi ghi chép xuống bạn của mỗi một bút thành tựu "
      },
      {
        id: "e4", type: "line", speaker: "Narrator", portrait: "hero-determined", next: "end",
        en: "Three lights make a first legend. Eight lights wake the Adult. How far will your fire go tonight?",
        zh: " ba một cái chén nhỏ đèn, viết thành công lúc đầu truyền đạt; tám một cái chén nhỏ đèn, đánh thức ai đó trưởng thành tối nay bạn của lửa, có thể đi nhiều xa? "
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
            zh: " đầu tiên chỗ ngồi nhà thờ phản hồi hoàn thành màu vàng kim chữ rune dọc theo đơn vị đo lường khô cho ngũ cốc bằng mười đấu mặt tăng lên, giống tỉnh lại của động mạch và tĩnh mạch "
          }
        ]
      },
      { id: "a", type: "line", speaker: "Ella", portrait: "ella-smile",
        en: "First shrine lit. Feel that? The fog stepped back half a pace - for you.",
        zh: " đầu tiên chỗ ngồi nhà thờ sáng hoàn thành cảm thấy hoàn thành gì?? sương mù làm bạn rút lui hoàn thành một nửa một bước " },
      { id: "b", type: "line", speaker: "Villager", portrait: "cut-village",
        en: "I... I remember my name again. It was almost gone. Thank you, traveler.",
        zh: " tôi......nữa nhớ lại bản thân của tên hoàn thành nó xem | biến mất cảm ơn bạn, chuyến đi người " },
      { id: "c", type: "line", speaker: "Ella", portrait: "ella", next: "end",
        en: "Write that feeling down in your bones. This is what Memory Power is for.",
        zh: " cầm loại này cảm giác viết tiến lên xương biến thể của | nhớ cua sức mạnh, chính xác làm loại này trong chớp mắt tồn tại của " },
      { id: "end", type: "end" }
    ]
  },

  mist_after_02: {
    id: "mist_after_02", title: "Mistvale · Stone Letters",
    nodes: [
      { id: "a", type: "line", speaker: "Ella", portrait: "ella-smile",
        en: "The melted letters crawled back onto the stele. Ugly handwriting - but alive.",
        zh: " tan của chữ bò xoay vòng bia tưởng niệm mặt chữ viết tay xấu--nhưng còn sống " },
      { id: "b", type: "line", speaker: "Ella", portrait: "enemy",
        en: "Fog-Tongues hate letters that refuse to blur. Keep your blade sharp - every syllable a cut.",
        zh: " sương mù dùng trong để phiên âm từ Đài Loan nghĩa là ”lưỡi” ghét không biến thể cũ của mơ hồ của chữ cái kiếm hai lưỡi mũi giáo lại sắc lượng từ chỉ số lượng nhỏ lớn hơn 1: một ít--mỗi dùng trong | âm tiết tất cả là một chặt đầu " },
      { id: "c", type: "line", speaker: "Hero", portrait: "hero-determined", next: "end",
        en: "(You tighten your grip. The mist flinches first.)",
        zh: "(bạn cầm chặt lòng bàn tay sương mù, trước lùi lại hoàn thành )" },
      { id: "end", type: "end" }
    ]
  },

  mist_after_03: {
    id: "mist_after_03", title: "Mistvale · Three Lights",
    nodes: [
      { id: "a", type: "line", speaker: "Ella", portrait: "ella-smile",
        en: "Three shrines lit. Not bad for a newborn host.",
        zh: " ba chỗ ngồi nhà thờ sáng hoàn thành hành vi Shinjuku chủ, vẫn không tệ " },
      {
        id: "b", type: "cutscene",
        panels: [
          {
            art: "cut-village",
            en: "In a half-swallowed village, a child reaches for a name almost faded from stone.",
            zh: " một nửa chỗ ngồi làng chăn sương mù nuốt nước đi trẻ em đưa tay ra đi đủ đơn vị đo lường khô cho ngũ cốc bằng mười đấu dùng trong | nhanh biến mất của tên "
          },
          {
            art: "cut-shrine",
            en: "Your third light reaches them first. The name holds - trembling, then true.",
            zh: " bạn của thu ba một cái chén nhỏ đèn trước cuối cùng tên ổn định sống hoàn thành: trước là run rẩy, sau đó thật "
          }
        ]
      },
      { id: "c", type: "line", speaker: "Ella", portrait: "ella-worry", next: "end",
        en: "Rest if you need. The Adult still sleeps under the eighth stone - for now.",
        zh: " cần trong trường hợp đó nghỉ trưởng thành vẫn ngủ tồn tại thu tám cục đơn vị đo lường khô cho ngũ cốc bằng mười đấu xuống--tạm thời như thế " },
      { id: "end", type: "end" }
    ]
  },

  mist_after_04: {
    id: "mist_after_04", title: "Mistvale · Nameless Beast",
    nodes: [
      { id: "a", type: "line", speaker: "Ella", portrait: "enemy",
        en: "That beast stopped spinning. It remembered what it was called - briefly.",
        zh: " biến thể của đầu quái thú không còn quay hoàn thành nó thời gian ngắn nhớ lại hoàn thành bản thân của tên " },
      { id: "b", type: "line", speaker: "Ella", portrait: "ella",
        en: "Memory Power isn't only for humans. Even monsters want a name.",
        zh: " nhớ cua sức mạnh không chỉ cho người liên kết quái vật cũng muốn một dùng trong | tên " },
      { id: "c", type: "line", speaker: "Ella", portrait: "ella-smile", next: "end",
        en: "If you can name a fear, you can cut it. Remember that when the Adult wakes.",
        zh: " có thể đặt tên bị khiếp sợ, trong trường hợp đó có thể cắt đứt nó trưởng thành thức dậy biến thể cũ của |, nhớ này biến thể của phương ngữ " },
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
            zh: " bầu trời sự thiếu của biến thể của một khối chăn khâu lại màu vàng kim của ánh sáng, hãy blue viết cứu vãn tình thế tuyệt vọng vòm "
          }
        ]
      },
      { id: "a", type: "line", speaker: "Narrator", portrait: "cut-sky",
        en: "Someone nearby whispers the word as if tasting rain for the first time.",
        zh: " ai đó nhẹ nhàng biến thể của đi ra cái đó biến thể cũ của |, giống lần đầu tiên nếm đến Vũ Thủy hoặc Nước Mưa " },
      { id: "b", type: "line", speaker: "Ella", portrait: "ella-smile", next: "end",
        en: "Color is a word too. Never let them tell you adjectives are useless.",
        zh: " màu sắc cũng là biến thể cũ của | rời khỏi thư ai thuyết phục tính từ vô dụng " },
      { id: "end", type: "end" }
    ]
  },

  mist_after_06: {
    id: "mist_after_06", title: "Mistvale · Hope",
    nodes: [
      { id: "a", type: "line", speaker: "Child", portrait: "cut-village",
        en: "Hope... hope... I can say it again!",
        zh: " hy vọng......hy vọng......tôi nữa có thể nói ra đến hoàn thành! " },
      { id: "b", type: "line", speaker: "Ella", portrait: "ella-smile",
        en: "Smoke from the chimneys again. That's what a correct answer looks like on a map.",
        zh: " khói bốc lên từ bếp nữa đứng lên hoàn thành đúng câu trả lời địa phương sơ đồ dùng trong |, chiều dài loại này " },
      { id: "c", type: "line", speaker: "Ella", portrait: "ella-fierce", next: "end",
        en: "Two lights left before the ground starts knocking. Stay with me.",
        zh: " lại hai một cái chén nhỏ đèn, dưới lòng đất trong trường hợp đó có thể gõ cửa gót chân chặt tôi " },
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
            zh: " bảy một cái chén nhỏ đèn cánh đồng xem | sống thở thu tám cục đơn vị đo lường khô cho ngũ cốc bằng mười đấu xuống, có đông và tây tồn tại sửa đổi«nền tảng» "
          }
        ]
      },
      { id: "a", type: "line", speaker: "Ella", portrait: "ella-worry",
        en: "The Adult Fog-Tongue is waking. It will try to erase who you are - and who they are.",
        zh: " sương mù dùng trong để phiên âm từ Đài Loan nghĩa là ”lưỡi”·trưởng thành tồn tại thức dậy nó có thể lau chùi rơi bạn là ai--cũng như họ là ai " },
      { id: "b", type: "line", speaker: "Ella", portrait: "ella-fierce",
        en: "Check your title. Steady your breath. Then we go loud.",
        zh: " nhìn rõ tên ổn định sống thở sau đó, giọng to đi ra kiếm hai lưỡi " },
      { id: "c", type: "line", speaker: "Hero", portrait: "hero-determined", next: "end",
        en: "(Starlight burns hotter. You step toward the last shrine.)",
        zh: "(ngôi sao mảnh vụn thay đổi hoặc thay thế làm bỏng bạn hướng cuối cùng một chỗ ngồi nhà thờ )" },
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
            zh: " sương mù giống chăn véo biến thể cũ của | của biến thể của ánh đèn ngừng cháy, chỉ còn lại bạn này một cư trú nhà thờ ánh sáng "
          },
          {
            art: "boss",
            en: "From the fog rises a tongue large enough to lick a name off a city.",
            zh: " sương mù Trung Quốc nâng lên một cắt đứt lưỡi, to đến có thể liếm rơi một chỗ ngồi tường thành của tên "
          }
        ]
      },
      {
        id: "b1", type: "line", speaker: "Ella", portrait: "ella-fierce",
        en: "Don't look for me - look at its tongue. It's trying to erase who am I.",
        zh: " rời khỏi cố gắng tìm tôi--chăm sóc nó của lưỡi nó tồn tại lau chùi rơi who am I "
      },
      {
        id: "b2", type: "line", speaker: "Adult Fog-Tongue", portrait: "boss",
        en: "Forget... forget... you were never anyone...",
        zh: " quên hoàn thành......quên hoàn thành......bạn không bao giờ là ai......"
      },
      {
        id: "b3", type: "choice", portrait: "hero-determined",
        en: "Your Memory Power flares. What do you declare?",
        zh: " nhớ cua sức mạnh châm lửa bạn yêu cầu tuyên bố gì?? ",
        options: [
          { en: "I remember my name!", zh: " tôi nhớ tôi của tên! ", flag: "boss_name", next: "b4" },
          { en: "I remember theirs!", zh: " tôi nhớ họ của tên! ", flag: "boss_others", next: "b4a" }
        ]
      },
      {
        id: "b4", type: "line", speaker: "Ella", portrait: "ella-fierce", next: "b5",
        en: "Good. Then prove it - every correct spelling is a slash across that tongue!",
        zh: " tốt biến thể của trong trường hợp đó bằng chứng--mỗi đầu tiên đúng đánh vần, tất cả là chặt đầu hướng biến thể của cắt đứt lưỡi của một kiếm hai lưỡi! "
      },
      {
        id: "b4a", type: "line", speaker: "Ella", portrait: "ella-smile", next: "b5",
        en: "That's the prince's vow. Hold it when the fog screams loudest.",
        zh: " tất nhiên hoàng tử của cam kết sương mù biến thể của tiếng của thời gian, nắm bắt nó "
      },
      {
        id: "b5", type: "line", speaker: "Ella", portrait: "ella-fierce", next: "end",
        en: "Timed answers. Miss and it bites. Hit true - and cut.",
        zh: " đặt giới hạn thời gian trả lời bỏ lỡ trong trường hợp đó theo thứ tự cắn trả lời hoặc đáp lại câu hỏi của ai đó--trong trường hợp đó chặt đầu! "
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
            zh: " sương mù dùng trong để phiên âm từ Đài Loan nghĩa là ”lưỡi”·trưởng thành vỡ thành mảnh thành công sương buổi sáng sương mù cánh đồng trong nhiều năm qua lần đầu tiên thở ra một hơi "
          },
          {
            art: "cut-names",
            en: "Children shout their names across the plain. Lanterns answer like a second sunrise.",
            zh: " trẻ em tồn tại cánh đồng dùng trong | la hét đến từ tự bản thân của tên đèn lồng phản hồi, giống vòng thứ hai mặt trời mọc "
          },
          {
            art: "cut-clear",
            en: "Far east, empty stelae begin to open their eyes.",
            zh: " Viễn Đông, trống không bia tưởng niệm đang ở mở mắt "
          }
        ]
      },
      {
        id: "c1", type: "line", speaker: "Prince Lex (echo)", portrait: "prince",
        en: "Names are the shortest epics. You learned to fight. Next - remember for others.",
        zh: " tên là biến thể của ngắn của một bản anh hùng ca bạn học hoàn thành chiến đấu Bước tiếp theo--thay thế cho người khác nhớ "
      },
      {
        id: "c2", type: "line", speaker: "Ella", portrait: "ella-smile",
        en: "Chapter I - done. I'm writing it down before I cry. Don't look.",
        zh: " đầu tiên chương--hoàn thành tôi trước ghi chép đi xuống, để không phải khóc đi ra đừng bị đánh lừa bởi thực tế rằng tôi "
      },
      {
        id: "c3", type: "line", speaker: "Ella", portrait: "map-stone", next: "end",
        en: "Glyph Gorge waits when you're ready. Definitions have been hollowed out - and something worse learned to yawn.",
        zh: " sự chuẩn bị tốt trong trường hợp đó đi đơn vị đo lường khô cho ngũ cốc bằng mười đấu phương ngữ hẻm núi định nghĩa chăn khai quật hoàn thành--có thay đổi hoặc thay thế bã của đông và tây học hoàn thành tá ngáp "
      },
      { id: "end", type: "end" }
    ]
  },

  /* Phase 1.5 - mid-chapter field events (non-battle) */
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
            zh: " sương mù trước đây giữa chừng, đường quên hoàn thành bản thân là đường đá một hàng thành công một dùng trong | dấu chấm hỏi "
          }
        ]
      },
      {
        id: "m1", type: "line", speaker: "Lost Traveler", portrait: "cut-village",
        en: "Which way to the village? I... I forgot the word for left.",
        zh: " đi ngôi làng như thế nào bên đi? tôi......quên hoàn thành«trái»này biến thể cũ của | "
      },
      {
        id: "m2", type: "choice", portrait: "ella-worry",
        en: "Ella glances at you. How do you answer?",
        zh: " ngải cứu hoặc ngải đắng kéo chăm sóc bạn một cái nhìn bạn như thế nào? hình thức gắn liền có nghĩa giống như từ tự do? ",
        options: [
          { en: "Point left. Say the word aloud.", zh: " chỉ về bên trái, giọng to nói ra cái đó biến thể cũ của | ", flag: "mid_left", next: "m3a" },
          { en: "Walk with them until the word returns.", zh: " đi cùng họ đi, cho đến biến thể cũ của | trở về ", flag: "mid_walk", next: "m3b" }
        ]
      },
      {
        id: "m3a", type: "line", speaker: "Ella", portrait: "ella-fierce", next: "m4",
        en: "Good. Speaking a word into the fog is half a sword-stroke.",
        zh: " tốt đúng nước đi sương mù nói ra một dùng trong | biến thể cũ của |, trong trường hợp đó đã là một nửa kiếm hai lưỡi "
      },
      {
        id: "m3b", type: "line", speaker: "Ella", portrait: "ella-smile", next: "m4",
        en: "Patience is also Memory Power. The fog hates company.",
        zh: " kiên nhẫn cũng là nhớ cua sức mạnh sương mù biến thể của ghét ai đó đi cùng "
      },
      {
        id: "m4", type: "line", speaker: "Lost Traveler", portrait: "cut-village", next: "end",
        en: "Left... left! Thank you. The fourth shrine is ahead - it smells like fear.",
        zh: " trái......trái! cảm ơn thu bốn chỗ ngồi nhà thờ phía trước đầu--nghe đứng lên giống bị khiếp sợ "
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
            zh: " ba sợi khói bốc lên từ bếp nữa nâng lên đến mẹ tồn tại trẻ em lòng bàn tay viết xuống hope "
          },
          {
            art: "cut-sky",
            en: "Above them, a thin ribbon of blue refuses to fade.",
            zh: " tồn tại họ nơi phía trên, cùng nhau tỉ mỉ của màu xanh, từ chối phai nhạt "
          }
        ]
      },
      {
        id: "n1", type: "line", speaker: "Ella", portrait: "ella-worry",
        en: "Six lights almost. The Adult under the eighth stone is dreaming louder.",
        zh: " nhanh sáu một cái chén nhỏ đèn hoàn thành thu tám cục đơn vị đo lường khô cho ngũ cốc bằng mười đấu xuống của trưởng thành, giấc mơ được thay đổi hoặc thay thế tiếng "
      },
      {
        id: "n2", type: "line", speaker: "Child", portrait: "cut-village",
        en: "Hero! When you win... will the sky stay blue?",
        zh: " dũng cảm người mà! bạn thắng hoàn thành sau......bầu trời có thể thẳng là màu xanh lam của gì?? "
      },
      {
        id: "n3", type: "line", speaker: "Hero", portrait: "hero-determined", next: "end",
        en: "(You nod. The spark in your palm answers for you.)",
        zh: "(bạn gật đầu lòng bàn tay của ngôi sao mảnh vụn thay thế cho bạn trả lời )"
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
        zh: " bạn trở về hoàn thành buổi sáng sương mù nghe đứng lên giống biến thể của | đá, vẫn còn chăn nhớ lại của tên "
      },
      {
        id: "r1", type: "line", speaker: "Villager", portrait: "cut-names",
        en: "The Adult is gone. We keep a lamp on the eighth shrine for you.",
        zh: " trưởng thành chết thu tám chỗ ngồi nhà thờ chúng tôi cho bạn biến thể cũ của nước đi một một cái chén nhỏ đèn "
      },
      {
        id: "r2", type: "line", speaker: "Ella", portrait: "map-stone", next: "end",
        en: "Revisit if you want. The real road is east - Glyph Gorge won't wait forever.",
        zh: " nghĩ đáp lễ trong trường hợp đó đáp lễ chính hãng của đường tồn tại hướng đông--đơn vị đo lường khô cho ngũ cốc bằng mười đấu phương ngữ hẻm núi không có khả năng mãi mãi đợi bạn "
      },
      { id: "end", type: "end" }
    ]
  }
};

// Back-compat alias used by Phase 0 boot hook
window.YYSD_WORD_REALM_VN_SCRIPT.mist_clear3 = window.YYSD_WORD_REALM_VN_SCRIPT.mist_after_03;
