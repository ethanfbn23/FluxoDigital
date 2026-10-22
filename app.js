'use strict';
const menuButton=document.querySelector('.menu-toggle');
const menu=document.getElementById('navigation');
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');menu.classList.toggle('open',open)});
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Abrir menu')}));
document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>{document.getElementById('service-select').value=link.dataset.service}));
const form=document.getElementById('brief-form');
const briefText=document.getElementById('brief-text');
const status=document.getElementById('form-status');
form.addEventListener('submit',async e=>{
 e.preventDefault();
 if(!form.reportValidity())return;
 const submit=form.querySelector('button[type="submit"]');
 if(submit.disabled)return;
 const values=Object.fromEntries(new FormData(form));
 if(values._honey)return;
 for(const key of Object.keys(values))values[key]=String(values[key]).trim();
 if(!values.nome||!values.empresa||!values.ideia){status.dataset.state='error';status.textContent='Preencha seu nome, sua empresa e a descrição do projeto.';return;}
 values._replyto=values.email;
 const summary=`Olá, Fluxo Digital! Gostaria de um orçamento.\n\nNome: ${values.nome}\nEmpresa: ${values.empresa}\nE-mail: ${values.email}\nWhatsApp: ${values.whatsapp||'Não informado'}\nProjeto: ${values.servico}\n\nMinha ideia:\n${values.ideia}`;
 submit.disabled=true;submit.setAttribute('aria-busy','true');
 const original=submit.innerHTML;submit.textContent='Enviando seu pedido…';
 status.dataset.state='pending';status.textContent='Aguarde enquanto encaminhamos sua solicitação.';
 document.getElementById('brief-result').hidden=true;
 const slowNotice=setTimeout(()=>{status.textContent='O serviço está demorando um pouco. Aguarde nesta página e evite enviar o pedido novamente.';},15000);
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),90000);
 try{
  const response=await fetch('https://formsubmit.co/ajax/fluxodigitalbr@outlook.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(values),signal:controller.signal});
  const data=await response.json();
  if(!response.ok)throw new Error('service');
  if(data.success!==true&&data.success!=='true'){
   if(/activat/i.test(String(data.message)))throw new Error('activation');
   throw new Error('rejected');
  }
  briefText.value=summary;document.getElementById('brief-result').hidden=false;
  status.dataset.state='success';status.textContent='Pedido enviado! Entraremos em contato pelo e-mail ou WhatsApp informado.';
  form.reset();
 }catch(error){
  if(error.message==='activation'||error.message==='rejected'){
   status.dataset.state='error';
   status.textContent=error.message==='activation'?'O formulário ainda está sendo ativado. Envie seu pedido para fluxodigitalbr@outlook.com ou fale pelo WhatsApp.':'O serviço não aceitou o pedido. Seus dados continuam preenchidos. Fale pelo WhatsApp ou pelo e-mail fluxodigitalbr@outlook.com.';
  }else{
   status.dataset.state='pending';
   status.textContent='A confirmação está demorando, mas seu pedido pode ter sido recebido. Para evitar duplicidade, não reenvie agora. Seus dados continuam preenchidos; se precisar, confirme o recebimento pelo WhatsApp ou pelo e-mail fluxodigitalbr@outlook.com.';
   briefText.value=summary;document.getElementById('brief-result').hidden=false;
  }
 }finally{clearTimeout(timeout);clearTimeout(slowNotice);submit.disabled=false;submit.removeAttribute('aria-busy');submit.innerHTML=original;}
});
document.getElementById('copy-brief').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(briefText.value);status.textContent='Pedido copiado! Pronto para colar na conversa.'}catch{briefText.focus();briefText.select();status.textContent='Selecione e copie o texto acima, ou use o botão Baixar resumo.'}});
document.getElementById('download-brief').addEventListener('click',()=>{const blob=new Blob([briefText.value],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='meu-projeto-fluxo-digital.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Resumo preparado para download.'});
