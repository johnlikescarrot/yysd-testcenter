#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build IELTS themed vocab bank (Koolearn-inspired taxonomy, original lists).

Writes:
  library/study/vocab-themes/themes.json
  library/study/vocab-themes/theme-NN-<id>.html (thin wordData shells for vocab-lesson)
"""
from __future__ import annotations

import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "library", "study", "vocab-themes")


def W(word, ipa, pos, meaning, *alts, example=""):
    accept = [meaning] + list(alts)
    # dedupe preserve order
    seen, acc = set(), []
    for a in accept:
        a = str(a).strip()
        if a and a not in seen:
            seen.add(a)
            acc.append(a)
    return {
        "word": word,
        "ipa": ipa,
        "pos": pos,
        "meaning": meaning,
        "acceptCN": acc,
        "example": example or ("The word '%s' is useful in IELTS topics." % word),
    }


CATEGORIES = [
    {"id": "all", "label": " Tất cả "},
    {"id": "topics", "label": " IELTS chủ đề "},
    {"id": "academic", "label": " ngành học tri thức "},
    {"id": "life", "label": " sinh hoạt tình cảnh "},
    {"id": "society", "label": " xã hội nhân văn "},
    {"id": "nature", "label": " tự nhiên sinh thái "},
]

# ponytail: curated IELTS topic lists — taxonomy pattern from Koolearn, not their copy
THEMES = [
    {
        "id": "environment",
        "no": 1,
        "title": " Môi trường và sinh thái ",
        "category": "topics",
        "desc": " Ô nhiễm, Khí hậu, nguồn năng lượng và sinh thái bảo hộ ",
        "words": [
            W("climate change", "/ˈklaɪ.mət ˌtʃeɪndʒ/", "n.", " Khí hậu biến hóa ", example="Climate change affects coastal cities."),
            W("greenhouse gas", "/ˈɡriːn.haʊs ˌɡæs/", "n.", " nhà ấm thể khí ", example="Carbon dioxide is a major greenhouse gas."),
            W("carbon emission", "/ˈkɑː.bən ɪˈmɪʃ.ən/", "n.", " các-bon bài phóng ", " các-bon-đi ô-xít bài phóng ", example="Governments aim to cut carbon emissions."),
            W("fossil fuel", "/ˈfɒs.əl ˌfjuː.əl/", "n.", " hoá đá nhiên liệu ", example="Fossil fuels still power many factories."),
            W("renewable energy", "/rɪˈnjuː.ə.bəl ˈen.ə.dʒi/", "n.", " có thể sống lại nguồn năng lượng ", example="Solar power is a renewable energy source."),
            W("deforestation", "/diːˌfɒr.ɪˈsteɪ.ʃən/", "n.", " lạm phạt rừng rậm ", " rừng rậm chặt cây ", example="Deforestation threatens wildlife habitats."),
            W("biodiversity", "/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/", "n.", " Sinh học đa dạng tính ", example="Biodiversity is declining in many regions."),
            W("pollution", "/pəˈluː.ʃən/", "n.", " Ô nhiễm ", example="Air pollution is severe in megacities."),
            W("recycle", "/ˌriːˈsaɪ.kəl/", "v.", " thu về lợi dụng ", " thu về ", example="We should recycle plastic bottles."),
            W("landfill", "/ˈlænd.fɪl/", "n.", " rác rưởi điền vùi trận ", " điền vùi trận ", example="Landfills are filling up quickly."),
            W("conservation", "/ˌkɒn.səˈveɪ.ʃən/", "n.", " bảo hộ ", " chăm sóc ", example="Wildlife conservation needs funding."),
            W("sustainable", "/səˈsteɪ.nə.bəl/", "adj.", " có thể kéo dài ", example="Sustainable farming protects the soil."),
            W("ecosystem", "/ˈiː.kəʊˌsɪs.təm/", "n.", " sinh thái hệ thống ", example="Coral reefs are fragile ecosystems."),
            W("habitat", "/ˈhæb.ɪ.tæt/", "n.", " chỗ ở ", example="Urban sprawl destroys animal habitats."),
            W("endangered", "/ɪnˈdeɪn.dʒəd/", "adj.", " lâm nguy ", example="Pandas are still endangered."),
            W("emission", "/ɪˈmɪʃ.ən/", "n.", " bài phóng ", example="Vehicle emissions worsen smog."),
            W("drought", "/draʊt/", "n.", " khô hạn ", example="The drought ruined the harvest."),
            W("flood", "/flʌd/", "n.", " hồng thủy ", example="Heavy rain caused serious floods."),
            W("erosion", "/ɪˈrəʊ.ʒən/", "n.", " ăn mòn ", " đất màu bị trôi ", example="Soil erosion reduces farm yields."),
            W("contaminate", "/kənˈtæm.ɪ.neɪt/", "v.", " Ô nhiễm ", " làm dơ ", example="Chemicals can contaminate rivers."),
            W("ozone layer", "/ˈəʊ.zəʊn ˌleɪ.ə/", "n.", " tầng ô-zôn ", example="The ozone layer filters UV radiation."),
            W("global warming", "/ˌɡləʊ.bəl ˈwɔː.mɪŋ/", "n.", " toàn cầu biến ấm ", example="Global warming raises sea levels."),
            W("waste disposal", "/weɪst dɪˈspəʊ.zəl/", "n.", " phế vật xử lý ", " rác rưởi xử lý ", example="Waste disposal is a city challenge."),
            W("organic", "/ɔːˈɡæn.ɪk/", "adj.", " hữu cơ ", example="Organic food avoids synthetic pesticides."),
            W("smog", "/smɒɡ/", "n.", " sương mù ", example="Smog reduces visibility downtown."),
            W("preserve", "/prɪˈzɜːv/", "v.", " bảo hộ ", " Lưu ", example="Laws help preserve forests."),
            W("resource", "/rɪˈzɔːs/", "n.", " tài nguyên ", example="Water is a scarce resource here."),
            W("toxic", "/ˈtɒk.sɪk/", "adj.", " có độc ", example="Toxic waste must be handled carefully."),
            W("eco-friendly", "/ˌiː.kəʊˈfrend.li/", "adj.", " bảo vệ môi trường ", example="Eco-friendly packaging is popular."),
            W("carbon footprint", "/ˈkɑː.bən ˌfʊt.prɪnt/", "n.", " các-bon dấu chân ", example="Flying increases your carbon footprint."),
        ],
    },
    {
        "id": "education",
        "no": 2,
        "title": " Giáo dục và Học tập ",
        "category": "topics",
        "desc": " trường học, chương trình học, cuộc thi và phương pháp học tập ",
        "words": [
            W("curriculum", "/kəˈrɪk.jə.ləm/", "n.", " chương trình học ", " chương trình học hệ thống ", example="The curriculum includes science and arts."),
            W("tuition", "/tjuˈɪʃ.ən/", "n.", " học phí ", example="Tuition fees have risen sharply."),
            W("scholarship", "/ˈskɒl.ə.ʃɪp/", "n.", " học bổng ", example="She won a full scholarship."),
            W("assignment", "/əˈsaɪn.mənt/", "n.", " bài tập ", " nhiệm vụ ", example="The assignment is due on Friday."),
            W("lecture", "/ˈlek.tʃə/", "n.", " toạ đàm ", " giảng bài ", example="The lecture lasted two hours."),
            W("seminar", "/ˈsem.ɪ.nɑː/", "n.", " nghiên cứu và thảo luận khóa ", " nghiên cứu thảo luận hội ", example="Students present ideas in seminars."),
            W("dissertation", "/ˌdɪs.əˈteɪ.ʃən/", "n.", " học vị luận văn ", " luận văn ", example="He is writing his dissertation."),
            W("literacy", "/ˈlɪt.ər.ə.si/", "n.", " đọc ghi năng lực ", " biết chữ ", example="Digital literacy is essential today."),
            W("motivate", "/ˈməʊ.tɪ.veɪt/", "v.", " khích lệ ", " kích phát ", example="Good teachers motivate learners."),
            W("discipline", "/ˈdɪs.ə.plɪn/", "n.", " kỷ luật ", " ngành học ", example="Classroom discipline matters."),
            W("assessment", "/əˈses.mənt/", "n.", " ước định ", " xác định và đánh giá ", example="Continuous assessment replaces one big exam."),
            W("enrol", "/ɪnˈrəʊl/", "v.", " Đăng ký ", " Nhập học ", example="Students enrol in September."),
            W("campus", "/ˈkæm.pəs/", "n.", " sân trường ", example="The campus has a new library."),
            W("undergraduate", "/ˌʌn.dəˈɡrædʒ.u.ət/", "n.", " sinh viên chưa tốt nghiệp ", example="Undergraduates take core modules."),
            W("postgraduate", "/ˌpəʊstˈɡrædʒ.u.ət/", "n.", " nghiên cứu sinh ", example="She is a postgraduate in law."),
            W("critical thinking", "/ˌkrɪt.ɪ.kəl ˈθɪŋ.kɪŋ/", "n.", " phê phán tính tư duy ", example="Essays require critical thinking."),
            W("plagiarism", "/ˈpleɪ.dʒər.ɪ.zəm/", "n.", " sao chép ", example="Plagiarism leads to penalties."),
            W("deadline", "/ˈded.laɪn/", "n.", " Hạn chót ngày ", example="Meet the project deadline."),
            W("mentor", "/ˈmen.tɔː/", "n.", " đạo sư ", " người hướng dẫn ", example="A mentor guides new students."),
            W("vocational", "/vəʊˈkeɪ.ʃən.əl/", "adj.", " nghề nghiệp ", example="Vocational training prepares workers."),
            W("boarding school", "/ˈbɔː.dɪŋ ˌskuːl/", "n.", " ký túc trường học ", example="He attended a boarding school."),
            W("distance learning", "/ˈdɪs.təns ˌlɜː.nɪŋ/", "n.", " viễn trình Học tập ", example="Distance learning suits busy adults."),
            W("peer pressure", "/ˈpɪə ˌpreʃ.ə/", "n.", " cùng thế hệ áp lực ", example="Peer pressure can affect choices."),
            W("revise", "/rɪˈvaɪz/", "v.", " Ôn tập ", " sửa chữa ", example="Revise before the final exam."),
            W("timetable", "/ˈtaɪmˌteɪ.bəl/", "n.", " thời khóa biểu ", " bảng giờ giấc ", example="Check the exam timetable."),
            W("faculty", "/ˈfæk.əl.ti/", "n.", " viện hệ ", " giáo viên ", example="The science faculty is large."),
            W("internship", "/ˈɪn.tɜːn.ʃɪp/", "n.", " thực tập ", example="An internship builds experience."),
            W("dropout", "/ˈdrɒp.aʊt/", "n.", " bỏ học người ", example="The school reduced dropout rates."),
            W("compulsory", "/kəmˈpʌl.sər.i/", "adj.", " tất tu ", " cưỡng chế ", example="Maths is compulsory in year one."),
            W("elective", "/ɪˈlek.tɪv/", "n.", " chọn môn học khóa ", example="Choose one elective each term."),
        ],
    },
    {
        "id": "technology",
        "no": 3,
        "title": " Công nghệ và mạng lưới *internet ",
        "category": "topics",
        "desc": " Internet, trí tuệ nhân tạo và con số sinh hoạt ",
        "words": [
            W("artificial intelligence", "/ˌɑː.tɪˌfɪʃ.əl ɪnˈtel.ɪ.dʒəns/", "n.", " trí tuệ nhân tạo ", example="Artificial intelligence powers chatbots."),
            W("algorithm", "/ˈæl.ɡə.rɪ.ðəm/", "n.", " phép tính ", example="Social apps use ranking algorithms."),
            W("automation", "/ˌɔː.təˈmeɪ.ʃən/", "n.", " tự động hoá ", example="Automation replaces routine jobs."),
            W("cybersecurity", "/ˌsaɪ.bə.sɪˈkjʊə.rə.ti/", "n.", " Internet Security ", example="Cybersecurity protects user data."),
            W("database", "/ˈdeɪ.tə.beɪs/", "n.", " kho số liệu ", example="Customer records sit in a database."),
            W("digital", "/ˈdɪdʒ.ɪ.təl/", "adj.", " con số ", example="Digital payment is widespread."),
            W("innovation", "/ˌɪn.əˈveɪ.ʃən/", "n.", " sáng tạo cái mới ", example="Innovation drives tech startups."),
            W("interface", "/ˈɪn.tə.feɪs/", "n.", " giao diện ", example="The app interface is simple."),
            W("network", "/ˈnet.wɜːk/", "n.", " mạng lưới *internet ", example="The network was briefly offline."),
            W("privacy", "/ˈprɪv.ə.si/", "n.", " việc riêng tư ", example="Online privacy concerns users."),
            W("software", "/ˈsɒft.weə/", "n.", " phần mềm ", example="Update the software regularly."),
            W("hardware", "/ˈhɑːd.weə/", "n.", " phần cứng ", example="New hardware improves speed."),
            W("smartphone", "/ˈsmɑːt.fəʊn/", "n.", " điện thoại di động thông minh ", example="Smartphones changed daily habits."),
            W("broadband", "/ˈbrɔːd.bænd/", "n.", " băng thông rộng ", example="Rural broadband is expanding."),
            W("cloud computing", "/klaʊd kəmˈpjuː.tɪŋ/", "n.", " vân tính toán ", example="Cloud computing stores files online."),
            W("virtual reality", "/ˌvɜː.tʃu.əl riˈæl.ə.ti/", "n.", " giả thuyết sự thật ", example="Virtual reality is used in training."),
            W("robotics", "/rəʊˈbɒt.ɪks/", "n.", " người máy kỹ thuật ", example="Robotics transforms manufacturing."),
            W("surveillance", "/səˈveɪ.ləns/", "n.", " giám sát và điều khiển ", " theo dõi ", example="CCTV surveillance covers the street."),
            W("encryption", "/ɪnˈkrɪp.ʃən/", "n.", " mã hóa ", example="Encryption keeps messages safe."),
            W("download", "/ˌdaʊnˈləʊd/", "v.", " download ", example="Download the file before class."),
            W("upload", "/ˌʌpˈləʊd/", "v.", " thượng truyền(*upload) ", example="Upload your essay to the portal."),
            W("browse", "/braʊz/", "v.", " xem ", example="Students browse academic journals."),
            W("gadget", "/ˈɡædʒ.ɪt/", "n.", " tiểu trang bị ", " đồ chơi nhỏ ", example="Wearable gadgets track fitness."),
            W("outdated", "/ˌaʊtˈdeɪ.tɪd/", "adj.", " lỗi thời ", example="The software is outdated."),
            W("breakthrough", "/ˈbreɪk.θruː/", "n.", " đột phá ", example="The research is a breakthrough."),
            W("tech-savvy", "/ˈtek ˌsæv.i/", "adj.", " tinh thông khoa học kỹ thuật ", example="Tech-savvy teens learn apps fast."),
            W("bandwidth", "/ˈbænd.wɪdθ/", "n.", " giải thông ", example="Low bandwidth slows video calls."),
            W("malware", "/ˈmæl.weə/", "n.", " ác ý phần mềm ", example="Malware can steal passwords."),
            W("user-friendly", "/ˌjuː.zəˈfrend.li/", "adj.", " người sử dụng hữu hảo ", example="The design is user-friendly."),
            W("e-commerce", "/ˈiːˌkɒm.ɜːs/", "n.", " điện tử thương vụ ", example="E-commerce grew during lockdowns."),
        ],
    },
    {
        "id": "health",
        "no": 4,
        "title": " Sức khỏe và chữa bệnh ",
        "category": "topics",
        "desc": " tật bệnh, chữa bệnh, Dinh dưỡng và tâm lý Sức khỏe ",
        "words": [
            W("nutrition", "/njuˈtrɪʃ.ən/", "n.", " dinh dưỡng ", example="Good nutrition supports growth."),
            W("obesity", "/əʊˈbiː.sə.ti/", "n.", " mập mạp ", example="Childhood obesity is rising."),
            W("vaccine", "/ˈvæk.siːn/", "n.", " vắc-xin phòng bệnh ", example="The vaccine prevents infection."),
            W("symptom", "/ˈsɪmp.təm/", "n.", " bệnh trạng ", example="Fever is a common symptom."),
            W("diagnosis", "/ˌdaɪ.əɡˈnəʊ.sɪs/", "n.", " chẩn đoán bệnh ", example="Early diagnosis improves outcomes."),
            W("treatment", "/ˈtriːt.mənt/", "n.", " trị liệu ", example="Treatment may include physiotherapy."),
            W("prescription", "/prɪˈskrɪp.ʃən/", "n.", " đơn thuốc ", example="Collect your prescription at the pharmacy."),
            W("chronic", "/ˈkrɒn.ɪk/", "adj.", " mãn tính ", example="Diabetes is a chronic condition."),
            W("epidemic", "/ˌep.ɪˈdem.ɪk/", "n.", " bệnh truyền nhiễm ", example="The epidemic spread rapidly."),
            W("hygiene", "/ˈhaɪ.dʒiːn/", "n.", " vệ sinh ", example="Hand hygiene reduces infection."),
            W("immune system", "/ɪˈmjuːn ˌsɪs.təm/", "n.", " hệ thống miễn dịch ", example="Sleep strengthens the immune system."),
            W("mental health", "/ˈmen.təl helθ/", "n.", " tâm lý Sức khỏe ", example="Mental health needs open discussion."),
            W("stress", "/stres/", "n.", " áp lực ", example="Exam stress is common among students."),
            W("therapy", "/ˈθer.ə.pi/", "n.", " liệu pháp ", " trị liệu ", example="Talking therapy helps anxiety."),
            W("surgery", "/ˈsɜː.dʒər.i/", "n.", " giải phẫu ", example="He recovered well after surgery."),
            W("patient", "/ˈpeɪ.ʃənt/", "n.", " người bệnh ", example="The patient waited for results."),
            W("clinic", "/ˈklɪn.ɪk/", "n.", " phòng khám bệnh ", example="Book an appointment at the clinic."),
            W("protein", "/ˈprəʊ.tiːn/", "n.", " an-bu-min ", example="Eggs are rich in protein."),
            W("calorie", "/ˈkæl.ər.i/", "n.", " Ca-lo-ri ", example="Track daily calorie intake."),
            W("sedentary", "/ˈsed.ən.tər.i/", "adj.", " ngồi lâu ", example="A sedentary lifestyle harms health."),
            W("addiction", "/əˈdɪk.ʃən/", "n.", " thành ghiền ", example="Phone addiction affects sleep."),
            W("prevention", "/prɪˈven.ʃən/", "n.", " dự phòng ", example="Prevention is cheaper than cure."),
            W("allergy", "/ˈæl.ə.dʒi/", "n.", " dị ứng ", example="Peanut allergy can be serious."),
            W("blood pressure", "/ˈblʌd ˌpreʃ.ə/", "n.", " huyết áp ", example="High blood pressure needs monitoring."),
            W("rehabilitation", "/ˌriː.həˌbɪl.ɪˈteɪ.ʃən/", "n.", " khôi phục ", example="Rehabilitation followed the injury."),
            W("pandemic", "/pænˈdem.ɪk/", "n.", " đại lưu đi bệnh ", example="The pandemic disrupted travel."),
            W("well-being", "/ˌwelˈbiː.ɪŋ/", "n.", " phúc lợi ", " thể xác và tinh thần Sức khỏe ", example="Exercise improves well-being."),
            W("insomnia", "/ɪnˈsɒm.ni.ə/", "n.", " mất ngủ ", example="Insomnia affects concentration."),
            W("outbreak", "/ˈaʊt.breɪk/", "n.", " bộc phát ", example="An outbreak of flu hit the school."),
            W("healthcare", "/ˈhelθ.keə/", "n.", " chữa bệnh bảo vệ sức khoẻ ", example="Public healthcare varies by country."),
        ],
    },
    {
        "id": "work",
        "no": 5,
        "title": " công tác và Công sở ",
        "category": "life",
        "desc": " vào nghề, Công sở kỹ năng và công tác hình thức ",
        "words": [
            W("career", "/kəˈrɪə/", "n.", " Nghề nghiệp ", " kiếp sống ", example="She plans a career in design."),
            W("colleague", "/ˈkɒl.iːɡ/", "n.", " đồng sự ", example="Ask a colleague for feedback."),
            W("deadline", "/ˈded.laɪn/", "n.", " Hạn chót ngày ", example="The team met every deadline."),
            W("promotion", "/prəˈməʊ.ʃən/", "n.", " tấn chức ", example="Hard work led to promotion."),
            W("resign", "/rɪˈzaɪn/", "v.", " từ chức ", example="He decided to resign last month."),
            W("recruit", "/rɪˈkruːt/", "v.", " thông báo tuyển dụng ", example="Firms recruit graduates each year."),
            W("salary", "/ˈsæl.ər.i/", "n.", " tiền lương ", example="The salary includes benefits."),
            W("wage", "/weɪdʒ/", "n.", " tiền lương ", " lúc lương ", example="The minimum wage rose again."),
            W("freelance", "/ˈfriː.lɑːns/", "adj.", " nghề tự do ", example="Freelance writers set their hours."),
            W("remote work", "/rɪˈməʊt wɜːk/", "n.", " viễn trình văn phòng ", example="Remote work became common after 2020."),
            W("commute", "/kəˈmjuːt/", "v.", " thông cần ", example="Many people commute by train."),
            W("overtime", "/ˈəʊ.və.taɪm/", "n.", " tăng ca ", example="Staff receive overtime pay."),
            W("workload", "/ˈwɜːk.ləʊd/", "n.", " lượng công việc ", example="The workload peaks in June."),
            W("productivity", "/ˌprɒd.ʌkˈtɪv.ə.ti/", "n.", " sức sản xuất ", " hiệu suất ", example="Better tools raise productivity."),
            W("entrepreneur", "/ˌɒn.trə.prəˈnɜː/", "n.", " xí nghiệp gia ", example="The entrepreneur launched an app."),
            W("interview", "/ˈɪn.tə.vjuː/", "n.", " phỏng vấn ", example="Prepare answers before the interview."),
            W("CV", "/ˌsiːˈviː/", "n.", " lý lịch sơ lược ", example="Update your CV with new skills."),
            W("redundant", "/rɪˈdʌn.dənt/", "adj.", " bị giảm biên chế ", example="Workers were made redundant."),
            W("shift", "/ʃɪft/", "n.", " cắt lượt ", example="Nurses work night shifts."),
            W("bonus", "/ˈbəʊ.nəs/", "n.", " tiền thưởng ", example="Staff received a year-end bonus."),
            W("negotiate", "/nɪˈɡəʊ.ʃi.eɪt/", "v.", " đàm phán ", " hiệp thương ", example="Negotiate a fair contract."),
            W("hierarchy", "/ˈhaɪə.rɑː.ki/", "n.", " chế độ cấp bậc ", example="The company has a flat hierarchy."),
            W("collaborate", "/kəˈlæb.ə.reɪt/", "v.", " hợp tác ", example="Teams collaborate across offices."),
            W("expertise", "/ˌek.spɜːˈtiːz/", "n.", " sở trường ", " kiến thức chuyên nghiệp ", example="She has expertise in marketing."),
            W("apprenticeship", "/əˈpren.tɪ.ʃɪp/", "n.", " học đồ chế ", example="An apprenticeship combines work and study."),
            W("part-time", "/ˌpɑːtˈtaɪm/", "adj.", " kiêm chức ", example="Students take part-time jobs."),
            W("full-time", "/ˌfʊlˈtaɪm/", "adj.", " toàn chức ", example="He found a full-time role."),
            W("workplace", "/ˈwɜːk.pleɪs/", "n.", " công tác nơi ", example="Safety rules protect the workplace."),
            W("ambition", "/æmˈbɪʃ.ən/", "n.", " khát vọng ", example="Ambition drives career growth."),
            W("burnout", "/ˈbɜːn.aʊt/", "n.", " Nghề nghiệp uể oải ", example="Burnout follows long overtime."),
        ],
    },
    {
        "id": "media",
        "no": 6,
        "title": " truyền thông và quảng cáo ",
        "category": "society",
        "desc": " tin tức, xã giao bình đài và quảng cáo truyền bá ",
        "words": [
            W("broadcast", "/ˈbrɔːd.kɑːst/", "v.", " truyền ra ", " Phát thanh ", example="Channels broadcast live news."),
            W("headline", "/ˈhed.laɪn/", "n.", " tiêu đề ", example="The headline attracted clicks."),
            W("journalist", "/ˈdʒɜː.nə.lɪst/", "n.", " phóng viên ", example="Journalists verify their sources."),
            W("editorial", "/ˌed.ɪˈtɔː.ri.əl/", "n.", " xã luận ", example="The editorial criticised the policy."),
            W("censorship", "/ˈsen.sə.ʃɪp/", "n.", " thẩm tra ", example="Censorship limits free speech."),
            W("propaganda", "/ˌprɒp.əˈɡæn.də/", "n.", " tuyên truyền ", " thổi phồng ", example="Wartime propaganda shaped opinions."),
            W("advertisement", "/ədˈvɜː.tɪs.mənt/", "n.", " quảng cáo ", example="The advertisement targets teens."),
            W("commercial", "/kəˈmɜː.ʃəl/", "n.", " Kinh doanh quảng cáo ", example="TV commercials interrupt programmes."),
            W("influencer", "/ˈɪn.flu.ən.sə/", "n.", " mạng lưới hồng ", " ảnh hưởng người ", example="Influencers promote products online."),
            W("social media", "/ˌsəʊ.ʃəl ˈmiː.di.ə/", "n.", " xã giao truyền thông ", example="Social media spreads news fast."),
            W("viral", "/ˈvaɪə.rəl/", "adj.", " virus thức truyền bá ", example="The video went viral overnight."),
            W("bias", "/ˈbaɪ.əs/", "n.", " thành kiến ", example="Media bias can mislead readers."),
            W("audience", "/ˈɔː.di.əns/", "n.", " người xem ", " được chúng ", example="The show attracts a young audience."),
            W("coverage", "/ˈkʌv.ər.ɪdʒ/", "n.", " đưa tin ", " bao trùm ", example="Storm coverage dominated the news."),
            W("tabloid", "/ˈtæb.lɔɪd/", "n.", " báo nhỏ ", example="Tabloids favour celebrity stories."),
            W("documentary", "/ˌdɒk.jəˈmen.tər.i/", "n.", " phim phóng sự ", example="The documentary explores climate."),
            W("podcast", "/ˈpɒd.kɑːst/", "n.", " người truyền bá ", example="She listens to education podcasts."),
            W("subscribe", "/səbˈskraɪb/", "v.", " đặt mua ", example="Subscribe to the channel for updates."),
            W("clickbait", "/ˈklɪk.beɪt/", "n.", " tiêu đề đảng ", example="Clickbait titles exaggerate claims."),
            W("publicity", "/pʌbˈlɪs.ə.ti/", "n.", " tuyên truyền ", " công chúng chú ý ", example="The campaign gained free publicity."),
            W("slogan", "/ˈsləʊ.ɡən/", "n.", " khẩu hiệu ", " quảng cáo ", example="A short slogan is memorable."),
            W("brand", "/brænd/", "n.", " nhãn hiệu ", example="Strong brands earn trust."),
            W("consumer", "/kənˈsjuː.mə/", "n.", " người tiêu thụ ", example="Consumers compare prices online."),
            W("target", "/ˈtɑː.ɡɪt/", "v.", " nhắm trúng ", " nhằm vào ", example="Ads target specific age groups."),
            W("reputation", "/ˌrep.jəˈteɪ.ʃən/", "n.", " danh dự ", example="Fake news harms reputation."),
            W("sensational", "/senˈseɪ.ʃən.əl/", "adj.", " làm người nghe kinh sợ ", example="Sensational stories sell papers."),
            W("freedom of the press", "/ˌfriː.dəm əv ðə ˈpres/", "n.", " tin tức tự do ", example="Freedom of the press supports democracy."),
            W("misinformation", "/ˌmɪs.ɪn.fəˈmeɪ.ʃən/", "n.", " Sai tin tức ", example="Misinformation spreads on apps."),
            W("streaming", "/ˈstriː.mɪŋ/", "n.", " chảy truyền thông ", example="Streaming replaced DVDs."),
            W("rating", "/ˈreɪ.tɪŋ/", "n.", " thu xem dẫn đầu ", " cho điểm ", example="High ratings keep shows on air."),
        ],
    },
    {
        "id": "travel",
        "no": 7,
        "title": " du lịch và Giao thông ",
        "category": "life",
        "desc": " Di chuyển, Giao thông phương thức và du lịch sản nghiệp ",
        "words": [
            W("destination", "/ˌdes.tɪˈneɪ.ʃən/", "n.", " chỗ mục đích ", example="Paris is a popular destination."),
            W("itinerary", "/aɪˈtɪn.ər.ər.i/", "n.", " hành trình ", example="Check the tour itinerary carefully."),
            W("accommodation", "/əˌkɒm.əˈdeɪ.ʃən/", "n.", " dừng chân ", example="Book accommodation in advance."),
            W("reservation", "/ˌrez.əˈveɪ.ʃən/", "n.", " đặt trước ", example="Confirm your hotel reservation."),
            W("sightseeing", "/ˈsaɪtˌsiː.ɪŋ/", "n.", " ngắm cảnh ", example="Sightseeing filled the afternoon."),
            W("souvenir", "/ˌsuː.vəˈnɪə/", "n.", " vật kỷ niệm ", example="She bought a local souvenir."),
            W("passport", "/ˈpɑːs.pɔːt/", "n.", " hộ chiếu ", example="Keep your passport safe."),
            W("visa", "/ˈviː.zə/", "n.", " hộ chiếu ", example="Apply for a tourist visa early."),
            W("luggage", "/ˈlʌɡ.ɪdʒ/", "n.", " hành lý ", example="Airline luggage limits apply."),
            W("delay", "/dɪˈleɪ/", "n.", " đến trễ ", example="Fog caused a flight delay."),
            W("commuter", "/kəˈmjuː.tə/", "n.", " thông cần người ", example="Commuters packed the platform."),
            W("congestion", "/kənˈdʒes.tʃən/", "n.", " hỗn loạn ", example="Road congestion wastes time."),
            W("infrastructure", "/ˈɪn.frəˌstrʌk.tʃə/", "n.", " trụ cột phương tiện ", example="Rail infrastructure needs investment."),
            W("public transport", "/ˌpʌb.lɪk ˈtræn.spɔːt/", "n.", " giao thông công cộng ", example="Public transport cuts emissions."),
            W("pedestrian", "/pəˈdes.tri.ən/", "n.", " người đi đường ", example="Pedestrians use the zebra crossing."),
            W("highway", "/ˈhaɪ.weɪ/", "n.", " đường cao tốc ", example="The highway links two cities."),
            W("ferry", "/ˈfer.i/", "n.", " đò ngang ", example="Take the ferry to the island."),
            W("cruise", "/kruːz/", "n.", " tàu biển chở khách chạy định kỳ Du lịch ", example="They booked a Mediterranean cruise."),
            W("backpacker", "/ˈbækˌpæk.ə/", "n.", " ba lô khách ", example="Backpackers prefer hostels."),
            W("eco-tourism", "/ˈiː.kəʊ ˌtʊə.rɪ.zəm/", "n.", " sinh thái du lịch ", example="Eco-tourism protects local habitats."),
            W("attraction", "/əˈtræk.ʃən/", "n.", " cảnh điểm ", " lực hấp dẫn ", example="The castle is the main attraction."),
            W("departure", "/dɪˈpɑː.tʃə/", "n.", " xuất phát ", " cách cảng ", example="Departure is at 9 a.m."),
            W("arrival", "/əˈraɪ.vəl/", "n.", " đến ", example="Arrival boards show gate changes."),
            W("customs", "/ˈkʌs.təmz/", "n.", " hải quan ", example="Declare goods at customs."),
            W("jet lag", "/ˈdʒet ˌlæɡ/", "n.", " chênh lệch phản ứng ", example="Jet lag makes sleep difficult."),
            W("scenic", "/ˈsiː.nɪk/", "adj.", " phong cảnh duyên dáng ", example="Drive the scenic coastal road."),
            W("overcrowded", "/ˌəʊ.vəˈkraʊ.dɪd/", "adj.", " quá độ chật chội ", example="Trains are overcrowded at rush hour."),
            W("timetable", "/ˈtaɪmˌteɪ.bəl/", "n.", " thời khắc bề ngoài ", example="Check the bus timetable."),
            W("fare", "/feə/", "n.", " tiền xe ", " giá vé ", example="The subway fare is cheap."),
            W("hospitality", "/ˌhɒs.pɪˈtæl.ə.ti/", "n.", " khách sạn nghiệp ", " hiếu khách ", example="Hospitality jobs rise in summer."),
        ],
    },
    {
        "id": "culture",
        "no": 8,
        "title": " văn hóa và Nghệ thuật ",
        "category": "society",
        "desc": " Nghệ thuật, truyền thống, festival và văn hóa di sản ",
        "words": [
            W("heritage", "/ˈher.ɪ.tɪdʒ/", "n.", " di sản ", example="The temple is cultural heritage."),
            W("tradition", "/trəˈdɪʃ.ən/", "n.", " truyền thống ", example="The festival keeps old traditions."),
            W("ceremony", "/ˈser.ɪ.mə.ni/", "n.", " nghi thức ", example="Graduation is a formal ceremony."),
            W("exhibition", "/ˌek.sɪˈbɪʃ.ən/", "n.", " triển lãm ", example="The exhibition opens next week."),
            W("gallery", "/ˈɡæl.ər.i/", "n.", " hành lang triển lãm tranh ", example="Local artists show work in the gallery."),
            W("sculpture", "/ˈskʌlp.tʃə/", "n.", " điêu khắc ", example="The sculpture stands in the square."),
            W("architecture", "/ˈɑː.kɪ.tek.tʃə/", "n.", " kiến trúc ", example="Modern architecture uses glass."),
            W("literature", "/ˈlɪt.ər.ə.tʃə/", "n.", " Văn học ", example="She studies English literature."),
            W("folklore", "/ˈfəʊk.lɔː/", "n.", " dân gian truyền thuyết ", example="Folklore explains local customs."),
            W("ritual", "/ˈrɪtʃ.u.əl/", "n.", " nghi thức ", " lệ cũ ", example="Tea drinking is a daily ritual."),
            W("multicultural", "/ˌmʌl.tiˈkʌl.tʃər.əl/", "adj.", " đa nguyên văn hóa ", example="London is a multicultural city."),
            W("identity", "/aɪˈden.tə.ti/", "n.", " Vai trò ", " nhận đồng ", example="Language shapes cultural identity."),
            W("custom", "/ˈkʌs.təm/", "n.", " phong tục ", example="Bowing is a Japanese custom."),
            W("festival", "/ˈfes.tɪ.vəl/", "n.", " Lễ hội ", " Âm nhạc đoạn ", example="The film festival attracts tourists."),
            W("performance", "/pəˈfɔː.məns/", "n.", " diễn xuất ", " biểu hiện ", example="The dance performance was brilliant."),
            W("audience", "/ˈɔː.di.əns/", "n.", " người xem ", example="The audience applauded loudly."),
            W("masterpiece", "/ˈmɑː.stə.piːs/", "n.", " kiệt tác ", example="The painting is a masterpiece."),
            W("preserve", "/prɪˈzɜːv/", "v.", " Lưu ", " bảo hộ ", example="Museums preserve ancient objects."),
            W("contemporary", "/kənˈtem.pər.ər.i/", "adj.", " đương thời ", example="Contemporary art can be abstract."),
            W("aesthetic", "/esˈθet.ɪk/", "adj.", " thẩm mỹ ", " mỹ học ", example="The design has aesthetic appeal."),
            W("craftsmanship", "/ˈkrɑːfts.mən.ʃɪp/", "n.", " công nghệ ", example="Fine craftsmanship takes years."),
            W("orchestra", "/ˈɔː.kɪ.strə/", "n.", " nhạc giao hưởng đội ", example="The orchestra played Mozart."),
            W("cinema", "/ˈsɪn.ə.mə/", "n.", " Điện ảnh ", " rạp chiếu phim ", example="Independent cinema needs support."),
            W("drama", "/ˈdrɑː.mə/", "n.", " hí kịch ", example="School drama builds confidence."),
            W("mythology", "/mɪˈθɒl.ə.dʒi/", "n.", " Thần Thoại ", example="Greek mythology inspires writers."),
            W("artefact", "/ˈɑː.tɪ.fækt/", "n.", " văn vật ", " nhân công chế phẩm ", example="The artefact was found in a tomb."),
            W("renaissance", "/rɪˈneɪ.səns/", "n.", " văn hoá phục hưng ", example="The Renaissance changed European art."),
            W("calligraphy", "/kəˈlɪɡ.rə.fi/", "n.", " thư pháp ", example="Chinese calligraphy is taught in schools."),
            W("costume", "/ˈkɒs.tjuːm/", "n.", " trang phục ", " đồ hóa trang ", example="Traditional costumes appear in parades."),
            W("diversity", "/daɪˈvɜː.sə.ti/", "n.", " đa dạng tính ", example="Cultural diversity enriches cities."),
        ],
    },
    {
        "id": "crime",
        "no": 9,
        "title": " phạm tội và pháp luật ",
        "category": "society",
        "desc": " trị an, tư pháp và trật tự xã hội ",
        "words": [
            W("crime", "/kraɪm/", "n.", " phạm tội ", example="Street crime fell last year."),
            W("criminal", "/ˈkrɪm.ɪ.nəl/", "n.", " tội phạm ", example="The criminal was arrested."),
            W("offence", "/əˈfens/", "n.", " hành động trái luật ", " mạo phạm ", example="Speeding is a traffic offence."),
            W("punishment", "/ˈpʌn.ɪʃ.mənt/", "n.", " trừng phạt ", example="Fair punishment deters crime."),
            W("prison", "/ˈprɪz.ən/", "n.", " ngục giam ", example="He spent two years in prison."),
            W("sentence", "/ˈsen.təns/", "n.", " phán quyết ", " câu ", example="The judge passed a long sentence."),
            W("trial", "/ˈtraɪ.əl/", "n.", " thẩm lí và phán quyết ", example="The trial lasted three weeks."),
            W("jury", "/ˈdʒʊə.ri/", "n.", " bồi thẩm đoàn ", example="The jury reached a verdict."),
            W("witness", "/ˈwɪt.nəs/", "n.", " chứng nhân ", example="A witness saw the accident."),
            W("evidence", "/ˈev.ɪ.dəns/", "n.", " chứng cứ ", example="Police collected DNA evidence."),
            W("suspect", "/ˈsʌs.pekt/", "n.", " người hiềm nghi ", example="Police questioned the suspect."),
            W("victim", "/ˈvɪk.tɪm/", "n.", " người bị hại ", example="Support centres help victims."),
            W("theft", "/θeft/", "n.", " trộm cướp ", example="Bike theft is common on campus."),
            W("burglary", "/ˈbɜː.ɡlər.i/", "n.", " nhập thất trộm cướp ", example="Burglary rates dropped after cameras."),
            W("fraud", "/frɔːd/", "n.", " lừa dối ", example="Online fraud targets the elderly."),
            W("corruption", "/kəˈrʌp.ʃən/", "n.", " mục nát ", example="Anti-corruption laws were tightened."),
            W("legislation", "/ˌledʒ.ɪˈsleɪ.ʃən/", "n.", " lập pháp ", " pháp quy ", example="New legislation bans plastic bags."),
            W("enforce", "/ɪnˈfɔːs/", "v.", " chấp hành ", " cưỡng chế áp dụng ", example="Police enforce traffic rules."),
            W("illegal", "/ɪˈliː.ɡəl/", "adj.", " phi pháp ", example="Illegal parking blocks exits."),
            W("justice", "/ˈdʒʌs.tɪs/", "n.", " tư pháp ", " công chính ", example="Equal justice protects citizens."),
            W("rehabilitation", "/ˌriː.həˌbɪl.ɪˈteɪ.ʃən/", "n.", " cải tạo ", " khôi phục ", example="Rehabilitation reduces reoffending."),
            W("deterrent", "/dɪˈter.ənt/", "n.", " uy hiếp ", example="Cameras act as a deterrent."),
            W("surveillance", "/səˈveɪ.ləns/", "n.", " giám sát và điều khiển ", example="City surveillance covers stations."),
            W("convict", "/kənˈvɪkt/", "v.", " định tội ", example="The court convicted the thief."),
            W("innocent", "/ˈɪn.ə.sənt/", "adj.", " vô tội ", example="Evidence proved he was innocent."),
            W("guilty", "/ˈɡɪl.ti/", "adj.", " có tội ", example="The defendant pleaded guilty."),
            W("bail", "/beɪl/", "n.", " nộp tiền bảo lãnh ", example="He was released on bail."),
            W("prosecute", "/ˈprɒs.ɪ.kjuːt/", "v.", " khởi tố ", example="Authorities prosecute serious crimes."),
            W("law-abiding", "/ˈlɔː.əˌbaɪ.dɪŋ/", "adj.", " thủ pháp ", example="Most citizens are law-abiding."),
            W("juvenile", "/ˈdʒuː.vən.aɪl/", "adj.", " thanh thiếu niên ", example="Juvenile crime needs special care."),
        ],
    },
    {
        "id": "animals",
        "no": 10,
        "title": " động thực vật ",
        "category": "nature",
        "desc": " Sinh học, chỗ ở và tự nhiên bảo hộ ",
        "words": [
            W("species", "/ˈspiː.ʃiːz/", "n.", " giống ", example="Many species face extinction."),
            W("mammal", "/ˈmæm.əl/", "n.", " động vật có vú ", example="Whales are marine mammals."),
            W("reptile", "/ˈrep.taɪl/", "n.", " loài bò sát ", example="Snakes are cold-blooded reptiles."),
            W("insect", "/ˈɪn.sekt/", "n.", " côn trùng ", example="Bees are vital pollinating insects."),
            W("predator", "/ˈpred.ə.tə/", "n.", " kẻ săn mồi ", example="Lions are apex predators."),
            W("prey", "/preɪ/", "n.", " con mồi ", example="Gazelles are prey for big cats."),
            W("migrate", "/maɪˈɡreɪt/", "v.", " di chuyển ", example="Birds migrate south in winter."),
            W("habitat", "/ˈhæb.ɪ.tæt/", "n.", " chỗ ở ", example="Wetlands are rich habitats."),
            W("extinct", "/ɪkˈstɪŋkt/", "adj.", " diệt tuyệt ", example="Dodos are extinct."),
            W("endangered", "/ɪnˈdeɪn.dʒəd/", "adj.", " lâm nguy ", example="Tigers remain endangered."),
            W("breed", "/briːd/", "v.", " sinh sôi nẩy nở ", example="Pandas breed slowly in the wild."),
            W("vegetation", "/ˌvedʒ.əˈteɪ.ʃən/", "n.", " thảm thực vật ", example="Dense vegetation covers the hills."),
            W("photosynthesis", "/ˌfəʊ.təʊˈsɪn.θə.sɪs/", "n.", " sự quang hợp ", example="Leaves use photosynthesis for energy."),
            W("pollinate", "/ˈpɒl.ə.neɪt/", "v.", " thụ phấn ", example="Bees pollinate fruit trees."),
            W("wildlife", "/ˈwaɪld.laɪf/", "n.", " động vật hoang dã ", example="National parks protect wildlife."),
            W("domestic", "/dəˈmes.tɪk/", "adj.", " nuôi trong nhà ", " quốc nội ", example="Cats are domestic animals."),
            W("livestock", "/ˈlaɪv.stɒk/", "n.", " súc vật ", example="Drought harms livestock farms."),
            W("flora", "/ˈflɔː.rə/", "n.", " Thực vật bầy ", example="Island flora is unique."),
            W("fauna", "/ˈfɔː.nə/", "n.", " Động vật bầy ", example="Desert fauna adapts to heat."),
            W("organism", "/ˈɔː.ɡən.ɪ.zəm/", "n.", " Sinh học ", " cơ thể ", example="Microscopic organisms live in soil."),
            W("evolution", "/ˌiː.vəˈluː.ʃən/", "n.", " tiến hóa ", example="Evolution explains species change."),
            W("adaptation", "/ˌæd.əpˈteɪ.ʃən/", "n.", " thích ứng ", example="Camels show desert adaptation."),
            W("camouflage", "/ˈkæm.ə.flɑːʒ/", "n.", " ngụy trang ", example="Chameleons use camouflage."),
            W("hibernation", "/ˌhaɪ.bəˈneɪ.ʃən/", "n.", " ngủ đông ", example="Bears enter hibernation in winter."),
            W("rainforest", "/ˈreɪnˌfɒr.ɪst/", "n.", " rừng mưa ", example="Rainforests store huge carbon."),
            W("coral reef", "/ˈkɒr.əl ˌriːf/", "n.", " đá san hô ", example="Warming damages coral reefs."),
            W("conservationist", "/ˌkɒn.səˈveɪ.ʃən.ɪst/", "n.", " bảo vệ môi trường nhân sĩ ", " bảo hộ người chủ nghĩa ", example="Conservationists lobby for parks."),
            W("captivity", "/kæpˈtɪv.ə.ti/", "n.", " nuôi nhốt ", example="Breeding in captivity can help."),
            W("food chain", "/ˈfuːd ˌtʃeɪn/", "n.", " thực vật liệm(*chuỗi thực vật sinh tồn trong tự nhiên) ", example="Pollution enters the food chain."),
            W("ecosystem", "/ˈiː.kəʊˌsɪs.təm/", "n.", " sinh thái hệ thống ", example="Forests are complex ecosystems."),
        ],
    },
    {
        "id": "business",
        "no": 11,
        "title": " Kinh tế học và Kinh doanh ",
        "category": "academic",
        "desc": " thị trường, mậu dịch, công ty và tiêu phí ",
        "words": [
            W("economy", "/ɪˈkɒn.ə.mi/", "n.", " Kinh tế học ", example="The economy grew by two percent."),
            W("inflation", "/ɪnˈfleɪ.ʃən/", "n.", " lạm phát ", example="Inflation raises living costs."),
            W("recession", "/rɪˈseʃ.ən/", "n.", " Kinh tế học suy yếu ", example="Jobs fall during a recession."),
            W("investment", "/ɪnˈvest.mənt/", "n.", " đầu tư ", example="Foreign investment creates factories."),
            W("profit", "/ˈprɒf.ɪt/", "n.", " lợi nhuận ", example="The firm reported higher profit."),
            W("revenue", "/ˈrev.ən.juː/", "n.", " thu nhập ", " doanh thu ", example="Online sales boost revenue."),
            W("budget", "/ˈbʌdʒ.ɪt/", "n.", " dự toán ", example="Families set a monthly budget."),
            W("tax", "/tæks/", "n.", " thuế ", example="Income tax funds public services."),
            W("trade", "/treɪd/", "n.", " mậu dịch ", example="Global trade links markets."),
            W("export", "/ˈek.spɔːt/", "n.", " ra khỏi miệng ", example="Coffee is a key export."),
            W("import", "/ˈɪm.pɔːt/", "n.", " nhập khẩu ", example="The country imports oil."),
            W("supply", "/səˈplaɪ/", "n.", " cung cấp ", example="Supply cannot meet demand."),
            W("demand", "/dɪˈmɑːnd/", "n.", " nhu cầu ", example="Demand for housing is high."),
            W("competition", "/ˌkɒm.pəˈtɪʃ.ən/", "n.", " cạnh tranh ", example="Competition lowers prices."),
            W("monopoly", "/məˈnɒp.əl.i/", "n.", " lũng đoạn ", example="A monopoly can hurt consumers."),
            W("startup", "/ˈstɑːt.ʌp/", "n.", " mới thành lập công ty ", example="The startup raised new funds."),
            W("shareholder", "/ˈʃeəˌhəʊl.də/", "n.", " cổ đông ", example="Shareholders vote at the AGM."),
            W("bankruptcy", "/ˈbæŋ.kr.rəpt.si/", "n.", " phá sản ", example="Poor cash flow caused bankruptcy."),
            W("interest rate", "/ˈɪn.trəst ˌreɪt/", "n.", " lãi suất ", example="Low interest rates encourage borrowing."),
            W("currency", "/ˈkʌr.ən.si/", "n.", " tiền ", example="Tourists exchange currency at banks."),
            W("transaction", "/trænˈzæk.ʃən/", "n.", " giao dịch ", example="Online transactions need security."),
            W("marketing", "/ˈmɑː.kɪ.tɪŋ/", "n.", " thị trường doanh tiêu ", example="Marketing targets young buyers."),
            W("brand", "/brænd/", "n.", " nhãn hiệu ", example="The brand expanded overseas."),
            W("retail", "/ˈriː.teɪl/", "n.", " bán lẻ ", example="Retail shops face online rivals."),
            W("wholesale", "/ˈhəʊl.seɪl/", "n.", " bán buôn ", example="Wholesale prices fell this quarter."),
            W("entrepreneurship", "/ˌɒn.trə.prəˈnɜː.ʃɪp/", "n.", " gây dựng sự nghiệp tinh thần ", example="Schools teach entrepreneurship."),
            W("outsourcing", "/ˈaʊtˌsɔː.sɪŋ/", "n.", " bao bên ngoài ", example="Outsourcing cuts labour costs."),
            W("globalisation", "/ˌɡləʊ.bəl.aɪˈzeɪ.ʃən/", "n.", " toàn cầu hóa ", example="Globalisation links distant markets."),
            W("subsidy", "/ˈsʌb.sɪ.di/", "n.", " phụ cấp ", example="Farmers receive a government subsidy."),
            W("debt", "/det/", "n.", " nợ nần ", example="Student debt worries graduates."),
        ],
    },
    {
        "id": "urban",
        "no": 12,
        "title": " Đô thị và kiến trúc ",
        "category": "topics",
        "desc": " Đô thị hóa, nhà ở và công cộng không gian ",
        "words": [
            W("urbanisation", "/ˌɜː.bən.aɪˈzeɪ.ʃən/", "n.", " Đô thị hóa ", example="Urbanisation accelerates in Asia."),
            W("metropolis", "/məˈtrɒp.əl.ɪs/", "n.", " đại đô thị ", example="Tokyo is a vast metropolis."),
            W("suburb", "/ˈsʌb.ɜːb/", "n.", " vùng ngoại thành ", example="Families move to quieter suburbs."),
            W("skyscraper", "/ˈskaɪˌskreɪ.pə/", "n.", " cao ốc chọc trời ", example="Skyscrapers define the skyline."),
            W("infrastructure", "/ˈɪn.frəˌstrʌk.tʃə/", "n.", " trụ cột phương tiện ", example="Aging infrastructure needs repair."),
            W("housing", "/ˈhaʊ.zɪŋ/", "n.", " nhà ở ", example="Affordable housing is scarce."),
            W("rent", "/rent/", "n.", " tiền thuê ", example="City rent keeps rising."),
            W("mortgage", "/ˈmɔː.ɡɪdʒ/", "n.", " theo như vạch trần ", " thế chấp mượn tiền ", example="They took a 30-year mortgage."),
            W("construction", "/kənˈstrʌk.ʃən/", "n.", " kiến trúc thi công ", example="Construction noise starts early."),
            W("demolish", "/dɪˈmɒl.ɪʃ/", "v.", " dỡ bỏ ", example="They will demolish the old factory."),
            W("renovation", "/ˌren.əˈveɪ.ʃən/", "n.", " đổi mới ", example="Home renovation costs money."),
            W("landmark", "/ˈlænd.mɑːk/", "n.", " tiêu chí ", example="The tower is a city landmark."),
            W("district", "/ˈdɪs.trɪkt/", "n.", " khu vực ", " khu hành chính ", example="The business district is crowded."),
            W("residential", "/ˌrez.ɪˈden.ʃəl/", "adj.", " nhà ở ", example="Residential streets need slower traffic."),
            W("commercial", "/kəˈmɜː.ʃəl/", "adj.", " Kinh doanh ", example="Commercial zones allow shops."),
            W("overpopulation", "/ˌəʊ.vəˌpɒp.jəˈleɪ.ʃən/", "n.", " thừa dân số ", example="Overpopulation strains water supplies."),
            W("slum", "/slʌm/", "n.", " xóm nghèo ", example="Slums lack basic services."),
            W("amenities", "/əˈmiː.nə.tiz/", "n.", " tiện lợi phương tiện ", example="Parks are important amenities."),
            W("pavement", "/ˈpeɪv.mənt/", "n.", " lối đi bộ ", example="Keep bicycles off the pavement."),
            W("traffic jam", "/ˈtræf.ɪk ˌdʒæm/", "n.", " Giao thông bế tắc ", example="A traffic jam delayed the bus."),
            W("green space", "/ɡriːn speɪs/", "n.", " xanh hoá ", example="Cities need more green space."),
            W("zoning", "/ˈzəʊ.nɪŋ/", "n.", " phân khu quy hoạch ", example="Zoning separates factories from homes."),
            W("high-rise", "/ˈhaɪ.raɪz/", "n.", " nhà cao tầng ", example="High-rises house thousands."),
            W("underground", "/ˌʌn.dəˈɡraʊnd/", "n.", " tàu điện ngầm ", example="Take the underground to the museum."),
            W("crowded", "/ˈkraʊ.dɪd/", "adj.", " chật chội ", example="Stations are crowded at 8 a.m."),
            W("sprawl", "/sprɔːl/", "n.", " không trật tự khuếch trương ", example="Urban sprawl eats farmland."),
            W("facilities", "/fəˈsɪl.ə.tiz/", "n.", " phương tiện ", example="Sports facilities serve residents."),
            W("architecture", "/ˈɑː.kɪ.tek.tʃə/", "n.", " lối kiến trúc ", " kiến trúc ", example="Historic architecture draws tourists."),
            W("planning", "/ˈplæn.ɪŋ/", "n.", " quy hoạch ", example="City planning balances growth and nature."),
            W("neighbourhood", "/ˈneɪ.bə.hʊd/", "n.", " cộng đồng ", " láng giềng ", example="The neighbourhood feels safe."),
        ],
    },
]


def js_escape(s: str) -> str:
    return (
        str(s)
        .replace("\\", "\\\\")
        .replace("'", "\\'")
        .replace("\n", "\\n")
        .replace("\r", "")
    )


def word_js(w: dict) -> str:
    alts = ", ".join("'" + js_escape(a) + "'" for a in w["acceptCN"])
    return (
        "{ word:'%(word)s', ipa:'%(ipa)s', pos:'%(pos)s', meaning:'%(meaning)s', "
        "acceptCN:[%(alts)s], example:'%(example)s' }"
        % {
            "word": js_escape(w["word"]),
            "ipa": js_escape(w["ipa"]),
            "pos": js_escape(w["pos"]),
            "meaning": js_escape(w["meaning"]),
            "alts": alts,
            "example": js_escape(w["example"]),
        }
    )


def html_for(theme: dict) -> str:
    title = " thứ %d bài · %s" % (theme["no"], theme["title"])
    words_js = ",\n ".join(word_js(w) for w in theme["words"])
    return """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="exam:zone" content="study">
  <meta name="exam:subject" content="vocab-themes">
  <meta name="exam:title" content="%(title)s">
  <meta name="exam:description" content=" Từ vựng theo chủ đề · %(desc)s">
  <title>%(title)s</title>
