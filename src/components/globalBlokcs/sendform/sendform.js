import "./sendform.scss"
import { loadContent } from '../../globalBlokcs/fetch/fetch.js'


export function sendForm(event) {
   if (event.target.type == "submit" && event.target.closest("[data-send-form]")) {
      event.preventDefault();
      const form = event.target.form;
      const modal = event.target.closest('[data-name="contact-form-modal"]');
      if (form) {
         if (isRequired(form)) {
            const formData = new FormData(form);
            if (form.getAttribute("name")) {
               formData.append("formName", form.getAttribute("name"));
            }
            if (modal) {
               modal.classList.remove("_view");
            }
            loadContent("submit", formData, "body", "form");
         }
      }
   }
}
function isRequired(form) {

   const requiredInputs = form.querySelectorAll("[required]");

   let result = null;
   if (requiredInputs.length > 0) {
      requiredInputs.forEach((requiredInput) => {

         requiredInput.addEventListener("focus", (event) => {
            const focusInput = event.target;
            focusInput.classList.remove("wrongValue");
            focusInput.style.backgroundColor = null;
         });
         requiredInput.addEventListener("blur", (event) => {
            const blurInput = event.target;
            if (!blurInput.value) {
               blurInput.classList.add("wrongValue");
               blurInput.style.backgroundColor = "#F7931E";
            }
         });
         if (requiredInput.value && result == false) {
            return result = false;
         }
         if (requiredInput.value) {
            return result = true;
         }
         if (!requiredInput.value) {
            requiredInput.classList.add("wrongValue");
            requiredInput.style.backgroundColor = "#F7931E";

            return result = false;
         }
      });
   }
   return result;
}
