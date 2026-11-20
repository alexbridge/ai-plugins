# REST Client Conventions

Format: `.rest` / `.http` files compatible with httpYac (`anweber.vscode-httpyac`), VS Code REST Client, and JetBrains HTTP Client. Follow the client already used by the project.

## File Location & Naming
- **Directory**: the project's REST directory (reference: `rest/` at backend root).
- **Naming**: kebab-case of the controller name (e.g., `ApiUserController` -> `api-user.rest`, `ApiReceiverController` -> `api-receiver.rest`).

## Structure
- Use `###` as a delimiter between requests.
- Each request has a `@name` or a comment describing its purpose.
- Base URL comes from a variable (env file or `@baseUrl` at file top), not repeated literals.

## Authentication
- For authenticated endpoints, use the `@ref` tag to refer to a login request, or variables.
- Example (URLs and body are placeholders — take them from the project):
  ```http
  @baseUrl = http://localhost:3000
  @authUrl = http://localhost:3000

  ###
  # @name login
  POST {{authUrl}}/auth/login
  Content-Type: application/json

  {
      "email": "user@example.com",
      "password": "password"
  }

  ###
  # @ref login
  GET {{baseUrl}}/user
  Authorization: Bearer {{login.accessToken}}
  ```

## Request Formatting
- Always include `Content-Type: application/json` for POST/PUT/PATCH requests.
- Include a sample JSON body that matches the controller's DTO.
- Use seed/test data only. Never put real credentials or tokens in `.rest` files.
