# Development

## Environment

- Node 6 (@6.3.0)
- MongoDB

## Coding Set
Using the following syntax style

- ES2015
- babel preset [stage-2](https://babeljs.io/docs/plugins/preset-stage-2/)

## Tasks
There are several tasks to cover from development, test and build.

1. API DOC  
Using [apidoc](http://apidocjs.com/) to build the api doc on each api.  
config: `apidoc.json`  
output: `./doc/index.html`  
task: `npm run doc`

2. Lint  
Using [eslint](http://eslint.org/) for the code and ensure the coding format and style.  
config: `.eslintrc`  
task: `npm run lint`

3. Test  
Using [Mocha](http://mochajs.org), [chai](http://chaijs.com/) and [supertest](https://github.com/visionmedia/supertest) for the unit test  
folder: `./test`  
config `./test/mocha.opts`  
task: `npm run test`

4. Test coverage  
Extended the above test with code coverage using [Istanbul/NYC](https://github.com/istanbuljs/nyc)  
task: `npm run test:coverage`

5. Dev  
Since we are using es2015, we will use babel-node for the development stage.It will watch the code change and restart the server automatically.  
config: `src/config/env-*.json`  
task: `npm run dev`  

_Please make sure to start the mongo first before start the server where   development version will connect `mongodb://localhost/maaii-identity-access-mgmt`_

6. Build  
We will babel transpile the code and start the server
task: `npm run build`

## Folder Structure
The follow diagram shows the folder structure on each modules.
Identity, access and openid should be placed in the corresponding folder.

```
.
|--src
|  |--collections/
|  |--config/
|  |--express/
|     |--access/
|     |--identity/
|
|  |--koa/
|     |--openid/
|
|--test
|  |--access/
|  |--identity/
|  |--openid/
|
|--(project config file)
```

## Debug

Tools:
- [Node-Inspector](https://github.com/node-inspector/node-inspector) (@0.12.8)

Steps
1. install the node-inspector  
`npm install -g node-inspector`
2. open the debugger on a tab  
`node-inspector`
3. start the app and debug on another tab  
`npm run dev -- --debug`
4. go to debugger  
http://127.0.0.1:8080/?port=5858

## Reference

- [IAM Design Doc](https://issuetracking.maaii.com:9443/display/WLP/Identity+Access+Management+Service)
