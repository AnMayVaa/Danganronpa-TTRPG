import os
import re

def test_tabs():
    html = open('index.html', encoding='utf-8').read()
    tabs = ['pTabGame', 'pTabClues', 'pTabMap', 'pTabGuide', 'pTabRules']
    for t in tabs:
        m = re.search(r'<button id=[\"\']' + t + r'[\"\'][^>]*>', html)
        assert m, f'Tag {t} not found'
        tag = m.group(0)
        is_hidden = 'display:none' in tag.replace(' ', '')
        print(f'{t}: initial hidden={is_hidden}')
        if t == 'pTabGame':
            assert not is_hidden, 'pTabGame should be visible initially'
        else:
            assert is_hidden, f'{t} should be hidden initially'

    print('HTML initial tab checks passed successfully!')

def test_manga_assets():
    dirs = ['assets/manga', 'public/assets/manga', 'web-minigame/public/assets/manga']
    for d in dirs:
        assert os.path.isdir(d), f'{d} not found'
        files = [f for f in os.listdir(d) if f.startswith('manga_') and f.endswith('.jpg')]
        assert len(files) == 20, f'{d} has {len(files)} files, expected 20'
        print(f'OK: {d} contains all {len(files)} manga images')

    with open('js/client.js', encoding='utf-8') as f:
        client_code = f.read()

    matches = re.findall(r'assets/manga/[a-zA-Z0-9_-]+\.jpg', client_code)
    assert len(matches) == 30, f'Expected 30 matches, got {len(matches)}'
    for m in set(matches):
        assert os.path.exists(m), f'File {m} does not exist!'
    print(f'OK: All {len(set(matches))} unique manga image references exist on disk')

if __name__ == '__main__':
    test_tabs()
    test_manga_assets()
    print('ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!')
