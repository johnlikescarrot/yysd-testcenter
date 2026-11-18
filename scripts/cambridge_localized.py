"""Keep imported TEST data separate from a paper's reviewed Vietnamese player shell."""
import copy
import json
import re

if __package__:
    from .verify_cambridge_mock_pages import extract_test_object, groups, load_test
else:
    from verify_cambridge_mock_pages import extract_test_object, groups, load_test

HAN = re.compile('[\u3400-\u9fff]')


def write_paper(path, rendered_template, imported):
    data = copy.deepcopy(imported)
    current = path.read_text(encoding='utf-8') if path.is_file() else ''
    shell = rendered_template
    if re.search(r'<html\b[^>]*lang="vi(?:-VN)?"', current):
        # Keep this paper's own metadata, chart renderer, draft ID and result hooks;
        # copying another volume's shell can silently carry over its title or timer.
        shell = current
        previous = load_test(path)
        by_id = {(s['id'], g['kind'], q['id']): (q, g.get('answerSet'))
                 for s, g in groups(previous) for q in g['questions']}
        for section, group in groups(data):
            for q in group['questions']:
                old, answers = by_id.get((section['id'], group['kind'], q['id']), ({}, None))
                # A generic importer key mustn't replace a teacher's explanation
                # for the same question/answers. Substantive new feedback is reviewed.
                generic = re.fullmatch(r'(?:答案：[^\u3400-\u9fff]*|选两项（顺序不限）：[A-Z] 与 [A-Z])。',
                                       q.get('explain', ''))
                same = all(q.get(k) == old.get(k) for k in ('no', 'q', 'options', 'answer'))
                if generic and same and answers == group.get('answerSet') and old.get('explain'):
                    q['explain'] = old['explain']
    blob = json.dumps(data, ensure_ascii=False, indent=2)
    blob = re.sub(r'答案：([^\u3400-\u9fff"\n]*)。', r'Đáp án: \1.', blob)
    blob = re.sub(r'选两项（顺序不限）：([A-Z]) 与 ([A-Z])。',
                  r'Chọn hai đáp án, không phân biệt thứ tự: \1 và \2.', blob)
    for src, dst in [('原始图表待补', 'Chưa có biểu đồ gốc'), ('顺序不限', 'không phân biệt thứ tự'),
                     ('（此题请以 ___ and ___ 形式作答）', '(Trả lời theo mẫu ___ and ___)'),
                     ('（此题请以 ___ to ___ 形式作答）', '(Trả lời theo mẫu ___ to ___)')]:
        blob = blob.replace(src, dst)
    output = shell.replace(extract_test_object(shell), blob, 1)
    pending = HAN.search(output)
    if pending:
        excerpt = output[max(0,pending.start()-12):pending.end()+55]
        raise ValueError(f'{path.name}: translate new input before replacing this paper: {excerpt}')
    path.write_text(output, encoding='utf-8')
