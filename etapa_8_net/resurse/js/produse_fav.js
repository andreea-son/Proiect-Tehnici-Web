window.addEventListener("DOMContentLoaded",  function(){
    var produse=document.getElementsByClassName("produs");
    var v_produse=Array.from(produse);
    var zile=["Duminica", "Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata"];
    var luni=["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
    for(i=0; i<v_produse.length; i++){
        var data_adaugare = new Date(document.getElementsByClassName("val-data")[i].innerHTML);
        var data_formatata = zile[data_adaugare.getDay()] + ", " + data_adaugare.getDate() + "-" + luni[data_adaugare.getMonth()] + "-" + data_adaugare.getFullYear();
        document.getElementsByClassName("val-data")[i].innerHTML = data_formatata;
        if(document.getElementsByClassName("val-livrare")[i].innerHTML == "true"){
            document.getElementsByClassName("val-livrare")[i].innerHTML = "Da";
        }
        else{
            document.getElementsByClassName("val-livrare")[i].innerHTML = "Nu";
        }
    }
});