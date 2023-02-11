function culoareRandom(){
    randInt=(a=0,b=256) => Math.random()*(b-a)+a;
    return `rgb(${randInt()},${randInt()},${randInt()})`;
}
let graficFacturi=null;
let should_update = true;

grafic_history=localStorage.getItem("grafic");

async function creareGraficFacturi(dateGrafic) {
    let culoriRandom=[];
    for (let _ in dateGrafic) culoriRandom.push(culoareRandom());
    if (!graficFacturi){
        graficFacturi=new Chart(
            document.getElementById('grafic'),
            {
                type: 'polarArea',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Numar vanzari',
                            data: [],
                            backgroundColor: []
                        }
                    ]
                }
            }
        );
    } else{
        graficFacturi.data.labels.splice(0,graficFacturi.data.labels.length)
        graficFacturi.data.labels=Object.keys(dateGrafic);
        graficFacturi.data.datasets[0].data.splice(0,graficFacturi.data.datasets[0].data.length)
        let culoriOrdonate=[]
        Object.values(dateGrafic).forEach((val,i) =>
            {
                graficFacturi.data.datasets[0].data.push(val); 
                culoriOrdonate.push(culoriDate[Object.keys(dateGrafic)[i]]);
            });
        graficFacturi.data.datasets[0].backgroundColor=culoriOrdonate;
        if(should_update)
            graficFacturi.update();
        let vect_graf = localStorage.getItem("grafic").split(",");
        if(vect_graf.length == graficFacturi.data.datasets[0].data.length){
            for(idx in vect_graf){
                if(vect_graf[idx] != graficFacturi.data.datasets[0].data[idx]){
                    should_update = true;
                    break;
                }
                else{
                    should_update = false;
                }
            }
        }
        else{
            should_update = true;
        }
        localStorage.setItem("grafic", graficFacturi.data.datasets[0].data);
    }
}

let culoriDate={}
function actualizeazaDateFacturi(){
    fetch("/update_grafice", {		
        method: "GET",
        headers:{'Content-Type': 'application/json'},
        mode: 'cors',		
        cache: 'default'
    })
    .then(function(rasp){console.log(rasp); x=rasp.json(); console.log(x); return x})
    .then(function(obFacturi) {
        let dateGrafic={}
        for (let factura of obFacturi){
            for(let prod of factura.produse){
                dateGrafic[prod.nume]=dateGrafic[prod.nume]?dateGrafic[prod.nume]+1:prod.cantitate;
                if(!culoriDate[prod.nume])
                    culoriDate[prod.nume]=culoareRandom();
            }
        }
        creareGraficFacturi(dateGrafic);
    });
}

window.addEventListener("load", function(){
    actualizeazaDateFacturi();
    actualizeazaDateFacturi();
    should_update = true;
    setInterval(actualizeazaDateFacturi, 4500);
})