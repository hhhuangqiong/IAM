# OPEN CONNECT ID

### Objective

[Open Connect ID](http://openid.net/connect/) is a (Single Sign On) SSO solution and identity layer to allow client verify the end user identity based on based on the authentication performed by an Authorization Server.

We have implemented the [node-oidc-provider](https://github.com/panva/node-oidc-provider) be a part of IAM service.

Open connect id will linked up with mongo database which store the session, authorization and tokens.

Services like WLP, LC will need to register as a client in order to connect with the IAM Open id. It only allows those registered clients to access the IAM Open ID.

Clients may send authorization request to login the and obtain the authorization token.
It may also send token request to get access token later via different endpoints provided in the [library](https://github.com/panva/node-oidc-provider#features).

{% plantuml %}

node "OPENID in IAM" {
  interface "OPEN ID API" as IAM_OPENID
  IAM_OPENID -- [OPEN_ID]
}

database "Mongo" {
  [OPEN_ID] as table_openid
}

[OPEN_ID] --> [table_openid]

node "Clients (e.g WLP, LC)"{
  interface "Authorization Request" as CLIENT_AUTH
  interface "Token Request" as CLIENT_TOKEN
}

[CLIENT_AUTH] --> IAM_OPENID
[CLIENT_TOKEN] --> IAM_OPENID

{% endplantuml %}


### Add a new Client
For each client, the following attributes are required to fill in.

|Key|Description|sample|
| --- | --- | --- |
|`client_secret`|the client secret is a secret token to indicate the client *|`u77rWchPSnoXXkuhr4cIUSivE+UWsuMZgAUlAD5VvscF5t6wPfkA3M9j6Q/llSZh`|
|`grant_types`|the grant type that client want to request for. Only support authorization_code now|`authorization_code`|
|`redirect_uris`|the redirect url that redirect after authorization request|`http://deploy.dev.maaii.com:4002/callback`|
|`post_logout_redirect_uris`|the redirect url after logout|`http://deploy.dev.maaii.com:4002`|
Each client configuration should have prefix `openid__clients` and then with client_id.

Here is the sample of a client setting in the docker env file, where wlp is the client_id
```
openid__clients__wlp__client_secret=9GnoS1vf5HqM1b8B4ZKDJQA6BvXa35ltUoFFVQ4cloR4GICEuWQk50S60pIVK06b
openid__clients__wlp__grant_types=authorization_code
openid__clients__wlp__redirect_uris=http://deploy.dev.maaii.com:4002/callback
openid__clients__wlp__post_logout_redirect_uris=http://deploy.dev.maaii.com:4002
```

Note: Generate the client_secret  
In the node environment, [nodejs crypto](https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback) to generate via crypto.randomBytes(48).toString('base64')
```
M800-L-0063:m800-white-label-portal user$ node
> crypto.randomBytes(48).toString('base64')
'u77rWchPSnoXXkuhr4cIUSivE+UWsuMZgAUlAD5VvscF5t6wPfkA3M9j6Q/llSZh'
```

Note: Keys defined with __ in between words are due to default setup of [nconf](https://github.com/indexzero/nconf), an npm module that we used to organize application configurations.


### Using the client
Different application can have different integration. [Node Openid Client](https://github.com/panva/node-openid-client) can be applied on the client side.  
It will make use of different end points to authenticate.

You can reference the WLP integration with IAM as reference
http://deploy.dev.maaii.com:9080/m800-white-label-portal/


### Reference
[Open Connect ID Standard](http://openid.net/connect/)  
[Node Provider used in IAM](https://github.com/panva/node-oidc-provider)  
[NODE OPENID Client applied in WLP](https://github.com/panva/node-openid-client)  
[IAM Design Guide](https://issuetracking.maaii.com:9443/display/WLP/Identity+Access+Management%28IAM%29+Service)
