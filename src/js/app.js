// Universal form persistence by [name] <-> localStorage[name]
// data-persist="off" - вимикає авто-збереження
(function () {
   // Безпека: не зберігаємо чутливі поля
   const SENSITIVE_RE = /(pass(word)?|token|otp|cvv|cvc|iban|card(number)?|cc|ssn|pin|secret|auth|2fa|exp|expiry)/i;

   // Мінімальний debounce для записів
   const DEBOUNCE_MS = 250;
   const timers = new Map(); // name -> timeoutId

   // Перевірка доступності localStorage
   let storage = null;
   try {
      const testKey = "__persist_test__";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      storage = localStorage;
   } catch (e) {
      // Якщо немає localStorage — тихо виходимо
      return;
   }

   // Зібрати всі поля з name
   const q = 'input[name], select[name], textarea[name]';
   const byName = new Map(); // name -> [elements]

   function shouldPersist(el) {
      if (!el || el.dataset.persist === "off") return false;
      const name = el.getAttribute("name");
      if (!name) return false;

      const type = (el.getAttribute("type") || "").toLowerCase();

      // Не зберігаємо чутливі або службові поля
      if (
         type === "password" ||
         type === "file" ||
         type === "button" ||
         type === "submit" ||
         type === "reset" ||
         type === "image"
      ) {
         return false;
      }

      if (SENSITIVE_RE.test(name)) return false;

      return true;
   }

   function register(el) {
      if (!shouldPersist(el)) return;
      const name = el.name;
      if (!byName.has(name)) byName.set(name, []);
      const arr = byName.get(name);
      if (!arr.includes(el)) arr.push(el);

      // Лістенери оновлення
      const handler = () => saveNameDebounced(name);
      el.addEventListener("input", handler, { passive: true });
      el.addEventListener("change", handler);
   }

   function collectInitial() {
      document.querySelectorAll(q).forEach(register);
   }

   // Серіалізація значення групи по name
   function serialize(name) {
      const els = byName.get(name) || [];
      if (!els.length) return null;

      // radio-групи
      if (els[0].type && els[0].type.toLowerCase() === "radio") {
         const checked = els.find(e => e.checked);
         return checked ? checked.value : null;
      }

      // checkbox-и
      const checkboxes = els.filter(e => e.type && e.type.toLowerCase() === "checkbox");
      if (checkboxes.length) {
         if (checkboxes.length === 1) {
            // Один checkbox -> зберігаємо boolean
            return !!checkboxes[0].checked;
         } else {
            // Кілька з однаковим name -> масив значень обраних
            return checkboxes.filter(e => e.checked).map(e => e.value);
         }
      }

      // select[multiple]
      const selects = els.filter(e => e.tagName === "SELECT");
      if (selects.length === 1 && selects[0].multiple) {
         return Array.from(selects[0].selectedOptions).map(o => o.value);
      }

      // За замовчуванням: якщо кілька полів з одним name (рідко), беремо перше видиме
      const visible = els.find(e => e.offsetParent !== null) || els[0];
      return visible.value;
   }

   // Відновлення значення групи по name
   function deserialize(name, raw) {
      const els = byName.get(name) || [];
      if (!els.length) return;

      // Захист: ніколи не намагаємося виставити value для input[type="file"]
      const firstType = (els[0].getAttribute("type") || "").toLowerCase();
      if (firstType === "file") return;

      let val = raw;
      // Ми завжди записуємо JSON. Якщо колись записували «сирий» рядок — спробуємо парсити та fallback.
      try { val = JSON.parse(raw); } catch (_) { }

      // radio
      if (els[0].type && els[0].type.toLowerCase() === "radio") {
         els.forEach(e => { e.checked = (e.value === val); });
         return;
      }

      // checkbox-и
      const checkboxes = els.filter(e => e.type && e.type.toLowerCase() === "checkbox");
      if (checkboxes.length) {
         if (checkboxes.length === 1) {
            checkboxes[0].checked = !!val;
         } else {
            const set = new Set(Array.isArray(val) ? val : []);
            checkboxes.forEach(e => { e.checked = set.has(e.value); });
         }
         return;
      }

      // select[multiple]
      const selects = els.filter(e => e.tagName === "SELECT");
      if (selects.length === 1 && selects[0].multiple) {
         const set = new Set(Array.isArray(val) ? val : []);
         Array.from(selects[0].options).forEach(o => { o.selected = set.has(o.value); });
         return;
      }

      // За замовчуванням — ставимо value першому видимому
      const visible = els.find(e => e.offsetParent !== null) || els[0];
      if (typeof val === "string" || typeof val === "number") {
         visible.value = String(val);
      }
   }

   function saveName(name) {
      if (!byName.has(name)) return;
      const value = serialize(name);
      if (value === null || value === undefined) return;
      try {
         storage.setItem(name, JSON.stringify(value));
      } catch (e) {
         // Якщо переповнення або інша помилка — тихо ігноруємо
      }
   }

   function saveNameDebounced(name) {
      if (timers.has(name)) clearTimeout(timers.get(name));
      const id = setTimeout(() => {
         timers.delete(name);
         saveName(name);
      }, DEBOUNCE_MS);
      timers.set(name, id);
   }

   function restoreAll() {
      for (const [name] of byName) {
         const raw = storage.getItem(name);
         if (raw !== null) {
            deserialize(name, raw);
         }
      }
   }

   // MutationObserver — підключати лістенери до нових полів
   const mo = new MutationObserver((muts) => {
      muts.forEach(m => {
         m.addedNodes && m.addedNodes.forEach(node => {
            if (!(node instanceof Element)) return;
            if (node.matches && node.matches(q)) register(node);
            node.querySelectorAll && node.querySelectorAll(q).forEach(register);
         });
      });
   });

   function boot() {
      collectInitial();
      restoreAll();
      mo.observe(document.documentElement, { childList: true, subtree: true });
   }

   if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot, { once: true });
   } else {
      boot();
   }

   // Опціонально: очищення для форми з атрибутом data-persist-clear-on-reset
   document.addEventListener("reset", (e) => {
      const form = e.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!form.matches('[data-persist-clear-on-reset]')) return;

      const fields = form.querySelectorAll(q);
      const names = new Set();
      fields.forEach(f => { if (shouldPersist(f)) names.add(f.name); });
      names.forEach(name => storage.removeItem(name));
   });
})();