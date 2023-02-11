window.addEventListener("DOMContentLoaded",function(){
	prod_sel=localStorage.getItem("cos_virtual");
	if (prod_sel){
		var vect_ids=prod_sel.split(",");
		var ids = [];
		var cantitati = [];
		for(let vect_id of vect_ids){
			ids.push(vect_id.split("-")[1]);
			cantitati.push(vect_id.split("-")[0]);
		}
		fetch("/produse_cos", {		
			method: "POST",
			headers:{'Content-Type': 'application/json'},
			mode: 'cors',		
			cache: 'default',
			body: JSON.stringify({
				a:10,
				b:20,
				ids_prod: ids,
				cantitate: cantitati
			})
		})
		.then(function(rasp){console.log(rasp); x=rasp.json(); console.log(x); return x})
		.then(function(objson) {
			console.log(objson);
			let main=document.getElementsByTagName("main")[0];
			let btn=document.getElementById("cumpara");
			for (let idx in objson.prods){
				let article=document.createElement("article");
				article.classList.add("cos-virtual");
				var h2=document.createElement("h2");
				h2.innerHTML=objson.prods[idx].nume;
				article.appendChild(h2);

				let imagine=document.createElement("img");
				imagine.src="/resurse/imagini/produse/"+objson.prods[idx].imagine;
				article.appendChild(imagine);
				
				let descriere=document.createElement("p");
				descriere.innerHTML="Descriere: " + objson.prods[idx].descriere;
				article.appendChild(descriere);

				let rid_pers = document.createElement("p");
				rid_pers.innerHTML = "Posibilitate ridicare personala: " + (objson.prods[idx].ridicare_personala ? "da" : "nu");
				article.appendChild(rid_pers);
				
				let ocazie = document.createElement("p");
				ocazie.innerHTML = "Ocazie: " + objson.prods[idx].ocazie;
				article.appendChild(ocazie);

				let cantitate = document.createElement("p");
				cantitate.innerHTML = "Cantitate: " + objson.cantitati[idx] + " x " + objson.prods[idx].pret + " ron";
				article.appendChild(cantitate);

				var buton_delete = document.createElement("button");
				buton_delete.classList.add("btn");
				buton_delete.classList.add("btn-primary");
				buton_delete.classList.add("text-light");
				buton_delete.classList.add("mb-2");
				buton_delete.innerHTML = "Sterge produsul";
				article.appendChild(buton_delete);

				buton_delete.addEventListener('click', function(){
					let poz=ids.indexOf(objson.prods[idx].id);
					if(poz != -1){
						vect_ids.splice(poz,1);
					}
					else{
						vect_ids.pop();
					}
					localStorage.setItem("cos_virtual", vect_ids.join(","));
					if(vect_ids.length == 0){
						document.getElementsByTagName("main")[0].innerHTML="<h1>Cosul de cumparaturi</h1><p>Nu aveti nimic in cos!</p>";
					}
					else{
						article.innerHTML = "";
					}
				})
				main.insertBefore(article, btn);
			}
		}
		).catch(function(err){console.log(err)});
		document.getElementById("cumpara").onclick=function(){
			prod_sel=localStorage.getItem("cos_virtual");
			if (prod_sel){
				var vect_ids=prod_sel.split(",");
				ids = [];
				var cantitati = []
				for(let vect_id of vect_ids){
					ids.push(vect_id.split("-")[1]);
					cantitati.push(vect_id.split("-")[0]);
				}
				fetch("/cumpara", {
					method: "POST",
					headers:{'Content-Type': 'application/json'},
					mode: 'cors',		
					cache: 'default',
					body: JSON.stringify({
						ids_prod: ids,
						cantitate: vect_ids,
						a:10,
						b:"abc"
					})
				})
				.then(function(rasp){console.log(rasp); return rasp.text()})
				.then(function(raspunsText) {
					console.log(raspunsText);
					if(raspunsText){
						localStorage.removeItem("cos_virtual");
						let h1 = document.createElement("h1");
						let p=document.createElement("p");
						p.innerHTML=raspunsText;
						h1.innerHTML = "Cosul de cumparaturi";
						document.getElementsByTagName("main")[0].innerHTML="";
						document.getElementsByTagName("main")[0].appendChild(h1);
						document.getElementsByTagName("main")[0].appendChild(p);
					}
				}).catch(function(err){console.log(err)});
			}
		}
	}
	else{
		document.getElementsByTagName("main")[0].innerHTML="<h1>Cosul de cumparaturi</h1><p>Nu aveti nimic in cos!</p>";
	}
});