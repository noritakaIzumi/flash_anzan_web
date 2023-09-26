// eslint-disable-next-line @typescript-eslint/no-misused-promises
self.addEventListener("activate", async function () {
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
