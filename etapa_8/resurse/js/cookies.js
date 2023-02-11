function setCookie(nume, val, timpExpirare){
    d=new Date();
    //d.setDate(d.getDate() + timpExpirare);
    d.setTime(d.getTime()+timpExpirare);
    pathCookie = '/';
    document.cookie=`${nume}=${val}; expires=${d.toUTCString()}; path=${pathCookie}`;
}

function getCookie(nume){
    vectorParametri=document.cookie.split(";");
    for(let param of vectorParametri){
        if (param.trim().startsWith(nume+"="))
            return param.split("=")[1];
    }
    return null;
}

function deleteCookie(nume){
    console.log(`${nume}; expires=${(new Date()).toUTCString()}`);
    document.cookie=`${nume}=0; expires=${(new Date()).toUTCString()}`;
}

function deleteAllCookies(){
    var cookies=document.cookie.split(";");
    for(let cookie of cookies){
        var cookieName = cookie.split("=")[1];
        document.cookie=`${cookieName}=0; expires=${(new Date()).toUTCString()}`;
    }
}

function setProductCookie(){
    if((window.location.href).includes("/produs/")){
        var produsCurent = window.location.href;
        var idProdus = produsCurent.split("/produs/")[1];
        var valoare = idProdus+"-"+document.getElementsByClassName("prod-nume")[0].innerHTML;
        var nume = "ultimul_produs";
        setCookie(nume, valoare, 60000);
    }
}

window.addEventListener("DOMContentLoaded", function(){
    console.log(document.cookie);
    if (!getCookie("acceptat_banner")){
        if(getCookie("ultimul_produs")){
            deleteCookie("ultimul_produs");
        }
        document.getElementById("print-banner").style.display="block";
    }
    else if(getCookie("acceptat_banner")){
        setProductCookie();
    }
    if(getCookie("ultimul_produs")){
        var a = document.getElementById("ultimul-produs");
        if(a){
            var valoare = getCookie("ultimul_produs").split("-");
            var idProdus = valoare[0];
            var nume = valoare[1];
            a.href = "/produs/"+idProdus;
            a.innerHTML = nume;
        }
    }
    else if(!getCookie("ultimul_produs")){
        if(document.getElementById("p-ult-prod")){
            document.getElementById("p-ult-prod").style.display="none";
        }
    }
    this.document.getElementById("ok_cookies").onclick=function(){
        setCookie("acceptat_banner",true,60000);
        setProductCookie();
        document.getElementById("print-banner").style.display="none";
    }
})
