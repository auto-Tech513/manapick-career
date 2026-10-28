#!/usr/bin/env python3
"""Compare official HTML/PDF sources. Records retrieval/hash changes, never invents a review or edits editorial claims."""
import argparse,hashlib,json,re,sys,urllib.request,urllib.parse,urllib.error,datetime,concurrent.futures
from pathlib import Path
from html.parser import HTMLParser
class Text(HTMLParser):
 def __init__(self):super().__init__();self.parts=[];self.skip=0
 def handle_starttag(self,t,a):
  if t in ['script','style','noscript','nav','header','footer']:self.skip+=1
  if not self.skip:
   for key,value in a:
    if key in ['href','datetime'] and value:self.parts.append(key+'='+value)
 def handle_endtag(self,t):
  if t in ['script','style','noscript','nav','header','footer'] and self.skip:self.skip-=1
 def handle_data(self,s):
  if not self.skip:self.parts.append(s)
def normalise(data,content_type):
 if 'html' not in content_type:return data
 p=Text();p.feed(data.decode('utf-8',errors='replace'))
 return re.sub(r'\s+',' ',' '.join(p.parts)).strip().encode()
def check(source,cache):
 now=datetime.datetime.now(datetime.timezone.utc).isoformat();result={'id':source['id'],'url':source['url'],'retrievedAt':now,'method':'automated-fetch-sha256','humanReview':False,'normalizationVersion':2}
 oldpath=cache/(source['id']+'.json');old=json.loads(oldpath.read_text()) if oldpath.exists() else None
 try:
  req=urllib.request.Request(source['url'],headers={'User-Agent':'ManapickOfficialSourceWatch/1.0'})
  with urllib.request.urlopen(req,timeout=30) as response:
   final=response.url
   if urllib.parse.urlsplit(final).hostname not in source['allowedHosts']:raise ValueError('redirected outside official allowlist')
   data=response.read(5_000_001)
   if len(data)>5_000_000:raise ValueError('source exceeds 5 MB; no baseline overwritten')
   ctype=response.headers.get('Content-Type','');text=normalise(data,ctype)
   if b'_Incapsula_Resource' in data or b'Request unsuccessful' in data:raise ValueError('official site blocked automated retrieval; baseline preserved')
   if len(text)<100:raise ValueError('empty or unexpectedly short response')
   result.update(status='baseline' if old is None or old.get('normalizationVersion')!=2 else 'unchanged',httpStatus=response.status,finalUrl=final,sha256=hashlib.sha256(text).hexdigest(),bytes=len(data),previousSha256=old.get('sha256') if old else None,etag=response.headers.get('ETag'),lastModified=response.headers.get('Last-Modified'))
   if old and old.get('normalizationVersion')==2 and old['sha256']!=result['sha256']:result['status']='changed'
   # Retrieval time is distinct from publication/review dates. No editorial dates are modified.
   oldpath.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 except Exception as error:result.update(status='error',error=str(error),previousSha256=old.get('sha256') if old else None)
 return result
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--config',default='content/official-watch.json');parser.add_argument('--cache',default='work/source-watch');parser.add_argument('--output',default='work/source-watch-report.json');args=parser.parse_args()
 sources=json.loads(Path(args.config).read_text())
 if args.config=='content/official-watch.json':
  # Include newly researched employer sources without requiring a second manual list.
  registry=json.loads(Path('content/occupation-employers.json').read_text())
  for occupation in registry['items']:
   for i,employer in enumerate(occupation['employers'],1):
    url=employer['source']['url'];host=urllib.parse.urlsplit(url).hostname
    if urllib.parse.urlsplit(url).scheme!='https' or not host:raise ValueError('invalid employer source URL')
    sources.append({'id':f"employer-{occupation['catalogId']}-{i}",'url':url,'allowedHosts':[host]})
 cache=Path(args.cache);cache.mkdir(parents=True,exist_ok=True)
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(lambda s:check(s,cache),sources))
 report={'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'meaning':'Source bytes/text changed; meaning and article accuracy are not inferred. No human/viewing verification.','sources':results}
 out=Path(args.output);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({status:sum(r['status']==status for r in results) for status in ['baseline','unchanged','changed','error']}))
 return 1 if any(r['status']=='error' for r in results) else 0
if __name__=='__main__':sys.exit(main())
