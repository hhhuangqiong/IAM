# Identity access management

Identity access management (IAM) provides the authentication and authorization.

It provides the following services.

1. Open ID Connect
2. Identity Management
3. Access Management

Design document can be found on [jira](https://issuetracking.maaii.com:9443/display/WLP/Identity+Access+Management+Service).

# Architecture
{% plantuml %}
node "Identity Access Management(IAM)" {
  interface "REST API" as IAM_REST
  IAM_REST -- [Company identity]
  IAM_REST -- [User identity]
  IAM_REST -- [Role access]
  interface "OPEN ID API/Page" as IAM_OPENID
  IAM_OPENID -- [OPEN_ID]
}

database "Mongo" {
  [Company] as table_company
  [User] as table_user
  [Role] as table_role
  [OPEN_ID] as table_openid
}

[Company identity] --> [table_company]
[User identity] --> [table_user]
[Role access] --> [table_role]
[OPEN_ID] --> [table_openid]
[OPEN_ID] --> [table_user]

node "Maaii Mail Service" {
  interface "REST API" as MAIL_REST
}

[User identity] --> MAIL_REST

{% endplantuml %}
