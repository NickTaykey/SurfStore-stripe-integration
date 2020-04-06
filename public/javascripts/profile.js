let password, confirmation;
const sumbitBtn = document.getElementById("update-profile"),
  newPassword = document.getElementById("new-password"),
  confirmationPassword = document.getElementById("password-confirmation"),
  validationMsg = document.querySelector(".validation-message"),
  form = document.getElementById("update-profile-form");

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

function raiseAlert(type, message){
  let alert = document.querySelector(".alert");
  if(alert) alert.remove();
  alert = document.createElement("div");;
  alert.classList.add("alert");
  alert.classList.add("my-3");
  alert.setAttribute("role", "alert");
  if(type==="success")
    alert.classList.add("alert-success");
  else
    alert.classList.add("alert-danger");
  alert.textContent=message;
  $("#update-profile-form").prepend(alert);
}

form.addEventListener("submit", function(e){
  e.preventDefault();
  // validate form fields
  if(!$("input[name=currentPassword]").val()){
    return raiseAlert("error", "You have to provide the current password to update");
  }
  if(!$("input[name=newPassword]").val() && $("input[name=passwordConfirmation]").val()){
    return raiseAlert("error", "Provide a new password");
  }
  if($("input[name=newPassword]").val() && !$("input[name=passwordConfirmation]").val()){
    return raiseAlert("error", "Confirm the new password");
  }
  if(!$("input[name=username]").val()){
    return raiseAlert("error", "Provide a valid username to update");
  }
  if(!$("input[name=email]").val()){
    return raiseAlert("error", "Provide a valid E-mail to update");
  }

  const fileInput = document.querySelector("input[type=file]");
  const val = checkIfValidFile(fileInput);
  if(!val && fileInput.files.length){
    return raiseAlert("error", "File type not allowed");
  }

  if($("input[type=file]").val()){
    $("#upload-image-spinner").removeClass("d-none");
    $("#upload-image-spinner").addClass("d-block");
  }

  // submit the form
  const data = new FormData(this);
  $(this).find("input[type=submit]").attr("disbled", true);
  $.ajax({
    type: "PUT",
    data,
    url: "/profile",
    enctype: 'multipart/form-data',
    contentType: false,
    processData: false,
    form: this,
    success: function(response){
      $("#upload-image-spinner").removeClass("d-block");
      $("#upload-image-spinner").addClass("d-none");
      // ERROR HANDLING
      if(response.error){
        return raiseAlert("error", response.error);
      }
      // UPDATE FORM TITLE
      $("#title").text(`${response.username}'s profile`);
      // ADD SUCCESS ALERT
      raiseAlert("success", "Profile successfully updated!");
      // UPDATE NAVBAR
      $("#username-label").find(".nav-link").text(`Welcome ${response.username}!`);
      $(this.form).find("input[type=submit]").attr("disbled", true);
      // clean pwd fields
      $("input[name=currentPassword]").val("");
      $("input[name=newPassword]").val("");
      $("input[name=passwordConfirmation]").val("");
      $("input[name=image]").val("");
      // UPDATE IMG
      if(response.image && response.image.secure_url){
        $("#default-img-container").attr("style", "display: none!important;");
        $("#custom-img-container img").attr({
          "alt": `${ response.username }'s profile image`,
          "src": response.image.secure_url
        });
        $("#custom-img-container").attr("style", "display: block!important;");
        $("#title-container").removeClass("col-12");
        $("#title-container").addClass("col-xs-12");
        $("#title-container").addClass("col-lg-6");
        $("section").addClass("my-0");
        $("section").addClass("my-lg-5");
        $("section").removeClass("my-4");
    }
  }
 });
});