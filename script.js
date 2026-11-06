// Функция скачивания билета в TXT с нейтральным именем
window.downloadTxt = function(ticketId, event) {
  if (event) {
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
    if (typeof event.preventDefault === 'function') event.preventDefault();
  }

  const card = document.getElementById('ticket-' + ticketId);
  if (!card) return;

  const num = String(ticketId).padStart(2, '0');
  // Имя файла не должно указывать на то, что это ответ на билет
  // Используем нейтральное имя: conspect_01.txt, conspect_02.txt и т.д.
  const filename = `conspect_${num}.txt`;

  // Извлекаем название темы
  const summaryTitleEl = card.querySelector('.ticket-summary div');
  const summaryTitle = summaryTitleEl ? summaryTitleEl.textContent.trim().replace(/\s+/g, ' ') : `Тема ${ticketId}`;

  let text = `КОНСПЕКТ ПО ТЕМЕ: ${summaryTitle}\n`;
  text += '='.repeat(60) + '\n\n';

  // Извлекаем вопросы и ответы
  // Используем textContent, так как он надежно читает текст даже из закрытых блоков <details>
  const questions = card.querySelectorAll('.question-item');
  questions.forEach((q, idx) => {
    const titleEl = q.querySelector('.question-title');
    const title = titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : `Вопрос ${idx + 1}`;
    const textBlock = q.querySelector('.question-text');

    let sectionContent = '';
    if (textBlock) {
      Array.from(textBlock.children).forEach(child => {
        if (child.tagName === 'PRE') {
          // Схема диаграммы с сохранением всех переводов строк
          sectionContent += '\n[Схема / Диаграмма]\n' + child.textContent.trim() + '\n\n';
        } else if (child.tagName === 'P') {
          const pText = child.textContent.trim().replace(/\s+/g, ' ');
          if (pText) sectionContent += pText + '\n\n';
        } else if (child.tagName === 'UL' || child.tagName === 'OL') {
          child.querySelectorAll('li').forEach(li => {
            const liText = li.textContent.trim().replace(/\s+/g, ' ');
            if (liText) sectionContent += '• ' + liText + '\n';
          });
          sectionContent += '\n';
        } else {
          const raw = child.textContent.trim();
          if (raw) sectionContent += raw + '\n\n';
        }
      });
    }

    text += `[${idx + 1}] ${title}\n`;
    text += '-'.repeat(title.length > 20 ? title.length : 40) + '\n';
    text += sectionContent.trim() + '\n\n' + '='.repeat(60) + '\n\n';
  });

  const blob = new Blob([text.trim()], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
};

// Перехват кликов по кнопке скачивания в заголовке на фазе capture (до того, как <summary> попытается раскрыться)
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.btn-download');
  if (btn) {
    e.stopPropagation();
    e.preventDefault();
    const ticketId = btn.getAttribute('data-id') || (btn.closest('.ticket-card') ? btn.closest('.ticket-card').id.replace('ticket-', '') : null);
    if (ticketId) {
      window.downloadTxt(ticketId, e);
    }
  }
}, true);

// Блокировка mousedown и pointerdown на кнопке, чтобы <summary> не дергался
document.addEventListener('mousedown', function(e) {
  if (e.target.closest('.btn-download')) {
    e.stopPropagation();
  }
}, true);

document.addEventListener('pointerdown', function(e) {
  if (e.target.closest('.btn-download')) {
    e.stopPropagation();
  }
}, true);

// Обработчик клавиш Enter / Space для кнопки скачивания
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    const btn = e.target.closest('.btn-download');
    if (btn) {
      e.stopPropagation();
      e.preventDefault();
      const ticketId = btn.getAttribute('data-id');
      if (ticketId) {
        window.downloadTxt(ticketId, e);
      }
    }
  }
}, true);

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
