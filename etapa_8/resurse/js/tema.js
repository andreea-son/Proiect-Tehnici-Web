window.addEventListener("DOMContentLoaded",  function(){
    temaCurenta=localStorage.getItem("tema");
    if(temaCurenta)
        document.body.classList.add(temaCurenta);
    
    if(document.getElementsByClassName("fa-regular")[0].classList.contains("fa-sun") && !document.body.classList.contains("dark")){
        document.getElementsByClassName("fa-regular")[0].classList.remove("fa-sun");
        document.getElementsByClassName("fa-regular")[0].classList.add("fa-moon");
    }

    if(document.getElementsByClassName("fa-regular")[0].classList.contains("fa-moon") && document.body.classList.contains("dark")){
        document.getElementsByClassName("fa-regular")[0].classList.remove("fa-moon");
        document.getElementsByClassName("fa-regular")[0].classList.add("fa-sun");
    }

    document.getElementById("tema").onclick=function(){
        if (document.body.classList.contains("dark")){
            document.body.classList.remove("dark");
            
            localStorage.removeItem("tema");

            if(document.getElementsByClassName("fa-regular")[0].classList.contains("fa-sun")){
                document.getElementsByClassName("fa-regular")[0].classList.remove("fa-sun");
                document.getElementsByClassName("fa-regular")[0].classList.add("fa-moon");
            }
        }
        else{
            document.body.classList.add("dark");
            localStorage.setItem("tema","dark");
            
            if(document.getElementsByClassName("fa-regular")[0].classList.contains("fa-moon")){
                document.getElementsByClassName("fa-regular")[0].classList.remove("fa-moon");
                document.getElementsByClassName("fa-regular")[0].classList.add("fa-sun");
            }
        }
    }
});