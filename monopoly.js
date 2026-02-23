const peer = new Peer(); 
let monId = null;
let maConnexionHost = null; 
let connexionsClients = []; 

let monPseudo = "";
let estHote = false;
let jeuEnCours = false;


let etatJeu = {
    joueurs: [], 
    tourActuel: 0, 
    log: [],
    proprietes: {}, 
    cagnotteDettes: 0
};

// --- TES TERRAINS PERSONNALISÉS ---
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

// --- BASE DE DONNÉES DES CARTES SURPRISES ---
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

// ---------------------------------------------------------
// 1. INITIALISATION ET CONNEXION
// ---------------------------------------------------------

peer.on('open', (id) => {
    monId = id;
    if (estHote) document.getElementById('affichage-id').innerText = monId;
});

peer.on('connection', (conn) => {
    if (!estHote) return; 

    conn.on('open', () => {
        if (etatJeu.joueurs.length >= 5) {
            conn.send({ type: 'ERREUR', message: 'Désolé, la partie est complète (5 joueurs max).' });
            setTimeout(() => conn.close(), 500); 
            return;
        }
        connexionsClients.push(conn);
        conn.on('data', (data) => traiterMessageRecu(data, conn));
    });
});

function creerPartie() {
    monPseudo = document.getElementById('mon-pseudo').value || "Hôte";
    estHote = true;
    
    etatJeu.joueurs.push({ id: monId, pseudo: monPseudo, position: 0, couleur: 0, argent: 1500 });
    
    passerAuLobby();
    document.getElementById('affichage-id').innerText = monId || "Génération en cours...";
    document.getElementById('btn-lancer-partie').classList.remove('hidden');
    document.getElementById('message-attente').classList.add('hidden');
    
    // NOUVEAU : On affiche le bouton copier uniquement pour l'hôte !
    const btnCopier = document.getElementById('btn-copier');
    if (btnCopier) btnCopier.classList.remove('hidden');
    
    mettreAJourLobby();
}

function rejoindrePartie() {
    monPseudo = document.getElementById('mon-pseudo').value || "Invité";
    const idHote = document.getElementById('id-hote-input').value;
    if (!idHote) return alert("Il faut l'ID de l'hôte !");

    maConnexionHost = peer.connect(idHote);
    maConnexionHost.on('open', () => {
        envoyerAuServeur({ type: 'REJOINDRE', pseudo: monPseudo });
    });
    maConnexionHost.on('data', (data) => traiterMessageRecu(data));
}

// ---------------------------------------------------------
// 2. GESTION DES MESSAGES
// ---------------------------------------------------------

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
            alert(data.message);
            if (maConnexionHost) maConnexionHost.close();
        }
        // --- NOUVEAU : Réception de l'offre d'achat ---
        else if (data.type === 'PROPOSER_ACHAT') {
            afficherModalAchat(data.idCase, data.terrain);
        }
    }
}

// ==========================================
// CALCULATEUR DE LOYERS INTELLIGENT
// ==========================================
function calculerLoyer(idCase, idProprio, scoreDes) {
    const terrain = INFOS_TERRAINS[idCase];
    const propriete = etatJeu.proprietes[idCase];
    const famille = terrain.famille;
    
    // On compte combien de terrains de cette famille le propriétaire possède, 
    // et combien de terrains composent cette famille au total.
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

    // Règle Famille 9 : Les "Mobiles" (ex: Gares)
    if (famille === 9) { 
        return terrain.loyers[terrainsPossedes - 1];
    } 
    // Règle Famille 10 : TotalEnergies / The Financier (Compagnies)
    else if (famille === 10) { 
        if (terrainsPossedes === 1) return scoreDes * 4;
        if (terrainsPossedes === 2) return scoreDes * 10;
    } 
    // Règle Classique : Familles 1 à 8
    else { 
        if (propriete.maisons > 0) {
            return terrain.loyers[propriete.maisons]; 
        } else {
            // Si le terrain est nu mais que la famille est complète : Loyer doublé !
            if (terrainsPossedes === tailleFamille) {
                return terrain.loyers[0] * 2; 
            } else {
                return terrain.loyers[0]; // Loyer nu standard
            }
        }
    }
    return 0;
}

