const peer = new Peer(); 
let monId = null;
let maConnexionHost = null; 
let connexionsClients = []; 

let monPseudo = "";
let estHote = false;
let jeuEnCours = false;
let propositionAchatEnCours = null;

let etatJeu = {
    joueurs: [], 
    tourActuel: 0, 
    log: [],
    proprietes: {}, 
    cagnotteDettes: 0,
    parametres: {
        argentDepart: 1500,
        loyerDoubleFamille: true,
        cagnotteActive: true,
        bingoDepart: true,
        uniformiteConstruction: true,
        pasDeLoyerEnPrison: false
    }
};

const nomsTerrains = [
    "Départ", "Paku Paku", "Surprise", "Pathé Angers", "Taxe 10%", "AD-mobile", "Parking de Biville-la-Baignarde", "Surprise", "Fromager Depannage", "Tribunal Dieppe",
    "Ambleville", "Skatepark Courbevoie", "TotalEnergies Access", "Skatepark Gisors", "Skatepark Cergy", "K-mobile", "Skatepark Achères", "Surprise", "Skatepark Dieppe", "Skatepark Poissy",
    "Dettes de Benoit", "100% Crousti", "Surprise", "McDonald's", "Tacos Club", "Canard mobile", "Baba Burger", "Pacha Kebab", "The Financier", "Schwartz's",
    "Flics de Dieppe", "Breuil", "Saint-Clair-sur-Epte", "Surprise", "Gisors", "Lucas mobile", "Surprise", "Angers", "Taxe 75€", "Chartres"
];

const INFOS_TERRAINS = {
    1: { nom: "Paku Paku", famille: 1, prix: 60, loyers: [2, 10, 30, 90, 160, 250] },
    3: { nom: "Pathé Angers", famille: 1, prix: 60, loyers: [4, 20, 60, 180, 320, 450] },
    6: { nom: "Parking de Biville-la-Baignarde", famille: 2, prix: 100, loyers: [6, 30, 90, 270, 400, 550] },
    8: { nom: "Fromager Depannage", famille: 2, prix: 100, loyers: [6, 30, 90, 270, 400, 550] },
    9: { nom: "Tribunal Dieppe", famille: 2, prix: 120, loyers: [8, 40, 100, 300, 450, 600] },
    11: { nom: "Skatepark Courbevoie", famille: 3, prix: 140, loyers: [10, 50, 150, 450, 625, 750] },
    13: { nom: "Skatepark Gisors", famille: 3, prix: 140, loyers: [10, 50, 150, 450, 625, 750] },
    14: { nom: "Skatepark Cergy", famille: 3, prix: 160, loyers: [12, 60, 180, 500, 700, 900] },
    16: { nom: "Skatepark Achères", famille: 4, prix: 180, loyers: [14, 70, 200, 550, 750, 950] },
    18: { nom: "Skatepark Dieppe", famille: 4, prix: 180, loyers: [14, 70, 200, 550, 750, 950] },
    19: { nom: "Skatepark Poissy", famille: 4, prix: 200, loyers: [16, 80, 220, 600, 800, 1000] },
    21: { nom: "100% Crousti", famille: 5, prix: 220, loyers: [18, 90, 250, 700, 875, 1050] },
    23: { nom: "McDonald's", famille: 5, prix: 220, loyers: [18, 90, 250, 700, 875, 1050] },
    24: { nom: "Tacos Club", famille: 5, prix: 240, loyers: [20, 100, 300, 750, 925, 1100] },
    26: { nom: "Baba Burger", famille: 6, prix: 260, loyers: [22, 110, 330, 800, 975, 1150] },
    27: { nom: "Pacha Kebab", famille: 6, prix: 260, loyers: [22, 110, 330, 800, 975, 1150] },
    29: { nom: "Schwartz's", famille: 6, prix: 280, loyers: [24, 120, 360, 850, 1025, 1200] },
    31: { nom: "Breuil", famille: 7, prix: 300, loyers: [26, 130, 390, 900, 1100, 1275] },
    32: { nom: "Saint-Clair-sur-Epte", famille: 7, prix: 300, loyers: [26, 130, 390, 900, 1100, 1275] },
    34: { nom: "Gisors", famille: 7, prix: 320, loyers: [28, 150, 450, 1000, 1200, 1400] },
    37: { nom: "Angers", famille: 8, prix: 350, loyers: [35, 175, 500, 1100, 1300, 1500] },
    39: { nom: "Chartres", famille: 8, prix: 400, loyers: [50, 200, 600, 1400, 1700, 2000] },
    5: { nom: "AD-mobile", famille: 9, prix: 200, loyers: [25, 50, 100, 200] },
    15: { nom: "K-mobile", famille: 9, prix: 200, loyers: [25, 50, 100, 200] },
    25: { nom: "Canard mobile", famille: 9, prix: 200, loyers: [25, 50, 100, 200] },
    35: { nom: "Lucas mobile", famille: 9, prix: 200, loyers: [25, 50, 100, 200] },
    12: { nom: "TotalEnergies Access", famille: 10, prix: 150, loyers: [4, 10] },
    28: { nom: "The Financier", famille: 10, prix: 150, loyers: [4, 10] },
};

const CARTES_SURPRISE = [
    { texte: "Kamil est malade et vous lui offrez ses frais médicaux : payez 50 €.", type: "paiement", montant: -50 },
    { texte: "La Fabrique de Julien vous a livré deux pizzas : payez 30 €.", type: "paiement", montant: -30 },
    { texte: "Benoit vous emprunte de l'argent : payez 25 €.", type: "paiement", montant: -25 },
    { texte: "Le plein chez Total coûte un bras : payez 50 € par maison et 125 € par hôtel.", type: "reparations", prixMaison: 50, prixHotel: 125 },
    { texte: "AD vous a renversé en voiture : il vous offre une carte de sortie de prison.", type: "cartePrison" },
    { texte: "Collecte pour le kebab du dimanche : chaque joueur vous donne 10 €.", type: "collecte", montant: 10 },
    { texte: "Vous avez vendu un PC du CDI : gagnez 100 €.", type: "paiement", montant: 100 },
    { texte: "Lucas vous offre un plein d'essence : gagnez 70 €.", type: "paiement", montant: 70 },
    { texte: "Benoit vous rembourse : gagnez 50 €.", type: "paiement", montant: 50 },
    { texte: "Erreur de livraison : vous avez le colis de Benoit, gagnez 30 €.", type: "paiement", montant: 30 },
    { texte: "Vous avez gagné le concours de tricks en skate : gagnez 10 €.", type: "paiement", montant: 10 },
    { texte: "Vous vous êtes fait arrêter pour excès de vitesse : allez en prison.", type: "allerA", destination: 10 },
    { texte: "Reculez de 3 cases.", type: "mouvement", cases: -3 },
    { texte: "Retournez à Chartres pour admirer la cathédrale.", type: "allerA", destination: 39 },
    { texte: "Canard Dessin vous offre un baba : rendez-vous au Baba Burger.", type: "allerA", destination: 26 },
    { texte: "Erreur de GPS : rendez-vous au Parking de Biville-la-Baignarde.", type: "allerA", destination: 6 },
    { texte: "Vous accompagnez Lucie au restaurant japonais : rendez-vous à Paku Paku.", type: "allerA", destination: 1 }
];

peer.on('open', (id) => {
    monId = id;
    if (estHote) document.getElementById('affichage-id').innerText = monId;
});

peer.on('connection', (conn) => {
    if (!estHote) return; 

    conn.on('open', () => {
        if (jeuEnCours) {
            conn.send({ type: 'ERREUR', message: 'Désolé, la partie a déjà commencé !' });
            setTimeout(() => conn.close(), 500); 
            return;
        }

        if (etatJeu.joueurs.length >= 5) {
            conn.send({ type: 'ERREUR', message: 'Désolé, la partie est complète (5 joueurs max).' });
            setTimeout(() => conn.close(), 500); 
            return;
        }

        connexionsClients.push(conn);
        conn.on('data', (data) => traiterMessageRecu(data, conn));
        conn.on('close', () => {
            gererDeconnexion(conn.peer);
        });
        conn.on('error', () => {
            gererDeconnexion(conn.peer);
        });
    });
});

peer.on('error', (err) => {
    console.error("Erreur PeerJS:", err);
    if (err.type === 'peer-unavailable') {
        const msgErreur = document.getElementById('msg-erreur-rejoindre');
        if (msgErreur) {
            msgErreur.innerText = "❌ Code invalide ou partie introuvable.";
            msgErreur.style.display = 'block';
            msgErreur.classList.remove('bounce');
            void msgErreur.offsetWidth;
            msgErreur.classList.add('bounce');
        }
    }
});

function changerParametres() {
    if (!estHote) return;
    
    const nouvelArgent = parseInt(document.getElementById('param-argent').value) || 1500;
    const loyerDouble = document.getElementById('param-loyer-double').checked;
    const cagnotteActive = document.getElementById('param-cagnotte').checked;
    const pasDeLoyerEnPrison = document.getElementById('param-loyer-prison').checked;
    const bingoDepart = document.getElementById('param-bingo-depart').checked;
    const uniformiteConstruction = document.getElementById('param-uniformite').checked;
    
    etatJeu.parametres.argentDepart = nouvelArgent;
    etatJeu.parametres.loyerDoubleFamille = loyerDouble;
    etatJeu.parametres.cagnotteActive = cagnotteActive;
    etatJeu.parametres.pasDeLoyerEnPrison = pasDeLoyerEnPrison;
    etatJeu.parametres.bingoDepart = bingoDepart;
    etatJeu.parametres.uniformiteConstruction = uniformiteConstruction;
    
    etatJeu.joueurs.forEach(j => j.argent = nouvelArgent);

    diffuserEtat();
}

