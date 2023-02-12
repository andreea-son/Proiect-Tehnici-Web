window.addEventListener("load",  function(){
    var livrare = document.getElementsByClassName("prod-val-livrare")[0];
    var data = document.getElementsByClassName("prod-val-data")[0];

    var zile=["Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata", "Duminica"];
    var luni=["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];

    var data_adaugare = new Date(data.innerHTML);
    var data_formatata = zile[data_adaugare.getDay() - 1] + ", " + data_adaugare.getDate() + "-" + luni[data_adaugare.getMonth()] + "-" + data_adaugare.getFullYear();
    data.innerHTML = data_formatata;
    if(livrare.innerHTML == "true"){
        livrare.innerHTML = "Da";
    }
    else{
        livrare.innerHTML = "Nu";
    }
});