# Ghi nhận dữ liệu từ điển CVDICT

Tệp `cvdict-derived.json` trong thư mục này là **tác phẩm phái sinh** của:

- **CVDICT — Từ điển Hán Việt** của **Phong Phan**
  <https://github.com/ph0ngp/CVDICT>
  Giấy phép: **Creative Commons Attribution-ShareAlike 4.0 International**
  <https://creativecommons.org/licenses/by-sa/4.0/>
- CVDICT dựa trên **CC-CEDICT** (Paul Andrew Denisowski và cộng sự),
  <https://www.mdbg.net/chinese/dictionary?page=cc-cedict>.

## Phạm vi phái sinh

`scripts/fetch_cvdict.py` tải `CVDICT.u8` qua GitHub API, giữ **từ đầu mục giản thể** và **nghĩa tiếng Việt đầu tiên** của mỗi mục, rồi lọc bỏ các giải nghĩa còn kí tự CJK, dấu ngoặc không cân bằng và giải nghĩa chỉ có tiếng Anh. Kết quả gồm hai nhóm:

- `phrases`: các mục từ ≥ 2 kí tự, dùng để thay thế cụm dài nhất trước;
- `singles`: các mục một kí tự, dùng để giải nghĩa kí tự CJK còn sót lại.

Dữ liệu phái sinh được phân phối theo cùng giấy phép **CC BY-SA 4.0**. Tên tác giả, liên kết nguồn và giấy phép được giữ nguyên trong `meta` của tệp JSON và trong tài liệu này.

## Lưu ý về chất lượng

CVDICT dùng mô hình ngôn ngữ để dịch giải nghĩa từ CC-CEDICT, nên một số mục có thể thiếu tự nhiên. Vì vậy YYSD duy trì thêm `curated.txt` (571 câu/chuỗi giao diện được biên soạn tay) với **ưu tiên cao hơn** CVDICT. Các chuỗi văn bản dài trong ngân hàng đề cũ được giải nghĩa theo từ; `coverage-report.json` ghi lại để biên dịch viên rà soát tiếp.

## Tái tạo

```bash
python3 scripts/fetch_cvdict.py                  # tải lại từ GitHub
python3 scripts/fetch_cvdict.py --source /path/to/CVDICT.u8   # hoặc dùng bản lưu cục bộ
python3 scripts/build_vi_dictionary.py
python3 scripts/localize_vi.py --check --max-residual 0
```
