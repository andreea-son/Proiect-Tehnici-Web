const express= require("express");
const fs=require("fs");
const formidable=require("formidable");
const sharp=require("sharp");
const sass=require("sass");
const {Client}=require("pg");
const path= require("path");
const {Utilizator}=require("./module_proprii/utilizator.js");
const AccesBD=require("./module_proprii/accesBD.js");
const session=require('express-session');
const Drepturi = require("./module_proprii/drepturi.js");
const bodyParser = require('body-parser');
const ejs= require("ejs");
const mongodb=require('mongodb');
const QRCode= require('qrcode');
const puppeteer=require('puppeteer');
const request=require("request");
const xmljs=require('xml-js');
app=express();

app.use(session({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: false
}));

app.set("view engine","ejs");
console.log("Cale proiect:", __dirname);
app.use("/resurse", express.static(__dirname+"/resurse"));
app.use("/poze_uploadate", express.static(__dirname+"/poze_uploadate"));

var cssBootstrap=sass.compile(__dirname+"/resurse/sass/customizare-bootstrap.scss",{sourceMap:true});
fs.writeFileSync(__dirname+"/resurse/css/biblioteci/customizare-bootstrap.css",cssBootstrap.css);

var client= new Client({database:"buticul_cu_flori",
    user:"andreea", 
    password:"andreea", 
    host:"localhost",
    port:5432});
client.connect();

obGlobal={
    erori:null,
    imagini:null,
    tipuri:null,
    protocol:"http://",
    numeDomeniu:"localhost:8088",
    clientMongo:mongodb.MongoClient,
    bdMongo:null,
    utiliz:null
}

var url = "mongodb://127.0.0.1:27017";

obGlobal.clientMongo.connect(url, function(err, bd) {
    if (err) console.log(err);
    else{
        obGlobal.bdMongo = bd.db("proiect_web");
    }
});

