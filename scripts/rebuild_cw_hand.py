#!/usr/bin/env python3
"""Rebuild R-CW bank from TOEFL-Hand answer-key screenshots."""
import json
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from build_bank_from_png import unjam, still_jammed # noqa: E402

OCR_BIN = "/tmp/ocr_vision"
CACHE = "/tmp/yysd-ocr-hand"
HAND = os.environ.get(
    "YYSD_CW_HAND",
    "/Users/frankman/Desktop/TOEFL-Hand/01-reading/01-R-CW",
)
OUT = os.path.join(ROOT, "app/library/toefl/bank-cw-reading.json")
FILE_RE = re.compile(r"^R-CW(\d+)-(.+)\.png$", re.I)
ANS_RE = re.compile(r"^(\d{1,2})\)\s*([A-Za-z][A-Za-z''\-]*)$")


def ocr_one(path):
    os.makedirs(CACHE, exist_ok=True)
    key = re.sub(r"[^A-Za-z0-9._-]+", "_", os.path.basename(path))
    cache = os.path.join(CACHE, key + ".json")
    if os.path.exists(cache) and os.path.getsize(cache) > 2:
        return json.load(open(cache))
    raw = subprocess.check_output([OCR_BIN, path])
    data = json.loads(raw.decode())
    json.dump(data, open(cache, "w"), ensure_ascii=False)
    return data


def reading_order(rows, gap=0.018):
    rows = sorted(rows, key=lambda r: -r["y"])
    clusters = []
    for r in rows:
        if clusters and abs(clusters[-1][0]["y"] - r["y"]) < gap:
            clusters[-1].append(r)
        else:
            clusters.append([r])
    out = []
    for c in clusters:
        c.sort(key=lambda r: r["x"])
        out.extend(c)
    return out


def glue_lines(rows):
    out = []
    for r in reading_order(rows):
        t = (r.get("t") or "").strip()
        if t:
            out.append(t)
    return " ".join(out)


def normalize_blanks(s):
    s = s.replace("\u2014", "-").replace("\u2013", "-")
    s = re.sub(r"(?:_|\s){0,3}(?:\s_+)+\s*", "__", s)
    s = re.sub(r"([A-Za-z])\s+_+\s*", r"\1__", s)
    s = re.sub(r"_{3,}", "__", s)
    s = re.sub(r" {2,}", " ", s)
    return s.strip()


def extract_answers(lines):
    found = {}
    for r in lines:
        if r["y"] > 0.52 or r["y"] < 0.28:
            continue
        t = (r.get("t") or "").strip()
        m = ANS_RE.match(t)
        if m:
            found[int(m.group(1))] = m.group(2)
        else:
            for m in re.finditer(r"(\d{1,2})\)\s*([A-Za-z][A-Za-z''\-]*)", t):
                found[int(m.group(1))] = m.group(2)
    words = [found[i] for i in range(1, 11) if i in found]
    return words


def extract_passage(lines):
    rows = [r for r in lines if 0.54 <= r["y"] < 0.86]
    text = glue_lines(rows)
    text = re.sub(r"\b(?: Đáp án | toàn văn phiên dịch)\b", " ", text)
    return normalize_blanks(text)


def extract_title(lines, fallback):
    top = [r for r in lines if r["y"] >= 0.86]
    if not top:
        return fallback
    t = glue_lines(top)
    t = re.sub(r"\s+", " ", t).strip()
    return t or fallback


def extract_zh(lines):
    rows = [r for r in lines if r["y"] < 0.26]
    text = glue_lines(rows)
    zh = "".join(re.findall(r"[\u4e00-\u9fff]+", text))
    return zh if len(zh) >= 12 else ""


def match_one(text, pos, word):
    rest = text[pos:]
    if not rest or not word:
        return None
    cands = []
    for k in range(len(word) - 1, 0, -1):
        pre = re.escape(word[:k])
        pats = [re.compile(r"\b" + pre + r"_+", re.I), re.compile(r"\b" + pre + r"\b", re.I)]
        # glued "Speciesad__" — only for 2+ letter prefixes so "of" cannot eat "lo__"
        if k >= 2:
            pats.insert(1, re.compile(pre + r"_+", re.I))
        for pat in pats:
            m = pat.search(rest)
            if not m:
                continue
            letters = re.sub(r"[^A-Za-z]", "", m.group(0))
            if not letters or not word.lower().startswith(letters.lower()):
                continue
            cands.append((m.start(), -k, 0 if "_" in m.group(0) else 1, m.end(), letters))
    # OCR reads o_ / i_ as 0 / 1
    low = word.lower()
    if low in ("of", "on", "or", "to"):
        m = re.search(r"0_?", rest)
        if m:
            cands.append((m.start(), -1, 0, m.end(), word[:1]))
    if low in ("in", "it", "if", "is"):
        m = re.search(r"1_?", rest)
        if m:
            cands.append((m.start(), -1, 0, m.end(), word[:1]))
    if not cands:
        m = re.search(r"\b" + re.escape(word) + r"\b", rest, re.I)
        if m:
            cands.append((m.start(), -len(word), 1, m.end(), m.group(0)[: max(1, len(word) - 2)]))
    if not cands:
        return None
    cands.sort()
    start, _k, _u, end, letters = cands[0]
    return pos + start, pos + end, letters


