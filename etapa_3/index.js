const express= require("express");
const fs=require("fs");
app=express();

app.set("view engine","ejs");
console.log("Cale proiect:", __dirname);
app.use("/Resurse", express.static(__dirname+"/Resurse"));

obGlobal={
    erori:null
}

function createErrors(){
    var continutFisier=fs.readFileSync(__dirname+"/Resurse/json/erori.json").toString("utf8");
    obGlobal.erori=JSON.parse(continutFisier);
}
createErrors();

function renderError(res, identificator, titlu, text, imagine){
    var eroare = obGlobal.erori.info_erori.find(function(elem){
        return elem.identificator==identificator;
    })
    titlu = titlu || (eroare && eroare.titlu) || obGlobal.erori.eroare_default.titlu;
    text = text || (eroare && eroare.text) || obGlobal.erori.eroare_default.text;
    imagine = imagine || (eroare && obGlobal.erori.cale_baza+"/"+eroare.imagine) || obGlobal.erori.cale_baza+"/"+obGlobal.erori.eroare_default.imagine;
    if(eroare && eroare.status){
        res.status(identificator).render("pagini/eroare", {titlu:titlu, text:text, imagine:imagine})
    }
    else{
        res.render("pagini/eroare", {titlu:titlu, text:text, imagine:imagine});
    }
}

app.get(["/","/index","/home"],function(req, res){
    console.log("url: /index");
    res.render("pagini/index", {ip: req.ip});
});

app.get(["/*.ejs"],function(req, res){
    console.log("url:", req.url);
    renderError(res, 403);
});

app.get("/*",function(req, res){
    console.log("url:", req.url);
    res.render("pagini"+req.url, function(err,rezRandare){
        if(err){
            if(err.message.includes("Failed to lookup view")){
                renderError(res, 404);
            }
            else{

            }
        }
        else{
            res.send(rezRandare);
        }
    });
});

app.get('/serviciu-clienti', (_req, res) => {
    res.render('pagini/serviciu-clienti')
})

app.listen(8080);
console.log("Serverul a pornit!");