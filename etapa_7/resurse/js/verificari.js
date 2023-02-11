window.addEventListener("load",  function(){
    document.getElementById("username").addEventListener("keyup", () => {
        var username = document.getElementById("username");
        var message = document.getElementById("mesaj_username");
        if(username.value.match(new RegExp(/(?=.*\w)(?=.*[\W]*).{5,}/)) || username.value == "")
        {
            message.className = "valid";
            message.textContent = "";
            message.className = "error";
        }
        else
        {
            message.className = "invalid";
            message.textContent = 'Lungimea minima este de 5 caractere';
            message.className = "error active";
        }
    })
    if (document.getElementById("parola_confirm") != null){
        document.getElementById("parola_confirm").addEventListener("keyup", () => {
            var password = document.getElementById("parola");
            var confirmedPassword = document.getElementById("parola_confirm");
            var message = document.getElementById("mesaj_confirmare");
            if(password.value != ""){
                if(password.value == confirmedPassword.value)
                {
                    message.className = "valid";
                    message.textContent = "";
                    message.className = "error";
                }
                else
                {
                    message.className = "invalid";
                    message.textContent = 'Nu este aceeasi parola';
                    message.className = "error active";
                }
            }
            else if(password.value == ""){
                message.className = "valid";
                message.textContent = "";
                message.className = "error";
            }
        })    
        document.getElementById("prenume").addEventListener("keyup", () => {
            var prenume = document.getElementById("prenume");
            var message = document.getElementById("mesaj_prenume");
            if(prenume.value.match(new RegExp("^[A-Z][a-z]+$")) || prenume.value == "")
            {
                message.className = "valid";
                message.textContent = "";
                message.className = "error";
            }
            else
            {
                message.className = "invalid";
                message.textContent = 'Introduceti un prenume valid si cu majuscula';
                message.className = "error active";
            }
        })
    }
    if(document.getElementById("parola_noua").style.display == "block"){
        document.getElementById("parola_noua").addEventListener("keyup", () => {
            var parola_noua = document.getElementById("parola_noua");
            var message = document.getElementById("mesaj_parola_noua");
            if(parola_noua.value.match(new RegExp(/(?=.*\d.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[.]).{5,}/)) || parola_noua.value == "")
                {
                    message.className = "valid";
                    message.textContent = "";
                    message.className = "error";
                }
            else
            {
                message.className = "invalid";
                message.textContent = 'Respectati formatul cerut!';
                message.className = "error active";
            }
        })
    }
    document.getElementById("nume").addEventListener("keyup", () => {
        var nume = document.getElementById("nume");
        var message = document.getElementById("mesaj_nume");
        if(nume.value.match(new RegExp("^[A-Z][a-z]+$")) || nume.value == "")
        {
            message.className = "valid";
            message.textContent = "";
            message.className = "error";
        }
        else
        {
            message.className = "invalid";
            message.textContent = 'Introduceti un nume valid si cu majuscula';
            message.className = "error active";
        }
    })
    if (document.getElementById("parola_confirm") != null){
        document.getElementById("parola").addEventListener("keyup", () => {
            var password = document.getElementById("parola");
            var message = document.getElementById("mesaj_parola");
            if(password.value.match(new RegExp(/(?=.*\d.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[.]).{5,}/)) || password.value == "")
            {
                message.className = "valid";
                message.textContent = "";
                message.className = "error";
            }
            else
            {
                message.className = "invalid";
                message.textContent = 'Respectati formatul cerut!';
                    message.className = "error active";
            }
        })
    }
    document.getElementById("email").addEventListener("keyup", () => {
        var email = document.getElementById("email");
        var message = document.getElementById("mesaj_email");
        if(email.value.match(new RegExp("^.+@.+\.[a-zA-Z]{2,}$")) || email.value == "")
        {
            message.className = "valid";
            message.textContent = "";
            message.className = "error";
        }
        else
        {
            message.className = "invalid";
            message.textContent = 'Email invalid!';
            message.className = "error active";
        }
    })
    document.getElementById("buton_submit").addEventListener("click", (event) => {
        event.preventDefault();
        var cond1=false, cond2=false, cond3=false, cond4=false, cond5=false, cond6=false;
        var username = document.getElementById("username");
        if(username.value.match(new RegExp(/(?=.*\w)(?=.*[\W]*).{5,}/))){
           cond1 = true;
        }
        var password = document.getElementById("parola");
        var confirmedPassword = document.getElementById("parola_confirm");
        if(confirmedPassword != null){
            if(password.value != ""){
                if(password.value == confirmedPassword.value){
                    cond2 = true;
                }
            }
        }
        else{
            cond2 = true;
        }
        var prenume = document.getElementById("prenume");
        if(prenume.value.match(new RegExp("^[A-Z][a-z]+$"))){
            cond3 = true;
        }
        var nume = document.getElementById("nume");
        if(nume.value.match(new RegExp("^[A-Z][a-z]+$"))){
            cond4 = true;
        }
        if(confirmedPassword != null){
            var password = document.getElementById("parola");
                if(password.value.match(new RegExp(/(?=.*\d.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[.]).{5,}/))){
                    cond5 = true;
                }
        }
        else{
            cond5 = true;
        }
        
        var email = document.getElementById("email");
        if(email.value.match(new RegExp("^.+@.+\.[a-zA-Z]{2,}$"))){
            cond6 = true;
        }
        var message = document.getElementById("mesaj_invalid");
        var form = document.getElementById("form_inreg");
        if(!cond1 || !cond2 || !cond3 || !cond4 || !cond5 || !cond6){
            message.className = "invalid";
            message.textContent = 'Unul dintre campuri nu a fost completat corespunzator!';
            message.className = "error active";
        }
        else{
            message.className = "valid";
            message.textContent = "";
            message.className = "error";
            form.submit();
        }
    });
});