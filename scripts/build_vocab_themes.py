#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build IELTS themed vocab bank (Koolearn-inspired taxonomy, original lists).

Writes:
  library/study/vocab-themes/themes.json
  library/study/vocab-themes/theme-NN-<id>.html  (thin wordData shells for vocab-lesson)
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
    {"id": "academic", "label": " môn học kiến thức "},
    {"id": "life", "label": " sống cảnh "},
    {"id": "society", "label": " xã hội nhân văn "},
    {"id": "nature", "label": " tự nhiên sinh thái "},
]

# ponytail: curated IELTS topic lists - taxonomy pattern from Koolearn, not their copy
THEMES = [
    {
        "id": "environment",
        "no": 1,
        "title": " môi trường biến thể của | sinh thái ",
        "category": "topics",
        "desc": " gây ô nhiễm, khí hậu, năng lượng biến thể của | sinh thái bảo vệ ",
        "words": [
            W("climate change", "/ˈklaɪ.mət ˌtʃeɪndʒ/", "n.", " biến đổi khí hậu ", example="Climate change affects coastal cities."),
            W("greenhouse gas", "/ˈɡriːn.haʊs ˌɡæs/", "n.", " khí nhà kính ", example="Carbon dioxide is a major greenhouse gas."),
            W("carbon emission", "/ˈkɑː.bən ɪˈmɪʃ.ən/", "n.", " phát thải carbon ", " carbon điôxít CO2 sắp xếp theo thứ tự ", example="Governments aim to cut carbon emissions."),
            W("fossil fuel", "/ˈfɒs.əl ˌfjuː.əl/", "n.", " nhiên liệu hoá thạch ", example="Fossil fuels still power many factories."),
            W("renewable energy", "/rɪˈnjuː.ə.bəl ˈen.ə.dʒi/", "n.", " tái tạo được năng lượng ", example="Solar power is a renewable energy source."),
            W("deforestation", "/diːˌfɒr.ɪˈsteɪ.ʃən/", "n.", " chặt phá rừng bất hợp pháp rừng ", " rừng đốn hạ ", example="Deforestation threatens wildlife habitats."),
            W("biodiversity", "/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/", "n.", " đa dạng sinh học ", example="Biodiversity is declining in many regions."),
            W("pollution", "/pəˈluː.ʃən/", "n.", " gây ô nhiễm ", example="Air pollution is severe in megacities."),
            W("recycle", "/ˌriːˈsaɪ.kəl/", "v.", " tái chế tận dụng ", " tái chế ", example="We should recycle plastic bottles."),
            W("landfill", "/ˈlænd.fɪl/", "n.", " rác lấp hoặc nhồi chôn sân phơi ", " lấp hoặc nhồi chôn sân phơi ", example="Landfills are filling up quickly."),
            W("conservation", "/ˌkɒn.səˈveɪ.ʃən/", "n.", " bảo vệ ", " chăm sóc trẻ ", example="Wildlife conservation needs funding."),
            W("sustainable", "/səˈsteɪ.nə.bəl/", "adj.", " bền vững của ", example="Sustainable farming protects the soil."),
            W("ecosystem", "/ˈiː.kəʊˌsɪs.təm/", "n.", " hệ sinh thái ", example="Coral reefs are fragile ecosystems."),
            W("habitat", "/ˈhæb.ɪ.tæt/", "n.", " môi trường sống ", example="Urban sprawl destroys animal habitats."),
            W("endangered", "/ɪnˈdeɪn.dʒəd/", "adj.", " bị đe doạ của ", example="Pandas are still endangered."),
            W("emission", "/ɪˈmɪʃ.ən/", "n.", " sắp xếp theo thứ tự ", example="Vehicle emissions worsen smog."),
            W("drought", "/draʊt/", "n.", " hạn hán ", example="The drought ruined the harvest."),
            W("flood", "/flʌd/", "n.", " trận lụt ", example="Heavy rain caused serious floods."),
            W("erosion", "/ɪˈrəʊ.ʒən/", "n.", " xói mòn ", " nước và đất bị cuốn trôi ", example="Soil erosion reduces farm yields."),
            W("contaminate", "/kənˈtæm.ɪ.neɪt/", "v.", " gây ô nhiễm ", " làm bẩn ", example="Chemicals can contaminate rivers."),
            W("ozone layer", "/ˈəʊ.zəʊn ˌleɪ.ə/", "n.", " tầng ozon ", example="The ozone layer filters UV radiation."),
            W("global warming", "/ˌɡləʊ.bəl ˈwɔː.mɪŋ/", "n.", " nóng lên toàn cầu ", example="Global warming raises sea levels."),
            W("waste disposal", "/weɪst dɪˈspəʊ.zəl/", "n.", " rác rưởi xử lý ", " rác xử lý ", example="Waste disposal is a city challenge."),
            W("organic", "/ɔːˈɡæn.ɪk/", "adj.", " hữu cơ của ", example="Organic food avoids synthetic pesticides."),
            W("smog", "/smɒɡ/", "n.", " mù ", example="Smog reduces visibility downtown."),
            W("preserve", "/prɪˈzɜːv/", "v.", " bảo vệ ", " Lưu ", example="Laws help preserve forests."),
            W("resource", "/rɪˈzɔːs/", "n.", " huyện Tư Nguyên ở Quế Lâm ", example="Water is a scarce resource here."),
            W("toxic", "/ˈtɒk.sɪk/", "adj.", " độc của ", example="Toxic waste must be handled carefully."),
            W("eco-friendly", "/ˌiː.kəʊˈfrend.li/", "adj.", " bảo vệ môi trường của ", example="Eco-friendly packaging is popular."),
            W("carbon footprint", "/ˈkɑː.bən ˌfʊt.prɪnt/", "n.", " dấu chân carbon ", example="Flying increases your carbon footprint."),
        ],
    },
    {
        "id": "education",
        "no": 2,
        "title": " giáo dục biến thể của | học ",
        "category": "topics",
        "desc": " trường học, Khóa học, dự thi biến thể của | học phương pháp ",
        "words": [
            W("curriculum", "/kəˈrɪk.jə.ləm/", "n.", " Khóa học ", " khóa học hệ thống ", example="The curriculum includes science and arts."),
            W("tuition", "/tjuˈɪʃ.ən/", "n.", " học phí ", example="Tuition fees have risen sharply."),
            W("scholarship", "/ˈskɒl.ə.ʃɪp/", "n.", " học bổng ", example="She won a full scholarship."),
            W("assignment", "/əˈsaɪn.mənt/", "n.", " Bài tập ", " nhiệm vụ ", example="The assignment is due on Friday."),
            W("lecture", "/ˈlek.tʃə/", "n.", " bài giảng ", " dạy ", example="The lecture lasted two hours."),
            W("seminar", "/ˈsem.ɪ.nɑː/", "n.", " thảo luận môn học ", " diễn đàn thảo luận ", example="Students present ideas in seminars."),
            W("dissertation", "/ˌdɪs.əˈteɪ.ʃən/", "n.", " luận văn ", " bài báo ", example="He is writing his dissertation."),
            W("literacy", "/ˈlɪt.ər.ə.si/", "n.", " khả năng đọc viết ", " học đọc ", example="Digital literacy is essential today."),
            W("motivate", "/ˈməʊ.tɪ.veɪt/", "v.", " khích lệ ", " khơi dậy ", example="Good teachers motivate learners."),
            W("discipline", "/ˈdɪs.ə.plɪn/", "n.", " kỷ luật ", " môn học ", example="Classroom discipline matters."),
            W("assessment", "/əˈses.mənt/", "n.", " đánh giá ", " kiểm tra và đánh giá ", example="Continuous assessment replaces one big exam."),
            W("enrol", "/ɪnˈrəʊl/", "v.", " Đăng ký ", " vào trường hoặc cao đẳng ", example="Students enrol in September."),
            W("campus", "/ˈkæm.pəs/", "n.", " Khuôn viên trường ", example="The campus has a new library."),
            W("undergraduate", "/ˌʌn.dəˈɡrædʒ.u.ət/", "n.", " sinh viên đại học ", example="Undergraduates take core modules."),
            W("postgraduate", "/ˌpəʊstˈɡrædʒ.u.ət/", "n.", " học viên cao học ", example="She is a postgraduate in law."),
            W("critical thinking", "/ˌkrɪt.ɪ.kəl ˈθɪŋ.kɪŋ/", "n.", " phê phán bản chất suy nghĩ ", example="Essays require critical thinking."),
            W("plagiarism", "/ˈpleɪ.dʒər.ɪ.zəm/", "n.", " đạo văn ", example="Plagiarism leads to penalties."),
            W("deadline", "/ˈded.laɪn/", "n.", " hạn chót biến thể của ", example="Meet the project deadline."),
            W("mentor", "/ˈmen.tɔː/", "n.", " gia sư ", " huấn luyện viên ", example="A mentor guides new students."),
            W("vocational", "/vəʊˈkeɪ.ʃən.əl/", "adj.", " nghề nghiệp của ", example="Vocational training prepares workers."),
            W("boarding school", "/ˈbɔː.dɪŋ ˌskuːl/", "n.", " trường nội trú ", example="He attended a boarding school."),
            W("distance learning", "/ˈdɪs.təns ˌlɜː.nɪŋ/", "n.", " từ xa học ", example="Distance learning suits busy adults."),
            W("peer pressure", "/ˈpɪə ˌpreʃ.ə/", "n.", " cùng thế hệ áp lực ", example="Peer pressure can affect choices."),
            W("revise", "/rɪˈvaɪz/", "v.", " Ôn tập ", " sửa đổi ", example="Revise before the final exam."),
            W("timetable", "/ˈtaɪmˌteɪ.bəl/", "n.", " thời khóa biểu ", " lịch trình ", example="Check the exam timetable."),
            W("faculty", "/ˈfæk.əl.ti/", "n.", " sân kết nối ", " giáo viên ", example="The science faculty is large."),
            W("internship", "/ˈɪn.tɜːn.ʃɪp/", "n.", " thực hành ", example="An internship builds experience."),
            W("dropout", "/ˈdrɒp.aʊt/", "n.", " bỏ học người mà ", example="The school reduced dropout rates."),
            W("compulsory", "/kəmˈpʌl.sər.i/", "adj.", " bắt buộc của ", " ép buộc của ", example="Maths is compulsory in year one."),
            W("elective", "/ɪˈlek.tɪv/", "n.", " môn học tự chọn ", example="Choose one elective each term."),
        ],
    },
    {
        "id": "technology",
        "no": 3,
        "title": " khoa học và công nghệ biến thể của | Internet ",
        "category": "topics",
        "desc": " Internet, trí tuệ nhân tạo biến thể của | chữ số sống ",
        "words": [
            W("artificial intelligence", "/ˌɑː.tɪˌfɪʃ.əl ɪnˈtel.ɪ.dʒəns/", "n.", " trí tuệ nhân tạo ", example="Artificial intelligence powers chatbots."),
            W("algorithm", "/ˈæl.ɡə.rɪ.ðəm/", "n.", " số học ", example="Social apps use ranking algorithms."),
            W("automation", "/ˌɔː.təˈmeɪ.ʃən/", "n.", " tự động hóa ", example="Automation replaces routine jobs."),
            W("cybersecurity", "/ˌsaɪ.bə.sɪˈkjʊə.rə.ti/", "n.", " Internet an toàn ", example="Cybersecurity protects user data."),
            W("database", "/ˈdeɪ.tə.beɪs/", "n.", " cơ sở dữ liệu ", example="Customer records sit in a database."),
            W("digital", "/ˈdɪdʒ.ɪ.təl/", "adj.", " chữ số của ", example="Digital payment is widespread."),
            W("innovation", "/ˌɪn.əˈveɪ.ʃən/", "n.", " đề xuất ý tưởng mới ", example="Innovation drives tech startups."),
            W("interface", "/ˈɪn.tə.feɪs/", "n.", " bề mặt tiếp xúc ", example="The app interface is simple."),
            W("network", "/ˈnet.wɜːk/", "n.", " Internet ", example="The network was briefly offline."),
            W("privacy", "/ˈprɪv.ə.si/", "n.", " bí mật ", example="Online privacy concerns users."),
            W("software", "/ˈsɒft.weə/", "n.", " phần mềm ", example="Update the software regularly."),
            W("hardware", "/ˈhɑːd.weə/", "n.", " phần cứng ", example="New hardware improves speed."),
            W("smartphone", "/ˈsmɑːt.fəʊn/", "n.", " điện thoại thông minh ", example="Smartphones changed daily habits."),
            W("broadband", "/ˈbrɔːd.bænd/", "n.", " băng thông rộng ", example="Rural broadband is expanding."),
            W("cloud computing", "/klaʊd kəmˈpjuː.tɪŋ/", "n.", " điện toán đám mây ", example="Cloud computing stores files online."),
            W("virtual reality", "/ˌvɜː.tʃu.əl riˈæl.ə.ti/", "n.", " thực tế ảo ", example="Virtual reality is used in training."),
            W("robotics", "/rəʊˈbɒt.ɪks/", "n.", " người máy công nghệ ", example="Robotics transforms manufacturing."),
            W("surveillance", "/səˈveɪ.ləns/", "n.", " giám sát ", " giám sát ", example="CCTV surveillance covers the street."),
            W("encryption", "/ɪnˈkrɪp.ʃən/", "n.", " mã hóa ", example="Encryption keeps messages safe."),
            W("download", "/ˌdaʊnˈləʊd/", "v.", " Tải xuống ", example="Download the file before class."),
            W("upload", "/ˌʌpˈləʊd/", "v.", " Tải lên ", example="Upload your essay to the portal."),
            W("browse", "/braʊz/", "v.", " xem lướt ", example="Students browse academic journals."),
            W("gadget", "/ˈɡædʒ.ɪt/", "n.", " nhỏ lắp đặt ", " tiện ích ", example="Wearable gadgets track fitness."),
            W("outdated", "/ˌaʊtˈdeɪ.tɪd/", "adj.", " lỗi thời của ", example="The software is outdated."),
            W("breakthrough", "/ˈbreɪk.θruː/", "n.", " đột phá ", example="The research is a breakthrough."),
            W("tech-savvy", "/ˈtek ˌsæv.i/", "adj.", " thành thạo khoa học và công nghệ của ", example="Tech-savvy teens learn apps fast."),
            W("bandwidth", "/ˈbænd.wɪdθ/", "n.", " băng thông ", example="Low bandwidth slows video calls."),
            W("malware", "/ˈmæl.weə/", "n.", " phần mềm độc hại ", example="Malware can steal passwords."),
            W("user-friendly", "/ˌjuː.zəˈfrend.li/", "adj.", " người dùng quận Hữu Hảo của thành phố Y Xuân của ", example="The design is user-friendly."),
            W("e-commerce", "/ˈiːˌkɒm.ɜːs/", "n.", " thương mại điện tử ", example="E-commerce grew during lockdowns."),
        ],
    },
    {
        "id": "health",
        "no": 4,
        "title": " sức khỏe biến thể của | điều trị y tế ",
        "category": "topics",
        "desc": " bệnh tật, điều trị y tế, ăn uống biến thể của | tâm lý sức khỏe ",
        "words": [
            W("nutrition", "/njuˈtrɪʃ.ən/", "n.", " dinh dưỡng ", example="Good nutrition supports growth."),
            W("obesity", "/əʊˈbiː.sə.ti/", "n.", " béo ", example="Childhood obesity is rising."),
            W("vaccine", "/ˈvæk.siːn/", "n.", " vắc-xin ", example="The vaccine prevents infection."),
            W("symptom", "/ˈsɪmp.təm/", "n.", " triệu chứng ", example="Fever is a common symptom."),
            W("diagnosis", "/ˌdaɪ.əɡˈnəʊ.sɪs/", "n.", " Chẩn đoán ", example="Early diagnosis improves outcomes."),
            W("treatment", "/ˈtriːt.mənt/", "n.", " điều trị ", example="Treatment may include physiotherapy."),
            W("prescription", "/prɪˈskrɪp.ʃən/", "n.", " đơn thuốc ", example="Collect your prescription at the pharmacy."),
            W("chronic", "/ˈkrɒn.ɪk/", "adj.", " chậm và kiên nhẫn của ", example="Diabetes is a chronic condition."),
            W("epidemic", "/ˌep.ɪˈdem.ɪk/", "n.", " bệnh dịch ", example="The epidemic spread rapidly."),
            W("hygiene", "/ˈhaɪ.dʒiːn/", "n.", " sức khỏe ", example="Hand hygiene reduces infection."),
            W("immune system", "/ɪˈmjuːn ˌsɪs.təm/", "n.", " hệ thống miễn dịch ", example="Sleep strengthens the immune system."),
            W("mental health", "/ˈmen.təl helθ/", "n.", " tâm lý sức khỏe ", example="Mental health needs open discussion."),
            W("stress", "/stres/", "n.", " áp lực ", example="Exam stress is common among students."),
            W("therapy", "/ˈθer.ə.pi/", "n.", " liệu pháp ", " điều trị ", example="Talking therapy helps anxiety."),
            W("surgery", "/ˈsɜː.dʒər.i/", "n.", " ca phẫu thuật ", example="He recovered well after surgery."),
            W("patient", "/ˈpeɪ.ʃənt/", "n.", " người bệnh ", example="The patient waited for results."),
            W("clinic", "/ˈklɪn.ɪk/", "n.", " phòng khám ", example="Book an appointment at the clinic."),
            W("protein", "/ˈprəʊ.tiːn/", "n.", " protein ", example="Eggs are rich in protein."),
            W("calorie", "/ˈkæl.ər.i/", "n.", " calo ", example="Track daily calorie intake."),
            W("sedentary", "/ˈsed.ən.tər.i/", "adj.", " thời gian ngồi của ", example="A sedentary lifestyle harms health."),
            W("addiction", "/əˈdɪk.ʃən/", "n.", " bị nghiện ", example="Phone addiction affects sleep."),
            W("prevention", "/prɪˈven.ʃən/", "n.", " ngăn ngừa ", example="Prevention is cheaper than cure."),
            W("allergy", "/ˈæl.ə.dʒi/", "n.", " quá nhạy cảm ", example="Peanut allergy can be serious."),
            W("blood pressure", "/ˈblʌd ˌpreʃ.ə/", "n.", " huyết áp ", example="High blood pressure needs monitoring."),
            W("rehabilitation", "/ˌriː.həˌbɪl.ɪˈteɪ.ʃən/", "n.", " hồi phục ", example="Rehabilitation followed the injury."),
            W("pandemic", "/pænˈdem.ɪk/", "n.", " đại dịch bệnh ", example="The pandemic disrupted travel."),
            W("well-being", "/ˌwelˈbiː.ɪŋ/", "n.", " hạnh phúc ", " thể chất và tinh thần sức khỏe ", example="Exercise improves well-being."),
            W("insomnia", "/ɪnˈsɒm.ni.ə/", "n.", " bị mất ngủ ", example="Insomnia affects concentration."),
            W("outbreak", "/ˈaʊt.breɪk/", "n.", " bùng nổ ", example="An outbreak of flu hit the school."),
            W("healthcare", "/ˈhelθ.keə/", "n.", " chăm sóc sức khỏe ", example="Public healthcare varies by country."),
        ],
    },
    {
        "id": "work",
        "no": 5,
        "title": " làm việc biến thể của | nơi làm việc ",
        "category": "life",
        "desc": " tìm được việc làm, nơi làm việc khả năng kỹ thuật biến thể của | làm việc chế độ ",
        "words": [
            W("career", "/kəˈrɪə/", "n.", " nghề nghiệp ", " sự nghiệp ", example="She plans a career in design."),
            W("colleague", "/ˈkɒl.iːɡ/", "n.", " đồng nghiệp ", example="Ask a colleague for feedback."),
            W("deadline", "/ˈded.laɪn/", "n.", " hạn chót biến thể của ", example="The team met every deadline."),
            W("promotion", "/prəˈməʊ.ʃən/", "n.", " thăng chức lên vị trí cao hơn ", example="Hard work led to promotion."),
            W("resign", "/rɪˈzaɪn/", "v.", " từ chức ", example="He decided to resign last month."),
            W("recruit", "/rɪˈkruːt/", "v.", " mời ứng tuyển vào công việc ", example="Firms recruit graduates each year."),
            W("salary", "/ˈsæl.ər.i/", "n.", " lương ", example="The salary includes benefits."),
            W("wage", "/weɪdʒ/", "n.", " tiền lương ", " lương theo giờ ", example="The minimum wage rose again."),
            W("freelance", "/ˈfriː.lɑːns/", "adj.", " tự làm chủ của ", example="Freelance writers set their hours."),
            W("remote work", "/rɪˈməʊt wɜːk/", "n.", " từ xa xử lý công việc chính thức ", example="Remote work became common after 2020."),
            W("commute", "/kəˈmjuːt/", "v.", " đi làm ", example="Many people commute by train."),
            W("overtime", "/ˈəʊ.və.taɪm/", "n.", " làm thêm giờ ", example="Staff receive overtime pay."),
            W("workload", "/ˈwɜːk.ləʊd/", "n.", " khối lượng công việc ", example="The workload peaks in June."),
            W("productivity", "/ˌprɒd.ʌkˈtɪv.ə.ti/", "n.", " khả năng sản xuất ", " hiệu suất ", example="Better tools raise productivity."),
            W("entrepreneur", "/ˌɒn.trə.prəˈnɜː/", "n.", " doanh nhân ", example="The entrepreneur launched an app."),
            W("interview", "/ˈɪn.tə.vjuː/", "n.", " được phỏng vấn ", example="Prepare answers before the interview."),
            W("CV", "/ˌsiːˈviː/", "n.", " sơ yếu lý lịch ", example="Update your CV with new skills."),
            W("redundant", "/rɪˈdʌn.dənt/", "adj.", " chăn cắt giảm nhân sự của ", example="Workers were made redundant."),
            W("shift", "/ʃɪft/", "n.", " làm việc theo ca ", example="Nurses work night shifts."),
            W("bonus", "/ˈbəʊ.nəs/", "n.", " tiền thưởng ", example="Staff received a year-end bonus."),
            W("negotiate", "/nɪˈɡəʊ.ʃi.eɪt/", "v.", " đàm phán ", " tham vấn ", example="Negotiate a fair contract."),
            W("hierarchy", "/ˈhaɪə.rɑː.ki/", "n.", " hệ thống phân cấp ", example="The company has a flat hierarchy."),
            W("collaborate", "/kəˈlæb.ə.reɪt/", "v.", " hợp tác ", example="Teams collaborate across offices."),
            W("expertise", "/ˌek.spɜːˈtiːz/", "n.", " chuyên môn ", " chuyên môn kiến thức ", example="She has expertise in marketing."),
            W("apprenticeship", "/əˈpren.tɪ.ʃɪp/", "n.", " người học việc hệ thống ", example="An apprenticeship combines work and study."),
            W("part-time", "/ˌpɑːtˈtaɪm/", "adj.", " làm nhiều công việc cùng lúc của ", example="Students take part-time jobs."),
            W("full-time", "/ˌfʊlˈtaɪm/", "adj.", " công việc toàn thời gian của ", example="He found a full-time role."),
            W("workplace", "/ˈwɜːk.pleɪs/", "n.", " làm việc địa điểm ", example="Safety rules protect the workplace."),
            W("ambition", "/æmˈbɪʃ.ən/", "n.", " hoài bão ", example="Ambition drives career growth."),
            W("burnout", "/ˈbɜːn.aʊt/", "n.", " nghề nghiệp mệt mỏi ", example="Burnout follows long overtime."),
        ],
    },
    {
        "id": "media",
        "no": 6,
        "title": " truyền thông biến thể của | quảng cáo ",
        "category": "society",
        "desc": " tin tức, tương tác nền tảng biến thể của | quảng cáo truyền bá ",
        "words": [
            W("broadcast", "/ˈbrɔːd.kɑːst/", "v.", " phát sóng ", " phát sóng ", example="Channels broadcast live news."),
            W("headline", "/ˈhed.laɪn/", "n.", " tiêu đề ", example="The headline attracted clicks."),
            W("journalist", "/ˈdʒɜː.nə.lɪst/", "n.", " phóng viên ", example="Journalists verify their sources."),
            W("editorial", "/ˌed.ɪˈtɔː.ri.əl/", "n.", " bài xã luận ", example="The editorial criticised the policy."),
            W("censorship", "/ˈsen.sə.ʃɪp/", "n.", " kiểm tra ", example="Censorship limits free speech."),
            W("propaganda", "/ˌprɒp.əˈɡæn.də/", "n.", " truyền bá ", " kích động cho ", example="Wartime propaganda shaped opinions."),
            W("advertisement", "/ədˈvɜː.tɪs.mənt/", "n.", " quảng cáo ", example="The advertisement targets teens."),
            W("commercial", "/kəˈmɜː.ʃəl/", "n.", " kinh doanh quảng cáo ", example="TV commercials interrupt programmes."),
            W("influencer", "/ˈɪn.flu.ən.sə/", "n.", " người nổi tiếng trên mạng ", " ảnh hưởng người mà ", example="Influencers promote products online."),
            W("social media", "/ˌsəʊ.ʃəl ˈmiː.di.ə/", "n.", " truyền thông xã hội ", example="Social media spreads news fast."),
            W("viral", "/ˈvaɪə.rəl/", "adj.", " vi rút loại truyền bá của ", example="The video went viral overnight."),
            W("bias", "/ˈbaɪ.əs/", "n.", " thành kiến ", example="Media bias can mislead readers."),
            W("audience", "/ˈɔː.di.əns/", "n.", " khán giả ", " khán giả mục tiêu ", example="The show attracts a young audience."),
            W("coverage", "/ˈkʌv.ər.ɪdʒ/", "n.", " đưa tin ", " che phủ ", example="Storm coverage dominated the news."),
            W("tabloid", "/ˈtæb.lɔɪd/", "n.", " báo lá cải ", example="Tabloids favour celebrity stories."),
            W("documentary", "/ˌdɒk.jəˈmen.tər.i/", "n.", " phim tài liệu ", example="The documentary explores climate."),
            W("podcast", "/ˈpɒd.kɑːst/", "n.", " podcast ", example="She listens to education podcasts."),
            W("subscribe", "/səbˈskraɪb/", "v.", " sự đăng ký ", example="Subscribe to the channel for updates."),
            W("clickbait", "/ˈklɪk.beɪt/", "n.", " ”người viết tiêu đề giật gân” ", example="Clickbait titles exaggerate claims."),
            W("publicity", "/pʌbˈlɪs.ə.ti/", "n.", " truyền bá ", " công chúng chú ý đến ", example="The campaign gained free publicity."),
            W("slogan", "/ˈsləʊ.ɡən/", "n.", " khẩu hiệu ", " khẩu hiệu viết ", example="A short slogan is memorable."),
            W("brand", "/brænd/", "n.", " tên thương hiệu ", example="Strong brands earn trust."),
            W("consumer", "/kənˈsjuː.mə/", "n.", " người tiêu dùng ", example="Consumers compare prices online."),
            W("target", "/ˈtɑː.ɡɪt/", "v.", " nhắm vào ", " nhắm vào ", example="Ads target specific age groups."),
            W("reputation", "/ˌrep.jəˈteɪ.ʃən/", "n.", " danh tiếng ", example="Fake news harms reputation."),
            W("sensational", "/senˈseɪ.ʃən.əl/", "adj.", " phóng đại gây sốc của ", example="Sensational stories sell papers."),
            W("freedom of the press", "/ˌfriː.dəm əv ðə ˈpres/", "n.", " tự do báo chí ", example="Freedom of the press supports democracy."),
            W("misinformation", "/ˌmɪs.ɪn.fəˈmeɪ.ʃən/", "n.", " sai lầm thông tin ", example="Misinformation spreads on apps."),
            W("streaming", "/ˈstriː.mɪŋ/", "n.", " phương tiện truyền phát trực tuyến ", example="Streaming replaced DVDs."),
            W("rating", "/ˈreɪ.tɪŋ/", "n.", " lượng người xem ", " chấm điểm ", example="High ratings keep shows on air."),
        ],
    },
    {
        "id": "travel",
        "no": 7,
        "title": " chuyến đi biến thể của | kết nối ",
        "category": "life",
        "desc": " đi ra đâu đó, kết nối cách thức biến thể của | chuyến đi công nghiệp ",
        "words": [
            W("destination", "/ˌdes.tɪˈneɪ.ʃən/", "n.", " điểm đến ", example="Paris is a popular destination."),
            W("itinerary", "/aɪˈtɪn.ər.ər.i/", "n.", " hành trình ", example="Check the tour itinerary carefully."),
            W("accommodation", "/əˌkɒm.əˈdeɪ.ʃən/", "n.", " ở lại ", example="Book accommodation in advance."),
            W("reservation", "/ˌrez.əˈveɪ.ʃən/", "n.", " đặt hàng ", example="Confirm your hotel reservation."),
            W("sightseeing", "/ˈsaɪtˌsiː.ɪŋ/", "n.", " du lịch ", example="Sightseeing filled the afternoon."),
            W("souvenir", "/ˌsuː.vəˈnɪə/", "n.", " quà lưu niệm ", example="She bought a local souvenir."),
            W("passport", "/ˈpɑːs.pɔːt/", "n.", " hộ chiếu ", example="Keep your passport safe."),
            W("visa", "/ˈviː.zə/", "n.", " thị thực ", example="Apply for a tourist visa early."),
            W("luggage", "/ˈlʌɡ.ɪdʒ/", "n.", " hành lý ", example="Airline luggage limits apply."),
            W("delay", "/dɪˈleɪ/", "n.", " hoãn lại ", example="Fog caused a flight delay."),
            W("commuter", "/kəˈmjuː.tə/", "n.", " đi làm người mà ", example="Commuters packed the platform."),
            W("congestion", "/kənˈdʒes.tʃən/", "n.", " trở nên tắc nghẽn ", example="Road congestion wastes time."),
            W("infrastructure", "/ˈɪn.frəˌstrʌk.tʃə/", "n.", " cơ sở hạ tầng ", example="Rail infrastructure needs investment."),
            W("public transport", "/ˌpʌb.lɪk ˈtræn.spɔːt/", "n.", " giao thông công cộng ", example="Public transport cuts emissions."),
            W("pedestrian", "/pəˈdes.tri.ən/", "n.", " người đi bộ ", example="Pedestrians use the zebra crossing."),
            W("highway", "/ˈhaɪ.weɪ/", "n.", " đường cao tốc ", example="The highway links two cities."),
            W("ferry", "/ˈfer.i/", "n.", " phà ", example="Take the ferry to the island."),
            W("cruise", "/kruːz/", "n.", " tàu biển lớn du lịch ", example="They booked a Mediterranean cruise."),
            W("backpacker", "/ˈbækˌpæk.ə/", "n.", " khách du lịch ba lô ", example="Backpackers prefer hostels."),
            W("eco-tourism", "/ˈiː.kəʊ ˌtʊə.rɪ.zəm/", "n.", " du lịch sinh thái ", example="Eco-tourism protects local habitats."),
            W("attraction", "/əˈtræk.ʃən/", "n.", " điểm du lịch ", " lực hút ", example="The castle is the main attraction."),
            W("departure", "/dɪˈpɑː.tʃə/", "n.", " khởi hành ", " rời cảng ", example="Departure is at 9 a.m."),
            W("arrival", "/əˈraɪ.vəl/", "n.", " đạt đến ", example="Arrival boards show gate changes."),
            W("customs", "/ˈkʌs.təmz/", "n.", " hải quan ", example="Declare goods at customs."),
            W("jet lag", "/ˈdʒet ˌlæɡ/", "n.", " chênh lệch múi giờ phản ứng ", example="Jet lag makes sleep difficult."),
            W("scenic", "/ˈsiː.nɪk/", "adj.", " phong cảnh duyên dáng của ", example="Drive the scenic coastal road."),
            W("overcrowded", "/ˌəʊ.vəˈkraʊ.dɪd/", "adj.", " quá mức đông đúc của ", example="Trains are overcrowded at rush hour."),
            W("timetable", "/ˈtaɪmˌteɪ.bəl/", "n.", " thời gian biểu ", example="Check the bus timetable."),
            W("fare", "/feə/", "n.", " tiền vé xe ", " giá vé ", example="The subway fare is cheap."),
            W("hospitality", "/ˌhɒs.pɪˈtæl.ə.ti/", "n.", " ngành dịch vụ ăn uống ", " hiếu khách ", example="Hospitality jobs rise in summer."),
        ],
    },
    {
        "id": "culture",
        "no": 8,
        "title": " văn hóa biến thể của | nghệ thuật ",
        "category": "society",
        "desc": " nghệ thuật, truyền thống, lễ hội biến thể của | di sản văn hóa ",
        "words": [
            W("heritage", "/ˈher.ɪ.tɪdʒ/", "n.", " di sản ", example="The temple is cultural heritage."),
            W("tradition", "/trəˈdɪʃ.ən/", "n.", " truyền thống ", example="The festival keeps old traditions."),
            W("ceremony", "/ˈser.ɪ.mə.ni/", "n.", " nghi thức ", example="Graduation is a formal ceremony."),
            W("exhibition", "/ˌek.sɪˈbɪʃ.ən/", "n.", " trưng bày ", example="The exhibition opens next week."),
            W("gallery", "/ˈɡæl.ər.i/", "n.", " phòng trưng bày nghệ thuật ", example="Local artists show work in the gallery."),
            W("sculpture", "/ˈskʌlp.tʃə/", "n.", " bức tượng ", example="The sculpture stands in the square."),
            W("architecture", "/ˈɑː.kɪ.tek.tʃə/", "n.", " xây dựng ", example="Modern architecture uses glass."),
            W("literature", "/ˈlɪt.ər.ə.tʃə/", "n.", " văn học ", example="She studies English literature."),
            W("folklore", "/ˈfəʊk.lɔː/", "n.", " truyền thuyết dân gian ", example="Folklore explains local customs."),
            W("ritual", "/ˈrɪtʃ.u.əl/", "n.", " nghi thức ", " quy ước ", example="Tea drinking is a daily ritual."),
            W("multicultural", "/ˌmʌl.tiˈkʌl.tʃər.əl/", "adj.", " đa văn hóa của ", example="London is a multicultural city."),
            W("identity", "/aɪˈden.tə.ti/", "n.", " nhân dạng ", " tán thành ", example="Language shapes cultural identity."),
            W("custom", "/ˈkʌs.təm/", "n.", " phong tục xã hội ", example="Bowing is a Japanese custom."),
            W("festival", "/ˈfes.tɪ.vəl/", "n.", " ngày lễ ", " lễ hội âm nhạc ", example="The film festival attracts tourists."),
            W("performance", "/pəˈfɔː.məns/", "n.", " diễn ", " thể hiện ", example="The dance performance was brilliant."),
            W("audience", "/ˈɔː.di.əns/", "n.", " khán giả ", example="The audience applauded loudly."),
            W("masterpiece", "/ˈmɑː.stə.piːs/", "n.", " kiệt tác ", example="The painting is a masterpiece."),
            W("preserve", "/prɪˈzɜːv/", "v.", " Lưu ", " bảo vệ ", example="Museums preserve ancient objects."),
            W("contemporary", "/kənˈtem.pər.ər.i/", "adj.", " thời đại hiện tại của ", example="Contemporary art can be abstract."),
            W("aesthetic", "/esˈθet.ɪk/", "adj.", " thẩm mỹ của ", " mỹ học của ", example="The design has aesthetic appeal."),
            W("craftsmanship", "/ˈkrɑːfts.mən.ʃɪp/", "n.", " thủ công mỹ nghệ ", example="Fine craftsmanship takes years."),
            W("orchestra", "/ˈɔː.kɪ.strə/", "n.", " dàn nhạc ", example="The orchestra played Mozart."),
            W("cinema", "/ˈsɪn.ə.mə/", "n.", " phim ", " rạp chiếu phim ", example="Independent cinema needs support."),
            W("drama", "/ˈdrɑː.mə/", "n.", " một vở kịch ", example="School drama builds confidence."),
            W("mythology", "/mɪˈθɒl.ə.dʒi/", "n.", " truyền thuyết ", example="Greek mythology inspires writers."),
            W("artefact", "/ˈɑː.tɪ.fækt/", "n.", " di tích văn hóa ", " nhân tạo sản phẩm ", example="The artefact was found in a tomb."),
            W("renaissance", "/rɪˈneɪ.səns/", "n.", " thời kỳ Phục Hưng ", example="The Renaissance changed European art."),
            W("calligraphy", "/kəˈlɪɡ.rə.fi/", "n.", " thư pháp ", example="Chinese calligraphy is taught in schools."),
            W("costume", "/ˈkɒs.tjuːm/", "n.", " trang phục ", " biến thể của | quần áo ", example="Traditional costumes appear in parades."),
            W("diversity", "/daɪˈvɜː.sə.ti/", "n.", " sự đa dạng ", example="Cultural diversity enriches cities."),
        ],
    },
    {
        "id": "crime",
        "no": 9,
        "title": " phạm tội biến thể của | pháp luật ",
        "category": "society",
        "desc": " trị an, tư pháp biến thể của | xã hội trật tự ",
        "words": [
            W("crime", "/kraɪm/", "n.", " phạm tội ", example="Street crime fell last year."),
            W("criminal", "/ˈkrɪm.ɪ.nəl/", "n.", " tội phạm ", example="The criminal was arrested."),
            W("offence", "/əˈfens/", "n.", " bất hợp pháp hành động ", " xúc phạm ", example="Speeding is a traffic offence."),
            W("punishment", "/ˈpʌn.ɪʃ.mənt/", "n.", " hình phạt ", example="Fair punishment deters crime."),
            W("prison", "/ˈprɪz.ən/", "n.", " nhà tù ", example="He spent two years in prison."),
            W("sentence", "/ˈsen.təns/", "n.", " phán quyết ", " câu ", example="The judge passed a long sentence."),
            W("trial", "/ˈtraɪ.əl/", "n.", " phiên tòa ", example="The trial lasted three weeks."),
            W("jury", "/ˈdʒʊə.ri/", "n.", " bồi thẩm đoàn ", example="The jury reached a verdict."),
            W("witness", "/ˈwɪt.nəs/", "n.", " nhân chứng ", example="A witness saw the accident."),
            W("evidence", "/ˈev.ɪ.dəns/", "n.", " bằng chứng ", example="Police collected DNA evidence."),
            W("suspect", "/ˈsʌs.pekt/", "n.", " một người bị tình nghi ", example="Police questioned the suspect."),
            W("victim", "/ˈvɪk.tɪm/", "n.", " thương vong ", example="Support centres help victims."),
            W("theft", "/θeft/", "n.", " ăn trộm ", example="Bike theft is common on campus."),
            W("burglary", "/ˈbɜː.ɡlər.i/", "n.", " đi vào phòng ăn trộm ", example="Burglary rates dropped after cameras."),
            W("fraud", "/frɔːd/", "n.", " lừa đảo ", example="Online fraud targets the elderly."),
            W("corruption", "/kəˈrʌp.ʃən/", "n.", " tham nhũng ", example="Anti-corruption laws were tightened."),
            W("legislation", "/ˌledʒ.ɪˈsleɪ.ʃən/", "n.", " ban hành luật ", " luật pháp ", example="New legislation bans plastic bags."),
            W("enforce", "/ɪnˈfɔːs/", "v.", " thực hiện ", " ép buộc thực hiện ", example="Police enforce traffic rules."),
            W("illegal", "/ɪˈliː.ɡəl/", "adj.", " bất hợp pháp của ", example="Illegal parking blocks exits."),
            W("justice", "/ˈdʒʌs.tɪs/", "n.", " tư pháp ", " công bằng ", example="Equal justice protects citizens."),
            W("rehabilitation", "/ˌriː.həˌbɪl.ɪˈteɪ.ʃən/", "n.", " cải tạo ", " hồi phục ", example="Rehabilitation reduces reoffending."),
            W("deterrent", "/dɪˈter.ənt/", "n.", " răn đe ", example="Cameras act as a deterrent."),
            W("surveillance", "/səˈveɪ.ləns/", "n.", " giám sát ", example="City surveillance covers stations."),
            W("convict", "/kənˈvɪkt/", "v.", " kết tội ", example="The court convicted the thief."),
            W("innocent", "/ˈɪn.ə.sənt/", "adj.", " vô tội của ", example="Evidence proved he was innocent."),
            W("guilty", "/ˈɡɪl.ti/", "adj.", " có tội của ", example="The defendant pleaded guilty."),
            W("bail", "/beɪl/", "n.", " cho tại ngoại ", example="He was released on bail."),
            W("prosecute", "/ˈprɒs.ɪ.kjuːt/", "v.", " khởi kiện ", example="Authorities prosecute serious crimes."),
            W("law-abiding", "/ˈlɔː.əˌbaɪ.dɪŋ/", "adj.", " tuân thủ pháp luật của ", example="Most citizens are law-abiding."),
            W("juvenile", "/ˈdʒuː.vən.aɪl/", "adj.", " thanh thiếu niên của ", example="Juvenile crime needs special care."),
        ],
    },
    {
        "id": "animals",
        "no": 10,
        "title": " động thực vật ",
        "category": "nature",
        "desc": " Sinh học, môi trường sống biến thể của | tự nhiên bảo vệ ",
        "words": [
            W("species", "/ˈspiː.ʃiːz/", "n.", " loài ", example="Many species face extinction."),
            W("mammal", "/ˈmæm.əl/", "n.", " động vật có vú ", example="Whales are marine mammals."),
            W("reptile", "/ˈrep.taɪl/", "n.", " bò sát ", example="Snakes are cold-blooded reptiles."),
            W("insect", "/ˈɪn.sekt/", "n.", " côn trùng ", example="Bees are vital pollinating insects."),
            W("predator", "/ˈpred.ə.tə/", "n.", " loài săn mồi ", example="Lions are apex predators."),
            W("prey", "/preɪ/", "n.", " con mồi ", example="Gazelles are prey for big cats."),
            W("migrate", "/maɪˈɡreɪt/", "v.", " di cư ", example="Birds migrate south in winter."),
            W("habitat", "/ˈhæb.ɪ.tæt/", "n.", " môi trường sống ", example="Wetlands are rich habitats."),
            W("extinct", "/ɪkˈstɪŋkt/", "adj.", " tuyệt chủng của ", example="Dodos are extinct."),
            W("endangered", "/ɪnˈdeɪn.dʒəd/", "adj.", " bị đe doạ của ", example="Tigers remain endangered."),
            W("breed", "/briːd/", "v.", " sinh sản ", example="Pandas breed slowly in the wild."),
            W("vegetation", "/ˌvedʒ.əˈteɪ.ʃən/", "n.", " thảm thực vật ", example="Dense vegetation covers the hills."),
            W("photosynthesis", "/ˌfəʊ.təʊˈsɪn.θə.sɪs/", "n.", " quang hợp ", example="Leaves use photosynthesis for energy."),
            W("pollinate", "/ˈpɒl.ə.neɪt/", "v.", " thụ phấn ", example="Bees pollinate fruit trees."),
            W("wildlife", "/ˈwaɪld.laɪf/", "n.", " động vật hoang dã ", example="National parks protect wildlife."),
            W("domestic", "/dəˈmes.tɪk/", "adj.", " nuôi trong nhà của ", " nội địa của ", example="Cats are domestic animals."),
            W("livestock", "/ˈlaɪv.stɒk/", "n.", " gia súc ", example="Drought harms livestock farms."),
            W("flora", "/ˈflɔː.rə/", "n.", " hệ thực vật ", example="Island flora is unique."),
            W("fauna", "/ˈfɔː.nə/", "n.", " động vật biến thể của ", example="Desert fauna adapts to heat."),
            W("organism", "/ˈɔː.ɡən.ɪ.zəm/", "n.", " Sinh học ", " sinh vật ", example="Microscopic organisms live in soil."),
            W("evolution", "/ˌiː.vəˈluː.ʃən/", "n.", " tiến hóa ", example="Evolution explains species change."),
            W("adaptation", "/ˌæd.əpˈteɪ.ʃən/", "n.", " thích nghi ", example="Camels show desert adaptation."),
            W("camouflage", "/ˈkæm.ə.flɑːʒ/", "n.", " giả vờ ", example="Chameleons use camouflage."),
            W("hibernation", "/ˌhaɪ.bəˈneɪ.ʃən/", "n.", " ngủ đông ", example="Bears enter hibernation in winter."),
            W("rainforest", "/ˈreɪnˌfɒr.ɪst/", "n.", " rừng mưa nhiệt đới ", example="Rainforests store huge carbon."),
            W("coral reef", "/ˈkɒr.əl ˌriːf/", "n.", " rạn san hô ", example="Warming damages coral reefs."),
            W("conservationist", "/ˌkɒn.səˈveɪ.ʃən.ɪst/", "n.", " bảo vệ môi trường người ", " chủ nghĩa bảo hộ người mà ", example="Conservationists lobby for parks."),
            W("captivity", "/kæpˈtɪv.ə.ti/", "n.", " nuôi trong chuồng ", example="Breeding in captivity can help."),
            W("food chain", "/ˈfuːd ˌtʃeɪn/", "n.", " chuỗi thức ăn ", example="Pollution enters the food chain."),
            W("ecosystem", "/ˈiː.kəʊˌsɪs.təm/", "n.", " hệ sinh thái ", example="Forests are complex ecosystems."),
        ],
    },
    {
        "id": "business",
        "no": 11,
        "title": " kinh tế biến thể của | kinh doanh ",
        "category": "academic",
        "desc": " khu chợ, thương mại, công ty biến thể của | tiêu thụ ",
        "words": [
            W("economy", "/ɪˈkɒn.ə.mi/", "n.", " Kinh tế ", example="The economy grew by two percent."),
            W("inflation", "/ɪnˈfleɪ.ʃən/", "n.", " lạm phát ", example="Inflation raises living costs."),
            W("recession", "/rɪˈseʃ.ən/", "n.", " suy thoái ", example="Jobs fall during a recession."),
            W("investment", "/ɪnˈvest.mənt/", "n.", " đầu tư ", example="Foreign investment creates factories."),
            W("profit", "/ˈprɒf.ɪt/", "n.", " lợi nhuận ", example="The firm reported higher profit."),
            W("revenue", "/ˈrev.ən.juː/", "n.", " thu vào ", " doanh số ", example="Online sales boost revenue."),
            W("budget", "/ˈbʌdʒ.ɪt/", "n.", " ngân sách ", example="Families set a monthly budget."),
            W("tax", "/tæks/", "n.", " thuế ", example="Income tax funds public services."),
            W("trade", "/treɪd/", "n.", " thương mại ", example="Global trade links markets."),
            W("export", "/ˈek.spɔːt/", "n.", " lối ra ", example="Coffee is a key export."),
            W("import", "/ˈɪm.pɔːt/", "n.", " nhập khẩu ", example="The country imports oil."),
            W("supply", "/səˈplaɪ/", "n.", " cung cấp ", example="Supply cannot meet demand."),
            W("demand", "/dɪˈmɑːnd/", "n.", " yêu cầu ", example="Demand for housing is high."),
            W("competition", "/ˌkɒm.pəˈtɪʃ.ən/", "n.", " cạnh tranh ", example="Competition lowers prices."),
            W("monopoly", "/məˈnɒp.əl.i/", "n.", " độc quyền ", example="A monopoly can hurt consumers."),
            W("startup", "/ˈstɑːt.ʌp/", "n.", " công ty khởi nghiệp ", example="The startup raised new funds."),
            W("shareholder", "/ˈʃeəˌhəʊl.də/", "n.", " cổ đông ", example="Shareholders vote at the AGM."),
            W("bankruptcy", "/ˈbæŋ.kr.rəpt.si/", "n.", " phá sản ", example="Poor cash flow caused bankruptcy."),
            W("interest rate", "/ˈɪn.trəst ˌreɪt/", "n.", " lãi suất ", example="Low interest rates encourage borrowing."),
            W("currency", "/ˈkʌr.ən.si/", "n.", " tiền tệ ", example="Tourists exchange currency at banks."),
            W("transaction", "/trænˈzæk.ʃən/", "n.", " giao dịch ", example="Online transactions need security."),
            W("marketing", "/ˈmɑː.kɪ.tɪŋ/", "n.", " tiếp thị ", example="Marketing targets young buyers."),
            W("brand", "/brænd/", "n.", " tên thương hiệu ", example="The brand expanded overseas."),
            W("retail", "/ˈriː.teɪl/", "n.", " bán lẻ ", example="Retail shops face online rivals."),
            W("wholesale", "/ˈhəʊl.seɪl/", "n.", " bán buôn ", example="Wholesale prices fell this quarter."),
            W("entrepreneurship", "/ˌɒn.trə.prəˈnɜː.ʃɪp/", "n.", " tinh thần khởi nghiệp ", example="Schools teach entrepreneurship."),
            W("outsourcing", "/ˈaʊtˌsɔː.sɪŋ/", "n.", " thuê ngoài ", example="Outsourcing cuts labour costs."),
            W("globalisation", "/ˌɡləʊ.bəl.aɪˈzeɪ.ʃən/", "n.", " toàn cầu hóa ", example="Globalisation links distant markets."),
            W("subsidy", "/ˈsʌb.sɪ.di/", "n.", " trợ cấp ", example="Farmers receive a government subsidy."),
            W("debt", "/det/", "n.", " nợ ", example="Student debt worries graduates."),
        ],
    },
    {
        "id": "urban",
        "no": 12,
        "title": " thành phố biến thể của | xây dựng ",
        "category": "topics",
        "desc": " đô thị hóa, nhà ở biến thể của | công cộng không gian ",
        "words": [
            W("urbanisation", "/ˌɜː.bən.aɪˈzeɪ.ʃən/", "n.", " đô thị hóa ", example="Urbanisation accelerates in Asia."),
            W("metropolis", "/məˈtrɒp.əl.ɪs/", "n.", " đô thị lớn ", example="Tokyo is a vast metropolis."),
            W("suburb", "/ˈsʌb.ɜːb/", "n.", " Jiaoqu ", example="Families move to quieter suburbs."),
            W("skyscraper", "/ˈskaɪˌskreɪ.pə/", "n.", " tòa nhà chọc trời ", example="Skyscrapers define the skyline."),
            W("infrastructure", "/ˈɪn.frəˌstrʌk.tʃə/", "n.", " cơ sở hạ tầng ", example="Aging infrastructure needs repair."),
            W("housing", "/ˈhaʊ.zɪŋ/", "n.", " nhà ở ", example="Affordable housing is scarce."),
            W("rent", "/rent/", "n.", " tiền thuê ", example="City rent keeps rising."),
            W("mortgage", "/ˈmɔː.ɡɪdʒ/", "n.", " thế chấp ", " cung cấp làm bảo đảm cho khoản vay cho vay tiền ", example="They took a 30-year mortgage."),
            W("construction", "/kənˈstrʌk.ʃən/", "n.", " xây dựng xây dựng ", example="Construction noise starts early."),
            W("demolish", "/dɪˈmɒl.ɪʃ/", "v.", " phá dỡ ", example="They will demolish the old factory."),
            W("renovation", "/ˌren.əˈveɪ.ʃən/", "n.", " tân trang ", example="Home renovation costs money."),
            W("landmark", "/ˈlænd.mɑːk/", "n.", " cột mốc ", example="The tower is a city landmark."),
            W("district", "/ˈdɪs.trɪkt/", "n.", " khu vực ", " khu hành chính ", example="The business district is crowded."),
            W("residential", "/ˌrez.ɪˈden.ʃəl/", "adj.", " nơi ở của ", example="Residential streets need slower traffic."),
            W("commercial", "/kəˈmɜː.ʃəl/", "adj.", " kinh doanh của ", example="Commercial zones allow shops."),
            W("overpopulation", "/ˌəʊ.vəˌpɒp.jəˈleɪ.ʃən/", "n.", " dân số quá mức ", example="Overpopulation strains water supplies."),
            W("slum", "/slʌm/", "n.", " nhà ổ chuột ", example="Slums lack basic services."),
            W("amenities", "/əˈmiː.nə.tiz/", "n.", " thuận tiện cơ sở vật chất ", example="Parks are important amenities."),
            W("pavement", "/ˈpeɪv.mənt/", "n.", " vỉa hè ", example="Keep bicycles off the pavement."),
            W("traffic jam", "/ˈtræf.ɪk ˌdʒæm/", "n.", " kẹt đường ", example="A traffic jam delayed the bus."),
            W("green space", "/ɡriːn speɪs/", "n.", " khu vực xanh ", example="Cities need more green space."),
            W("zoning", "/ˈzəʊ.nɪŋ/", "n.", " khu vực được phân bổ lập kế hoạch ", example="Zoning separates factories from homes."),
            W("high-rise", "/ˈhaɪ.raɪz/", "n.", " tòa nhà cao tầng ", example="High-rises house thousands."),
            W("underground", "/ˌʌn.dəˈɡraʊnd/", "n.", " đường sắt ngầm ", example="Take the underground to the museum."),
            W("crowded", "/ˈkraʊ.dɪd/", "adj.", " đông đúc của ", example="Stations are crowded at 8 a.m."),
            W("sprawl", "/sprɔːl/", "n.", " mất trật tự sự mở rộng ", example="Urban sprawl eats farmland."),
            W("facilities", "/fəˈsɪl.ə.tiz/", "n.", " cơ sở vật chất ", example="Sports facilities serve residents."),
            W("architecture", "/ˈɑː.kɪ.tek.tʃə/", "n.", " xây dựng phong cách ", " xây dựng ", example="Historic architecture draws tourists."),
            W("planning", "/ˈplæn.ɪŋ/", "n.", " lập kế hoạch ", example="City planning balances growth and nature."),
            W("neighbourhood", "/ˈneɪ.bə.hʊd/", "n.", " cộng đồng ", " khu phố ", example="The neighbourhood feels safe."),
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
    title = " Thứ%d Bài · %s" % (theme["no"], theme["title"])
    words_js = ",\n    ".join(word_js(w) for w in theme["words"])
    return """<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="exam:zone" content="study">
  <meta name="exam:subject" content="vocab-themes">
  <meta name="exam:title" content="%(title)s">
  <meta name="exam:description" content=" Kho từ theo chủ đề · %(desc)s">
  <title>%(title)s</title>
</head>
<body>
<!-- ponytail: thin shell - vocab-lesson.html parses wordData -->
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
        "sourceNote": "YYSD sáng tạo IELTS chủ đề kho từ; thông tin xây dựng học hỏi từ kinh nghiệm của người khác thường thấy phân loại từ điển(một bên hàng rào loại chính→chủ đề→mục từ điển), viết tắt của bên thứ ba biến thể cũ của | bề mặt bên ngoài nhân bản ",
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
