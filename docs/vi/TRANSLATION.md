# Quy tắc dịch thuật và bản địa hoá

## Phạm vi

Mọi nội dung người dùng nhìn thấy trong `vi/` phải là tiếng Việt:

- tiêu đề trang, mô tả, nhãn nút, thông báo lỗi, trạng thái rỗng;
- ngân hàng câu hỏi, đáp án, phần giải thích;
- tài liệu PDF, phần tóm tắt và trích dẫn trong thư viện;
- tên huy hiệu, nhiệm vụ, hạng đấu, cấp độ;
- văn bản trợ năng (`aria-label`, `sr-only`).

Chỉ giữ nguyên tiếng Anh cho: thuật ngữ IELTS gốc (*Listening*, *Writing Task 2*), tên riêng, tiêu đề bài báo
khoa học trong danh mục trích dẫn và mã định danh kỹ thuật.

## Quy ước viết

- Xưng hô **bạn** — người học; giọng khích lệ, ngắn gọn.
- Số đếm dùng dấu phẩy thập phân kiểu Việt: `1,5`; phân cách nghìn bằng dấu chấm: `1.000`.
- Ngày tháng dạng `18/11/2026`; thứ trong tuần viết đủ: `Thứ Hai` … `Chủ Nhật`.
- Không dùng từ ngoại lai khi đã có từ Việt tương đương: *streak* → **chuỗi ngày học**, *league* → **hạng đấu**,
  *quest* → **nhiệm vụ**, *hearts* → **trái tim**, *gems* → **đá quý**.
- Dấu câu: dùng dấu phẩy trước `và`, `nhưng` khi nối hai mệnh đề dài; không đặt dấu cách trước dấu chấm/phẩy.

## Cách thêm chuỗi mới

```js
// vi/assets/js/i18n.js
export const STRINGS = {
  vi: {
    "lesson.correct": "Chính xác!",
    "lesson.correctWith": "Chính xác! Đáp án đúng là “{answer}”."
  }
};
```

```js
t("lesson.correctWith", { answer: "flourishing" });
```

- Khoá theo mẫu `khu-vực.mục` (dấu chấm), giá trị tiếng Việt có dấu đầy đủ.
- Mọi khoá mới phải có bài kiểm thử trong `tests/i18n.test.js`.
- Không nối chuỗi bằng `+`; dùng nội suy `{}` để giữ trật tự từ tiếng Việt.

## Kiểm tra tự động

```bash
node vi/scripts/audit.mjs
```

Audit quét toàn bộ HTML và JSON dữ liệu, báo lỗi nếu phát hiện ký tự Hán (`\u4e00-\u9fff`) hoặc thiếu
`lang="vi"`. Khi thêm trang mới, hãy bổ sung tên tệp vào `PAGES` trong `vi/scripts/audit.mjs`.

## Giọng điệu theo ngữ cảnh

| Ngữ cảnh | Ví dụ |
| --- | --- |
| Động viên | “Tuyệt vời! Bạn đang giữ chuỗi 7 ngày.” |
| Sửa lỗi | “Chưa đúng. Đáp án đúng là “…” — vì …” |
| Cảnh báo | “Bạn đã hết trái tim. Chờ 25 phút hoặc dùng 50 đá quý.” |
| Trạng thái rỗng | “Chưa có tài liệu nào khớp bộ lọc.” |
