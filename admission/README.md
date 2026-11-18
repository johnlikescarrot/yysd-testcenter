# Hệ thống Đánh giá Cơ hội Trúng tuyển Du học bằng AI (Admission Subsystem)

Xây dựng trên nền tảng Next.js 14 + Prisma + Supabase Postgres (pgvector) + Mô hình ngôn ngữ Qwen / DashScope.

## Mô tả cấu trúc tệp tin

| Đường dẫn | Tác dụng |
|---|---|
| `prisma/schema.prisma` | Cấu trúc các bảng School / Case / UserQuery |
| `prisma/migrations/.../migration.sql` | Chứa phần mở rộng `vector` và câu lệnh tạo bảng SQL |
| `scripts/catalog/` | Danh mục ngành học tại Mỹ, Anh, Canada, Úc (country/field/slug) |
| `scripts/seed-cases.ts` | Nạp danh mục + mỗi ngành khoảng 4 hồ sơ mẫu đã khử định danh |
| `scripts/import-gradcafe.ts` | Nhập dữ liệu hồ sơ thực tế công khai từ GradCafe (đã ẩn danh) |
| `scripts/apply-official-stats.ts` | Cập nhật tỷ lệ trúng tuyển công khai / ước tính có thể trích dẫn |
| `data/gradcafe_cs.csv` | Tập dữ liệu lịch sử ngành Khoa học Máy tính công khai từ GradCafe |
| `data/official-stats.json` | Dữ liệu tỷ lệ trúng tuyển trích dẫn chính thức |
| `scripts/sync-embeddings.ts` | Tạo embedding cho văn bản hồ sơ và lưu vào pgvector |
| `scripts/scrape_gradcafe.py` | Bộ khung thu thập dữ liệu tùy chọn từ GradCafe (mặc định không chạy) |
| `app/api/evaluate/route.ts` | API đánh giá: ngưỡng điều kiện cứng → tính xác suất → tìm hồ sơ tương đồng → phân tích bằng AI |
| `lib/qwen.ts` | Kết nối DashScope Chat / Embedding (Qwen) |
| `lib/hard-gate.ts` / `probability.ts` / `similar.ts` / `resume.ts` | Logic đánh giá cơ hội trúng tuyển |
| `components/AdmissionEval.tsx` | Biểu mẫu đánh giá và hiển thị kết quả trên trang chi tiết trường học |
| `lib/mock.ts` | Dữ liệu giả lập phục vụ kiểm thử (`NEXT_PUBLIC_USE_MOCK=1`) |

## Hướng dẫn cài đặt và chạy cục bộ

### 1. Cấu hình Supabase

1. Tạo dự án trên Supabase → **Database → Extensions** → kích hoạt phần mở rộng `vector`.
2. Truy cập **Project Settings → Database** để sao chép chuỗi kết nối:
   - `DATABASE_URL`: Transaction pooler (cổng 6543, thêm tham số `?pgbouncer=true`).
   - `DIRECT_URL`: Kết nối trực tiếp Session / Direct (cổng 5432).

### 2. Thiết lập Biến môi trường

```bash
cd admission
cp .env.example .env.local
# Chỉnh sửa .env.local: điền DATABASE_URL, DIRECT_URL, DASHSCOPE_API_KEY
# Khi kiểm thử nhanh giao diện, có thể giữ nguyên NEXT_PUBLIC_USE_MOCK=1
```

### 3. Cài đặt phụ thuộc & Di chuyển cơ sở dữ liệu

```bash
npm install --registry=https://registry.npmmirror.com --ignore-scripts
# Trường hợp tải Prisma Engine bị chậm:
PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma npx prisma generate

npx prisma migrate deploy
# Hoặc khi phát triển tính năng mới: npx prisma migrate dev
npm run seed
npm run apply:stats
npm run import:gradcafe
# Sau khi đã có DASHSCOPE_API_KEY, thực hiện đồng bộ vector embedding:
npm run sync:embeddings
```

### 4. Khởi chạy ứng dụng

```bash
npm run dev
# Mở trình duyệt tại http://localhost:3001
# Chế độ Mock: xem trang đánh giá mẫu tại /schools/mock-cmu
# Chế độ thực tế: đặt NEXT_PUBLIC_USE_MOCK=0 và sử dụng ID trường sau khi nạp dữ liệu (seed)
```

### 5. Tự kiểm tra độc lập (Không cần kết nối CSDL)

```bash
npx tsx lib/check-eval.ts
```

## Động cơ Hiệu chuẩn & Độ chính xác

- Xác suất và phân loại nhóm trường «Mơ ước / Vừa sức / An toàn» (Reach / Match / Safety) được quản lý tập trung bởi `lib/calibrate.ts` (Xếp hạng đại học × Mức độ chọn lọc của ngành × Điểm GPA / Sự phù hợp chuyên ngành / Tín hiệu từ CV).
- Mô hình AI chỉ thực hiện nhiệm vụ phân tích định tính, **tuyệt đối không được tự ý thay đổi giá trị xác suất**.
- Trả về khoảng xác suất `range` kèm căn cứ dữ liệu `evidence` minh bạch có thể truy vết nguồn gốc.
- Quá trình hiệu chuẩn ưu tiên sử dụng hồ sơ thực tế từ `source=gradcafe`; hồ sơ tổng hợp chỉ đóng vai trò dự phòng khi thiếu dữ liệu.
- Mục `evidence` hiển thị tỷ lệ trúng tuyển chính thức có trích dẫn nguồn kèm phân bố tỷ lệ của các hồ sơ tương đồng từ GradCafe.
- Hỗ trợ tải lên hồ sơ cá nhân định dạng PDF / DOC / DOCX (chuyển đổi văn bản qua `textutil` trên macOS).

## Quyền riêng tư & Bảo mật dữ liệu

- Tệp hồ sơ / CV chỉ được đọc tạm thời trong bộ nhớ của tiến trình xử lý yêu cầu, hoàn toàn không lưu xuống ổ cứng và không lưu trữ bản gốc trong cơ sở dữ liệu.
- Bảng `UserQuery` chỉ lưu trữ các trường dữ liệu đặc trưng đã được cấu trúc hóa dưới dạng JSON.
- Toàn bộ hồ sơ trích xuất từ GradCafe đều đã được khử định danh (loại bỏ địa chỉ email, liên kết cá nhân); hồ sơ tổng hợp sử dụng mô tả mẫu tiêu chuẩn.
