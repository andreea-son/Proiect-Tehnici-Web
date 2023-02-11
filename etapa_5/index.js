const express= require("express");
const fs=require("fs");
app=express();

app.set("view engine","ejs");
console.log("Cale proiect:", __dirname);
app.use("/resurse", express.static(__dirname+"/resurse"));

const sharp=require("sharp");

const sass=require("sass");
var cssBootstrap=sass.compile(__dirname+"/resurse/sass/customizare-bootstrap.scss",{sourceMap:true});
fs.writeFileSync(__dirname+"/resurse/css/biblioteci/customizare-bootstrap.css",cssBootstrap.css);

const {Client}=require("pg");
var client= new Client({database:"buticul_cu_flori",
    user:"andreea", 
    password:"andreea", 
    host:"localhost",
    port:5432});
client.connect();

obGlobal={
    erori:null,
    imagini:null,
    tipuri:null
}

function createImages(){
    var continutFisier=fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf8");
    var obiect=JSON.parse(continutFisier);
    var dim_mediu = 350;
    var dim_mic = 300;
    obGlobal.imagini=obiect.imagini;

    obGlobal.imagini.forEach(function (elem){
        [numeFisier, extensie] = elem.fisier.split(".");
        elem.fisier = obiect.cale_galerie + "/" + elem.fisier;

        if(!fs.existsSync(__dirname+"/"+obiect.cale_galerie+"/mediu/")){
            fs.mkdirSync(__dirname+"/"+obiect.cale_galerie+"/mediu/");
        }
        elem.fisier_mediu=obiect.cale_galerie+"/mediu/"+numeFisier+".webp";
        sharp(__dirname+"/"+elem.fisier).resize(dim_mediu).toFile(__dirname+"/"+elem.fisier_mediu);

        if(!fs.existsSync(__dirname+"/"+obiect.cale_galerie+"/mic/")){
            fs.mkdirSync(__dirname+"/"+obiect.cale_galerie+"/mic/");
        }
        elem.fisier_mic=obiect.cale_galerie+"/mic/"+numeFisier+".webp";
        sharp(__dirname+"/"+elem.fisier).resize(dim_mic).toFile(__dirname+"/"+elem.fisier_mic);
    });
    console.log(obGlobal.imagini);
}
createImages();

function createErrors(){
    var continutFisier=fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf8");
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

client.query("select * from unnest(enum_range(NULL::tipuri_flori))", function(err, rezTip){
    if(err){
        console.log(err);
        renderError(res, 2);
    }
    else{
        obGlobal.tipuri=rezTip.rows;
    }
});

app.use("/*", function(req, res, next){ 
    res.locals.tipuri=obGlobal.tipuri;
    next();
});

app.get(["/","/index","/home"],function(req, res){
    console.log("url: /index");
    res.render("pagini/index", {ip:req.ip, imagini:obGlobal.imagini});
});

app.get("/galerie", function(req, res){
    res.render('pagini/galerie', {imagini: obGlobal.imagini});
});

app.get("/produse",function(req, res){
    console.log(req.query);
    client.query("select * from unnest(enum_range(null::ocazii_flori))", function(err, rezCateg){
        if(err){
            console.log(err);
            renderError(res, 2);
        }
        else{
            continuareQuery=""
            if (req.query.tip)
                continuareQuery+=` and tip_produs='${req.query.tip}'`
            client.query("select * from flori where 1=1 " + continuareQuery , function(err, rez){
                if(err){
                    console.log(err);
                    renderError(res, 2);
                }
                else{
                    res.render("pagini/produse", {produse:rez.rows, optiuni:rezCateg.rows});
                }
            });
        }
    });
});

app.get("/produs/:id",function(req, res){
    console.log(req.params);
    client.query("select * from flori where id="+req.params.id, function(err, rez){
        if(err){
            console.log(err);
            renderError(res, 2);
        }
        else{
            res.render("pagini/produs", {prod:rez.rows[0], optiuni: []});
            console.log(rez);
        }
    });
});

app.get("*.ejs",function(req, res){
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

app.listen(8088);
console.log("Serverul a pornit!");