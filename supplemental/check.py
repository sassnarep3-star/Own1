from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
p = Path(__file__).resolve().parent / 'index.html'
class Check(HTMLParser):
    def __init__(self): super().__init__(); self.in_row=False; self.cells=0; self.source=False; self.errors=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='tr': self.in_row=True; self.cells=0; self.source=False
        if self.in_row and tag=='td': self.cells+=1
        if tag in ('a','link'):
            ref=a.get('href',''); u=urlparse(ref)
            if self.in_row and u.scheme=='https': self.source=True
            if not u.scheme and not ref.startswith('#') and not (p.parent/ref).resolve().is_file(): self.errors.append('Missing local link: '+ref)
    def handle_endtag(self,tag):
        if tag=='tr':
            if self.cells and not self.source: self.errors.append('Data row lacks official source')
            self.in_row=False
c=Check(); c.feed(p.read_text()); assert not c.errors, c.errors
print('Supplement: local references and official source links pass.')
