/**
 * Scene Navigation & State Management Controller
 */
class SceneManager {
  constructor() {
    this.scenes = document.querySelectorAll('.scene');
    this.visitedItems = new Set(JSON.parse(localStorage.getItem('dacia_visited_items') || '[]'));
  }

  showScene(sceneId) {
    this.scenes.forEach(scene => {
      if (scene.id === sceneId) {
        scene.classList.add('active');
      } else {
        scene.classList.remove('active');
      }
    });
    localStorage.setItem('dacia_box_current_scene', sceneId);
  }

  markItemVisited(itemKey) {
    this.visitedItems.add(itemKey);
    localStorage.setItem('dacia_visited_items', JSON.stringify(Array.from(this.visitedItems)));
    this.checkSecretoUnlock();
  }

  checkSecretoUnlock() {
    const required = ['tiempo', 'distancia', 'voz', 'recuerdo'];
    const unlocked = required.every(key => this.visitedItems.has(key));
    const secretoCard = document.getElementById('card-secreto');
    
    if (unlocked && secretoCard) {
      secretoCard.classList.remove('locked');
      secretoCard.querySelector('.artifact-title').textContent = "Secreto ✨";
    }
    return unlocked;
  }

  typeWriter(elementId, text, speed = 50, callback = null) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = '';
    let i = 0;
    
    function type() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else if (callback) {
        callback();
      }
    }
    type();
  }
}

window.sceneManager = new SceneManager();
