// variabili in cui conserveremo le nuove password per controllare nel evento degli input
// e in quello del form i loro valori in modo pù semplice
let password, confirmation;
// selezioniamo gli elementi del form con cui vogliamo lavorare
const form = document.getElementById("update-profile"),
  newPassword = document.getElementById("new-password"),
  confirmationPassword = document.getElementById("password-confirmation"),
  validationMsg = document.querySelector(".validation-message");

// metodo per settare il messaggio di validazione della password nel form (PER FARE IL CODICE DRY)
// msg : messaggio da settare
// add : classe da aggiungere (cambia colore in caso di successo o errore)
// remove : classe da rimuovere (cambia colore in caso di successo o errore)
function setMsg(msg, add, remove) {
  // settiamo il messaggio di errore
  validationMsg.textContent = msg;
  // aggiungiamo la classe appropriata (color-green nel caso di successo color-red nel caso di errore)
  validationMsg.classList.add(add);
  // rimuoviamo la classe appropriata (color-green nel caso di errore color-red nel caso di successo)
  validationMsg.classList.remove(remove);
}

// evento input relativo al campo DOVE SI RIPETE LA PASSWORD CHE SCATTA MENTRE SCRIVIAMO
// controlla mentre scriviamo che le password coincida no se coincidono da un messaggio di successo
// ALTRIMENTI UN ERRORE
confirmationPassword.addEventListener("input", e => {
  // per ragioni di sicurezza (non è detto altrimenti che l'evento scatti correttamente su tutti i browser)
  // blocchiamo tutti gli eventuali effetti del evento
  e.preventDefault();
  // troviamo le password
  password = newPassword.value;
  confirmation = confirmationPassword.value;
  // controllo le due password
  if (password !== confirmation) {
    // se sono diverse settiamo un messaggio di errore in div.validation-message
    setMsg("Passwords must match!", "color-red", "color-green");
  } else {
    // altrimenti se sono uguali settiamo un messaggio di successo dicendo che sono uguali
    setMsg("Password match!", "color-green", "color-red");
  }
});

// evento submit che SCATTA QUANDO L'UTENTE PROVA AD INVIARE IL FORM
// IMPEDISCE L'INVIO DEL FORM SE LE 2 PASSWORD NON COINCIDONO
form.addEventListener("submit", e => {
  // controlliamo le password (sono nelle variabili password e confirmation CHE SONO STATE MODIFICATE E AGGIORNATE
  // OGNI VOLTA CHE L'UTENTE HA INSERITO UN NUOVO CARATTERE, QUINDI RISPECCHIANO LE PASSWORD PRESENTI AL MOMENTO DEL
  // INVIO DEL FORM)
  if (password !== confirmation) {
    // impediamo l'invio del form
    e.preventDefault();
    // controlliamo se c'è già un flash msg settato
    const error = document.getElementById("error");
    // se non ci sono flash message ne aggiungiamo uno nuovo altrimenti lasciamo stare quello che c'era già e semplicemente impediamo l'invio del form
    if (!error) {
      // creo un flash message h1
      const flashMessage = document.createElement("h1");
      // settiamo le varie proprietà caratteristiche dei flash message + il messaggio di errore
      flashMessage.classList.add("color-red");
      flashMessage.setAttribute("id", "error");
      flashMessage.textContent = "Passwords must match!";
      // settiamo l'elemento come flash message subito dopo la navbar
      const navbar = document.getElementById("navbar");
      // selezioniamo il genitore della navbar
      const parent = navbar.parentNode;
      // selezioniamo l'elemento subito dopo la navbar
      const nextSibling = navbar.nextSibling;
      // settiamo il flash message subito prima del elemento subito dopo la navbar IN QUESTO MODO DI TROVA
      // SUBITO DOPO LA NAVBAR
      parent.insertBefore(flashMessage, nextSibling);
    }
  }
});
