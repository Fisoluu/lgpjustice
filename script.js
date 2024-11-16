function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });
    
    // Vérification pour la section Casier Judiciaire
    if (sectionId === 'casier' && !isUserConfirmed()) {
        alert('Accès refusé. Vous devez être un utilisateur inscrit et approuvé pour accéder à cette section.');
        showSection('home'); // Redirection vers l'accueil si l'utilisateur n'est pas confirmé
    } else {
        // Mettre à jour l'URL sans recharger la page
        history.pushState(null, null, `#${sectionId}`);
    }
}

// Afficher la section correspondante à l'URL initiale ou par défaut
document.addEventListener('DOMContentLoaded', () => {
    const sectionId = window.location.hash.substring(1) || 'home';
    checkLoginState();
    loadSavedImages();
    loadPendingRegistrations();
    loadUsers(); // Charger les utilisateurs lors du chargement de la page
    updateNavigation(); // Mettre à jour la navigation lors du chargement de la page
    showSection(sectionId);
});

// Vérifier l'état de connexion
function checkLoginState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const statusIndicator = document.getElementById('statusIndicator');
    const username = localStorage.getItem('username');

    if (isLoggedIn === 'true') {
        statusIndicator.classList.add('online');
        statusIndicator.classList.remove('offline');
        if (username === 'admin') {
            showSection('admin');
        }
    } else {
        statusIndicator.classList.add('offline');
        statusIndicator.classList.remove('online');
    }
    updateNavigation(); // Mettre à jour la navigation
}

// Vérifier si l'utilisateur est inscrit et approuvé ou administrateur
function isUserConfirmed() {
    const username = localStorage.getItem('username');
    if (username === 'admin') {
        return true;
    }
    const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];
    return approvedUsers.some(user => user.username === username);
}

// Mettre à jour la navigation en fonction de l'état de connexion
function updateNavigation() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const username = localStorage.getItem('username');
    const loginOption = document.getElementById('loginOption');
    const registerOption = document.getElementById('registerOption');

    if (isLoggedIn === 'true' && username !== null) {
        loginOption.textContent = 'Options';
        loginOption.setAttribute('onclick', "showSection('admin')");
        registerOption.style.display = 'none'; // Cacher le bouton "Créer un compte" quand l'utilisateur est connecté
    } else {
        loginOption.textContent = 'Connexion';
        loginOption.setAttribute('onclick', "showSection('login')");
        registerOption.style.display = 'block'; // Afficher le bouton "Créer un compte" quand l'utilisateur est déconnecté
    }
}
// Gestion de la connexion
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('loginMessage');
    const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];
    
    if (username === 'admin' && password === 'admin') {
        localStorage.setItem('isLoggedIn', 'true'); // Enregistrer l'état de connexion
        localStorage.setItem('username', username); // Enregistrer le nom d'utilisateur
        checkLoginState(); // Mettre à jour l'indicateur de statut
        showSection('admin'); // Afficher la section d'administration
        loginMessage.textContent = '';
    } else if (approvedUsers.some(user => user.username === username && user.password === password)) {
        localStorage.setItem('isLoggedIn', 'true'); // Enregistrer l'état de connexion
        localStorage.setItem('username', username); // Enregistrer le nom d'utilisateur
        checkLoginState(); // Mettre à jour l'indicateur de statut
        showSection('home'); // Rediriger vers l'accueil après connexion
        loginMessage.textContent = '';
    } else {
        loginMessage.textContent = 'Nom d\'utilisateur ou mot de passe incorrect.';
        loginMessage.style.color = 'red';
    }
    updateNavigation(); // Mettre à jour la navigation
});

// Gestion de l'inscription
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const regUsername = document.getElementById('regUsername').value;
    const regPassword = document.getElementById('regPassword').value;
    const regEmail = document.getElementById('regEmail').value;
    const registerMessage = document.getElementById('registerMessage');

    let pendingRegistrations = JSON.parse(localStorage.getItem('pendingRegistrations')) || [];
    pendingRegistrations.push({ username: regUsername, password: regPassword, email: regEmail });
    localStorage.setItem('pendingRegistrations', JSON.stringify(pendingRegistrations));

    registerMessage.textContent = 'Inscription réussie. En attente de validation par un administrateur.';
    registerMessage.style.color = 'green';
    document.getElementById('registerForm').reset();
});

// Charger les inscriptions en attente
function loadPendingRegistrations() {
    const pendingRegistrations = JSON.parse(localStorage.getItem('pendingRegistrations')) || [];
    const pendingContainer = document.getElementById('pendingRegistrations');
    pendingContainer.innerHTML = '';

    pendingRegistrations.forEach((registration, index) => {
        const regDiv = document.createElement('div');
        regDiv.className = 'registration-entry';
        regDiv.innerHTML = `
            <p>Nom d'utilisateur: ${registration.username}</p>
            <p>Email: ${registration.email}</p>
            <button onclick="approveRegistration(${index})">Approuver</button>
            <button onclick="rejectRegistration(${index})">Rejeter</button>
        `;
        pendingContainer.appendChild(regDiv);
    });
}

