mapboxgl.accessToken =
  "pk.eyJ1Ijoibmlja3RheSIsImEiOiJjazJ1cTdkNzUwOXZnM2hwYTV2Z3ppa3J3In0.RlGvSEVuNTV8qf0t1zfviw";
  
function loadMap(center){
  let map =  new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/nicktay/ck3ampwvm0kjh1ctfkb9qbzem",
    center: center,
    zoom: 15
  });
  // disabilità lo zoom con lo scrooling del mouse
  map.scrollZoom.disable();
  // aggiungiamo i controller + e - per modificare lo zoom direttamente dalla mappa
  map.addControl(new mapboxgl.NavigationControl());
  let el = document.createElement("div");
  el.className = "marker";
  new mapboxgl.Marker(el)
    .setLngLat(post.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(
        "<h3>" + post.title + "</h3><p>" + post.location + "</p>"
      )
    )
    .addTo(map);
  return map;
}
let map = loadMap(post.geometry.coordinates);


$("#review-container").on("click", ".edit-review-button", function() {
  $(this).text() === "Edit" ? $(this).text("Cancel") : $(this).text("Edit");
  $(this)
    .siblings(".edit-review-form")
    .toggle();
});

$(".clear-rating-btn").click(function() {
  $(".reset-rating-fieldset")
    .children("input[type=radio]:checked")
    .attr("checked", false);
  $(".reset-rating-fieldset")
    .children(".input-no-rate")
    .click();
});

$("#reviewNewFormToogler").click(e=>{
  e.preventDefault();
  $(".new-review-form").toggle();
});

// post refact with AJAX
const editPostBtn = document.getElementById("edit-post-btn");
const infoBox = document.getElementById("info-box");
const editForm = document.getElementById("editForm");
const closeFormBtn = document.getElementById("close-form-btn");
closeFormBtn.addEventListener("click", function(e){
  e.preventDefault();
  $(editForm).hide();
  $(this).hide();
  $(infoBox).show();
})
if(editPostBtn){
  editPostBtn.addEventListener("click", function(e){
    e.preventDefault();
    $(infoBox).hide();
    $(editForm).show();
    $(closeFormBtn).show();
});
}
editForm.addEventListener("submit", function(e){
  e.preventDefault();
    // new post form validation and error handling
    let sendForm = true;
    function raiseAlertError(errName, imgError){
      let alert = document.querySelector(".alert");
        if(alert) alert.remove();
        alert = document.createElement("div");;
        alert.classList.add("alert");
        alert.classList.add("my-3");
        alert.setAttribute("role", "alert");
        alert.classList.add("alert-danger");
        let errorMessage;
        if(imgError) errorMessage = imgError;
        else errorMessage = `Error! Missing ${errName}`;
        alert.textContent=errorMessage;
        $("#form-title").after(alert);
        sendForm=false;
    }
    if(!$(this).find("input[name='post[title]']").val().length) return raiseAlertError("title");
    const checkBoxs = $(this).find(".deleteImageCheckbox").length;
    const checkBoxsChecked = $(this).find(".deleteImageCheckbox:checked").length;
    if(
      !$(this).find("input[name=images]")[0].files.length && 
      checkBoxs===checkBoxsChecked
    ) return raiseAlertError("images");
    if(($(this).find("input[name=images]")[0].files.length+(checkBoxs-checkBoxsChecked))>4) 
      return raiseAlertError(undefined, "You can upload at the most 4 images!");

    const fileInput = document.querySelector("input[type=file]");
    const val = checkIfValidFile(fileInput);
    if(!val && fileInput.files.length){
      return raiseAlertError(undefined, "File type not allowed");
    }
    if(!$(this).find("input[name='post[price]']").val().length) return raiseAlertError("price");
    if(!$(this).find("input[name='post[description]']").val().length) return raiseAlertError("description");
    if(!$(this).find("input[name='post[location]']").val().length) return raiseAlertError("location");

    if(sendForm){
      const spinner = document.getElementById("uploading-spinner");
      const formActionUrl = this.getAttribute("action");
      const data = new FormData(this);
      spinner.removeAttribute("style");
      $.ajax({
        type: "PUT",
        enctype: 'multipart/form-data',
        url: formActionUrl,
        data: data,
        contentType: false,
        processData: false,
        success: response=>{
          spinner.setAttribute("style", "display: none!important;")
          $(editForm).hide();
          $(closeFormBtn).hide();
          $(infoBox).show();
          // update the fields of the info box
          $("#post-title").text(response.title);
          $("#post-price").text(response.price);
          $(".description").text(response.description);
          $("#location").text(response.location);
          if(!$("#updated-label").length){
            $("#date").append(" <strong class='font-weight-bold' id='updated-label'>Updated</strong>");
          }
          // update the map
          map.remove();
          map=loadMap(response.geometry.coordinates);
          // update the images
          $('.carousel-inner').html("");
          response.images.forEach((img, i)=>{
            $('.carousel-inner').append(`
            <div class="carousel-item ${ i===0 ? 'active' : '' }">
              <img class="d-block w-100 carousel-image" src="${ img.url }" alt="surf board image" />
            </div>
            `);
          });
          $(".carousel-indicators").html("");
          for(let i = 0; i<response.images.length; i++){
            $(".carousel-indicators").append(`
            <li data-target="#carouselExampleIndicators" ${ i===0 ? 'class=active' : '' } data-slide-to="${ i+1 }"></li>
            `);
          }
          // update edit form fields
          $("input[name='post[title]']").val(response.title);
          $("input[name='post[price]']").val(response.price);
          $("input[name='post[description]']").val(response.description);
          $("input[name='post[location]']").val(response.location);
          $("input[name='images']").val("");
          $("#img-list").html("");
          response.images.forEach((img, i)=>{
            $('#img-list').append(`
            <div class="${ i===0 ? 'my-4' : 'mb-4' }">
            <img src="${ img.url }" alt="SurfBoardImage" width="50%" />
            <label class="d-inline-block ml-3" for="image${ i }">Delete?</label>
            <input
                class="d-inline-block ml-3 deleteImageCheckbox"
                type="checkbox"
                name="deleteImages[]"
                id="image${ i }"
                value="${ img.public_id }"
              />
            </div>
            `);
          });
          // add success alert
          let alert = document.querySelector(".alert");
          if(alert) alert.remove();
          alert = document.createElement("div");;
          alert.classList.add("alert");
          alert.setAttribute("role", "alert");
          alert.classList.add("alert-success");
          alert.classList.add("mb-3");
          alert.textContent=`Post successfully updated!`;
          $("#post-title").before(alert);
        }
      });
    }
});

