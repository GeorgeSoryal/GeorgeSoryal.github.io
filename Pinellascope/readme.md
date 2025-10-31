# PinellaScope
Hello, this is my congressional app challenge project, PinellaScope. Here you will find all of the source code behind the app. There are a total of 7 files in this repository that are written and programmed with logic to run the app (as in not styling, generated, or third-party). In this folder:
- pinellascope.html defines the homepage with all website elements
- past_facts.html defines the website elements for the past facts page
- past_facts.js defines the logic behind loading in the past facts onto the page
- print_out.py was utilized in preparing all of the facts needed for the app
- home_page.js holds lots of logic behind the inner workings of the app, it
    - handles the countdown timer 
    - handles interfacing with the database for updating the fact
    - handles notification subscriptions and unsubscriptions
    - handles sharing when the share button is pressed
    - handles revealing for when the reveal fact button is pressed
- serviceWorker.js is crucial for allowing this app to run standalone from a browser, as in being a mobile app
    - it handles notifications, and allowing for mobile browsers to determine this app as installable
- as for the backend, there is one file handling all of the logic which can be found in [index.ts](functions/src/index.ts). This file handles:
    - updating the fact every day
    - updating the time the fact updates everyday
    - sending out notifications to every subscriber of the app
    - allowing for subscribers to subscribe to the app through the subscribe button which adds them to a database of devices that notifications are sent to
    - allowing for subscribers to unsubscribe from the app through the unsubscribe button which removes them from the database
    - sending the time and date when the facts update to devices on request

In terms of the backend database, there are three types of things that must be stored: the facts, the times to send out notifications and update the facts, and the subscribers who have chosen to be sent notifications. This is done on the back-end system with [index.ts](functions/src/index.ts) through firestore, a system by Google connected to Firebase. This was chosen due to the large free tier available.