import unittest,importlib.util,tempfile,json
from pathlib import Path
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('watch',Path(__file__).with_name('source-watch.py'));watch=importlib.util.module_from_spec(spec);spec.loader.exec_module(watch)
class Response:
 status=200;url='https://www.stat.go.jp/data/';headers={'Content-Type':'text/html'}
 def __enter__(self):return self
 def __exit__(self,*args):pass
 def read(self,*args):return b'<html><body>'+b'official source '*20+b'</body></html>'
class WatchTest(unittest.TestCase):
 def test_ignores_navigation_and_scripts(self):
  a=watch.normalise(b'<nav>one</nav><main>content</main><script>x</script>','text/html');b=watch.normalise(b'<nav>two</nav><main>content</main><script>y</script>','text/html');self.assertEqual(a,b)
 def test_error_keeps_baseline(self):
  with tempfile.TemporaryDirectory() as tmp:
   c=Path(tmp);p=c/'x.json';p.write_text('{"sha256":"original"}')
   with patch('urllib.request.urlopen',side_effect=OSError('offline')):r=watch.check({'id':'x','url':Response.url,'allowedHosts':['www.stat.go.jp']},c)
   self.assertEqual(r['status'],'error');self.assertEqual(json.loads(p.read_text())['sha256'],'original')
 def test_first_fetch_is_not_an_update(self):
  with tempfile.TemporaryDirectory() as tmp:
   with patch('urllib.request.urlopen',return_value=Response()):r=watch.check({'id':'x','url':Response.url,'allowedHosts':['www.stat.go.jp']},Path(tmp))
   self.assertEqual(r['status'],'baseline');self.assertFalse(r['humanReview'])
if __name__=='__main__':unittest.main()
