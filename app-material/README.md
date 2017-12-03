# Código do aplicativo IsuesAuthenticator

### Instalação das dependências

Para instalar as dependências basta executar o procedimento em [Introdução ao Cordova](https://cordova.apache.org/docs/en/latest/guide/cli/). A seguir, uma explicação sucinta será fornecida.

O aplicativo foi construído usando o framework Cordova, logo é necessário sua intalação. Para fazer isso no OSX ou no Linux, execute:

```
sudo npm install -g cordova
```

#### Verificação das plataformas instaladas

Para verificar as plataformas instaladas, execute o seguinte comando:

```
cordova platform ls
```

Cada plataforma pode ter suas próprias dependências, para verificá-las, execute o comando:

```
cordova requirements
```

#### Testando as modificações

Durante o desenvolvimento, é possível testar as modificações usando a plataforma `browser`. Para isso, basta executar:

```
cordova emulate browser
cordova run browser
```

### Geração de um arquivo de instalação

Para gerar um arquivo APK para instalação, execute o seguinte comando:

```
cordova build android
```
