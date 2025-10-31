// service-worker.js - This script runs in the background.

// Event listener for when a push notification arrives from the backend.
self.addEventListener('push', function(event) {
    // The notification payload sent from the Firebase Function (index.ts)
    const data = event.data;
    
    // Customize the notification appearance and behavior
    const options = {
        body: data.body,
        icon: './icon512_rounded.png', // Update with a real icon for your PWA
        badge: './icon512_maxable.png', // Update with a real badge for your PWA
        data: {
            url: data.url // The URL to open when the user clicks
        }
    };

    // Show the notification and keep the service worker alive until it is shown
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Event listener for when the user clicks the notification.
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    const urlToOpen = event.notification.data.url;
    
    // Focus an existing window or open a new one
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                // If the app is already open at the correct URL, focus that tab/window
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise, open a new window/tab
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
