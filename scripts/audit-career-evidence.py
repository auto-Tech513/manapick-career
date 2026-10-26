"""Check primary reference availability. A fetch is not a human/content review."""
import concurrent.futures
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError
root = Path(__file__).resolve().parent.parent
sources = json.loads((root / 'content/career-evidence.json').read_text())['sources']
def check(source):
    result = {'id': source['id'], 'url': source['url'], 'humanReview': False}
    try:
        request = Request(source['url'], headers={'User-Agent': 'manapick-career-evidence-check/1.0 (+https://career.manapick.app/about-method/)'})
        with urlopen(request, timeout=25) as response:
            data = response.read()
            result.update(status=response.status, finalUrl=response.url, bytes=len(data), sha256=hashlib.sha256(data).hexdigest(), result='reachable')
    except HTTPError as error:
        result.update(status=error.code, result='restricted' if error.code in (401,403,429) else 'broken' if error.code in (404,410) else 'unconfirmed')
    except Exception as error:
        result.update(result='unconfirmed', error=type(error).__name__)
    return result
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    results=list(pool.map(check, sources))
report={'generatedAt':datetime.now(timezone.utc).isoformat(), 'meaning':'Availability and bytes only; editorial claims and open recruitment are not certified by this check.', 'sources':results}
output=root/'work/career-evidence-audit.json';output.parent.mkdir(exist_ok=True);output.write_text(json.dumps(report,ensure_ascii=False,indent=2))
counts={kind:sum(row['result']==kind for row in results) for kind in ['reachable','restricted','broken','unconfirmed']}
print(json.dumps(counts));print(output)
for row in results:
    if row['result']!='reachable':print(row['id'], row)
raise SystemExit(1 if counts['broken'] else 0)
