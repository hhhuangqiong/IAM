# Identity access management

Identity access management (IAM) provides the authentication and authorization.

It provides the following services.

1. Open ID Connect
2. Identity Management
3. Access Management

Design document can be found on [jira](https://issuetracking.maaii.com:9443/display/WLP/Identity+Access+Management+Service).

# Architecture

{% plantuml %}

component Browser

cloud "Maaii" {

  node "Load Balancer" {
    interface [/openid only] as public_gateway
  }

  node "Identity Access Management(IAM)" {
    interface "REST API /identity" as IAM_API_IDENTITY
    IAM_API_IDENTITY -- [Identity]
    interface "REST API /access" as IAM_API_ACCESS
    IAM_API_ACCESS -- [Access]
    interface "REST API /openid" as IAM_OPENID
    IAM_OPENID -- [OpenId]
  }

  component "White Label Portal" as WLP
  WLP --> IAM_API_IDENTITY
  WLP --> IAM_OPENID
  WLP --> IAM_API_ACCESS
  Browser --> public_gateway
  Browser --> WLP
  public_gateway --> IAM_OPENID

  database "Mongo" {
    [Company] as table_company
    [User] as table_user
    [Role] as table_role
    [OPEN_ID] as table_openid
  }

  [Identity] --> [table_company]
  [Identity] --> [table_user]
  [Access] --> [table_role]
  [OpenId] --> [table_openid]
  [OpenId] --> [table_user]

  node "Maaii Mail Service" {
    interface "REST API" as MAIL_REST
  }

  [Identity] --> MAIL_REST

}

{% endplantuml %}


## Load Balancer

As certain API endpoints of WLP is not designed for public access. Load Balancer
shall be setup to allow only access to /openid endpoint from external.

## White Label Portal

See [White Label Portal](http://deploy.dev.maaii.com:9080/m800-white-label-portal/latest)

## Maaii Mail Service

Maaii Mail Service is used by Identity module to send user activation mails, reset
password mails.

## Mongo

IAM itself is stateless, all data are persisted and stored in Mongo.