</head>
<body>
<!-- ponytail: thin shell — vocab-lesson.html parses wordData -->
<script>
const wordData = [
    %(words)s
];
</script>
</body>
</html>
""" % {
        "title": title,
        "desc": theme["desc"],
        "words": words_js,
    }


def filename(theme: dict) -> str:
    return "theme-%02d-%s.html" % (theme["no"], theme["id"])


def main() -> int:
    os.makedirs(OUT, exist_ok=True)
    # wipe previous theme-*.html
    for name in os.listdir(OUT):
        if re.match(r"^theme-\d+-.*\.html$", name):
            os.remove(os.path.join(OUT, name))

    catalog_themes = []
    for theme in THEMES:
        path = os.path.join(OUT, filename(theme))
        with open(path, "w", encoding="utf-8") as f:
            f.write(html_for(theme))
        preview = [w["word"] for w in theme["words"][:8]]
        catalog_themes.append(
            {
                "id": theme["id"],
                "no": theme["no"],
                "title": theme["title"],
                "category": theme["category"],
                "desc": theme["desc"],
                "file": "study/vocab-themes/" + filename(theme),
                "count": len(theme["words"]),
                "preview": preview,
                "words": theme["words"],
            }
        )
        print("wrote", path, "(%d words)" % len(theme["words"]))

    catalog = {
        "sourceNote": "YYSD nguyên sang[bản gốc] IELTS chủ đề từ kho; tin tức cơ cấu tham khảo thông thường phân loại từ điển (bên cạnh lan loại lớn → chủ đề → từ đầu), không phải kẻ thứ ba từ bề ngoài phục chế. ",
        "categories": CATEGORIES,
        "themes": catalog_themes,
    }
    cat_path = os.path.join(OUT, "themes.json")
    with open(cat_path, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("wrote", cat_path)
    print("themes:", len(THEMES), "words:", sum(len(t["words"]) for t in THEMES))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