function creerPartie() {
    monPseudo = document.getElementById('mon-pseudo').value || "Hôte";
    estHote = true;
    
    etatJeu.joueurs.push({ id: monId, pseudo: monPseudo, position: 0, couleur: 0, argent: etatJeu.parametres.argentDepart, compteurDoubles: 0 });
    
    passerAuLobby();
    document.getElementById('affichage-id').innerText = monId || "Génération en cours...";
    document.getElementById('btn-lancer-partie').classList.remove('hidden');
    document.getElementById('message-attente').classList.add('hidden');
    
    const btnCopier = document.getElementById('btn-copier');
    if (btnCopier) btnCopier.classList.remove('hidden');
    
    mettreAJourLobby();
}

function rejoindrePartie() {
    const msgErreur = document.getElementById('msg-erreur-rejoindre');
    if (msgErreur) {
        msgErreur.style.display = 'none';
        msgErreur.innerText = '';
    }
    monPseudo = document.getElementById('mon-pseudo').value || "Invité";
    const idHote = document.getElementById('id-hote-input').value;
    if (!idHote) return alert("Il faut l'ID de l'hôte !");

    maConnexionHost = peer.connect(idHote);
    maConnexionHost.on('open', () => {
        envoyerAuServeur({ type: 'REJOINDRE', pseudo: monPseudo });
    });
    maConnexionHost.on('data', (data) => traiterMessageRecu(data));
    maConnexionHost.on('close', () => {
        if (maConnexionHost.fermetureAttendue) return; 

        alert("❌ L'hôte de la partie s'est déconnecté. La partie est terminée.");
        location.reload();
    });

    maConnexionHost.on('error', () => {
        alert("❌ Connexion perdue avec l'hôte.");
        location.reload();
    });
}

function envoyerAuServeur(data) {
    if (estHote) traiterLogiqueJeu(data, monId, null);
    else maConnexionHost.send(data);
}

function traiterMessageRecu(data, connExpediteur) {
    if (estHote) {
        traiterLogiqueJeu(data, connExpediteur.peer, connExpediteur);
    } else {
        if (data.type === 'MISE_A_JOUR') {
            if (!document.getElementById('ecran-login').classList.contains('hidden')) passerAuLobby();
            etatJeu = data.etat;
            jeuEnCours = data.jeuDemarre; 
            appliquerEtatJeu();
        } 
        else if (data.type === 'ERREUR') {
            if (maConnexionHost) maConnexionHost.fermetureAttendue = true;
            
            alert(data.message);
            
            if (maConnexionHost) maConnexionHost.close();
            location.reload();
        }
        else if (data.type === 'PROPOSER_ACHAT') {
            propositionAchatEnCours = data;
            appliquerEtatJeu();
        }
        else if (data.type === 'PROPOSER_ECHANGE') {
            listeOffresRecues.push(data);
            majBoutonOffres();
        }
    }
}

function calculerLoyer(idCase, idProprio, scoreDes) {
    const terrain = INFOS_TERRAINS[idCase];
    const propriete = etatJeu.proprietes[idCase];
    const famille = terrain.famille;
    let terrainsPossedes = 0;
    let tailleFamille = 0;

    for (const key in INFOS_TERRAINS) {
        if (INFOS_TERRAINS[key].famille === famille) {
            tailleFamille++;
            if (etatJeu.proprietes[key] && etatJeu.proprietes[key].proprietaire === idProprio) {
                terrainsPossedes++;
            }
        }
    }

    if (famille === 9) { 
        return terrain.loyers[terrainsPossedes - 1];
    }
    else if (famille === 10) { 
        if (terrainsPossedes === 1) return scoreDes * 4;
        if (terrainsPossedes === 2) return scoreDes * 10;
    }
    else { 
        if (propriete.maisons > 0) {
            return terrain.loyers[propriete.maisons]; 
        } else {
            if (terrainsPossedes === tailleFamille) {
                if (etatJeu.parametres.loyerDoubleFamille) {
                    return terrain.loyers[0] * 2; 
                } else {
                    return terrain.loyers[0];
                }
            } else {
                return terrain.loyers[0];
            }
        }
    }
    return 0;
}

