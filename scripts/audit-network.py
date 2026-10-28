import urllib.request,urllib.parse,urllib.error,xml.etree.ElementTree as ET,json,concurrent.futures,time,re,hashlib,csv,statistics
from pathlib import Path
from html.parser import HTMLParser
OUT=Path('work/network-audit'); OUT.mkdir(exist_ok=True,parents=True)
CACHE=Path('work/network-audit/html'); CACHE.mkdir(exist_ok=True,parents=True)
HOSTS=['manapick.app','ai.manapick.app','license.manapick.app','career.manapick.app']
class Parser(HTMLParser):
 def __init__(self): super().__init__();self.links=[];self.scripts=[];self.canonical=[];self.noindex=False;self.title=False;self.titletext=''
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='a' and a.get('href'): self.links.append(a['href'])
  if tag=='script' and a.get('src'): self.scripts.append(a['src'])
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href'))
  if tag=='meta' and a.get('name')=='robots' and 'noindex' in a.get('content',''):self.noindex=True
  if tag=='title': self.title=True
 def handle_endtag(self,tag):
  if tag=='title':self.title=False
 def handle_data(self,data):
  if self.title:self.titletext+=data
class Redirects(urllib.request.HTTPRedirectHandler):
 def __init__(self):self.chain=[]
 def redirect_request(self,req,fp,code,msg,headers,newurl):self.chain.append({'status':code,'from':req.full_url,'to':newurl});return super().redirect_request(req,fp,code,msg,headers,newurl)
def fetch(url):
 h=Redirects();op=urllib.request.build_opener(h); start=time.perf_counter()
 try:
  with op.open(urllib.request.Request(url,headers={'User-Agent':'ManapickAudit/1.0'}),timeout=25) as r: body=r.read();status=r.status;final=r.url
  err=None
 except Exception as e: body=b'';status=getattr(e,'code',None);final=url;err=str(e)
 return {'url':url,'status':status,'finalUrl':final,'redirects':h.chain,'elapsedMs':round((time.perf_counter()-start)*1000,1),'bytes':len(body),'error':err},body
pages=[]
for host in HOSTS:
 url='https://'+host+'/sitemap.xml'; r,b=fetch(url);(OUT/(host+'-sitemap.xml')).write_bytes(b)
 try: urls=[e.text for e in ET.fromstring(b).iter() if e.tag.endswith('loc')]
 except: urls=[]
 if any(u.endswith('.xml') for u in urls):
  nested=[]
  for u in urls:
   rr,bb=fetch(u)
   try:nested +=[e.text for e in ET.fromstring(bb).iter() if e.tag.endswith('loc')]
   except: pass
  urls=nested
 pages+=urls
 print(host,len(urls),flush=True)
 metrics=[]
 for _ in range(3):
  rr,bb=fetch('https://'+host+'/');metrics.append(rr)
 (OUT/(host+'-http-three-runs.json')).write_text(json.dumps({'runs':metrics,'medianElapsedMs':statistics.median(x['elapsedMs'] for x in metrics),'method':'Python urllib GET full response, warm network, no browser throttling; not LCP/PSI'},indent=2))
 rr,bb=fetch('https://'+host+'/ads.txt');(OUT/(host+'-ads.txt')).write_bytes(bb)
# Include specified URL even if absent in sitemap
pages=list(dict.fromkeys(pages+['https://manapick.app/video/AETcTrEOu9A/']))
def audit(url):
 r,b=fetch(url);name=hashlib.sha256(url.encode()).hexdigest();(CACHE/(name+'.html')).write_bytes(b)
 p=Parser()
 try:p.feed(b.decode('utf-8'))
 except:pass
 s=b.decode('utf-8',errors='replace');r.update({'cache':name+'.html','title':p.titletext,'noindex':p.noindex,'canonical':p.canonical,'gaIds':list(set(re.findall(r'G-[A-Z0-9]{6,}',s)))})
 amazon=[];cross=[];internal=[]
 for a in p.links:
  u=urllib.parse.urljoin(url,a);parts=urllib.parse.urlsplit(u)
  if parts.scheme not in ['https','http']:continue
  if parts.hostname and ('amazon.' in parts.hostname or parts.hostname in ['amzn.to','amzn.asia']):amazon.append({'page':url,'href':u,'tag':urllib.parse.parse_qs(parts.query).get('tag',[''])[0],'shortened':parts.hostname in ['amzn.to','amzn.asia']})
  if parts.hostname in HOSTS:
   clean=urllib.parse.urlunsplit((parts.scheme,parts.netloc,parts.path,'',''))
   internal.append(clean)
   if parts.hostname !=urllib.parse.urlsplit(url).hostname:cross.append({'from':url,'to':u,'target':clean})
 return r,amazon,cross,internal
records=[];amazon=[];cross=[];targets=set()
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
 for i,(r,a,c,t) in enumerate(ex.map(audit,pages)):
  records.append(r);amazon+=a;cross+=c;targets.update(t)
  if i%100==0:print('pages',i,'/',len(pages),flush=True)
(OUT/'pages.json').write_text(json.dumps(records,ensure_ascii=False,indent=2));(OUT/'cross-site-links.json').write_text(json.dumps(cross,ensure_ascii=False,indent=2));(OUT/'amazon-links.json').write_text(json.dumps(amazon,ensure_ascii=False,indent=2))
for name,rows,fields in [('amazon-links',amazon,['page','href','tag','shortened']),('cross-site-links',cross,['from','to','target'])]:
 with (OUT/(name+'.csv')).open('w') as f:
  w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rows)
known={r['url']:r for r in records};extra=list(targets-set(known));print('extra targets',len(extra),flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
 for rr,bb in ex.map(fetch,extra):known[rr['url']]=rr
issues=[r for r in known.values() if r['status']!=200 or r['redirects']]
(OUT/'link-targets.json').write_text(json.dumps(list(known.values()),ensure_ascii=False,indent=2));(OUT/'link-issues.json').write_text(json.dumps(issues,ensure_ascii=False,indent=2))
summary={'pages':{h:len([r for r in records if urllib.parse.urlsplit(r['url']).hostname==h]) for h in HOSTS},'amazonTags':{},'crossSiteLinks':len(cross),'targetsChecked':len(known),'issues':len(issues)}
for h in HOSTS:
 tags={}
 for a in amazon:
  if urllib.parse.urlsplit(a['page']).hostname==h:tags[a['tag']]=tags.get(a['tag'],0)+1
 summary['amazonTags'][h]=tags
(OUT/'production-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2));print(summary,flush=True)

# Cloudflare email obfuscation requires JS and is reported separately, not classified as a broken content page.
import sys
failures=[r for r in issues if "/cdn-cgi/l/email-protection" not in r["url"]]
sys.exit(1 if failures else 0)