// review AJAX refact code
const reviewForm = document.getElementById("new-review-form");
const reviewContainer = document.getElementById("review-container");

if(reviewForm){
   reviewForm.addEventListener("submit", function(e){
      e.preventDefault();
      // validate review body
      if(!$(".new-review-form input[name='review[body]']").val().length){
        if($(".new-review-form").find(".alert").length)
          $(".new-review-form").find(".alert").remove();
        let alert = document.createElement("div");
        alert.classList.add("alert");
        alert.classList.add("mb-0");
        alert.classList.add("mt-4");
        alert.setAttribute("role", "alert");
        alert.classList.add("alert-danger");
        let errorMessage = `Error! Missing review`;
        alert.textContent=errorMessage;
        return $(this).prepend(alert);
      }

      // create review
      const url = this.getAttribute("action");
      const data = $(this).serialize();
      $.ajax({
        type: "POST",
        url, 
        data, 
        success: function(response){
          const { review, author, error } = response;
          // code for you can only post one review error
          if(error==="You can only post one review"){
            if($(".new-review-form").find(".alert").length)
            $(".new-review-form").find(".alert").remove();
            let alert = document.createElement("div");
            alert.classList.add("alert");
            alert.classList.add("mb-0");
            alert.classList.add("mt-4");
            alert.setAttribute("role", "alert");
            alert.classList.add("alert-danger");
            let errorMessage = error;
            alert.textContent=errorMessage;
            return $(".new-review-form").prepend(alert);
          }
          // add review to the DOM
          $(reviewContainer).prepend(
            `
            <div class="review card w-100 mb-4">
              <div class="card-body">
                <h5 class="card-title mr-2 d-inline-block">${ author.username }</h5>
                <p class="starability-result rating d-inline-block my-0" data-rating="${ review.rating }"></p>
                <p class="text-muted float-right">Left ${ author.leftOn }</p>
                <p class="card-text review-content">${ review.body }</p>
                  <button class="edit-review-button btn btn-warning d-inline-block btn-sm">Edit</button>
                  <button type="button" class="btn btn-danger btn-sm" data-toggle="modal" data-target="#exampleModal2">
                    Delete
                  </button>
                  <div class="modal fade" id="exampleModal2" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document" style="min-height: initial;">
                      <div class="modal-content">
                        <div class="modal-body">
                          <h3 class="text-center my-4">Are you sure to delete the review?</h3>
                          <h6 class="text-center mb-4">This action is irreverible</h6>
                          <footer class="justify-content-center" style="display: flex!important;">
                            <button type="button" class="btn btn-secondary mr-2" data-dismiss="modal" id="close-modal-btn">Close</button>
                            <form
                              action="${ this.url + "/" + review._id }?_method=DELETE"
                              method="post"
                              id="delete-review-form"
                              class="delete-review-form d-inline-block"
                            >
                              <input class="btn btn-danger" type="submit" value="Delete" />
                            </form>
                          </footer>
                        </div>
                      </div>
                    </div>
                  </div>
                  <form
                    action="${ this.url + "/" + review._id }"
                    method="POST"
                    class="edit-review-form"
                  >
                  <div class="my-3">
                    <h5 class="d-inline-block mr-2">Edit rating:</h5>
                    <fieldset class="starability-basic d-inline-block mr-2 reset-rating-fieldset">
                      <input class="m-0 input-no-rate"
                      type="radio"
                      id="edit-no-rate"
                      name="review[rating]"
                      value="0"
                      checked
                      aria-label="No rating."
                      />
                      <input class="m-0" type="radio" id="edit-rate1" name="review[rating]" value="1" />
                      <label for="edit-rate1" title="Terrible">1 star</label>
                      <input class="m-0" type="radio" id="edit-rate2" name="review[rating]" value="2" />
                      <label for="edit-rate2" title="Not good">2 stars</label>
                      <input class="m-0" type="radio" id="edit-rate3" name="review[rating]" value="3" />
                      <label for="edit-rate3" title="Average">3 stars</label>
                      <input class="m-0" type="radio" id="edit-rate4" name="review[rating]" value="4" />
                      <label for="edit-rate4" title="Very good">4 stars</label>
                      <input class="m-0" type="radio" id="edit-rate5" name="review[rating]" value="5" />
                      <label for="edit-rate5" title="Amazing">5 stars</label>
                    </fieldset>
                    <button class="clear-rating-btn btn btn-warning btn-sm d-inline-block" type="button">Clear rating</button>
                  </div>
                  <input type='text' placeholder="your review" class="form-control mb-3" name="review[body]" value='${ review.body }'>
                  
                  <input class="btn btn-primary btn-block" type="submit" value="Update" />
              </form>
              </div>
            </div>
            `
          );
          // close form
          $(".new-review-form").hide();
          $(".new-review-form input[type=text]").val("");
          $(".clear-rating-btn").click();
          $("#reviewNewFormToogler + .alert").remove();
          // more below because .prepend() took time to be completed
          $(`#edit-rate${review.rating}`).attr("checked", true); 
          // add success alert
          let alert = document.querySelector(".alert");
          if(alert) alert.remove();
          alert = document.createElement("div");;
          alert.classList.add("alert");
          alert.setAttribute("role", "alert");
          alert.classList.add("alert-success");
          alert.classList.add("mt-4");
          alert.textContent=`Review successfully added!`;
          $("#main-row").before(alert);
        }
      });
    });
}

