document.addEventListener('deviceready', onDeviceReady, false);

//#region Login Credentials
function hasLoginCredentials() {
    return window.localStorage.getItem('username') !== null || window.localStorage.getItem('password') !== null;
}

function clearLoginCredentials() {
    window.localStorage.removeItem('username');
    window.localStorage.removeItem('password');
}

function saveLoginCredentials(username, password) {
    window.localStorage.setItem('username', username);
    window.localStorage.setItem('password', password);
}

function getLoginCredentials(){
    return {
        username: window.localStorage.getItem('username'), 
        password: window.localStorage.getItem('password')
    };
}

function makeAuthorizationHeader() {
    var credentials = getLoginCredentials();
    var r = credentials.username + ':' + credentials.password;
    r = 'Basic ' + btoa(r);
    return r;
}
//#endregion Login Credentials

function httpRequest(method, url, auth, data) {
    return $.ajax({
        method: method,
        url: url,
        beforeSend: function (xhr) {
            if (auth) {
                //xhr.withCredentials = true;
                xhr.setRequestHeader('Authorization', makeAuthorizationHeader());
            }
        },
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(data),
        processData: false
    });
}

function endpoint(path, param) {
    var r = 'http://104.236.209.84:8080' + path;
    if (param) {
        r = r + '/' + param;
    }
    return r;
}

function getRequest(url, auth) {
    return httpRequest('GET', url, auth, null);
}

function postRequest(url, auth, data) {
    return httpRequest('POST', url, auth, data);
}

function makeMockWifiWizard() {
    window.WifiWizard = {
        getCurrentSSID: function (ssidHandler, fail) {
            ssidHandler('Gabriel');
        }
    }
}

