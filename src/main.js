// File main.js
import AFRAME from "aframe";

// Configuration des timings
const TRAVEL_DURATION = 30000; // 30 secondes entre chaque hyperespace
const HYPERSPACE_DURATION = 5000; // 5 secondes en hyperespace
const SOUND_START_BEFORE = 4500; // Son commence 4 secondes avant l'hyperespace

// État actuel
let currentEnv = 1; // 1 = Tatooine, 2 = Nébuleuse

// Audio pour l'hyperespace
const hyperspaceSound = new Audio('./assets/Blender Hyperspace Jump.mp3');

// Fonction pour démarrer le son avant l'hyperespace
function startHyperspaceSound() {
  console.log("Starting hyperspace sound...");
  hyperspaceSound.currentTime = 0;
  hyperspaceSound.play();
  
  // Entrer en hyperespace après 3 secondes
  setTimeout(enterHyperspace, SOUND_START_BEFORE);
}

// Fonction pour entrer en hyperespace
function enterHyperspace() {
  console.log("Entering hyperspace...");
  
  // Cacher l'environnement actuel
  document.getElementById('env1').setAttribute('visible', 'false');
  document.getElementById('env2').setAttribute('visible', 'false');
  
  // Afficher l'hyperespace (les animations A-Frame se lancent automatiquement)
  document.getElementById('hyperspace').setAttribute('visible', 'true');
  
  // Après 5 secondes, sortir de l'hyperespace
  setTimeout(exitHyperspace, HYPERSPACE_DURATION);
}

// Fonction pour sortir de l'hyperespace
function exitHyperspace() {
  console.log("Exiting hyperspace...");
  
  // Arrêter le son
  hyperspaceSound.pause();
  hyperspaceSound.currentTime = 0;
  
  // Cacher l'hyperespace
  document.getElementById('hyperspace').setAttribute('visible', 'false');
  
  // Changer d'environnement
  currentEnv = currentEnv === 1 ? 2 : 1;
  
  // Afficher le nouvel environnement
  if (currentEnv === 1) {
    document.getElementById('env1').setAttribute('visible', 'true');
    document.getElementById('env2').setAttribute('visible', 'false');
    console.log("Arrived at Tatooine");
  } else {
    document.getElementById('env1').setAttribute('visible', 'false');
    document.getElementById('env2').setAttribute('visible', 'true');
    console.log("Arrived at Blue Nebula");
  }
  
  // Programmer le prochain saut en hyperespace (moins 3 secondes pour le son)
  setTimeout(startHyperspaceSound, TRAVEL_DURATION - SOUND_START_BEFORE);
}

// Démarrer la boucle après le chargement de la scène
document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  
  if (scene.hasLoaded) {
    startHyperspaceLoop();
  } else {
    scene.addEventListener('loaded', startHyperspaceLoop);
  }
});

function startHyperspaceLoop() {
  console.log("Scene loaded. First hyperspace jump in 30 seconds...");
  // Premier saut en hyperespace après 30 secondes (moins 3 secondes pour le son)
  setTimeout(startHyperspaceSound, TRAVEL_DURATION - SOUND_START_BEFORE);
}