// Approuver une inscription
function approveRegistration(index) {
    let pendingRegistrations = JSON.parse(localStorage.getItem('pendingRegistrations')) || [];
    let approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];

    approvedUsers.push(pendingRegistrations[index]);
    localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));

    pendingRegistrations.splice(index, 1);
    localStorage.setItem('pendingRegistrations', JSON.stringify(pendingRegistrations));
    loadPendingRegistrations();
}

// Rejeter une inscription
function rejectRegistration(index) {
    let pendingRegistrations = JSON.parse(localStorage.getItem('pendingRegistrations')) || [];

    pendingRegistrations.splice(index, 1);
    localStorage.setItem('pendingRegistrations', JSON.stringify(pendingRegistrations));
    loadPendingRegistrations();
}

// Sauvegarder une image dans le Local Storage
function saveImageToLocalStorage(title, imageUrl) {
    let images = JSON.parse(localStorage.getItem('images')) || [];
    images.push({ title: title, imageUrl: imageUrl });
    localStorage.setItem('images', JSON.stringify(images));
}

// Charger les images sauvegardées
function loadSavedImages() {
    const images = JSON.parse(localStorage.getItem('images')) || [];
    const imageContainer = document.getElementById('imageContainer');
    images.forEach(image => {
        displayImage(image.title, image.imageUrl);
    });
}

// Afficher une image dans le conteneur
function displayImage(titleText, imageUrl) {
    const imageContainer = document.getElementById('imageContainer');
    
    const title = document.createElement('h4');
    title.textContent = titleText;
    title.style.color = '#004080';  // Même couleur que les autres titres
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = titleText;
    img.className = 'thumbnail';  // Ajout de la classe 'thumbnail'
    
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    
    const imgLarge = document.createElement('img');
    imgLarge.src = imageUrl;
    imgLarge.alt = titleText;
    imgLarge.className = 'large';  // Ajout de la classe 'large'
    
    overlay.appendChild(imgLarge);

    overlay.addEventListener('click', function() {
        this.style.display = 'none';
    });

    img.addEventListener('click', function(event) {
        event.stopPropagation();
        overlay.style.display = 'flex';
    });

    // Vérification du rôle de l'utilisateur
    const username = localStorage.getItem('username');
    const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];
    const user = approvedUsers.find(user => user.username === username) || { role: '' };

    if (username === 'admin' || user.role === 'admin') {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', function() {
            imageContainer.removeChild(title);
            imageContainer.removeChild(img);
            document.body.removeChild(overlay);
            imageContainer.removeChild(deleteButton);
            // Mettre à jour le Local Storage
            removeImageFromLocalStorage(titleText, imageUrl);
        });
        imageContainer.appendChild(deleteButton);
    }

    imageContainer.appendChild(title);
    imageContainer.appendChild(img);
    document.body.appendChild(overlay);
}

// Supprimer une image du Local Storage
function removeImageFromLocalStorage(title, imageUrl) {
    let images = JSON.parse(localStorage.getItem('images')) || [];
    images = images.filter(image => image.title !== title || image.imageUrl !== imageUrl);
    localStorage.setItem('images', JSON.stringify(images));
}

// Charger les images sauvegardées
function loadSavedImages() {
    const images = JSON.parse(localStorage.getItem('images')) || [];
    const imageContainer = document.getElementById('imageContainer');
    
    // Vider le conteneur d'images avant de charger les images sauvegardées
    imageContainer.innerHTML = '';

    images.forEach(image => {
        displayImage(image.title, image.imageUrl);
    });
}

// Afficher une image dans le conteneur
function displayImage(titleText, imageUrl) {
    const imageContainer = document.getElementById('imageContainer');
    
    const title = document.createElement('h4');
    title.textContent = titleText;
    title.style.color = '#004080';  // Même couleur que les autres titres
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = titleText;
    img.className = 'thumbnail';  // Ajout de la classe 'thumbnail'
    
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    
    const imgLarge = document.createElement('img');
    imgLarge.src = imageUrl;
    imgLarge.alt = titleText;
    imgLarge.className = 'large';  // Ajout de la classe 'large'
    
    overlay.appendChild(imgLarge);

    overlay.addEventListener('click', function() {
        this.style.display = 'none';
    });

    img.addEventListener('click', function(event) {
        event.stopPropagation();
        overlay.style.display = 'flex';
    });

    // Vérification du rôle de l'utilisateur
    const username = localStorage.getItem('username');
    const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];
    const user = approvedUsers.find(user => user.username === username) || { role: '' };

    if (username === 'admin' || user.role === 'admin') {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', function() {
            imageContainer.removeChild(title);
            imageContainer.removeChild(img);
            document.body.removeChild(overlay);
            imageContainer.removeChild(deleteButton);
            // Mettre à jour le Local Storage
            removeImageFromLocalStorage(titleText, imageUrl);
        });
        imageContainer.appendChild(deleteButton);
    }

    imageContainer.appendChild(title);
    imageContainer.appendChild(img);
    document.body.appendChild(overlay);
}

