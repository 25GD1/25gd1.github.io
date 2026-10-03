/* PDF 缓存 SW —— 只在缓存命中时介入，绝不干扰首次加载 */
const CACHE_NAME = 'cn-pdf-v1';
/* ⚠️ PDF 更新时，把 v1 改成 v2 */
const PDF_PATH = '/CN/%E8%AF%AD%E6%96%87.pdf'; // /CN/语文.pdf 的 URL 编码形式

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.pathname !== PDF_PATH) return;

  const range = e.request.headers.get('range');

  /* 没有 range：完整下载请求（主脚本预取），下载并缓存 */
  if (!range) {
    e.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const hit = await cache.match(PDF_PATH);
        if (hit) return hit;

        const resp = await fetch(e.request);
        if (resp.status === 200) {
          const buf = await resp.arrayBuffer();
          const headers = {
            'Content-Type': 'application/pdf',
            'Content-Length': String(buf.byteLength),
            'Accept-Ranges': 'bytes',
          };
          await cache.put(PDF_PATH, new Response(buf, { status: 200, headers }));
          return new Response(buf, { status: 200, headers });
        }
        return resp;
      })
    );
    return;
  }

  /* 有 range：只有命中缓存才介入，否则完全放行 */
  e.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const hit = await cache.match(PDF_PATH);
      if (!hit) return fetch(e.request);

      const buf = await hit.arrayBuffer();
      const m = range.match(/bytes=(\d+)-(\d*)/);
      if (!m) return fetch(e.request);

      const start = parseInt(m[1], 10);
      const end = m[2] ? parseInt(m[2], 10) : buf.byteLength - 1;
      const sliced = buf.slice(start, end + 1);
      return new Response(sliced, {
        status: 206,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
          'Content-Length': String(sliced.byteLength),
          'Accept-Ranges': 'bytes',
        },
      });
    })
  );
});
