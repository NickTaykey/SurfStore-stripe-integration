if($(".dropdown-menu").find(".dropdown-item").length===1){
    $("#empty-cart-label").show();
} else {
    $("#empty-cart-label").hide();
}
$(".dropdown-menu").on("click", ".btn-danger", function(e){
    e.preventDefault();
    const itemId = $(this).parents(".dropdown-item").attr("id");
    $.ajax({
        type: "DELETE",
        url: `/cart/${ itemId }`,
        itemId,
        itemToRemove: $(this),
        success: function(response){
            $(this.itemToRemove)
                .parents(".dropdown-item")
                .remove();
            const $addCartBtn = $("#add-cart-btn");
            if($addCartBtn.length){
               $addCartBtn.addClass("btn-primary");
               $addCartBtn.removeClass("btn-success");
               $addCartBtn.attr("disabled", false);
               $addCartBtn.text("Add to Cart");
            }
            if(!response.shoppingCart.length){
                $("#empty-cart-label").show();
            }
            // troviamo il link del post
            $(`.card-link[href='/posts/${ this.itemId }']`)
            // risaliamo al badge e lo nascondiamo 
                .siblings(".badge-success")
                .hide();

            // add success alert
            let alert = document.querySelector(".alert");
            if(alert) alert.remove();
            alert = document.createElement("div");;
            alert.classList.add("alert");
            alert.setAttribute("role", "alert");
            alert.classList.add("alert-success");
            alert.classList.add("mt-5");
            alert.textContent=`Item successfully removed from the cart!`;
            if($("#main").prop("tagName")==="H2"){
                alert.classList.add("mb-0");
            }
            $("#main").before(alert);
        }
    })
});
