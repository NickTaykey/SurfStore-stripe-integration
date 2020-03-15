mapboxgl.accessToken =
  "pk.eyJ1Ijoibmlja3RheSIsImEiOiJjazJ1cTdkNzUwOXZnM2hwYTV2Z3ppa3J3In0.RlGvSEVuNTV8qf0t1zfviw";
let map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/nicktay/ck3ampwvm0kjh1ctfkb9qbzem",
  center: post.geometry.coordinates,
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

$(".edit-review-button").click(function() {
  $(this).text() === "Edit" ? $(this).text("Cancel") : $(this).text("Edit");
  $(this)
    .siblings(".edit-review-form")
    .toggle();
});

$(".delete-review-form").submit(function(event) {
  alert("are you sure you want to delete your review?");
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
  $(".new-review-form").toggle()
})