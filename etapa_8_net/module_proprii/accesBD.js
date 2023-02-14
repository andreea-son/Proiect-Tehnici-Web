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
        const env = process.env;

        const config = {
        db: {
            host: env.DB_HOST || 'manny.db.elephantsql.com',
            port: env.DB_PORT || '5432',
            user: env.DB_USER || 'qxdcuarh',
            password: env.DB_PASSWORD || 'pVeZd0K6rgzm-T9sEV42RS5qR0tHqRLl',
            database: env.DB_NAME || 'qxdcuarh',
        },
        listPerPage: env.LIST_PER_PAGE || 10,
        };

        this.client = new Client(config.db);
        this.client.connect();
        // var conString = "postgres://qxdcuarh:pVeZd0K6rgzm-T9sEV42RS5qR0tHqRLl@manny.db.elephantsql.com/qxdcuarh"
        // var client = new pg.Client(conString);
        // client.connect(function(err) {
        //     if(err) {
        //         return console.error('could not connect to postgres', err);
        //     }
        // });
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

    complexSelect({query=""} = {}, callback){
        let comanda=query;
        console.error(comanda);
        this.client.query(comanda,callback)
    }

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