const peer = new Peer(); 
let monId = null;
let maConnexionHost = null; // Pour les clients
let connexionsClients = []; // Pour l'hôte (liste des amis)

// État du jeu
let monPseudo = "";
let estHote = false;
let jeuEnCours = false;

// Données partagées (Synchronisées par l'hôte)
let etatJeu = {
    joueurs: [], // { id, pseudo, couleur, position }
    tourActuel: 0, // Index du joueur dont c'est le tour
    log: []
};

// ---------------------------------------------------------
// 1. INITIALISATION ET CONNEXION
// ---------------------------------------------------------
peer.on('open', (id) => {
    monId = id;
    console.log("Mon ID Peer:", id);
});

// -- PARTIE HÔTE --
// Quand un ami se connecte à moi (Hôte)
peer.on('connection', (conn) => {
    if (!estHote) return; // Sécurité

    conn.on('open', () => {
        console.log("Nouvelle connexion : " + conn.peer);
        connexionsClients.push(conn);

        // On écoute ce que dit ce joueur
        conn.on('data', (data) => traiterMessageRecu(data, conn));
    });
});

// -- PARTIE CLIENT --
function creerPartie() {
    monPseudo = document.getElementById('mon-pseudo').value || "Hôte";
    estHote = true;
    
    // Je m'ajoute moi-même à la liste des joueurs
    etatJeu.joueurs.push({ id: monId, pseudo: monPseudo, position: 0, couleur: 0 });
    
    passerAuLobby();
    document.getElementById('affichage-id').innerText = monId;
    document.getElementById('btn-lancer-partie').classList.remove('hidden');
    document.getElementById('message-attente').classList.add('hidden');
    mettreAJourLobby();
}

function rejoindrePartie() {
    monPseudo = document.getElementById('mon-pseudo').value || "Invité";
    const idHote = document.getElementById('id-hote-input').value;
    if (!idHote) return alert("Il faut l'ID de l'hôte !");

    // Connexion vers l'hôte
    maConnexionHost = peer.connect(idHote);
    
    maConnexionHost.on('open', () => {
        console.log("Connecté à l'hôte !");
        passerAuLobby();
        // J'envoie mon pseudo à l'hôte pour qu'il m'enregistre
        envoyerAuServeur({ type: 'REJOINDRE', pseudo: monPseudo });
    });

    maConnexionHost.on('data', (data) => traiterMessageRecu(data));
}

// ---------------------------------------------------------
// 2. GESTION DES MESSAGES (Le Cerveau)
// ---------------------------------------------------------

// Fonction pour envoyer un message (Si client -> Hôte, Si Hôte -> Tous)
function envoyerAuServeur(data) {
    if (estHote) {
        // Si je suis l'hôte, je traite mon propre message directement
        traiterLogiqueJeu(data, monId);
    } else {
        maConnexionHost.send(data);
    }
}

// Réception d'un message (Hôte ou Client)
function traiterMessageRecu(data, connExpediteur) {
    if (estHote) {
        // L'hôte reçoit une demande, la traite, et renvoie le nouvel état à tout le monde
        traiterLogiqueJeu(data, connExpediteur.peer);
    } else {
        // Le client reçoit une mise à jour de l'état du jeu
        if (data.type === 'MISE_A_JOUR') {
            etatJeu = data.etat;
            
            // ---> LA LIGNE MAGIQUE QUI MANQUAIT <---
            jeuEnCours = data.jeuDemarre; 
            
            appliquerEtatJeu();
        }
    }
}

// LOGIQUE CENTRALE (Seul l'hôte exécute ça)
function traiterLogiqueJeu(data, idJoueur) {
    if (data.type === 'REJOINDRE') {
        // Un joueur rejoint
        const nouveauJoueur = {
            id: idJoueur,
            pseudo: data.pseudo,
            position: 0,
            couleur: etatJeu.joueurs.length // 0=Rouge, 1=Bleu, etc.
        };
        etatJeu.joueurs.push(nouveauJoueur);
        diffuserEtat(); // On dit à tout le monde qu'il y a un nouveau
    }
    
    else if (data.type === 'LANCER_PARTIE') {
        jeuEnCours = true;
        etatJeu.tourActuel = 0; // Le premier joueur commence
        diffuserEtat();
    }

    else if (data.type === 'LANCER_DES') {
        // Vérifier si c'est bien le tour de ce joueur
        const indexJoueur = etatJeu.joueurs.findIndex(j => j.id === idJoueur);
        if (indexJoueur !== etatJeu.tourActuel) return; // Triche ou erreur

        // Logique du dé
        const score = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
        etatJeu.joueurs[indexJoueur].position = (etatJeu.joueurs[indexJoueur].position + score) % 40;
        
        // Passer au joueur suivant
        etatJeu.tourActuel = (etatJeu.tourActuel + 1) % etatJeu.joueurs.length;
        
        // Ajouter un log
        etatJeu.log.push(`${etatJeu.joueurs[indexJoueur].pseudo} a fait ${score}`);

        diffuserEtat();
    }
}

