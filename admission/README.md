# AI du học chấp nhận ứng viên vượt kỳ thi đầu vào đánh giá(admission con trai đưa vào sử dụng)

Next.js 14 + Prisma + Supabase Postgres(pgvector)+ đi qua công lý một nghìn hỏi(DashScope) 

## tài liệu giải thích

| con đường | tác động đến |
|------|------|
| `prisma/schema.prisma` | School / Case / UserQuery bề mặt bên ngoài cấu trúc |
| `prisma/migrations/.../migration.sql` | ngậm trong miệng `vector` mở rộng biến thể của | thiết lập bề mặt bên ngoài SQL |
| `scripts/catalog/` | Mỹ và Anh Canada Ma Cao tất cả môn học khắc gỗ(country/field/slug) |
| `scripts/seed-cases.ts` | upsert mục lục + mỗi mục cân trong cân đĩa hoặc trên cân 4 dải tổng hợp giảm mẫn cảm vụ việc |
| `scripts/import-gradcafe.ts` | giới thiệu vào GradCafe lịch sử thật tự thông báo(giảm mẫn cảm) |
| `scripts/apply-official-stats.ts` | viết đi vào có thể trích dẫn mở/tương tự tỷ lệ chấp nhận |
| `data/gradcafe_cs.csv` | GradCafe CS mở lịch sử tập dữ liệu |
| `data/official-stats.json` | mở tỷ lệ chấp nhận trích dẫn điều khoản và tiểu mục |
| `scripts/sync-embeddings.ts` | sẽ Case một văn bản chèn vào viết đi vào pgvector |
| `scripts/scrape_gradcafe.py` | có sẵn GradCafe nắm bắt kết cấu(đồng ý ngầm không cào) |
| `app/api/evaluate/route.ts` | đánh giá API: cứng bậc cửa → xác suất → tương tự vụ việc → một nghìn hỏi |
| `lib/qwen.ts` | DashScope Chat / Embedding |
| `lib/hard-gate.ts` / `probability.ts` / `similar.ts` / `resume.ts` | đánh giá con trai logic |
| `components/AdmissionEval.tsx` | trường học chi tiết đầu bên trong của đánh giá biểu mẫu biến thể của | kết trái tiết lộ |
| `lib/mock.ts` | phía trước Mock Kết quả(`NEXT_PUBLIC_USE_MOCK=1`) |

## địa phương di chuyển trên quỹ đạo

### 1. Supabase

1. thành lập mục → **Database → Extensions** → bắt đầu sử dụng `vector`
2. **Project Settings → Database** nhân bản liên kết xâu lại: 
   - `DATABASE_URL`: Transaction pooler(6543, Canada `?pgbouncer=true`)
   - `DIRECT_URL`: Session / Direct(5432)

### 2. môi trường biến số

```bash
cd admission
cp .env.example .env.local
# chỉnh sửa .env.local: DATABASE_URL, DIRECT_URL, DASHSCOPE_API_KEY
# trước cào UI có thể giữ NEXT_PUBLIC_USE_MOCK=1
```

### 3. lắp đặt biến thể của | di cư

```bash
npm install --registry=https://registry.npmmirror.com --ignore-scripts
# nội địa kéo từ phía máy khách Prisma Engine chậm biến thể cũ của |: 
PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma npx prisma generate

npx prisma migrate deploy
# có thể khai thác: npx prisma migrate dev
npm run seed
npm run apply:stats
npm run import:gradcafe
# có DASHSCOPE_API_KEY hoàng hậu lại đồng bộ vector: 
npm run sync:embeddings
```

### 4. khởi động

```bash
npm run dev
# http://localhost:3001
# Mock: mở bất kỳ /schools/mock-cmu bình luận ước lượng
# thật: NEXT_PUBLIC_USE_MOCK=0, và sử dụng seed hoàng hậu của trường học id
```

### 5. tự kiềm chế(không cần thiết DB)

```bash
npx tsx lib/check-eval.ts
```

## hiệu chuẩn động cơ(độ chính xác)

- xác suất biến thể của |«chạy nước rút/phối hoặc kết hôn/hòa vốn»do `lib/calibrate.ts` **khóa**(khóa học đại học hạng × mục có tính chọn lọc × GPA/chuyên môn phối hoặc kết hôn/sơ yếu lý lịch tín hiệu)
- một nghìn hỏi chỉ viết phân tích, **không thể thay đổi xác suất**
- Quay lại `range` khu vực giới hạn + `evidence` có thể đi ngược dòng dựa vào
- hiệu chuẩn có ưu tiên sử dụng `source=gradcafe` thật vụ việc; tổng hợp mẫu hầu như công nhân quay lại
- evidence tiết lộ mở tỷ lệ chấp nhận trích dẫn + GradCafe mẫu tỉ lệ
- sơ yếu lý lịch tán thành PDF / DOC / DOCX(macOS `textutil`)

## bí mật

- sơ yếu lý lịch hầu như tồn tại yêu cầu bộ nhớ trong Trung Quốc phân tích, không bỏ sót đĩa, không đi vào tài sản hoặc tiền mặt dự trữ nguyên văn
- `UserQuery` chỉ tồn tại cấu trúc biến thể của đặc điểm JSON
- GradCafe vụ việc đã giảm mẫn cảm(đi hộp thư/liên kết); tổng hợp vụ việc làm mẫu mô tả
