import './componentInsertButton.scss'

const SELECTORS = {
   root: '[data-component="componentInsert"][data-part="root"]',
   openBtn: '[data-action="open-modal"][data-target]'
};
function mountTempBodyContainer(target) {
   const existing = document.querySelector(`[data-temp-admin-menu="${target}"]`);
   if (existing) return existing;
   const el = document.createElement("div");
   el.setAttribute("data-temp-admin-menu", target);
   document.body.appendChild(el);
   return el;
}
async function fetchHtmlMenu({ url, formData, signal }) {
   const resp = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "same-origin",
      headers: {
         "Accept": "application/json"
      },
      signal
   });
   let data = null;
   try {
      data = await resp.json();
   } catch (e) {
      try {
         const text = await resp.text();
         data = { status: "error", html: text };
      } catch (_) {
         data = null;
      }
   }
   return { ok: resp.ok, status: resp.status, data };
}
async function openAdminMenu({ rootEl, triggerEl, signal }) {
   const target = triggerEl.dataset.target;
   if (!target) return;
   const instanceId = triggerEl.dataset.instanceId || "";
   const position = triggerEl.dataset.insertPosition || "after";
   const fd = new FormData();
   fd.append("instance_id", instanceId);
   fd.append("position", position);
   const fetchUrl2 = triggerEl.dataset.fetchUrl;
   try {
      let html = null;
      if (fetchUrl2) {
         const { ok, status, data } = await fetchHtmlMenu({ url: fetchUrl2, formData: fd, signal });
         if (typeof (data == null ? void 0 : data.html) === "string") {
            html = data.html;
         }
         const isSuccess = (data == null ? void 0 : data.status) === "success" || (data == null ? void 0 : data.ok) === true;
         if (!ok || !isSuccess) {
            console.warn("Admin menu fetch returned error:", { fetchUrl: fetchUrl2, ok, status, data });
         }
      } else {
         const res = await loadContent(target, fd);
         if (typeof (res == null ? void 0 : res.html) === "string") {
            html = res.html;
         }
         const isSuccess = (res == null ? void 0 : res.status) === "success" || (res == null ? void 0 : res.ok) === true;
         if (!isSuccess) {
            console.warn("Admin menu loadContent returned error:", res);
         }
      }
      if (typeof html === "string") {
         const containerEl = mountTempBodyContainer(target);
         containerEl.innerHTML = html;
      } else {
         console.warn("Admin menu: no html to insert", { target, fetchUrl: fetchUrl2 });
      }
   } catch (e) {
      if (signal == null ? void 0 : signal.aborted) return;
      console.error("Failed to open admin menu:", e);
   }
}
function mountComponentInsert(rootEl) {
   if (!rootEl) return;
   const ac = new AbortController();
   const { signal } = ac;
   rootEl.addEventListener("click", (e) => {
      const btn = e.target.closest(SELECTORS.openBtn);
      if (!btn || !rootEl.contains(btn)) return;
      if (btn.dataset.target !== "component-insert") return;
      openAdminMenu({ rootEl, triggerEl: btn, signal });
   }, { signal });
   return () => ac.abort();
}
const roots = document.querySelectorAll(SELECTORS.root);
if (roots.length) {
   roots.forEach((rootEl) => {
      mountComponentInsert(rootEl);
   });
}