def place(text, answers):
    hits = []
    pos = 0
    for word in answers:
        hit = match_one(text, pos, word)
        if not hit:
            return None
        start, end, letters = hit
        hits.append((start, end, letters, word))
        pos = end
    return hits


def clean_text(s):
    s = re.sub(r"_+", "", s or "")
    s = re.sub(r"\s+([,.;:!?])", r"\1", s)
    s = re.sub(r" {2,}", " ", s)
    if still_jammed(s):
        s = unjam(s)
    return s.strip()


def to_parts(text, hits):
    parts = []
    last = 0
    n = 0
    for start, end, letters, word in hits:
        before = clean_text(text[last:start])
        if before:
            if parts and parts[-1].get("id") and before[0] not in " \n.,;:!?)]}-":
                before = " " + before
            if not before.endswith((" ", "-", "(")):
                before += " "
            parts.append({"t": before})
        n += 1
        prefix = word[: len(letters)]
        answer = word[len(prefix):]
        if not answer:
            # matched too much; keep last 2 letters as the blank
            prefix, answer = word[:-2], word[-2:]
        parts.append({"id": n, "prefix": prefix, "answer": answer, "word": word})
        last = end
    after = clean_text(text[last:])
    if after:
        if after[0] not in " \n.,;:!?)]}-":
            after = " " + after
        parts.append({"t": after})
    return parts


def from_marked(set_id, title, zh, trans, marked):
    parts, n = [], 0
    for m in re.finditer(r"\{([^|]+)\|([^}]+)\}|([^{]+)", marked):
        if m.group(3) is not None:
            parts.append({"t": m.group(3)})
        else:
            n += 1
            pre, rest = m.group(1), m.group(2)
            parts.append({"id": n, "prefix": pre, "answer": rest, "word": pre + rest})
    task = {
        "type": "complete_words",
        "title": title,
        "titleZh": zh or title,
        "instruction": "Fill in the missing letters in the paragraph.",
        "passage": parts,
        "set": set_id,
    }
    if trans:
        task["translation"] = trans
    return task


