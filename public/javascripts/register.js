$("form").submit(function(e){
    const fileInput = document.querySelector("input[type=file]");
    const val = checkIfValidFile(fileInput);
    if(!val && fileInput.files.length){
        e.preventDefault();
        let alert = document.querySelector(".alert");
        if(alert) alert.remove();
        alert = document.createElement("div");;
        alert.classList.add("alert");
        alert.classList.add("my-3");
        alert.setAttribute("role", "alert");
        alert.classList.add("alert-danger");
        alert.textContent="File type not allowed";
        return $("#form-title").after(alert);
    }
})