const foldere=["temp", "poze_uploadate"];
for (let folder of foldere){
    let calefolder=path.join(__dirname,folder);
    if (!fs.existsSync(calefolder))
        fs.mkdirSync(calefolder);
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

function resizeImages(my_path, username){
    crop_path = "crop_" + my_path;
    newpath = path.join(__dirname, "poze_uploadate", username, crop_path);
    oldpath = path.join(__dirname, "poze_uploadate", username, my_path);
    var image = sharp(oldpath);
    image.resize(300).toFile(newpath);
    return crop_path;
}

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

async function genereazaPdf(stringHTML,numeFis, callback) {
    const chrome = await puppeteer.launch();
    const document = await chrome.newPage();
    console.log("inainte load")
    await document.setContent(stringHTML, {waitUntil:"load"});
    
    console.log("dupa load")
    await document.pdf({path: numeFis, format: 'A4'});
    await chrome.close();
    if(callback)
        callback(numeFis);
}

client.query("select * from unnest(enum_range(null::tipuri_flori))", function(err, rezTip){
    if(err){
        console.log(err);
        renderError(res, 2);
    }
    else{
        obGlobal.tipuri=rezTip.rows;
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/*", function(req, res, next){
    res.locals.tipuri=obGlobal.tipuri;
    res.locals.problema_vedere = "false";
    if (req.session.utilizator){
        req.utilizator=res.locals.utilizator=new Utilizator(req.session.utilizator);
        res.locals.problema_vedere=req.session.utilizator.problema_vedere;
    }
    if (req.session.succesLogin){
        res.locals.succesLogin=req.session.succesLogin;
    }
    next();
});

app.all("/*", function(req, res, next){
    let id_utiliz=req?.session?.utilizator?.id;
    id_utiliz=id_utiliz?id_utiliz:null;
    console.log(id_utiliz);
    if(id_utiliz){
        AccesBD.getInstanta().insert({
            tabel:"utilizatori_logati",
            campuri:["user_id"],
            valori:[`${id_utiliz}`]
            }, function(err, rezQuery){
                console.log(err);
            }
         )
    }
    next();
});

function stergeAccesariVechi(){
    AccesBD.getInstanta().delete({
        tabel:"utilizatori_logati",
        conditiiAnd:["now() - last_login >= interval '24 hours'"]}, 
        function(err, rez){
            console.log(err);
        })
}
stergeAccesariVechi();
setInterval(stergeAccesariVechi, 60*60*1000);

app.get(["/","/index","/home"],function(req, res){
    client.query("select * from (select distinct on (u.username) u.username, u.nume, u.prenume, l.last_login from utilizatori u join utilizatori_logati l on u.id = l.user_id where now()-l.last_login <= interval '5 minutes' order by u.username, l.last_login desc) my_select order by last_login desc",
        function(err, rez){
            if(err){
                console.log(err);
            }
            let useriOnline=[];
            if(!err && rez.rowCount!=0)
                useriOnline=rez.rows;
            console.log(err);

            var evenimente=[]
            var locatie="";
            
            request('https://secure.geobytes.com/GetCityDetails?key=7c756203dbb38590a66e01a5a3e1ad96&fqcn=109.99.96.15',
                function (error, response, body) {
                    locatie="Nu se poate detecta pentru moment."
                if(error) {
                    console.error('eroare geobytes:', error)
                }
                else{
                    var obiectLocatie=JSON.parse(body);
                    console.log(obiectLocatie);
                    locatie=obiectLocatie.geobytescountry+" "+obiectLocatie.geobytesregion
                }
                client.query("select * from unnest(enum_range(null::ocazii_flori))", function(err, rezCateg){
                    if(err){
                        console.log(err);
                        renderError(res, 2);
                    }
                    else{
                        continuareQuery=""
                        if (req.query.tip)
                            continuareQuery+=` and tip_produs='${req.query.tip}'`
                        client.query("select * from flori where 1=1 " + continuareQuery , function(err, rezFlori){
                            if(err){
                                console.log(err);
                                renderError(res, 2);
                            }
                            else{
                                res.render("pagini/index", {ip: req.ip, imagini:obGlobal.imagini, useriOnline:useriOnline, evenimente:evenimente, locatie:locatie, produse:rezFlori.rows});
                            }
                        });
                    }
                });     
        });
    });
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

app.get("/confirmare_mail/:tokenData/:username/:tokenConsoane",function(req,res){
    try {
        Utilizator.getUtilizDupaUsername(req.params.username,{res:res,token:req.params.tokenConsoane}, function(u,obparam){
            AccesBD.getInstanta().update({
                tabel:"utilizatori",
                campuri:['confirmat_mail'],
                valori:['true'],
                conditiiAnd:[`cod='${obparam.token}'`]},
                function (err, rezUpdate){
                    if(err || rezUpdate.rowCount==0){
                        console.log("Cod:", err);
                        renderError(res,3);
                    }
                    else{
                        res.render("pagini/confirmare");
                    }
                })
        })
    }
    catch (e){
        console.log(e);
        renderError(res,2);
    }
})

app.post("/inregistrare", function(req, res){
    var username;
    var formular=new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier){
        console.log("Inregistrare:",campuriText);
        console.log(campuriFisier);
        var utilizNou=new Utilizator();
        try{
            utilizNou.setareNume=campuriText.nume;
            utilizNou.setareUsername=campuriText.username;
            utilizNou.setareEmail=campuriText.email;
            utilizNou.setarePrenume=campuriText.prenume;
            utilizNou.setareParola=campuriText.parola;

            utilizNou.data_nasterii=campuriText.data;
            utilizNou.culoare_chat=campuriText.culoare_chat;
            if(!campuriText.problema_vedere_ch){
                utilizNou.problema_vedere=false;
            }
            else{
                utilizNou.problema_vedere=true;
            }
            utilizNou.fotografie=campuriFisier.fotografie.originalFilename;
            console.log(campuriFisier.fotografie.originalFilename);
            if(campuriFisier.fotografie.originalFilename != ""){
                let folderUser=path.join(__dirname, "poze_uploadate", campuriText.username);
                if (!fs.existsSync(folderUser))
                    fs.mkdirSync(folderUser);
                var oldpath = campuriFisier.fotografie.filepath;
                var newpath = path.join(folderUser, campuriFisier.fotografie.originalFilename);
                fs.rename(oldpath, newpath, function (err) {
                    if (err) throw err;
                    console.log("poza uploadata!");
                });
                utilizNou.fotografie = resizeImages(campuriFisier.fotografie.originalFilename, campuriText.username);
            }
            Utilizator.getUtilizDupaUsername(campuriText.username, {}, function(uRaw, parametru, eroareUser){
                let u = new Utilizator(uRaw);
                utilizNou.existaUtilizator((result)=>{
                    if(result.rowCount == 1)
                    {
                        res.render("pagini/inregistrare", {err: "Exista deja username-ul!"});
                    }
                    else if(result.rowCount == 0){
                        utilizNou.salvareUtilizator();
                        res.render("pagini/inregistrare", {raspuns:"Inregistrare cu succes!"});
                    }
                });
            })
        }
        catch(e){ 
            console.log(e.message);
            console.log("A aparut o eroare. Reveniti mai tarziu!");
            res.render("pagini/inregistrare", {err: "A aparut o eroare. Reveniti mai tarziu!"});
        }
    });
    formular.on("field", function(nume,val){
        console.log(`--- ${nume}=${val}`);
        if(nume=="username")
            username=val;
    //todo
    })
    formular.on("file", function(nume,fisier){
        console.log("file");
        console.log(nume,fisier);
    });
});

app.post("/autentificare", function(req, res){
    var formular = new formidable.IncomingForm();
    formular.parse(req, function(err, campuriText, campuriFisier){
        try{
            Utilizator.getUtilizDupaUsername (campuriText.username_login,{
                req:req,
                res:res,
                parola:campuriText.parola_login
            }, function(uRaw, obparam, error){
                if(error){
                    console.log(error);
                    obparam.res.render("pagini/autentificare",{eroareLogin:"Datele introduse nu sunt corecte sau nu a fost confirmat mailul!",  imagini:obGlobal.imagini});
                }
                else{
                    let parolaCriptata=Utilizator.criptareParola(obparam.parola);
                    if(uRaw.parola==parolaCriptata && uRaw.confirmat_mail == true){
                        uRaw.fotografie=uRaw.fotografie ? uRaw.fotografie :"";
                        console.log(uRaw.rol);
                        obparam.req.session.utilizator=new Utilizator(uRaw);
                        obparam.req.session.succesLogin="Buna ziua, "+uRaw.nume+" "+uRaw.prenume+"!";
                        obparam.res.redirect("/autentificare");
                    }
                    else{
                        obparam.res.render("pagini/autentificare",{eroareLogin:"Datele introduse nu sunt corecte sau nu a fost confirmat mailul!",  imagini:obGlobal.imagini});
                    }
                }
            })
        }
        catch(e){
            console.log(e);
        }
    });
});

app.post("/profil", function(req, res){
    var formular= new formidable.IncomingForm();
    formular.parse(req,function(err, campuriText, campuriFile){
        var parolaCriptata=Utilizator.criptareParola(campuriText.parola);
        var parolaNouaCriptata = null;
        if(campuriText.parola_noua != ""){
            parolaNouaCriptata=Utilizator.criptareParola(campuriText.parola_noua);
        }
        var p_vedere;
        if(!campuriText.problema_vedere_ch){
            p_vedere=false;
        }
        else{
            p_vedere=true;
        }
        AccesBD.getInstanta().update(
            {tabel:"utilizatori",
            campuri:["nume","prenume","email","culoare_chat","problema_vedere","fotografie","data_nasterii", "parola"],
            valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`, `${p_vedere}`, `${campuriFile.fotografie.originalFilename ? "crop_" + campuriFile.fotografie.originalFilename : req.session.utilizator.fotografie}`,`${campuriText.data ? campuriText.data : res.locals.utilizator.data_nasterii}`, `${parolaNouaCriptata ? parolaNouaCriptata : parolaCriptata}`],
            conditiiAnd:[`parola='${parolaCriptata}'`, `username='${req.session.utilizator.username}'`]
        },  function(err, rez){
            if(err){
                console.log(err);
                return;
            }
            if(rez.rowCount==0){
                res.render("pagini/profil",{mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa.", culoare:"red"});
                return;
            }
            else{
                if(campuriFile.fotografie.originalFilename != ""){
                    let folderUser=path.join(__dirname, "poze_uploadate", campuriText.username);
                    if (!fs.existsSync(folderUser))
                        fs.mkdirSync(folderUser);
                    var oldpath = campuriFile.fotografie.filepath;
                    var newpath = path.join(folderUser, campuriFile.fotografie.originalFilename);
                    var oldpath = campuriFile.fotografie.filepath;
                    var newpath = path.join(folderUser, campuriFile.fotografie.originalFilename);
                    fs.rename(oldpath, newpath, function (err) {
                        if (err) throw err;
                        console.log("poza uploadata!");
                    });
                    req.session.utilizator.fotografie = resizeImages(campuriFile.fotografie.originalFilename, req.session.utilizator.username);
                }
                req.session.utilizator.nume=campuriText.nume;
                req.session.utilizator.prenume=campuriText.prenume;
                req.session.utilizator.email=campuriText.email;
                req.session.utilizator.culoare_chat=campuriText.culoare_chat;
                req.session.utilizator.data_nasterii=campuriText.data ? campuriText.data : res.locals.utilizator.data_nasterii;
                req.session.utilizator.problema_vedere=p_vedere;
                res.locals.utilizator=req.session.utilizator;
                Utilizator.trimiteMail("Mesaj informare", `Salutare, ${req.session.utilizator.prenume} ${req.session.utilizator.nume}.`, `<h1>Salutare, ${req.session.utilizator.prenume} ${req.session.utilizator.nume}!</h1><p>Profilul tau a fost modificat. Noile informatii ale contului sunt:
                <ul style="list-style-type: none">
                    <li>prenume: ${req.session.utilizator.prenume}</li>
                    <li>nume: ${req.session.utilizator.nume}</li>
                    <li>email: ${req.session.utilizator.email}</li>
                    <li>culoarea chat-ului: ${req.session.utilizator.culoare_chat}</li>
                    <li>data nasterii: ${req.session.utilizator.data_nasterii}</li>
                    <li>probleme vedere: ${req.session.utilizator.problema_vedere ? "Da" : "Nu"}</li>
                </ul>
                </p>`, [], `${req.session.utilizator.email}`);
                res.render("pagini/profil",{mesaj:"Update-ul s-a realizat cu succes!", culoare:"green"});
            }
        });
    });
});

app.get("/utilizatori", function(req, res){
    if(req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)){
        AccesBD.getInstanta().select({tabel:"utilizatori", campuri:["*"]}, function(err, rezQuery){
            console.log(err);
            res.render("pagini/utilizatori", {useri: rezQuery.rows});
            console.log(rezQuery.rows);
        });
    }
    else{
        renderError(res, 403);
    }
});

app.post("/sterge/:id",function(req, res){
    AccesBD.getInstanta().update(
        {tabel:"utilizatori",
        campuri:["fotografie"],
        valori:[``],
        conditiiAnd:[`id='${req.params.id}'`]
    },  function(err, rez){
        if(err){
            console.log(err);
            return;
        }
        else{
            AccesBD.getInstanta().select({
                tabel:"utilizatori",
                campuri:["prenume", "nume", "email"],
                conditiiAnd:[`id='${req.params.id}'`]},  function(err, result)
                {
                    if(err){
                        console.log(err);
                        return;
                    }
                    else{      
                        Utilizator.trimiteMail("Mesaj informare", `Ne pare rau, ${result.rows[0].prenume} ${result.rows[0].nume}.`, `<h1>Salutare, ${result.rows[0].prenume} ${result.rows[0].nume}!</h1><p>Ne pare rau, insa poza ta de profil a fost stearsa de catre administratorul site-ului nostru.</p>`, [], `${result.rows[0].email}`);
                    }
                });
            AccesBD.getInstanta().select({tabel:"utilizatori", campuri:["*"]}, function(err, rezQuery){
                console.log(err);
                res.render("pagini/utilizatori", {useri: rezQuery.rows, mesaj: "Stergerea a fost realizata cu succes!"});
                console.log(rezQuery.rows);
            });
        }
    });
});

app.get("/administrare", function(req, res){
    client.query("select * from flori where 1=1 order by id", function(err, rezQuery){
        if(err){
            console.log(err);
        }
        else{
            console.log("prods", rezQuery.rows);
            res.render("pagini/administrare", {produse: rezQuery.rows, mesaj:""});
        }
    });
});

app.post("/administrare", function(req, res){
        id_prod = req.body.gr_rad_id;
        AccesBD.getInstanta().delete({tabel:"flori", conditiiAnd:[`id=${id_prod}`]}, function(err, rezQuery){
            if(err){
                console.log(err);
            }
            else{
                client.query("select * from flori where 1=1 order by id", function(err, rezProd){
                    if(err){
                        console.log(err);
                    }
                    else{
                        res.render("pagini/administrare", {mesaj: "Stergerea s-a realizat cu succes!", produse: rezProd.rows});
                    }
                });
               
            }
        });  
});

app.post("/stergere_cont", function(req, res){
    var formular = new formidable.IncomingForm();
    formular.parse(req,function(err, campuriText, campuriFile){
        var parolaCriptata=Utilizator.criptareParola(campuriText.parola_delete);
        AccesBD.getInstanta().delete({
            tabel:"utilizatori",
            conditiiAnd:[`parola='${parolaCriptata}'`, `username='${req.session.utilizator.username}'`]}, 
            function(err, rez){
                if(err){
                    console.log(err);
                    return;
                }
                if(rez.rowCount==0){
                    res.render("pagini/stergere_cont",{mesaj:"Steregerea contului nu s-a realizat. Verificati parola introdusa."});
                    return;
                }
                else{
                    Utilizator.trimiteMail("Mesaj informare", `Stergerea contului dumneavostra, ${req.session.utilizator.username}.`, `<h1>Salutare, ${req.session.utilizator.prenume} ${req.session.utilizator.nume}!</h1><p>Va confirmam stergerea contului dvs.</p>`, [], `${req.session.utilizator.email}`);
                    req.session.utilizator=null;
                    res.render("pagini/confirmare_stergere");
                }
            })
        });
});

app.get("/delogare", function(req, res){
    req.session.destroy();
    res.locals.utilizator=null;
    res.render("pagini/delogare");
});

app.post("/produse_cos",function(req, res){
    if(req.body.ids_prod.length!=0){
        AccesBD.getInstanta().select({tabel:"flori", campuri:"nume,descriere,pret,imagine,ridicare_personala,ocazie".split(","),conditiiAnd:[`id in (${req.body.ids_prod})`]},
        function(err, rez){
            if(err){
                res.send([]);
                console.log(err);
            }
            else
                res.send({prods: rez.rows, cantitati: req.body.cantitate});
        });
    }
    else{
        res.send([]);
    }
 
});

app.get("/grafice", function(req,res){
    if (!(req?.session?.utilizator && req.utilizator.areDreptul(Drepturi.vizualizareGrafice))){
        renderError(res, 403);
        return;
    }
    res.render("pagini/grafice");
})

app.get("/update_grafice",function(req,res){
    obGlobal.bdMongo.collection("facturi").find({}).toArray(function(err, rezultat) {
        res.send(JSON.stringify(rezultat));
    });
})

app.get("/facturi", function(req, res){
    if(obGlobal.bdMongo){
        obGlobal.bdMongo.collection("facturi").find({}).sort({"data":1, "nume": 1, "prenume": 1}).toArray(function(err, rezultat) {
            console.log(rezultat)
            res.render("pagini/facturi", {facturi:(rezultat)});
        });
    }
});

app.get("/comenzi", function(req, res){
    if(obGlobal.bdMongo){
        obGlobal.bdMongo.collection("facturi").find({username: `${req.session.utilizator.username}`}).toArray(function(err, item) {
            if(err) console.log(err);
            else{
                res.render("pagini/comenzi", {facturi:(item)})
            }
        })
    }
})

app.post("/cumpara", function(req, res){
    console.log(req.body);
    console.log("Utilizator:", req?.utilizator);
    console.log("Utilizator:", req?.utilizator?.rol?.areDreptul?.(Drepturi.cumparareProduse));
    console.log("Drept:", req?.utilizator?.areDreptul?.(Drepturi.cumparareProduse));
    if (req?.utilizator?.areDreptul?.(Drepturi.cumparareProduse)){
        AccesBD.getInstanta().select({
            tabel:"flori",
            campuri:["*"],
            conditiiAnd:[`id in (${req.body.ids_prod})`]
        }, function(err, rez){
            var cantitati_prod = {};
            for(let idx in req.body.cantitate){
                var key = req.body.cantitate[idx].split("-")[1];
                var value = req.body.cantitate[idx].split("-")[0];
                cantitati_prod[key] = value;
            }
            var prods = [];
            for(let prod of rez.rows){
                if(prod.stoc < cantitati_prod[prod.id]){
                    prods.push(prod.nume);
                }
            }
            if(prods.length == 1)
                res.send(`Nu mai este stoc sufiecient pentru produsul ${prods[0]}!`);
            else if(prods.length > 1){
                res.send(`Nu mai este stoc sufiecient pentru produsele ${prods}!`);
            }
            else{
                if(!err && rez.rowCount>0){
                    cale_qr="./resurse/imagini/qrcode";
                    if (fs.existsSync(cale_qr))
                        fs.rmSync(cale_qr, {force:true, recursive:true});
                    fs.mkdirSync(cale_qr);
                    client.query("select id from utilizatori", function(err, rezQuery){
                        for(let utiliz of rezQuery.rows){
                            if(req.session.utilizator){
                                let cale_utiliz=obGlobal.protocol+obGlobal.numeDomeniu+"/profil";
                                QRCode.toFile(cale_qr+"/"+utiliz.id+".png",cale_utiliz);
                            }
                            else{
                                let cale_utiliz=obGlobal.protocol+obGlobal.numeDomeniu+"/autentificare";
                                QRCode.toFile(cale_qr+"/"+utiliz.id+".png",cale_utiliz);
                            }
                        }
                    });
                    
                    for(let prod of rez.rows){
                        let stoc;
                        if(prod.stoc - cantitati_prod[prod.id] >= 0){
                            stoc = prod.stoc - cantitati_prod[prod.id];
                        }
                        else{
                            stoc = 0
                        }
                        AccesBD.getInstanta().update({
                            tabel:"flori",
                            campuri:["stoc"],
                            valori:[stoc],
                            conditiiAnd:[`id = ${prod.id}`]
                        }, function(err, rezUpdate){
                            if(err){
                                console.log("produs", prod)
                                console.log(err);
                            }
                            else if(rezUpdate.rowCount == 0){
                                console.log("update-ul stocului nu s-a realizat")
                            }
                        })
                    }
                    
                    let rezFactura = ejs.render(fs.readFileSync("./views/pagini/factura.ejs").toString("utf-8"),{
                        protocol: obGlobal.protocol, 
                        domeniu: obGlobal.numeDomeniu,
                        utilizator: req.session.utilizator,
                        produse: rez.rows,
                        cantitati: req.body.cantitate
                    });
                    let numeFis=`./temp/factura${(new Date()).getTime()}.pdf`;
                    genereazaPdf(rezFactura, numeFis, function (numeFis){
                        mesajText=`Domnule/Doamna ${req.session.utilizator.nume} ${req.session.utilizator.prenume} aveti mai jos factura pentru tranzactie atasata.`;
                        mesajHTML=`<h2>Domnule/Doamna${req.session.utilizator.nume} ${req.session.utilizator.prenume},</h2> aveti mai jos factura pentru tranzactie atasata.`;
                        Utilizator.trimiteMail("Factura", mesajText,mesajHTML,[{
                            filename:"factura.pdf",
                            content: fs.readFileSync(numeFis),
                            }], `${req.session.utilizator.email}`);
                        
                        res.send("Tranzactia a fost realizata cu succes!");
                    });
                    rez.rows.forEach(function(elem){elem.cantitate=cantitati_prod[elem.id]});
                    let jsonFactura={
                        data: new Date(),
                        username: req.session.utilizator.username,
                        nume: req.session.utilizator.nume,
                        prenume: req.session.utilizator.prenume,
                        produse:rez.rows
                    }
                    if(obGlobal.bdMongo){
                        obGlobal.bdMongo.collection("facturi").insertOne(jsonFactura, function (err, rezmongo){
                            if (err) console.log(err)
                            else console.log ("Am inserat factura in mongodb");
                            obGlobal.bdMongo.collection("facturi").find({}).toArray(
                                function (err, rezInserare){
                                    if (err) console.log(err)
                                    else console.log (rezInserare);
                            })
                        })
                    }
                }
            }
        })
    }
    else{
        res.send("Nu puteti cumpara daca nu sunteti logat sau nu aveti dreptul!");
    }
    
});

caleXMLMesaje="resurse/xml/chat.xml";
caleXMLMesajeComentarii="resurse/xml/comentarii.xml";
headerXML=`<?xml version="1.0" encoding="utf-8"?>`;
function creeazaXMlChatDacaNuExista(){
    if (!fs.existsSync(caleXMLMesaje)){
        let initXML={
            "declaration":{
                "attributes":{
                    "version": "1.0",
                    "encoding": "utf-8"
                }
            },
            "elements": [
                {
                    "type": "element",
                    "name":"contact",
                    "elements": [
                        {
                            "type": "element",
                            "name":"mesaje",
                            "elements":[]                            
                        }
                    ]
                }
            ]
        }
        let sirXml=xmljs.js2xml(initXML,{compact:false, spaces:4});
        console.log(sirXml);
        fs.writeFileSync(caleXMLMesaje,sirXml);
        return false;
    }
    return true;
}

function creeazaXMlComentariiDacaNuExista(){
    if (!fs.existsSync(caleXMLMesajeComentarii)){
        let initXML={
            "declaration":{
                "attributes":{
                    "version": "1.0",
                    "encoding": "utf-8"
                }
            },
            "elements": [
                {
                    "type": "element",
                    "name":"contact",
                    "elements": [
                        {
                            "type": "element",
                            "name":"mesaje",
                            "elements":[]                            
                        }
                    ]
                }
            ]
        }
        let sirXml=xmljs.js2xml(initXML,{compact:false, spaces:4});
        console.log(sirXml);
        fs.writeFileSync(caleXMLMesajeComentarii,sirXml);
        return false;
    }
    return true;
}

function parseazaMesaje(){
    let existaInainte=creeazaXMlChatDacaNuExista();
    let obJson;
    if (existaInainte){
        let sirXML=fs.readFileSync(caleXMLMesaje, 'utf8');
        obJson=xmljs.xml2js(sirXML,{compact:false, spaces:4});
        let elementMesaje=obJson.elements[0].elements.find(function(el){
            return el.name=="mesaje"
        });
        let vectElementeMesaj=elementMesaje.elements?elementMesaje.elements:[];
        console.log("Mesaje: ",obJson.elements[0].elements.find(function(el){
            return el.name=="mesaje"
        }))
        let mesajeXml=vectElementeMesaj.filter(function(el){return el.name=="mesaj"});
        return [obJson, elementMesaje, mesajeXml];
    }
    return [obJson,[],[]];
}

function parseazaMesajeComentarii(){
    let existaInainte=creeazaXMlComentariiDacaNuExista();
    let obJson;
    if (existaInainte){
        let sirXML=fs.readFileSync(caleXMLMesajeComentarii, 'utf8');
        obJson=xmljs.xml2js(sirXML,{compact:false, spaces:4});
        let elementMesaje=obJson.elements[0].elements.find(function(el){
                return el.name=="mesaje"
            });
        let vectElementeMesaj=elementMesaje.elements?elementMesaje.elements:[];
        console.log("Mesaje: ",obJson.elements[0].elements.find(function(el){
            return el.name=="mesaje"
        }))
        let mesajeXml=vectElementeMesaj.filter(function(el){return el.name=="mesaj"});
        return [obJson, elementMesaje,mesajeXml];
    }
    return [obJson,[],[]];
}

app.get("/chat", function(req, res){
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml]=parseazaMesaje();
    if(!req.session.utilizator){
        res.render("pagini/chat", {eroare:"Nu aveti acces la pagina neautentificat!", utilizator:null, mesaje:[]})
    }
    res.render("pagini/chat",{eroare:null, utilizator:req.session.utilizator, mesaje:mesajeXml})
});

app.post("/chat", function(req, res){
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml]=parseazaMesaje();
        
    let nume=req.session.utilizator?req.session.utilizator.nume:"anonim";
    let prenume=req.session.utilizator?req.session.utilizator.prenume:null;

    let mesaj;

    if(req.body.gr_rad == "nimic"){
        mesaj = req.body.mesaj;
    }
    if(req.body.gr_rad == "sad"){
        mesaj = req.body.mesaj + " 🙁";
    }
    else if(req.body.gr_rad == "neutral"){
        mesaj = req.body.mesaj + " 😐";
    }
    else if(req.body.gr_rad == "happy"){
        mesaj = req.body.mesaj + " 🙂";
    }

    let mesajNou={
        type:"element", 
        name:"mesaj", 
        attributes:{
            nume:nume, 
            prenume:prenume, 
            data:new Date()
        },
        elements:[{type:"text", "text":mesaj}]
    };
    if(elementMesaje.elements)
        elementMesaje.elements.push(mesajNou);
    else 
        elementMesaje.elements=[mesajNou];
    console.log(elementMesaje.elements);
    let sirXml=xmljs.js2xml(obJson,{compact:false, spaces:4});
    console.log("XML: ",sirXml);
    fs.writeFileSync("resurse/xml/chat.xml",sirXml);
    
    res.render("pagini/chat",{utilizator:req.session.utilizator, mesaje:elementMesaje.elements, eroare:null})
});

app.get("/comentarii", function(req, res){
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml]=parseazaMesajeComentarii();
    if(!req.session.utilizator){
        res.render("pagini/comentarii", {eroare:"Nu aveti acces la pagina neautentificat!", utilizator:null, mesaje:[]})
    }
    res.render("pagini/comentarii",{eroare:null, utilizator:req.session.utilizator, mesaje:mesajeXml})
});

app.post("/comentarii", function(req, res){
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml]=parseazaMesajeComentarii();
        
    let nume=req.session.utilizator?req.session.utilizator.nume:"anonim";
    let prenume=req.session.utilizator?req.session.utilizator.prenume:null;
    let rol=req.session.utilizator?req.session.utilizator.rol.cod:null;
    let chat=req.session.utilizator?req.session.utilizator.culoare_chat:null;
    let mesajNou={
        type:"element", 
        name:"mesaj", 
        attributes:{
            nume:nume, 
            prenume:prenume, 
            rol:rol,
            chat:chat,
            data:new Date()
        },
        elements:[{type:"text", "text":req.body.mesaj}]
    };
    if(elementMesaje.elements)
        elementMesaje.elements.push(mesajNou);
    else 
        elementMesaje.elements=[mesajNou];
    console.log(elementMesaje.elements);
    let sirXml=xmljs.js2xml(obJson,{compact:false, spaces:4});
    console.log("XML: ",sirXml);
    fs.writeFileSync("resurse/xml/comentarii.xml",sirXml);
    
    res.render("pagini/comentarii",{utilizator:req.session.utilizator, mesaje:elementMesaje.elements, eroare:null})
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