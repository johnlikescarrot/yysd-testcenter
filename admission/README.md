# AI du học trúng tuyển ước định (admission tử hữu ích,thiết thực)

Next.js 14 + Prisma + Supabase Postgres (pgvector) + thông nghĩa nghìn hỏi (DashScope).

## văn bản tài liệu nói rõ

| đường nhỏ | tác dụng |
|------|------|
| `prisma/schema.prisma` | School / Case / UserQuery bề ngoài kết cấu |
| `prisma/migrations/.../migration.sql` | hàm `vector` mở rộng và xây dựng bề ngoài SQL |
| `scripts/catalog/` | Mỹ Anh thêm úc toàn kỹ năng lục (country/field/slug) |
| `scripts/seed-cases.ts` | upsert mục lục + mỗi hạng mục ước 4 đầu hợp thành cởi mẫn án lệ |
| `scripts/import-gradcafe.ts` | đạo nhập GradCafe Lịch sử chân thật tự báo (cởi mẫn) |
| `scripts/apply-official-stats.ts` | ghi nhập có thể trích dẫn công khai / xấp xỉ tỷ số trúng tuyển |
| `data/gradcafe_cs.csv` | GradCafe CS công khai Lịch sử số liệu tụ tập |
| `data/official-stats.json` | công khai tỷ số trúng tuyển trích dẫn điều mục |
| `scripts/sync-embeddings.ts` | đem Case văn bản khảm nhập ghi nhập pgvector |
| `scripts/scrape_gradcafe.py` | có thể chọn GradCafe trảo lấy khung xương (cam chịu không chạy) |
| `app/api/evaluate/route.ts` | ước định API: cứng rắn cánh cửa → xác suất → tương tự án lệ → nghìn hỏi |
| `lib/qwen.ts` | DashScope Chat / Embedding |
| `lib/hard-gate.ts` / `probability.ts` / `similar.ts` / `resume.ts` | ước định tử ăn khớp |
| `components/AdmissionEval.tsx` | trường học tình hình cụ thể và tỉ mỉ trang bên trong ước định danh sách và kết quả biểu hiện ra |
| `lib/mock.ts` | lối vào Mock kết quả (`NEXT_PUBLIC_USE_MOCK=1`) |

## bản địa vận hành

### 1. Supabase

1. sáng tạo hạng mục → **Database → Extensions** → bắt đầu dùng `vector`
2. **Project Settings → Database** phục chế liên tiếp chuỗi:
   - `DATABASE_URL`: Transaction pooler (6543, thêm `?pgbouncer=true`)
   - `DIRECT_URL`: Session / Direct (5432)

### 2. Môi trường lượng biến đổi

```bash
cd admission
cp.env.example.env.local
# biên tập.env.local: DATABASE_URL, DIRECT_URL, DASHSCOPE_API_KEY
# chạy trước UI có thể bảo trì NEXT_PUBLIC_USE_MOCK=1
```

### 3. lắp đặt và di chuyển

```bash
npm install --registry=https://registry.npmmirror.com --ignore-scripts
# trong nước kéo lấy Prisma Engine chậm lúc:
PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma npx prisma generate

npx prisma migrate deploy
# hoặc khai phát: npx prisma migrate dev
npm run seed
npm run apply:stats
npm run import:gradcafe
# có DASHSCOPE_API_KEY sau lại đồng bộ véc-tơ:
npm run sync:embeddings
```

### 4. khởi động

```bash
npm run dev
# http://localhost:3001
# Mock: mở ra tùy ý /schools/mock-cmu lời bình đánh giá
# chân thật: NEXT_PUBLIC_USE_MOCK=0, cùng sử dụng seed sau đích trường học id
```

### 5. tự kiểm (không cần DB)

```bash
npx tsx lib/check-eval.ts
```

## hiệu chỉnh động cơ (độ chuẩn xác)

- xác suất và « chạy nước rút / xứng đôi / giữ gốc » do `lib/calibrate.ts` ** tập trung ** (Đại học cấp bậc × hạng mục lựa chọn tính × GPA/ chuyên nghiệp xứng đôi / lý lịch sơ lược tín hiệu)
- nghìn hỏi chỉ viết phân tích, ** không thể sửa xác suất **
- Quay lại `range` khu lúc giữa + `evidence` có thể ngược dòng tìm hiểu căn cứ
- hiệu chỉnh ưu tiên sử dụng `source=gradcafe` chân thật án lệ; hợp thành hàng mẫu chỉ làm lui trở về
- evidence biểu hiện ra công khai tỷ số trúng tuyển trích dẫn + GradCafe hàng mẫu dẫn đầu
- lý lịch sơ lược hỗ trợ PDF / DOC / DOCX (macOS `textutil`)

## việc riêng tư

- lý lịch sơ lược chỉ tại thỉnh cầu bộ nhớ Vừa Giải thích đáp án, không rơi bàn, không vào tồn kho Bài gốc
- `UserQuery` chỉ tồn kết cấu hóa đặc thù JSON
- GradCafe án lệ đã cởi mẫn (đi hòm thư / kết nối); hợp thành án lệ là khuôn mô hình miêu tả
