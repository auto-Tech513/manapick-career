"""Reproduce occupation income from pinned official XLSX files; standard library only."""
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET
from decimal import Decimal
from collections import Counter
import hashlib,json,re,unicodedata
ROOT=Path(__file__).resolve().parent.parent
NS={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
def cells(path):
    with ZipFile(path) as z:
        strings=[]
        if 'xl/sharedStrings.xml' in z.namelist():
            strings=[''.join((part.text or '') if part.tag.endswith('}t') else ''.join(t.text or '' for t in part.findall('s:t',NS)) if part.tag.endswith('}r') else '' for part in item) for item in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',NS)]
        xml=ET.fromstring(z.read('xl/worksheets/sheet1.xml')); result={}
        for c in xml.findall('.//s:sheetData/s:row/s:c',NS):
            v=c.find('s:v',NS); text=v.text if v is not None else None
            if c.get('t')=='s' and text is not None: text=strings[int(text)]
            elif c.get('t')=='inlineStr': text=''.join(c.find('s:is',NS).itertext())
            if text is not None: result[c.get('r')]=text
        return result
norm=lambda v:''.join(unicodedata.normalize('NFKC',str(v or '')).split())
files=[ROOT/'data/official-income/wage-2025-table1.xlsx',ROOT/'data/official-income/occupation-crosswalk-r8-3.xlsx']
w,c=map(cells,files)
assert '令和７年賃金構造基本統計調査' in w['D2']
assert '企業規模計（10人以上）'==w['D7'] and w['H10']=='千円' and w['J10']=='千円'
assert '男女計' in w['B11'] and w['B156'].strip().startswith('男') and w['B301'].strip().startswith('女')
assert c['A3']=='収録番号' and c['I3']=='賃金構造基本統計調査の職業分類'
stat_rows={}
for row in range(11,156):
    name=re.sub(r'^\s*男女計\s*','',w[f'B{row}']).strip()
    assert norm(name) not in stat_rows
    raw_monthly=Decimal(w[f'H{row}']); raw_bonus=Decimal(w[f'J{row}']); monthly=raw_monthly.quantize(Decimal('0.1')); bonus=raw_bonus.quantize(Decimal('0.1'))
    assert abs(raw_monthly-monthly)<Decimal('0.000000001') and abs(raw_bonus-bonus)<Decimal('0.000000001'), 'unexpected precision'
    annual=(monthly*12+bonus)*1000
    assert annual==annual.to_integral_value() and annual>0
    stat_rows[norm(name)]={'classificationName':name,'sourceSheet':'男女計、男、女','sourceRow':row,'monthlyCashThousandYen':str(monthly),'scheduledCashThousandYen':w[f'I{row}'],'annualBonusThousandYen':str(bonus),'annualizedMeanYen':int(annual),'meanAge':float(w[f'D{row}']),'estimatedWorkers':int(Decimal(w[f'K{row}'])*10),'cells':{'monthly':f'H{row}','bonus':f'J{row}','age':f'D{row}','workers':f'K{row}'}}
assert len(stat_rows)==145
mapping={}
for row in range(5,581):
    record=c.get(f'A{row}')
    if record and record.isdigit():
        assert record not in mapping
        mapping[record]={'name':c[f'B{row}'],'code':c.get(f'I{row}'),'classificationName':c.get(f'J{row}'),'crosswalkRow':row}
catalog=json.loads((ROOT/'content/job-catalog.json').read_text())['occupations']
assert len(mapping)==len(catalog)==556
groups={}; occupations=[]
for job in catalog:
    m=mapping[job['recordNumber']];assert norm(m['name'])==norm(job['name']),f"crosswalk name mismatch: {job['name']}"
    base={'catalogId':job['catalogId'],'recordNumber':job['recordNumber'],'name':job['name'],'crosswalkRow':m['crosswalkRow']}
    if not m['code'] or not m['classificationName']:
        occupations.append({**base,'status':'not_available','classificationCode':None,'reason':'公式の職業分類対応表に賃金統計の対応分類がありません。この資料から平均年収・中央値年収を算出できないため、他職種の値で補っていません。'})
    else:
        assert norm(m['classificationName']) in stat_rows,m
        group={**stat_rows[norm(m['classificationName'])],'classificationCode':m['code']}
        if m['code'] in groups: assert groups[m['code']]==group
        groups[m['code']]=group
        occupations.append({**base,'status':'available','classificationCode':m['code'],'scope':'official-linked-classification'})
result={'schemaVersion':1,'surveyYear':2025,'publishedAt':'2026-03-24','retrievedAt':'2026-10-27','method':'official-crosswalk-exact-normalized-name-and-arithmetic','humanReview':False,'population':'全国・男女計・企業規模計（10人以上）・一般労働者（短時間労働者以外）','formula':'(2025年6月のきまって支給する現金給与額 × 12 ＋ 年間賞与その他特別給与額) × 1000','unit':'JPY per year','annualMedian':{'status':'not_available','reason':'採用した職種第1表は平均給与額等を公表する表です。年収中央値を公表していないため、月給の中央値を年収中央値へ転用しません。'},'limitations':['対応する職種分類の平均年収換算であり、各職業だけの年収ではない場合があります。','2025年6月の給与と、原則2024年1〜12月の賞与等を組み合わせた換算値です。同一の2025暦年の実際の年収を直接集計した値ではありません。','税・社会保険料控除前の給与です。手取り、初任給、求人の提示額、個人の将来年収を示しません。','雇われて働く人の給与統計です。独立開業者の売上・事業所得や短時間労働者の収入を示しません。','資格保有者全体の所得とは異なります。税理士は公認会計士と同じ分類、弁護士は法務従事者の分類に対応します。'],'sources':[
 {'id':'wage-table','title':'令和7年賃金構造基本統計調査 一般労働者 職種第1表','url':'https://www.e-stat.go.jp/stat-search/files?layout=datalist&stat_infid=000040421116','downloadUrl':'https://www.e-stat.go.jp/stat-search/file-download?statInfId=000040421116&fileKind=4','file':str(files[0].relative_to(ROOT)),'sha256':hashlib.sha256(files[0].read_bytes()).hexdigest()},
 {'id':'crosswalk','title':'job tag 職業分類対応表（2026/3/17更新）','url':'https://shigoto.mhlw.go.jp/User/Top/TopicsDetail/584','downloadUrl':'https://sgteprdstaplog01.blob.core.windows.net/web-app-contents/documents/%E8%81%B7%E6%A5%AD%E5%88%86%E9%A1%9E%E5%AF%BE%E5%BF%9C%E8%A1%A8%EF%BC%88R8.3%EF%BC%89.xlsx','file':str(files[1].relative_to(ROOT)),'sha256':hashlib.sha256(files[1].read_bytes()).hexdigest()},
 {'id':'definition','title':'賃金構造基本統計調査 調査の概要・用語','url':'https://www.mhlw.go.jp/toukei/list/chinginkouzou_b.html'}],
 'statistics':list(groups.values()),'occupations':occupations}
import sys
serialized=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
if '--check' in sys.argv:
    assert (ROOT/'content/occupation-income.json').read_text()==serialized,'income JSON differs from pinned official workbooks'
else:
    (ROOT/'content/occupation-income.json').write_text(serialized)
print(json.dumps({'occupations':len(occupations),'status':dict(Counter(x['status'] for x in occupations)),'classificationGroups':len(groups)},ensure_ascii=False))
