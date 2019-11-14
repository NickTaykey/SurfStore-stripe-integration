/*  ----------------------------
     mapboxgl è l'oggetto creato dal codice di mapbox che abbiamo incluso che ci permette di visualizzare la mappa
     nel browser
    ----------------------------
*/
/*  
    PER USARE L'API DI MAPBOX DOBBIAMO AUTENTICARCI CON IL NOSTRO ACCOUNT USANDO L'ACCESS TOKEN CHE MAPBOX CI METTE
    A DISPOSIZIONE

    ATTENZIONE!

    con mapbox quando dobbiamo usare l'api gli access token che usiamo per autenticarci sono diversi, in quanto
    hanno diversi privilegi (possiamo usarli per autenticarci con il nostro account e fare solo le opperazioni che
    il token che abbiamo usato ci permette), in particolare quando stiamo usando mapbox (lato client) normalmente
    useremo dei token con pochi privilegi (quelli minimi x esempio) questo perché il codice verrà dato ad ogni client
    e quindi degli utenti malintezionati potrebbero trovare il nostro token e quindi usarlo di conseguenza non è proprio
    il massimo della sicurezza mettere un token che ha previlegi alti (proprio perché potrebbe essere usato impropriamente
    da altri utenti), per questo quando dobbiamo usare un access token nel codice lato client useremo quello che viene chiamato
    public token cioè un token che ha privilegi bassisimi e che quindi non può essere usato da altri utenti per fare danni.
 
    CI AUTENTICHIAMO CON IL NOSTRO TOKEN X USARE LE API DI MAPBOX
    */
mapboxgl.accessToken = 'pk.eyJ1Ijoibmlja3RheSIsImEiOiJjazJ1cTdkNzUwOXZnM2hwYTV2Z3ppa3J3In0.RlGvSEVuNTV8qf0t1zfviw';
/*  
    CREIAMO UN NUOVO OGGETTO MAP CHE MODELLA LA MAPPA CHE VERRA' VISUALIZZATA NELLA PAGINA

    il costruttore di Map prende come parametri:

        - l'id del container della mappa (CIOE' DEL DIV CHE CONTERRA' LA MAPPA)
        - LO STILE DELLA MAPPA (cioè l'insieme di colori e di font con cui la mappa viene visualizzata,
          ci sono molti stili e li possiamo vedere tutti nel sito di mapbox)
        - le coordinate che indicano dove deve essere posizionato il centro della mappa (queste dentro un array)
        - lo zoom iniziale della mappa (quanto la mappa deve essere ingrandita di default)

    CON QUESTO CODICE IL CONTAINER VERRA' POPOLATO CON LA MAPPA MODELLATA DAL OGGETTO DELLA CLASSE MAP CHE ABBIAMO 
    APPENA INSTANZIATO

 */
let map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [-74.50, 40], // starting position [lng, lat]
    zoom: 9 // starting zoom
});

/* PER ADESSO NON RAPPRESENTEREMO NELLA MAPPA LA LOCATION DEI VARI POST MA DI DEI LUOGHI DI DEFAULT CHE
SONO STATICI E PER ORA E IN FASE DI TESTING SARANNO SEMPRE GLI STESSI, QUESTI LI METTIAMO IN UN OGGETTO
CHE CHIAMIAMO geojson E CHE E' UN OGGETTO PROPRIO COME QUELLI RESTITUITOCI DAL API DI MAPBOX CON LE FUNZIONI
DI GEOCODE CHE ABBIAMO TESTATO PRIMA (al interno del body contiene un array "features" con gli oggetti che
modellano tutti i luoghi da rappresentare, le coordinate di questi luoghi sono presenti in geomentry al interno
di questi oggetti, al interno di un array coordinates proprio com negli oggetti che l'api ci da come risposta) */
const geojson = {
    type: 'FeatureCollection',
    features: [{
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [-77.032, 38.913]
        },
        properties: {
            title: 'Mapbox',
            description: 'Washington, D.C.'
        }
    },
    {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [-122.414, 37.776]
        },
        properties: {
            title: 'Mapbox',
            description: 'San Francisco, California'
        }
    }]
};

// ITERIAMO SU TUTTI GLI OGGETTI CHE RAPPRESENTANO I LUOGHI DA VISUALIZZARE NELLA MAPPA
geojson.features.forEach(marker => {
    // PER OGNI LUOGO CREIAMO UN DIV NELLA MAPPA DOVE LO METTEREMO
    let el = document.createElement('div');
    // SUCCESSIVAMENTE GLI ASSEGNAMO UNA CLASSE MARKER PER STILIZZARE IL MARKER NELLA MAPPA
    el.className = 'marker';
    // ORA INSTANZIAMO UN NUOVO OGGETTO DELLA CLASSE MARKER CHE RAPPRESENTERA' IL VERO E PROPRIO MARKER NELLA MAPPA
    // CHE INDICA IL LUOGO IN QUESTIONE ED E' ASSOCIATO AL DIV CHE ABBIAMO CREATO NELLA RIGA PRECEDENTE CON CLASSE marker
    new mapboxgl.Marker(el)
        // SETTIAMO LE COORDINATE DEL MARKER
        // settiamo le coordinate del luogo che il marker indica associandole con quelle del luogo in questione
        // in questa iterazione sul array dei luoghi in geojson 
        .setLngLat(marker.geometry.coordinates)
        // SETTIAMO UN POPOUP SUL MARKER CHE APPARE QUANDO CI CLICCHIAMO SOPRA
        // la classe Popup MODELLA I POPUT QUINDI CREIAMO UN OGGETTO DI QUESTA CLASSE E LO PASSIAMO AL METODO PER
        // ASSOCIARE IL POPOUP AL MARKER
        .setPopup(new mapboxgl.Popup({ offset: 25 })
            // SETTIAMO IL CONTENUTO DEL POPUP (passiamo l'html che verrà visualizzato come contenuto del popup 
            // quando ci clicchiamo sopra)
            .setHTML('<h3>' + marker.properties.title + '</h3><p>' + marker.properties.description + '</p>'))
        // AGGIUNGIAMO IL MARKER ALLA MAPPA (lo mostriamo rendendolo visibile)
        .addTo(map);
});
