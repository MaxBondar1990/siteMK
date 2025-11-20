import './sectionSelectMenu.scss'

//classList add _view to stile create menu get section number and create hidden input "section number"
export function viewSectionSelectMenu(nuberOfSection) {
   fetchUrl.loadContent("section_selectMenu", { sectionNumber: nuberOfSection });
}

export function close(event) {
   if (event.target.closest('[name="close-section-select-menu"]')) {
      const SECTION_SELECT_MENU = event.target.closest('[data-name="section-select-menu"]');
      if (SECTION_SELECT_MENU) {
         // SECTION_SELECT_MENU.classList.remove('[data-name="section-select-menu"]');
         setTimeout(() => {
            document.querySelector('[data-name="section-select-menu"]')?.remove();
        }, 200);
         return;
      }
      alert('cannont close SECTION_SELECT_MENU is epsent on document');
   }
}

export function buttonViewSectionCreateMenu(event) {
   if (event.target.closest('[data-button-name="section-create"]')) {
      fetchUrl.loadContent("section_createModalWindow");
   }
}

export function viewSectionModerationMenu(event) {
   if (event.target.closest('[data-button-name="view-section-moderation-menu"]') || event.target.closest('[data-name="confirm-alarm-section-select-moderation-view"]')) {
      fetchUrl.loadContent("section_moderationMenu");
   }

   if (event.target.closest('[data-button="close-section-moderation-menu"]')) {
      const MENU = event.target.closest('[data-name="section-moderation-menu"]')
      if (MENU) {
         setTimeout(() => {
            MENU.remove();
        }, 200);
         return;
      }
   }
}

function create_hidden_input(name, value) {
   const input = document.createElement("input");
   input.setAttribute("name", name);
   input.setAttribute("value", value);
   input.setAttribute("type", 'hidden');
   return input;
}

// export function viewAlarm(event) {
//    const BUTTON_EDIT = event.target.closest('[data-name="view-alarm-section-select-moderation-view"]');
//    if (BUTTON_EDIT) {
//       const SECTION_SELECT_MENU = event.target.closest('[data-name="section-select-menu"]');
//       if (SECTION_SELECT_MENU) {
//          const ALARM_MENU = SECTION_SELECT_MENU.querySelector('[data-name="alarm-section-select-moderation-view"]');
//          if (ALARM_MENU) {
//             fetchUrl.loadContent("alarm_sectionSelectModerationView");

//             // ALARM_MENU.classList.add('_view');
//          } else {
//             alert('alarm-section-select-moderation-view не знайдено!');
//          }
//       } else {
//          alert('section-select-menu не знайдено!');
//       }
//    }
// }

export function viewAlarm(event) {
      if (event.target.closest('[data-name="view-alarm-section-select-moderation-view"]')) {
         fetchUrl.loadContent("alarm_sectionSelectModerationView");

      }
}

export function closeAlarm(event) {
   const BUTTON_CLOSE = event.target.closest('[name="close-alarm-section-select-moderation-view"');
   const BUTTON_CONFIRM = event.target.closest('[data-name="confirm-alarm-section-select-moderation-view"');

   const BUTTON_REJECT = event.target.closest('[data-name="reject-alarm-section-select-moderation-view"]');
   if (BUTTON_CLOSE || BUTTON_REJECT || BUTTON_CONFIRM) {
      const ALARM_MENU = event.target.closest('[data-name="alarm-section-select-moderation-view"]');
      if (ALARM_MENU) {
         setTimeout(() => {
            ALARM_MENU.remove();
        }, 200);
         // ALARM_MENU.classList.remove('_view');
      } else {
         alert('alarm-section-select-moderation-view не знайдено!');
      }
   }
}

