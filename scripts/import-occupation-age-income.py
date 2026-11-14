"""Build age-band income from the pinned official Table 5 XLSX; standard library only.

Source: 令和7年賃金構造基本統計調査 一般労働者 （職種）第5表 男女計
（職種（小分類）、年齢階級別 … 企業規模計（10人以上）block = columns D..K,
same layout as Table 1: H=きまって支給する現金給与額（千円）, J=年間賞与（千円）,
K=労働者数（十人）).

Verification gate: every classification's total row in Table 5 must reproduce
the Table 1 monthly/bonus already stored in content/occupation-income.json.
Age-band annualised values use the same formula as the main dataset:
(monthly * 12 + bonus) * 1000 yen. Bands published as "-" are omitted.
"""
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET
from decimal import Decimal
import hashlib, json, re, unicodedata

ROOT = Path(__file__).resolve().parent.parent
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def cells(path):
    with ZipFile(path) as z:
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            strings = [''.join(t.text or '' for t in item.iter() if t.tag.endswith('}t'))
                       for item in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si', NS)]
        xml = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        result = {}
        for c in xml.findall('.//s:sheetData/s:row/s:c', NS):
            v = c.find('s:v', NS)
            text = v.text if v is not None else None
            if c.get('t') == 's' and text is not None:
                text = strings[int(text)]
            elif c.get('t') == 'inlineStr':
                text = ''.join(c.find('s:is', NS).itertext())
            if text is not None:
                result[c.get('r')] = text
        return result


norm = lambda v: ''.join(unicodedata.normalize('NFKC', str(v or '')).split())
BAND_RE = re.compile(r'^(～19歳|\d+～\d+歳|70歳～)$')

t5_path = ROOT / 'data/official-income/wage-2025-table5.xlsx'
w = cells(t5_path)
assert '令和７年賃金構造基本統計調査' in w['D2']
assert w['D8'].startswith('企業規模計（10人以上）')
assert w['H11'].startswith('千円') and w['J11'].startswith('千円')

income = json.loads((ROOT / 'content/occupation-income.json').read_text())
by_name = {norm(s['classificationName']): s for s in income['statistics']}

# Parse: classification total rows have an unindented name in column B;
# following indented rows are its age bands until the next total row.
classifications = {}
current = None
row = 12
while True:
    raw = w.get(f'B{row}')
    if raw is None:
        if row > 400:
            break
        row += 1
        continue
    name_norm = norm(raw)
    # Band labels carry a kana reading for 歳 (サイ) in the source cells,
    # and NFKC turned the full-width tilde into ASCII; restore it for labels.
    band_label = re.sub(r'[ァ-ヶー]+$', '', name_norm).replace('~', '～')
    if band_label.startswith('～'):
        band_label = '～19歳' if band_label == '～19歳' else band_label
    if BAND_RE.match(band_label):
        if current is not None:
            monthly = w.get(f'H{row}')
            bonus = w.get(f'J{row}')
            workers = w.get(f'K{row}')
            if monthly not in (None, '-') and bonus not in (None, '-'):
                m = Decimal(monthly).quantize(Decimal('0.1'))
                b = Decimal(bonus).quantize(Decimal('0.1'))
                annual = int((m * 12 + b) * 1000)
                classifications[current]['bands'].append({
                    'band': band_label,
                    'annualizedMeanYen': annual,
                    'estimatedWorkers': int(Decimal(workers) * 10) if workers not in (None, '-') else None,
                })
    else:
        if name_norm not in by_name:
            # Two Table 5 name cells carry a kana reading appended to the name
            # (訪問介護従事者…, 自動車組立従事者…); strip a trailing katakana run.
            stripped = re.sub(r'[ァ-ヶー]+$', '', name_norm)
            if stripped in by_name:
                name_norm = stripped
        if name_norm in by_name:
            current = name_norm
            classifications[current] = {
                'classificationName': by_name[name_norm]['classificationName'],
                'classificationCode': by_name[name_norm]['classificationCode'],
                'totalMonthly': w.get(f'H{row}'),
                'totalBonus': w.get(f'J{row}'),
                'bands': [],
            }
        else:
            current = None
    row += 1
    if row > 3000:
        break

# Verification gate against Table 1 values already on the site.
verified = 0
for name_norm, entry in classifications.items():
    ref = by_name[name_norm]
    assert entry['totalMonthly'] is not None and entry['totalBonus'] is not None, entry
    assert Decimal(entry['totalMonthly']).quantize(Decimal('0.1')) == Decimal(ref['monthlyCashThousandYen']), \
        f"monthly mismatch: {entry['classificationName']}"
    assert Decimal(entry['totalBonus']).quantize(Decimal('0.1')) == Decimal(ref['annualBonusThousandYen']), \
        f"bonus mismatch: {entry['classificationName']}"
    verified += 1

missing = [s['classificationName'] for s in income['statistics']
           if norm(s['classificationName']) not in classifications]
print(f"classifications matched: {len(classifications)} / {len(income['statistics'])}")
print(f"table5-vs-table1 total verified: {verified}")
print(f"missing: {missing}")
assert not missing, "some classifications were not found in Table 5"

out = {
    'schemaVersion': 1,
    'surveyYear': 2025,
    'publishedAt': '2026-03-24',
    'retrievedAt': '2026-11-14',
    'population': '全国・男女計・企業規模計（10人以上）・一般労働者（短時間労働者以外）',
    'formula': '(2025年6月のきまって支給する現金給与額 × 12 ＋ 年間賞与その他特別給与額) × 1000',
    'note': '年齢階級別の値は、同じ統計分類について年齢階級ごとに集計した平均年収換算です。年代が上がると勤続年数も長くなるため、年齢だけの効果ではありません。公表値がない（-）階級は含みません。',
    'sources': [{
        'id': 'wage-table5',
        'title': '令和7年賃金構造基本統計調査 一般労働者 職種第5表',
        'url': 'https://www.e-stat.go.jp/stat-search/files?layout=datalist&stat_infid=000040421120',
        'downloadUrl': 'https://www.e-stat.go.jp/stat-search/file-download?statInfId=000040421120&fileKind=4',
        'file': 'data/official-income/wage-2025-table5.xlsx',
        'sha256': hashlib.sha256(t5_path.read_bytes()).hexdigest(),
    }],
    'classifications': [
        {'classificationCode': e['classificationCode'], 'classificationName': e['classificationName'], 'bands': e['bands']}
        for e in sorted(classifications.values(), key=lambda e: e['classificationCode'])
    ],
}
bands_total = sum(len(e['bands']) for e in out['classifications'])
print(f"age bands total: {bands_total}")
(ROOT / 'content/occupation-income-age.json').write_text(
    json.dumps(out, ensure_ascii=False, indent=1) + '\n')
print('written content/occupation-income-age.json')