function traiterLogiqueJeu(data, idJoueur, connExpediteur) {
    if (data.type === 'REJOINDRE') {
        etatJeu.joueurs.push({ id: idJoueur, pseudo: data.pseudo, position: 0, couleur: etatJeu.joueurs.length, argent: etatJeu.parametres.argentDepart, compteurDoubles: 0 });
        diffuserEtat();
    }
    else if (data.type === 'LANCER_PARTIE') {
        jeuEnCours = true;
        etatJeu.tourActuel = 0; 
        diffuserEtat();
    }
    else if (data.type === 'TRAITER_LANCER_DES') {
        const indexJoueur = etatJeu.joueurs.findIndex(j => j.id === idJoueur);
        if (indexJoueur !== etatJeu.tourActuel) return; 
        const j = etatJeu.joueurs[indexJoueur];
        
        const d1 = data.d1;
        const d2 = data.d2;
        const score = d1 + d2;
        let estUnDouble = (d1 === d2);
        let rejoueImmediatement = false;
        let tourTermine = false;

        etatJeu.derniersDes = [d1, d2];
        etatJeu.log.push(`🎲 ${j.pseudo} a lancé les dés : ${d1} et ${d2} (Total : ${score})`);

        if (estUnDouble) {
            j.compteurDoubles++;
            etatJeu.log.push(`✨ C'est un double ! (${j.compteurDoubles}/3)`);
            
            if (j.compteurDoubles === 3) {
                etatJeu.log.push(`🚨 Troisième double d'affilée ! ${j.pseudo} part directement en prison !`);
                j.position = 10;
                j.enPrison = true;
                j.toursEnPrison = 0;
                j.compteurDoubles = 0; 
                tourTermine = true;
            } else {
                rejoueImmediatement = true;
                tourTermine = gererDeplacementApresDes(indexJoueur, idJoueur, score);
            }
        } else {
            j.compteurDoubles = 0;
            tourTermine = gererDeplacementApresDes(indexJoueur, idJoueur, score);
        }

        if (tourTermine) {
            if (etatJeu.joueurs.some(joueur => joueur.argent < 0)) {
                etatJeu.attenteRemboursement = true;
            } else if (!rejoueImmediatement || j.enPrison) {
                etatJeu.tourActuel = (etatJeu.tourActuel + 1) % etatJeu.joueurs.length;
            }
        } else {
            etatJeu.attenteAchat = true; 
            etatJeu.joueurDoitRejouer = rejoueImmediatement;
        }

        diffuserEtat();
    }
    else if (data.type === 'REPONSE_ACHAT') {
        const indexJoueur = etatJeu.joueurs.findIndex(j => j.id === idJoueur);
        const terrain = INFOS_TERRAINS[data.idCase];

        if (data.achat && etatJeu.joueurs[indexJoueur].argent >= terrain.prix) {
            etatJeu.joueurs[indexJoueur].argent -= terrain.prix; 
            etatJeu.proprietes[data.idCase] = { proprietaire: idJoueur, maisons: 0 }; 
            etatJeu.log.push(`🏠 ${etatJeu.joueurs[indexJoueur].pseudo} a acheté ${terrain.nom} pour ${terrain.prix} €.`);
        } else if (!data.achat) {
            etatJeu.log.push(`🙅‍♂️ ${etatJeu.joueurs[indexJoueur].pseudo} a refusé d'acheter ${terrain.nom}.`);
        }

        etatJeu.attenteAchat = false;

        if (etatJeu.joueurs.some(joueur => joueur.argent < 0)) {
            etatJeu.attenteRemboursement = true;
        } else if (etatJeu.joueurDoitRejouer) {
            etatJeu.joueurDoitRejouer = false;
        } else {
            etatJeu.tourActuel = (etatJeu.tourActuel + 1) % etatJeu.joueurs.length;
        }
        
        diffuserEtat();
    }
    else if (data.type === 'ABANDONNER') {
        const indexJoueur = etatJeu.joueurs.findIndex(j => j.id === idJoueur);
        if (indexJoueur === -1) return;

        const joueur = etatJeu.joueurs[indexJoueur];
        const cEtaitSonTour = (indexJoueur === etatJeu.tourActuel);

        etatJeu.log.push(`🏳️ ${joueur.pseudo} a abandonné la partie et devient spectateur !`);

        for (let idCase in etatJeu.proprietes) {
            if (etatJeu.proprietes[idCase].proprietaire === idJoueur) {
                delete etatJeu.proprietes[idCase]; 
            }
        }

        etatJeu.joueurs.splice(indexJoueur, 1);

        if (etatJeu.tourActuel >= etatJeu.joueurs.length) {
            etatJeu.tourActuel = 0;
        } else if (indexJoueur < etatJeu.tourActuel) {
            etatJeu.tourActuel--;
        }

        if (etatJeu.attenteAchat && cEtaitSonTour) {
            etatJeu.attenteAchat = false;
            propositionAchatEnCours = null;
        }
        if (etatJeu.attenteRemboursement && !etatJeu.joueurs.some(j => j.argent < 0)) {
            etatJeu.attenteRemboursement = false;
        }

        if (etatJeu.joueurs.length === 1 && jeuEnCours) {
            etatJeu.log.push(`🏆 VICTOIRE ! ${etatJeu.joueurs[0].pseudo} est le dernier survivant !`);
        }

        diffuserEtat();
    }
    else if (data.type === 'ACTION_PRISON') {
        const j = etatJeu.joueurs[etatJeu.tourActuel];
        
        if (data.action === 'payer') {
            if (j.argent >= 50) {
                j.argent -= 50;
                if (etatJeu.parametres.cagnotteActive) {
                    etatJeu.cagnotteDettes = (etatJeu.cagnotteDettes || 0) + 50;
                    etatJeu.log.push(`🔓 ${j.pseudo} paie 50 € (qui vont aux Dettes de Benoit) et sort de prison !`);
                } else {
                    etatJeu.log.push(`🔓 ${j.pseudo} paie 50 € à la banque et sort de prison !`);
                }
                j.enPrison = false;
                j.toursEnPrison = 0;
            }
        }
        else if (data.action === 'carte') {
            if (j.carteSortiePrison > 0) {
                j.carteSortiePrison--;
                j.enPrison = false;
                j.toursEnPrison = 0;
                etatJeu.log.push(`🔓 ${j.pseudo} utilise sa carte et sort de prison !`);
            }
        }
        else if (data.action === 'des') {
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const score = d1 + d2;
            
            if (d1 === d2) {
                j.enPrison = false;
                j.toursEnPrison = 0;
                etatJeu.log.push(`🎲 DOUBLE ! ${j.pseudo} sort de prison et avance de ${score}.`);
                j.position = (j.position + score) % 40;
                
                const tourTermine = traiterArriveeCase(etatJeu.tourActuel, j.id, j.position, score);
                if (tourTermine) {
                    if (etatJeu.joueurs.some(joueur => joueur.argent < 0)) {
                        etatJeu.attenteRemboursement = true;
                    } else {
                        etatJeu.tourActuel = (etatJeu.tourActuel + 1) % etatJeu.joueurs.length;
                    }
                }
            } else {
                j.toursEnPrison++;
                etatJeu.log.push(`🎲 ${j.pseudo} a fait ${d1} et ${d2}. Pas de double, il reste en prison (${j.toursEnPrison}/3).`);
                
                if (j.toursEnPrison >= 3) {
                    j.enPrison = false;
                    j.toursEnPrison = 0;
                    etatJeu.log.push(`⏳ 3 tours écoulés ! ${j.pseudo} est relâché en Simple Visite.`);
                }
                etatJeu.tourActuel = (etatJeu.tourActuel + 1) % etatJeu.joueurs.length;
            }
        }
        diffuserEtat();
    }

    else if (data.type === 'CONSTRUIRE') {
        const indexJoueur = etatJeu.joueurs.findIndex(j => j.id === idJoueur);
        const joueur = etatJeu.joueurs[indexJoueur];
        const propriete = etatJeu.proprietes[data.idCase];
        const terrain = INFOS_TERRAINS[data.idCase];
        const prix = getPrixMaison(terrain.famille);

        if (joueur.argent >= prix) {
            joueur.argent -= prix;
            propriete.maisons++;
            
            let typeBatiment = propriete.maisons === 5 ? "un hôtel 🏨" : "une maison 🏠";
            etatJeu.log.push(`🏗️ ${joueur.pseudo} a construit ${typeBatiment} sur ${terrain.nom} pour ${prix} €.`);
            diffuserEtat();
        } else {
            etatJeu.log.push(`❌ ${joueur.pseudo} n'a pas assez d'argent pour construire sur ${terrain.nom}.`);
            diffuserEtat();
        }
    }

    else if (data.type === 'VENDRE') {
        const indexJoueur = etatJeu.joueurs.findIndex(j => j.id === idJoueur);
        const joueur = etatJeu.joueurs[indexJoueur];
        const propriete = etatJeu.proprietes[data.idCase];
        const terrain = INFOS_TERRAINS[data.idCase];

        if (propriete && propriete.proprietaire === idJoueur) {
            let gain = 0;
            
            if (propriete.maisons > 0) {
                gain = Math.floor(getPrixMaison(terrain.famille) / 2);
                propriete.maisons--;
                let typeBatiment = propriete.maisons === 4 ? "un hôtel 🏨" : "une maison 🏠";
                etatJeu.log.push(`🔨 ${joueur.pseudo} a vendu ${typeBatiment} sur ${terrain.nom} pour ${gain} €.`);
            } else {
                gain = Math.floor(terrain.prix / 2);
                delete etatJeu.proprietes[data.idCase]; 
                etatJeu.log.push(`📜 ${joueur.pseudo} a revendu ${terrain.nom} à la banque pour ${gain} €.`);
            }

            const ancienneDette = joueur.argent; 
            joueur.argent += gain;

            if (ancienneDette < 0) {
                let montantRembourse = joueur.argent >= 0 ? Math.abs(ancienneDette) : gain;

                if (joueur.creancier === 'benoit') {
                    etatJeu.cagnotteDettes = (etatJeu.cagnotteDettes || 0) + montantRembourse;
                } else if (joueur.creancier) {
                    const receveur = etatJeu.joueurs.find(j => j.id === joueur.creancier);
                    if (receveur) receveur.argent += montantRembourse;
                }
                
                etatJeu.log.push(`💸 Les ${montantRembourse} € de la vente partent directement rembourser la dette !`);
                if (joueur.argent >= 0) {
                    joueur.creancier = null; 
                }
            }
            if (etatJeu.attenteRemboursement && !etatJeu.joueurs.some(j => j.argent < 0)) {
                etatJeu.attenteRemboursement = false;
                etatJeu.tourActuel = (etatJeu.tourActuel + 1) % etatJeu.joueurs.length;
                etatJeu.log.push(`✅ Toutes les dettes ont été épongées ! Le tour passe.`);
            }
            diffuserEtat();
        }
    }
    else if (data.type === 'PROPOSER_ECHANGE') {
        if (data.cible === monId) {
            listeOffresRecues.push(data);
            majBoutonOffres();
            etatJeu.log.push(`🎁 ${etatJeu.joueurs.find(j => j.id === monId).pseudo} a reçu une offre d'échange.`);
            diffuserEtat();
        } else {
            const connCible = connexionsClients.find(c => c.peer === data.cible);
            if (connCible) {
                connCible.send(data);
                const initiateur = etatJeu.joueurs.find(j => j.id === data.initiateur);
                const cible = etatJeu.joueurs.find(j => j.id === data.cible);
                if (initiateur && cible) {
                    etatJeu.log.push(`🔄 ${initiateur.pseudo} a envoyé une offre d'échange à ${cible.pseudo}...`);
                    diffuserEtat();
                }
            }
        }
    }
    else if (data.type === 'REPONSE_ECHANGE') {
        const donneur = etatJeu.joueurs.find(j => j.id === data.initiateur);
        const receveur = etatJeu.joueurs.find(j => j.id === idJoueur);

        if (data.accepte) {
            const perteDonneur = data.offre.argent - data.demande.argent;
            const perteReceveur = data.demande.argent - data.offre.argent;

            if ((perteDonneur > 0 && perteDonneur > Math.max(0, donneur.argent)) || 
                (perteReceveur > 0 && perteReceveur > Math.max(0, receveur.argent))) {
                
                etatJeu.log.push(`❌ L'échange entre ${donneur.pseudo} et ${receveur.pseudo} a échoué (fonds insuffisants entre temps).`);
                diffuserEtat();
                return;
            }

            donneur.argent = donneur.argent - data.offre.argent + data.demande.argent;
            receveur.argent = receveur.argent + data.offre.argent - data.demande.argent;
            donneur.carteSortiePrison = Math.max(0, (donneur.carteSortiePrison || 0) - data.offre.cartes + data.demande.cartes);
            receveur.carteSortiePrison = Math.max(0, (receveur.carteSortiePrison || 0) + data.offre.cartes - data.demande.cartes);
            data.offre.terrains.forEach(idCase => etatJeu.proprietes[idCase].proprietaire = receveur.id);
            data.demande.terrains.forEach(idCase => etatJeu.proprietes[idCase].proprietaire = donneur.id);

            etatJeu.log.push(`🤝 Accord conclu ! Échange validé entre ${donneur.pseudo} et ${receveur.pseudo}.`);

            if (etatJeu.attenteRemboursement && !etatJeu.joueurs.some(j => j.argent < 0)) {
                etatJeu.attenteRemboursement = false;
                etatJeu.tourActuel = (etatJeu.tourActuel + 1) % etatJeu.joueurs.length;
                etatJeu.log.push(`✅ Dette épongée grâce à l'échange ! Le tour passe.`);
            }
        } else {
            etatJeu.log.push(`❌ ${receveur.pseudo} a refusé l'échange de ${donneur.pseudo}.`);
        }
        diffuserEtat();
    }
}

function gererDeplacementApresDes(indexJoueur, idJoueur, score) {
    const j = etatJeu.joueurs[indexJoueur];
    const anciennePosition = j.position;
    j.position = (anciennePosition + score) % 40;
    if (anciennePosition + score === 40) {
        if (etatJeu.parametres.bingoDepart) {
            j.argent += 400; etatJeu.log.push(`🎯 BINGO Départ : +400 € !`);
        } else {
            j.argent += 200; etatJeu.log.push(`🏁 Passage Départ : +200 €.`);
        }
    } else if (anciennePosition + score > 40) {
        j.argent += 200; etatJeu.log.push(`🏁 Passage Départ : +200 €.`);
    }
    return traiterArriveeCase(indexJoueur, idJoueur, j.position, score);
}

function diffuserEtat() {
    if (estHote && jeuEnCours) {
        verifierFailliteAutomatique();
    }
    
    const message = { type: 'MISE_A_JOUR', etat: etatJeu, jeuDemarre: jeuEnCours };
    connexionsClients.forEach(c => c.send(message));
    appliquerEtatJeu();
}