# OCR leftovers: glued prefixes / 0-for-o / dropped underscores. Hand-marked from the same PNGs.
OVERRIDE = {
    "R-CW25": from_marked(
        "R-CW25", "Stomata", " lỗ thoát khí ",
        " thực vật lá cây và hành trên có xưng là lỗ thoát khí lỗ nhỏ, khiến nó đám có thể từ trong không khí hấp thu các-bon-đi ô-xít cũng hướng trong không khí phóng thích dưỡng khí. nhưng mà, lỗ thoát khí cũng sẽ lại để cho hơi nước bật ra, cái này ở khô ráo trong hoàn cảnh sẽ khiến vấn đề. để giải quyết vấn đề này, tại hơi nước xói mòn đặc biệt nghiêm trọng thời kì, một ít Thực vật sẽ tạm thời Đóng lỗ thoát khí. một loại khác đặc thù thích ứng là Thực vật trên phiến lá thật dầy sáp chất tầng, có trợ giúp Lưu hơi nước. ",
        "Plants have tiny holes called stomata on their leaves and stems that allow them to take in carbon dioxide from the air and release oxygen into the air. {How|ever}, stomata {c|an} also {l|et} water vapor {esc|ape}, which {cau|ses} problems {i|n} dry {enviro|nments}. To {man|age} this, {dur|ing} hot {per|iods} when water loss is especially severe, some plants close their stomata temporarily. Another special adaptation is thick, waxy coatings on plant leaves that help conserve water.",
    ),
    "R-CW30": from_marked(
        "R-CW30", "Ocean Currents", " hải lưu ",
        " hải lưu là địa cầu Khí hậu hệ thống trọng yếu tạo thành bộ phận, ảnh hưởng thời tiết hình thức và hải dương sinh thái hệ thống. tại gió, độ ấm biến hóa và độ mặn khác biệt khu động hạ, hải lưu đem nhiệt lượng phân bố đến toàn cầu các nơi. tỷ như, Mê-hi-cô vịnh chảy khiến cho bắc đại Tây Dương biến ấm, ảnh hưởng Châu Âu Khí hậu. sâu hải lưu, cũng xưng là ôn muối chuyển động tuần hoàn, tại điều tiết toàn cầu độ ấm và các-bon-đi ô-xít phương diện tài nghệ phát huy tác dụng. hải dương học nghiên cứu không ngừng công bố những mục này động thái hệ thống phức tạp tính. ",
        "Ocean currents are critical components of Earth's climate system, influencing weather patterns and marine ecosystems. Driven {b|y} wind, {tempe|rature} changes, {a|nd} differences {i|n} salinity, ocean currents {distr|ibute} heat {acr|oss} the {gl|obe}. The Gulf Stream, {f|or} instance, {wa|rms} the North Atlantic, {affe|cting} climate in Europe. Deep ocean currents, known as thermohaline circulation, play a role in regulating global temperatures and carbon dioxide levels. Research in oceanography continues to reveal the complexities of these dynamic systems.",
    ),
    "R-CW46": from_marked(
        "R-CW46", "The Ottoman Empire", " áo tư man đế quốc ",
        " áo tư man đế quốc sống còn tại năm 1299 đến năm 1922, là một cổ cường đại lực lượng, cải tạo rồi Châu Âu, vùng Trung Đông và Bắc Phi chính trị và văn hóa bố cục. nên đế quốc dùng thực lực quân sự và chiến lược chinh phục trứ danh, tại tô lai man đại đế thống trị thời kì đạt tới cường thịnh, ở giữa Nghệ thuật và kiến trúc bồng bột phát triển. áo tư man người vẫn còn toàn cầu mậu dịch Vừa phát huy mấu chốt tác dụng, khống chế được liên tiếp Á Châu hương liệu thị trường và Châu Âu trung tâm thương nghiệp trọng yếu mậu dịch lộ tuyến. ",
        "The Ottoman Empire, which lasted from 1299 to 1922, was a formidable force that reshaped the political and cultural landscapes of Europe, the Middle East, and North Africa. Renowned for its {mili|tary} prowess {a|nd} strategic {conq|uests}, the {emp|ire} reached {i|ts} zenith {un|der} the {re|ign} of Suleyman the Magnificent, {dur|ing} which {ar|ts} and {archit|ecture} flourished. The Ottomans also played a pivotal role in global commerce, controlling key trade routes that linked the spice markets of Asia with the merchant hubs of Europe.",
    ),
    "R-CW63": from_marked(
        "R-CW63", "River Delta Formation", " dòng sông vùng châu thổ hình thành ",
        " dòng sông vùng châu thổ hình thành là một loại Địa lý quá trình, thể hiện lục địa và nước thể ở giữa động thái hỗ trợ lẫn nhau. {làm:lúc} dòng sông chảy vào biển dương hoặc biển rộng {các loại:đợi} nước thể lúc, tốc độ chảy sẽ giảm bớt, đem thượng du mang theo vật chất trầm tích xuống. trầm tích vật dần dần chồng chất, tạo thành vùng châu thổ, đây là hướng trong nước dọc theo phì nhiêu hình dạng mặt đất. vùng châu thổ không chỉ có chống đở đa dạng sinh thái hệ thống, còn cung cấp phong phú nông nghiệp dùng. ",
        "The formation of river deltas is a geographical process that illustrates the dynamic interaction between land and water. When a river reaches a body of water, such as an {oc|ean} or {s|ea}, it {sl|ows} down, {depos|iting} the {mate|rials} it has {car|ried} from {upst|ream}. Gradually, {t|he} sediments {accum|ulate} to {cre|ate} deltas, which are fertile landforms that extend into the water. Deltas not only support diverse ecosystems but also provide rich agricultural land.",
    ),
    "R-CW89": from_marked(
        "R-CW89", "Exoplanets", " hệ người thường sao ",
        " năm gần đây, hệ người thường sao nghiên cứu nhanh chóng phát triển, một lần nữa định nghĩa chúng ta đối với vũ trụ lý giải. nhà thiên văn học đã xác nhận mấy nghìn cái mặt trời hệ bên ngoài hành tinh, trong đó một ít hành tinh cùng hắn hằng tinh quỹ đạo rời đi gần vừa đủ, khả năng ủng hộ sinh mệnh tồn tại. những mục này Khám phá khiêu chiến trước đây về hành tinh hình thành cũng như nơi khác tồn tại sinh mệnh khả năng quan niệm. tại đây chút ít xa xôi trên thế giới phát hiện hơi nước và mê-tan {các loại:đợi} đại khí thành phần, {vì:là} chúng có hay không thích hợp thai nghén sinh mệnh cung cấp làm cho người hưng phấn manh mối. ",
        "The study of exoplanets has rapidly advanced in recent years, redefining our understanding of the universe. Astronomers have identified thousands of planets beyond our solar system, some of which orbit close enough to their stars to support life. These {find|ings} challenge {prev|ious} notions {ab|out} planetary {form|ation} and {t|he} potential {f|or} life {else|where}. The {dete|ction} of {atmos|pheric} components {li|ke} water vapor and methane in these distant worlds offers exciting clues about their suitability for hosting life.",
    ),
    "R-CW107": from_marked(
        "R-CW107", "Underwater Robotics", " dưới nước người máy ",
        " dưới nước người máy kỹ thuật tiến bộ đang hoàn toàn thay đổi hải dương thăm dò. những người máy này được xưng là tự chủ dưới nước vận chuyển khí (AUV), có thể độc lập tại biển sâu trong hoàn cảnh vận chuyển. AUV phân phối máy truyền cảm và cameras, có thể thu thập có quan hệ sinh vật biển, hải lưu và dưới nước địa chất số liệu. chúng có thể đến Nhân loại thợ lặn không cách nào đạt tới chiều sâu, {vì:là} không biết khu vực cung cấp quý báu giải thích. nhân viên nghiên cứu lợi dụng AUV đến nghiên cứu Khí hậu biến hóa đối với hải dương sinh thái hệ thống ảnh hưởng cũng thăm dò dưới nước khảo cổ di chỉ, tăng cường chúng tôi đối với đại dương hiểu rõ. ",
        "Advancements in underwater robotics are revolutionizing ocean exploration. These robots, known as autonomous underwater vehicles (AUVs), can navigate deep-sea environments independently. Equipped with {sen|sors} and {cam|eras}, AUVs {col|lect} data {o|n} marine {li|fe}, ocean {curr|ents}, and {under|water} geology. {Th|ey} can {re|ach} depths {th|at} are inaccessible to human divers, providing valuable insights into uncharted regions. Researchers use AUVs to study the impact of climate change on ocean ecosystems and to explore underwater archaeological sites, enhancing our understanding of the ocean.",
    ),
    "R-CW109": from_marked(
        "R-CW109", "Language Development", " ngôn ngữ phát triển ",
        " nhi đồng ngôn ngữ phát triển là một phức tạp quá trình, đã bị di truyền và hoàn cảnh ảnh hưởng. từ sinh ra nảy sinh, hài nhi mà bắt đầu phân biệt thanh âm và ngôn ngữ hình thức. đến một tuổi thời điểm, đại đa số mọi người có thể nói “ mụ mụ ” hoặc “ ba ba ” {các loại:đợi} đơn giản Từ vựng. theo họ phát triển, họ Từ vựng số lượng nhanh chóng mở rộng. và hộ lý nhân viên và bạn cùng lứa tuổi ảnh hưởng lẫn nhau,tác động qua lại tại đây một phát giương Vừa nổi lên cực kỳ trọng yếu tác dụng. cho hài tử đọc sách và tham dự đối thoại là ủng hộ ngôn ngữ tập được phương pháp hữu hiệu. ",
        "Language development in children is a complex process influenced by both genetics and environment. From {bi|rth} infants {be|gin} to recognize {sou|nds} and {patt|erns} in {spe|ech}. By {o|ne} year {o|f} age, {mo|st} can {sp|eak} simple {wo|rds} like \"mama\" or \"dada.\" As they grow, their vocabulary expands rapidly. Interacting with caregivers and peers plays a crucial role in this development. Reading to children and engaging in conversations are effective ways to support language acquisition.",
    ),
    "R-CW121": from_marked(
        "R-CW121", "Color Perception and Pigments", " màu sắc cảm giác và thuốc màu ",
        " mấy cái thế kỷ đến nay, màu sắc cảm giác một mực hấp dẫn lấy nhà khoa học và nghệ thuật gia. thuốc màu là giao phó tài liệu màu sắc vật chất; đối với thuốc màu nghiên cứu yết kỳ chúng và quang phức tạp hỗ trợ lẫn nhau. thuốc màu hấp thu có chút bước sóng(khoảng cách một chu kì dao động) cũng phản xạ Khác bước sóng(khoảng cách một chu kì dao động), đây chính là vật thể hiện ra màu sắc nguyên nhân. hợp thành thuốc màu làm lớn ra nghệ thuật gia và công nghiệp có thể dùng sắc thái phạm vi. nghiên cứu phát minh thuốc màu cần Hóa học và Vật lý tri thức, vì kia tính chất ảnh hưởng bền tính và vẻ ngoài. lý giải thuốc màu hành vi đối với Nghệ thuật chữa trị, chế tạo {các loại:đợi} nhiều lĩnh vực đều rất trọng yếu. ",
        "Color perception has fascinated scientists and artists alike for centuries. The study of pigments, {subst|ances} that {gi|ve} color {t|o} materials, {rev|eals} complex {intera|ctions} with {li|ght}. Pigments {abs|orb} certain {wavel|engths} and {ref|lect} others, {wh|ich} is why objects appear to have color. Synthetic pigments have expanded the color palette available to artists and industries. The development of pigments requires knowledge of chemistry and physics, as their properties influence durability and appearance. Understanding how pigments behave is crucial in various fields, from art restoration to manufacturing.",
    ),
    "R-CW128": from_marked(
        "R-CW128", "Sodium-Ion Batteries", " Na-tri ly tử i-ông pin ",
        " Na-tri ly tử i-ông pin với tư cách lí pin tiềm ẩn vật thay thế ngày chính lợi ích đã bị chú ý. Na-tri so với lí thay đổi thu hoạch, vì nó có thể từ biển trong nước chắt lọc, mà lí bình thường cần chọn dùng khả năng nguy hại hoàn cảnh khai thác phương pháp. từ lâu dài đến xem, Na-tri ly tử i-ông kỹ thuật bị cho rằng thay đổi lớn có thể tiếp tục tính. nhưng mà, một số khiêu chiến hạn chế của nó rộng khắp hữu ích,thiết thực. Na-tri ly tử i-ông pin trữ có thể thường thường thấp hơn lí pin, do đó thấp xuống ở có chút hữu ích,thiết thực trong đích hiệu suất. nhân viên nghiên cứu tiếp tục nghiên cứu Na-tri ly tử i-ông pin, dùng tăng lên kia tính năng cũng Đồng ý ở tương lai hệ thống nhiên liệu trong đích tác dụng. ",
        "Sodium-ion batteries are gaining attention as a potential alternative to lithium-ion batteries. Sodium is more accessible than lithium because it can be extracted from seawater, while lithium typically requires mining methods that can {ha|rm} the {envir|onment}. Sodium-ion {techn|ology} is {consi|dered} more {susta|inable} in {t|he} long {te|rm}. However, {sev|eral} challenges {li|mit} its {wides|pread} use. Sodium-ion batteries often store less energy than lithium-ion batteries, reducing their efficiency for certain applications. Researchers continue to study sodium-ion batteries in order to improve their performance and determine their role in future energy systems.",
    ),
    "R-CW129": from_marked(
        "R-CW129", "Human Anatomy", " nhân thể giải phẩu học ",
        " nhân thể giải phẩu học là đúng nhân thể kết cấu khoa học nghiên cứu. giải phẫu học yết kỳ thân thể bất đồng bộ phận làm thế nào hỗ trợ lẫn nhau và cộng đồng triển khai tác dụng dùng duy trì sinh mệnh. tỷ như, hệ thống tuần hoàn đem huyết dịch chuyển vận đến toàn thân, đem dưỡng khí và dinh dưỡng vật chất đưa đến tế bào, đồng thời thanh trừ phế vật. giải phẫu học gia còn phải hiểu rõ khí quan, tổ chức và tế bào tổ chức. chữa bệnh nhân viên chuyên nghiệp lợi dụng giải phẫu học tri thức đến chẩn đoán bệnh và trị liệu tật bệnh, cải thiện người bệnh hộ lý và Sức khỏe kết quả. ",
        "Human anatomy is the scientific study of human structure. Anatomy {rev|eals} how different {pa|rts} of {t|he} body {inte|ract} and {func|tion} together {t|o} maintain {li|fe}. For {exa|mple}, the circulatory {sys|tem} transports {bl|ood} throughout the body, carrying oxygen and nutrients to cells while removing waste products. Anatomists must also understand the organization of organs, tissues, and cells. Medical professionals use anatomical knowledge to diagnose and treat illnesses, improving patient care and health outcomes.",
    ),
    "R-CW133": from_marked(
        "R-CW133", "Prehistoric Tools", " tiền sử công cụ ",
        " lúc ban đầu, Nhân loại sử dụng vật tự nhiên thể với tư cách công cụ (tỷ như, sắc bén tảng đá hoặc phân nhánh côn). về sau, mọi người Bắt đầu có chỗ mục đích đem mảnh gỗ và tảng đá tạo thành công cụ. bởi vì vật liệu gỗ Dễ thối rữa tính chất, hiện đại về tiền sử thời đại làm thế nào sử dụng vật liệu gỗ tri thức rất lớn trong trình độ chỉ có thể dựa vào suy đoán. nhưng mà, đã có thạch khí công cụ, các nhà khảo cổ học thì có càng kiên cố trụ cột. có đại lượng may mắn còn sống sót văn vật. tại trong phạm vi toàn thế giới, đá lửa bởi vì không tầm thường Vật lý đặc tính mà trở thành một loại được hoan nghênh tài liệu. ",
        "Initially, humans used naturally occurring objects as tools (for instance, a sharp stone or a forked stick). Later, {peo|ple} began {purpos|efully} to {sh|ape} wood {a|nd} stone {in|to} tools. {Bec|ause} of {t|he} perishable {nat|ure} of {wo|od}, modern {know|ledge} of how it was used in prehistoric times is largely a matter of inference. With tools of stone, however, archaeologists are on firmer ground; there are a vast number of surviving artifacts. Throughout the world, flint was a favored material because of its unusual physical properties.",
    ),
    "R-CW140": from_marked(
        "R-CW140", "Black Holes", " hắc động ",
        " vũ trụ mênh mông bao la bát ngát, tràn đầy mấy cái thế kỷ đến nay một mực hấp dẫn lấy loài người bí ẩn. hắc động là trong vũ trụ một cái khu vực, nơi đó lực hút phi thường cường đại, bất kỳ vật gì đều không thể đào thoát, thậm chí ngay cả quang cũng không cách nào đào thoát. cho dù hắc động là không nhìn thấy, nhưng có thể thông qua quan sát chúng đối với phụ cận vật chất ảnh hưởng đến dò xét chúng. hắc động ở trên trời thể vật lý học Vừa phát huy cực kỳ trọng yếu tác dụng, ảnh hưởng tinh hệ hình thành cũng cung cấp đối không lúc giữa, thời gian và trọng lực bản chất giải thích. ",
        "The universe is a vast expanse, filled with mysteries that have intrigued humans for centuries. Black holes are {reg|ions} in {sp|ace} where {gra|vity} is {s|o} strong {th|at} nothing, {n|ot} even {li|ght}, can {esc|ape}. Even {tho|ugh} they {a|re} invisible, black holes can be detected by observing their effects on nearby matter. Black holes play a crucial role in astrophysics, influencing galaxy formation and offering insights into the nature of space, time, and gravity.",
    ),
    "R-CW141": from_marked(
        "R-CW141", "Industrialization and Urbanization", " công nghiệp hoá và Đô thị hóa ",
        " tại công nghiệp hoá sơ kỳ, rất nhiều Đô thị đã trải qua rất nhanh phát triển. đây là bởi vì đại lượng công nhân dũng mãnh vào nhà xưởng tìm kiếm công tác. Đô thị hóa dẫn đến xã hội kết cấu phát sinh trọng đại biến hóa, đến từ bất đồng bối cảnh mọi người Bắt đầu khoảng cách gần cuộc sống và công tác. công nghiệp hoá cũng khép lại các loại khiêu chiến, kể cả Ô nhiễm tăng lên tạo thành Môi trường vấn đề cũng như cải thiện thành trì mới thành phố cư dân nhà ở và Giao thông trụ cột thiết thi cần. ",
        "In the early days of industrialization, many cities experienced rapid growth. This {w|as} due {t|o} the {inf|lux} of {wor|kers} seeking {emplo|yment} in {fact|ories}. Urbanization {l|ed} to {signi|ficant} changes {i|n} the {soc|ial} fabric, as people from diverse backgrounds came to live and work in close quarters. Industrialization also brought about various challenges, including the environmental problems caused by increased pollution and the need for improved infrastructure to house and transport the new city residents.",
    ),
    "R-CW146": from_marked(
        "R-CW146", "Environmental Geology", " Môi trường địa chất học ",
        " địa chất học liên quan đến đối với địa cầu Vật lý kết cấu và vật chất, tác dụng với họ quá trình cũng như địa cầu cực kỳ sinh mệnh hình thức lịch sử nghiên cứu. Môi trường địa chất học đặc biệt chú ý địa chất quá trình làm thế nào ảnh hưởng Nhân loại hoạt động và Môi trường. nó bao dung thiên tai ước định, tài nguyên Quản trị và thổ địa lợi dụng quy hoạch {các loại:đợi} lĩnh vực. thông qua được giải ảnh hưởng Môi trường điều kiện địa chất nhân tố, nhà địa chất học có thể giúp giảm bớt thiên tai ảnh hưởng cũng xúc tiến có thể tiếp tục phát triển. ",
        "Geology involves the study of Earth's physical structure and substances, the processes that act upon them, and the history of the planet and its life forms. Environmental geology {specif|ically} focuses {o|n} how {geolo|gical} processes {aff|ect} human {activ|ities} and {t|he} environment. {I|t} encompasses {ar|eas} such {a|s} natural {haz|ard} assessment, resource management, and land-use planning. By understanding the geological factors that influence environmental conditions, geologists can help mitigate the impacts of natural disasters and promote sustainable development.",
    ),
    "R-CW197": from_marked(
        "R-CW197", "Public Health Initiatives", " vệ sinh công cộng xướng nghị ",
        " vệ sinh công cộng xướng nghị chỉ tại xúc tiến toàn thể đám người phúc lợi cũng dự phòng tật bệnh. những mục này sách lược thường thường đã chú ý đối với có chuyện xảy ra ngắn hạn ứng đối, cũng chú ý đối với trụ cột thiết thi đầu tư lâu dài. công tác cụ thể kể cả vắc-xin phòng bệnh chích ngừa kế hoạch, Giáo dục tuyên truyền hoạt động, cũng như chế định bảo đảm mọi người đạt được sạch sẽ dùng nước và dinh dưỡng thực phẩm chính sách. chính phủ, không phải mưu cầu lợi nhuận tổ chức và cộng đồng ở giữa hợp tác, đối với hữu hiệu vệ sinh công cộng can thiệp rất trọng yếu. lý giải khỏe mạnh xã hội nhân tố quyết định, ví dụ Kinh tế học ổn định và Giáo dục, có trợ giúp lượng thân định chế(*hàng đặt theo yêu cầu) các hạng xướng nghị, dùng thỏa mãn không cùng người bầy cụ thể nhu cầu. ",
        "Public health initiatives aim to promote well-being and prevent disease across populations. These {strateg|ies} often {fo|cus} on {bo|th} short-term {resp|onses} to {emerg|encies} and long-{t|erm} investments {i|n} infrastructure. {Eff|orts} include {vacci|nation} programs, {educ|ational} campaigns, and the development of policies that ensure access to clean water and nutritious food. Collaboration between governments, nonprofit organizations, and communities is essential for effective public health interventions. Understanding the social determinants of health, such as economic stability and education, helps tailor initiatives to address the specific needs of different populations.",
    ),
    "R-CW207": from_marked(
        "R-CW207", "Moon Phases and Navigation", " dạng trăng và hàng hải ",
        " quan sát dạng trăng đối với trong lịch sử rất nhiều văn hóa đều rất trọng yếu, ảnh hưởng lịch ngày, hàng hải và Thần Thoại. dạng trăng chu kỳ tạo thành lúc đầu tính theo thời gian hệ thống trụ cột, tỷ như y Tư Lan lịch đạo Hồi và Châu Á truyền thống lịch âm dương. hàng hải thành viên lợi dụng mặt trăng vị trí đến dự đoán mặt biển cực kỳ độ sáng, dùng chỉ đạo họ vận chuyển, đặc biệt là tại ban đêm Du lịch lúc. tại trong thần thoại, ánh trăng bình thường tượng trưng cho cường đại Thần Linh hoặc biểu tượng, đắp nặn nghi thức, cổ câu chuyện và mùa tính Lễ hội. vượt qua các đại châu, trăng sáng tròn và khuyết vẫn là thông dụng đồng hồ báo thức, cũng là Nhân loại sức tưởng tượng linh cảm nơi phát ra. ",
        "Observing the moon's phases has been important for many cultures throughout history, influencing calendars, navigation, and mythology. Lunar cycles formed the basis of early timekeeping systems, such as the Islamic Hijri calendar and the traditional Chinese lunisolar calendar. Seafarers {us|ed} the {posi|tion} of {t|he} moon {t|o} make {predi|ctions} about {o|cean} levels {an|d} its {illumi|nation} to {gu|ide} their {voy|ages} especially during night travel. In mythology, the moon often embodied powerful deities or symbols, shaping rituals, stories, and seasonal festivals. Across continents, the waxing and waning of the moon has remained a universal clock and an inspiration for human imagination.",
    ),
    "R-CW214": from_marked(
        "R-CW214", "Earth's Axial Tilt and Seasons", " địa cầu trục nghiêng và mùa ",
        " chúng ta hành tinh tại quay chung quanh mặt trời vận hành lúc, trục trái đất nghiêng ước 23.5 độ. bởi vậy, đến địa cầu bất đồng bộ phận ánh mặt trời số lượng cũng không hoàn toàn giống nhau, do đó tạo thành mùa. khi mặt trời bắn thẳng đến một loại khu vực lúc, nên khu vực thường thường nhiệt độ cao hơn, ban ngày càng dài. mùa màng biến hóa ảnh hưởng sinh hoạt rất nhiều phương diện, kể cả nông nghiệp, động vật hoang dã hành vi cùng nhân loại hoạt động. ",
        "Our planet's axis is tilted at an angle of about 23.5 degrees as it orbits the Sun. {A|s} a {res|ult} the {amo|unt} of {sun|light} that {hi|ts} different {pa|rts} of {Ea|rth} is {n|ot} all {t|he} same, {crea|ting} seasons. When the Sun shines directly on a region, that region tends to have higher temperatures and longer days. The changing seasons affect many aspects of life, including agriculture, wildlife behavior, and human activities.",
    ),
    "R-CW224": from_marked(
        "R-CW224", "Photoperiodism in Trees", " cây cối quang chu kỳ hiện tượng ",
        " quang chu kỳ hiện tượng đối nhau vật sinh tồn rất trọng yếu. liền cây cối mà nói, quang chu kỳ hiện tượng là chỉ đối với ngày đêm dài ngắn phản ứng sinh lý. loại phản ứng này ảnh hưởng lá rụng, nở hoa {các loại:đợi} mùa hành vi tình dục. theo ban ngày biến ngắn, đêm tối thành dài, một ít cây mộc Bắt đầu thông qua lá rụng {vì:là} mùa màng thay đổi làm chuẩn bị. điều này có thể tại mùa đông trong vòng mấy tháng Lưu hơi nước và năng lượng, cũng bảo hộ cây cối nhạy cảm tổ chức khỏi bị bị hư hại. ",
        "Photoperiodism is crucial for the survival of organisms. In trees, photoperiodism refers to the physiological response to the length of day and night. This response influences {seas|onal} behaviors {li|ke} leaf {shed|ding} and {flow|ering}. As {t|he} days {gr|ow} shorter {a|nd} the {nig|hts} longer, {so|me} trees {be|gin} to prepare for the changing seasons by dropping their leaves. This conserves water and energy during the winter months and protects the sensitive tissues of the tree from cold damage.",
    ),
    "R-CW236": from_marked(
        "R-CW236", "Paleontology", " cổ sinh vật học ",
        " cổ sinh vật học là thông qua phân tích hoá đá ghi chép đến nghiên cứu sinh mạng lịch sử khoa học. cái này một lĩnh vực cần khảo sát hoá đá —— tiếp xúc Lưu tại trong nham thạch Sinh học hài cốt —— dùng hiểu rõ cổ đại sinh mệnh hình thức làm thế nào diễn biến cũng thích ứng kia Môi trường. cổ sinh vật học gia còn lợi dụng hoá đá đã đến giải cổ đại Môi trường điều kiện. tỷ như, ở bên trong lục địa khu phát hiện hải dương hoá đá cho thấy, những địa khu này rất có thể đã từng ở vào dưới nước. ",
        "Paleontology is the scientific study that deals with the history of life through the analysis of fossil records. This {fi|eld} involves {exam|ining} fossils—{rem|ains} of {orga|nisms} preserved {i|n} rock—{t|o} understand {h|ow} ancient {li|fe} forms {evo|lved} and {ada|pted} to their surroundings. Paleontologists also use fossils to learn about ancient environmental conditions. Finding marine fossils in landlocked areas, for example, suggests that these regions were very likely underwater once upon a time.",
    ),
}


