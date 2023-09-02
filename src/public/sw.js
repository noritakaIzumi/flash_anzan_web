self.addEventListener('install', function (event) {
});

self.addEventListener('fetch', function(event) {
});

self.addEventListener('activate', function() {
    // delete all ServiceWorker caches
    caches.keys().then(keys => keys.map((key) => {
        caches.delete(key).then(ok => {
            const message = ok ? 'Cache deleted: ' + key : 'Failed to delete cache: ' + key;
            console.log(message)
        })
    }))
});
