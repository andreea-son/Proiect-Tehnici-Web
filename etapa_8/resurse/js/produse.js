window.addEventListener("DOMContentLoaded",  function(){
    let iduriProduse=localStorage.getItem("cos_virtual");
    iduriProduse=iduriProduse?iduriProduse.split(","):[];

    for(let idp of iduriProduse){
        id = idp.split("-")[1];
        cantitate = idp.split("-")[0];
        let ch = document.querySelector(`[value='${id}'].select-cos`);
        let val = document.querySelector(`[value='${id}'].number_val`);
        let cos = document.querySelector(`#art-${id} .selecteaza-cos`);
        if(ch){
            ch.checked = true;
            val.innerHTML = cantitate;
            cos.style.display = "inline";
        }
        else{
            console.log("id cos virtual inexistent:", idp);
        }
    }

    let checkboxuri = document.getElementsByClassName("select-cos");
    for(let ch of checkboxuri){
        ch.onchange=function(){
            let iduriProduse=localStorage.getItem("cos_virtual");
            iduriProduse=iduriProduse?iduriProduse.split(","):[];
            var iduri = []
            for (id of iduriProduse){
                iduri.push(id.split("-")[1]);
            }
            console.log(iduri);
            if(this.checked){
                let poz=iduri.indexOf(this.value.split("-")[1]);
                if(poz != -1){
                    iduriProduse.splice(poz,1);
                }
                iduriProduse.push(this.value);
            }
            else{
                let poz=iduriProduse.indexOf(this.value);
                if(poz != -1){
                    iduriProduse.splice(poz,1);
                }
            }
            localStorage.setItem("cos_virtual", iduriProduse.join(","))
            console.log(localStorage.getItem("cos_virtual"))
        }
    }

    document.getElementById("inp-fire").onchange=function(){
        console.log(this.value);
        document.getElementById("infoRange").innerHTML=` (${this.value})`;
    }

    function clickToate() {
        if (document.getElementById("i_ch0").checked) {
            document.getElementById("i_ch1").checked = false;
            document.getElementById("i_ch2").checked = false;
            document.getElementById("i_ch3").checked = false;
            document.getElementById("i_ch4").checked = false;
            document.getElementById("i_ch5").checked = false;
            document.getElementById("i_ch6").checked = false;
            document.getElementById("i_ch7").checked = false;
            document.getElementById("i_ch8").checked = false;
        }
        if (!document.getElementById("i_ch0").checked && !document.getElementById("i_ch1").checked && !document.getElementById("i_ch2").checked && !document.getElementById("i_ch3").checked && !document.getElementById("i_ch4").checked && !document.getElementById("i_ch5").checked && !document.getElementById("i_ch6").checked && !document.getElementById("i_ch7").checked && !document.getElementById("i_ch8").checked){
            document.getElementById("i_ch0").checked = true;
        }
    }
    
    function clickOrice() {
        if (document.getElementById("i_ch1").checked || document.getElementById("i_ch2").checked || document.getElementById("i_ch3").checked || document.getElementById("i_ch4").checked || document.getElementById("i_ch5").checked || document.getElementById("i_ch6").checked || document.getElementById("i_ch7").checked || document.getElementById("i_ch8").checked) {
            document.getElementById("i_ch0").checked = false;
        }
        if (!document.getElementById("i_ch0").checked && !document.getElementById("i_ch1").checked && !document.getElementById("i_ch2").checked && !document.getElementById("i_ch3").checked && !document.getElementById("i_ch4").checked && !document.getElementById("i_ch5").checked && !document.getElementById("i_ch6").checked && !document.getElementById("i_ch7").checked && !document.getElementById("i_ch8").checked){
            document.getElementById("i_ch0").checked = true;
        }
    }
    
    document.getElementById("i_ch1").onchange = clickOrice;
    document.getElementById("i_ch2").onchange = clickOrice;
    document.getElementById("i_ch3").onchange = clickOrice;
    document.getElementById("i_ch4").onchange = clickOrice;
    document.getElementById("i_ch5").onchange = clickOrice;
    document.getElementById("i_ch6").onchange = clickOrice;
    document.getElementById("i_ch7").onchange = clickOrice;
    document.getElementById("i_ch8").onchange = clickOrice;
    document.getElementById("i_ch0").onchange = clickToate;
    
    //verificare nume
    document.getElementById("inp-nume").onchange=function(){
        condValidare1=true;
        var inpNume=this.value.toLowerCase().trim();
        condValidare1 = condValidare1 && inpNume.match(new RegExp("^[a-zA-Z]*$"));
        if (!condValidare1){
            this.classList.add("is-invalid");
            document.getElementById("mesaj-invalid-txt").style.display="block";
        }
        else if(this.classList.contains("is-invalid") && condValidare1){
            this.classList.remove("is-invalid");
            document.getElementById("mesaj-invalid-txt").style.display="none";
        }
    }

    //verificare descriere
    document.getElementById("txt-descriere").onchange=function(){
        var toateCorecte = true;
        if(this.value!=''){
            var text = this.value.replace(/\s+/g, " ");
            var cuv = text.split(" ");
            for (let c of cuv){
                if(c.length == 1){
                    toateCorecte = false;
                    break;
                }
                if((c[0] != '-') && (c[0] != '+')) {
                    toateCorecte = false;
                    break;
                }
            }
        }
        if(toateCorecte == false){
            this.classList.add("is-invalid");
            document.getElementById("mesaj-invalid-txtarea").style.display="block";
        }
        else if(this.classList.contains("is-invalid") && toateCorecte){
            this.classList.remove("is-invalid");
            document.getElementById("mesaj-invalid-txtarea").style.display="none";
        }
    }

    document.getElementById("filtrare").onclick=function(){
        condValidare1=true;
        var inpNume=document.getElementById("inp-nume").value.toLowerCase().trim();
        condValidare1 = condValidare1 && inpNume.match(new RegExp("^[a-zA-Z]*$"));
        if (!condValidare1){
            return;
        }
        
        var txtDescriere = document.getElementById("txt-descriere").value;
        if(txtDescriere!=''){
            var text = txtDescriere.replace(/\s+/g, " ");
            var cuv = text.split(" ");
            var toateCorecte = true;
            var cuvinte_plus = [];
            var cuvinte_minus = [];
            for (let c of cuv){
                if(c.length == 1){
                    toateCorecte = false;
                    break;
                }
                if(c[0] == '+'){
                    var cuvant = c.slice(1, c.length)
                    cuvinte_plus.push(cuvant);
                }
                else if(c[0] == '-'){
                    var cuvant = c.slice(1, c.length)
                    cuvinte_minus.push(cuvant);
                }
                else{
                    toateCorecte = false;
                    break;
                }
            }
            if(toateCorecte == false){
                return;
            }
        }
        
        var checkRadio = document.querySelector('input[name="gr_rad"]:checked').value;
        var inpRange = parseInt(document.getElementById("inp-fire").value);

        var selectedVal=[];
        for (let option of document.getElementById('sel-pret').options){
            if (option.selected){
                selectedVal.push(option.value);
            }
        }

        var inpLivrare = document.getElementById("inp-livrare").value;
        var inpCuloare= document.querySelectorAll('input[name="gr_ch"]:checked');
        var checkedVal= [];
        inpCuloare.forEach((checkbox) => {
            checkedVal.push(checkbox.value);
        });

        var pret_inf=[];
        var pret_sup=[];
        for(let i=0; i<selectedVal.length; i++){
            if(selectedVal[i] != 'toate'){
                var pret_split = selectedVal[i].split('-');
                pret_inf.push(parseFloat(pret_split[0]));
                pret_sup.push(parseFloat(pret_split[1]));
            }
        }

        var inpFlori = document.getElementById("sel-flori").value;

        var produse=document.getElementsByClassName("produs");
        var contor_prod = 0;
        console.log(produse)
        for (let produs of produse){
            var cond1=false, cond2=false, cond3=false, cond4=false, cond5=false, cond6=false, cond7=false, cond8_plus=false, cond8_minus=false, cond8=false;
            produs.style.display="none";

            let nume= produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim();
            if(nume.includes(inpNume)){
                cond1=true;
            }
            let categorie= produs.getElementsByClassName("val-categorie")[0].innerHTML;
            if(checkRadio=="toate" || checkRadio==categorie){
                cond2=true;
            }
            let num_fire= parseInt(produs.getElementsByClassName("val-fire")[0].innerHTML);
            if(num_fire >= inpRange){
                cond3=true;
            }
            let pret= parseFloat(produs.getElementsByClassName("val-pret")[0].innerHTML);
            for(let i=0; i<selectedVal.length; i++){
                if(selectedVal[i]=='toate' || (pret >= pret_inf[i] && pret < pret_sup[i])){
                    cond4=true;
                }
            }
            let livrare= produs.getElementsByClassName("val-livrare")[0].innerHTML;
            if(inpLivrare=="" || inpLivrare==livrare){
                cond5=true;
            }
            let culoare= produs.getElementsByClassName("val-culoare")[0].innerHTML;
            for(let i=0; i<checkedVal.length; i++){
                if(checkedVal[i]=='toate' || checkedVal[i]==culoare){
                    cond6=true;
                }
            }
            let flori= produs.getElementsByClassName("val-flori")[0].innerHTML;
            if(inpFlori=="oricare" || flori.includes(inpFlori)){
                cond7=true;
            }

            if(txtDescriere!=''){
                let descriere= produs.getElementsByClassName("val-descriere")[0].innerHTML;
            
                for(let i=0; i<cuvinte_plus.length; i++){
                    if(descriere.toLowerCase().includes(cuvinte_plus[i])){
                        cond8_plus = true;
                    }
                }
                
                var contor_minus = 0;
                for(let i=0; i<cuvinte_minus.length; i++){
                    if(!descriere.toLowerCase().includes(cuvinte_minus[i])){
                        contor_minus++;
                    }
                }
                if(contor_minus==cuvinte_minus.length){
                    cond8_minus = true;
                }
                if(cuvinte_plus.length == 0){
                    cond8_plus = true;
                }
    
                cond8=cond8_minus && cond8_plus;
            }
            else{
                cond8=true;
            }

            if(cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8){
                produs.style.display="block";
                contor_prod++;
            }
        }
        if(contor_prod == 0){
            document.getElementById("fara-produse").style.display="block";
        }
        else{
            document.getElementById("fara-produse").style.display="none";
        }
    }

    document.getElementById("resetare").onclick=function(){
        //resteare produse
        var produse=document.getElementsByClassName("produs");
        for (let produs of produse){
            produs.style.display="block";
        }
        document.getElementById("fara-produse").style.display="none";
        //resetare filtre
        document.getElementById("inp-nume").value="";
        for (let option of document.getElementById('sel-pret').options){
            if (option.selected){
                option.selected=false;
            }
        }
        document.getElementById("sel-toate-pret").selected=true;
        document.getElementById("sel-toate-flori").selected=true;
        document.getElementById("i_rad0").checked=true;
        document.getElementById("inp-fire").value=0;
        document.getElementById("inp-livrare").value="";
        document.getElementById("i_ch0").checked = true;
        document.getElementById("i_ch1").checked = false;
        document.getElementById("i_ch2").checked = false;
        document.getElementById("i_ch3").checked = false;
        document.getElementById("i_ch4").checked = false;
        document.getElementById("i_ch5").checked = false;
        document.getElementById("i_ch6").checked = false;
        document.getElementById("i_ch7").checked = false;
        document.getElementById("i_ch8").checked = false;
        document.getElementById("txt-descriere").value="";
        document.getElementById("infoRange").innerHTML=` (0)`;
    }

    function sorteaza(semn){
        var produse=document.getElementsByClassName("produs");
        var v_produse=Array.from(produse);
        
        v_produse.sort(function(a,b){
            var pret_a=parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            var pret_b=parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if(pret_a==pret_b){
                var culoare_a=a.getElementsByClassName("val-culoare")[0].innerHTML;
                var culoare_b=b.getElementsByClassName("val-culoare")[0].innerHTML;
                return semn*culoare_a.localeCompare(culoare_b);
            }
            return (pret_a-pret_b)*semn;
        })
        for (let produs of v_produse){
            produs.parentNode.appendChild(produs);
        }       
        if(document.getElementById("fara-produse").style.display=="block"){
            alert("Nu exista produse ce pot fi sortate.");
        }
    }

    document.getElementById("sortCrescNume").onclick=function(){
        sorteaza(1);
    }
    document.getElementById("sortDescrescNume").onclick=function(){
        sorteaza(-1);
    }

    document.getElementById("calculare").onclick=function(){
        var produse=document.getElementsByClassName("produs");
        let suma=0;
        for(let prod of produse){
            if (prod.style.display!="none")
                suma+=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML)
        }
        if (!document.getElementById("rezultat")){
            rezultat=document.createElement("div");
            rezultat.id="rezultat";
            rezultat.innerHTML="Pret total produse afisate: "+suma+" ron";
            rezultat.style.color="var(--culoare-text-negru)";
            rezultat.style.width="300px";
            rezultat.style.textAlign="center";
            rezultat.style.border="2px solid var(--culoare-gri)";
            rezultat.style.borderRadius="6px";
            rezultat.style.position="fixed";
            rezultat.style.backgroundColor="var(--culoare-fundal)";
            var ps=document.getElementById("p-suma");
            ps.parentNode.insertBefore(rezultat,ps.nextSibling);
            rezultat.onclick= function(){
                this.remove();
            }
            setTimeout(function (){
                document.getElementById("rezultat").remove();
            }, 2000);
        }
    }

    var produse=document.getElementsByClassName("produs");
    var v_produse=Array.from(produse);
    var zile=["Duminica", "Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata"];
    var luni=["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
    for(i=0; i<v_produse.length; i++){
        var data_adaugare = new Date(document.getElementsByClassName("val-data")[i].innerHTML);
        var data_formatata = zile[data_adaugare.getDay()] + ", " + data_adaugare.getDate() + "-" + luni[data_adaugare.getMonth()] + "-" + data_adaugare.getFullYear();
        document.getElementsByClassName("val-data")[i].innerHTML = data_formatata;
        if(document.getElementsByClassName("val-livrare")[i].innerHTML == "true"){
            document.getElementsByClassName("val-livrare")[i].innerHTML = "Da";
        }
        else{
            document.getElementsByClassName("val-livrare")[i].innerHTML = "Nu";
        }
    }
});