/*
 Copyright 2015 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

(function() {

// Incrementing CACHE_VERSION will kick off the install event and force previously cached
// resources to be cached again.
var CACHE_VERSION = '1.3.1';
var CURRENT_CACHES = {
	offline: 'offline-v' + CACHE_VERSION
};
var OFFLINE_URL = '/nonet.html';
var OFFLINE_RESOURCES = [
	OFFLINE_URL,
	'/skins/default/index/sally.css',
	'/img/errors/500.png'
];

self.addEventListener('install',function(event) {
	event.waitUntil(
	caches.open(CURRENT_CACHES.offline).then(function(cache) {
		return cache.addAll(OFFLINE_RESOURCES);
	})
	);
});

self.addEventListener('activate',function(event) {
	// Delete all caches that aren't named in CURRENT_CACHES.
	// While there is only one cache in this example, the same logic will handle the case where
	// there are multiple versioned caches.
	var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
		return CURRENT_CACHES[key];
	});

	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.map(function(cacheName) {
					if (expectedCacheNames.indexOf(cacheName) === -1) {
						// If this cache name isn't present in the array of "expected" cache names,
						// then delete it.
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});

self.addEventListener('fetch',function(event) {
	// We only want to call event.respondWith() if this is a navigation request
	// for an HTML page.
	// request.mode of 'navigate' is unfortunately not supported in Chrome
	// versions older than 49, so we need to include a less precise fallback,
	// which checks for a GET request with an Accept: text/html header.
	if ((event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html')))
			&& event.request.cache !== 'only-if-cached') {
		event.respondWith(
			fetch(event.request).catch(function(error) {
				// The catch is only triggered if fetch() throws an exception, which will most likely
				// happen due to the server being unreachable.
				// If fetch() returns a valid HTTP response with an response code in the 4xx or 5xx
				// range, the catch() will NOT be called. If you need custom handling for 4xx or 5xx
				// errors, see https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker/fallback-response
				return caches.match(OFFLINE_URL).then(
					resp => resp.text().then(
						content => new Response(
							content.replace("<!--ERROR_TEXT-->", "<p class=\"center\">Error message: "+error+"</p>"),
							{
								status: resp.status,
								statusText: resp.statusText,
								headers: resp.headers
							}
						)
					)
				);
			})
		);
	}

	// If our if() condition is false, then this fetch handler won't intercept the request.
	// If there are any other fetch handlers registered, they will get a chance to call
	// event.respondWith(). If no fetch handlers call event.respondWith(), the request will be
	// handled by the browser as if there were no service worker involvement.
});

})();