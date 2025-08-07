import './footer.scss'

export function footerForm(event) {
   event.preventDefault();

   //const Languge = getParam('language');
   const Languge = document.documentElement.lang;
   const form = document.querySelector('#formFooter');
   console.log(form)
   const name = form.querySelector('[name = name]');
   const eMail = form.querySelector('[name = eMail]');
   const tel = form.querySelector('[name = tel]');
   const text = form.querySelector('[name = text]');

   name.onclick = () => { name.style.backgroundColor = null };
   if (name.value == "") {
      name.style.backgroundColor = '#F7931E';
      return;
   }

   eMail.onclick = () => { eMail.style.backgroundColor = null };
   if (eMail.value == "") {
      eMail.style.backgroundColor = '#F7931E';
      return;
   }

   tel.onclick = () => { tel.style.backgroundColor = null };
   if (tel.value == "") {
      tel.style.backgroundColor = '#F7931E';
      return;
   }

   text.onclick = () => { text.style.backgroundColor = null };
   if (text.value == "") {
      text.style.backgroundColor = '#F7931E';
      return;
   }

   const formData = new FormData(form);

   // Додаємо до форми строку данних для наскрізної аналітики
   formData.append('trace', b24Tracker.guest.getTrace());

   const url = "/userCard/footerForm/";

   includePhpFile1(url, formData)
      .then((data) => {
         // form.innerHTML = data;
         // console.log(data);
      });

   if (Languge == null) {
      alert('Спасибо за сообщение, в ближайшее время с Вами свяжется наш специалист');
   } else {
      alert("Дякуємо за повідомлення, найближчим часом з Вами зв'яжеться наш спеціаліст");
   }
   // form.innerHTML = data;
   // console.log(formData);
}