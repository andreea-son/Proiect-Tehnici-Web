/*

ATENTIE!
inca nu am implementat protectia contra SQL injection
*/

const {Client, Pool}=require("pg");

class AccesBD{
    static #instanta=null;
    static #initializat=false;

    constructor() {
        if(AccesBD.#instanta != null){
            throw new Error("Deja a fost instantiat");
        }
        else if(AccesBD.#initializat == null){
            throw new Error("Trebuie apelat doar din getInstanta; fara sa fi aruncat vreo eroare");
        }
    }

    initLocal(){
        this.client= new Client({database:"buticul_cu_flori",
            user:"andreea", 
            password:"andreea", 
            host:"localhost",
            port:5432});
        this.client2= new Pool({database:"laborator",
                user:"irina", 
                password:"irina", 
                host:"localhost", 
                port:5432});
        this.client.connect();
    }

    getClient(){
        if(AccesBD.#instanta == null){
            throw new Error("Nu a fost instantiata clasa");
        }
        return this.client;
    }

    /**
     * @typedef {object} ObiectConexiune - obiect primit de functiile care realizeaza un query
     * @property {string} init - tipul de conexiune ("init", "render" etc.)
     * 
     * /

    /**
     * Returneaza instanta unica a clasei
     *
     * @param {ObiectConexiune} un obiect cu datele pentru query
     * @returns {AccesBD}
     */

    static getInstanta({init="local"}={}){
        console.log(this);
        if(!this.#instanta){
            this.#initializat=true;
            this.#instanta=new AccesBD();
            try{
                switch(init){
                    case "local":this.#instanta.initLocal();
                }
            }
            catch (e){
                console.error("Eroare la initializarea bazei de date!");
            }
        }
        return this.#instanta;
    }

    /**
     * @typedef {object} ObiectQuery - obiect primit de functiile care realizeaza un query
     * @property {string} tabel - numele tabelului
     * @property {string []} campuri - o lista de stringuri cu numele coloanelor afectate de query; poate cuprinde si elementul "*"
     * @property {string[]} conditiiAnd - lista de stringuri cu conditii pentru where
     */

    /**
     * callback pentru queryuri.
     * @callback QueryCallBack
     * @param {Error} err Eventuala eroare in urma queryului
     * @param {Object} rez Rezultatul query-ului
     */
    /**
     * Selecteaza inregistrari din baza de date
     *
     * @param {ObiectQuery} obj - un obiect cu datele pentru query
     * @param {function} callback - o functie callback cu 2 parametri: eroare si rezultatul queryului
     */

    select({tabel="",campuri=[],conditiiAnd=[]} = {}, callback){
        let conditieWhere="";
        if(conditiiAnd.length>0)
            conditieWhere=`where ${conditiiAnd.join(" and ")}`;
        
        let comanda=`select ${campuri.join(",")} from ${tabel} ${conditieWhere}`;
        console.error(comanda);
        this.client.query(comanda,callback)
    }
    async selectAsync({tabel="",campuri=[],conditiiAnd=[]} = {}){
        let conditieWhere="";
        if(conditiiAnd.length>0)
            conditieWhere=`where ${conditiiAnd.join(" and ")}`;
        
        let comanda=`select ${campuri.join(",")} from ${tabel} ${conditieWhere}`;
        console.error("selectAsync:",comanda);
        try{
            let rez=await this.client.query(comanda);
            console.log("selectasync: ",rez);
            return rez;
        }
        catch (e){
            console.log(e);
            return null;
        }
    }
    insert({tabel="",campuri=[],valori=[]} = {}, callback){
        if(campuri.length!=valori.length)
            throw new Error("Numarul de campuri difera de nr de valori")
        
        let comanda=`insert into ${tabel}(${campuri.join(",")}) values ( ${valori.join(",")})`;
        console.log(comanda);
        this.client.query(comanda,callback)
    }

    
    update({tabel="",campuri=[],valori=[], conditiiAnd=[]} = {}, callback){
        if(campuri.length!=valori.length)
            throw new Error("Numarul de campuri difera de nr de valori")
        let campuriActualizate=[];
        for(let i=0;i<campuri.length;i++)
            campuriActualizate.push(`${campuri[i]}='${valori[i]}'`);
        let conditieWhere="";
        if(conditiiAnd.length>0)
            conditieWhere=`where ${conditiiAnd.join(" and ")}`;
        let comanda=`update ${tabel} set ${campuriActualizate.join(", ")}  ${conditieWhere}`;
        console.log(comanda);
        this.client.query(comanda,callback)
    }

    delete({tabel="",conditiiAnd=[]} = {}, callback){
        let conditieWhere="";
        if(conditiiAnd.length>0)
            conditieWhere=`where ${conditiiAnd.join(" and ")}`;
        
        let comanda=`delete from ${tabel} ${conditieWhere}`;
        console.log(comanda);
        this.client.query(comanda,callback)
    }
}

module.exports=AccesBD;