document.addEventListener("click", function (event) {
  const btnDay = event.target.closest('[data-btn-day]');
  const finBtn = event.target.closest('[data-btn-name="fin-inform-button"]');
  const outlayBtn = event.target.closest('[data-btn-name="fin-inform-button-outlay"]');
  const weeklyBtn = event.target.closest('[data-btn-name="fin-inform-button-weekly"]');

  const monthNames = [
    'СІЧЕНЬ', 'ЛЮТИЙ', 'БЕРЕЗЕНЬ', 'КВІТЕНЬ',
    'ТРАВЕНЬ', 'ЧЕРВЕНЬ', 'ЛИПЕНЬ', 'СЕРПЕНЬ',
    'ВЕРЕСЕНЬ', 'ЖОВТЕНЬ', 'ЛИСТОПАД', 'ГРУДЕНЬ'
  ];

  function activateButtonGroup(selector, activeBtn) {
    document.querySelectorAll(selector).forEach(btn => btn.classList.remove('_active'));
    if (activeBtn) activeBtn.classList.add('_active');
  }

  function updateHeaderDate(dayBtn) {
    const dateText = dayBtn.childNodes[0].textContent.trim();
    const dayTitle = dayBtn.getAttribute('title');
    const dateValue = dayBtn.getAttribute('data-date');

    const screenDateEl = document.querySelector('[data-name="date-screen-date"]');
    const screenDayEl = document.querySelector('[data-name="date-screen-day"]');
    const screenMonthEl = document.querySelector('[data-name="date-screen-month"]');

    if (screenDateEl) screenDateEl.textContent = dateText;
    if (screenDayEl) screenDayEl.textContent = dayTitle.charAt(0).toUpperCase() + dayTitle.slice(1);

    if (screenMonthEl && dateValue) {
      const dateObj = new Date(dateValue);
      screenMonthEl.textContent = monthNames[dateObj.getMonth()];
    }
  }

  function updateDayData(dayValue, btnDay) {
    const incomeEl = document.querySelector(`.dash-board__daily-income-info[data-day="${dayValue}"]`);
    const outlayEl = document.querySelector(`.dash-board__daily-outlay-info[data-day="${dayValue}"]`);

    let totalIncome = 0;
    if (incomeEl) {
      incomeEl.querySelectorAll('.dash-board__employee-income').forEach(p => {
        const val = parseFloat(p.textContent.replace(/\s/g, '').replace(',', '.'));
        if (!isNaN(val)) totalIncome += val;
      });
    }

    let totalOutlay = 0;
    if (outlayEl) {
      outlayEl.querySelectorAll('.dash-board__outlay-cost').forEach(p => {
        const val = parseFloat(p.textContent.replace(/\s/g, '').replace(',', '.'));
        if (!isNaN(val)) totalOutlay += val;
      });
    }

    const result = totalIncome - totalOutlay;

    // Шукаємо елемент result по data-date кнопки, або просто глобальний
    const resultEl = document.querySelector(`.dash-board__daily-efficiency-data.result[data-name="daily-efficiency-data"][data-date="${btnDay.getAttribute('data-date')}"]`)
      || document.querySelector(`.dash-board__daily-efficiency-data.result[data-name="daily-efficiency-data"]`);
    const outlayDisplay = document.querySelector('.dash-board__daily-efficiency-data.outlay');
    const incomeDisplay = document.querySelector('.dash-board__daily-efficiency-data.profit');

    if (resultEl) {
      const resultSign = result >= 0 ? '+ ' : '- ';
      const formatted = `${resultSign}${Math.abs(result).toLocaleString('uk-UA')}`;
      resultEl.childNodes[0].textContent = formatted + ' ';

      // Видаляємо старі класи та ставимо як у кнопки
      resultEl.classList.remove('_green', '_red');
      if (btnDay.classList.contains('_green')) {
        resultEl.classList.add('_green');
      } else if (btnDay.classList.contains('_red')) {
        resultEl.classList.add('_red');
      }
    }

    if (incomeDisplay) incomeDisplay.textContent = `Дохід: ${totalIncome.toLocaleString('uk-UA')} грн.`;
    if (outlayDisplay) outlayDisplay.textContent = `Витрати: ${totalOutlay.toLocaleString('uk-UA')} грн.`;
  }

  function showRelevantBlock(dayValue) {
    const currentTab = document.querySelector('[data-btn-name]._active');
    const type = currentTab?.getAttribute('data-btn-name');

    document.querySelectorAll('[data-day]').forEach(el => el.classList.remove('_on-screen'));

    if (type === 'fin-inform-button') {
      const block = document.querySelector(`.dash-board__daily-income-info[data-day="${dayValue}"]`);
      if (block) block.classList.add('_on-screen');
    } else if (type === 'fin-inform-button-outlay') {
      const block = document.querySelector(`.dash-board__daily-outlay-info[data-day="${dayValue}"]`);
      if (block) block.classList.add('_on-screen');
    } else if (type === 'fin-inform-button-weekly') {
      const block = document.querySelector('[data-name="details-for-the-week"]');
      if (block) block.classList.add('_on-screen');
    }
  }

  // ========= Клік по кнопці дня =========
  if (btnDay) {
    const dayValue = btnDay.getAttribute('data-btn-day');
    const date = btnDay.getAttribute('data-date');
    if (!dayValue || !date) return;

    activateButtonGroup('[data-btn-day]', btnDay);

    if (!document.querySelector('[data-btn-name]._active')) {
      const defaultFinBtn = document.querySelector('[data-btn-name="fin-inform-button"]');
      if (defaultFinBtn) defaultFinBtn.classList.add('_active');
    }

    updateHeaderDate(btnDay);
    showRelevantBlock(dayValue);
    updateDayData(dayValue, btnDay);

    return;
  }

  // ========= Клік по кнопці "дохід" =========
  if (finBtn) {
    const activeDayBtn = document.querySelector('[data-btn-day]._active');
    if (!activeDayBtn) return;
    const dayValue = activeDayBtn.getAttribute('data-btn-day');

    activateButtonGroup('[data-btn-name]', finBtn);
    document.querySelectorAll('[data-day]').forEach(el => el.classList.remove('_on-screen'));

    const block = document.querySelector(`.dash-board__daily-income-info[data-day="${dayValue}"]`);
    if (block) block.classList.add('_on-screen');
    return;
  }

  // ========= Клік по кнопці "витрати" =========
  if (outlayBtn) {
    const activeDayBtn = document.querySelector('[data-btn-day]._active');
    if (!activeDayBtn) return;
    const dayValue = activeDayBtn.getAttribute('data-btn-day');

    activateButtonGroup('[data-btn-name]', outlayBtn);
    document.querySelectorAll('[data-day]').forEach(el => el.classList.remove('_on-screen'));

    const block = document.querySelector(`.dash-board__daily-outlay-info[data-day="${dayValue}"]`);
    if (block) block.classList.add('_on-screen');
    return;
  }

  // ========= Клік по кнопці "тиждень" =========
  if (weeklyBtn) {
    activateButtonGroup('[data-btn-name]', weeklyBtn);
    document.querySelectorAll('[data-day]').forEach(el => el.classList.remove('_on-screen'));

    const weekBlock = document.querySelector('[data-name="details-for-the-week"]');
    if (weekBlock) weekBlock.classList.add('_on-screen');
    return;
  }
});