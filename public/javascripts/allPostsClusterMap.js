// FILE CON IL CODICE PER MOSTRARE LA MAPPA CON I CLUSETER IN LANDING E POST/INDEX

// mostriamo la mappa in div#map
var map = new mapboxgl.Map({
  container: "map", // id del container
  style: "mapbox://styles/mapbox/streets-v8",
  center: [-98.55562, 39.809734], // centro della mappa
  zoom: 3.3 // zoom iniziale
});

// aggiungiamo un controllo alla mappa (un elemento che ci permette di interagirci)
map.addControl(
  // vogliamo che questo controllo sia una barra di ricerca per cercare sulla mappa
  // una località, facciamo questo passando come controllo da aggiungere un nuovo oggetto
  // MapboxGeocoder che rappresenta una barra di ricerca per cercare località nella mappa
  new MapboxGeocoder({
    // DATO CHE STIAMO USANDO DELLE FUNZIONALITA' DEL API DOBBIAMO AUTENTICARCI PASSANDO IL NOSTRO TOKEN
    accessToken: mapboxgl.accessToken
  })
);
// quando la mappa è stata caricata con successo (evento load scatta non appena la mappa ha finito di caricarsi)
map.on("load", function() {
  /* 
  aggiungiamo delle località (dei punti) alla mappa, questa serie di località si chiamerà "posts" (1° 
  parametro di addSource)
  
  - le località saranno memorizzate in oggetti di tipo geoJSON (opzione type: "geojson")
    questi oggetti sono nella variabile posts (data: posts)
  - le località in questione devono essere trattate come clusters (cluster: true) cioè vengono rappresentate
    tutte nella mappa come punti, ma, nel caso in cui ci siano più punti concentrati in una stessa zona verranno
    raggruppati in un solo punto (chiamato cluster), un cluster è quindi un punto grande che raggruppa tanti punti
  - il massimo zoom che possiamo fare su un cluster è 14 (clusterMaxZoom: 14), se zoomiamo di più vengono mostrati i
    punti singoli che costituiscono il cluster
  - settiamo il raggio del cluster a 50 
  */
  map.addSource("posts", {
    type: "geojson",
    data: posts,
    cluster: true,
    clusterMaxZoom: 14, // massimo zoom che possiamo fare sul cluster
    clusterRadius: 50 // raggio del cluster (tutti i punti a questa distanza
    // da centro del cluster fanno parte di esso)
  });
  // usiamo il metodo add layer per aggiungere degli elementi su dei punti della mappa
  map.addLayer({
    id: "clusters", // questo layer ha clusters come id
    type: "circle", // sarà un elemento a forma di cerchio
    source: "posts", // sarà sopra i punti delle località in posts
    filter: ["has", "point_count"], // solo soprà i punti che sono considerati dei cluster
    //(cioè che raggruppano tanti punti a loro vicini ed
    // hanno una proprietà chiamata pointCount)

    // questi cerchi sopra i cluster potranno essere diversi per colore e per dimensioni al variare delle
    // distanze tra i punti
    // NEL OGGETTO PAINT SETTIAMO I COLORI E LE DIMENSIONI DEI CERCHI AL VARIARE DELLE DISTANZE
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"], // AL VARIARE DELLA DISTANZA TRA I PUNTI ED IL CENTRO
        "#51bbd6", // SE E' MINORE DI 100 FAI UN CERCHIO BLU
        100,
        "#f1f075", // SE E' TRA 100 E 750 FANNE UNO GIALLO
        750,
        "#f28cb1" // SE E' MAGGIORE DI 750 FANNE UNO ROSA
      ],
      // SETTIAMO IL RAGGIO DEL CERCHIO AL VARIARE DELLA DISTANZA TRA I PUNTI ED IL CENTRO
      // se è minore di 100 il raggio sará 20
      // se è compresa tra 100 e 750 il raggio sarà 30
      // se è maggiore di 750 il raggio sarà 40
      "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40]
    }
  });
  /* ATTENZIONE! LA DISTANZA TRA I PUNTI DEL CLUSTER AUMENTERA' PIU' RIMPICCILIAMO PERCHE' SI FORMERANNO CLUSTER
     CHE CONTERRANNO TANTI PUNTI LONTANTI TRA DI LORO QUINDI IL COLORE PASSARA PRIMA DA BLU A GIALLO E POI A ROSA

     LA DISTANZA DIMINUISCE PIU' ZOOMIAMO PERCHE' I CLUSTER SARANNO FORMATI DA POCHI PUNTI VICINI TRA DI LORO
     E QUINDI IL COLORE PASSERA DA ROSA A GIALLO E POI A BLU
  */

  /* aggiungiamo un altro elemento sopra ad ogni punto che è un cluster (centro di un cluster) QUINDI SOPRA
     IL CERCHIO CHE LO IDENTIFICA COME PUNTO */

  /* QUESTO ELEMENTO SARA' IL NUMERO DI PUNTI CHE IL CLUSTER RAGRUPPA IN QUELLA ZONA DELLA MAPPA */
  map.addLayer({
    id: "cluster-count", // id del layer
    type: "symbol", // dato che CONTIENE UN CARATTERE NUMERICO IL LAYER SARÀ UN SIMBOLO
    source: "posts", // QUESTO LAYER SARÁ APPLICATO SU OGNI PUNTO DI POSTS CHE E' UN CLUSTER QUINDI CHE HA
    // UNA PROPRIETA' point_count (in realtà anche questo sarà un punto, centro del cluster che identifica)
    filter: ["has", "point_count"],
    // specifichiamo il contenuto di questo layer cioè che cosa contiene e come il testo deve essere formattato
    layout: {
      // contenuto NUMERO DI PUNTI CHE IL CLUSTER RAGGRUPPA
      "text-field": "{point_count_abbreviated}",
      // il font del contenuto
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      // la grandezza del font
      "text-size": 12
    }
  });
  /* 
     nn tutti punti saranno raggruppabili in clusters in quanto alcuni saranno troppo lontani tra di loro
     o da altri a questi punti aggiungiamo un layer COSTITUITO DA UN CERCHIO PICCOLO CHE IDENTIFICA I PUNTI
     SENZA CLUSTER
  */
  map.addLayer({
    id: "unclustered-point", // id che identifica il punto su cui è il layer come un punto senza cluster
    type: "circle", // il layer sarà un cerchio
    source: "posts", // sarà su tutti i punti di post che non fanno parte di un cluster (cioè che nn sono
    // cluster perchè I PUNTI O SONO CLUSTER O SONO PUNTI NORMALI)
    filter: ["!", ["has", "point_count"]],
    // DEFINIAMO LO STILE DEL CERCHIO
    paint: {
      "circle-color": "#11b4da", // cerchio blu
      "circle-radius": 5, // raggio 5
      "circle-stroke-width": 1, // larghezza linea perimetro
      "circle-stroke-color": "#fff" // colore linea perimetro
    }
  });
  // quando clicchiamo su un qualsiasi punto singolo (che nn fa parte di un cluster)
  map.on("click", "unclustered-point", function(e) {
    // trova le coordinate del punto
    var coordinates = e.features[0].geometry.coordinates;
    // trova la descrizione del luogo (stringa con il titolo del post (link)
    //  la location e un pezzo della descrizione del post)
    var description = e.features[0].properties.description;

    // fa in modo che se la mappa è rimpicciolità e sono visibili tanti punti nella zona dove è stato
    // fatto click allora il popup punti sempre al punto in questione
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // setta il popoup sul punto in questione della mappa
    new mapboxgl.Popup()
      .setLngLat(coordinates) // setta le coordinate del punto
      .setHTML(description) // setta la descrizione del popup
      // (propreties.description sarà la descrizione di default per ogni popup)
      .addTo(map); // aggiunge il popup alla mappa
  });

  // quando clicchiamo su un cluster
  map.on("click", "clusters", function(e) {
    // trova tutti i clusters vicini al punto (CHE ERA UN CLUSTER) dove era stato fatto click
    var features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
    var clusterId = features[0].properties.cluster_id; // trova l'id del primo tra i cluster selezionati
    map
      .getSource("posts") // trova tutte le località del oggetto posts
      // zoomma su quella che è il primo cluster di quelli che sono nel punto in cui abbiamo cliccato
      .getClusterExpansionZoom(clusterId, function(err, zoom) {
        // se ci sono errori esce dal codice
        if (err) return;
        // applicherà alla mappa un effetto transizione in modo da zoommare in modo liscio
        map.easeTo({
          // spacifichiamo rispetto a quale centro e a quale zoom effettuare la transizione
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      });
  });

  // funzione che fa cambiare il cursore da standard a puntatore (da mano piegata a mano con l'indice puntato)
  var mouseenterCursor = function() {
    map.getCanvas().style.cursor = "pointer";
  };
  // funzione che fa cambiare il cursone da puntatore a stardand (la mano con l'indice fuori diventa piegata)
  var mouseLeaveCursor = function() {
    map.getCanvas().style.cursor = "";
  };
  // quando il cursore entra in un cluster il cursore diventa pointer
  map.on("mouseenter", "clusters", mouseenterCursor);
  // quando il cursore esce da un cluster torna ad essere standard
  map.on("mouseleave", "clusters", mouseLeaveCursor);
  // quando il cursore entra in un punto che non è un cluster diventa un puntatore
  map.on("mouseenter", "unclustered-point", mouseenterCursor);
  // quando il cursore esce da un punto che non è un cluster torna ad essere standard
  map.on("mouseleave", "unclustered-point", mouseLeaveCursor);
});
