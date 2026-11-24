
const CACHE_NAME = "wetterwelt-v5";

const DATEIEN = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./chart.umd.js",
    "./favicon/image.png"
];
self.addEventListener("install", function (event) {

    event.waitUntil(

        caches.open(CACHE_NAME).then(function (cache) {

            return cache.addAll(DATEIEN);

        })

    );

});

 

self.addEventListener("activate", function (event) {

    event.waitUntil(

        caches.keys().then(function (cacheNamen) {

            return Promise.all ( cacheNamen.map(function (cacheName) {

                    if (cacheName !== CACHE_NAME) {

                        return caches.delete(cacheName);

                    }

                })

            );

        })

    );

});

 self.addEventListener("fetch", function (event) {

    if (event.request.method !== "GET") {

        return;

    }

    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) {

        return;

    }

    event.respondWith(

        caches.match(event.request).then(function (gefundeneDatei) {

            if (gefundeneDatei) {

                return gefundeneDatei;  }

            return fetch(event.request);

        })

    );

});