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
    proprietes: {}
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
    
    // CORRECTION : On ajoute bien "argent: 1500" pour l'hôte ici !
    etatJeu.joueurs.push({ id: monId, pseudo: monPseudo, position: 0, couleur: 0, argent: 1500 });
    
    passerAuLobby();
    document.getElementById('affichage-id').innerText = monId || "Génération en cours...";
    document.getElementById('btn-lancer-partie').classList.remove('hidden');
    document.getElementById('message-attente').classList.add('hidden');
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

function traiterLogiqueJeu(data, idJoueur, connExpediteur) {
    if (data.type === 'REJOINDRE') {
        etatJeu.joueurs.push({
            id: idJoueur,
            pseudo: data.pseudo,
            position: 0,
            couleur: etatJeu.joueurs.length,
            argent: 1500 // <-- NOUVEAU : Le pécule de départ !
        });
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

        // Calcul du score et de la nouvelle position
        const score = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
        const nouvellePosition = (etatJeu.joueurs[indexJoueur].position + score) % 40;
        etatJeu.joueurs[indexJoueur].position = nouvellePosition;
        
        etatJeu.log.push(`${etatJeu.joueurs[indexJoueur].pseudo} a fait ${score}`);

        const terrain = INFOS_TERRAINS[nouvellePosition];

        // Si c'est un terrain achetable et qu'il n'a pas de propriétaire
        if (terrain && !etatJeu.proprietes[nouvellePosition]) {
            diffuserEtat(); // On met à jour l'écran pour que le pion bouge
            
            // On demande au joueur s'il veut acheter
            if (idJoueur === monId) {
                afficherModalAchat(nouvellePosition, terrain);
            } else {
                const conn = connexionsClients.find(c => c.peer === idJoueur);
                if (conn) conn.send({ type: 'PROPOSER_ACHAT', idCase: nouvellePosition, terrain: terrain });
            }
        } else {
            // (Plus tard, on ajoutera ici le paiement du loyer si le terrain appartient à quelqu'un)
            etatJeu.tourActuel = (etatJeu.tourActuel + 1) % etatJeu.joueurs.length;
            diffuserEtat();
        }
    }
    
    // --- NOUVEAU : Quand un joueur a cliqué sur Acheter ou Passer ---
    else if (data.type === 'REPONSE_ACHAT') {
        const indexJoueur = etatJeu.joueurs.findIndex(j => j.id === idJoueur);
        const terrain = INFOS_TERRAINS[data.idCase];

        // S'il a dit oui ET qu'il a assez d'argent
        if (data.achat && etatJeu.joueurs[indexJoueur].argent >= terrain.prix) {
            etatJeu.joueurs[indexJoueur].argent -= terrain.prix; // On lui retire l'argent
            etatJeu.proprietes[data.idCase] = { proprietaire: idJoueur, maisons: 0 }; // On enregistre l'achat !
            etatJeu.log.push(`${etatJeu.joueurs[indexJoueur].pseudo} a acheté ${terrain.nom} !`);
        } else if (data.achat) {
            etatJeu.log.push(`${etatJeu.joueurs[indexJoueur].pseudo} n'a pas assez d'argent pour ${terrain.nom}.`);
        } else {
            etatJeu.log.push(`${etatJeu.joueurs[indexJoueur].pseudo} passe son tour pour ${terrain.nom}.`);
        }

        // L'action est finie, on passe au tour du joueur suivant
        etatJeu.tourActuel = (etatJeu.tourActuel + 1) % etatJeu.joueurs.length;
        diffuserEtat();
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
    document.getElementById('btn-lancer-des').disabled = !cEstAmoi;
    document.getElementById('btn-lancer-des').innerText = cEstAmoi ? "À TOI DE JOUER !" : "Attente...";

    // --- MISE À JOUR DU TABLEAU DES SCORES ---
    const tableauScores = document.getElementById('tableau-scores');
    if (tableauScores) {
        tableauScores.innerHTML = ''; 
        etatJeu.joueurs.forEach(j => {
            const scoreDiv = document.createElement('div');
            scoreDiv.className = 'score-joueur';
            scoreDiv.style.borderLeftColor = getCouleur(j.couleur);
            scoreDiv.innerHTML = `<span>${j.pseudo}</span> <strong>${j.argent} €</strong>`;
            tableauScores.appendChild(scoreDiv);
        });
    }

    // --- NOUVEAU : MISE À JOUR DES COULEURS DES TERRAINS ACHETÉS ---
    for (let i = 0; i < 40; i++) {
        let caseDiv = document.getElementById('case-' + i);
        if (caseDiv && INFOS_TERRAINS[i]) {
            if (etatJeu.proprietes[i]) {
                // Le terrain a un propriétaire ! On cherche qui c'est.
                const proprio = etatJeu.joueurs.find(j => j.id === etatJeu.proprietes[i].proprietaire);
                if (proprio) {
                    // On colore le fond (semi-transparent) et la bordure de la case
                    caseDiv.style.backgroundColor = getCouleurFond(proprio.couleur);
                    caseDiv.style.borderColor = getCouleur(proprio.couleur);
                }
            } else {
                // Terrain libre : on remet les couleurs par défaut du thème sombre
                caseDiv.style.backgroundColor = '#262626';
                caseDiv.style.borderColor = '#444';
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
        const zonePionsDiv = document.getElementById('zone-pions-' + j.position);
        if (zonePionsDiv) zonePionsDiv.appendChild(pion);
    });

    if (etatJeu.log.length > 0) {
        document.getElementById('historique').innerText = etatJeu.log[etatJeu.log.length - 1];
    }
}

function mettreAJourLobby() {
    const liste = document.getElementById('liste-joueurs-lobby');
    liste.innerHTML = "";
    etatJeu.joueurs.forEach(j => {
        const li = document.createElement('li');
        li.innerText = j.pseudo;
        liste.appendChild(li);
    });
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

            // 2. Le couloir extérieur (la visite)
            let zoneVisite = document.createElement('div');
            zoneVisite.className = 'zone-visite';
            
            let texteVisite = document.createElement('div');
            texteVisite.className = 'visite-texte';
            texteVisite.innerText = "Simple visite";

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

// Appelez la fonction pour générer le plateau au chargement
genererPlateau();