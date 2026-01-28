// File main.js
import AFRAME from "aframe";

// Configuration des timings
const TRAVEL_DURATION = 30000; // 30 secondes entre chaque hyperespace
const HYPERSPACE_DURATION = 5000; // 5 secondes en hyperespace
const SOUND_START_BEFORE = 4500; // Son commence 4 secondes avant l'hyperespace

// État actuel
let currentEnv = 1; // 1 = Tatooine, 2 = Nébuleuse, 3 = Voie Lactée
let audioStarted = false;

// Audio pour l'hyperespace
const hyperspaceSound = new Audio('./assets/Blender Hyperspace Jump.mp3');

// Audio de fond (ambiance spatiale)
const ambientSound = new Audio('./assets/space.mp3');
ambientSound.loop = true;
ambientSound.volume = 0.9; // Volume à 90%, ajuste si besoin

// Créer l'overlay de démarrage
function createStartOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'start-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, #000000 0%, #0a0a15 50%, #000000 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    cursor: pointer;
  `;
  overlay.innerHTML = `
    <div style="text-align: center; font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;">
      <p style="font-size: 1.2rem; color: #FFE81F; letter-spacing: 0.3rem; margin-bottom: 2rem; text-transform: uppercase;">A long time ago in a galaxy far, far away....</p>
      <h1 style="font-size: 4rem; color: #FFE81F; letter-spacing: 0.8rem; margin-bottom: 0.5rem; text-shadow: 0 0 30px rgba(255, 232, 31, 0.5);">STAR WARS</h1>
      <p style="font-size: 1.8rem; color: #FFE81F; letter-spacing: 0.4rem; margin-bottom: 0.5rem;">✦</p>
      <h2 style="font-size: 2.5rem; color: #C9A962; letter-spacing: 0.5rem; font-weight: 300; text-transform: uppercase; margin-bottom: 3rem;">BOUCHERON</h2>
      <p style="font-size: 1rem; color: #8B8B8B; letter-spacing: 0.2rem; text-transform: uppercase;">Haute Joaillerie</p>
      <div style="margin-top: 4rem; animation: pulse 2s infinite;">
        <p style="font-size: 1.1rem; color: #FFE81F; letter-spacing: 0.15rem;">[ Cliquez pour entrer ]</p>
      </div>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    </style>
  `;
  
  overlay.addEventListener('click', () => {
    if (!audioStarted) {
      audioStarted = true;
      ambientSound.play();
      overlay.remove();
      console.log("Audio started after user interaction");
    }
  });
  
  document.body.appendChild(overlay);
}

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
  
  // Cacher tous les environnements
  document.getElementById('env1').setAttribute('visible', 'false');
  document.getElementById('env2').setAttribute('visible', 'false');
  document.getElementById('env3').setAttribute('visible', 'false');
  
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
  
  // Changer d'environnement (cycle: 1 -> 2 -> 3 -> 1)
  currentEnv = currentEnv === 3 ? 1 : currentEnv + 1;
  
  // Cacher tous les environnements d'abord
  document.getElementById('env1').setAttribute('visible', 'false');
  document.getElementById('env2').setAttribute('visible', 'false');
  document.getElementById('env3').setAttribute('visible', 'false');
  
  // Afficher le nouvel environnement
  if (currentEnv === 1) {
    document.getElementById('env1').setAttribute('visible', 'true');
    console.log("Arrived at Tatooine");
  } else if (currentEnv === 2) {
    document.getElementById('env2').setAttribute('visible', 'true');
    console.log("Arrived at Blue Nebula");
  } else {
    document.getElementById('env3').setAttribute('visible', 'true');
    console.log("Arrived at Milky Way");
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
  
  // Créer l'overlay pour l'interaction utilisateur
  createStartOverlay();
  
  // Premier saut en hyperespace après 30 secondes (moins 4.5 secondes pour le son)
  setTimeout(startHyperspaceSound, TRAVEL_DURATION - SOUND_START_BEFORE);
}