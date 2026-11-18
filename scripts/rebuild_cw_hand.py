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
from build_bank_from_png import unjam, still_jammed  # noqa: E402

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
    text = re.sub(r"\b(?:Đáp án|toàn văn dịch)\b", " ", text)
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
        # glued "Speciesad__" - only for 2+ letter prefixes so "of" cannot eat "lo__"
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
        answer = word[len(prefix) :]
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
        "R-CW25", "Stomata", " bong bóng khí ",
        " thực vật của lá biến thể cũ của cuống dùng trong | có được gọi là bong bóng khí của nhỏ lỗ, khiến chúng có khả năng biến thể của | không khí Trung Quốc hấp thụ carbon điôxít CO2 và hướng không khí Trung Quốc thả khí oxy tuy nhiên, bong bóng khí cũng có thể nhường hơi nước trốn thoát đi ra, này tồn tại khô môi trường Trung Quốc có thể gây ra câu hỏi để giải quyết này câu hỏi, tồn tại hàm lượng nước bị cuốn trôi khác thường nghiêm trọng của giai đoạn, một số thực vật có thể tạm thời đóng bong bóng khí khác hạt đặc biệt của thích nghi là thực vật lá dùng trong | dày dày của tính sáp chồng lên nhau, góp phần vào bảo tồn hàm lượng nước ",
        "Plants have tiny holes called stomata on their leaves and stems that allow them to take in carbon dioxide from the air and release oxygen into the air. {How|ever}, stomata {c|an} also {l|et} water vapor {esc|ape}, which {cau|ses} problems {i|n} dry {enviro|nments}. To {man|age} this, {dur|ing} hot {per|iods} when water loss is especially severe, some plants close their stomata temporarily. Another special adaptation is thick, waxy coatings on plant leaves that help conserve water.",
    ),
    "R-CW30": from_marked(
        "R-CW30", "Ocean Currents", " dòng hải lưu ",
        " dòng hải lưu là trái đất khí hậu hệ thống của quan trọng phần, ảnh hưởng thời tiết chế độ biến thể cũ của đại dương hệ sinh thái tồn tại gió, nhiệt độ thay đổi biến thể cũ của độ mặn sự khác biệt của điều khiển xuống, dòng hải lưu sẽ nhiệt lượng phân tán đến toàn thế giới ở khắp mọi nơi ví dụ, Vịnh Mexico chảy khiến Bắc Đại Tây Dương trở nên ấm, ảnh hưởng châu Âu của khí hậu biến thể cũ của dòng hải lưu, còn được gọi là làm tuần hoàn nhiệt muối, tồn tại điều chỉnh toàn thế giới nhiệt độ biến thể cũ của carbon điôxít CO2 mức độ khía cạnh phát huy nước đi tác động đến hải dương học nghiên cứu không ngừng cho thấy những... này chuyển động hệ thống của tính phức tạp ",
        "Ocean currents are critical components of Earth's climate system, influencing weather patterns and marine ecosystems. Driven {b|y} wind, {tempe|rature} changes, {a|nd} differences {i|n} salinity, ocean currents {distr|ibute} heat {acr|oss} the {gl|obe}. The Gulf Stream, {f|or} instance, {wa|rms} the North Atlantic, {affe|cting} climate in Europe. Deep ocean currents, known as thermohaline circulation, play a role in regulating global temperatures and carbon dioxide levels. Research in oceanography continues to reveal the complexities of these dynamic systems.",
    ),
    "R-CW46": from_marked(
        "R-CW46", "The Ottoman Empire", " Đế chế Ottoman ",
        " Đế chế Ottoman tiếp tục tồn tại đi 1299 năm đến 1922 năm, là một đùi to lớn và mạnh mẽ của sức mạnh, tái tạo hoàn thành châu Âu, Trung Đông biến thể cũ của Bắc Phi của chính trị biến thể của | văn hóa kết cấu nên đế quốc lính Israel sự thật sức mạnh biến thể cũ của chiến lược chinh phục được biết đến rộng rãi là, tồn tại Suleiman thiên đế cai trị giai đoạn đạt tới thịnh vượng, ở giữa nghệ thuật biến thể của | xây dựng mạnh mẽ sự phát triển đế chế Ottoman người vẫn tồn tại toàn thế giới thương mại Trung Quốc phát huy hoàn thành điểm mấu chốt tác động đến, kiểm soát nước đi liên kết Châu Á gia vị khu chợ biến thể của | châu Âu trung tâm kinh doanh của quan trọng thương mại hành trình ",
        "The Ottoman Empire, which lasted from 1299 to 1922, was a formidable force that reshaped the political and cultural landscapes of Europe, the Middle East, and North Africa. Renowned for its {mili|tary} prowess {a|nd} strategic {conq|uests}, the {emp|ire} reached {i|ts} zenith {un|der} the {re|ign} of Suleyman the Magnificent, {dur|ing} which {ar|ts} and {archit|ecture} flourished. The Ottomans also played a pivotal role in global commerce, controlling key trade routes that linked the spice markets of Asia with the merchant hubs of Europe.",
    ),
    "R-CW63": from_marked(
        "R-CW63", "River Delta Formation", " sông đồng bằng châu thổ hình thành ",
        " sông đồng bằng châu thổ của hình thành là một loại địa lý quá trình sự kiện, thể hiện hoàn thành đất liền biến thể của | vùng nước giữa của chuyển động tương tác đong sông chảy vào đại dương có thể biển đợi vùng nước biến thể cũ của |, tốc độ dòng chảy có thể làm chậm lại, sẽ thượng nguồn mang theo của vật chất trầm tích đi xuống trầm tích dần dần chất đống, hình thành hoàn thành đồng bằng châu thổ, này là hướng nước Trung Quốc mở rộng của màu mỡ địa mạo đồng bằng châu thổ không chỉ chống đỡ nước đi đa dạng của hệ sinh thái, vẫn đề nghị hoàn thành làm phong phú của nông nghiệp sử dụng trợ từ kết cấu: dùng trước động từ hoặc tính từ ",
        "The formation of river deltas is a geographical process that illustrates the dynamic interaction between land and water. When a river reaches a body of water, such as an {oc|ean} or {s|ea}, it {sl|ows} down, {depos|iting} the {mate|rials} it has {car|ried} from {upst|ream}. Gradually, {t|he} sediments {accum|ulate} to {cre|ate} deltas, which are fertile landforms that extend into the water. Deltas not only support diverse ecosystems but also provide rich agricultural land.",
    ),
    "R-CW89": from_marked(
        "R-CW89", "Exoplanets", " kết nối người ngoại đạo ngôi sao ",
        " trong vài năm qua, kết nối người ngoại đạo ngôi sao nghiên cứu phát triển nhanh chóng, lại định nghĩa hoàn thành chúng tôi đúng vũ trụ của lĩnh hội nhà thiên văn học đã xác nhận hoàn thành đếm một nghìn lượng từ cho vật nhỏ hình cầu hệ mặt trời bên ngoài của hành tinh, trong số một số hành tinh thay vì ngôi sao của đường ray loài thú thần thoại được đủ gần, có thể tán thành sự sống tồn tại những... này để ý thử thách hoàn thành trước đó liên quan đến hành tinh hình thành cũng như nơi khác tồn tại sự sống khả năng của khái niệm tồn tại những... này xa xôi thế giới dùng trong | thăm dò đến hơi nước biến thể cũ của mê-tan CH4 đợi khí quyển thành phần, làm chúng liệu có phù hợp mang thai sự sống đề nghị hoàn thành khiến cho một người phấn khích của manh mối ",
        "The study of exoplanets has rapidly advanced in recent years, redefining our understanding of the universe. Astronomers have identified thousands of planets beyond our solar system, some of which orbit close enough to their stars to support life. These {find|ings} challenge {prev|ious} notions {ab|out} planetary {form|ation} and {t|he} potential {f|or} life {else|where}. The {dete|ction} of {atmos|pheric} components {li|ke} water vapor and methane in these distant worlds offers exciting clues about their suitability for hosting life.",
    ),
    "R-CW107": from_marked(
        "R-CW107", "Underwater Robotics", " dưới nước người máy ",
        " dưới nước người máy công nghệ của tiến bộ đang ở triệt để thay đổi đại dương khám phá những... này người máy chăn được gọi là độc lập dưới nước đi thuyền thiết bị(AUV), có thể độc lập tồn tại biển sâu môi trường Trung Quốc đi thuyền AUV phân bổ cảm biến biến thể cũ của webcam, có thể thu thập có liên quan đến đại dương sinh vật, dòng hải lưu biến thể cũ của dưới nước địa chất của dữ liệu chúng có thể đạt đến nhân loại thợ lặn không thể đạt đến của độ sâu, làm chưa biết khu vực đề nghị có giá trị của ý kiến nhân viên nghiên cứu tận dụng AUV đến nghiên cứu biến đổi khí hậu đúng đại dương hệ sinh thái của ảnh hưởng và khám phá dưới nước khảo cổ di tích, tăng cường chúng tôi đúng đại dương của hiểu ",
        "Advancements in underwater robotics are revolutionizing ocean exploration. These robots, known as autonomous underwater vehicles (AUVs), can navigate deep-sea environments independently. Equipped with {sen|sors} and {cam|eras}, AUVs {col|lect} data {o|n} marine {li|fe}, ocean {curr|ents}, and {under|water} geology. {Th|ey} can {re|ach} depths {th|at} are inaccessible to human divers, providing valuable insights into uncharted regions. Researchers use AUVs to study the impact of climate change on ocean ecosystems and to explore underwater archaeological sites, enhancing our understanding of the ocean.",
    ),
    "R-CW109": from_marked(
        "R-CW109", "Language Development", " ngôn ngữ sự phát triển ",
        " trẻ em ngôn ngữ sự phát triển là một dùng trong | phức tạp của quá trình sự kiện, nhận được di truyền biến thể cũ của môi trường của ảnh hưởng biến thể của | được sinh ra dậy, trẻ sơ sinh trong trường hợp đó bắt đầu phân biệt giọng biến thể cũ của từ ngữ chế độ đến một biến thể của | của thời gian, đại đa số người tất cả có thể thuyết phục“ mẹ ”hoặc“ cha ”đợi đơn giản của từ cùng với họ của trưởng thành, họ của biến thể của | đo lường nhanh chóng mở rộng biến thể của | chăm sóc nhân viên biến thể cũ của người cùng tuổi của tương tác tồn tại này một đang phát triển dậy nước đi cực kỳ quan trọng của tác động đến cho trẻ em đọc sách biến thể cũ của tham gia nói chuyện là tán thành ngôn ngữ học được của hiệu quả phương pháp ",
        "Language development in children is a complex process influenced by both genetics and environment. From {bi|rth} infants {be|gin} to recognize {sou|nds} and {patt|erns} in {spe|ech}. By {o|ne} year {o|f} age, {mo|st} can {sp|eak} simple {wo|rds} like \"mama\" or \"dada.\" As they grow, their vocabulary expands rapidly. Interacting with caregivers and peers plays a crucial role in this development. Reading to children and engaging in conversations are effective ways to support language acquisition.",
    ),
    "R-CW121": from_marked(
        "R-CW121", "Color Perception and Pigments", " màu sắc nhận thức biến thể của | sơn ",
        " một vài thế kỷ kể từ, màu sắc nhận thức thẳng thu hút nước đi nhà khoa học biến thể cũ của nghệ sĩ sơn là giao phó liệu màu sắc của vật chất; đúng sơn của nghiên cứu cho thấy hoàn thành chúng biến thể của | ánh sáng của phức tạp tương tác sơn hấp thụ một vài bước sóng và phản chiếu khác bước sóng, này chính xác là vật thể xuất hiện màu sắc của nguyên nhân tổng hợp sơn mở rộng hoàn thành nghệ sĩ biến thể cũ của công nghiệp có thể sử dụng của màu sắc phạm vi nghiên cứu và phát triển sơn cần hóa học biến thể cũ của vật lý kiến thức, bởi vì của anh ấy bản chất ảnh hưởng bền lâu bản chất biến thể cũ của diện mạo bên ngoài lĩnh hội sơn của hành động đúng nghệ thuật khôi phục, sản xuất đợi nhiều miền tất cả cực kỳ quan trọng ",
        "Color perception has fascinated scientists and artists alike for centuries. The study of pigments, {subst|ances} that {gi|ve} color {t|o} materials, {rev|eals} complex {intera|ctions} with {li|ght}. Pigments {abs|orb} certain {wavel|engths} and {ref|lect} others, {wh|ich} is why objects appear to have color. Synthetic pigments have expanded the color palette available to artists and industries. The development of pigments requires knowledge of chemistry and physics, as their properties influence durability and appearance. Understanding how pigments behave is crucial in various fields, from art restoration to manufacturing.",
    ),
    "R-CW128": from_marked(
        "R-CW128", "Sodium-Ion Batteries", " natri ion pin ",
        " natri ion pin hành vi pin lithium của ẩn giấu sản phẩm thay thế ngày chính lợi ích nhận được chú ý đến natri Bỉ liti thay đổi hoặc thay thế dễ giành được, bởi vì nó có thể biến thể của | nước biển Trung Quốc rút, và liti thông thường cần áp dụng có thể gây nguy hại môi trường của khai thác phương pháp biến thể của | dài hạn đến chăm sóc, natri ion công nghệ chăn tin thay đổi hoặc thay thế công cụ bền vững bản chất tuy nhiên, một số lượng hoặc con số nhất định thử thách hạn chế hoàn thành nó của rộng đưa vào sử dụng natri ion pin của dự trữ có thể thường thường thấp hơn so với pin lithium, do đó giảm hoàn thành của anh ấy tồn tại một vài đưa vào sử dụng bắn trúng mục tiêu hiệu suất nhân viên nghiên cứu tiếp tục nghiên cứu natri ion pin, biến thể cũ của thăng chức của anh ấy chức năng và rõ ràng của anh ấy tồn tại tương lai năng lượng hệ thống bắn trúng mục tiêu tác động đến ",
        "Sodium-ion batteries are gaining attention as a potential alternative to lithium-ion batteries. Sodium is more accessible than lithium because it can be extracted from seawater, while lithium typically requires mining methods that can {ha|rm} the {envir|onment}. Sodium-ion {techn|ology} is {consi|dered} more {susta|inable} in {t|he} long {te|rm}. However, {sev|eral} challenges {li|mit} its {wides|pread} use. Sodium-ion batteries often store less energy than lithium-ion batteries, reducing their efficiency for certain applications. Researchers continue to study sodium-ion batteries in order to improve their performance and determine their role in future energy systems.",
    ),
    "R-CW129": from_marked(
        "R-CW129", "Human Anatomy", " giải phẫu học người ",
        " giải phẫu học người là đúng cơ thể người cấu trúc của nghiên cứu khoa học giải phẫu học cho thấy hoàn thành cơ thể của khác phần như thế nào tương tác biến thể cũ của chung phát huy tác động đến biến thể cũ của giữ sự sống ví dụ, hệ thống tuần hoàn sẽ máu vận chuyển đến toàn bộ cơ thể, sẽ khí oxy biến thể cũ của chất dinh dưỡng gửi đến tế bào, đồng thời dọn dẹp rác rưởi giải phẫu học dùng trong | và | vẫn phải hiểu cơ quan, tổ chức biến thể cũ của tế bào của tổ chức điều trị y tế chuyên môn nhân viên tận dụng giải phẫu học kiến thức đến chẩn đoán biến thể cũ của điều trị bệnh tật, cải thiện bệnh nhân chăm sóc biến thể cũ của sức khỏe kết trái ",
        "Human anatomy is the scientific study of human structure. Anatomy {rev|eals} how different {pa|rts} of {t|he} body {inte|ract} and {func|tion} together {t|o} maintain {li|fe}. For {exa|mple}, the circulatory {sys|tem} transports {bl|ood} throughout the body, carrying oxygen and nutrients to cells while removing waste products. Anatomists must also understand the organization of organs, tissues, and cells. Medical professionals use anatomical knowledge to diagnose and treat illnesses, improving patient care and health outcomes.",
    ),
    "R-CW133": from_marked(
        "R-CW133", "Prehistoric Tools", " thời tiền sử công cụ ",
        " đầu tiên, nhân loại sử dụng tự nhiên vật thể hành vi công cụ(ví dụ, sắc bén của đá có thể ngã ba của gậy) sau này, mọi người bắt đầu có điểm đến sẽ chậm chạp biến thể cũ của đá tạo mẫu thành công công cụ do gỗ dễ thối rữa của bản chất, Hyundai liên quan đến thời tiền sử Time như thế nào sử dụng gỗ của kiến thức to mức độ dùng trong | chỉ có thể dựa vào suy luận tuy nhiên, tôi có giải pháp rồi! dụng cụ đá công cụ, nhà khảo cổ học trong trường hợp đó tôi có giải pháp rồi! thay đổi hoặc thay thế vững chắc và có giá trị của nền có lượng lớn sống sót của di tích văn hóa tồn tại toàn thế giới phạm vi bên trong, đá lửa biến thể cũ của của anh ấy không thông thường của vật lý tính chất và trở thành một loại phổ biến của liệu ",
        "Initially, humans used naturally occurring objects as tools (for instance, a sharp stone or a forked stick). Later, {peo|ple} began {purpos|efully} to {sh|ape} wood {a|nd} stone {in|to} tools. {Bec|ause} of {t|he} perishable {nat|ure} of {wo|od}, modern {know|ledge} of how it was used in prehistoric times is largely a matter of inference. With tools of stone, however, archaeologists are on firmer ground; there are a vast number of surviving artifacts. Throughout the world, flint was a favored material because of its unusual physical properties.",
    ),
    "R-CW140": from_marked(
        "R-CW140", "Black Holes", " hố đen ",
        " vũ trụ mênh mông rộng lớn, đầy hoàn thành một vài thế kỷ kể từ thẳng thu hút nước đi nhân loại của câu đố hố đen là không gian vũ trụ bắn trúng mục tiêu một dùng trong | khu vực, ở đó của lực hấp dẫn rất to lớn và mạnh mẽ, bất kỳ đông và tây tất cả không thể chạy trốn, thậm chí liên kết ánh sáng cũng không thể chạy trốn mặc dù hố đen là không thể thấy của, nhưng có thể đi qua quan sát chúng đúng gần đó vật chất của ảnh hưởng đến thăm dò chúng hố đen tồn tại vật lý thiên văn Trung Quốc phát huy nước đi cực kỳ quan trọng của tác động đến, ảnh hưởng xem | của hình thành và đề nghị đúng không gian, thời gian biến thể cũ của trọng lực bản chất của ý kiến ",
        "The universe is a vast expanse, filled with mysteries that have intrigued humans for centuries. Black holes are {reg|ions} in {sp|ace} where {gra|vity} is {s|o} strong {th|at} nothing, {n|ot} even {li|ght}, can {esc|ape}. Even {tho|ugh} they {a|re} invisible, black holes can be detected by observing their effects on nearby matter. Black holes play a crucial role in astrophysics, influencing galaxy formation and offering insights into the nature of space, time, and gravity.",
    ),
    "R-CW141": from_marked(
        "R-CW141", "Industrialization and Urbanization", " công nghiệp hóa biến thể của | đô thị hóa ",
        " tồn tại công nghiệp hóa giai đoạn đầu, nhiều thành phố kinh nghiệm hoàn thành nhanh sự phát triển này là do lượng lớn công nhân đổ vào nhà máy tìm kiếm làm việc đô thị hóa dẫn đến xã hội cấu trúc xảy ra lớn thay đổi, đến từ khác bối cảnh của mọi người bắt đầu cự ly gần sống biến thể cũ của làm việc công nghiệp hóa cũng mang đến hoàn thành mỗi loại thử thách, bao gồm gây ô nhiễm làm gia tăng gây ra của môi trường câu hỏi cũng như cải thiện Xincheng hoặc Hsincheng chợ cư dân nhà ở biến thể cũ của kết nối cơ sở hạ tầng của cần ",
        "In the early days of industrialization, many cities experienced rapid growth. This {w|as} due {t|o} the {inf|lux} of {wor|kers} seeking {emplo|yment} in {fact|ories}. Urbanization {l|ed} to {signi|ficant} changes {i|n} the {soc|ial} fabric, as people from diverse backgrounds came to live and work in close quarters. Industrialization also brought about various challenges, including the environmental problems caused by increased pollution and the need for improved infrastructure to house and transport the new city residents.",
    ),
    "R-CW146": from_marked(
        "R-CW146", "Environmental Geology", " môi trường địa chất học ",
        " địa chất học liên quan nhắm vào quả bóng cấu trúc vật lý biến thể cũ của vật chất, tác động đến đi chúng của quá trình sự kiện cũng như trái đất và của sự sống bề ngoài của lịch sử của nghiên cứu môi trường địa chất học khác thường chú ý đến địa chất quá trình sự kiện như thế nào ảnh hưởng nhân loại tập thể dục biến thể cũ của môi trường nó bao phủ thiên tai đánh giá, huyện Tư Nguyên ở Quế Lâm giám sát biến thể cũ của quy hoạch sử dụng đất đợi miền đi qua hiểu ảnh hưởng môi trường điều kiện của địa chất yếu tố, nhà địa chất học có thể sự giúp đỡ giảm nhẹ thiên tai của ảnh hưởng và thúc đẩy phát triển bền vững ",
        "Geology involves the study of Earth's physical structure and substances, the processes that act upon them, and the history of the planet and its life forms. Environmental geology {specif|ically} focuses {o|n} how {geolo|gical} processes {aff|ect} human {activ|ities} and {t|he} environment. {I|t} encompasses {ar|eas} such {a|s} natural {haz|ard} assessment, resource management, and land-use planning. By understanding the geological factors that influence environmental conditions, geologists can help mitigate the impacts of natural disasters and promote sustainable development.",
    ),
    "R-CW197": from_marked(
        "R-CW197", "Public Health Initiatives", " y tế công cộng đề nghị ",
        " y tế công cộng đề nghị có mục đích là thúc đẩy tất cả đám đông của hạnh phúc và ngăn ngừa bệnh tật những... này chiến lược thường thường đã chú ý đến đúng tình huống khẩn cấp của ngắn hạn trả lời, cũng chú ý đến đúng cơ sở hạ tầng của dài hạn đầu tư cụ thể làm việc bao gồm vắc-xin được tiêm vắc xin kế hoạch, giáo dục truyền bá tập thể dục, cũng như soạn thảo đảm bảo mọi người đạt được sạch sử dụng nước biến thể cũ của dinh dưỡng thực phẩm của chính sách chính phủ, tổ chức phi lợi nhuận biến thể của | cộng đồng giữa của hợp tác, về hiệu quả của y tế công cộng can thiệp cực kỳ quan trọng lĩnh hội sức khỏe của xã hội quyết định yếu tố, như kinh tế vững vàng biến thể cũ của giáo dục, góp phần vào được đặt làm riêng mỗi sau cổ đề nghị, biến thể cũ của thoả mãn khác đám đông của cụ thể yêu cầu ",
        "Public health initiatives aim to promote well-being and prevent disease across populations. These {strateg|ies} often {fo|cus} on {bo|th} short-term {resp|onses} to {emerg|encies} and long-{t|erm} investments {i|n} infrastructure. {Eff|orts} include {vacci|nation} programs, {educ|ational} campaigns, and the development of policies that ensure access to clean water and nutritious food. Collaboration between governments, nonprofit organizations, and communities is essential for effective public health interventions. Understanding the social determinants of health, such as economic stability and education, helps tailor initiatives to address the specific needs of different populations.",
    ),
    "R-CW207": from_marked(
        "R-CW207", "Moon Phases and Navigation", " tuần trăng biến thể của | đi biển ",
        " quan sát tuần trăng về mang tính lịch sử của nhiều văn hóa tất cả quan trọng, ảnh hưởng nước đi lịch, đi biển biến thể cũ của truyền thuyết tuần trăng chu kỳ cấu thành hoàn thành giai đoạn đầu đo thời gian hệ thống của nền, ví dụ Hồi giáo xoay vòng biến thể cũ của | biến thể cũ của Trung Quốc truyền thống của âm và dương biến thể cũ của | đi biển người tham gia một lĩnh vực hoạt động nhất định tận dụng mặt trăng của vị trí đến dự báo mực nước biển và của độ sáng, biến thể cũ của hướng dẫn họ của đi thuyền, khác thường là tồn tại ban đêm du lịch biến thể cũ của | tồn tại truyền thuyết Trung Quốc, mặt trăng thông thường biểu tượng nước đi to lớn và mạnh mẽ của thần có thể biểu tượng, tạo mẫu nghi thức, cổ tục lệ cũ biến thể cũ của theo mùa ngày lễ bước qua mỗi lục địa, mặt trăng của lời và lỗ thẳng là sử dụng mọi nơi của đồng hồ, cũng là nhân loại trí tưởng tượng của cảm hứng nguồn ",
        "Observing the moon's phases has been important for many cultures throughout history, influencing calendars, navigation, and mythology. Lunar cycles formed the basis of early timekeeping systems, such as the Islamic Hijri calendar and the traditional Chinese lunisolar calendar. Seafarers {us|ed} the {posi|tion} of {t|he} moon {t|o} make {predi|ctions} about {o|cean} levels {an|d} its {illumi|nation} to {gu|ide} their {voy|ages} especially during night travel. In mythology, the moon often embodied powerful deities or symbols, shaping rituals, stories, and seasonal festivals. Across continents, the waxing and waning of the moon has remained a universal clock and an inspiration for human imagination.",
    ),
    "R-CW214": from_marked(
        "R-CW214", "Earth's Axial Tilt and Seasons", " trái đất trục lật đổ biến thể của | thời gian ",
        " chúng tôi của hành tinh tồn tại xoay quanh mặt trời thời gian chạy, trục trái đất nghiêng cân trong cân đĩa hoặc trên cân 23.5 vượt qua do đó, đạt đến trái đất khác phần của ánh nắng đo lường hoàn toàn không hoàn chỉnh giống hệt, do đó hình thành hoàn thành thời gian đong mặt trời thẳng biến thể cũ của một vài một khu vực biến thể cũ của |, nên khu vực thường thường nhiệt độ không khí thay đổi hoặc thay thế cao, ban ngày thay đổi hoặc thay thế chiều dài thời gian của thay đổi ảnh hưởng sống của nhiều khía cạnh, bao gồm nông nghiệp, động vật hoang dã hành động biến thể cũ của nhân loại tập thể dục ",
        "Our planet's axis is tilted at an angle of about 23.5 degrees as it orbits the Sun. {A|s} a {res|ult} the {amo|unt} of {sun|light} that {hi|ts} different {pa|rts} of {Ea|rth} is {n|ot} all {t|he} same, {crea|ting} seasons. When the Sun shines directly on a region, that region tends to have higher temperatures and longer days. The changing seasons affect many aspects of life, including agriculture, wildlife behavior, and human activities.",
    ),
    "R-CW224": from_marked(
        "R-CW224", "Photoperiodism in Trees", " cây của ánh sáng chu kỳ hiện tượng ",
        " ánh sáng chu kỳ hiện tượng bố trí lá mọc đối vật của tồn tại cực kỳ quan trọng trong trường hợp đó cây xét về, ánh sáng chu kỳ hiện tượng ngón tay của là đúng ngày và đêm chiều dài của sinh lý phản ứng loại này phản ứng ảnh hưởng tung tích hòa hợp, nở hoa đợi theo mùa hành động cùng với ban ngày thay đổi ngắn, đêm thay đổi chiều dài, một số cây bắt đầu đi qua lá khô làm thời gian của thay đổi làm sự chuẩn bị này có thể tồn tại mùa đông của một vài mặt trăng biến thể của | bảo tồn hàm lượng nước biến thể của | năng lượng, và bảo vệ cây nhạy cảm của tổ chức tránh chịu đựng tổn thương do đóng băng ",
        "Photoperiodism is crucial for the survival of organisms. In trees, photoperiodism refers to the physiological response to the length of day and night. This response influences {seas|onal} behaviors {li|ke} leaf {shed|ding} and {flow|ering}. As {t|he} days {gr|ow} shorter {a|nd} the {nig|hts} longer, {so|me} trees {be|gin} to prepare for the changing seasons by dropping their leaves. This conserves water and energy during the winter months and protects the sensitive tissues of the tree from cold damage.",
    ),
    "R-CW236": from_marked(
        "R-CW236", "Paleontology", " cổ sinh vật học ",
        " cổ sinh vật học là đi qua phân tích hoá thạch ghi chép đến học viên cao học sinh mệnh lịch sử của khoa học này một miền cần kiểm tra hoá thạch--tức là bảo tồn tồn tại đá bắn trúng mục tiêu sinh vật hài cốt--biến thể cũ của hiểu thời cổ đại sự sống bề ngoài như thế nào tiến hóa và thích nghi của anh ấy môi trường nhà cổ sinh vật học vẫn tận dụng hoá thạch đến hiểu thời cổ đại của môi trường điều kiện ví dụ, trong đó đất liền khu vực để ý của đại dương hoá thạch làm rõ, những... này địa phương có thể một lần ở trong dưới nước ",
        "Paleontology is the scientific study that deals with the history of life through the analysis of fossil records. This {fi|eld} involves {exam|ining} fossils-{rem|ains} of {orga|nisms} preserved {i|n} rock-{t|o} understand {h|ow} ancient {li|fe} forms {evo|lved} and {ada|pted} to their surroundings. Paleontologists also use fossils to learn about ancient environmental conditions. Finding marine fossils in landlocked areas, for example, suggests that these regions were very likely underwater once upon a time.",
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
        "title": " chủ đề cục nhà kho · từ lấp chỗ trống công việc ",
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
        assert got == want, "%s %s != %s" % (name, got, want)
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
