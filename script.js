const apiURL = "https://api.open-meteo.com/v1/forecast?latitude=48.7665&longitude=11.4258&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto";

 

let temperaturDiagramm = null;

 

let favoriten = JSON.parse(localStorage.getItem("favoriten")) || [];

let aktuellerOrt = JSON.parse(localStorage.getItem("letzterOrt")) || {

    name: "Ingolstadt",

    latitude: 48.7665,

    longitude: 11.4258

};

 

function zeigeFavoriten() {

 

    const favoritenListe = document.getElementById("favoriten-liste");

 

    favoritenListe.innerHTML = "";

 

    favoriten.forEach(function (ort, index) {

 

        const favoritElement = document.createElement("div");

        favoritElement.classList.add("favorit-element");

 

        const stadtName = document.createElement("span");

        stadtName.textContent = ort.name;

        stadtName.style.cursor = "pointer";

 

        stadtName.addEventListener("click", function () {

            ladeWetterfuerOrt(ort);

        });

 

        const loeschenButton = document.createElement("button");

        loeschenButton.textContent = "x";

 

        loeschenButton.addEventListener("click", function () {

            favoriten.splice(index, 1);

 

            localStorage.setItem("favoriten", JSON.stringify(favoriten));

            zeigeFavoriten();

        });

 

        favoritElement.appendChild(stadtName);

        favoritElement.appendChild(loeschenButton);

 

        favoritenListe.appendChild(favoritElement);

    });

}

 

