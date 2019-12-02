// selezioniamo il form
let form = document.getElementById("editForm");
// settiamo un evento submit che scatta ogni volta che l'utente prova ad inviare il form
form.addEventListener("submit", function(event) {
  // troviamo il numero di immagini che sta cercando di uploadare
  let uploadImages = document.getElementById("imageUpload").files.length;
  // troviamo il numero di immagini che vuole rimuovere
  let deleteImages = document.querySelectorAll(".deleteImageCheckbox:checked")
    .length;
  // troviamo il numero di immagini che vuole terere delle originali
  let existingImages = document.querySelectorAll(".deleteImageCheckbox").length;
  /*  
    troviamo il numero di immagini totali che sta cercando di postare
    quelle che vuole uploadare - quelle che vuole eliminare + quelle che ci sono già
  */
  let newTot = uploadImages - deleteImages + existingImages;
  // se sta cercando di uploadare più di 4 immagini
  if (newTot > 4) {
    // fermiamo l'inivio del form
    event.preventDefault();
    /* 
      e mandiamo un messaggio di errore in cui diciamo che deve rimouvere le n immagini in eccesso
      se è solo un immagine non aggiungiamo la "s" ad image altrimenti la mettiamo 
    */
    alert(
      `Please remove ${newTot - 4} (more) image${newTot - 4 === 1 ? "" : "s"}`
    );
  }
});