// Supprimer une image du Local Storage
function removeImageFromLocalStorage(title, imageUrl) {
    let images = JSON.parse(localStorage.getItem('images')) || [];
    images = images.filter(image => image.title !== title || image.imageUrl !== imageUrl);
    localStorage.setItem('images', JSON.stringify(images));
}

// Sauvegarder une image dans le Local Storage
function saveImageToLocalStorage(title, imageUrl) {
    let images = JSON.parse(localStorage.getItem('images')) || [];
    images.push({ title: title, imageUrl: imageUrl });
    localStorage.setItem('images', JSON.stringify(images));
}

// Charger les inscriptions et les utilisateurs lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const sectionId = window.location.hash.substring(1) || 'home';
    checkLoginState();
    loadSavedImages();
    loadPendingRegistrations();
    loadUsers(); // Charger les utilisateurs lors du chargement de la page
    updateNavigation(); // Mettre à jour la navigation lors du chargement de la page
    showSection(sectionId);
    updateWelcomeMessage(); // Mettre à jour le message de bienvenue lors du chargement de la page
    toggleUserManagementVisibility(); // Afficher ou masquer la section Gérer les utilisateurs
});


// Charger les inscriptions et les utilisateurs lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const sectionId = window.location.hash.substring(1) || 'home';
    checkLoginState();
    loadSavedImages();
    loadPendingRegistrations();
    loadUsers(); // Charger les utilisateurs lors du chargement de la page
    updateNavigation(); // Mettre à jour la navigation lors du chargement de la page
    showSection(sectionId);
    updateWelcomeMessage(); // Mettre à jour le message de bienvenue lors du chargement de la page
    toggleUserManagementVisibility(); // Afficher ou masquer la section Gérer les utilisateurs
});

// Gestion du téléchargement et de l'affichage de l'image
document.getElementById('imageForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const imageInput = document.getElementById('imageInput');
    const imageTitleInput = document.getElementById('imageTitle');
    const uploadMessage = document.getElementById('uploadMessage');
    const file = imageInput.files[0];
    const imageTitle = imageTitleInput.value;

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            displayImage(imageTitle, imageUrl);
            saveImageToLocalStorage(imageTitle, imageUrl);
            uploadMessage.textContent = 'Image téléchargée avec succès.';
            uploadMessage.style.color = 'green';
        };
        reader.readAsDataURL(file);
    } else {
        uploadMessage.textContent = 'Veuillez sélectionner une image.';
        uploadMessage.style.color = 'red';
    }
});

// Gestion de la déconnexion
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    checkLoginState(); // Mettre à jour l'indicateur de statut
    showSection('login'); // Rediriger vers la section de connexion
    updateNavigation(); // Mettre à jour la navigation
}

// Supprimer une image du Local Storage
function removeImageFromLocalStorage(title, imageUrl) {
    let images = JSON.parse(localStorage.getItem('images')) || [];
    images = images.filter(image => image.title !== title || image.imageUrl !== imageUrl);
    localStorage.setItem('images', JSON.stringify(images));
}

// Fonction pour vérifier et afficher les sections protégées
function showProtectedSection(sectionId) {
    if (isUserConfirmed()) {
        showSection(sectionId);
    } else {
        alert('Accès refusé. Vous devez être un utilisateur inscrit et approuvé pour accéder à cette section.');
        showSection('home');
    }
}

