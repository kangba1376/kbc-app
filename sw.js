const CACHE_NAME = 'kbc-v2.2'; // 每次修改 HTML 后，建议微调这个版本号
const ASSETS = [
  './',              // 缓存根目录访问
  './index.html',     // 缓存主文件
  './apple-touch-icon.png',
  './TibetWildYak.ttf' // 必须加上字体，否则离线时藏文会乱码或变丑
];

// 安装时：把所有资源存入手机本地
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  // 强制跳过等待，让新版本立即生效
  self.skipWaiting();
});

// 激活时：清理旧版本的缓存，腾出空间
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  // 立即接管所有页面
  self.clients.claim();
});

// 运行中：离线优先策略 (Network-Falling-Back-to-Cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 如果本地有缓存就用缓存，没有就去联网抓取
      return response || fetch(event.request).then((networkResponse) => {
        // 如果联网抓到了新东西，顺便更新一下缓存（可选）
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
        // 如果彻底断网且没缓存，这里可以返回一个离线提示（可选）
    })
  );
});