function appliquerEtatJeu() {
    if (!jeuEnCours) {
        mettreAJourLobby();
        return;
    }

    document.getElementById('ecran-lobby').classList.add('hidden');
    document.getElementById('ecran-jeu').classList.remove('hidden');

    const joueurActuel = etatJeu.joueurs[etatJeu.tourActuel];
    document.getElementById('tour-joueur').innerText = joueurActuel.pseudo;
    document.getElementById('tour-joueur').style.color = getCouleur(etatJeu.tourActuel);

    const cEstAmoi = (joueurActuel.id === monId);
    let btnText = "Attente...";
    let btnDisabled = true;
    const joueurEndette = etatJeu.joueurs.find(j => j.argent < 0);
    const btnLancer = document.getElementById('btn-lancer-des');
    const zoneAchat = document.getElementById('zone-achat-terrain');
    const btnAcheter = document.getElementById('btn-acheter-terrain');

    btnLancer.style.display = 'block';
    if (zoneAchat) zoneAchat.style.display = 'none';

    if (animationDesEnCours) {
         btnText = "Lancement en cours..."; btnDisabled = true;
    } else if (etatJeu.attenteAchat) {
         if (cEstAmoi && typeof propositionAchatEnCours !== 'undefined' && propositionAchatEnCours) {
             btnLancer.style.display = 'none';
             if (zoneAchat) zoneAchat.style.display = 'flex';
             
             const prix = propositionAchatEnCours.terrain.prix;
             btnAcheter.innerText = `Acheter (${prix} €)`;
             
             if (joueurActuel.argent < prix) {
                 btnAcheter.disabled = true;
                 btnAcheter.innerText = `Fonds insuffisants (${prix} €)`;
             } else {
                 btnAcheter.disabled = false;
             }
         } else {
             btnText = "Attente d'une décision..."; btnDisabled = true;
         }
    } else if (joueurEndette) {
        btnDisabled = true;
        btnText = (joueurEndette.id === monId) ? "Remboursez vos dettes !" : `Attente de ${joueurEndette.pseudo}...`;
    } else if (cEstAmoi) {
        if (joueurActuel.enPrison) {
            btnText = "Enfermé..."; btnDisabled = true;
        } else {
            if (joueurActuel.compteurDoubles > 0) {
                 btnText = "🎲 REJOUER ! (Double)";
            } else {
                 btnText = "🎲 LANCER LES DÉS";
            }
            btnDisabled = false;
        }
    }

    btnLancer.disabled = btnDisabled;
    const jeSuisEnJeu = etatJeu.joueurs.some(j => j.id === monId);
    const btnAbandonner = document.getElementById('btn-abandonner');
    
    if (!jeSuisEnJeu) {
        btnLancer.style.display = 'none';
        if (zoneAchat) zoneAchat.style.display = 'none';
        if (btnAbandonner) btnAbandonner.style.display = 'none';
    } else {
        if (btnAbandonner) btnAbandonner.style.display = 'block';
    }
    btnLancer.innerText = btnText;

    if (etatJeu.derniersDes) {
        document.getElementById('zone-anim-des').classList.remove('hidden');
        if (!animationDesEnCours) {
            document.getElementById('de-1').className = 'de show-' + etatJeu.derniersDes[0];
            document.getElementById('de-2').className = 'de show-' + etatJeu.derniersDes[1];
        }
    }

    if (cEstAmoi && joueurActuel.enPrison) {
        afficherModalPrison(joueurActuel);
    } else {
        const mod = document.getElementById('modal-prison');
        if(mod) mod.classList.add('hidden');
    }

    const tableauScores = document.getElementById('tableau-scores');
    if (tableauScores) {
        tableauScores.innerHTML = ''; 
        etatJeu.joueurs.forEach(j => {
            const scoreDiv = document.createElement('div');
            scoreDiv.className = 'score-joueur';
            scoreDiv.style.borderLeftColor = getCouleur(j.couleur);
            const couleurArgent = j.argent < 0 ? '#d9534f' : '#4da6ff';
            scoreDiv.innerHTML = `<span>${j.pseudo}</span> <strong style="color: ${couleurArgent};">${j.argent} €</strong>`;
            tableauScores.appendChild(scoreDiv);
        });
    }

    for (let i = 0; i < 40; i++) {
        let caseDiv = document.getElementById('case-' + i);
        let zoneMaisons = document.getElementById('maisons-' + i);

        if (caseDiv && INFOS_TERRAINS[i]) {
            if (etatJeu.proprietes[i]) {
                const proprio = etatJeu.joueurs.find(j => j.id === etatJeu.proprietes[i].proprietaire);
                if (proprio) {
                    caseDiv.style.backgroundColor = getCouleurFond(proprio.couleur);
                    caseDiv.style.borderColor = getCouleur(proprio.couleur);
                }
                
                if (zoneMaisons) {
                    zoneMaisons.innerHTML = '';
                    const nbM = etatJeu.proprietes[i].maisons;
                    if (nbM > 0 && nbM < 5) {
                        for(let m=0; m<nbM; m++) {
                            let mDiv = document.createElement('div');
                            mDiv.className = 'maison-visuelle';
                            zoneMaisons.appendChild(mDiv);
                        }
                    } else if (nbM === 5) {
                        let hDiv = document.createElement('div');
                        hDiv.className = 'hotel-visuel';
                        zoneMaisons.appendChild(hDiv);
                    }
                }
            } else {
                caseDiv.style.backgroundColor = '#262626';
                caseDiv.style.borderColor = '#444';
                if (zoneMaisons) zoneMaisons.innerHTML = '';
            }
        }
    }

    const caseBenoit = document.getElementById('case-20');
    if (caseBenoit) {
        const divNom = caseBenoit.querySelector('.nom-terrain');
        if (divNom) {
            if (!etatJeu.parametres.cagnotteActive) {
                divNom.innerHTML = `Dettes de Benoit<br><span style="color: #777; font-size: clamp(6px, 1.2vmin, 10px);">Repos</span>`;
            } else {
                const montant = etatJeu.cagnotteDettes || 0;
                if (montant > 0) {
                    divNom.innerHTML = `Dettes de Benoit<br><span style="color: #4da6ff; font-size: clamp(8px, 1.5vmin, 14px); font-weight: bold;">💰 ${montant} €</span>`;
                } else {
                    divNom.innerHTML = `Dettes de Benoit<br><span style="color: #777; font-size: clamp(6px, 1.2vmin, 10px);">0 €</span>`;
                }
            }
        }
    }

    etatJeu.joueurs.forEach((j) => {
        let pion = document.getElementById('pion-' + j.couleur);
        if (!pion) {
            pion = document.createElement('div');
            pion.id = 'pion-' + j.couleur;
            pion.className = `pion pion-${j.couleur}`; 
            pion.title = j.pseudo;
            document.body.appendChild(pion); 
        }
        
        if (j.enPrison) {
            const zonePrisonDiv = document.getElementById('pions-prison');
            if (zonePrisonDiv) zonePrisonDiv.appendChild(pion);
        } else {
            const zonePionsDiv = document.getElementById('zone-pions-' + j.position);
            if (zonePionsDiv) zonePionsDiv.appendChild(pion);
        }
    });

    document.querySelectorAll('.pion').forEach(pionDOM => {
        const couleurId = parseInt(pionDOM.id.split('-')[1]);
        if (!etatJeu.joueurs.some(j => j.couleur === couleurId)) {
            pionDOM.remove();
        }
    });

    const listeHistorique = document.getElementById('liste-historique');
    if (listeHistorique && etatJeu.log.length > 0) {
        listeHistorique.innerHTML = '';
        
        [...etatJeu.log].reverse().forEach(msg => {
            let li = document.createElement('li');
            li.innerText = msg;
            listeHistorique.appendChild(li);
        });

        const conteneurHistorique = document.getElementById('historique');
        conteneurHistorique.scrollTop = 0;
    }

    const ecranFin = document.getElementById('ecran-fin-partie');
    if (jeuEnCours && etatJeu.joueurs.length === 1) {
        const vainqueur = etatJeu.joueurs[0];
        
        if (ecranFin) {
            ecranFin.classList.remove('hidden');
            document.getElementById('nom-vainqueur').innerText = vainqueur.pseudo + " remporte la partie !";
        }
        
        const btnLancerDesFin = document.getElementById('btn-lancer-des');
        if (btnLancerDesFin) {
            btnLancerDesFin.disabled = true;
            btnLancerDesFin.innerText = "Partie terminée";
        }
    } else {
        if (ecranFin) ecranFin.classList.add('hidden');
    }
}

