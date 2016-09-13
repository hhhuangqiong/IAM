# Deployment

## Artifact - Docker

This application is released as a docker image bundle, to be run as a docker container. This section provide the necessary information to for application deployment.

The image can be pulled from the [Docker Repository](http://docker.dev.maaii.com/repositories)

### Docker image Identifier

``` Identifier
docker.dev.maaii.com/m800/maaii-identity-access-mgmt
```

### Docker image specification

Checkout the latest docker image specifications (e.g. exposed ports, mount volumes) from the [git repo](http://gerrit.dev.maaii.com/gitweb?p=maaii-identity-access-mgmt.git;a=tree)


## Application Configurations - Docker Container Environment Variables

The application can be configured using docker container environment variables. A list of configuration available configuration keys are specified below:

|Key|Description| e.g. |
| --- | --- | --- |
|TZ|NodeJs runtime timezone|Asia/Hong_Kong|
|`APP_URL`| Deployment app url| `deploy.dev.maaii.com:4004`|
|`mongodb__uri`| MongoDB URI in [Standard Connection String](https://docs.mongodb.com/manual/reference/connection-string/) format|`mongodb://testbed-usr:testbed-pw@192.168.119.71,192.168.119.73/m800-whitelabel-portal?connectTimeoutMS=300000`|
|`MAIL_SERVICE_URL`| the maaii mail service url|`http://deploy.dev.maaii.com:4011`|
|`email__from`|the email from|`noreply@m800.com`|
|`email__templates__iam-signUp__subject`|Subject of sign up email|`Please confirm your email`|
|`email__templates__iam-resetPassword__subject`|Subject of reset email|`Reset your password`|
|`openid__clients__{$clientId}__client_secret`|the client secret|`7GnoS1vf5HqM1b8B4ZKDJQA6BvXa38ltUoFFVQ4cloR4GICEuWQk50S60pIVK16b`|
|`openid__clients__{$clientId}__grant_types`|the grant type|`authorization_code`|
|`openid__clients__{$clientId}__redirect_uris`|the redirect url|`http://deploy.dev.maaii.com:4002/callback`|
|`openid__clients__{$clientId}__post_logout_redirect_uris`|the logout redirect uri|`http://deploy.dev.maaii.com:4002`|
|`opendid__clients__{$clientId}__token_endpoint_auth_method`|the authorization method when access the endpoints, `client_secret_jwt` will send by signed JWT with the algorithm, `client_secret_basic` will send via Authorization Header with base64 encoded  |`client_secret_jwt`|
|`opendid__clients__{$clientId}__token_endpoint_auth_signing_alg`|the authorization signing algorithm applied on `client_secret_jwt`(current only tested with HS512)|`HS512`|

Note: Detail setting for openid(with prefix `openid__clients`), please refer [openid section](docs/OPENID.md), where `{$clientId}` above is the serivce clientId. (e.g `openid__clients__wlp`)

Note: Keys defined with __ in between words are due to default setup of [nconf](https://github.com/indexzero/nconf), an npm module that we used to organize application configurations.

## Docker Container Exposed Port
|Name|Port|Description|
| --- | --- | --- |
|App Port|3000|WLP NodeJS application port|
