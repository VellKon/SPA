// Глобальная функция для скачивания TXT файла с нейтральным именем
window.downloadTxt = function(ticketId, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  const card = document.getElementById('ticket-' + ticketId);
  if (!card) return;

  const num = String(ticketId).padStart(2, '0');
  // Нейтральное имя файла: conspect_01.txt, conspect_02.txt и т.д.
  const filename = `conspect_${num}.txt`;

  const summaryTitleEl = card.querySelector('.ticket-summary div');
  const summaryTitle = summaryTitleEl ? summaryTitleEl.innerText.trim() : `Тема ${ticketId}`;

  let text = `КОНСПЕКТ ПО ТЕМЕ: ${summaryTitle}\n`;
  text += '='.repeat(50) + '\n\n';

  const questions = card.querySelectorAll('.question-item');
  questions.forEach((q, idx) => {
    const titleEl = q.querySelector('.question-title');
    const title = titleEl ? titleEl.innerText.trim() : `Вопрос ${idx + 1}`;
    const body = q.querySelector('.question-text');

    let bodyText = '';
    if (body) {
      body.childNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'PRE') {
            bodyText += '\n[Схема / Диаграмма]\n' + node.innerText.trim() + '\n\n';
          } else {
            const paragraph = node.innerText.trim();
            if (paragraph) {
              bodyText += paragraph + '\n\n';
            }
          }
        } else if (node.nodeType === Node.TEXT_NODE) {
          const raw = node.textContent.trim();
          if (raw) bodyText += raw + '\n\n';
        }
      });
    }

    text += `[${idx + 1}] ${title}\n`;
    text += '-'.repeat(40) + '\n';
    text += bodyText.trim() + '\n\n' + '='.repeat(50) + '\n\n';
  });

  const blob = new Blob([text.trim()], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

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
