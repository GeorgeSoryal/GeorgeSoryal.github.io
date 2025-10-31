let nextFactTime = getNextFactTime().then((date) => {
    nextFactTime = date;
});

let isRevealed = false;
let hasRun = false;

window.onload = function() {

    setInterval(updateCountdown, 1000, new Date());
}

function getCurrentFact(pastFacts) {
    return pastFacts[pastFacts.length - 1];
}

async function getPastFacts() {
    hasRun = true;
    let res = await fetch("https://us-central1-pinellascope.cloudfunctions.net/getPastFacts", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (!res.ok) {
        throw new Error(`Function failed with status ${response.status}: ${errorText}`);
    }
    const data = await res.json();
    let pastFacts = data.pastFacts;
    if(!hasRun) {
        for(let i = 0; i < pastFacts.length; i++) {
            pastFacts[i] = " " + pastFacts[i].substring(1, pastFacts[i].length-1);
        }
    }
    return pastFacts;
}

function updateCountdown(initial) {
    initial.setSeconds(initial.getSeconds() + 1);
    const timeDiff = nextFactTime - initial;
    let timeRemaining = "";
    if (timeDiff <= 0) {
        timeRemaining = "Refresh for today's fun fact!";
    } else {
        let hours = String(Math.floor((timeDiff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
        let minutes = String(Math.floor((timeDiff / (1000 * 60)) % 60)).padStart(2, '0');
        let seconds = String(Math.floor((timeDiff / 1000) % 60)).padStart(2, '0');
        timeRemaining = `${hours}:${minutes}:${seconds}`; 
    }
    document.querySelector("#timeRemaining").innerText = timeRemaining;
}

async function getNextFactTime() {
    let res = await fetch("https://getnextfactdate-q52fbmxg2q-uc.a.run.app", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (!res.ok) {
        throw new Error(`Function failed with status ${response.status}: ${errorText}`);
    }
    const data = await res.json();
    const nextFactDate = data.nextFactDate;

    // convert from firebase timestamp to Date object
    const dateObj = new Date(
      nextFactDate._seconds * 1000 + nextFactDate._nanoseconds / 1000000,
    );

    return dateObj;
}

function openPastFacts() {
    window.location.href = "past_facts.html";
}

document.querySelector("#learnMoreLink").addEventListener("click", async () => {
    const encodedSearchString = encodeURIComponent(getCurrentFact(await getPastFacts()));
    const googleSearchUrl = `https://www.google.com/search?q=${encodedSearchString}`;
    window.location.href = googleSearchUrl;
});

async function revealFact() {
    if (!isRevealed) {
        document.querySelector("#message").innerText += getCurrentFact(await getPastFacts());
        isRevealed = true;
    }
}

// Converts a VAPID public key string (Base64 URL-safe) into a Uint8Array.
// This format is required by the PushManager.subscribe() method. Copied 
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function arrayBufferToBase64(buffer) {
    // Convert ArrayBuffer to binary string
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    // Base64 encode the binary string
    return window.btoa(binary);
}

function isSubscribed() {
    navigator.serviceWorker.ready.then(swRegistration => {
        if (swRegistration && swRegistration.pushManager) {
            swRegistration.pushManager.getSubscription().then(subscription => {
                return subscription;
            });
        }
    });
}

document.querySelector("#subscriptionButton").addEventListener("click", async () => {
    // initially check for existing subscription
    if(isSubscribed()) {
        document.querySelector("#subscriptionStatus").textContent =
         '🔔 Already subscribed. Ready for daily reminders.';
        document.querySelector("#subscriptionButton").disabled = true;
        return;
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        document.querySelector("#subscriptionStatus").textContent =
         '❌ Push notifications are not supported by this browser.';
        document.querySelector("#subscriptionButton").disabled = true;
        return;
    }

    VAPID_PUBLIC_KEY = 'BCDJUHABAbHBYrobjnlUJNJTrfVoN1u_4MUjNO4ZjVn_3XtpwAD2Rh1FePy71LeVJghNK8aTWFBFSzzBGYUOcds';

    try {
        // register service worker (if not already registered)
        const serviceWorkerRegistration = await navigator.serviceWorker.register('./serviceWorker.js', { scope: '/' });
        document.querySelector("#subscriptionStatus").textContent =
         'Service Worker registered. Requesting permission...';

        // request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            throw new Error('Permission denied by the user.');
        }
        document.querySelector("#subscriptionStatus").textContent =
         'Permission granted. Subscribing...';
        
        // Create the Subscription
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        // Get a PushSubscription object, from mozilla docs
        const pushSubscription = await serviceWorkerRegistration.pushManager.subscribe({
            userVisibleOnly: true, // Must be true according to Push API spec
            applicationServerKey: applicationServerKey
        });

        // Create an object containing the information needed by the app server
        const subscriptionObject = {
            endpoint: pushSubscription.endpoint,
            expirationTime: pushSubscription.expirationTime,
            keys: {
                p256dh: arrayBufferToBase64(pushSubscription.getKey("p256dh")),
                auth: arrayBufferToBase64(pushSubscription.getKey("auth")),
            },
            encoding: PushManager.supportedContentEncodings,
            /* other app-specific data, such as user identity */
        };

        // saving to server, used AI to help with this part
        document.querySelector("#subscriptionStatus").textContent = 'Sending subscription to server...';
        const response = await fetch("https://savesubscription-q52fbmxg2q-uc.a.run.app", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscriptionObject),
        });

        if (!response.ok) {
            throw new Error(`Server failed to save subscription: ${response.status}, ${response.statusText}`);
        }

        document.querySelector("#subscriptionStatus").textContent = 
        '✅ Subscription saved! You will receive daily reminders.';
        document.querySelector("#subscriptionButton").disabled = true;
        document.querySelector("#unsubscribeButton").disabled = false;
    } catch (error) {
        console.error('Push subscription failed:', error);
        document.querySelector("#subscriptionStatus").textContent =
         `❌ Subscription process failed: ${error.message}`;
    }    
});

document.querySelector("#unsubscribeButton").addEventListener("click", async () => {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if(!subscription) {
            document.querySelector("#subscriptionStatus").textContent =
             '❌ No active subscription found.';
            return;
        }
        if (subscription) {
            const endpoint = subscription.endpoint;
            const response = await fetch("https://deletesubscription-q52fbmxg2q-uc.a.run.app", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ endpoint: endpoint }),
            });
            if (!response.ok) {
                throw new Error(`Server failed to delete subscription: ${response.status}, ${response.statusText}`);
            } else {
                const sucess = await subscription.unsubscribe();
                if(sucess) {
                    document.querySelector("#subscriptionStatus").textContent =
                     '✅ Unsubscribed successfully.';
                    document.querySelector("#subscriptionButton").disabled = false;
                    document.querySelector("#unsubscribeButton").disabled = true;
                } else {
                    document.querySelector("#subscriptionStatus").textContent =
                     '❌ Unsubscription failed.';
                    throw new Error('Failed to unsubscribe from PushManager.');
                }
            }
        }
    } catch (error) {
    console.error('Unsubscription failed:', error);
    document.querySelector("#subscriptionStatus").textContent =
     `❌ Unsubscription process failed: ${error.message}`;
    } 
});


document.querySelector("#shareButton").addEventListener("click", async () => {
    if (!navigator.share || !navigator.canShare) {
        console.error('Web Share API not supported in this browser.');
        return;
    }
    try {
        await navigator.share({
            title: 'Check out this Pinellas Fun Facts App!',
            text: `Did you know... ${getCurrentFact(await getPastFacts())}. Discover daily
            fun facts about Pinellas County. Stay informed and entertained!`,
            url: window.location.href
        });
        console.log('Content shared successfully');
    } catch (error) {
        console.error('Error sharing content:', error);
    }
});