function traiterLogiqueJeu(data, idJoueur, connExpediteur) {
    if (data.type === 'REJOINDRE') {
        etatJeu.joueurs.push({ id: idJoueur, pseudo: data.pseudo, position: 0, couleur: etatJeu.joueurs.length, argent: 1500 });
        diffuserEtat();
    }
    else if (data.type === 'LANCER_PARTIE') {
        jeuEnCours = true;
        etatJeu.tourActuel = 0; 
        diffuserEtat();
    }
    else if (data.type === 'LANCER_DES') {
        const indexJoueur = etatJeu.joueurs.findIndex(j => j.id === idJoueur);
        if (indexJoueur !== etatJeu.tourActuel) return; 

        const anciennePosition = etatJeu.joueurs[indexJoueur].position;
        const score = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
        const nouvellePosition = (anciennePosition + score) % 40;
        
        etatJeu.joueurs[indexJoueur].position = nouvellePosition;
        
        // --- GESTION DE LA CASE DÉPART (Déplacement aux dés) ---
        if (anciennePosition + score === 40) {
            etatJeu.joueurs[indexJoueur].argent += 400;
            etatJeu.log.push(`🎯 BINGO ! ${etatJeu.joueurs[indexJoueur].pseudo} tombe PILE sur le Départ et gagne 400 € !`);
        } else if (anciennePosition + score > 40) {
            etatJeu.joueurs[indexJoueur].argent += 200;
            etatJeu.log.push(`🏁 ${etatJeu.joueurs[indexJoueur].pseudo} passe le Départ et reçoit 200 €.`);
        }

        // On confie la suite à notre fonction intelligente
        const tourTermine = traiterArriveeCase(indexJoueur, idJoueur, nouvellePosition, score);

        if (tourTermine) {
            // On vérifie tous les joueurs, pas seulement le joueur actuel !
            if (etatJeu.joueurs.some(j => j.argent < 0)) {
                etatJeu.attenteRemboursement = true;
            } else {
                etatJeu.tourActuel = (etatJeu.tourActuel + 1) % etatJeu.joueurs.length;
            }
            diffuserEtat();
        }
    }
    else if (data.type === 'REPONSE_ACHAT') {
        const indexJoueur = etatJeu.joueurs.findIndex(j => j.id === idJoueur);
        const terrain = INFOS_TERRAINS[data.idCase];

        if (data.achat && etatJeu.joueurs[indexJoueur].argent >= terrain.prix) {
            etatJeu.joueurs[indexJoueur].argent -= terrain.prix; 
            etatJeu.proprietes[data.idCase] = { proprietaire: idJoueur, maisons: 0 }; 
            etatJeu.log.push(`${etatJeu.joueurs[indexJoueur].pseudo} a acheté ${terrain.nom} pour ${terrain.prix} €.`);
        } 

        etatJeu.tourActuel = (etatJeu.tourActuel + 1) % etatJeu.joueurs.length;
        diffuserEtat();
    }
    else if (data.type === 'ACTION_PRISON') {
        const j = etatJeu.joueurs[etatJeu.tourActuel];
        
        if (data.action === 'payer') {
            if (j.argent >= 50) {
                j.argent -= 50;
                etatJeu.cagnotteDettes = (etatJeu.cagnotteDettes || 0) + 50;
                j.enPrison = false;
                j.toursEnPrison = 0;
                etatJeu.log.push(`🔓 ${j.pseudo} paie 50 € (qui vont aux Dettes de Benoit) et sort de prison !`);
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
            
            if (d1 === d2) { // DOUBLE REUSSI
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
            } else { // RATE
                j.toursEnPrison++;
                etatJeu.log.push(`🎲 ${j.pseudo} a fait ${d1} et ${d2}. Pas de double, il reste en prison (${j.toursEnPrison}/3).`);
                
                if (j.toursEnPrison >= 3) {
                    j.enPrison = false; // Relâché
                    j.toursEnPrison = 0;
                    etatJeu.log.push(`⏳ 3 tours écoulés ! ${j.pseudo} est relâché en Simple Visite.`);
                }
                // Dans les 2 cas (raté ou relâché), son tour est terminé
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
            if (propriete.maisons > 0) {
                const gain = Math.floor(getPrixMaison(terrain.famille) / 2);
                joueur.argent += gain;
                propriete.maisons--;
                let typeBatiment = propriete.maisons === 4 ? "un hôtel 🏨" : "une maison 🏠";
                etatJeu.log.push(`🔨 ${joueur.pseudo} a vendu ${typeBatiment} sur ${terrain.nom} pour ${gain} €.`);
            } else {
                const gain = Math.floor(terrain.prix / 2);
                joueur.argent += gain;
                delete etatJeu.proprietes[data.idCase]; // Le terrain redevient libre !
                etatJeu.log.push(`📜 ${joueur.pseudo} a revendu ${terrain.nom} à la banque pour ${gain} €.`);
            }

            // Si le joueur était bloqué pour dette et qu'il repasse dans le vert : le tour est débloqué !
            if (etatJeu.attenteRemboursement && !etatJeu.joueurs.some(j => j.argent < 0)) {
                etatJeu.attenteRemboursement = false;
                etatJeu.tourActuel = (etatJeu.tourActuel + 1) % etatJeu.joueurs.length;
                etatJeu.log.push(`✅ Toutes les dettes ont été épongées ! Le tour passe.`);
            }
            diffuserEtat();
        }
    }
}

function diffuserEtat() {
    const message = { type: 'MISE_A_JOUR', etat: etatJeu, jeuDemarre: jeuEnCours };
    connexionsClients.forEach(c => c.send(message));
    appliquerEtatJeu();
}

// ---------------------------------------------------------
// 3. INTERFACE GRAPHIQUE ET PLATEAU
// ---------------------------------------------------------

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

    // On cherche si N'IMPORTE QUEL joueur dans la partie est dans le rouge
    const joueurEndette = etatJeu.joueurs.find(j => j.argent < 0);

    if (joueurEndette) {
        btnDisabled = true; // On bloque tout le monde !
        if (joueurEndette.id === monId) {
            btnText = "Remboursez vos dettes !";
        } else {
            btnText = `Attente de ${joueurEndette.pseudo}...`;
        }
    } else if (cEstAmoi) {
        if (joueurActuel.enPrison) {
            btnText = "Enfermé...";
            btnDisabled = true;
        } else {
            btnText = "À TOI DE JOUER !";
            btnDisabled = false;
        }
    }

    document.getElementById('btn-lancer-des').disabled = btnDisabled;
    document.getElementById('btn-lancer-des').innerText = btnText;

    if (cEstAmoi && joueurActuel.enPrison) {
        afficherModalPrison(joueurActuel);
    } else {
        const mod = document.getElementById('modal-prison');
        if(mod) mod.classList.add('hidden');
    }

    // --- MISE À JOUR DU TABLEAU DES SCORES ---
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

    // --- NOUVEAU : MISE À JOUR DES COULEURS DES TERRAINS ACHETÉS ---
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
                
                // AFFICHAGE DES MAISONS/HÔTELS
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
            const montant = etatJeu.cagnotteDettes || 0;
            if (montant > 0) {
                // S'il y a de l'argent, on l'affiche en bleu clair bien visible
                divNom.innerHTML = `Dettes de Benoit<br><span style="color: #4da6ff; font-size: clamp(8px, 1.5vmin, 14px); font-weight: bold;">💰 ${montant} €</span>`;
            } else {
                // Si c'est vide, on l'affiche en tout petit et gris
                divNom.innerHTML = `Dettes de Benoit<br><span style="color: #777; font-size: clamp(6px, 1.2vmin, 10px);">0 €</span>`;
            }
        }
    }

    // --- Mise à jour des pions ---
    etatJeu.joueurs.forEach((j, index) => {
        let pion = document.getElementById('pion-' + index);
        if (!pion) {
            pion = document.createElement('div');
            pion.id = 'pion-' + index;
            pion.className = `pion pion-${index}`;
            pion.title = j.pseudo;
            document.body.appendChild(pion); 
        }
        
        // DISTINCTION VISUELLE : Prison ou Visite ?
        if (j.enPrison) {
            const zonePrisonDiv = document.getElementById('pions-prison');
            if (zonePrisonDiv) zonePrisonDiv.appendChild(pion);
        } else {
            const zonePionsDiv = document.getElementById('zone-pions-' + j.position);
            if (zonePionsDiv) zonePionsDiv.appendChild(pion);
        }
    });

    const listeHistorique = document.getElementById('liste-historique');
    if (listeHistorique && etatJeu.log.length > 0) {
        listeHistorique.innerHTML = ''; // On vide la liste
        
        // NOUVEAU : On fait une copie du log [...etatJeu.log] et on l'inverse (.reverse())
        [...etatJeu.log].reverse().forEach(msg => {
            let li = document.createElement('li');
            li.innerText = msg;
            listeHistorique.appendChild(li); // Les plus récents s'ajoutent donc en premier !
        });

        // On s'assure que la barre de défilement reste tout en haut
        const conteneurHistorique = document.getElementById('historique');
        conteneurHistorique.scrollTop = 0;
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

    // --- NOUVEAU : Message d'attente personnalisé pour les invités ---
    // Si je ne suis pas l'hôte, et qu'il y a au moins 1 joueur (l'hôte est toujours le 1er, à l'index 0)
    if (!estHote && etatJeu.joueurs.length > 0) {
        const hote = etatJeu.joueurs[0]; 
        const msgAttente = document.getElementById('message-attente');
        if (msgAttente) {
            msgAttente.innerText = `En attente de ${hote.pseudo}...`;
            msgAttente.style.fontStyle = "italic";
            msgAttente.style.color = "#aaa";
        }
    }
}