function mettreAJourLobby() {
    const liste = document.getElementById('liste-joueurs-lobby');
    if (!liste) return;
    liste.innerHTML = "";
    
    etatJeu.joueurs.forEach(j => {
        const li = document.createElement('li');
        li.innerText = j.pseudo;
        liste.appendChild(li);
    });

    if (!estHote && etatJeu.joueurs.length > 0) {
        const hote = etatJeu.joueurs[0]; 
        const msgAttente = document.getElementById('message-attente');
        if (msgAttente) {
            msgAttente.innerText = `En attente de ${hote.pseudo}...`;
            msgAttente.style.fontStyle = "italic";
            msgAttente.style.color = "#aaa";
        }
    }

    const inputArgent = document.getElementById('param-argent');
    const affichageArgent = document.getElementById('param-argent-affichage');
    if (inputArgent && affichageArgent && etatJeu.parametres) {
        if (estHote) {
            inputArgent.classList.remove('hidden');
            affichageArgent.classList.add('hidden');
            inputArgent.value = etatJeu.parametres.argentDepart;
        } else {
            inputArgent.classList.add('hidden');
            affichageArgent.classList.remove('hidden');
            affichageArgent.innerText = etatJeu.parametres.argentDepart + " €";
        }
    }

    const inputLoyer = document.getElementById('param-loyer-double');
    const affichageLoyer = document.getElementById('param-loyer-double-affichage');
    if (inputLoyer && affichageLoyer && etatJeu.parametres) {
        if (estHote) {
            inputLoyer.style.display = 'inline-block';
            affichageLoyer.classList.add('hidden');
            inputLoyer.checked = etatJeu.parametres.loyerDoubleFamille;
        } else {
            inputLoyer.style.display = 'none';
            affichageLoyer.classList.remove('hidden');
            
            if (etatJeu.parametres.loyerDoubleFamille) {
                affichageLoyer.innerText = "Oui";
                affichageLoyer.style.color = "#28a745";
            } else {
                affichageLoyer.innerText = "Non";
                affichageLoyer.style.color = "#d9534f";
            }
        }
    }

    const inputCagnotte = document.getElementById('param-cagnotte');
    const affichageCagnotte = document.getElementById('param-cagnotte-affichage');
    if (inputCagnotte && affichageCagnotte && etatJeu.parametres) {
        if (estHote) {
            inputCagnotte.style.display = 'inline-block';
            affichageCagnotte.classList.add('hidden');
            inputCagnotte.checked = etatJeu.parametres.cagnotteActive;
        } else {
            inputCagnotte.style.display = 'none';
            affichageCagnotte.classList.remove('hidden');
            
            if (etatJeu.parametres.cagnotteActive) {
                affichageCagnotte.innerText = "Oui";
                affichageCagnotte.style.color = "#28a745";
            } else {
                affichageCagnotte.innerText = "Non";
                affichageCagnotte.style.color = "#d9534f";
            }
        }
    }

    const inputLoyerPrison = document.getElementById('param-loyer-prison');
    const affichageLoyerPrison = document.getElementById('param-loyer-prison-affichage');
    if (inputLoyerPrison && affichageLoyerPrison && etatJeu.parametres) {
        if (estHote) {
            inputLoyerPrison.style.display = 'inline-block';
            affichageLoyerPrison.classList.add('hidden');
            inputLoyerPrison.checked = etatJeu.parametres.pasDeLoyerEnPrison;
        } else {
            inputLoyerPrison.style.display = 'none';
            affichageLoyerPrison.classList.remove('hidden');
            
            if (etatJeu.parametres.pasDeLoyerEnPrison) {
                affichageLoyerPrison.innerText = "Oui";
                affichageLoyerPrison.style.color = "#28a745";
            } else {
                affichageLoyerPrison.innerText = "Non";
                affichageLoyerPrison.style.color = "#d9534f";
            }
        }
    }

    const inputBingo = document.getElementById('param-bingo-depart');
    const affichageBingo = document.getElementById('param-bingo-depart-affichage');
    if (inputBingo && affichageBingo && etatJeu.parametres) {
        if (estHote) {
            inputBingo.style.display = 'inline-block';
            affichageBingo.classList.add('hidden');
            inputBingo.checked = etatJeu.parametres.bingoDepart;
        } else {
            inputBingo.style.display = 'none';
            affichageBingo.classList.remove('hidden');
            
            if (etatJeu.parametres.bingoDepart) {
                affichageBingo.innerText = "Oui";
                affichageBingo.style.color = "#28a745";
            } else {
                affichageBingo.innerText = "Non";
                affichageBingo.style.color = "#d9534f";
            }
        }
    }

    const inputUniformite = document.getElementById('param-uniformite');
    const affichageUniformite = document.getElementById('param-uniformite-affichage');
    if (inputUniformite && affichageUniformite && etatJeu.parametres) {
        if (estHote) {
            inputUniformite.style.display = 'inline-block';
            affichageUniformite.classList.add('hidden');
            inputUniformite.checked = etatJeu.parametres.uniformiteConstruction;
        } else {
            inputUniformite.style.display = 'none';
            affichageUniformite.classList.remove('hidden');
            
            if (etatJeu.parametres.uniformiteConstruction) {
                affichageUniformite.innerText = "Oui";
                affichageUniformite.style.color = "#28a745";
            } else {
                affichageUniformite.innerText = "Non";
                affichageUniformite.style.color = "#d9534f";
            }
        }
    }
}

function passerAuLobby() {
    document.getElementById('ecran-login').classList.add('hidden');
    document.getElementById('ecran-lobby').classList.remove('hidden');

    const zoneId = document.getElementById('zone-id-partie');
    if (zoneId) {
        if (estHote) {
            zoneId.style.display = 'block';
        } else {
            zoneId.style.display = 'none';
        }
    }
}

function demarrerLaPartie() { 
    if (etatJeu.joueurs.length < 2) {
        alert("❌ Impossible de lancer : il faut au moins 2 joueurs pour jouer !");
        return;
    }
    envoyerAuServeur({ type: 'LANCER_PARTIE' }); 
}
function actionLancerDes() { envoyerAuServeur({ type: 'LANCER_DES' }); }

function getCouleur(index) {
    const c = ['#ff4d4d', '#4da6ff', '#33cc33', '#ff9900', '#9933cc', '#ffffff']; 
    return c[index % c.length]; 
}

function getCouleurFond(index) {
    const c = [
        'rgba(255, 77, 77, 0.25)', 
        'rgba(77, 166, 255, 0.25)', 
        'rgba(51, 204, 51, 0.25)', 
        'rgba(255, 153, 0, 0.25)', 
        'rgba(153, 51, 204, 0.25)', 
        'rgba(255, 255, 255, 0.25)'
    ]; 
    return c[index % c.length]; 
}

const imagesTerrains = {
    1: "angers.jpg",
    2: "surprise.jpg",
    3: "angers.jpg",
    4: "taxe.jpg",
    5: "voiture.jpg",
    6: "dieppe.jpg",
    7: "surprise.jpg",
    8: "dieppe.jpg",
    9: "dieppe.jpg",
    11: "skateboard.jpg",
    12: "total.jpg",
    13: "skateboard.jpg",
    14: "skateboard.jpg",
    15: "voiture.jpg",
    16: "skateboard.jpg",
    17: "surprise.jpg",
    18: "skateboard.jpg",
    19: "skateboard.jpg",
    21: "food.jpg",
    22: "surprise.jpg",
    23: "food.jpg",
    24: "food.jpg",
    25: "voiture.jpg",
    26: "food.jpg",
    27: "food.jpg",
    28: "financier.jpg",
    29: "food.jpg",
    31: "ville.jpg",
    32: "ville.jpg",
    33: "surprise.jpg",
    34: "ville.jpg",
    35: "voiture.jpg",
    36: "surprise.jpg",
    37: "ville.jpg",
    38: "taxe.jpg",
    39: "ville.jpg"
};

function genererPlateau() {
    const plateau = document.getElementById('plateau');
    const centrePlateau = document.querySelector('.centre-plateau');
    plateau.innerHTML = ''; 
    if (centrePlateau) plateau.appendChild(centrePlateau);

    for (let i = 0; i < 40; i++) {
        let caseDiv = document.createElement('div');
        caseDiv.className = 'case';
        caseDiv.id = 'case-' + i;
        caseDiv.setAttribute('onclick', `clicSurCase(${i})`);
        
        if (i === 10) {
            caseDiv.classList.add('case-prison');

            let zonePrison = document.createElement('div');
            zonePrison.className = 'zone-en-prison';
            let imgPrison = document.createElement('img');
            imgPrison.src = "prison.jpg"; 
            imgPrison.alt = "Prison";
            zonePrison.appendChild(imgPrison);

            let conteneurPionsPrison = document.createElement('div');
            conteneurPionsPrison.id = 'pions-prison';
            conteneurPionsPrison.className = 'pions-dans-prison';
            zonePrison.appendChild(conteneurPionsPrison);

            let zoneVisite = document.createElement('div');
            zoneVisite.className = 'zone-visite';
            
            let texteVisite = document.createElement('div');
            texteVisite.className = 'visite-texte';
            texteVisite.innerText = "Visite";

            let zonePions = document.createElement('div');
            zonePions.className = 'zone-pions';
            zonePions.id = 'zone-pions-' + i;

            zoneVisite.appendChild(texteVisite);
            zoneVisite.appendChild(zonePions);
            caseDiv.appendChild(zonePrison);
            caseDiv.appendChild(zoneVisite);
        } else {
            if (imagesTerrains[i]) {
                let img = document.createElement('img');
                img.src = imagesTerrains[i]; 
                img.alt = nomsTerrains[i]; 
                
                if (i >= 0 && i <= 10) { img.className = 'image-case img-bas'; } 
                else if (i > 10 && i <= 20) { img.className = 'image-case img-gauche'; } 
                else if (i > 20 && i <= 30) { img.className = 'image-case img-haut'; } 
                else { img.className = 'image-case img-droite'; }
                
                caseDiv.appendChild(img);
            }

            let zoneMaisons = document.createElement('div');
            zoneMaisons.className = 'zone-maisons';
            zoneMaisons.id = 'maisons-' + i;

            let nomTerrain = document.createElement('div');
            nomTerrain.className = 'nom-terrain';
            
            if (INFOS_TERRAINS[i]) {
                nomTerrain.innerHTML = `${nomsTerrains[i]}<br><span class="prix-terrain">${INFOS_TERRAINS[i].prix} €</span>`;
            } else {
                nomTerrain.innerText = nomsTerrains[i];
            }

            let zonePions = document.createElement('div');
            zonePions.className = 'zone-pions';
            zonePions.id = 'zone-pions-' + i;

            caseDiv.appendChild(zoneMaisons);
            caseDiv.appendChild(nomTerrain);
            caseDiv.appendChild(zonePions);
        }
        
        if (i >= 0 && i <= 10) { 
            caseDiv.classList.add('case-bas');
            caseDiv.style.gridRow = 11; 
            caseDiv.style.gridColumn = 11 - i; 
        }
        else if (i > 10 && i <= 20) { 
            caseDiv.classList.add('case-gauche');
            caseDiv.style.gridColumn = 1; 
            caseDiv.style.gridRow = 21 - i; 
        }
        else if (i > 20 && i <= 30) { 
            caseDiv.classList.add('case-haut');
            caseDiv.style.gridRow = 1; 
            caseDiv.style.gridColumn = i - 19; 
        }
        else { 
            caseDiv.classList.add('case-droite');
            caseDiv.style.gridColumn = 11; 
            caseDiv.style.gridRow = i - 29; 
        }
        
        plateau.appendChild(caseDiv);
    }
}

