window.addEventListener("DOMContentLoaded",  function(){
    temaCurenta=localStorage.getItem("tema");
    if(temaCurenta)
        document.body.classList.add(temaCurenta);

    document.getElementById("tema").onclick=function(){
        if (document.body.classList.contains("dark")){
            document.body.classList.remove("dark");
            
            localStorage.removeItem("tema");
            
            document.getElementsByClassName("fa-sun")[0].style.display="none";
            document.getElementsByClassName("fa-moon")[0].style.display="inline";
        }
        else{
            document.body.classList.add("dark");
            localStorage.setItem("tema","dark");
            document.body.classList.add("dark");
            
            document.getElementsByClassName("fa-sun")[0].style.display="inline";
            document.getElementsByClassName("fa-moon")[0].style.display="none";
        }
    }
});