function passerAuLobby() {
    document.getElementById('ecran-login').classList.add('hidden');
    document.getElementById('ecran-lobby').classList.remove('hidden');
}

function demarrerLaPartie() { envoyerAuServeur({ type: 'LANCER_PARTIE' }); }
function actionLancerDes() { envoyerAuServeur({ type: 'LANCER_DES' }); }
// Remplace ton ancienne fonction getCouleur par ces deux là :

function getCouleur(index) { 
    // Les couleurs exactes de tes pions (Rouge, Bleu, Vert, Orange, Violet, Blanc)
    const c = ['#ff4d4d', '#4da6ff', '#33cc33', '#ff9900', '#9933cc', '#ffffff']; 
    return c[index % c.length]; 
}

function getCouleurFond(index) { 
    // Les mêmes couleurs, mais avec 25% d'opacité (pour colorer la case sans cacher le texte)
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

// --- NOUVELLE GÉNÉRATION DU PLATEAU AVEC IMAGES ---

// Objet pour associer les cases à leurs images.
// Modifiez les noms de fichiers selon vos besoins.
// Les cases sans image resteront vides.
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
    
    // On met de côté le centre du plateau avant de vider les cases
    const centrePlateau = document.querySelector('.centre-plateau');
    plateau.innerHTML = ''; 
    if (centrePlateau) plateau.appendChild(centrePlateau);

    for (let i = 0; i < 40; i++) {
        let caseDiv = document.createElement('div');
        caseDiv.className = 'case';
        caseDiv.id = 'case-' + i;
        caseDiv.setAttribute('onclick', `clicSurCase(${i})`);
        
        // =========================================================
        // EXCEPTION : DESIGN DE LA CASE PRISON (Case 10)
        // =========================================================
        if (i === 10) {
            caseDiv.classList.add('case-prison');

            // 1. Le carré intérieur (la prison)
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

            // 2. Le couloir extérieur (la visite)
            let zoneVisite = document.createElement('div');
            zoneVisite.className = 'zone-visite';
            
            let texteVisite = document.createElement('div');
            texteVisite.className = 'visite-texte';
            texteVisite.innerText = "Visite";

            // 3. La zone pour les pions
            let zonePions = document.createElement('div');
            zonePions.className = 'zone-pions';
            zonePions.id = 'zone-pions-' + i;

            // On assemble la case 10
            zoneVisite.appendChild(texteVisite);
            zoneVisite.appendChild(zonePions);
            caseDiv.appendChild(zonePrison);
            caseDiv.appendChild(zoneVisite);
        } 
        // =========================================================
        // DESIGN STANDARD POUR LES 39 AUTRES CASES
        // =========================================================
        else {
            if (imagesTerrains[i]) {
                let img = document.createElement('img');
                img.src = imagesTerrains[i]; 
                img.alt = nomsTerrains[i]; 
                
                // --- LA CORRECTION EST ICI : on a remis le système de direction ! ---
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
            
            // --- NOUVEAU : Affichage du prix si le terrain est achetable ! ---
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
        
        // =========================================================
        // PLACEMENT SUR LA GRILLE (Commun à toutes les cases)
        // =========================================================
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

// ==========================================
// MOTEUR D'ACTIONS (ARRIVÉE SUR CASE & PAIEMENTS)
// ==========================================

function traiterArriveeCase(indexJoueur, idJoueur, position, scoreDes) {
    const terrain = INFOS_TERRAINS[position];
    const propriete = etatJeu.proprietes[position];
    const joueur = etatJeu.joueurs[indexJoueur];

    // 1. TERRAIN ACHETABLE
    if (terrain) {
        if (!propriete) {
            diffuserEtat(); 
            if (idJoueur === monId) afficherModalAchat(position, terrain);
            else {
                const conn = connexionsClients.find(c => c.peer === idJoueur);
                if (conn) conn.send({ type: 'PROPOSER_ACHAT', idCase: position, terrain: terrain });
            }
            return false; 
        } 
        else if (propriete.proprietaire !== idJoueur) {
            const indexProprio = etatJeu.joueurs.findIndex(j => j.id === propriete.proprietaire);
            const loyer = calculerLoyer(position, propriete.proprietaire, scoreDes);
            gererPaiementJoueur(indexJoueur, indexProprio, loyer, `de loyer pour ${terrain.nom}`);
        }
    } 
    // 2. CASE SURPRISE
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
                
                // --- GESTION DE LA CASE DÉPART (Déplacement par carte) ---
                // Si l'index de destination est plus petit que l'actuel, le joueur a fait le tour
                // ATTENTION : On exclut la case 10 (Prison) car on ne touche pas 200€ en allant en prison !
                if (carte.destination < anciennePosition && carte.destination !== 10) {
                    if (carte.destination === 0) {
                        joueur.argent += 400;
                        etatJeu.log.push(`🎯 BINGO ! ${joueur.pseudo} tombe PILE sur le Départ avec sa carte et gagne 400 € !`);
                    } else {
                        joueur.argent += 200;
                        etatJeu.log.push(`🏁 ${joueur.pseudo} passe le Départ avec sa carte et reçoit 200 €.`);
                    }
                }
            }
            else {
                joueur.position = (anciennePosition + carte.cases + 40) % 40; 
                // Note: La carte "Reculez de 3 cases" ne donne jamais de 200€.
            }
            
            if (joueur.position === 10) {
                etatJeu.log.push(`👮 ${joueur.pseudo} va directement en prison sans passer par la case départ !`);
                joueur.enPrison = true;
                joueur.toursEnPrison = 0;
                return true; 
            }
            
            // On relance la fonction pour appliquer l'effet de la case d'arrivée !
            return traiterArriveeCase(indexJoueur, idJoueur, joueur.position, scoreDes);
        }
    }
    else if (position === 20) {
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
    joueur.argent -= montant;
    etatJeu.cagnotteDettes = (etatJeu.cagnotteDettes || 0) + montant;
    
    if (joueur.argent < 0) {
        etatJeu.log.push(`⚠️ ALERTE : ${joueur.pseudo} est dans le rouge (${joueur.argent} €) !`);
    }
}

function gererPaiementJoueur(indexPayeur, indexReceveur, montant, motif) {
    let payeur = etatJeu.joueurs[indexPayeur];
    let receveur = etatJeu.joueurs[indexReceveur];
    
    payeur.argent -= montant;
    receveur.argent += montant;
    etatJeu.log.push(`${payeur.pseudo} paie ${montant} € à ${receveur.pseudo} ${motif}.`);
    
    if (payeur.argent < 0) {
        etatJeu.log.push(`⚠️ ALERTE : ${payeur.pseudo} est dans le rouge (${payeur.argent} €) !`);
    }
}

// ==========================================
// FONCTION POUR COPIER L'ID
// ==========================================
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

// ==========================================
// SYSTÈME DE CONSTRUCTION (MAISONS/HÔTELS)
// ==========================================
let caseConstructionEnCours = null;

function getPrixMaison(famille) {
    if (famille <= 2) return 50;
    if (famille <= 4) return 100;
    if (famille <= 6) return 150;
    if (famille <= 8) return 200;
    return 0; // Pas de maisons sur les gares/compagnies
}

function clicSurCase(idCase) {
    const terrain = INFOS_TERRAINS[idCase];
    if (!terrain) return; // Si on clique sur une case non achetable, on ne fait rien.

    // 1. Remplissage des infos communes
    document.getElementById('info-nom-terrain').innerText = terrain.nom;
    document.getElementById('info-prix-achat').innerText = terrain.prix + " €";
    
    const blocMaison = document.getElementById('bloc-prix-maison');
    const blocHotel = document.getElementById('bloc-prix-hotel');
    const loyersStandard = document.getElementById('info-loyers-standard');
    const loyersSpeciaux = document.getElementById('info-loyers-speciaux');

    // 2. Gestion de l'affichage selon le type de terrain
    if (terrain.famille <= 8) {
        // Terrains classiques avec maisons
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
        // Gares (9) et Compagnies (10) : Pas de maisons !
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

    // 3. Gestion de l'apparition du bouton "Construire"
    const btnConstruire = document.getElementById('btn-construire');
    btnConstruire.style.display = 'none'; // Caché par défaut

    const indexJoueur = etatJeu.joueurs.findIndex(j => j.id === monId);
    const propriete = etatJeu.proprietes[idCase];

    // Si c'est à moi de jouer, que je possède le terrain, et qu'il accepte les maisons (famille <= 8)
    if (jeuEnCours && indexJoueur === etatJeu.tourActuel && propriete && propriete.proprietaire === monId && terrain.famille <= 8) {
        
        // Vérification de la famille complète
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

        // Si j'ai la famille et que ce n'est pas déjà un hôtel (5)
        if (possedeTouteFamille && propriete.maisons < 5) {
            
            // Vérification de la règle d'uniformité
            let peutConstruireUniformement = true;
            for (let prop of terrainsFamille) {
                if (prop && prop.maisons < propriete.maisons) {
                    peutConstruireUniformement = false;
                }
            }
            
            if (peutConstruireUniformement) {
                btnConstruire.style.display = 'inline-block'; // On affiche le bouton !
            }
        }
    }

    const btnVendre = document.getElementById('btn-vendre');
    btnVendre.style.display = 'none';

    if (propriete && propriete.proprietaire === monId) {
        btnVendre.style.display = 'inline-block';
        btnVendre.disabled = false; // Réinitialisation par défaut

        if (propriete.maisons > 0) {
            // Règle d'uniformité inversée : on ne peut vendre une maison que si aucune autre n'en a plus !
            let peutVendreUniformement = true;
            for (const key in INFOS_TERRAINS) {
                if (INFOS_TERRAINS[key].famille === terrain.famille && etatJeu.proprietes[key]) {
                    if (etatJeu.proprietes[key].maisons > propriete.maisons) peutVendreUniformement = false;
                }
            }

            if (peutVendreUniformement) {
                const gain = Math.floor(getPrixMaison(terrain.famille) / 2);
                btnVendre.innerText = `Vendre 1 Bâtiment (+${gain} €)`;
            } else {
                btnVendre.innerText = `Vente Bâtiment impossible (Uniformité)`;
                btnVendre.disabled = true;
            }
        } else {
            // Vente du terrain nu : seulement si AUCUN terrain de la famille n'a de maisons
            let aDesMaisonsDansFamille = false;
            for (const key in INFOS_TERRAINS) {
                if (INFOS_TERRAINS[key].famille === terrain.famille && etatJeu.proprietes[key] && etatJeu.proprietes[key].maisons > 0) {
                    aDesMaisonsDansFamille = true;
                }
            }

            if (aDesMaisonsDansFamille) {
                btnVendre.innerText = `Vendez les maisons d'abord`;
                btnVendre.disabled = true;
            } else {
                const gain = Math.floor(terrain.prix / 2);
                btnVendre.innerText = `Revendre Terrain (+${gain} €)`;
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
    envoyerAuServeur({ type: 'VENDRE', idCase: caseConstructionEnCours });
    fermerModalInfos();
}

// ==========================================
// FONCTIONS POUR L'ACHAT DE TERRAINS
// ==========================================
let caseAchatEnCours = null; // Mémoire locale du client

function afficherModalAchat(idCase, terrain) {
    caseAchatEnCours = idCase;
    document.getElementById('nom-terrain-achat').innerText = terrain.nom;
    document.getElementById('prix-terrain-achat').innerText = terrain.prix + " €";
    document.getElementById('modal-achat').classList.remove('hidden');
}

function actionAcheterTerrain() {
    document.getElementById('modal-achat').classList.add('hidden');
    envoyerAuServeur({ type: 'REPONSE_ACHAT', idCase: caseAchatEnCours, achat: true });
}

function actionPasserTerrain() {
    document.getElementById('modal-achat').classList.add('hidden');
    envoyerAuServeur({ type: 'REPONSE_ACHAT', idCase: caseAchatEnCours, achat: false });
}

genererPlateau();