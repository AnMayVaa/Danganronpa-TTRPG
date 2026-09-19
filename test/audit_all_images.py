import os
import re

files_to_check = ['index.html', 'js/client.js', 'css/style.css']
all_img_refs = set()

for fn in files_to_check:
    content = open(fn, encoding='utf-8').read()
    matches = re.findall(r'[\'\"\(]([^\'\"\(\)\s]*assets/[^\'\"\(\)\s]*\.(?:jpg|png|svg|webp|gif|jpeg))[\'\"\)]', content, re.IGNORECASE)
    for m in matches:
        all_img_refs.add(m)

print(f"Total unique image paths referenced: {len(all_img_refs)}")
print("=" * 60)

missing_count = 0
for ref in sorted(all_img_refs):
    clean_ref = ref.lstrip('/').replace('\\', '/')
    root_exists = os.path.exists(clean_ref)
    pub_exists = os.path.exists(os.path.join('public', clean_ref))
    web_exists = os.path.exists(os.path.join('web-minigame', 'public', clean_ref))
    if not (root_exists and pub_exists and web_exists):
        missing_count += 1
        print(f"ISSUE: {ref}")
        print(f"   root={root_exists} | public={pub_exists} | web={web_exists}")

print("=" * 60)
print(f"Total issues found: {missing_count}")