function verifierFailliteAutomatique() {
    for (let i = etatJeu.joueurs.length - 1; i >= 0; i--) {
        let j = etatJeu.joueurs[i];
        
        if (j.argent < 0) {
            let possedeTerrains = false;
            for (let idCase in etatJeu.proprietes) {
                if (etatJeu.proprietes[idCase].proprietaire === j.id) {
                    possedeTerrains = true;
                    break;
                }
            }
            
            let possedeCartes = (j.carteSortiePrison && j.carteSortiePrison > 0);
            
            if (!possedeTerrains && !possedeCartes) {
                etatJeu.log.push(`💀 FAILLITE ! ${j.pseudo} n'a plus d'argent ni de biens à vendre. Il est éliminé d'office !`);
                
                const cEtaitSonTour = (i === etatJeu.tourActuel);
                
                etatJeu.joueurs.splice(i, 1);
                
                if (etatJeu.tourActuel >= etatJeu.joueurs.length) {
                    etatJeu.tourActuel = 0;
                } else if (i < etatJeu.tourActuel) {
                    etatJeu.tourActuel--;
                }
                
                if (etatJeu.attenteAchat && cEtaitSonTour) {
                    etatJeu.attenteAchat = false;
                    propositionAchatEnCours = null;
                }
                
                if (etatJeu.attenteRemboursement && !etatJeu.joueurs.some(joueur => joueur.argent < 0)) {
                    etatJeu.attenteRemboursement = false;
                }
            }
        }
    }
}

function traiterArriveeCase(indexJoueur, idJoueur, position, scoreDes) {
    const terrain = INFOS_TERRAINS[position];
    const propriete = etatJeu.proprietes[position];
    const joueur = etatJeu.joueurs[indexJoueur];

    if (terrain) {
        if (!propriete && terrain.prix) {
            etatJeu.attenteAchat = true;
            
            if (idJoueur === monId) {
                propositionAchatEnCours = { idCase: position, terrain: terrain };
            } else {
                const connClient = connexionsClients.find(c => c.peer === idJoueur);
                if (connClient) {
                    connClient.send({ type: 'PROPOSER_ACHAT', idCase: position, terrain: terrain });
                }
            }
            return false;
        }
        else if (propriete.proprietaire !== idJoueur) {
            const indexProprio = etatJeu.joueurs.findIndex(j => j.id === propriete.proprietaire);
            const proprio = etatJeu.joueurs[indexProprio];
            
            if (proprio.enPrison && etatJeu.parametres.pasDeLoyerEnPrison) {
                etatJeu.log.push(`😴 ${proprio.pseudo} est en prison et ne peut pas percevoir le loyer de ${terrain.nom} !`);
            } else {
                const loyer = calculerLoyer(position, propriete.proprietaire, scoreDes);
                gererPaiementJoueur(indexJoueur, indexProprio, loyer, `de loyer pour ${terrain.nom}`);
            }
        }
    }
    else if ([2, 7, 17, 22, 33, 36].includes(position)) {
        const carte = CARTES_SURPRISE[Math.floor(Math.random() * CARTES_SURPRISE.length)];
        etatJeu.log.push(`🃏 SURPRISE : ${carte.texte}`);
        
        if (carte.type === "paiement") {
            if (carte.montant > 0) joueur.argent += carte.montant;
            else gererPaiementBanque(indexJoueur, Math.abs(carte.montant));
        }
        else if (carte.type === "collecte") {
            etatJeu.joueurs.forEach((autreJ, i) => {
                if (i !== indexJoueur) gererPaiementJoueur(i, indexJoueur, carte.montant, "pour la collecte");
            });
        }
        else if (carte.type === "reparations") {
            let total = 0;
            for (let k in etatJeu.proprietes) {
                if (etatJeu.proprietes[k].proprietaire === idJoueur) {
                    let m = etatJeu.proprietes[k].maisons;
                    if (m > 0 && m < 5) total += m * carte.prixMaison;
                    else if (m === 5) total += carte.prixHotel;
                }
            }
            if (total > 0) {
                gererPaiementBanque(indexJoueur, total);
                etatJeu.log.push(`${joueur.pseudo} paie ${total} € de frais.`);
            }
        }
        else if (carte.type === "cartePrison") {
            joueur.carteSortiePrison = (joueur.carteSortiePrison || 0) + 1;
        }
        else if (carte.type === "allerA" || carte.type === "mouvement") {
            const anciennePosition = joueur.position;
            
            if (carte.type === "allerA") {
                joueur.position = carte.destination;
                
                if (carte.destination < anciennePosition && carte.destination !== 10) {
                    if (carte.destination === 0) {
                        if (etatJeu.parametres.bingoDepart) {
                            joueur.argent += 400;
                            etatJeu.log.push(`🎯 BINGO ! ${joueur.pseudo} tombe PILE sur le Départ avec sa carte et gagne 400 € !`);
                        } else {
                            joueur.argent += 200;
                            etatJeu.log.push(`🏁 ${joueur.pseudo} atterrit sur le Départ avec sa carte et reçoit 200 €.`);
                        }
                    } else {
                        joueur.argent += 200;
                        etatJeu.log.push(`🏁 ${joueur.pseudo} passe le Départ avec sa carte et reçoit 200 €.`);
                    }
                }
            }
            else {
                joueur.position = (anciennePosition + carte.cases + 40) % 40;
            }
            
            if (joueur.position === 10) {
                etatJeu.log.push(`👮 ${joueur.pseudo} va directement en prison sans passer par la case départ !`);
                joueur.enPrison = true;
                joueur.toursEnPrison = 0;
                return true; 
            }
            
            return traiterArriveeCase(indexJoueur, idJoueur, joueur.position, scoreDes);
        }
    }
    else if (position === 20) {
        if (!etatJeu.parametres.cagnotteActive) {
            etatJeu.log.push(`☕ ${joueur.pseudo} se repose tranquillement sur la case Dettes de Benoit.`);
            return true;
        }
        
        let montantCagnotte = etatJeu.cagnotteDettes || 0;
        if (montantCagnotte > 0) {
            joueur.argent += montantCagnotte;
            etatJeu.log.push(`🎉 JACKPOT ! ${joueur.pseudo} encaisse les ${montantCagnotte} € des Dettes de Benoit !`);
            etatJeu.cagnotteDettes = 0;
        } else {
            etatJeu.log.push(`🤷‍♂️ ${joueur.pseudo} s'arrête sur les Dettes de Benoit, mais la caisse est vide !`);
        }
        return true;
    }
    else if (position === 30) {
        etatJeu.log.push(`🚨 Oh non ! ${joueur.pseudo} s'est fait arrêter. Il va directement en prison !`);
        joueur.position = 10;
        joueur.enPrison = true;
        joueur.toursEnPrison = 0;
        return true; 
    }
    else if (position === 38) { 
        gererPaiementBanque(indexJoueur, 75);
        etatJeu.log.push(`${joueur.pseudo} paie la taxe de 75 €.`);
    }
    else if (position === 4) { 
        let taxe = Math.floor(joueur.argent * 0.10);
        gererPaiementBanque(indexJoueur, taxe);
        etatJeu.log.push(`${joueur.pseudo} paie la taxe de 10% (${taxe} €).`);
    }

    return true; 
}

function gererPaiementBanque(indexJoueur, montant) {
    let joueur = etatJeu.joueurs[indexJoueur];
    let argentDispo = Math.max(0, joueur.argent); 
    
    joueur.argent -= montant; 

    if (joueur.argent < 0) {
        if (etatJeu.parametres.cagnotteActive) {
            etatJeu.cagnotteDettes = (etatJeu.cagnotteDettes || 0) + argentDispo;
            joueur.creancier = 'benoit'; 
            etatJeu.log.push(`⚠️ ${joueur.pseudo} est dans le rouge ! Il donne ses ${argentDispo} € aux Dettes de Benoit et doit encore ${Math.abs(joueur.argent)} €.`);
        } else {
            joueur.creancier = null;
            etatJeu.log.push(`⚠️ ${joueur.pseudo} est dans le rouge ! Il doit ${Math.abs(joueur.argent)} € à la banque.`);
        }
    } else {
        if (etatJeu.parametres.cagnotteActive) {
            etatJeu.cagnotteDettes = (etatJeu.cagnotteDettes || 0) + montant;
        }
    }
}

function gererPaiementJoueur(indexPayeur, indexReceveur, montant, motif) {
    let payeur = etatJeu.joueurs[indexPayeur];
    let receveur = etatJeu.joueurs[indexReceveur];
    let argentDispo = Math.max(0, payeur.argent);
    
    payeur.argent -= montant;

    if (payeur.argent < 0) {
        receveur.argent += argentDispo;
        payeur.creancier = receveur.id;
        etatJeu.log.push(`⚠️ ${payeur.pseudo} est dans le rouge ! Il donne ${argentDispo} € à ${receveur.pseudo} et lui doit encore ${Math.abs(payeur.argent)} € ${motif}.`);
    } else {
        receveur.argent += montant;
        etatJeu.log.push(`${payeur.pseudo} paie ${montant} € à ${receveur.pseudo} ${motif}.`);
    }
}

function copierId() {
    if (monId) {
        navigator.clipboard.writeText(monId).then(() => {
            const btn = document.getElementById('btn-copier');
            const texteOriginal = btn.innerHTML;
            btn.innerHTML = "✅ Copié !";
            btn.style.backgroundColor = "#28a745";
            setTimeout(() => { 
                btn.innerHTML = texteOriginal; 
                btn.style.backgroundColor = "#4da6ff"; 
            }, 2000);
        }).catch(err => {
            console.error('Erreur lors de la copie :', err);
            alert("Erreur lors de la copie de l'ID. Sélectionnez-le manuellement.");
        });
    }
}

function afficherModalPrison(joueur) {
    document.getElementById('modal-prison').classList.remove('hidden');
    const btnCarte = document.getElementById('btn-prison-carte');
    if (joueur.carteSortiePrison > 0) {
        btnCarte.disabled = false;
        btnCarte.innerText = `Utiliser une carte (${joueur.carteSortiePrison} dispo)`;
    } else {
        btnCarte.disabled = true;
        btnCarte.innerText = `Utiliser une carte (0 dispo)`;
    }
}

function actionPrison(choix) {
    document.getElementById('modal-prison').classList.add('hidden');
    envoyerAuServeur({ type: 'ACTION_PRISON', action: choix });
}

let caseConstructionEnCours = null;

function getPrixMaison(famille) {
    if (famille <= 2) return 50;
    if (famille <= 4) return 100;
    if (famille <= 6) return 150;
    if (famille <= 8) return 200;
    return 0;
}

