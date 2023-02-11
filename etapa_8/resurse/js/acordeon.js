window.addEventListener("DOMContentLoaded", function(){
    document.getElementById("acc-itemOne").onclick=function() {
        if(document.getElementById("acc-buttonOne").getAttribute("aria-expanded") == "true"){
            document.getElementById("acc-buttonOne").setAttribute("aria-expanded", "true");
            localStorage.setItem("aria-expanded1", "true");
            document.getElementById("acc-buttonOne").innerHTML="Ascunde Filtre";
        }
        else if(document.getElementById("acc-buttonOne").getAttribute("aria-expanded") == "false"){
            document.getElementById("acc-buttonOne").setAttribute("aria-expanded", "false");
            localStorage.setItem("aria-expanded1", "false");
            document.getElementById("acc-buttonOne").innerHTML="Afiseaza Filtre";
        }
    }

    document.getElementById("acc-itemTwo").onclick=function() {
        if(document.getElementById("acc-buttonTwo").getAttribute("aria-expanded") == "true"){
            document.getElementById("acc-buttonTwo").setAttribute("aria-expanded", "true");
            localStorage.setItem("aria-expanded2", "true");
            document.getElementById("acc-buttonTwo").innerHTML="Ascunde Produse";
        }
        else if(document.getElementById("acc-buttonTwo").getAttribute("aria-expanded") == "false"){
            document.getElementById("acc-buttonTwo").setAttribute("aria-expanded", "false");
            localStorage.setItem("aria-expanded2", "false");
            document.getElementById("acc-buttonTwo").innerHTML="Afiseaza Produse";
        }
    }

    isOpen1 = document.getElementById("collapseOne");
    if(localStorage.getItem("aria-expanded1")=='false' && isOpen1.classList.contains("show")){
        isOpen1.classList.remove("show");
        document.getElementById("acc-buttonOne").innerHTML="Afiseaza Filtre";
    }
    else if(localStorage.getItem("aria-expanded1")=='true'){
        document.getElementById("acc-buttonOne").innerHTML="Ascunde Filtre";
    }
    
    isOpen2 = document.getElementById("collapseTwo");
    if(localStorage.getItem("aria-expanded2")=='false' && isOpen2.classList.contains("show")){
        isOpen2.classList.remove("show");
        document.getElementById("acc-buttonTwo").innerHTML="Afiseaza Produse";
    }
    else if(localStorage.getItem("aria-expanded2")=='true'){
        document.getElementById("acc-buttonTwo").innerHTML="Ascunde Produse";
    }
});