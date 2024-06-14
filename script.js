var password = [];
var key;

/*
Descriptografa os dados passado no parametro. Retorna uma Promise que resolve com os dados prontos no formato Uint8Array
@param {Uint8Array} encrypted - os dados a serem descriptografados
*/
function decrypt(encrypted){
   return new Promise((resolve, reject) => {
      window.crypto.subtle.decrypt(
         {
            name: "AES-GCM",
            iv: encrypted.slice(encrypted.length - 12)
         },
         key,
         encrypted.slice(0, encrypted.length - 12)
      ).then(decrypted => {
         resolve(decrypted);
         return 1;
      }).catch(error => {
         reject(error);
      });
   });
}
/*
Criptografa os dados passado no parametro. Retorna uma Promise que resolve com os dados prontos no formato Uint8Array
@param {Uint8Array} encoded - os dados a serem criptografados
*/
function encrypt(encoded){
   return new Promise((resolve, reject) => {
      let iv = window.crypto.getRandomValues(new Uint8Array(12));
      window.crypto.subtle.encrypt(
         {name: "AES-GCM", iv: iv},
         key,
         encoded
      ).then(buffer => {
         var encryptedWIV = new Uint8Array(buffer.byteLength + iv.length);
         const encrypted = new Uint8Array(buffer);
         encryptedWIV.set(encrypted);
         encryptedWIV.set(iv, encrypted.length);
         resolve(encryptedWIV);
      }).catch(error => {
         reject(error);
      });
   });
}
/*
Retorna a referência de um elemento HTML
*/
function $(id){
   return document.getElementById(id);
}
/*
Cria e retorna um elemento HTML descrito no parametro. O parâmetro é uma sequencia de strings
@example tag('div')
@example tag('div', 'id')
@example tag('div', 'id', 'innerHTML')
@example tag('div', 'id', 'innerHTML', 'class')
*/
function tag(...t){
   let n = document.createElement(t[0]);
   if(t.length >= 2 && t[1] != null){
      n.setAttribute('id', t[1]);
   }
   if(t.length >= 3 && t[2] != null){
      n.innerHTML = t[2];
   }
   if(t.length >= 4 && t[3] != null){
      n.setAttribute('class', t[3]);
   }
   return n;
}
/*
Baixa as funções, descriptografa. Retorna uma Promise que resolve com o código javascript em texto
*/
function getFunctions(){
   return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'arraybuffer';
      xhr.open('GET', 'f.js', true);
      xhr.onreadystatechange = function() {
         if(xhr.readyState == 4 && xhr.status == 200){
            decrypt(new Uint8Array(xhr.response)).then(decrypted => {
               resolve(new TextDecoder().decode(decrypted));
            }).catch(error => {
               reject(error);
            });
         }
      }
      xhr.send();
   });
}
/*
Controla o botão de login para permitir clique somente ao detectar uma senha de 32 caracteres
*/
function maskOfPass(){
   if($('pass').value.length == 32){
      $('send').removeAttribute('disabled');
      $('send').classList.remove('off');
      $('send').classList.add('on');
   }else{
      $('send').setAttribute('disabled', '');
      $('send').classList.remove('on');
      $('send').classList.add('off');
   }
}
/*
Salva a senha de acesso localmente
*/
function login(){
   sessionStorage.setItem('pass', $('pass').value);
   window.location.reload(false);
}
/*
Adiciona 1 ou mais elementos HTML ao body da página
*/
function addToBody(...node){
   for(var i = 0; i < node.length; i++){
      document.body.appendChild(node[i]);
   }
}
/*
Exibe o formulário de login na página
*/
function showLogin(){
   var div = tag('div', 'container');
   var h1 = tag('h1', null, '📻');
   var input = tag('input', 'pass');
   input.setAttribute('oninput', 'maskOfPass()');
   input.setAttribute('type', 'password');
   input.setAttribute('minlength', '32');
   input.setAttribute('maxlength', '32');
   var bt = tag('button', 'send', 'Entrar', 'bt off');
   bt.setAttribute('onclick', 'login()');
   bt.setAttribute('disabled', '');
   div.appendChild(h1);
   div.appendChild(input);
   div.appendChild(bt);
   addToBody(div);
}
/*
Emite um aviso. Remover em breve
*/
function dft(){
   alert('Calma! Essa função ainda não está disponível. Em breve eu libero.')
}
window.addEventListener('DOMContentLoaded', (event) => {
   if(!sessionStorage.getItem('pass')){
      showLogin();
   }else{
      sessionStorage.getItem('pass').split('').forEach(element => {
         password.push(element.charCodeAt(0));
      });
      window.crypto.subtle.importKey('raw', new Uint8Array(password), 'AES-GCM', true, ['encrypt', 'decrypt']).then(pass => {
         key = pass;
         getFunctions().then(plain => {
            (0, eval)(plain);
            document.title = 'Bem vindo';
            newToken().then(token => {
               getDB(token).then(dbase => {
                  let script = window.location.pathname.split('/').pop();
                  db = dbase;
                  if(script == 'upload.html'){
                     showInput();
                  }
                  if(script == 'index.html'){
                     showIndex();
                  }
                  if(script == 'player.html'){
                     showPlayer();
                  }
               });
            });
         }).catch(error => {
            alert('Senha incorreta.');
            password = [];
            sessionStorage.removeItem('pass');
            window.location.reload(false);
         });
      });
   }
});
//window.onbeforeunload = (e) => {
//   e.returnValue = true;
//   return true;
//};
// Criar pagina update.html para fazer alterações especificas nos dados