function onDeviceReady() {
    // Se o emulator ou plataforma não suportar as APIs de Wi-Fi, criar um mock.
    if (typeof window.WifiWizard === 'undefined'){
        makeMockWifiWizard();
    }

    if (!window.location || !window.location.hash) {
        if (hasLoginCredentials()) {
            window.location.hash = '#start';
        }
        else {
            window.location.hash = '#login';
        }
    }
    
    // Se o usuário não possuir as credenciais salvas:
    // Não permitir que o usuário acesse qualquer página exceto a de login.
    // Se o usuário possuir as credenciais salvas:
    // Não permitir que o usuário acesse a página de login.
    $(document).on('pagebeforechange', function (e, data){
        if (typeof data.toPage === 'string') {
            var url = $.mobile.path.parseUrl(data.toPage);
            if (url.hash != '#login' && !hasLoginCredentials()) {
                e.preventDefault();
                window.location.hash = '#login';
            }
            if (url.hash == '#login' && hasLoginCredentials()) {
                e.preventDefault();
                window.location.hash = '#start';
            }
        }
    });

    // Inicialização da página principal
    $(document).on('pageinit', '#start', function (e) {
        setInterval(function () {
            WifiWizard.getCurrentSSID(function (SSID) {
                if (!window.laboratorios) return;

                var labs = window.laboratorios;

                var match = false;
                
                for (var i = 0; i < labs.length; i++) {
                    if (SSID.indexOf(labs[i]['wifi']) != -1) {
                        $('#start-lab-detected').text('Você está no laboratório ' + labs[i]['nome'] + ' (rede ' + SSID + ').');
                        $('#select-lab').val(labs[i]['id']).attr('disabled', 'disabled').selectmenu('refresh');
                        match = true;
                    }
                }
                if (!match) {
                    $('#start-lab-detected').text('Nenhum laboratório detectado (' + SSID + '). Conecte-se na rede Wi-Fi do laboratório, se disponível, ou selecione o laboratório na lista abaixo.');
                    $('#select-lab').removeAttr('disabled').selectmenu('refresh');
                }
            }, function () {
                $('#start-lab-detected').text('Não foi possível detectar o laboratório. Cheque se o Wi-Fi está habilitado e conectado na rede do laboratório e se o aplicativo tem permissões para gerenciar redes Wi-Fi.');
                $('#select-lab').removeAttr('disabled').selectmenu('refresh');
            });
        }, 5000);

        getRequest(
            endpoint('/authenticator/laboratorios'),
            true
        )
        .done(function (data) {
            window.laboratorios = data;
            $('#select-lab').html('');
            for (var i = 0; i < data.length; i++) {
                var $option = $('<option/>').val(data[i]['id']).text(data[i]['nome']);
                $('#select-lab').append($option);
            }
            $('#select-lab').removeAttr('disabled').selectmenu('refresh', true);
        })
        .fail(function () {
            clearLoginCredentials();
            $.mobile.changePage('#login');
        });

        $('#start-btn-in').on('click', function (e) {
            e.preventDefault();

            var lab = $('#select-lab').val();
            postRequest(
                endpoint('/authenticator/entrada', lab),
                true
            )
            .done(function () {
                $('#popup-in-success').popup('open');
            })
            .fail(function () {
                clearLoginCredentials();
                $.mobile.changePage('#login');
            });
        });

        $('#start-btn-out').on('click', function (e) {
            e.preventDefault();

            var lab = $('#select-lab').val();
            postRequest(
                endpoint('/authenticator/saida', lab),
                true
            )
            .done(function () {
                $('#popup-out-success').popup('open');
            })
            .fail(function () {
                clearLoginCredentials();
                $.mobile.changePage('#login');
            });
        });
    });

    // Inicialização da página de notificações
    $(document).on('pageinit', '#notifications', function (e) {
        var lastNotificationTime = 0;
        setInterval(function () {
            if (hasLoginCredentials()) {
                getRequest(
                    endpoint('/authenticator/notificacoes', lastNotificationTime),
                    true
                )
                .done(function (data) {
                    lastNotificationTime = Math.round(new Date().getTime() / 1000);
                    for (var i = 0; i < data.length; i++) {
                        var $div = $('<div/>', { class: 'notification ui-btn-corner-all' })
                            .append(
                                $('<h4/>').text(data[i]['titulo'])
                            )
                            .append(
                                $('<p/>').text(data[i]['mensagem'])
                            );
                        $('#notifications-content').prepend($div);
                    }
                });
            }
        }, 5000);
    });

    // Inicialização da página de preferências
    $(document).on('pageinit', '#preferences', function (e) {
        getRequest(
            endpoint('/authenticator/laboratorios'),
            true
        )
        .done(function (data) {
            window.laboratorios = data;

            getRequest(
                endpoint('/authenticator/preferencias'),
                true
            )
            .done(function (data2) {
                if (!window.preferencias) {
                    window.preferencias = {};
                }
                for (var i = 0; i < data2.length; i++){
                    window.preferencias[data2[i]['id_laboratorio']] = data2[i];
                }

                $("#preferences-labs").html('');
                for (var i = 0; i < data.length; i++){
                    var $li = $('<li/>').append(
                        $('<a/>')
                        .attr('href', '#preferences-lab'+ i)
                        .attr('data-transition', 'slide')
                        .text(data[i]['nome'])
                    );
                    $("#preferences-labs").append($li);
                    $("#preferences-labs").listview("refresh");
    
                    $('#preferences-lab' + i).remove();
    
                    var id = data[i]['id'];

                    var $page = $('<div/>')
                    //.attr('data-role', 'page')
                    .attr('id', 'preferences-lab' + i)
                    .append(`
                        <div data-role="header">
                            <a href="#preferences" data-rel="back" class="ui-btn ui-btn-left ui-alt-icon ui-nodisc-icon ui-corner-all ui-btn-icon-notext ui-icon-carat-l">Voltar</a>
                            <h1>${data[i]['nome']}</h1>
                        </div>
                    `)
                    .append(`
                        <div role="main" class="ui-content">
                            <form>
                                <input type="hidden" name="id" value="${id}">
                                <div data-role="rangeslider">
                                    <label for="lab${i}-temperature-min">Temperatura (°C):</label>
                                    <input name="temperature-min" id="lab${i}-temperature-min" min="-50" max="50" value="${preferencias[id] ? preferencias[id]['temperatura_min'] || 0 : 0}" type="range">
                                    <label for="temperature-max">Temperatura (°C):</label>
                                    <input name="temperature-max" id="lab${i}-temperature-max" min="-50" max="50" value="${preferencias[id] ? preferencias[id]['temperatura_max'] || 0 : 0}" type="range">
                                </div>
                                <div data-role="rangeslider">
                                    <label for="lab${i}-humidity-min">Umidade (% vol):</label>
                                    <input name="humidity-min" id="lab${i}-humidity-min" min="0" max="100" value="${preferencias[id] ? preferencias[id]['umidade_min'] || 0 : 0}" type="range">
                                    <label for="lab${i}-humidity-max">Umidade (% vol):</label>
                                    <input name="humidity-max" id="lab${i}-humidity-max" min="0" max="100" value="${preferencias[id] ? preferencias[id]['umidade_max'] || 0 : 0}" type="range">
                                </div>
                                <input type="submit" value="Salvar" data-theme="b">

                                <div data-role="popup" id="popup-preferences-${id}" data-overlay-theme="b" data-position-to="window" data-transition="pop">
                                </div>
                            </form>
                        </div>
                    `);
                    $page.on('pageinit', onPreferencesLabPageInit);
                    
                    $('body').append($page);

                    $page.page();
                }
            })
            .fail(function () {
                clearLoginCredentials();
                $.mobile.changePage('#login');
            });
        })
        .fail(function () {
            clearLoginCredentials();
            $.mobile.changePage('#login');
        });

        $('#preferences-end-session').on('click', function (e) {
            e.preventDefault();
            clearLoginCredentials();
            $.mobile.changePage('#login');
        });
    });

    function onPreferencesLabPageInit(e) {
        var pageId = $(e.target).attr('id');
        $('#' + pageId + ' form').on('submit', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var id = parseInt($(e.target.id).val());
            var temp_min = parseInt($(e.target['temperature-min']).val());
            var temp_max = parseInt($(e.target['temperature-max']).val());
            var humid_min = parseInt($(e.target['humidity-min']).val());
            var humid_max = parseInt($(e.target['humidity-min']).val());
            var obj = {
                'temperatura_min': temp_min,
                'temperatura_max': temp_max,
                'umidade_min': humid_min,
                'umidade_max': humid_max,
                'luminosidade_min': null,
                'luminosidade_max': null
            }

            postRequest(
                endpoint('/authenticator/preferencias', id),
                true,
                obj
            )
            .done(function (data) {
                var $popup = $("#popup-preferences-" + id).html('')
                    .append($('<h3/>').text('Sucesso'))
                    .append($('<p/>').text('As alterações foram salvas.'))
                
                $popup.popup('open');
            })
            .fail(function (xhr) {
                var $popup = $("#popup-preferences-" + id).html('')
                    .append($('<h3/>').text('Erro'))
                    .append($('<p/>').text('As alterações não foram salvas.'))

                if (xhr.responseJSON) {
                    var data = xhr.responseJSON;
                    $popup
                    .append($('<p/>').text('Verifique as seguintes condições:'))
                    .append(
                        $('<ul/>')
                        .append($('<li/>').text('A temperatura precisa estar entre ' + data['temperatura_min'] + '°C e ' + data['temperatura_max'] + '°C.'))
                        .append($('<li/>').text('A umidade precisa estar entre ' + data['umidade_min'] + '% e ' + data['umidade_max'] + '%.'))
                    )
                }
            
                $popup.popup('open');
            })
        });
    }

    // Inicialização da página de login
    $(document).on('pageinit', '#login', function (e) {
        $('#login-submit').on('click', function (e) {
            var username = $('#login-username').val();
            var password = $('#login-password').val();
            
            saveLoginCredentials(username, password);

            getRequest(
                endpoint('/authenticator/preferencias'),
                true
            )
            .done(function (data, status, xhr) {
                $.mobile.changePage('#start');
            })
            .fail(function (xhr) {
                switch (xhr.status) {
                    case 401:
                        $('#popup-login-error-msg').text('O nome de usuário ou senha estão incorretos.');
                        break;
                    case 500:
                        $('#popup-login-error-msg').text('Ocorreu um erro no servidor.');
                        break;
                    default:
                        $('#popup-login-error-msg').text('Erro desconhecido. Verifique sua conexão com a internet.');
                        break;
                }
                $('#popup-login-error').popup('open');
                clearLoginCredentials();
            });
        });
    });
}

onDeviceReady();
