(() => {
    if (import.meta.env.DEV) {
        return
    }

    if (!('serviceWorker' in navigator)) {
        return;
    }

    window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js').then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
        document.getElementById('refresh-sw').addEventListener('click', function () {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for (let registration of registrations) {
                    registration.unregister()
                }
                console.log('ServiceWorker unregistered')
            })
            // delete all ServiceWorker caches
            caches.keys().then(keys => keys.map((key) => {
                caches.delete(key).then((boolean) => {
                    if (boolean) {
                        console.log('ServiceWorker cache deleted: ' + key)
                    } else {
                        console.log('Failed to delete ServiceWorker cache: ' + key)
                    }
                })
            }))
            window.location.reload()
        })
    });
})();
