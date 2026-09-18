(function () {
  "use strict";

  const data = window.LITURGICAL_DATA || {};
  const root = document.getElementById("appRoot");
  const liturgicalYearBadge = document.getElementById("liturgicalYearBadge");
  const navButtons = Array.from(document.querySelectorAll("[data-nav-view]"));
  const weekdayShort = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
  const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long" });
  const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const dayMonthFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short"
  });

  const today = startOfDay(new Date());
  const todayISO = toISO(today);
  const shouldStartToday = new URLSearchParams(window.location.search).has("hoje");
  const initialDate = today;
  const state = {
    route: "calendar",
    activeView: shouldStartToday ? "day" : localStorage.getItem("liturgicalActiveView") || "month",
    cursorDate: initialDate,
    selectedDate: todayISO,
    homilyOpen: false
  };

  let forceTodayOnStart = shouldStartToday;

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function fromISO(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    const parts = iso.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function toISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
  }

  function addMonths(date, amount) {
    const next = new Date(date);
    next.setMonth(next.getMonth() + amount, 1);
    return next;
  }

  function weekStart(date) {
    const next = startOfDay(date);
    const day = next.getDay();
    next.setDate(next.getDate() - day);
    return next;
  }

  function isSameDay(first, second) {
    return toISO(first) === toISO(second);
  }

  function compareISO(first, second) {
    return String(first).localeCompare(String(second));
  }

  function getLiturgicalYear(iso) {
    const rules = data.liturgicalYears || [];
    const match = rules.find((rule) => {
      const starts = !rule.from || compareISO(iso, rule.from) >= 0;
      const ends = !rule.to || compareISO(iso, rule.to) <= 0;
      return starts && ends;
    });
    return match ? match.label : "Ano litúrgico";
  }

  function updateLiturgicalYearBadge() {
    if (!liturgicalYearBadge) return;
    liturgicalYearBadge.textContent = getLiturgicalYear(state.selectedDate);
  }

  function escapeHTML(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getExplicitDay(iso) {
    return (data.days && data.days[iso]) || {};
  }

  function fallbackReadings(date) {
    const isSunday = date.getDay() === 0;
    if (isSunday) {
      return [
        { type: "Primeira leitura", citation: "Cadastrar leitura do Lecionário", note: "Domingo reservado para o Lecionário Litúrgico Comum." },
        { type: "Salmo", citation: "Cadastrar salmo do Lecionário", note: "Campo para resposta litúrgica da comunidade." },
        { type: "Epístola", citation: "Cadastrar epístola do Lecionário", note: "Campo para a leitura apostólica." },
        { type: "Evangelho", citation: "Cadastrar Evangelho do Lecionário", note: "Campo para o texto principal da proclamação." }
      ];
    }
    return (data.defaults && data.defaults.readings) || [];
  }

  function getDay(iso) {
    const date = fromISO(iso) || today;
    const explicit = getExplicitDay(iso);
    const defaults = data.defaults || {};
    const sunday = date.getDay() === 0;
    const isSunday = Boolean(explicit.isSunday || sunday);
    const sundayHomily = isSunday ? Object.assign({
      title: "Auxílio Homilético",
      focus: "A cadastrar",
      summary: "Auxílio homilético deste domingo a cadastrar.",
      prompts: [
        "Tema bíblico e litúrgico deste domingo.",
        "Ênfase pastoral para a comunidade.",
        "Sugestão de encaminhamento para a proclamação."
      ]
    }, explicit.homily || {}) : null;
    return {
      iso,
      date,
      title: explicit.title || (sunday ? "Domingo no Lecionário" : "Leitura diária - Tempo Comum"),
      season: explicit.season || defaults.season || "Tempo Comum",
      liturgicalColor: explicit.liturgicalColor || defaults.liturgicalColor || "A cadastrar",
      lectionary: explicit.lectionary || (sunday ? "Lecionário Litúrgico Comum" : ""),
      isSunday,
      isFeast: Boolean(explicit.isFeast),
      readings: explicit.readings || fallbackReadings(date),
      hymns: explicit.hymns || defaults.hymns || [],
      rituals: explicit.rituals || [],
      feastNotes: explicit.feastNotes || [],
      homily: sundayHomily
    };
  }

  function hasSpecificData(iso) {
    return Boolean(data.days && data.days[iso]);
  }

  function renderToolbar(title, subtitle, options) {
    const todayLabel = isSameDay(fromISO(state.selectedDate) || today, today) ? "Hoje" : "Ir para hoje";
    const backButton = options && options.back
      ? `<button class="text-button" type="button" data-action="back-calendar">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>
          Calendário
        </button>`
      : `<button class="icon-button" type="button" data-action="previous" aria-label="Anterior">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>
        </button>`;
    const previousAction = options && options.back
      ? `<button class="icon-button" type="button" data-action="previous" aria-label="Anterior">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>
        </button>`
      : "";
    return `
      <div class="${options && options.back ? "detail-toolbar" : "calendar-toolbar"}">
        ${backButton}
        <div class="period-title">
          <p>${escapeHTML(subtitle)}</p>
          <h2>${escapeHTML(title)}</h2>
        </div>
        <div class="toolbar-actions">
          ${previousAction}
          <button class="text-button" type="button" data-action="today">${todayLabel}</button>
          <button class="icon-button" type="button" data-action="next" aria-label="Próximo">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
          </button>
        </div>
      </div>
    `;
  }

  function renderSegmented() {
    const labels = { day: "Dia", week: "Semana", month: "Mês" };
    return `
      <div class="segmented" role="group" aria-label="Alternar visualização">
        ${Object.keys(labels).map((view) => `
          <button type="button" data-action="set-view" data-view="${view}" aria-pressed="${state.activeView === view}">
            ${labels[view]}
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderMonth() {
    const cursor = new Date(state.cursorDate.getFullYear(), state.cursorDate.getMonth(), 1);
    const gridStart = weekStart(cursor);
    const cells = [];
    for (let index = 0; index < 42; index += 1) {
      const date = addDays(gridStart, index);
      const iso = toISO(date);
      const day = getDay(iso);
      const outside = date.getMonth() !== cursor.getMonth();
      const selected = iso === state.selectedDate;
      const current = isSameDay(date, today);
      cells.push(`
        <button
          class="day-button${outside ? " outside-month" : ""}"
          type="button"
          data-open-date="${iso}"
          aria-pressed="${selected}"
          ${current ? 'aria-current="date"' : ""}
          aria-label="${escapeHTML(`${fullDateFormatter.format(date)}, ${day.title}`)}"
        >
          <span class="day-topline">
            <span class="day-number">${date.getDate()}</span>
            <span class="day-flags" aria-hidden="true">
              ${day.isFeast ? '<span class="flag-dot"></span>' : ""}
              ${hasSpecificData(iso) ? '<span class="flag-outline"></span>' : ""}
            </span>
          </span>
          <span class="day-title">${escapeHTML(day.title)}</span>
          <span class="day-meta">${escapeHTML(day.season)}</span>
        </button>
      `);
    }

    return `
      ${renderToolbar(monthFormatter.format(cursor), data.meta && data.meta.contentLabel ? data.meta.contentLabel : "Calendário local")}
      ${renderSegmented()}
      <section class="month-grid" aria-label="Calendário mensal">
        ${weekdayShort.map((name) => `<div class="weekday-label">${name}</div>`).join("")}
        ${cells.join("")}
      </section>
    `;
  }

  function renderWeek() {
    const start = weekStart(state.cursorDate);
    const end = addDays(start, 6);
    const days = [];
    for (let index = 0; index < 7; index += 1) {
      const date = addDays(start, index);
      const iso = toISO(date);
      const day = getDay(iso);
      const primaryReading = day.readings[0] && day.readings[0].citation;
      days.push(`
        <button
          class="week-card"
          type="button"
          data-open-date="${iso}"
          ${isSameDay(date, today) ? 'aria-current="date"' : ""}
        >
          <span class="date-badge" aria-hidden="true">
            <span>${escapeHTML(weekdayShort[index])}</span>
            <span>${date.getDate()}</span>
          </span>
          <span class="week-summary">
            <h3>${escapeHTML(day.title)}</h3>
            <p>${escapeHTML(primaryReading || "Leitura a cadastrar")}</p>
          </span>
          <span class="week-status">
            ${day.isFeast ? '<span class="tag accent">Festa</span>' : ""}
            ${day.isSunday ? '<span class="tag">Domingo</span>' : ""}
            <span class="tag">${escapeHTML(day.liturgicalColor)}</span>
          </span>
        </button>
      `);
    }

    return `
      ${renderToolbar(`${dayMonthFormatter.format(start)} a ${dayMonthFormatter.format(end)}`, "Semana litúrgica")}
      ${renderSegmented()}
      <section class="week-list" aria-label="Calendário semanal">
        ${days.join("")}
      </section>
    `;
  }

  function renderReadings(readings) {
    if (!readings || readings.length === 0) {
      return '<div class="empty-state">Leituras a cadastrar.</div>';
    }
    return `
      <ul class="reading-list">
        ${readings.map((reading) => `
          <li class="reading-item">
            <span>${escapeHTML(reading.type)}</span>
            <div>
              <strong>${escapeHTML(reading.citation)}</strong>
              ${reading.note ? `<p>${escapeHTML(reading.note)}</p>` : ""}
            </div>
          </li>
        `).join("")}
      </ul>
    `;
  }

  function renderPlainList(items, emptyText) {
    if (!items || items.length === 0) {
      return `<div class="empty-state">${escapeHTML(emptyText)}</div>`;
    }
    return `
      <ul class="plain-list">
        ${items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}
      </ul>
    `;
  }

  function renderHomily(day) {
    if (!day.isSunday || !day.homily) return "";
    const homily = day.homily || {};
    const prompts = homily.prompts || [];
    return `
      <aside class="homily-panel${state.homilyOpen ? " open" : ""}" aria-label="Auxílio Homilético">
        <div class="homily-header">
          <div>
            <h3>${escapeHTML(homily.title || "Auxílio Homilético")}</h3>
            <p>${escapeHTML(homily.summary || "Conteúdo a cadastrar.")}</p>
          </div>
          <button class="primary-button" type="button" data-action="toggle-homily" aria-expanded="${state.homilyOpen}">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              ${state.homilyOpen ? '<path d="M5 12h14"></path>' : '<path d="M12 5v14M5 12h14"></path>'}
            </svg>
            ${state.homilyOpen ? "Fechar auxílio" : "Abrir auxílio"}
          </button>
        </div>
        <div class="homily-body">
          <div class="homily-block">
            <h4>Foco</h4>
            <p>${escapeHTML(homily.focus || "A cadastrar")}</p>
          </div>
          <div class="homily-block">
            <h4>Linhas de preparo</h4>
            ${renderPlainList(prompts, "Linhas homiléticas a cadastrar.")}
          </div>
        </div>
      </aside>
    `;
  }

  function renderDayDetail() {
    const day = getDay(state.selectedDate);
    const title = day.title;
    const subtitle = fullDateFormatter.format(day.date);
    const tags = [
      day.isFeast ? "Dia festivo" : "",
      day.isSunday ? "Domingo" : ""
    ].filter(Boolean);
    const detailGridClass = day.isSunday ? "detail-grid" : "detail-grid detail-grid-single";
    const liturgicalColors = [
      [/verde/i, "#81c784"],
      [/roxo|violeta/i, "#b39ddb"],
      [/azul/i, "#90caf9"],
      [/vermelho/i, "#ef9a9a"],
      [/rosa/i, "#f8bbd0"],
      [/branco/i, "#ffffff"],
      [/dourado|amarelo/i, "#f4d675"],
      [/preto/i, "#9e9e9e"]
    ];
    const panelColor = liturgicalColors.find(([pattern]) => pattern.test(day.liturgicalColor))?.[1] || "#eeeeee";

    return `
      ${renderToolbar(title, subtitle, { back: true })}
      <section class="day-hero" style="--liturgical-background: ${panelColor}" aria-label="Resumo do dia">
        <div class="day-hero-content">
          <div>
            <p class="date-line">${escapeHTML(weekdayFormatter.format(day.date))}</p>
            <h2>${escapeHTML(day.title)}</h2>
            ${tags.length ? `<div class="reading-chips" aria-label="Marcadores do dia">
              ${tags.map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}
            </div>` : ""}
          </div>
          <div class="liturgical-color">
            <span>Cor litúrgica</span>
            <strong>${escapeHTML(day.liturgicalColor)}</strong>
          </div>
        </div>
      </section>
      <div class="${detailGridClass}">
        <div>
          <section class="section-card">
            <div class="section-heading">
              <div>
                <h3>Leituras bíblicas</h3>
                <p>${escapeHTML(day.lectionary || "Leitura diária")}</p>
              </div>
            </div>
            ${renderReadings(day.readings)}
          </section>

          <section class="section-card">
            <div class="section-heading">
              <div>
                <h3>Hinos sugeridos</h3>
                <p>Entrada, resposta e envio</p>
              </div>
            </div>
            ${renderPlainList(day.hymns, "Hinos a cadastrar.")}
          </section>

          <section class="section-card">
            <div class="section-heading">
              <div>
                <h3>Ritos e preparação</h3>
                <p>Quando houver período festivo</p>
              </div>
            </div>
            ${renderPlainList(day.rituals, "Sem rito preparatório cadastrado para este dia.")}
          </section>

          <section class="section-card">
            <div class="section-heading">
              <div>
                <h3>Informações complementares</h3>
                <p>Festas, tempos e rubricas</p>
              </div>
            </div>
            ${renderPlainList(day.feastNotes, "Sem informação complementar cadastrada.")}
          </section>
        </div>
        ${day.isSunday ? renderHomily(day) : ""}
      </div>
    `;
  }

  function renderDayView() {
    state.route = "day";
    return renderDayDetail();
  }

  function render() {
    localStorage.setItem("liturgicalActiveView", state.activeView);
    updateLiturgicalYearBadge();
    navButtons.forEach((button) => {
      const view = button.getAttribute("data-nav-view");
      button.setAttribute("aria-current", state.activeView === view ? "page" : "false");
    });

    if (state.activeView === "day" || state.route === "day") {
      root.innerHTML = renderDayView();
      return;
    }

    state.route = "calendar";
    if (state.activeView === "week") {
      root.innerHTML = renderWeek();
      return;
    }
    root.innerHTML = renderMonth();
  }

  function openDay(iso) {
    const date = fromISO(iso);
    if (!date) return;
    state.selectedDate = iso;
    state.cursorDate = date;
    state.activeView = "day";
    state.route = "day";
    state.homilyOpen = false;
    window.location.hash = `dia/${iso}`;
    render();
  }

  function setCalendarView(view) {
    state.activeView = view;
    state.route = view === "day" ? "day" : "calendar";
    if (view !== "day") {
      window.location.hash = "";
    }
    render();
  }

  function move(direction) {
    if (state.activeView === "month" && state.route !== "day") {
      state.cursorDate = addMonths(state.cursorDate, direction);
      render();
      return;
    }

    if (state.activeView === "week" && state.route !== "day") {
      state.cursorDate = addDays(state.cursorDate, direction * 7);
      render();
      return;
    }

    const selected = fromISO(state.selectedDate) || state.cursorDate;
    const next = addDays(selected, direction);
    state.selectedDate = toISO(next);
    state.cursorDate = next;
    state.homilyOpen = false;
    if (state.activeView === "day") {
      window.location.hash = `dia/${state.selectedDate}`;
    }
    render();
  }

  function goToday() {
    state.selectedDate = todayISO;
    state.cursorDate = today;
    state.homilyOpen = false;
    if (state.activeView === "day") {
      window.location.hash = `dia/${state.selectedDate}`;
    }
    render();
  }

  function readHash() {
    if (forceTodayOnStart) {
      forceTodayOnStart = false;
      state.selectedDate = todayISO;
      state.cursorDate = today;
      state.activeView = "day";
      state.route = "day";
      state.homilyOpen = false;
      window.history.replaceState(null, "", `#dia/${todayISO}`);
      render();
      return;
    }

    const hash = decodeURIComponent(window.location.hash.replace(/^#\/?/, ""));
    if (hash.startsWith("dia/")) {
      const iso = hash.slice(4);
      const date = fromISO(iso);
      if (date) {
        state.selectedDate = iso;
        state.cursorDate = date;
        state.activeView = "day";
        state.route = "day";
      }
    }
    render();
  }

  root.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;

    const openDate = target.getAttribute("data-open-date");
    if (openDate) {
      openDay(openDate);
      return;
    }

    const action = target.getAttribute("data-action");
    if (action === "previous") move(-1);
    if (action === "next") move(1);
    if (action === "today") goToday();
    if (action === "back-calendar") setCalendarView("month");
    if (action === "toggle-homily") {
      state.homilyOpen = !state.homilyOpen;
      render();
    }
    if (action === "set-view") {
      setCalendarView(target.getAttribute("data-view"));
    }
  });

  document.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target.closest('a[href^="anuario-liturgico.html?hoje=1"]');
    if (!target) return;

    event.preventDefault();
    state.activeView = "day";
    state.route = "day";
    goToday();
  });

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setCalendarView(button.getAttribute("data-nav-view"));
    });
  });

  window.addEventListener("hashchange", readHash);

  if ("serviceWorker" in navigator && /^https?:$/.test(window.location.protocol)) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    });
  }

  readHash();
})();
