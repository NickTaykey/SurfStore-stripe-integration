// funzione eseguita quando l'utente clicca sul link per la geolocalizazione
function geoLocation(e) {
  /* CODICE DEL PROCESSO DI GEOLOCALIZZAZIONE
   selezioniamo p#status (p con cui daremo i feedback al utente) e input#location in cui metteremo l'oggetto
   JSON (array con le coordinate del utente in modo da inviarlo al server come il valore di un campo del form
   QUESTO E' IL MODO PIÚ SEMPLICE PER INVIARLO IN QUESTO MODO) */
  const status = document.getElementById("status");
  const location = document.getElementById("location");

  // CALLBACK DI SUCCESSO
  function successCallback(position) {
    // troviamo le coordinate
    const { latitude, longitude } = position.coords;
    // settiamo come valore del input location l'array delle coordinate sotto forma di un oggetto JSON
    location.value = `[${longitude}, ${latitude}]`;
    // diamo un feedback al utente che tutto è andato per il verso giusto e la geolocalizazione è avvenuta con successo
    status.textContent = "Geolocation successfully completed!";
  }
  // CALLBACK DI ERRORE
  function errorCallback(err) {
    // diamo un feedback al utente del errore
    status.textContent = "Unable to retrieve your location";
  }

  /* controlliamo se il browser supporta la geolocalizazione (se si è presente l'API per questo) L'OGGETTO
  navigator.geolocation è definito sul oggetto window */
  if (!navigator.geolocation) {
    /* se l'oggetto geolocation non è definito settiamo un messaggio di errore in p#status diciamo che il
    browser non supporta la geolocalizazione */
    status.textContent = "Your browser do not support the geolocation ";
  } else {
    /* IL BROWSER SUPPORTA LA GEOLOCALIZAZIONE
    feedback che stiamo eseguendo la geolocalizazione */
    status.textContent = "......";
    /* usiamo navigator.geolocation.getCurrentPosition() per trovare la posizione del utente (che deve acconsentire prima)
       QUESTO PRENDE 2 PARAMETRI:
        - la callback ESEGUITA IN CASO DI SUCCESSO (abbiamo rintracciato l'utente con successo)
          a cui viene passato l'oggetto che indica la posizione del utente
        - la callback di errore ESEGUITA NEL CASO IN CUI LA GEOLOCALIZAZIONE NON E' ANDATA BENE E NON SIAMO IN GRADO
          DI TROVARE LA POSIZIONE DEL UTENTE (sono successi degli errori)
    */
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  }
}

// selezioniamo il link su cui l'utente clicca per usare la geolocalizazione
const findMeLink = document.getElementById("find-me");
findMeLink.addEventListener("click", geoLocation);
