// File main.js
import AFRAME from "aframe";

// Configuration des timings
const TRAVEL_DURATION = 30000; // 30 secondes entre chaque hyperespace
const HYPERSPACE_DURATION = 5000; // 5 secondes en hyperespace

// État actuel
let currentEnv = 1; // 1 = Tatooine, 2 = Nébuleuse
let hyperspaceAnimationId = null;

// Fonction pour animer les lignes d'hyperespace
function animateHyperspaceLines() {
  const lines = document.querySelectorAll('[id^="hline"]');
  let startTime = Date.now();
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = (elapsed % 500) / 500; // Cycle de 0.5 seconde
    
    lines.forEach((line, index) => {
      // Décalage pour chaque ligne
      const offset = (index * 0.1) % 1;
      const lineProgress = (progress + offset) % 1;
      
      // Animation Y de haut vers bas (de 8 à 0)
      const yPos = 8 - (lineProgress * 8);
      const currentPos = line.getAttribute('position');
      line.setAttribute('position', `${currentPos.x} ${yPos} ${currentPos.z}`);
    });
    
    hyperspaceAnimationId = requestAnimationFrame(animate);
  }
  
  animate();
}

// Fonction pour arrêter l'animation hyperespace
function stopHyperspaceAnimation() {
  if (hyperspaceAnimationId) {
    cancelAnimationFrame(hyperspaceAnimationId);
    hyperspaceAnimationId = null;
  }
}

// Fonction pour entrer en hyperespace
function enterHyperspace() {
  console.log("Entering hyperspace...");
  
  // Cacher l'environnement actuel
  document.getElementById('env1').setAttribute('visible', 'false');
  document.getElementById('env2').setAttribute('visible', 'false');
  
  // Afficher l'hyperespace
  document.getElementById('hyperspace').setAttribute('visible', 'true');
  
  // Lancer l'animation des lignes
  animateHyperspaceLines();
  
  // Après 5 secondes, sortir de l'hyperespace
  setTimeout(exitHyperspace, HYPERSPACE_DURATION);
}

// Fonction pour sortir de l'hyperespace
function exitHyperspace() {
  console.log("Exiting hyperspace...");
  
  // Arrêter l'animation
  stopHyperspaceAnimation();
  
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
  
  // Programmer le prochain saut en hyperespace
  setTimeout(enterHyperspace, TRAVEL_DURATION);
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
  // Premier saut en hyperespace après 30 secondes
  setTimeout(enterHyperspace, TRAVEL_DURATION);
}