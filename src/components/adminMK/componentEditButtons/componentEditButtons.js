import './componentEditButtons.scss'

/**
 * Fetch helper that expects either JSON { status, html } or plain HTML.
 * Returns { ok, html }.
 */
async function fetchMenuHtml(url, formData, { signal } = {}) {
   const res = await fetch(url, {
      method: 'POST',
      body: formData,
      signal,
      headers: {
         'X-Requested-With': 'fetch',
      },
   });

   const contentType = res.headers.get('content-type') || '';

   // Try JSON first
   if (contentType.includes('application/json')) {
      const data = await res.json().catch(() => null);
      const html = data && (data.html || data.data?.html || '');
      return { ok: res.ok && !!html, html: html || '', data };
   }

   // Fallback: treat as HTML/text
   const text = await res.text();
   return { ok: res.ok && !!text, html: text || '', data: null };
}

function insertHtmlToBody(html) {
   if (!html) return;

   // Remove previous menu if it exists (single menu policy)
   const existing = document.querySelector(
      '[data-name="component-edit-menu"], [data-component="component_edit_menu"], [data-component="componentEditMenu"]'
   );
   if (existing) existing.remove();

   document.body.insertAdjacentHTML('beforeend', html);
}

function mountComponentEditButtons(rootEl) {
   if (!rootEl) return;

   const ac = new AbortController();
   const { signal } = ac;

   rootEl.addEventListener(
      'click',
      async (e) => {
         const toggle = e.target.closest('[data-action="toggle-admin-panel"]');
         if (toggle && rootEl.contains(toggle)) {
            e.preventDefault();
            const targetName = toggle.dataset.target || '';
            const panel = targetName
               ? rootEl.querySelector(`[data-name="${CSS.escape(targetName)}"]`)
               : null;
            if (!panel) {
               console.warn('Admin panel toggle: target panel not found', { targetName });
               return;
            }
            panel.classList.toggle('_view');
            return;
         }

         const trigger = e.target.closest('[data-action="open-admin-menu"]');
         if (!trigger || !rootEl.contains(trigger)) return;

         e.preventDefault();

         const fetchUrl = trigger.dataset.target || '';
         const instanceId = trigger.dataset.instanceId || '';
         const pageId = trigger.dataset.pageId || '';
         const componentId = trigger.dataset.componentId || '';

         if (!fetchUrl) {
            console.warn('Admin menu open: missing data-target (fetch url)');
            return;
         }

         // instance_id is required for edit menu
         if (!instanceId) {
            console.warn('Admin menu open: missing instance_id', { fetchUrl, pageId, componentId });
            return;
         }

         const fd = new FormData();
         fd.append('instance_id', instanceId);
         if (pageId) fd.append('page_id', pageId);
         if (componentId) fd.append('component_id', componentId);

         try {
            const { ok, html, data } = await fetchMenuHtml(fetchUrl, fd, { signal });
            if (!ok) {
               console.error('Admin menu fetch failed', { fetchUrl, ok, data });
               return;
            }
            insertHtmlToBody(html);
         } catch (err) {
            if (err?.name === 'AbortError') return;
            console.error('Admin menu fetch error', err);
         }
      },
      { signal }
   );

   return () => ac.abort();
}

// Auto-mount (multiple component instances)
const roots = document.querySelectorAll('[data-component="componentEditButtons"][data-part="root"]');
if (roots.length) {
   const cleanups = [];

   roots.forEach((rootEl) => {
      const cleanup = mountComponentEditButtons(rootEl);
      if (typeof cleanup === 'function') cleanups.push(cleanup);
   });

   if (import.meta.hot && cleanups.length) {
      import.meta.hot.dispose(() => {
         cleanups.forEach((fn) => {
            try {
               fn();
            } catch (_) { }
         });
      });
   }
}

export { mountComponentEditButtons };
