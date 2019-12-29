// includiamo LE VARIABILI DI AMBIENTE
require("dotenv").config();

// IMPORTIAMO MAPBOX
/* 
    il package che ci permette di interagire con mapbox ci permette di usare tutti i servizzi che mette a 
    disposizione, noi vogliamo usare quello per ottenere le coordinate di un luogo geografico sapendone il
    nome, questo servizio si chiama geocoding, quindi importiamo geocoding
*/
const mapbox = require("@mapbox/mapbox-sdk/services/geocoding"),
  /*  creiamo un oggetto mapboxClient che rappresenta noi come utenti iscritti a mapbox e ci
     permette di usare il nostro account, con i token che gli abbiamo associato per usare le
     API di mapbox
     
     USIAMO IL METODO mapbox per CREARE L'OGGETTO CLIENT E GLI PASSIAMO UN OGGETTO DI
     CONFIGURAZIONE, (qui metteremo le info relative al utente con cui ci vogliamo autenticare)
     E' NECESSARIO PASSARE SOLO L'ACCESS TOKEN CHE ABBIAMO CREATO DALLA DASHBOARD DEL NOSTRO
     ACCOUNT MAPBOX PER POTER USARE LE API DI MAPBOX DALLE NOSTRE APP

     MEMORIZZIAMO IL TOKEN IN UNA VARIABILE DI AMBIENTE IN QUANTO E' UN DATO SENSIBILE E NN E' BENE
     FARLO VEDERE A TUTTI (chiunque c'e l'ha può usare il nostro account con le api di mapbox dalla sua
     app)
    */
  geocodingClient = mapbox({ accessToken: process.env.MAPBOX_TOKEN });

// USIAMO MABBOX PER TROVARE LE COORDINATE DI UN LUOGO CONOSCENDONE SOLO IL NOME
// (per fare un qualcosa di generico scriviamo una funzione che prende come parametro il nome del luogo,
// stampa le coordinate)

/* usiamo il metodo forwardGeocode del oggetto client per ricavare delle info relative al luogo in
questione, questo metodo prende come parametro un oggetto che indica il luogo da ricercare
questo avrà come proprietà necessarie al funzionamento del metodo:  query, associata al nome del luogo,
e limit che è associato al numero massimo di risultati che saranno mostrati
per spedire la richiesta al API in modo da ottenere i risultati usiamo il metodo send sul oggetto che
ci viene ritornato da forwardGeocode, questo metodo ritorna una promessa che è risolta quando l'API ci
ritorna i risultati con successo, se ci saranno errori di qualche tipo la promessa sarà rifiutata,
POSSIAMO GESTIRE LA PROMESSA COME VOGLIAMO USANDO THEN / CATCH O ASYNC / AWAIT.
IN OGNI CASO CI VIENE RITORNATO UN OGGETTO RISPOSTA CHE RAPPRESENTA IL / I LUOGO/HI CHE CORRISPONDONO
ALLA STRINGA CERCATA.
LE INFORMAZIONI DEI LUOGHI SONO NEL OGGETTO CON CHIAVE BODY NELLA RISPOSTA, QUI TROVEREMO UN ARRAY FEATURES
CHE CONTIENE TUTTI I LUOGHI TROVATI SE (limit: 1) QUESTI SARANNO SOLO UNO, ciascuno di questi oggetti ci da
molte info riguardo al luogo, per esempio: il suo nome completo, le coordinate, la nazione, in cui si trova ecc

LE COORDINATE CHE SONO QUELLO CHE CI INTERESSA SONO NEL OGGETTO geometry in ogni oggetto feature che rappresenta
un luogo, sotto la chiave coordinates, in un array (il primo elemento è la longitudine il secondo è la latitudine)


*/
const getCoords = place =>
  geocodingClient
    .forwardGeocode({ query: place, limit: 1 })
    .send()
    .then(res => {
      console.log(res.body.features[0].geometry.coordinates);
    })
    .catch(err => console.error(err));

getCoords("Belluno");

// give the first place with the provided name's coordinates
/* async function getCoordinates(place) {
    let response = await geocodingClient.forwardGeocode({ query: place, limit: 1 }).send();
    console.log(response.body.features[0].geometry.coordinates);
} */

// give the first 10 places with the provided name's coordinates
/* const getCoordinates = async (place) => {
    let response = await geocodingClient.forwardGeocode({ query: place, limit: 10 }).send();
    for (const feature of response.body.features) {
        console.log(feature.geometry.coordinates);
    }
} */
// getCoordinates("las vegas");

// give the privided place's state
/*
const getState = async (query) => {
    try {
        let res = await geocodingClient.forwardGeocode({ query, limit: 1 }).send();
        if (res.body.features[0].context) {
            let country = res.body.features[0].context[1];
            console.log(`Full name: ${country.text}, Short code: ${country.short_code}`)
        } else console.error("404 Country not found!");
    } catch (e) {
        console.error(e.message);
    }
}

getState("Via Feltre 102"); */

// PROJECT WITH FAKER

const faker = require("faker"),
  addresses = [];

// GET THE COORDINATES OF A BUNCH OF RANDOM PLACES
/* 
for (let i = 0; i < 100; i++) {
    addresses.push(faker.address.city())
}

async function getCoordinates() {
    let i = 0;
    for (const query of addresses) {
        try {
            let res = await geocodingClient.forwardGeocode({ query, limit: 1 }).send();
            let [lat, lng] = res.body.features[0].geometry.coordinates;
            console.log(`The coordinates of ${addresses[i]} are: ${lat} ; ${lng}`);
        } catch (e) { } finally { i++ };

    }
} */

// GET THE NAME OF A PLACE WITH THE GIVEN COORDINATES
/* for (let i = 0; i < 100; i++)
    addresses.push({ lat: faker.address.latitude(), lng: faker.address.longitude() })

async function getPlaces() {
    let i = 0;
    for (const { lat, lng } of addresses) {
        try {
            let res = await geocodingClient.reverseGeocode({ query: [Number(lat), Number(lng)], limit: 1 }).send();
            console.log(`The places with (${lat}; ${lng}) is ${res.body.features[0].place_name}`);
        } catch (e) { } finally { i++ };

    }
} */

// getPlaces();
