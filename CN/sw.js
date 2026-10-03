/* PDF 缓存 Service Worker */
const CACHE_NAME = 'cn-pdf-v1';

/* ⚠️ 如果以后 PDF 更新了，把上面的 v1 改成 v2，缓存就会自动更新 */

self.addEventListener('install', e => {
  self.skipWaiting();
});

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

  /* 只缓存 CN 文件夹下的 PDF */
  if (!url.pathname.startsWith('/CN/') || !url.pathname.endsWith('.pdf')) return;

  e.respondWith(
    caches.open(CACHE_NAME).then(cache => {

      /* 处理 Range 请求（PDF.js 流式加载会用） */
      const rangeHeader = e.request.headers.get('range');

      return cache.match(url.pathname).then(async cached => {
        if (cached) {
          /* 命中缓存 */
          if (rangeHeader) {
            /* 有 range：从缓存里 slice 出来返回 206 */
            const buffer = await cached.arrayBuffer();
            const m = rangeHeader.match(/bytes=(\d+)-(\d*)/);
            if (m) {
              const start = parseInt(m[1], 10);
              const end = m[2] ? parseInt(m[2], 10) : buffer.byteLength - 1;
              const sliced = buffer.slice(start, end + 1);
              return new Response(sliced, {
                status: 206,
                statusText: 'Partial Content',
                headers: {
                  'Content-Type': 'application/pdf',
                  'Content-Range': `bytes ${start}-${end}/${buffer.byteLength}`,
                  'Content-Length': String(sliced.byteLength),
                  'Accept-Ranges': 'bytes',
                },
              });
            }
          }
          /* 无 range：直接返回完整缓存 */
          return cached;
        }

        /* 未命中缓存：正常请求，成功后写入缓存 */
        return fetch(e.request).then(resp => {
          /* 注意：只缓存完整响应（200），不缓存 206 分段 */
          if (resp && resp.status === 200 && resp.type !== 'opaque') {
            cache.put(url.pathname, resp.clone()).catch(() => {});
          }
          return resp;
        });
      });
    })
  );
});