// export function viewUpdButtons(event) {
//    const PREVIEW = event.target.closest('[data-name="preview-activ-section"]');
//    if (PREVIEW) {
//       const SECTION_SELECT_MENU = event.target.closest('[data-name="section-tile"]');
//       if (SECTION_SELECT_MENU) {
//          const CONFIRMS = SECTION_SELECT_MENU.querySelectorAll('[data-name="activ-section"]');
//          CONFIRMS.forEach(element => {
//             if (element) {
//                element.classList.add('_preview');
//             } else {
//                alert('Звернітся до адміністратора!');
//             }
//          });
//       }
//       PREVIEW.classList.remove('_preview');
//    }
// }
export function viewUpdButtons(event) {
   const TILES = event.target.closest('[data-name="section-tiles"]');
   const CARD = event.target.closest('[data-name="section-card"]');

   if (TILES) {
      const PREVIEW_TILES = TILES.querySelectorAll('[data-name="active-section-preview"]');
      PREVIEW_TILES.forEach(element => {
         if (element) {
            element.classList.add('_preview');
         } else {
            alert('Звернітся до адміністратора!');
         }
      });
   }
   if (CARD) {
      const PREVIEW_CARD = CARD.querySelectorAll('[data-name="active-section-preview"]');
      PREVIEW_CARD.forEach(element => {
         if (element) {
            element.classList.remove('_preview');
         } else {
            alert('Звернітся до адміністратора!');
         }
      });
      PREVIEW_CARD.classList.add('_preview');
   }
}

export function viewSectionSettingsModal(event) {
   const GEAR_BUTTON = event.target.closest('[data-name="section-select-menu__dell-section-btn"]');
   if (GEAR_BUTTON) {
      const SECTION_SELECT_MENU = event.target.closest('[data-name="section-select-menu"]');
      if (SECTION_SELECT_MENU) {
         const SECTION_SETTING_MODAL = SECTION_SELECT_MENU.querySelector('[data-name="section-settings-modal-view"]');
         SECTION_SETTING_MODAL.classList.add('_view');
      } else {
         alert('Звернітся до адміністратора!');
      }
   }
}

export function closeSectionSettingsModal(event) {
   const CLOSE_BUTTON = event.target.closest('[name="close-section-select-menu-view"]');
   if (CLOSE_BUTTON) {
      const SECTION_SETTING_MODAL = event.target.closest('[data-name="section-settings-modal-view"]');
      if (SECTION_SETTING_MODAL) {
         SECTION_SETTING_MODAL.classList.remove('_view');
      } else {
         alert('Звернітся до адміністратора!');
      }
   }
}

// export function addClasses(event) {
//    const MODERATION_MENU = document.querySelector('[data-name="section-moderation-menu"]');
//    if (MODERATION_MENU) {
//       const TEXTAREA = MODERATION_MENU.querySelector('[data-name="max-height"]');
//       const TEXTAREA_SCALE_BTN = MODERATION_MENU.querySelector('[button-data-name="scale_up"]');
//       if (event.target.closest('[button-data-name="scale_up"]')) {
//          if (TEXTAREA.classList.contain('_max-height')){
//             TEXTAREA.classList.remove('_max-height');
//             TEXTAREA_SCALE_BTN.classList.remove('_scale_up');
//          } else {
//             TEXTAREA.classList.add('_max-height');
//             TEXTAREA_SCALE_BTN.classList.add('_scale_up');
//          }
//          }
//    // console.log(TEXTAREA)
//    }
// }

export function addClasses(event) {
   const MODERATION_MENU = document.querySelector('[data-name="section-moderation-menu"]');
   if (MODERATION_MENU) {
      const VIEW_ACTIVE = MODERATION_MENU.querySelector('[data-name="view-active"]');
      const VIEW_NEW = MODERATION_MENU.querySelector('[data-name="view-new"]');
      const button = MODERATION_MENU.querySelector('[data-button="view"]');

      if (event.target.closest('[data-name="view-new"]')) {
            button.classList.remove('_diplay-none');
         if (!VIEW_NEW.classList.contains('_max-height')) {
            VIEW_ACTIVE.classList.add('_min-height');
            VIEW_NEW.classList.add('_max-height');
         }
      }
      if (event.target.closest('[data-name="view-active"]')) {
         if (VIEW_ACTIVE.classList.contains('_min-height')) {
            VIEW_ACTIVE.classList.remove('_min-height');
            VIEW_NEW.classList.remove('_max-height');
         }
      }
      // console.log(TEXTAREA)
   }
}
// додаємо слухач на клік по документу
document.addEventListener('click', close);