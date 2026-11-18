"""Vietnamese display labels for the listening/reading classification workbooks.

Workbook parsing uses the source labels; exercise IDs and group boundaries are
language-independent. Apply this only when exporting the learner/teacher index.
"""

LABELS = {
    '总结题': 'Tóm tắt', '判断题': 'Nhận định', '单选题': 'Chọn một đáp án',
    '多选题': 'Chọn nhiều đáp án', '段落匹配题': 'Ghép đoạn văn', '细节匹配题': 'Ghép chi tiết',
    '填空题': 'Điền vào chỗ trống', '选段意题': 'Ghép tiêu đề đoạn', '配对题': 'Nối thông tin',
    '地图题': 'Đọc bản đồ', '流程题': 'Hoàn thành sơ đồ quy trình', '简答题': 'Trả lời ngắn',
    '历史发展': 'Lịch sử và phát triển', '自然科技': 'Khoa học tự nhiên và công nghệ',
    '社会人文': 'Xã hội và nhân văn', '生态环保': 'Sinh thái và môi trường', '语言教育': 'Ngôn ngữ và giáo dục',
    '生物研究': 'Nghiên cứu sinh học', '财经商业': 'Tài chính và thương mại', '医疗健康': 'Y tế và sức khỏe',
    '求职': 'Tìm việc', '经营管理': 'Quản trị kinh doanh', '地理': 'Địa lý', '旅游': 'Du lịch',
    '日常生活': 'Đời sống hằng ngày', '建筑环境': 'Kiến trúc và môi trường', '健康医疗': 'Sức khỏe và y tế',
    '住宿': 'Chỗ ở', '运动': 'Thể thao', '图书馆': 'Thư viện', '保险': 'Bảo hiểm',
    '新生入学': 'Tân sinh viên', '作业讨论': 'Thảo luận bài tập', '人文社科': 'Khoa học xã hội và nhân văn',
    '生物': 'Sinh học', '课题研究': 'Nghiên cứu đề tài', '易': 'Dễ', '中': 'Trung bình', '难': 'Khó',
}


def display_taxonomy(data):
    for key in ('types', 'scenes', 'diffs'):
        data[key] = [LABELS.get(value, value) for value in data[key]]
    for row in data['parts'] + data['groups']:
        for field in ('qType', 'scene', 'diff'):
            if field in row:
                row[field] = LABELS.get(row[field], row[field])
    return data
