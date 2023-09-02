(() => {
    if (import.meta.env.DEV) {
        return
    }

    if (!('serviceWorker' in navigator)) {
        return;
    }

    window.addEventListener('load', function () {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
                registration.unregister().then(ok => ok)
                console.log('ServiceWorker unregistered')
            }
        })
        // delete all ServiceWorker caches
        caches.keys().then(keys => keys.map((key) => {
            caches.delete(key).then(ok => {
                const message = ok ? 'Cache deleted: ' + key : 'Failed to delete cache: ' + key;
                console.log(message)
            })
        }))
    });
})();
