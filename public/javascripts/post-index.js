const clearBtn = document.getElementById("clear-button");
const locationLink = document.getElementById("location");
const findMeBtn = document.getElementById("find-me");
const statusLabel = document.getElementById("status");
clearBtn.addEventListener("click", e => {
  // blocchiamo il comportamento di default del link, in questo modo evitiamo comportamenti anomali (che il link si apra)
  e.preventDefault();
  // selezioniamo la barra di ricerca della location e settiamo come valore ""
  document.getElementById("location").value = "";
  locationLink.classList.add("d-inline-block");
  locationLink.classList.remove("d-none");
  findMeBtn.classList.add("d-inline-block");
  findMeBtn.classList.remove("d-none");
  statusLabel.textContent="";
  // selezioniamo il radio-button cliccato e lo rendiamo non cliccato
  document.querySelector("input[type=radio]:checked").checked = false;
});
