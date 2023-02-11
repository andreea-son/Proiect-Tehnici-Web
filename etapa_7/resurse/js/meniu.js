window.addEventListener("DOMContentLoaded",  function(){
    window.onresize=function(){
        if(window.innerWidth >= 700){
            document.getElementById("ch-menu").checked = false;
        }
    }
});