const stripeHandler = StripeCheckout.configure(
    {
     key: stripePublicKey,
     locale: "en",
     token: function(token){
        const $items = $(".dropdown-item:not(#empty-label)");
        const ids = [];
        $items.each((index, item)=>{
            ids.push(item.getAttribute("id"));
        });
        const data = {
            items: ids,
            token,
            total: total
        }
        $.ajax({
            url: "/pay",
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json",
            complete: function(response){
                const { message, error } = response.responseJSON;
                // add success alert
                let alert = document.querySelector(".alert");
                if(alert) alert.remove();
                alert = document.createElement("div");;
                alert.classList.add("alert");
                alert.setAttribute("role", "alert");
                alert.classList.add("mt-5");
                if($("#main").prop("tagName")==="H2"){
                    alert.classList.add("mb-0");
                }
                if(message){
                    alert.classList.add("alert-success");
                    alert.textContent = message;
                } else {
                    alert.classList.add("alert-danger");
                    alert.textContent = error;
                }
                $("#main").before(alert);
                $("#reset-cart-btn").click();
            }
        });
     }	
    }
);

if(currentUser){
    var total = 0;
    if($(".dropdown-menu").find(".dropdown-item").length===1){
        $("#empty-label").show();
    } else {
        $("#empty-label").hide();
        $(".price-label").each((index, item)=>{
            total += Number(item.textContent);
        })
        $("#total-label").text(`$ ${ total }`);
    }
    $(".dropdown-menu").on("click", ".btn-danger", function(e){
        e.preventDefault();
        e.stopPropagation();
        const itemId = $(this).parents(".dropdown-item").attr("id");
        $.ajax({
            type: "DELETE",
            url: `/cart/${ itemId }`,
            itemId,
            itemToRemove: $(this),
            success: function(response){
                const price = $(this.itemToRemove)
                    .parents(".dropdown-item")
                    .find(".price-label")
                    .text()
                    .trim();
                total -= Number(price);
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
                    $("#empty-label").show();
                }
                // troviamo il link del post
                $(`.card-link[href='/posts/${ this.itemId }']`)
                // risaliamo al badge e lo nascondiamo 
                    .siblings(".badge-success")
                    .hide();
                if(!($(".dropdown-item").length-1)){
                    $("#control-bar").hide();
                }
                const $items = $(".dropdown-item:not(#empty-label)");
                const numItems = $items.length;
                if(numItems){
                    $("#num-items-label").text(`(${numItems})`)
                } else {
                    $("#num-items-label").hide();
                }
                $("#total-label").text(total);
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
    
    const resetCartBtn = document.getElementById("reset-cart-btn");
    resetCartBtn.addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        $.ajax({
            type: "DELETE",
            url: "/cart/all",
            $controlbar: $(this),
            success: function(response){
                this.$controlbar.parents("#control-bar").hide();
                $("#empty-label").show();
                $(".dropdown-item:not(#empty-label)").remove();
                $(".badge-success").hide();
                $("#add-cart-btn").removeClass("btn-success");
                $("#add-cart-btn").addClass("btn-primary");
                $("#add-cart-btn").attr("disabled", false);
                $("#num-items-label").hide();
                currentUser = response;
                total = 0;
            }
        })
    })

    const buyBtn = document.getElementById("buy-btn");
    buyBtn.addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        stripeHandler.open(
            {
                amount: total*100, 
            }
        );
    })

} 