function clicSurCase(idCase) {
    const terrain = INFOS_TERRAINS[idCase];
    if (!terrain) return;

    document.getElementById('info-nom-terrain').innerText = terrain.nom;
    document.getElementById('info-prix-achat').innerText = terrain.prix + " €";
    
    const blocMaison = document.getElementById('bloc-prix-maison');
    const blocHotel = document.getElementById('bloc-prix-hotel');
    const loyersStandard = document.getElementById('info-loyers-standard');
    const loyersSpeciaux = document.getElementById('info-loyers-speciaux');

    if (terrain.famille <= 8) {
        loyersStandard.classList.remove('hidden');
        loyersSpeciaux.classList.add('hidden');
        blocMaison.style.display = 'flex';
        blocHotel.style.display = 'flex';
        
        for(let i=0; i<=5; i++) {
            document.getElementById('loyer-'+i).innerText = terrain.loyers[i] + " €";
        }
        const prixConst = getPrixMaison(terrain.famille);
        document.getElementById('info-prix-maison').innerText = prixConst + " €";
        document.getElementById('info-prix-hotel').innerText = prixConst + " €";
    } else {
        loyersStandard.classList.add('hidden');
        loyersSpeciaux.classList.remove('hidden');
        blocMaison.style.display = 'none';
        blocHotel.style.display = 'none';
        
        const txtSpecial = document.getElementById('texte-loyer-special');
        if (terrain.famille === 9) {
            txtSpecial.innerHTML = "Si 1 terrain possédé : <strong>25 €</strong><br>Si 2 terrains possédés : <strong>50 €</strong><br>Si 3 terrains possédés : <strong>100 €</strong><br>Si 4 terrains possédés : <strong>200 €</strong>";
        } else if (terrain.famille === 10) {
            txtSpecial.innerHTML = "Si 1 compagnie : <strong>Lancer des dés x 4</strong><br>Si 2 compagnies : <strong>Lancer des dés x 10</strong>";
        }
    }

    const btnConstruire = document.getElementById('btn-construire');
    btnConstruire.style.display = 'none';

    const indexJoueur = etatJeu.joueurs.findIndex(j => j.id === monId);
    const propriete = etatJeu.proprietes[idCase];
    const cEstMonTour = (jeuEnCours && indexJoueur === etatJeu.tourActuel);

    if (propriete && propriete.proprietaire === monId && terrain.famille <= 8) {
        btnConstruire.style.display = 'inline-block';
        btnConstruire.disabled = true;

        let possedeTouteFamille = true;
        let terrainsFamille = [];
        for (const key in INFOS_TERRAINS) {
            if (INFOS_TERRAINS[key].famille === terrain.famille) {
                if (!etatJeu.proprietes[key] || etatJeu.proprietes[key].proprietaire !== monId) {
                    possedeTouteFamille = false;
                }
                terrainsFamille.push(etatJeu.proprietes[key]);
            }
        }

        if (!cEstMonTour) {
            btnConstruire.innerText = "Attendez votre tour";
        } else if (!possedeTouteFamille) {
            btnConstruire.innerText = "Famille incomplète";
        } else if (propriete.maisons >= 5) {
            btnConstruire.innerText = "Niveau Max Atteint";
        } else {
            let peutConstruireUniformement = true;
            for (let prop of terrainsFamille) {
                if (prop && prop.maisons < propriete.maisons) {
                    peutConstruireUniformement = false;
                }
            }
            
            if (!etatJeu.parametres.uniformiteConstruction) {
                peutConstruireUniformement = true;
            }

            if (!peutConstruireUniformement) {
                btnConstruire.innerText = "Construisez ailleurs d'abord";
            } else {
                btnConstruire.disabled = false; 
                btnConstruire.innerText = "Construire";
            }
        }
    }

    const btnVendre = document.getElementById('btn-vendre');
    btnVendre.style.display = 'none';

    if (propriete && propriete.proprietaire === monId) {
        btnVendre.style.display = 'inline-block';
        btnVendre.disabled = true;

        if (propriete.maisons > 0) {
            const gain = Math.floor(getPrixMaison(terrain.famille) / 2);
            let peutVendreUniformement = true;
            for (const key in INFOS_TERRAINS) {
                if (INFOS_TERRAINS[key].famille === terrain.famille && etatJeu.proprietes[key]) {
                    if (etatJeu.proprietes[key].maisons > propriete.maisons) peutVendreUniformement = false;
                }
            }
            
            if (!etatJeu.parametres.uniformiteConstruction) {
                peutVendreUniformement = true;
            }

            if (!cEstMonTour) {
                btnVendre.innerText = "Attendez votre tour";
            } else if (!peutVendreUniformement) {
                btnVendre.innerText = "Vente Bâtiment impossible (Uniformité)";
            } else {
                btnVendre.innerText = `Vendre 1 Bâtiment (+${gain} €)`;
                btnVendre.disabled = false;
            }
        } else {
            let aDesMaisonsDansFamille = false;
            for (const key in INFOS_TERRAINS) {
                if (INFOS_TERRAINS[key].famille === terrain.famille && etatJeu.proprietes[key] && etatJeu.proprietes[key].maisons > 0) {
                    aDesMaisonsDansFamille = true;
                }
            }

            const gain = Math.floor(terrain.prix / 2);
            
            if (!cEstMonTour) {
                btnVendre.innerText = "Attendez votre tour";
            } else if (aDesMaisonsDansFamille) {
                btnVendre.innerText = "Vendez les maisons d'abord";
            } else {
                btnVendre.innerText = `Revendre Terrain (+${gain} €)`;
                btnVendre.disabled = false;
            }
        }
    }

    caseConstructionEnCours = idCase;
    document.getElementById('modal-infos-terrain').classList.remove('hidden');
}

function fermerModalInfos() {
    document.getElementById('modal-infos-terrain').classList.add('hidden');
}

function actionConstruire() {
    envoyerAuServeur({ type: 'CONSTRUIRE', idCase: caseConstructionEnCours });
    fermerModalInfos();
}

function actionVendre() {
    const terrain = INFOS_TERRAINS[caseConstructionEnCours];
    const propriete = etatJeu.proprietes[caseConstructionEnCours];
    let messageConfirmation = "";
    
    if (propriete.maisons > 0) {
        let typeBatiment = propriete.maisons === 5 ? "votre hôtel" : "une maison";
        messageConfirmation = `⚠️ ATTENTION ⚠️\n\nÊtes-vous sûr de vouloir vendre ${typeBatiment} sur ${terrain.nom} ?\n\nVous ne récupérerez que la moitié de son prix d'achat.`;
    } else {
        messageConfirmation = `⚠️ ATTENTION ⚠️\n\nÊtes-vous sûr de vouloir revendre le terrain "${terrain.nom}" à la banque ?\n\nIl redeviendra libre et n'importe qui pourra l'acheter !`;
    }

    if (window.confirm(messageConfirmation)) {
        envoyerAuServeur({ type: 'VENDRE', idCase: caseConstructionEnCours });
        fermerModalInfos();
    }
}

let listeOffresRecues = [];

function ouvrirModalEchange() {
    if (!jeuEnCours || etatJeu.joueurs.length < 2) return alert("Pas assez de joueurs pour échanger !");

    document.getElementById('echange-donne-argent').value = 0;
    document.getElementById('echange-donne-cartes').value = 0;
    document.getElementById('echange-demande-argent').value = 0;
    document.getElementById('echange-demande-cartes').value = 0;
    
    const select = document.getElementById('echange-cible');
    select.innerHTML = '';
    etatJeu.joueurs.forEach(j => {
        if (j.id !== monId) {
            let opt = document.createElement('option');
            opt.value = j.id;
            opt.innerText = j.pseudo;
            select.appendChild(opt);
        }
    });
    
    majInterfaceEchange();
    document.getElementById('modal-creation-echange').classList.remove('hidden');
}

function majInterfaceEchange() {
    const targetId = document.getElementById('echange-cible').value;
    const moi = etatJeu.joueurs.find(j => j.id === monId);
    const cible = etatJeu.joueurs.find(j => j.id === targetId);
    
    document.getElementById('echange-donne-argent').removeAttribute('max');
    document.getElementById('echange-demande-argent').removeAttribute('max');
    
    document.getElementById('echange-donne-cartes').max = moi.carteSortiePrison || 0;
    document.getElementById('echange-demande-cartes').max = cible.carteSortiePrison || 0;

    const divMoi = document.getElementById('echange-donne-terrains');
    const divLui = document.getElementById('echange-demande-terrains');
    divMoi.innerHTML = ''; divLui.innerHTML = '';

    for (let idCase in etatJeu.proprietes) {
        let prop = etatJeu.proprietes[idCase];
        
        let nomPropre = INFOS_TERRAINS[idCase].nom.replace(/<br\s*[\/]?>|\n/gi, ' ').replace(/\s+/g, ' ').trim();
        
        if (prop.proprietaire === monId) {
            divMoi.innerHTML += `<label style="display: flex; align-items: center; margin-bottom: 6px;"><input type="checkbox" class="chk-donne-terrain" value="${idCase}" style="margin-right: 8px;"> <span>${nomPropre}</span></label>`;
        } else if (prop.proprietaire === targetId) {
            divLui.innerHTML += `<label style="display: flex; align-items: center; margin-bottom: 6px;"><input type="checkbox" class="chk-demande-terrain" value="${idCase}" style="margin-right: 8px;"> <span>${nomPropre}</span></label>`;
        }
    }
}

