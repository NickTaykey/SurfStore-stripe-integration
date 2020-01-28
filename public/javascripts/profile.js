let password, confirmation;
const sumbitBtn = document.getElementById("update-profile"),
  newPassword = document.getElementById("new-password"),
  confirmationPassword = document.getElementById("password-confirmation"),
  validationMsg = document.querySelector(".validation-message");

function setMsg(msg, add, remove) {
  validationMsg.textContent = msg;
  validationMsg.classList.add(add);
  validationMsg.classList.remove(remove);
}

confirmationPassword.addEventListener("input", e => {
  e.preventDefault();
  password = newPassword.value;
  confirmation = confirmationPassword.value;
  if (password !== confirmation) {
    setMsg("Passwords must match!", "color-red", "color-green");
    sumbitBtn.setAttribute("disabled", true);
  } else {
    setMsg("Password match!", "color-green", "color-red");
    sumbitBtn.removeAttribute("disabled", true);
  }
});