def parse(path, lines):
    base = os.path.splitext(os.path.basename(path))[0]
    m = FILE_RE.match(os.path.basename(path))
    set_id = "R-CW%s" % m.group(1) if m else base
    fallback = (m.group(2) if m else base).replace("\uf022", ":").strip()
    if set_id in OVERRIDE:
        return OVERRIDE[set_id]
    answers = extract_answers(lines)
    passage = extract_passage(lines)
    if len(answers) < 8 or not passage:
        return None
    hits = place(passage, answers)
    if not hits:
        return None
    parts = to_parts(passage, hits)
    if len([p for p in parts if p.get("id")]) < 8:
        return None
    title = extract_title(lines, fallback)
    zh = extract_zh(lines)
    task = {
        "type": "complete_words",
        "title": fallback,
        "titleZh": zh[:40] if zh else fallback,
        "instruction": "Fill in the missing letters in the paragraph.",
        "passage": parts,
        "set": set_id,
    }
    if zh:
        task["translation"] = zh
    return task


def paper(tasks):
    return {
        "id": "bank-cw",
        "title": " Ngân hàng dạng bài · Từ vựng lấp chỗ trống ",
        "skill": "reading",
        "source": "bank",
        "tasks": tasks,
    }


def set_num(s):
    m = re.search(r"(\d+)", str(s or ""))
    return int(m.group(1)) if m else 0


