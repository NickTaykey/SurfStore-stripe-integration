const clearBtn = document.getElementById("clear-button");
const locationLink = document.getElementById("location");
const findMeBtn = document.getElementById("find-me");
const statusLabel = document.getElementById("status");
const locationContainer = document.getElementById("location-container");
const locationLegend = document.getElementById("location-legend");

clearBtn.addEventListener("click", e => {
  // blocchiamo il comportamento di default del link, in questo modo evitiamo comportamenti anomali (che il link si apra)
  e.preventDefault();
  // selezioniamo la barra di ricerca della location e settiamo come valore ""
  document.getElementById("location").value = "";
  locationContainer.style.display="block";
  locationLegend.classList.remove("mb-0");
  statusLabel.textContent="";
  // selezioniamo il radio-button cliccato e lo rendiamo non cliccato
  document.querySelector("input[type=radio]:checked").checked = false;
});

$(".page-item").click(function(e){
  e.preventDefault();
  const link = this.children[0];
  const currentPageItem = document.querySelector(".page-item[class~='active']");
  $.get(link.getAttribute("href"), response=>{
    // remove active from the former page
    currentPageItem.classList.remove("active");
    // add active class to the current page
    $(`.page-link[href="/posts?page=${response.page}"]:not(#Previous, #Next)`)
      .parents(".page-item")
      .addClass("active");
    // display and hide previous and next btn properly
    if(response.page!==1){
      $("#Previous").attr("href", `/posts?page=${response.page-1}`);
      $("#Previous").parents(".page-item").show();
    } else {
      $("#Previous").parents(".page-item").hide();
    }
    if(response.pages!==response.page){
      $("#Next").parents(".page-item").show();
      // update previous and next btn
      $("#Next").attr("href", `/posts?page=${response.page+1}`);
    } else {
      $("#Next").parents(".page-item").hide();
    }
    // add new posts to the index
    $("#post-container").html("");
    response.docs.forEach(post => {
      $("#post-container").append(`
        <div class="col-xs-12 col-sm-12 col-md-6 col-lg-4 mb-5">
          <div class="card">
            <img src="${ post.images.length ? post.images[0].url : '/images/default_board_img.jpeg' }" class="card-img-top" alt="..." height="300px">
            <div class="card-body">
              <h5 class="card-title">${post.title }</h5>
              <h6 class="card-subtitle mb-3">Price: $${ post.price }</h6>
              <h6 class="card-subtitle mb-3 text-muted">${ post.location }</h6>
              <p class="card-text">${ post.description.slice(0, 20) } ... </p>
              <a href="/posts/${ post.id }" class="card-link">View More</a>
            </div>
          </div>
        </div>
      `);
    });
  });
});