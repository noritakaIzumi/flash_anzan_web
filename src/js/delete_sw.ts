(() => {
    if (import.meta.env.DEV) {
        return
    }

    if (!("serviceWorker" in navigator)) {
        return
    }

    window.addEventListener("load", function () {
        void navigator.serviceWorker.getRegistrations().then(registrations => {
            for (const registration of registrations) {
                void registration.unregister().then(ok => ok)
                console.log("ServiceWorker unregistered")
            }
        })
        // delete all ServiceWorker caches
        void caches.keys().then(keys => {
            keys.forEach((key) => {
                void caches.delete(key).then(ok => {
                    const message = ok ? "Cache deleted: " + key : "Failed to delete cache: " + key
                    console.log(message)
                })
            })
        })
    })
})()
