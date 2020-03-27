const clearBtn = document.getElementById("clear-button");
const locationLink = document.getElementById("location");
const findMeBtn = document.getElementById("find-me");
const statusLabel = document.getElementById("status");
const locationContainer = document.getElementById("location-container");
const locationLegend = document.getElementById("location-legend");
const pageNumber = document.getElementById("page-number");
const searchForm = document.getElementById("search-and-filter-form");
const h2 = document.querySelector("h2");
const $paginationBar = $("#pagination-bar");
let map = loadMap();
let searchFormEncoded;
let currentPage = 1;

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

$paginationBar.on("click", ".page-item", function(e){
  e.preventDefault();
  const link = this.children[0];
  const currentPageItem = document.querySelector(".page-item[class~='active']");
  $.get(link.getAttribute("href"), response=>{
    // remove active from the former page
    currentPageItem.classList.remove("active");
    // add active class to the current page
    $(`.page-link[href="/posts?${ searchFormEncoded ? searchFormEncoded+"&" : "" }page=${response.page}"]:not(#Previous, #Next)`)
      .parents(".page-item")
      .addClass("active");
    currentPage=response.page;
    
    // display and hide previous and next btn properly
    if(response.page!==1){
      $("#Previous").attr("href", `/posts?${ searchFormEncoded ? searchFormEncoded+"&" : "" }page=${response.page-1}`);
      $("#Previous").parents(".page-item").show();
    } else {
      $("#Previous").parents(".page-item").hide();
    }
    if(response.pages!==response.page){
      $("#Next").parents(".page-item").show();
      // update previous and next btn
      $("#Next").attr("href", `/posts?${ searchFormEncoded ? searchFormEncoded+"&" : "" }page=${response.page+1}`);
    } else {
      $("#Next").parents(".page-item").hide();
    }
    // update page number at the top
    pageNumber.textContent = response.page!==1 ? " N° " + response.page : "";

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
              <a href="/posts/${ post._id }" class="card-link">View More</a>
            </div>
          </div>
        </div>
      `);
    });
    // update the post (map source variable)
    posts = { features: response.docs };
    // remove former map
    map.remove();
    // load new map
    map = loadMap()
  });
});

// search and filter feature AJAX refact
searchForm.addEventListener("submit", function(e){
  e.preventDefault();
  let formData = $(this).serialize();
  searchFormEncoded = formData;
  let url = this.getAttribute("action") + "?" + formData;
  $.get(url, response=>{
    // set status alert 
    let alert = document.querySelector(".alert");
    if(alert) alert.remove();
    alert = document.createElement("div");;
    alert.classList.add("alert");
    alert.setAttribute("role", "alert");
    if(response.docs.length){
      alert.classList.add("alert-success");
      alert.textContent=`${response.total} posts found!`;
    } else {
      alert.classList.add("alert-danger");
      alert.textContent=`404 No posts found!`;
    }
    $(h2).after(alert);
    
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
              <a href="/posts/${ post._id }" class="card-link">View More</a>
            </div>
          </div>
        </div>
      `);
    });

    // update the map
    map.remove();
    posts = { features: response.docs };
    map = loadMap();

    // update pagination controllers
    // update urls
    $paginationBar.html("");
    // <ul class="pagination d-flex justify-content-center">
    let ul = document.createElement("ul");
    ul.classList.add("pagination");
    ul.classList.add("d-flex");
    ul.classList.add("justify-content-center");
    $paginationBar.append(ul);  


    // add previous page link
    let li = document.createElement("li");
    li.classList.add("page-item");
    ul.append(li);
    let a = document.createElement("a");
    a.setAttribute("id", "Previous");
    a.classList.add("page-link");
    a.setAttribute("href", `/posts?${formData}&page=${currentPage-1}`);
    a.innerHTML = `<span aria-hidden="true">&laquo;</span>`;
    li.append(a); 
    $(li).hide();

    for(let i = 1; i<=response.pages; i++){
      // <li class="page-item <%= posts.page===i ? 'active' : '' %>">
      let li = document.createElement("li");
      li.classList.add("page-item");
      if(i===response.page) li.classList.add("active");
      ul.append(li);
      let a = document.createElement("a");
      a.classList.add("page-link");
      a.setAttribute("href", `/posts?${formData}&page=${i}`);
      a.textContent = `${i}`;
      li.append(a);
    }

    // add next page link
    li = document.createElement("li");
    li.classList.add("page-item");
    ul.append(li);
    a = document.createElement("a");
    a.setAttribute("id", "Next");
    a.classList.add("page-link");
    a.setAttribute("href", `/posts?${formData}&page=${currentPage+1}`);
    a.innerHTML = `<span aria-hidden="true">&raquo;</span>`;
    li.append(a); 
  });
})