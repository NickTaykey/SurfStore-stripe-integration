const clearBtn = document.getElementById("clear-button");
clearBtn.addEventListener("click", e => {
  // blocchiamo il comportamento di default del link, in questo modo evitiamo comportamenti anomali (che il link si apra)
  e.preventDefault();
  // selezioniamo la barra di ricerca della location e settiamo come valore ""
  document.getElementById("location").value = "";
  // selezioniamo il radio-button cliccato e lo rendiamo non cliccato
  document.querySelector("input[type=radio]:checked").checked = false;
});
