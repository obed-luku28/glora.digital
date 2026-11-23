'use strict';

/**
 * ==============================================================================
 * GLORA - LOGIQUE D'INTERACTION & ANIMATIONS
 * ==============================================================================
 */
(() => {

  // ----------------------------------------------------------------------------
  // 1. INITIALISATION & DÉTECTION DU SYSTÈME
  // ----------------------------------------------------------------------------
  const d = document;
  const de = d.documentElement;
  
  // Vérifie si l'utilisateur a activé l'option "réduire les animations" dans son OS
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Active la classe JS pour déclencher les transitions CSS prévues
  de.classList.add('js');

  // ----------------------------------------------------------------------------
  // 2. SÉLECTION DES ÉLÉMENTS CLÉS DU DOM
  // ----------------------------------------------------------------------------
  const hd = d.querySelector('.hd');        // En-tête fixe
  const bar = d.querySelector('.bar');      // Barre de progression de lecture
  const hex = d.querySelector('.hex');      // Grand hexagone Glora en fond
  const hero = d.querySelector('.hero');    // Section héro d'accueil
  const fab = d.querySelector('.fab');      // Bouton d'action flottant WhatsApp
  const cta = d.querySelector('#contact');  // Section de contact finale
  const scrub = d.querySelector('.scrub');  // Section conviction (texte interactif)
  const steps = d.querySelector('.steps');  // Ligne des 4 étapes de la méthode

  // ----------------------------------------------------------------------------
  // 3. PRÉPARATION DU TEXTE DE LA SECTION CONVICTION (EFFET SCRUB MOT PAR MOT)
  // ----------------------------------------------------------------------------
  const words = [];

  if (scrub) {
    const p = scrub.querySelector('p');
    const parts = p.textContent.trim().split(/\s+/);
    
    // Vide le paragraphe pour remplacer les mots par des balises <span>
    p.textContent = '';
    
    parts.forEach((word, index) => {
      const span = d.createElement('span');
      span.className = 'w';
      span.textContent = word;
      p.append(span);

      // Ajoute un espace entre les mots
      if (index < parts.length - 1) {
        p.append(' ');
      }

      words.push(span);
    });
  }

  // ----------------------------------------------------------------------------
  // 4. ANIMATION D'APPARITION AU DÉFILEMENT (INTERSECTION OBSERVER)
  // ----------------------------------------------------------------------------
  // Ajoute un décalage progressif (stagger) aux cartes de services et étapes
  d.querySelectorAll('.rows li, .steps > div').forEach((el, index) => {
    el.style.setProperty('--d', (index % 4) * 0.1 + 's');
  });

  // Observe les éléments avec la classe .rv pour les faire apparaître quand visibles
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target); // Ne joue l'animation qu'une seule fois
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -6% 0px'
  });

  d.querySelectorAll('.rv').forEach(el => io.observe(el));

  // ----------------------------------------------------------------------------
  // 5. FONCTIONS MATHÉMATIQUES UTILES
  // ----------------------------------------------------------------------------
  // Bloque une valeur entre 0 et 1 (utile pour les pourcentages d'animation)
  const clamp = v => Math.min(1, Math.max(0, v));

  // ----------------------------------------------------------------------------
  // 6. GESTION DES EFFETS LIÉS AU DÉFILEMENT (SCROLL)
  // ----------------------------------------------------------------------------
  let tick = false;

  const update = () => {
    tick = false;
    const y = scrollY;
    const scrollMax = de.scrollHeight - innerHeight;

    // A. Mise à jour de la barre supérieure de progression
    bar.style.setProperty('--sp', scrollMax > 0 ? y / scrollMax : 0);

    // B. En-tête avec flou d'arrière-plan dès 40px de défilement
    hd.classList.toggle('stuck', y > 40);

    // C. Affichage du bouton flottant WhatsApp (après 600px, caché avant le CTA)
    const isPastHero = y > 600;
    const isAboveFooterCta = cta ? cta.getBoundingClientRect().top > innerHeight * 0.75 : true;
    fab.classList.toggle('on', isPastHero && isAboveFooterCta);

    // D. Rotation douce de l'hexagone Glora liée au défilement
    if (hex && !rm) {
      hex.style.setProperty('--sy', y);
    }

    // E. Illumination mot par mot du texte de conviction selon la hauteur
    if (scrub) {
      const rect = scrub.getBoundingClientRect();
      const progress = clamp(-rect.top / (rect.height - innerHeight));
      const activeWordCount = Math.round(progress * words.length * 1.08);

      words.forEach((span, index) => {
        span.classList.toggle('on', rm || index < activeWordCount);
      });
    }

    // F. Remplissage de la ligne de progression des 4 étapes de la méthode
    if (steps) {
      const stepsRect = steps.getBoundingClientRect();
      const stepsProgress = clamp((innerHeight * 0.85 - stepsRect.top) / (innerHeight * 0.5));
      steps.style.setProperty('--p', stepsProgress);
    }
  };

  // Optimise l'écouteur de défilement via requestAnimationFrame
  addEventListener('scroll', () => {
    if (!tick) {
      tick = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  // ----------------------------------------------------------------------------
  // 7. SUIVI DU CURSEUR (LUEUR DYNAMIQUE DANS LA SECTION HÉRO)
  // ----------------------------------------------------------------------------
  if (!rm && matchMedia('(pointer: fine)').matches && hero) {
    let pointerTick = false;
    let pointerX = 0;
    let pointerY = 0;

    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;

      if (!pointerTick) {
        pointerTick = true;
        requestAnimationFrame(() => {
          pointerTick = false;
          hero.style.setProperty('--mx', pointerX + 'px');
          hero.style.setProperty('--my', pointerY + 'px');
        });
      }
    });
  }

  // ----------------------------------------------------------------------------
  // 8. ÉCOUTE DU REDIMENSIONNEMENT & LANCEMENT INITIAL
  // ----------------------------------------------------------------------------
  addEventListener('resize', update);
  update();

})();
