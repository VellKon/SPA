document.addEventListener('DOMContentLoaded', () => {
  const expandAllBtn = document.getElementById('expand-all');
  const collapseAllBtn = document.getElementById('collapse-all');
  const searchInput = document.getElementById('search-input');
  const ticketCards = document.querySelectorAll('.ticket-card');
  const visibleCountEl = document.getElementById('visible-count');
  const pillBtns = document.querySelectorAll('.pill-btn');
  const fabTop = document.getElementById('fab-top');

  // Развернуть / Свернуть все
  expandAllBtn.addEventListener('click', () => {
    ticketCards.forEach(card => card.setAttribute('open', ''));
  });

  collapseAllBtn.addEventListener('click', () => {
    ticketCards.forEach(card => card.removeAttribute('open'));
  });

  // Поиск по билетам
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    let count = 0;

    ticketCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(query)) {
        card.style.display = '';
        count++;
        if (query.length > 2) {
          card.setAttribute('open', '');
        }
      } else {
        card.style.display = 'none';
      }
    });

    if (visibleCountEl) {
      visibleCountEl.textContent = `${count} из ${ticketCards.length}`;
    }
  });

  // Кнопки быстрой навигации 1-30
  pillBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const targetCard = document.getElementById(targetId);
      if (targetCard) {
        targetCard.style.display = '';
        targetCard.setAttribute('open', '');
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        pillBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // Кнопка наверх
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      fabTop.style.display = 'flex';
    } else {
      fabTop.style.display = 'none';
    }
  });

  fabTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  ticketCards.forEach(card => {
    card.addEventListener('toggle', () => {
      if (card.open) {
        const id = card.getAttribute('id');
        pillBtns.forEach(b => {
          if (b.getAttribute('data-target') === id) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });
      }
    });
  });
});