function actionEnvoyerEchange() {
    const targetId = document.getElementById('echange-cible').value;
    
    const offreArgent = parseInt(document.getElementById('echange-donne-argent').value) || 0;
    const offreCartes = parseInt(document.getElementById('echange-donne-cartes').value) || 0;
    const demandeArgent = parseInt(document.getElementById('echange-demande-argent').value) || 0;
    const demandeCartes = parseInt(document.getElementById('echange-demande-cartes').value) || 0;
    
    const offreTerrains = Array.from(document.querySelectorAll('.chk-donne-terrain:checked')).map(cb => parseInt(cb.value));
    const demandeTerrains = Array.from(document.querySelectorAll('.chk-demande-terrain:checked')).map(cb => parseInt(cb.value));

    const moi = etatJeu.joueurs.find(j => j.id === monId);
    const cible = etatJeu.joueurs.find(j => j.id === targetId);
    
    const perteMoi = offreArgent - demandeArgent;
    const perteCible = demandeArgent - offreArgent;

    if (perteMoi > 0 && perteMoi > Math.max(0, moi.argent)) {
        return alert("❌ Vous n'avez pas assez d'argent disponible pour combler la différence !");
    }
    if (perteCible > 0 && perteCible > Math.max(0, cible.argent)) {
        return alert(`❌ ${cible.pseudo} n'a pas assez d'argent pour payer la différence !`);
    }

    const totalOffre = offreArgent + offreCartes + offreTerrains.length;
    const totalDemande = demandeArgent + demandeCartes + demandeTerrains.length;

    if (totalOffre === 0 || totalDemande === 0) {
        return alert("❌ Échange invalide : Chaque joueur doit proposer au moins 1 élément (argent, carte ou terrain) !");
    }

    if (totalOffre === 0 || totalDemande === 0) {
        return alert("❌ Échange invalide : Chaque joueur doit proposer au moins 1 élément (argent, carte ou terrain) !");
    }

    const donneesEchange = {
        type: 'PROPOSER_ECHANGE',
        initiateur: monId,
        cible: targetId,
        offre: { argent: offreArgent, cartes: offreCartes, terrains: offreTerrains },
        demande: { argent: demandeArgent, cartes: demandeCartes, terrains: demandeTerrains }
    };

    envoyerAuServeur(donneesEchange);
    document.getElementById('modal-creation-echange').classList.add('hidden');
}

let offreEnCoursDeConsultation = null;
let indexOffreEnCours = -1;

function majBoutonOffres() {
    const btn = document.getElementById('btn-voir-offres');
    const badge = document.getElementById('badge-nb-offres');
    const nbOffres = listeOffresRecues.length;

    if (nbOffres > 0) {
        btn.classList.remove('hidden');
        badge.innerText = nbOffres;
        btn.classList.add('bounce');
        setTimeout(() => { btn.classList.remove('bounce'); }, 1000);
    } else {
        btn.classList.add('hidden');
    }
}

function ouvrirModalListeOffres() {
    if (listeOffresRecues.length === 0) return;

    const conteneur = document.getElementById('conteneur-liste-offres');
    conteneur.innerHTML = '';

    listeOffresRecues.forEach((offreData, index) => {
        const initiateur = etatJeu.joueurs.find(j => j.id === offreData.initiateur);
        const divOffre = document.createElement('div');
        divOffre.style.background = 'rgba(255, 255, 255, 0.1)';
        divOffre.style.padding = '10px';
        divOffre.style.borderRadius = '5px';
        divOffre.style.display = 'flex';
        divOffre.style.justifyContent = 'space-between';
        divOffre.style.alignItems = 'center';

        divOffre.innerHTML = `
            <span style="color: white;">Offre de <strong>${initiateur ? initiateur.pseudo : 'Joueur inconnu'}</strong></span>
            <button onclick="afficherDetailsOffre(${index})" style="background-color: #4da6ff; padding: 5px 10px; font-size: 12px;">Voir détails</button>
        `;
        conteneur.appendChild(divOffre);
    });

    document.getElementById('modal-liste-offres').classList.remove('hidden');
}

function fermerModalListeOffres() {
    document.getElementById('modal-liste-offres').classList.add('hidden');
}

function afficherDetailsOffre(index) {
    indexOffreEnCours = index;
    offreEnCoursDeConsultation = listeOffresRecues[index];
    const data = offreEnCoursDeConsultation;
    const initiateur = etatJeu.joueurs.find(j => j.id === data.initiateur);
    
    let texteOffre = `<strong>${initiateur ? initiateur.pseudo : 'Joueur inconnu'} vous propose :</strong><br>`;
    if (data.offre.argent > 0) texteOffre += `💰 ${data.offre.argent} €<br>`;
    if (data.offre.cartes > 0) texteOffre += `🃏 ${data.offre.cartes} Carte(s) Prison<br>`;
    data.offre.terrains.forEach(id => {
        const terrain = INFOS_TERRAINS[id];
        if(terrain) {
            let nomPropre = terrain.nom.replace(/<br\s*[\/]?>/gi, ' ');
            texteOffre += `🏠 ${nomPropre}<br>`;
        }
    });

    texteOffre += `<br><strong style="color:#ff4d4d;">En échange de vos :</strong><br>`;
    if (data.demande.argent > 0) texteOffre += `💰 ${data.demande.argent} €<br>`;
    if (data.demande.cartes > 0) texteOffre += `🃏 ${data.demande.cartes} Carte(s) Prison<br>`;
    data.demande.terrains.forEach(id => {
        const terrain = INFOS_TERRAINS[id];
        if(terrain) {
            let nomPropre = terrain.nom.replace(/<br\s*[\/]?>/gi, ' ');
            texteOffre += `🏠 ${nomPropre}<br>`;
        }
    });

    document.getElementById('texte-reponse-echange').innerHTML = texteOffre;
    
    fermerModalListeOffres();
    document.getElementById('modal-reponse-echange').classList.remove('hidden');
}

function actionRepondreEchange(accepte) {
    document.getElementById('modal-reponse-echange').classList.add('hidden');
    
    if (offreEnCoursDeConsultation && indexOffreEnCours !== -1) {
        envoyerAuServeur({
            type: 'REPONSE_ECHANGE',
            initiateur: offreEnCoursDeConsultation.initiateur,
            offre: offreEnCoursDeConsultation.offre,
            demande: offreEnCoursDeConsultation.demande,
            accepte: accepte
        });

        listeOffresRecues.splice(indexOffreEnCours, 1);
        
        majBoutonOffres();
        if (listeOffresRecues.length > 0) {
            ouvrirModalListeOffres();
        }

        offreEnCoursDeConsultation = null;
        indexOffreEnCours = -1;
    }
}

let animationDesEnCours = false;

function lancerDesAnime() {
    if (animationDesEnCours) return;
    animationDesEnCours = true;
    document.getElementById('btn-lancer-des').disabled = true;
    
    const zoneAnim = document.getElementById('zone-anim-des');
    const de1 = document.getElementById('de-1');
    const de2 = document.getElementById('de-2');
    
    const resD1 = Math.floor(Math.random() * 6) + 1;
    const resD2 = Math.floor(Math.random() * 6) + 1;

    zoneAnim.classList.remove('hidden');
    de1.className = 'de rolling';
    de2.className = 'de rolling';

    setTimeout(() => {
        de1.className = 'de show-' + resD1;
        de2.className = 'de show-' + resD2;
        
        setTimeout(() => {
            animationDesEnCours = false;
            envoyerAuServeur({ type: 'TRAITER_LANCER_DES', d1: resD1, d2: resD2 });
        }, 500);

    }, 750);
}

let caseAchatEnCours = null;

function afficherModalAchat(idCase, terrain) {
    caseAchatEnCours = idCase;
    document.getElementById('nom-terrain-achat').innerText = terrain.nom;
    document.getElementById('prix-terrain-achat').innerText = terrain.prix + " €";
    document.getElementById('modal-achat').classList.remove('hidden');
}

function repondreAchatTerrain(accepte) {
    if (!propositionAchatEnCours) return;
    
    envoyerAuServeur({
        type: 'REPONSE_ACHAT',
        idCase: propositionAchatEnCours.idCase,
        achat: accepte
    });
    
    propositionAchatEnCours = null; 
}

function actionAbandonner() {
    if (window.confirm("⚠️ ATTENTION ⚠️\n\nÊtes-vous sûr de vouloir abandonner ?\n\nTous vos terrains retourneront à la banque et vous deviendrez un simple spectateur.")) {
        envoyerAuServeur({ type: 'ABANDONNER' });
    }
}

function gererDeconnexion(idJoueurQuittant) {
    if (!estHote) return;

    const indexJoueur = etatJeu.joueurs.findIndex(j => j.id === idJoueurQuittant);
    if (indexJoueur === -1) return;

    const joueur = etatJeu.joueurs[indexJoueur];
    
    const cEtaitSonTour = (indexJoueur === etatJeu.tourActuel);

    etatJeu.log.push(`🚪 ${joueur.pseudo} s'est déconnecté et quitte la partie !`);

    for (let idCase in etatJeu.proprietes) {
        if (etatJeu.proprietes[idCase].proprietaire === idJoueurQuittant) {
            delete etatJeu.proprietes[idCase]; 
        }
    }

    const idDuPion = 'pion-' + joueur.couleur;
    const pionHTML = document.getElementById(idDuPion);
    if (pionHTML) {
        pionHTML.remove();
    }

    etatJeu.joueurs.splice(indexJoueur, 1);

    if (etatJeu.tourActuel >= etatJeu.joueurs.length) {
        etatJeu.tourActuel = 0;
    } else if (indexJoueur < etatJeu.tourActuel) {
        etatJeu.tourActuel--;
    }

    if (etatJeu.attenteAchat && cEtaitSonTour) {
        etatJeu.attenteAchat = false;
        propositionAchatEnCours = null;
    }
    
    if (etatJeu.attenteRemboursement && !etatJeu.joueurs.some(j => j.argent < 0)) {
        etatJeu.attenteRemboursement = false;
    }

    connexionsClients = connexionsClients.filter(c => c.peer !== idJoueurQuittant);

    if (etatJeu.joueurs.length === 1 && jeuEnCours) {
        etatJeu.log.push(`🏆 TOUT LE MONDE A FUI ! ${etatJeu.joueurs[0].pseudo} gagne la partie !`);
    }

    diffuserEtat();
}

genererPlateau();