function ladeWetterfuerOrt(ort) {

    aktuellerOrt = ort;

    document.getElementById("stadt-anzeige").textContent = ort.name;

 

    const neueWetterURL = `https://api.open-meteo.com/v1/forecast?latitude=${ort.latitude}&longitude=${ort.longitude}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;

 

    fetch(neueWetterURL)

    .then(response => response.json())

    .then(zeigeWetter);

}

 

const favoritHinzufuegen = document.getElementById("favorit-hinzufuegen");

 

favoritHinzufuegen.addEventListener("click", function () {

 

    const bereitsGespeichert = favoriten.some(function (ort) {

        return ort.name === aktuellerOrt.name;

 

    });

 

    if (bereitsGespeichert) {

        alert("Diese Stadt ist bereits in deinen Favoriten.");

        return;

   

    }

 

    favoriten.push({

        name: aktuellerOrt.name,

        latitude: aktuellerOrt.latitude,

        longitude: aktuellerOrt.longitude

    });

 

    localStorage.setItem("favoriten", JSON.stringify(favoriten));

 

    zeigeFavoriten();

});

 

function erstelleTemperaturDiagramm(uhrzeiten, temperaturen) {

 

    const diagrammUhrzeiten = uhrzeiten.map(zeit => {

        return zeit.split("T")[1].slice(0, 5);

    });

 

    if (temperaturDiagramm !== null) {

        temperaturDiagramm.destroy();

    }

 

    const diagrammBereich = document.getElementById("temperatur-diagramm");

 

    temperaturDiagramm = new Chart(diagrammBereich, {

 

        type: "line",

 

        data: {

            labels: diagrammUhrzeiten,

 

            datasets: [{

                label: "Temperatur in °C",

                data: temperaturen,

                borderColor: "#496D87",

                backgroundColor: "rgba(73, 109, 135, 0.16)",

                borderWidth: 3,

                tension: 0.4,

                fill: true

            }]

        },

 

        options: {

            responsive: true,

            maintainAspectRatio: false,

 

            scales: {

                y: {

                    title: {

                        display: true,

                        text: "Temperatur (°C)"

                    }

                },

 

                x: {

                    title: {

                        display: true,

                        text: "Uhrzeit"

                    }

                }

            }

        }

    });

}

 

function erstelleWettersymbol(code) {

    const basis = `

        <svg viewBox="0 0 100 100"

             xmlns="http://www.w3.org/2000/svg"

             class="wetter-svg"

             aria-hidden="true">

    `;

 

    const ende = `</svg>`;

 

    if (code === 0) {

        return basis + `

            <circle cx="50" cy="46" r="23" fill="#F5C451"/>

            <g stroke="#D7B978" stroke-width="5" stroke-linecap="round">

                <path d="M50 10 V17 M50 75 V82 M14 46 H21 M79 46 H86"/>

                <path d="M25 21 L30 27 M70 65 L76 71 M75 21 L69 27 M30 65 L24 71"/>

            </g>

        ` + ende;

    }

 

    if ([1, 2, 3].includes(code)) {

        return basis + `

            <circle cx="66" cy="31" r="20" fill="#F5C451"/>

            <path d="M20 68 C8 68 8 49 23 46

                     C26 28 51 26 59 42

                     C77 36 91 50 88 63

                     C86 71 78 74 69 74 H23 Z"

                  fill="#DCE8EF" stroke="#607F96" stroke-width="4"/>

            <path d="M24 52 Q43 42 59 53"

                  fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>

        ` + ende;

    }

 

    if ([45, 48].includes(code)) {

        return basis + `

            <path d="M20 40 H80 M13 55 H87 M22 70 H78"

                  stroke="#8FA7B7" stroke-width="7" stroke-linecap="round"/>

            <path d="M30 29 H72"

                  stroke="#DCE8EF" stroke-width="6" stroke-linecap="round"/>

        ` + ende;

    }

 

    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {

        return basis + `

            <path d="M20 56 C8 56 9 38 24 35

                     C28 17 53 17 61 33

                     C79 27 92 41 87 53

                     C85 59 78 62 69 62 H23 Z"

                  fill="#DCE8EF" stroke="#607F96" stroke-width="4"/>

            <path d="M32 69 L26 82 M53 69 L47 82 M74 69 L68 82"

                  stroke="#4C91C4" stroke-width="6" stroke-linecap="round"/>

        ` + ende;

    }

 

    if ([71, 73, 75, 77, 85, 86].includes(code)) {

        return basis + `

            <path d="M20 51 C8 51 9 34 24 31

                     C28 13 53 13 61 29

                     C79 23 92 37 87 49

                     C85 55 78 58 69 58 H23 Z"

                  fill="#DCE8EF" stroke="#607F96" stroke-width="4"/>

            <g stroke="#75A9D0" stroke-width="4" stroke-linecap="round">

                <path d="M31 68 V88 M21 78 H41 M24 71 L38 85 M38 71 L24 85"/>

                <path d="M68 68 V88 M58 78 H78 M61 71 L75 85 M75 71 L61 85"/>

            </g>

        ` + ende;

    }

 

    if ([95, 96, 97, 99].includes(code)) {

        return basis + `

            <path d="M20 48 C8 48 9 31 24 28

                     C28 10 53 10 61 26

                     C79 20 92 34 87 46

                     C85 52 78 55 69 55 H23 Z"

                  fill="#AFC4D2" stroke="#607F96" stroke-width="4"/>

            <path d="M53 55 L39 76 H52 L45 94 L68 67 H55 L63 55 Z"

                  fill="#E6B94F" stroke="#D7A83D" stroke-width="2"/>

        ` + ende;

    }

 

    return basis + `

        <circle cx="50" cy="50" r="28" fill="#DCE8EF"/>

        <text x="50" y="62" text-anchor="middle"

              font-size="34" fill="#607F96">?</text>

    ` + ende;

}

 

function erstelleKleidungsSymbol(temperatur) {

 

    if (temperatur < 5) {

        return `

            <svg viewBox="0 0 100 100" class="kleidungs-svg" aria-hidden="true">

                <path d="M35 23 L22 32 L12 82 H88 L78 32 L65 23

                         L57 33 H43 Z"

                      fill="#607F96" stroke="#263D52" stroke-width="4"

                      stroke-linejoin="round"/>

                <path d="M43 33 L50 48 L57 33"

                      fill="#DCE8EF" stroke="#263D52" stroke-width="3"/>

                <path d="M35 20 Q50 12 65 20 L61 32 H39 Z"

                      fill="#D7B978" stroke="#263D52" stroke-width="3"/>

                <path d="M37 58 Q50 65 63 58"

                      fill="none" stroke="#DCE8EF" stroke-width="4"

                      stroke-linecap="round"/>

            </svg>`;

    }

 

    if (temperatur < 13) {

        return `

            <svg viewBox="0 0 100 100" class="kleidungs-svg" aria-hidden="true">

                <path d="M35 22 L20 32 L12 82 H88 L80 32 L65 22

                         L57 33 H43 Z"

                      fill="#AFC4D2" stroke="#263D52" stroke-width="4"

                      stroke-linejoin="round"/>

                <path d="M43 24 L50 43 L57 24"

                      fill="#FFFFFF" stroke="#263D52" stroke-width="3"/>

                <path d="M50 43 V82"

                      stroke="#263D52" stroke-width="3"/>

                <circle cx="56" cy="53" r="2.5" fill="#D7B978"/>

                <circle cx="56" cy="65" r="2.5" fill="#D7B978"/>

            </svg>`;

    }

 

    if (temperatur < 20) {

        return `

            <svg viewBox="0 0 100 100" class="kleidungs-svg" aria-hidden="true">

                <path d="M35 23 L19 33 L12 80 H88 L81 33 L65 23

                         L57 34 H43 Z"

                      fill="#DCE8EF" stroke="#263D52" stroke-width="4"

                      stroke-linejoin="round"/>

                <path d="M43 24 L50 38 L57 24"

                      fill="#FFFFFF" stroke="#263D52" stroke-width="3"/>

                <path d="M50 38 V80"

                      stroke="#607F96" stroke-width="3"/>

            </svg>`;

    }

 

    if (temperatur < 27) {

        return `

            <svg viewBox="0 0 100 100" class="kleidungs-svg" aria-hidden="true">

                <path d="M30 30 L40 22 H60 L70 30 L85 43

                         L76 56 L67 48 V82 H33 V48 L24 56

                         L15 43 Z"

                      fill="#DCE8EF" stroke="#263D52" stroke-width="4"

                      stroke-linejoin="round"/>

                <path d="M40 22 Q50 40 60 22"

                      fill="none" stroke="#607F96" stroke-width="3"/>

            </svg>`;

    }

 

    return `

        <svg viewBox="0 0 100 100" class="kleidungs-svg" aria-hidden="true">

            <path d="M16 48 Q50 13 84 48 Z"

                  fill="#D7B978" stroke="#263D52" stroke-width="4"/>

            <path d="M10 49 Q50 57 90 49"

                  fill="none" stroke="#263D52" stroke-width="5"

                  stroke-linecap="round"/>

            <path d="M50 18 V44"

                  stroke="#F5D88C" stroke-width="4"

                  stroke-linecap="round"/>

        </svg>`;

}

 

function erstelleZusatzsymbole(temperatur, windgeschwindigkeit, regenwahrscheinlichkeit, wettercode) {

 

    let symbole = "";

 

    // Regenschirm bei Regenwahrscheinlichkeit ab 30 %

    if (regenwahrscheinlichkeit >= 30) {

        symbole += `

            <div class="zusatzsymbol">

                <svg viewBox="0 0 100 100" class="zusatz-svg" aria-hidden="true">

                    <path d="M12 48 Q50 5 88 48 Q80 43 72 52 Q62 42 50 52 Q38 42 28 52 Q20 43 12 48 Z"

                          fill="#DCE8EF" stroke="#607F96" stroke-width="5"

                          stroke-linejoin="round"/>

                    <path d="M50 25 V75 Q50 88 62 82"

                          fill="none" stroke="#263D52" stroke-width="5"

                          stroke-linecap="round"/>

                    <path d="M28 65 L24 75 M50 65 L46 75 M72 65 L68 75"

                          stroke="#4C91C4" stroke-width="4"

                          stroke-linecap="round"/>

                </svg>

                <span>Regenschirm</span>

            </div>

        `;

    }

 

    // Windsymbol ab 20 km/h

    if (windgeschwindigkeit >= 20) {

        symbole += `

            <div class="zusatzsymbol">

                <svg viewBox="0 0 100 100" class="zusatz-svg" aria-hidden="true">

                    <g fill="none" stroke="#607F96" stroke-width="6"

                       stroke-linecap="round">

                        <path d="M12 35 H72 Q88 35 82 22 Q78 14 69 19"/>

                        <path d="M12 52 H86 Q96 52 91 65 Q87 73 78 68"/>

                        <path d="M12 69 H55 Q68 69 64 81 Q61 88 53 84"/>

                    </g>

                </svg>

                <span>Wind</span>

            </div>

        `;

    }

 

    // Sonne bei sonnigem oder leicht bewölktem Wetter

    const sonnig = [0, 1, 2].includes(wettercode);

 

    // Sonnenbrille ab 20 °C bei sonnigem Wetter

    if (sonnig && temperatur >= 20) {

        symbole += `

            <div class="zusatzsymbol">

                <svg viewBox="0 0 100 100" class="zusatz-svg" aria-hidden="true">

                    <path d="M12 39 L45 39 L48 57 Q45 72 30 70 Q16 68 14 55 Z"

                          fill="#607F96" stroke="#263D52" stroke-width="5"/>

                    <path d="M55 39 H88 L86 55 Q84 68 70 70 Q55 72 52 57 Z"

                          fill="#607F96" stroke="#263D52" stroke-width="5"/>

                    <path d="M45 45 Q50 40 55 45"

                          fill="none" stroke="#263D52" stroke-width="5"/>

                </svg>

                <span>Sonnenbrille</span>

            </div>

        `;

    }

 

    // Sonnenschutz ab 27 °C bei sonnigem Wetter

    if (sonnig && temperatur >= 27) {

        symbole += `

            <div class="zusatzsymbol">

                <svg viewBox="0 0 100 100" class="zusatz-svg" aria-hidden="true">

                    <rect x="34" y="25" width="32" height="62" rx="8"

                          fill="#DCE8EF" stroke="#607F96" stroke-width="5"/>

                    <path d="M42 25 V15 H58 V25"

                          fill="none" stroke="#263D52" stroke-width="5"

                          stroke-linejoin="round"/>

                    <path d="M43 48 H57 M43 58 H57"

                          stroke="#D7B978" stroke-width="5"

                          stroke-linecap="round"/>

                    <path d="M50 5 V11 M25 18 L30 23 M75 18 L70 23"

                          stroke="#D7B978" stroke-width="4"

                          stroke-linecap="round"/>

                </svg>

                <span>Sonnenschutz</span>

            </div>

        `;

    }

 

    return symbole;

}

 

function zeigeWetter(wetterdaten) {

 

    localStorage.setItem(

    "letzteWetterdaten",

    JSON.stringify(wetterdaten)

);

 

localStorage.setItem(

    "letzterOrt",

    JSON.stringify(aktuellerOrt)

);

 

document.getElementById("stadt-anzeige").textContent = aktuellerOrt.name;

 

const temperatur = wetterdaten.current.temperature_2m;

const gefuehlteTemperatur = wetterdaten.current.apparent_temperature;

const luftfeuchtigkeit = wetterdaten.current.relative_humidity_2m;

const wettercode = wetterdaten.current.weather_code;

const windgeschwindigkeit = wetterdaten.current.wind_speed_10m;

const aktuelleStunde = wetterdaten.hourly.time.findIndex(function (zeit) {

    return zeit.slice(0, 13) == wetterdaten.current.time.slice(0, 13);

});

const regenwahrscheinlichkeit = aktuelleStunde >= 0

    ? wetterdaten.hourly.precipitation_probability[aktuelleStunde]

    : null;

 

console.log("Temperatur:", temperatur);

console.log("Gefühlte Temperatur:", gefuehlteTemperatur);

console.log("Luftfeuchtigkeit:", luftfeuchtigkeit);

console.log("Wettercode:", wettercode);

console.log("Windgeschwindigkeit:", windgeschwindigkeit);

console.log("Regenwahrscheinlichkeit:", regenwahrscheinlichkeit);

 

let kleidung = "";

 

if (temperatur < 5) {

    kleidung = "Sehr kalt! Winterjacke, Schal und warme Schuhe empfohlen.";

} else if (temperatur < 13) {

    kleidung = "Kühl! Übergangsjacke und Pullover empfohlen.";

} else if (temperatur < 20) {

    kleidung = "Angenehm! Leichte Jacke oder Pullover empfohlen.";

} else if (temperatur < 27) {

    kleidung = "Warm! T-Shirt und leichte Kleidung empfohlen.";

} else {

    kleidung = "Sehr warm! Luftige Kleidung und Sonnenschutz empfohlen.";

}

 

if (windgeschwindigkeit >= 30) {

    kleidung += " Zusätzlich ist eine winddichte Jacke empfehlenswert.";

} else if (windgeschwindigkeit >= 20) {

    kleidung += " Bei dem Wind empfiehlt sich eine windabweisende Jacke.";

}

 

if (regenwahrscheinlichkeit !== 0 && regenwahrscheinlichkeit >= 60) {

    kleidung += " Hohe Regenwahrscheinlichkeit! Nimm am besten einen Regenschirm mit.";

} else if (regenwahrscheinlichkeit !== 0 && regenwahrscheinlichkeit >= 30) {

    kleidung += " Ein Regenschirm könnte sinnvoll sein.";

}

 

document.getElementById("kleidungstext").innerHTML = `

    <div class="kleidungs-anzeige">

        ${erstelleKleidungsSymbol(temperatur)}

 

        <div class="kleidungs-inhalt">

            <p>${kleidung}</p>

 

            <div class="zusatzsymbole">

                ${erstelleZusatzsymbole(

                    temperatur,

                    windgeschwindigkeit,

                    regenwahrscheinlichkeit,

                    wettercode

                )}

            </div>

        </div>

    </div>

`;




const uhrzeiten = wetterdaten.hourly.time;

const temperaturen = wetterdaten.hourly.temperature_2m

const naechste24Stunden = uhrzeiten.slice(0, 24);

const naechste24Temperaturen = temperaturen.slice(0, 24);

 

erstelleTemperaturDiagramm(naechste24Stunden, naechste24Temperaturen);

 

    let wetterbeschreibung = "";

    let wettersymbol = "";

       

        switch(wettercode) {

           

            case 0:

                wetterbeschreibung = "Klarer Himmel";

                wettersymbol = "☀️";

                break;

 

            case 1:

                wetterbeschreibung = "Überwiegend klar";

                wettersymbol = "⛅";

                break;

 

            case 2:

                wetterbeschreibung = "Teilweise bewölkt";

                wettersymbol = "⛅";

                break;

 

            case 3:

                wetterbeschreibung = "Bedeckt";

                wettersymbol = "☁️";

                break;

 

            case 45:

                wetterbeschreibung = "Nebel";

                wettersymbol = "🌫️"

                break;

 

            case 48:

                wetterbeschreibung = "Gefrierender Nebel";

                wettersymbol = "🌫️";

                break;

 

            case 51:

                wetterbeschreibung = "Leichter Nieselregen"

                wettersymbol = "🌦️";

                break;

 

            case 53:

                wetterbeschreibung = "Mäßiger Nieselregen";

                wettersymbol = "🌦️";

                break;

 

            case 55:

                wetterbeschreibung = "Starker Nieselregen";

                wettersymbol = "🌦️";

                break;

 

            case 56:

            case 57:

                wetterbeschreibung = "Gefrierender Nieselregen";

                wettersymbol = "🌦️";

                break;

 

            case 61:

                wetterbeschreibung = "Leichter Regen";

                wettersymbol = "🌧️";

                break;

 

            case 63:

                wetterbeschreibung = "Mäßiger Regen";

                wettersymbol = "🌧️";

                break;

 

            case 65:

                wetterbeschreibung = "Starker Regen";

                wettersymbol = "🌧️";

                break;

 

            case 66:

            case 67:

                wetterbeschreibung = "Gefrierender Regen"

                wettersymbol = "🌧️";

                break;

           

            case 71:

                wetterbeschreibung = "Leichter Schneefall";

                wettersymbol = "❄️";

                break;

 

            case 73:

                wetterbeschreibung = "Mäßiger Schneefall";

                wettersymbol = "❄️";

                break;

 

            case 75:

                wetterbeschreibung = "Starker Schneefall";

                wettersymbol = "❄️";

                break;

 

            case 77:

                wetterbeschreibung = "Schneeriesel";

                wettersymbol = "❄️";

                break;

           

            case 80:

                wetterbeschreibung = "Leichte Regenschauer";

                wettersymbol = "🌧️";

                break;

           

            case 81:

                wetterbeschreibung = "Mäßige Regenschauer";

                wettersymbol = "🌧️";

                break;

 

            case 82:

                wetterbeschreibung = "Starke Regenschauer";

                wettersymbol = "🌧️";

                break;

           

            case 85:

                wetterbeschreibung = "Leichte Schneeschauer";

                wettersymbol = "❄️";

                break;

 

            case 86:

                wetterbeschreibung = "Starke Schneeschauer";

                wettersymbol = "❄️";

                break;

 

            case 95:

                wetterbeschreibung = "Gewitter";

                wettersymbol = "🌩️";

                break;

           

            case 96:

                wetterbeschreibung = "Gewitter mit leichtem Hagel";

                wettersymbol = "⛈️";

                break;

           

            case 97:

                wetterbeschreibung = "Starkes Gewitter";

                wettersymbol = "⛈️";

                break;

 

            case 99:

                wetterbeschreibung = "Gewitter mit starkem Hagel"

                wettersymbol = "⛈️";

                break;

 

            default:

                wetterbeschreibung = "Wetterlage unbekannt";

                wettersymbol = "🌡️";

        }

   

 

        document.getElementById("temperatur").textContent = temperatur + " °C";

        document.getElementById("gefuehlte-temperatur").textContent = gefuehlteTemperatur;

        document.getElementById("luftfeuchtigkeit").textContent = luftfeuchtigkeit;

        document.getElementById("wetterbeschreibung").textContent = wetterbeschreibung;

        document.getElementById("wettersymbol").innerHTML = erstelleWettersymbol(wettercode);

 

        const vorhersage = wetterdaten.daily;

        const container = document.getElementById("vorhersage-container");

 

        container.innerHTML = "";

 

        for (let i = 0; i < 5; i++) {

 

            const [jahr, monat, tagNummer] = vorhersage.time[i].split("-").map(Number);

 

            const datum = new Date(jahr, monat -1, tagNummer);

 

            const tag = datum.toLocaleDateString("de-DE", {

                weekday: "long"

            });

 

            const maxTemperatur = vorhersage.temperature_2m_max[i];

            const minTemperatur = vorhersage.temperature_2m_min[i];

            const tagesWettercode = vorhersage.weather_code[i];

 

            let tagesBeschreibung = "";

            let tagesSymbol = "";

 

            switch (tagesWettercode) {

 

                case 0:

                    tagesBeschreibung = "Klarer Himmel";

                    tagesSymbol = "☀️";

                    break;

 

                case 1:

                    tagesBeschreibung = "Überwiegend klar";

                    tagesSymbol = "⛅";

                    break;

 

                case 2:

                    tagesBeschreibung = "Teilweise bewölkt";

                    tagesSymbol = "⛅";

                    break;

               

                case 3:

                    tagesBeschreibung = "Bedeckt";

                    tagesSymbol = "☁️";

                    break;

               

                case 45:

                case 48:

                    tagesBeschreibung = "Nebel";

                    tagesSymbol = "🌫️";

                    break;

 

                case 51:

                case 53:

                case 55:

                    tagesBeschreibung = "Nieselregen";

                    tagesSymbol = "🌦️";

                    break;

 

                case 56:

                case 57:

                    tagesBeschreibung = "Gefrierender Nieselregen";

                    tagesSymbol = "🌦️";

                    break;

               

                case 61:

                case 63:

                case 65:

                    tagesBeschreibung = "Regen";

                    tagesSymbol = "🌧️";

                    break;

               

                case 66:

                case 67:

                    tagesBeschreibung = "Gefrierender Regen";

                    tagesSymbol = "🌧️";

                    break;

 

                case 71:

                case 73:

                case 75:

                case 77:

                    tagesBeschreibung = "Schnee";

                    tagesSymbol = "❄️";

                    break;

 

                case 80:

                case 81:

                case 82:

                    tagesBeschreibung = "Regenschauer";

                    tagesSymbol = "🌧️";

                    break;

               

                case 85:

                case 86:

                    tagesBeschreibung = "Schneeschauer";

                    tagesSymbol = "❄️";

                    break;

 

                case 95:

                case 96:

                case 97:

                case 99:

                    tagesBeschreibung = "Gewitter";

                    tagesSymbol = "⛈️";

                    break;

 

                default:

                    tagesBeschreibung = "Wetterlage unbekannt";

                    tagesSymbol = "🌡️";

                    break;

 

            }

 

           

            const karte = document.createElement("div");

 

            karte.classList.add("vorhersage-karte");

 

            tagesSymbol = erstelleWettersymbol(tagesWettercode);

 

            const kurzerTag = tag.charAt(0).toUpperCase() + tag.slice(1);

 

            const datumText = datum.toLocaleDateString("de-DE", {

            day: "2-digit",

            month: "2-digit"

            });

 

            karte.innerHTML = `

                <div class="vorhersage-kartenkopf">

                    <h3>${kurzerTag}</h3>

                    <span class="vorhersage-datum">${datumText}</span>

                </div>

 

                <div class="vorhersage-symbol">${tagesSymbol}</div>

 

                <p class="vorhersage-beschreibung">${tagesBeschreibung}</p>

 

                <div class="vorhersage-temperaturen">

                    <div class="temperaturwert temperaturwert-max">

                        <span>Max.</span>

                        <strong>${Math.round(maxTemperatur)}°</strong>

                    </div>

 

                    <div class="temperaturwert temperaturwert-min">

                        <span>Min.</span>

                        <strong>${Math.round(minTemperatur)}°</strong>

                    </div>

                </div>

            `;

 

            container.appendChild(karte);

 

        }

 

}

 

if (navigator.onLine) {

 

    fetch(apiURL)

        .then(response => {

            if (!response.ok) {

                throw new Error("Wetterdaten konnten nicht geladen werden.");

            }

            return response.json();

        })

        .then(zeigeWetter)

        .catch(function (fehler) {

            console.log("Wetterdaten konnten nicht geladen werden:", fehler);

            ladeGespeicherteWetterdaten();

        });

 

} else {

 

    console.log("Keine Internetverbindung. Lade gespeicherte Wetterdaten.");

    ladeGespeicherteWetterdaten();

 

}

 

const stadtEingabe = document.getElementById("stadt-suche");

const suchenButton = document.getElementById("suchen-button");

const standortButton = document.getElementById("standort-button");

 

suchenButton.addEventListener("click", function () {

 

    const stadt = stadtEingabe.value;

 

    if (stadt.trim() === "") {

        alert("Bitte gib einen Stadtnamen ein.");

        return;

    }

 

    const geocodingURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(stadt)}&count=5&language=de&format=json`;

 

    fetch(geocodingURL)

 

        .then(response => response.json())

 

        .then(ortsdaten => {

           

            if (ortsdaten.results && ortsdaten.results.length > 0) {

 

                const ort = ortsdaten.results[0];

 

                const stadtName = ort.name;

                const breitengrad = ort.latitude;

                const laengengrad = ort.longitude;

 

                aktuellerOrt = {

                    name: stadtName,

                    latitude: breitengrad,

                    longitude: laengengrad

 

                };

 

                localStorage.setItem(

                    "letzterOrt",

                    JSON.stringify(aktuellerOrt)

                );

 

                document.getElementById("stadt-anzeige").textContent = stadtName;

 

                console.log("Stadt:", stadtName);

                console.log("Breitengrad", breitengrad);

                console.log("Längengrad:", laengengrad);

 

                const neueWetterURL = `https://api.open-meteo.com/v1/forecast?latitude=${breitengrad}&longitude=${laengengrad}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;

 

                fetch(neueWetterURL)

 

                    .then(response => response.json())

 

                    .then(zeigeWetter);

   

            }

 

            else {

 

                alert("Die eingegebene Stadt wurde leider nicht gefunden.");

 

            }

        });

 

});

 

standortButton.addEventListener("click", function () {

    navigator.geolocation.getCurrentPosition(function (position) {

 

        const breitengrad = position.coords.latitude;

        const laengengrad = position.coords.longitude;

 

        console.log("Mein Breitengrad:", breitengrad);

        console.log("Mein Längengrad:", laengengrad);

 

        aktuellerOrt = {

            name: "Mein Standort",

            latitude: breitengrad,

            longitude: laengengrad

        };

 

        const ortsURL = `https://nominatim.openstreetmap.org/reverse?lat=${breitengrad}&lon=${laengengrad}&format=jsonv2&accept-language=de`;

 

        fetch(ortsURL)

            .then(response => response.json())

            .then(adressdaten => {

                const adresse = adressdaten.address;

 

                const stadt =

                    adresse.city ||

                    adresse.town ||

                    adresse.village ||

                    adresse.municipality ||

                    adresse.hamlet;

 

                if (stadt) {

                    document.getElementById("stadt-anzeige").textContent = stadt;

                } else {

                    document.getElementById("stadt-anzeige").textContent = "Unebkannter Ort";

                }

            })

            .catch(fehler => {

                console.log("Fehler bei der Stadtnamenermittlung:", fehler);

                document.getElementById("stadt-anzeige").textContent = "Mein Standort";

            });

 

        document.getElementById("stadt-anzeige").textContent = "Mein Standort";

 

        const neueWetterURL = `https://api.open-meteo.com/v1/forecast?latitude=${breitengrad}&longitude=${laengengrad}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;

   

        fetch(neueWetterURL)

            .then(response => response.json())

            .then(zeigeWetter);

   

    },

    function(fehler) {

 

        console.log("Standortfehler:", fehler.message)

        console.log("Fehlercode:", fehler.code);

 

        if (fehler.code === 1) {

            alert("Du hast den Zugriff auf deinen Standort nicht erlaubt. Bitte suche stattdessen nach einer Stadt");

        } else if (fehler.code === 2) {

            alert("Dein Standort konnte nicht ermittelt werden. Bitte versuche es später erneut.");

        } else if (fehler.code ===3) {

            alert("Die Standortabfrage hat zu lange gedauert. Bitte versuche es erneut.");

        }

       }

    );

});

 

zeigeFavoriten();

 

if ("serviceWorker" in navigator) {

 

    window.addEventListener("load", function () {

 

        navigator.serviceWorker.register("./service-worker.js")

            .then(function (registration) {

                console.log("Service Worker erfolgreich registriert:", registration.scope);

            })

            .catch(function (fehler) {

                console.log("Service Worker Registration feglgeschlagen:", fehler);

            });

    });

}

 

function ladeGespeicherteWetterdaten() {

 

    const gespeicherteDaten = localStorage.getItem("letzteWetterdaten");

    const gespeicherterOrt = localStorage.getItem("letzterOrt");

 

    if (gespeicherteDaten) {

 

        if (gespeicherterOrt) {aktuellerOrt = JSON.parse(gespeicherterOrt);

        }

 

        document.getElementById("stadt-anzeige").textContent = aktuellerOrt.name;

 

        const wetterdaten = JSON.parse(gespeicherteDaten);

 

        zeigeWetter(wetterdaten);

 

        console.log("Gespeicherte Wetterdaten wurden geladen.");

 

    } else {

 

        console.log("Keine gespeicherten Wetterdaten vorhanden.");

 

    }

}

 

window.addEventListener("offline", function () {

    console.log("Keine Internetverbindung. Offline-Modus wird aktiviert.");

    ladeGespeicherteWetterdaten();

});window.addEventListener("online", function () {

    console.log("Internetverbindung wiederhergestellt.");

    ladeWetterfuerOrt(aktuellerOrt);

});

 

if (!navigator.onLine) {

    ladeGespeicherteWetterdaten();

}

/* HELL- UND DUNKELMODUS */

const themeToggle = document.getElementById("theme-toggle");

// Gespeichertes Design laden
const gespeichertesTheme = localStorage.getItem("theme");

if (gespeichertesTheme === "dark") {
    document.body.classList.add("dark-mode");
}

// Button entsprechend anzeigen
function aktualisiereThemeButton() {
    const istDunkel = document.body.classList.contains("dark-mode");

    themeToggle.textContent = istDunkel ? "☀️" : "🌙";

    themeToggle.setAttribute(
        "aria-label",
        istDunkel ? "Hellmodus aktivieren" : "Dunkelmodus aktivieren"
    );
}

aktualisiereThemeButton();

// Beim Klicken das Design wechseln
themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    const istDunkel = document.body.classList.contains("dark-mode");

    localStorage.setItem("theme", istDunkel ? "dark" : "light");

    aktualisiereThemeButton();
});