// delete review feature refact
$("#review-container").on("submit", ".delete-review-form", function(e){
  e.preventDefault();
  const url = this.getAttribute("action");
  $.ajax({
    type: "DELETE",
    url,
    deleteReviewForm: this,
    success: function(response){
      if(response.status===200){
        // close modal
        $(".modal-backdrop").remove();
        // remove review from the DOM
        $(this.deleteReviewForm)
          .parents(".review")
          .remove();
        // add success alert
        let alert = document.querySelector(".alert");
        if(alert) alert.remove();
        alert = document.createElement("div");;
        alert.classList.add("alert");
        alert.setAttribute("role", "alert");
        alert.classList.add("alert-success");
        alert.classList.add("mt-4");
        alert.textContent=`Review successfully deleted!`;
        $("#main-row").before(alert);
      }
    }
  });
});

// update review feature refact
$("#review-container").on("submit", ".edit-review-form", function(e) {
  e.preventDefault();
  const url = this.getAttribute("action");
  const data = $(this).serialize();
  // deal with errors in review update
  if(!$(this).find("input[name='review[body]']").val().length){
    if($(this).find(".alert").length)
       $(this).find(".alert").remove();
    let alert = document.createElement("div");
    alert.classList.add("alert");
    alert.classList.add("mb-0");
    alert.classList.add("mt-4");
    alert.setAttribute("role", "alert");
    alert.classList.add("alert-danger");
    let errorMessage = `Error! Missing review`;
    alert.textContent=errorMessage;
    return $(this).prepend(alert);
  }
  $.ajax({
    type: "PUT",
    url,
    data,
    form: this,
    success: function(response){
      // update the dom
      let $date = $(this.form).siblings(".float-right");
      if(!$date.find(".updated-label").length)
      $date.append(`<strong class="d-inline-block ml-2 font-weight-bold updated-label">Updated</strong>`)
      $(this.form).siblings(".review-content").text(response.body);
      $(this.form)
        .parents(".review")
        .find("p.rating")
        .attr("data-rating", response.rating);
      // hide edit review form
      $(".edit-review-button").click();
      if($(this.form).find(".alert").length)
       $(this.form).find(".alert").remove();
      // add success alert
      let alert = document.querySelector(".alert");
      if(alert) alert.remove();
      alert = document.createElement("div");;
      alert.classList.add("alert");
      alert.setAttribute("role", "alert");
      alert.classList.add("alert-success");
      alert.classList.add("mt-4");
      alert.textContent=`Review successfully updated!`;
      $("#main-row").before(alert);
    }
  })
});