def calibrate():
    if not os.path.exists(OCR_BIN):
        subprocess.check_call(
            ["swiftc", "-O", "-o", OCR_BIN, os.path.join(ROOT, "scripts/ocr_vision.swift")]
        )
    gold = {
        "R-CW1-South Pacific History.png": [
            "populations", "complex", "with", "traditions", "social",
            "The", "political", "economic", "experienced", "changes",
        ],
        "R-CW21-Academic Skills.png": [
            "thinking", "students", "approach", "systematically", "information",
            "make", "between", "Also", "are", "like",
        ],
        "R-CW26-Biochemistry.png": [
            "It", "from", "investigations", "natural", "like",
            "and", "now", "the", "of", "such",
        ],
        "R-CW14-Fossils.png": [
            "explains", "advantageous", "increase", "frequency", "population",
            "adapt", "their", "which", "to", "diversity",
        ],
        "R-CW235-Golden Toad.png": [
            "believe", "decline", "due", "habitat", "changing",
            "patterns", "disease", "by", "type", "that",
        ],
        "R-CW7-Spix's Macaw.png": [
            "population", "this", "blue", "declined", "of",
            "loss", "illegal", "for", "abroad", "private",
        ],
        "R-CW245-Plate Tectonic Theory.png": [
            "Driven", "geothermal", "and", "the", "collide",
            "slide", "one", "steadily", "continents", "ocean",
        ],
    }
    for name, want in gold.items():
        path = os.path.join(HAND, name)
        task = parse(path, ocr_one(path))
        assert task, "parse fail " + name
        got = [p["word"] for p in task["passage"] if p.get("id")]
        assert got == want, "%s %s!= %s" % (name, got, want)
        blob = " ".join(p.get("t") or "" for p in task["passage"])
        assert not re.search(r"\b(?:HEREVE|BEREXE|OT-U|OF-0|57T-0)\b", blob), name
        print("ok", task["set"], " ".join(got))
    print("ok cw-hand-calibrate")


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "check":
        calibrate()
        return
    if not os.path.exists(OCR_BIN):
        subprocess.check_call(
            ["swiftc", "-O", "-o", OCR_BIN, os.path.join(ROOT, "scripts/ocr_vision.swift")]
        )
    jobs = []
    for name in os.listdir(HAND):
        if FILE_RE.match(name):
            jobs.append(os.path.join(HAND, name))
    jobs.sort(key=lambda p: set_num(os.path.basename(p)))
    print("ocr", len(jobs), file=sys.stderr)
    tasks, failed = [], []
    with ThreadPoolExecutor(max_workers=4) as ex:
        futs = {ex.submit(ocr_one, p): p for p in jobs}
        done = 0
        for fut in as_completed(futs):
            path = futs[fut]
            done += 1
            if done % 25 == 0:
                print("ocr", done, "/", len(jobs), file=sys.stderr)
            try:
                task = parse(path, fut.result())
                if not task:
                    failed.append(os.path.basename(path))
                    continue
                tasks.append(task)
            except Exception as e:
                failed.append(os.path.basename(path) + " " + str(e))
    tasks.sort(key=lambda t: set_num(t["set"]))
    json.dump(paper(tasks), open(OUT, "w"), ensure_ascii=False, indent=2)
    print("wrote", len(tasks), "failed", len(failed))
    for f in failed:
        print("fail", f, file=sys.stderr)
    if failed:
        sys.exit(2)


if __name__ == "__main__":
    main()
