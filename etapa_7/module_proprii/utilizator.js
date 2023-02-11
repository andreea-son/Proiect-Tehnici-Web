const AccesBD=require('./accesBD.js');
const parole=require('./parole.js');

const {RolFactory}=require('./roluri.js');
const crypto=require("crypto");
const nodemailer=require("nodemailer");
const { Z_ASCII } = require('zlib');

class Utilizator{
    static tipConexiune="local";
    static tabel="utilizatori";
    static parolaCriptare="parolapb";
    static emailServer="test.tweb.node@gmail.com";
    static lungimeCod=64;
    static numeDomeniu="localhost:8088";
    #eroare;

    constructor({id, username="", nume="", prenume="", email="", parola="", data_nasterii="", rol="comun", problema_vedere=false, culoare_chat="black", fotografie=""}={}) {
        try{
            if(this.checkUsername(username))
                this.username = username;
        }
        catch(e){ this.#eroare=e.message}

        try{
            if(this.checkPrenume(prenume))
                this.prenume = prenume;
        }
        catch(e){ this.#eroare=e.message}

        try{
            if(this.checkName(nume))
                this.nume = nume;
        }
        catch(e){ this.#eroare=e.message}

        try{
            if(this.checkParola(parola))
                this.parola = parola;
        }
        catch(e){ this.#eroare=e.message}

        try{
            if(this.checkEmail(email))
                this.email = email;
        }
        catch(e){ this.#eroare=e.message}

        this.id = id;
        this.rol = rol;
        this.data_nasterii = data_nasterii;
        this.problema_vedere = problema_vedere;
        this.culoare_chat = culoare_chat;
        this.fotografie = fotografie;
        this.rol = this.rol.cod ? RolFactory.creeazaRol(this.rol.cod) : RolFactory.creeazaRol(this.rol);
        this.#eroare="";
    }

    checkName(nume){
        return nume!="" && nume.match(new RegExp("^[A-Z][a-z]+$"));
    }

    checkPrenume(prenume){
        return prenume!="" && prenume.match(new RegExp("^[A-Z][a-z]+$"));
    }

    checkParola(parola){
        return parola!="" && parola.match(new RegExp(/(?=.*\d.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[.]).{5,}/));
    }

    checkEmail(email){
        return email!="" && email.match(new RegExp("^.+@.+\.[a-zA-Z]{2,}$"));        
    }

    checkUsername(username){
        return username!="" && username.match(new RegExp(/(?=.*\w)(?=.*[\W]*).{5,}/));
    }

    set setareNume(nume){
        if (this.checkName(nume)) 
            this.nume=nume
        else{
            throw new Error("Nume gresit");
        }
    }

    set setareUsername(username){
        if (this.checkUsername(username)) 
            this.username=username
        else{
            throw new Error("Username gresit");
        }
    }

    set setarePrenume(prenume){
        if (this.checkPrenume(prenume)) 
            this.prenume=prenume;
        else{
            throw new Error("Prenume gresit");
        }
    }

    set setareEmail(email){
        if (this.checkEmail(email))
            this.email=email;
        else{
            throw new Error("Email gresit");
        }
    }

    set setareParola(parola){
        if (this.checkParola(parola))
            this.parola=parola;
        else{
            throw new Error("Parola gresita");
        }
    }

    static criptareParola(parola){
        return crypto.scryptSync(parola,Utilizator.parolaCriptare,Utilizator.lungimeCod).toString("hex");
    }

    modifica(campuri=[], valori=[]){
        AccesBD.getInstanta(Utilizator.tipConexiune).select({tabel:Utilizator.tabel, campuri:["*"], conditiiAnd:[`username=${this.username}`]}, function(err, res){
            if(res.rowCount == 0){
                throw new Error("Utilizatorul nu exista");
            }
        });
        AccesBD.getInstanta(Utilizator.tipConexiune).update({tabel:Utilizator.tabel, campuri:campuri, valori:valori, conditiiAnd:[`username=${this.username}`]}, function(err, rez){
            if(err){
                console.log(err);
            }
        });
    }

    existaUtilizator(callback){
        var results = undefined;
        results = AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync({tabel:Utilizator.tabel, campuri:["*"], conditiiAnd:[`username='${this.username}'`]}).then(callback);
    }

    genereazaToken2(){
        var vowels = "AEOUI";
        var sirConsoane = [];

        for(let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++){
            let ch = String.fromCharCode(i);
            if(!vowels.includes(ch)){
                sirConsoane.push(ch);
            }
        }
        let token="";
        for (let i=0; i<80; i++){
            token+=sirConsoane[Math.floor(Math.random()*sirConsoane.length)]
        }
        console.log(token);
        return token;
    }

    salvareUtilizator(){
        console.log("se apeleaza")
        let parolaCriptata=Utilizator.criptareParola(this.parola);
        let utiliz=this;
        let token2 = utiliz.genereazaToken2();
        AccesBD.getInstanta(Utilizator.tipConexiune).select({tabel:Utilizator.tabel, campuri:["*"], conditiiAnd:[`username='${utiliz.username}'`]}, function(err, res){
            if(res.rowCount == 1){
                throw new Error("Numele de utilizator exista deja");
            }
        });
        AccesBD.getInstanta(Utilizator.tipConexiune).insert({tabel:Utilizator.tabel,campuri:["username", "nume", "prenume", "email", "parola", "data_nasterii", "problema_vedere", "culoare_chat", "fotografie", "cod"],valori:[`'${this.username}'`,`'${this.nume}'`,`'${this.prenume}'`,`'${this.email}'`,`'${parolaCriptata}'`,`'${this.data_nasterii}'`,`'${this.problema_vedere}'`,`'${this.culoare_chat}'`,`'${this.fotografie}'`,`'${token2}'`]}, function(err, rez){
            if(err)
                console.log(err);
            var d = new Date();
            Utilizator.trimiteMail("Mesaj inregistrare","Te-ai inregistrat cu succes pe site-ul "+Utilizator.numeDomeniu,
            `<p>Incepand de azi, <span style='text-decoration: underline; color: pink;'>${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}</span>, te-ai inregistrat cu succes pe site-ul ${Utilizator.numeDomeniu}. Username-ul tau este ${utiliz.username}.</p> <p><a style='color: pink; text-decoration: none;' href='http://${Utilizator.numeDomeniu}/confirmare_mail/${d.getFullYear()}${d.getMonth()+1}${d.getDate()}${d.getHours()}${d.getMinutes()}${Math.round(d.getMilliseconds()/1000)}/${utiliz.username}/${token2}'>Click aici pentru confirmare</a></p>`, [], utiliz.email
            )
        });
    }

    sterge(){
        AccesBD.getInstanta(Utilizator.tipConexiune).select({tabel:Utilizator.tabel, campuri:["*"], conditiiAnd:[`username='${this.username}'`]}, function(err, res){
            if(res.rowCount == 0){
                throw new Error("Utilizatorul nu exista");
            }
        });
        AccesBD.getInstanta(Utilizator.tipConexiune).delete({tabel:Utilizator.tabel, conditiiAnd:[`username='${this.username}'`]}, function(err, rez){
            if(err){
                console.log(err);
            }
        });
    }
   
    static async getUtilizDupaUsernameAsync(username){
        if (!username) return null;
        try{
            let rezSelect=await AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync(
                {tabel:"utilizatori",
                campuri:['*'],
                conditiiAnd:[`username='${username}'`]
            });
            if(rezSelect.rowCount!=0){
                return new Utilizator(rezSelect.rows[0])
            }
            else {
                console.log("getUtilizDupaUsernameAsync: Nu am gasit utilizatorul");
                return null;
            }
        }
        catch (e){
            console.log(e);
            return null;
        }
        
    }
    static getUtilizDupaUsername (username, obparam, proceseazaUtilizRaw=null){
        if (!username) return null;
        let eroare=null;
        AccesBD.getInstanta(Utilizator.tipConexiune).select({tabel:"utilizatori",campuri:['*'],conditiiAnd:[`username='${username}'`]}, function (err, rezSelect){
            if(err){
                console.error("Utilizator:", err);
                console.log("Utilizator", rezSelect.rows.length);
                eroare=-2;
            }
            else if(rezSelect.rowCount==0){
                eroare=-1;
            }
            if(proceseazaUtilizRaw != null)
                proceseazaUtilizRaw(rezSelect.rows[0], obparam, eroare);
        });
    }

    static cauta(obparam, proceseazaUtiliz){
        let eroare = null;
        var conditiiAnd = [];
        var keys = Object.keys(obparam);
        var values = Object.values(obparam);
        var listaUtiliz = [];
        for (let idx in values){
            let conditie = `${keys[idx]} = ${values[idx]}`;
            conditiiAnd.push(conditie);
        }
        AccesBD.getInstanta(Utilizator.tipConexiune).select({tabel:Utilizator.tabel,campuri:['*'],conditiiAnd:conditiiAnd}, function (err, rezSelect){
            if(err){
                console.error(err);
                eroare=-1;
            }
            if(rezSelect.rowCount == 0){
                proceseazaUtiliz(eroare, []);
            }
            else{
                for (idx in rezSelect.rows){
                    let u = new Utilizator(rezSelect.rows[idx])
                    listaUtiliz.push(u);
                }
                proceseazaUtiliz(eroare, listaUtiliz);
            }
        })
    }

    static async cautaAsync(obparam){
        var conditiiAnd = [];
        var keys = Object.keys(obparam);
        var values = Object.values(obparam);
        var listaUtiliz = [];
        for (let idx in values){
            let conditie = `${keys[idx]} = ${values[idx]}`;
            conditiiAnd.push(conditie);
        }
        try{
            rezSelect = await AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync({tabel:Utilizator.tabel,campuri:['*'],conditiiAnd:conditiiAnd})
            if(rezSelect.rowCount == 0){
                return [];
            }
            else{
                for (idx in rezSelect.rows){
                    let u = new Utilizator(rezSelect.rows[idx])
                    listaUtiliz.push(u);
                }
                return listaUtiliz;
            }
        }
        catch (e){
            console.log(e);
            return null;
        }
    }

    static async trimiteMail(subiect, mesajText, mesajHtml, atasamente=[], email=""){
        var transp= nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth:{ 
                user:Utilizator.emailServer,
                pass:"rwgmgkldxnarxrgu"
            },
            tls:{
                rejectUnauthorized:false
            }
        });
        //genereaza html
        await transp.sendMail({
            from:Utilizator.emailServer,
            to:email, //TO DO
            subject:subiect,//"Te-ai inregistrat cu succes",
            text:mesajText, //"Username-ul tau este "+username
            html: mesajHtml,// `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
            attachments: atasamente
        })
        console.log("trimis mail");
    }

    areDreptul(drept){
        return this.rol.areDreptul(drept);
    }
}
module.exports={Utilizator:Utilizator}