// Gestion des événements pour la navigation
document.querySelector('nav').addEventListener('click', function(event) {
    const target = event.target;
    if (target.tagName === 'A') {
        event.preventDefault();
        const sectionId = target.getAttribute('onclick').replace("showSection('", "").replace("')", "");
        if (sectionId === 'casier') {
            showProtectedSection(sectionId);
        } else {
            showSection(sectionId);
        }
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const sectionId = window.location.hash.substring(1) || 'home';
    checkLoginState();
    loadSavedImages();
    loadPendingRegistrations();
    loadUsers(); // Charger les utilisateurs lors du chargement de la page
    updateNavigation(); // Mettre à jour la navigation lors du chargement de la page
    showSection(sectionId);
});
// Charger les utilisateurs existants
function loadUsers() {
    const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];
    const userContainer = document.getElementById('userManagement');
    userContainer.innerHTML = '';

    approvedUsers.forEach((user, index) => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-entry';

        const role = user.role === 'admin' ? 'Administrateur' : 'Membre';

        userDiv.innerHTML = `
            <p>Nom d'utilisateur: ${user.username}</p>
            <p class="user-role">Rôle: ${role}</p>
            <p>Email: ${user.email}</p>
            <button onclick="deleteUser(${index})">Supprimer</button>
            ${user.role === 'admin' ? `<button onclick="demoteToMember(${index})">Rétrograder</button>` : `<button onclick="promoteToAdmin(${index})">Promouvoir en administrateur</button>`}
        `;
        userContainer.appendChild(userDiv);
    });
}

// Promouvoir un utilisateur en administrateur
function promoteToAdmin(index) {
    let approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];
    let user = approvedUsers[index];
    user.role = 'admin'; // Ajout d'un rôle pour l'utilisateur
    approvedUsers[index] = user;
    localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));
    loadUsers(); // Recharger la liste des utilisateurs
}

// Rétrograder un administrateur en membre
function demoteToMember(index) {
    let approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];
    let user = approvedUsers[index];
    user.role = 'member'; // Modifier le rôle de l'utilisateur à 'member'
    approvedUsers[index] = user;
    localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));
    loadUsers(); // Recharger la liste des utilisateurs
}

// Supprimer un utilisateur
function deleteUser(index) {
    let approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];
    approvedUsers.splice(index, 1);
    localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));
    loadUsers(); // Recharger la liste des utilisateurs
}

// Mettre à jour le message de bienvenue avec le nom d'utilisateur
function updateWelcomeMessage() {
    const username = localStorage.getItem('username');
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (username) {
        welcomeMessage.textContent = `Bienvenue, ${username}. Vous pouvez maintenant gérer les casiers judiciaires et les utilisateurs.`;
    }
}

// Afficher ou masquer la section Gérer les utilisateurs en fonction du rôle
function toggleUserManagementVisibility() {
    const username = localStorage.getItem('username');
    const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];
    const user = approvedUsers.find(user => user.username === username) || { role: '' };
    const userManagementSection = document.getElementById('userManagementSection');
    const userManagement = document.getElementById('userManagement');

    if (username === 'admin' || user.role === 'admin') {
        userManagementSection.style.display = 'block';
        userManagement.style.display = 'block'; // Afficher la liste des utilisateurs pour les administrateurs
    } else {
        userManagementSection.style.display = 'none';
        userManagement.style.display = 'none'; // Masquer la liste des utilisateurs pour les non-administrateurs
    }
}

// Gestion de la connexion
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('loginMessage');
    const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];

    // Vérification du compte admin
    if (username === 'admin' && password === 'admin') {
        localStorage.setItem('isLoggedIn', 'true'); // Enregistrer l'état de connexion
        localStorage.setItem('username', username); // Enregistrer le nom d'utilisateur
        checkLoginState(); // Mettre à jour l'indicateur de statut
        showSection('admin'); // Afficher la section d'administration
        updateWelcomeMessage(); // Mettre à jour le message de bienvenue
        toggleUserManagementVisibility(); // Afficher ou masquer la section Gérer les utilisateurs
        loginMessage.textContent = '';
    } else if (approvedUsers.some(user => user.username === username && user.password === password)) {
        localStorage.setItem('isLoggedIn', 'true'); // Enregistrer l'état de connexion
        localStorage.setItem('username', username); // Enregistrer le nom d'utilisateur
        checkLoginState(); // Mettre à jour l'indicateur de statut
        showSection('home'); // Rediriger vers l'accueil après connexion
        updateWelcomeMessage(); // Mettre à jour le message de bienvenue
        toggleUserManagementVisibility(); // Afficher ou masquer la section Gérer les utilisateurs
        loginMessage.textContent = '';
    } else {
        loginMessage.textContent = 'Nom d\'utilisateur ou mot de passe incorrect.';
        loginMessage.style.color = 'red';
    }
    updateNavigation(); // Mettre à jour la navigation
});

// Charger les inscriptions et les utilisateurs lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const sectionId = window.location.hash.substring(1) || 'home';
    checkLoginState();
    loadSavedImages();
    loadPendingRegistrations();
    loadUsers(); // Charger les utilisateurs lors du chargement de la page
    updateNavigation(); // Mettre à jour la navigation lors du chargement de la page
    showSection(sectionId);
    updateWelcomeMessage(); // Mettre à jour le message de bienvenue lors du chargement de la page
    toggleUserManagementVisibility(); // Afficher ou masquer la section Gérer les utilisateurs
});

