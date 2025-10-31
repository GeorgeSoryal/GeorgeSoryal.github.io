let hasRun = false;

function openPastFacts() {
    window.location.href = "past_facts.html";
}

async function getLaunchDay() {
    let res = await fetch("https://us-central1-pinellascope.cloudfunctions.net/getLaunchDay", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (!res.ok) {
        throw new Error(`Function failed with status ${response.status}: ${errorText}`);
    }
    const data = await res.json();
    const launchDay = data.launchDay;
    
    // convert from firebase timestamp to Date object
    const dateObj = new Date(
      launchDay._seconds * 1000 + launchDay._nanoseconds / 1000000,
    );

    return dateObj;
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

window.onload = async function() {
    let pastFacts = await getPastFacts();
    let launchDay = await getLaunchDay();
    document.querySelector("#launchDate").innerText = `App Launch Date: ${launchDay.toDateString()}`;
    launchDay.setDate(launchDay.getDate() - 1);
    for (let i = 0; i < pastFacts.length; i++) {
        let day = launchDay.getDate() + 1;
        launchDay.setDate(day);
        document.querySelector("#factsList").innerText += `${launchDay.toDateString()}:` + pastFacts[i] + "\n\n";
    }
};