// L'hôte envoie le nouvel état à tout le monde
function diffuserEtat() {
    const message = { type: 'MISE_A_JOUR', etat: etatJeu, jeuDemarre: jeuEnCours };
    
    // Envoi aux clients
    connexionsClients.forEach(c => c.send(message));
    
    // Mise à jour de l'interface de l'hôte
    appliquerEtatJeu();
}

// ---------------------------------------------------------
// 3. INTERFACE GRAPHIQUE
// ---------------------------------------------------------

function appliquerEtatJeu() {
    // Si le jeu n'a pas démarré, on met à jour le Lobby
    if (!jeuEnCours) {
        mettreAJourLobby();
        return;
    }

    // Si le jeu a démarré, on affiche le plateau
    document.getElementById('ecran-lobby').classList.add('hidden');
    document.getElementById('ecran-jeu').classList.remove('hidden');

    // Mise à jour des infos
    const joueurActuel = etatJeu.joueurs[etatJeu.tourActuel];
    document.getElementById('tour-joueur').innerText = joueurActuel.pseudo;
    document.getElementById('tour-joueur').style.color = getCouleur(etatJeu.tourActuel);

    // Activer le bouton SEULEMENT si c'est mon tour
    const cEstAmoi = (joueurActuel.id === monId);
    document.getElementById('btn-lancer-des').disabled = !cEstAmoi;
    document.getElementById('btn-lancer-des').innerText = cEstAmoi ? "À TOI DE JOUER !" : "Attente...";

    // Déplacer les pions (Affichage)
    etatJeu.joueurs.forEach((j, index) => {
        let pion = document.getElementById('pion-' + index);
        // Si le pion n'existe pas encore, on le crée
        if (!pion) {
            pion = document.createElement('div');
            pion.id = 'pion-' + index;
            pion.className = `pion pion-${index}`;
            pion.title = j.pseudo;
            // On l'ajoute temporairement au body pour le stocker, on le placera dans la case après
            document.body.appendChild(pion); 
        }
        // On le met dans la bonne case
        const caseDiv = document.getElementById('case-' + j.position);
        if (caseDiv) caseDiv.appendChild(pion);
    });

    // Afficher historique (dernier message)
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

// Actions utilisateur
function demarrerLaPartie() {
    envoyerAuServeur({ type: 'LANCER_PARTIE' });
}

function actionLancerDes() {
    envoyerAuServeur({ type: 'LANCER_DES' });
}

// Petit utilitaire pour les couleurs
function getCouleur(index) {
    const couleurs = ['red', 'blue', 'green', 'orange', 'purple', 'black'];
    return couleurs[index % couleurs.length];
}

// Génération du plateau au chargement (identique à avant)
function genererPlateau() {
    const plateau = document.getElementById('plateau');
    for (let i = 0; i < 40; i++) {
        let caseDiv = document.createElement('div');
        caseDiv.className = 'case';
        caseDiv.id = 'case-' + i;
        caseDiv.innerText = i;
        
        // Positionnement Grid (identique à avant)
        if (i >= 0 && i <= 10) { caseDiv.style.gridRow = 11; caseDiv.style.gridColumn = 11 - i; }
        else if (i > 10 && i <= 20) { caseDiv.style.gridColumn = 1; caseDiv.style.gridRow = 21 - i; }
        else if (i > 20 && i <= 30) { caseDiv.style.gridRow = 1; caseDiv.style.gridColumn = i - 19; }
        else { caseDiv.style.gridColumn = 11; caseDiv.style.gridRow = i - 29; }
        
        plateau.appendChild(caseDiv);
    }
}
genererPlateau();