'use strict';

var API_ENDPOINT = "http://104.236.209.84:8080";

console.log("I'm here !");

// Usando localStorage para armazenar dados
var storage = window.localStorage;
var API_ENDPOINT = storage.getItem("API_ENDPOINT"); // Pass a key name to get its value.
if (storage.getItem("API_ENDPOINT") === null) {
    API_ENDPOINT = "http://104.236.209.84:8080";
    storage.setItem("API_ENDPOINT", API_ENDPOINT);
}
console.log("API_ENDPOINT:" + API_ENDPOINT);

function salvar() {
    var http = new XMLHttpRequest();
    http.withCredentials = true;

    var username = document.getElementById("identificacao").value;
    var password = document.getElementById("senha").value;
    console.log("funcao=salvar param=identificacao valor=" + username);
    console.log("funcao=salvar param=senha valor=" + password);

    http.open("GET",API_ENDPOINT + "/authenticator/preferencias", true, username, password);
    http.responseType = 'json';
    http.send("");
    http.onload = function() {
        if (http.status == 200) {
            storage.setItem("USER", username);
            storage.setItem("PASS", password);
            console.log("funcao=salvar resulado=sucesso");
            alert("Entrada registrada com com sucesso");
            return http.status;
        } else {
            console.log("funcao=salvar resulado=falha");
            alert("Não foi possível registrar entrada");
            return http.status;
        }
    }
}

function verifica_credenciais_salvas() {

    var div = document.getElementById("salvar_status");

    if (storage.getItem("USER") === null) {
        var texto = "<p>Seu usuário não está salvo ainda.</p>";
        div.insertAdjacentHTML("beforeend", texto);
    } else {
        var texto = "<p>Seu usuário '" + storage.getItem("USER") + "' foi salvo.</p>";
        div.insertAdjacentHTML("beforeend", texto);
    }
    if (storage.getItem("PASS") === null) {
        var texto = "<p>Sua senha não está salva ainda.</p>";
        div.insertAdjacentHTML("beforeend", texto);
    } else {
        var texto = "<p>Sua senha foi salvo.</p>";
        div.insertAdjacentHTML("beforeend", texto);
    }
    return true;
}


function entrada() {
    var http = new XMLHttpRequest();

    if (storage.getItem("USER") === null) {
        alert("Você não fez login ou suas credencias estão erradas. Atualize-as");
    }
    if (storage.getItem("PASS") === null) {
        alert("Você não fez login ou suas credencias estão erradas. Atualize-as");
    }

    var username = storage.getItem("USER");
    var password = storage.getItem("PASS");
    console.log("funcao=entrada param=identificacao valor=" + username);
    console.log("funcao=entrada param=senha valor=" + password);

    http.open("POST",API_ENDPOINT + "/authenticator/entrada/", true, username, password);
    http.send("");
    http.onload = function() {
        if (http.status == 204) {
            storage.setItem("USER", username);
            storage.setItem("PASS", password);
            console.log("funcao=entrada resulado=sucesso");
            alert("Entrada registrada com com sucesso");
            return http.status;
        } else {
            console.log("funcao=entrada resulado=falha");
            alert("Não foi possível registrar entrada");
            return http.status;
        }
    }
}




function saida() {
    var http = new XMLHttpRequest();

    if (storage.getItem("USER") === null) {
        alert("Você não fez login ou suas credencias estão erradas. Atualize-as");
    }
    if (storage.getItem("PASS") === null) {
        alert("Você não fez login ou suas credencias estão erradas. Atualize-as");
    }

    var username = storage.getItem("USER");
    var password = storage.getItem("PASS");
    console.log("funcao=saida param=identificacao valor=" + username);
    console.log("funcao=saida param=senha valor=" + password);

    http.open("POST",API_ENDPOINT + "/authenticator/saida/", true, username, password);
    http.send("");
    http.onload = function() {
        if (http.status == 204) {
            storage.setItem("USER", username);
            storage.setItem("PASS", password);
            console.log("funcao=saida resulado=sucesso");
            alert("Saída registrada com com sucesso");
            return http.status;
        } else {
            console.log("funcao=saida resulado=falha");
            alert("Não foi possível registrar saída");
            return http.status;
        }
    }
}

