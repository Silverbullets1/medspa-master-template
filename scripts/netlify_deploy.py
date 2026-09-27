#!/usr/bin/env python3
"""Netlify digest deploy via pure REST API (no netlify-cli dependency).

Usage:
  NETLIFY_AUTH_TOKEN=nfp_xxx python3 scripts/netlify_deploy.py \
      --dir dist --create-site medspa-master-template

Creates the site if --create-site given (with automatic name fallbacks),
uploads every file in --dir using the sha256 digest method, waits for
state=ready, prints the live URL. Token never printed.
"""
import argparse
import hashlib
import json
import os
import sys
import time
import urllib.request
import urllib.error

API = 'https://api.netlify.com/api/v1'


def api(method, path, token, body=None, raw=None, ctype='application/json'):
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    req = urllib.request.Request(API + path, data=data, method=method)
    req.add_header('Authorization', f'Bearer {token}')
    if raw is not None:
        req.add_header('Content-Type', ctype)
    elif data is not None:
        req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            payload = r.read()
        return json.loads(payload) if payload.strip().startswith(b'{') or payload.strip().startswith(b'[') else {}
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors='replace')[:300]
        raise SystemExit(f'API {method} {path} -> {e.code}: {detail}')


def sha1_file(p):
    h = hashlib.sha1()
    with open(p, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 16), b''):
            h.update(chunk)
    return h.hexdigest()


def collect(d):
    files = {}
    for root, _dirs, names in os.walk(d):
        for n in names:
            full = os.path.join(root, n)
            rel = os.path.relpath(full, d).replace(os.sep, '/')
            files['/' + rel] = sha1_file(full)
    return files


def ensure_site(token, names):
    for name in names:
        try:
            site = api('POST', '/sites', token, {'name': name})
            print(f'SITE-CREATED {name}')
            return site
        except SystemExit as e:
            if '422' in str(e) or '409' in str(e):
                print(f'name taken: {name}, trying next...')
                continue
            raise
    # fall back to random name
    site = api('POST', '/sites', token, {})
    print(f'SITE-CREATED auto: {site["name"]}')
    return site


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dir', default='dist')
    ap.add_argument('--site-id', default=os.environ.get('NETLIFY_SITE_ID'))
    ap.add_argument('--create-site')
    args = ap.parse_args()

    token = os.environ.get('NETLIFY_AUTH_TOKEN')
    if not token:
        raise SystemExit('NETLIFY_AUTH_TOKEN env required')

    if not args.site_id and args.create_site:
        base = args.create_site
        site = ensure_site(token, [base, f'{base}-devilx', f'{base}-live'])
    elif args.site_id:
        site = api('GET', f'/sites/{args.site_id}', token)
    else:
        raise SystemExit('need --site-id or --create-site')

    files = collect(args.dir)
    if not files:
        raise SystemExit(f'no files in {args.dir}')
    dep = api('POST', f'/sites/{site["id"]}/deploys', token,
              {'files': files, 'async': False})
    required = set(dep.get('required', []))
    sha_to_path = {sha: path for path, sha in files.items()}
    uploaded = 0
    for sha in required:
        path = sha_to_path.get(sha)
        if not path:
            continue
        with open(os.path.join(args.dir, path.lstrip('/')), 'rb') as f:
            api('PUT', f'/deploys/{dep["id"]}/files{path}', token, raw=f.read())
        uploaded += 1
    state = None
    for i in range(40):
        state = api('GET', f'/deploys/{dep["id"]}', token).get('state')
        if state == 'ready':
            break
        if state in ('error',):
            raise SystemExit('deploy entered error state')
        time.sleep(2)
    print(json.dumps({
        'site': site['name'],
        'url': site.get('ssl_url'),
        'deploy_state': state,
        'files_uploaded': uploaded,
        'deploy_id': dep['id'],
    }))


if __name__ == '__main__':
    main()
