# A-Level Đề thi thậtnhà kho

họkỳ thi cuối kỳthử hẹp:**CAIE** · **Edexcel A Level** · **Oxford AQA A Level**

mục lụccấu trúc:

```
library/mock/alevel/
  caie/9709-mathematics/papers/
  edexcel/9ma0-mathematics/papers/
  oxford-aqa/7367-mathematics/papers/
```

PDF đặt tên:`{code}_{season}{yy}_{qp|ms}_{paper}.pdf`

- CAIE minh họa:`9709_s24_qp_12.pdf`
- Edexcel minh họa:`9MA0_s24_qp_01.pdf`
- Oxford AQA minh họa:`7367_w23_ms_02.pdf`

```bash
python3 scripts/seed_alevel_demo.py      # có sẵn demo
python3 scripts/build_alevel_catalog.py  # thay cũ đổi mới catalog
```

môn họcdanh sách mụcthấy `scripts/alevel_subjects.py`.