function preferencias() {
    var http = new XMLHttpRequest();
    var div = document.getElementById("preferencias_lista");

    if (storage.getItem("USER") === null) {
        console.log("funcao=preferencias resulado=falha");
        alert("Não foi possível recuperar identificação para obter preferências");
    }
    if (storage.getItem("PASS") === null) {
        console.log("funcao=preferencias resulado=falha");
        alert("Não foi possível recuperar senha para obter preferências");
    }

    var username = storage.getItem("USER");
    var password = storage.getItem("PASS");
    console.log("funcao=preferencias param=identificacao valor=" + username);
    console.log("funcao=preferencias param=senha valor=" + password);

    http.open("GET",API_ENDPOINT + "/authenticator/preferencias", true, username, password);
    http.responseType = 'json';
    http.send("");
    http.onload = function() {
        if (http.status == 200) {
            var preferencias = http.response;
            for (var j = 0; j < preferencias.length; j++){
                var texto = `<div class="mdl-grid">
                                <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-phone mdl-cell--8-col-tablet">
                                    <div class="mdl-card mdl-shadow--2dp">
                                        <div class="mdl-card__title mdl-card--expand"><h2 class="mdl-card__title-text">` + preferencias[j].nome_laboratorio + `</h2></div>
                                        <div class="mdl-card__supporting-text">
                                        <p>Temperatura: min ` + preferencias[j].temperatura_min + `, max ` + preferencias[j].temperatura_max + `</p>
                                        <p>Luminosidade: min ` + preferencias[j].luminosidade_min + `, max ` + preferencias[j].luminosidade_max + `</p>
                                        <p>Umidade: min ` + preferencias[j].umidade_min + `, max ` + preferencias[j].umidade_max + `</p>
                                        </div>
                                        <div class="mdl-card__actions mdl-card--border">
                                            <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">EDITAR</a>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                div.insertAdjacentHTML("beforeend", texto);
            }
            console.log("funcao=preferencias resulado=sucesso");
            return preferencias;
        } else {
            console.log("funcao=preferencias resulado=falha");
            alert("Não foi possível obter preferencias");
            return http.status;
        }  
    }
}

function select_nome_laboratorio() {
    console.log("action=select_nome_laboratorio result=init");
    var ul = document.getElementById("laboratorio_lista");

    if (storage.getItem("USER") === null) {
        console.log("funcao=select_nome_laboratorio resulado=falha");
        alert("Não foi possível recuperar identificação para obter laboratorios");
    }
    if (storage.getItem("PASS") === null) {
        console.log("funcao=select_nome_laboratorio resulado=falha");
        alert("Não foi possível recuperar senha para obter laboratorios");
    }

    var username = storage.getItem("USER");
    var password = storage.getItem("PASS");
    console.log("funcao=select_nome_laboratorio param=identificacao valor=" + username);
    console.log("funcao=select_nome_laboratorio param=senha valor=" + password);

    var http = new XMLHttpRequest();
    http.open("GET",API_ENDPOINT + "/authenticator/preferencias", true, username, password);
    http.responseType = 'json';
    http.send("");
    http.onload = function() {
        if (http.status == 200) {
            var preferencias = http.response;
            for (var j = 0; j < preferencias.length; j++){
                var li = document.createElement("li");
                li.appendChild(document.createTextNode(preferencias[j].nome_laboratorio));
                li.setAttribute("class", "mdl-menu__item");
                li.setAttribute("data-val",preferencias[j].id_laboratorio);
                ul.appendChild(li);
            }
            console.log("funcao=select_nome_laboratorio resulado=sucesso");
            return preferencias;
        } else {
            console.log("funcao=select_nome_laboratorio resulado=falha");
            alert("Não foi possível obter preferencias");
            return http.status;
        }  
    }
}

function notificacoes() {
    var http = new XMLHttpRequest();
    var div = document.getElementById("notificacoes_lista");

    if (storage.getItem("USER") === null) {
        console.log("funcao=notificacoes resulado=falha");
        alert("Não foi possível recuperar identificação para obter notificações");
    }
    if (storage.getItem("PASS") === null) {
        console.log("funcao=notificacoes resulado=falha");
        alert("Não foi possível recuperar senha para obter notificações");
    }

    var username = storage.getItem("USER");
    var password = storage.getItem("PASS");
    console.log("funcao=notificacoes param=identificacao valor=" + username);
    console.log("funcao=notificacoes param=senha valor=" + password);

    http.open("GET",API_ENDPOINT + "/authenticator/notificacoes", true, username, password);
    http.responseType = 'json';
    http.send("");
    http.onload = function() {
        if (http.status == 200) {
            var notificacoes = http.response;
            for (var j = 0; j < notificacoes.length; j++){
                var texto = `<li class="mdl-list__item mdl-list__item--three-line">
                                <span class="mdl-list__item-primary-content">
                                <i class="material-icons mdl-list__item-avatar">notifications</i>
                                <span>` + notificacoes[j].titulo + `</span>
                                <span class="mdl-list__item-text-body">` + notificacoes[j].mensagem + `</span>
                                </span>
                                <span class="mdl-list__item-secondary-content">
                                <a class="mdl-list__item-secondary-action" href="#"><i class="material-icons">check box</i></a>
                                </span>
                            </li>`;
                div.insertAdjacentHTML("beforeend", texto);
            }
            console.log("funcao=notificacoes resulado=sucesso");
            return notificacoes;
        } else {
            console.log("funcao=notificacoes resulado=falha");
            alert("Não foi possível obter notificações");
            return http.status;
        }  
    }
}