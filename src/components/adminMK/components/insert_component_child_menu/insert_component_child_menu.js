import './insert_component_child_menu.scss';
import { loadContent } from '../../../globalBlokcs/fetch/fetch.js';

const SELECTORS = {
   root: '[data-component="insert-component-child-menu"][data-part="root"]',
   content: '[data-part="content"]',
   url: '/admin/html/insert-component-child-form/',
};

export function openInsertMenu(menuRoot) {
   if (!menuRoot) return;
   menuRoot.classList.add('_view');
}

/**
 * The ONLY responsibility of this widget:
 * - perform fetch
 * - inject returned html into content
 */
export async function fetchAndInsert({ menuRoot, formData }) {
   if (!menuRoot) return;

   const content = menuRoot.querySelector(SELECTORS.content);
   if (!content) return;

   content.innerHTML = '<p style="margin:0;padding:8px;">Завантаження…</p>';

   const res = await loadContent(SELECTORS.url, formData || new FormData(), null, 'json');

   if (!res || res.status !== 'ok') {
      content.innerHTML = '<p style="margin:0;padding:8px;">Помилка завантаження.</p>';
      return;
   }

   content.innerHTML = res.html || '';
}

export function findInsertMenu(scope = document) {
   return scope.querySelector(SELECTORS.root);
}