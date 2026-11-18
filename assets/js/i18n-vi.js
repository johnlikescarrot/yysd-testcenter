/* Dịch giao diện YYSD sang tiếng Việt (vi) — chạy phía trình duyệt, không sửa nội dung đề thi tiếng Anh.
   Nguyên tắc: chuỗi giao diện Trung/Anh -> Việt; thuật ngữ IELTS giữ nguyên (Listening, Reading... kèm Việt). */
(function (global) {
  "use strict";
  var PHRASES = {
    "优益思达国际课程中心": "Trung tâm Khóa học Quốc tế YYSD", "优益思达": "YYSD",
    "首页": "Trang chủ", "主导航": "Điều hướng chính", "教师导航": "Điều hướng giáo viên", "菜单": "Trình đơn",
    "登录": "Đăng nhập", "去登录": "Đến đăng nhập", "退出": "Đăng xuất", "注册": "Đăng ký", "忘记密码？": "Quên mật khẩu?",
    "手机号": "Số điện thoại", "位中国大陆手机号": "số điện thoại", "至少 6 位": "ít nhất 6 ký tự", "获取验证码": "Nhận mã xác minh",
    "我的成绩": "Kết quả của tôi", "个人中心": "Hồ sơ cá nhân", "任务日历": "Lịch nhiệm vụ", "任务中心": "Trung tâm nhiệm vụ",
    "全部任务": "Tất cả nhiệm vụ", "待办事项": "Việc cần làm", "待办列表": "Danh sách việc cần làm", "近期待办": "Việc sắp tới",
    "任务详情": "Chi tiết nhiệm vụ", "课程日程": "Lịch học", "已完成": "Đã hoàn thành", "未完成": "Chưa hoàn thành", "待完成": "Chờ hoàn thành",
    "已逾期": "Đã quá hạn", "无安排": "Chưa có lịch", "截止": "Hạn nộp", "完成": "Hoàn thành", "状态": "Trạng thái",
    "单词区": "Khu Từ vựng", "练习区": "Khu Luyện tập", "真题区": "Khu Đề thi thật", "单词": "Từ vựng", "词汇": "Từ vựng",
    "单词闯关": "Thử thách từ vựng", "高中词汇": "Từ vựng THPT", "四级词汇": "Từ vựng CET-4", "分类词库": "Kho từ theo chủ đề",
    "错题本": "Sổ câu sai", "生词本": "Sổ từ mới", "词汇诊断": "Chẩn đoán từ vựng", "单词检测": "Kiểm tra từ vựng", "词书": "Sách từ",
    "阅读": "Đọc (Reading)", "写作": "Viết (Writing)", "听力": "Nghe (Listening)", "口语": "Nói (Speaking)",
    "练习": "Luyện tập", "真题": "Đề thi thật", "模考": "Thi thử", "口语模考": "Thi thử Nói", "剑桥雅思真题": "Đề Cambridge IELTS thật",
    "剑桥雅思": "Cambridge IELTS", "雅思": "IELTS", "新托福": "TOEFL mới", "国际课程": "Khóa học quốc tế", "学习中心": "Trung tâm học tập",
    "开始练习": "Bắt đầu luyện tập", "开始检测": "Bắt đầu kiểm tra", "开始": "Bắt đầu", "继续": "Tiếp tục", "提交": "Nộp bài",
    "下一题": "Câu tiếp theo", "下一句": "Câu tiếp theo", "上一题": "Câu trước", "返回": "Quay lại", "返回首页": "Về trang chủ",
    "返回登录": "Quay lại đăng nhập", "关闭": "Đóng", "查看全部": "Xem tất cả", "查看": "Xem", "进入": "Vào học", "刷新": "Làm mới",
    "正在加载": "Đang tải", "加载中": "Đang tải", "加载失败": "Tải thất bại", "请求失败": "Yêu cầu thất bại", "错误": "Lỗi",
    "正确": "Đúng", "正确答案": "Đáp án đúng", "未作答": "Chưa trả lời", "解析": "Giải thích", "详解": "Giải thích chi tiết",
    "进度": "Tiến độ", "用时": "Thời gian làm bài", "分钟": "phút", "题型": "Dạng bài", "选择题": "Trắc nghiệm",
    "发音": "Phát âm", "播放发音": "Phát phát âm", "停止录音": "Dừng ghi âm", "重新开始": "Làm lại từ đầu",
    "教师端": "Dành cho giáo viên", "我的学生": "Học viên của tôi", "学生": "Học viên", "老师": "Giáo viên", "教师": "Giáo viên",
    "学生分配": "Phân công học viên", "权限管理": "Quản lý phân quyền", "管理员": "Quản trị viên", "教务": "Giáo vụ",
    "平台主控台": "Bảng điều khiển nền tảng", "隐私政策": "Chính sách bảo mật", "用户协议": "Thỏa thuận người dùng",
    "用户服务协议": "Thỏa thuận dịch vụ", "投诉举报": "Khiếu nại / Báo cáo", "生成成绩单": "Tạo phiếu điểm",
    "写作批改": "Chấm bài Viết", "请先登录": "Vui lòng đăng nhập trước", "请先选择教师": "Vui lòng chọn giáo viên trước",
    "优秀": "Xuất sắc", "良好": "Tốt", "需加强": "Cần cải thiện", "全部": "Tất cả", "已选": "Đã chọn", "推荐": "Đề xuất",
    "即将上线": "Sắp ra mắt", "作业": "Bài tập", "单元": "Đơn vị bài học", "月历": "Lịch tháng", "周视图": "Xem theo tuần",
    "收起侧栏": "Thu gọn thanh bên", "快捷键": "Phím tắt", "下载": "Tải xuống", "上传": "Tải lên", "预览": "Xem trước",
    "高频": "Tần suất cao", "关联练习": "Bài luyện liên quan", "提醒事项": "Nhắc nhở", "辅导聊天": "Trò chuyện gia sư",
    "Home": "Trang chủ", "Dashboard": "Bảng điều khiển", "Login": "Đăng nhập", "Logout": "Đăng xuất", "Register": "Đăng ký",
    "Profile": "Hồ sơ", "Settings": "Cài đặt", "Submit": "Nộp bài", "Next": "Tiếp theo", "Back": "Quay lại",
    "Loading": "Đang tải", "Search": "Tìm kiếm", "Start": "Bắt đầu", "Continue": "Tiếp tục", "Finish": "Hoàn thành",
    "Score": "Điểm", "Result": "Kết quả", "Practice": "Luyện tập", "Vocabulary": "Từ vựng", "Teacher": "Giáo viên", "Student": "Học viên"
  };
  var KEYS = Object.keys(PHRASES).sort(function (a, b) { return b.length - a.length; });
  function translateText(text) {
    if (!text || typeof text !== "string") return text;
    var out = text;
    for (var i = 0; i < KEYS.length; i++) out = out.split(KEYS[i]).join(PHRASES[KEYS[i]]);
    return out;
  }
  var api = { PHRASES: PHRASES, translateText: translateText };
  global.YYSD_I18N_VI = api;
})(globalThis);
