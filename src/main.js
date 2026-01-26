// File main.js
import AFRAME from "aframe";

// ==========================================
// COMPOSANTS POUR LE SABRE LASER INTERACTIF
// ==========================================

// Composant pour les objets qu'on peut attraper
AFRAME.registerComponent('grabbable', {
  init: function() {
    this.el.classList.add('grabbable');
  }
});

// Composant pour le contrôleur qui attrape les objets
AFRAME.registerComponent('grabber', {
  init: function() {
    this.grabbedEl = null;
    this.originalParent = null;
    
    // Son d'allumage du sabre (optionnel)
    this.igniteSound = new Audio('./assets/lightsaber-on.mp3');
    this.igniteSound.volume = 0.5;
    
    // Écouter les événements du contrôleur
    this.el.addEventListener('triggerdown', this.onTriggerDown.bind(this));
    this.el.addEventListener('triggerup', this.onTriggerUp.bind(this));
    
    // Pour le mode desktop/debug avec la souris
    document.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  },
  
  onTriggerDown: function(evt) {
    if (this.grabbedEl) return; // Déjà en train de tenir quelque chose
    
    // Vérifier si on touche un objet grabbable via le raycaster
    const raycaster = this.el.components.raycaster;
    if (!raycaster) return;
    
    const intersections = raycaster.intersections;
    if (intersections.length > 0) {
      const intersectedEl = intersections[0].object.el;
      
      // Trouver l'élément parent avec la classe grabbable
      let grabbableEl = intersectedEl;
      while (grabbableEl && !grabbableEl.classList.contains('grabbable')) {
        grabbableEl = grabbableEl.parentElement;
      }
      
      if (grabbableEl) {
        this.grabObject(grabbableEl);
      }
    }
  },
  
  onTriggerUp: function(evt) {
    if (this.grabbedEl) {
      this.releaseObject();
    }
  },
  
  onMouseDown: function(evt) {
    // Mode desktop : cliquer sur le sabre pour le prendre
    const lightsaber = document.getElementById('lightsaber');
    if (lightsaber && !this.grabbedEl) {
      // Vérifier si on a cliqué près du sabre (simplifié pour desktop)
      const camera = document.querySelector('a-camera') || document.querySelector('[camera]');
      if (camera) {
        this.grabObject(lightsaber);
      }
    }
  },
  
  onMouseUp: function(evt) {
    if (this.grabbedEl) {
      this.releaseObject();
    }
  },
  
  grabObject: function(el) {
    console.log("Grabbing lightsaber!");
    this.grabbedEl = el;
    this.originalParent = el.parentElement;
    
    // Attacher l'objet au contrôleur
    this.el.appendChild(el);
    el.setAttribute('position', '0 0 -0.2');
    el.setAttribute('rotation', '0 0 0');
    
    // Allumer la lame du sabre
    const blade = el.querySelector('#saber-blade');
    if (blade) {
      blade.setAttribute('visible', 'true');
      // Animation d'allumage
      blade.setAttribute('animation', 'property: scale; from: 1 0.01 1; to: 1 1 1; dur: 200; easing: easeOutQuad');
      
      // Jouer le son d'allumage
      try {
        this.igniteSound.currentTime = 0;
        this.igniteSound.play().catch(e => console.log("Audio not ready"));
      } catch(e) {}
    }
    
    // Émettre un événement
    el.emit('grabbed');
  },
  
  releaseObject: function() {
    if (!this.grabbedEl) return;
    
    console.log("Releasing lightsaber!");
    const el = this.grabbedEl;
    
    // Éteindre la lame du sabre
    const blade = el.querySelector('#saber-blade');
    if (blade) {
      // Animation d'extinction
      blade.setAttribute('animation', 'property: scale; from: 1 1 1; to: 1 0.01 1; dur: 150; easing: easeInQuad');
      
      // Cacher après l'animation
      setTimeout(() => {
        blade.setAttribute('visible', 'false');
        blade.removeAttribute('animation');
      }, 150);
    }
    
    // Remettre l'objet à sa place originale
    const scene = document.querySelector('a-scene');
    scene.appendChild(el);
    el.setAttribute('position', '0 0.80605 -0.77946');
    el.setAttribute('rotation', '90 50 0');
    
    // Émettre un événement
    el.emit('released');
    
    this.grabbedEl = null;
  }
});

// ==========================================
// CONFIGURATION DES TIMINGS HYPERESPACE
// ==========================================
const TRAVEL_DURATION = 30000; // 30 secondes entre chaque hyperespace
const HYPERSPACE_DURATION = 5000; // 5 secondes en hyperespace
const SOUND_START_BEFORE = 4500; // Son commence 4 secondes avant l'hyperespace

// État actuel
let currentEnv = 1; // 1 = Tatooine, 2 = Nébuleuse
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
  
  // Créer l'overlay pour l'interaction utilisateur
  createStartOverlay();
  
  // Premier saut en hyperespace après 30 secondes (moins 4.5 secondes pour le son)
  setTimeout(startHyperspaceSound, TRAVEL_DURATION - SOUND_START_BEFORE);
}