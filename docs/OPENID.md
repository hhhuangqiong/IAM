# OPEN CONNECT ID

## How it works

Open Connect ID is a (Single Sign On) SSO solution and identity layer to allow client verify the end user identity based on based on the authentication performed by an Authorization Server.

We have implemented the [node-oidc-provider](https://github.com/panva/node-oidc-provider) be a part of IAM service.

## Usage

Since we don't support dynamic client registration due to security concern, developer need to config the client in IAM service. Clients will be loaded in memory when start the IAM service. Any changes will require restart.

### Add a new Client
To add a new client, developer need to insert a client with the following parameters.

Here is the sample  
 - client_id - the id of client
 - client_secret - the client secret which need to use to verify the client when sending authorization request
 - grant_types - the grant type
 - redirect_uris - the redirect_uris which read read the authorization code in the authorization request
 - post_logout_redirect_uris - the redirect url to after logout the IAM session
```
"openid":{
  "clients": {
    "wlp": {
      "client_id": "wlp",
      "client_secret": "9GnoS1vf5HqM1b8B4ZKDJQA6BvXa35ltUoFFVQ4cloR4GICEuWQk50S60pIVK06b",
      "grant_types": ["authorization_code"],
      "redirect_uris": ["http://192.168.3.106:3000/callback"],
      "post_logout_redirect_uris": ["http://192.168.3.106:3000"]
   }
 }
},
```

You can also set in the env variable under the openid__clients object.
```
export openid__clients__myClient__client_id=myClient
export openid__clients__myClient__client_secret=9GnoS1vf5HqM1b8B4ZKDJQA6BvXa35ltUoFFVQ4cloR4GICEuWQk50S60pIVK06b
export openid__clients__myClient__grant_types=authorization_code
export openid__clients__myClient__redirect_uris=http://192.168.3.106:3000/callback,http://192.168.3.106:3000/callbackB
export openid__clients__myClient__post_logout_redirect_uris=http://192.168.3.106:3000
```

### Using the client
You can reference the WLP integration with IAM as reference
http://deploy.dev.maaii.com:9080/m800-white-label-portal/
