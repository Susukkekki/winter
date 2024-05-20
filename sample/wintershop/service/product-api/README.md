# PRODUCT-API

## Set Up

[Spring Initizlizer](https://start.spring.io/)로 생성

- Project
  - Maven
  - Java 17
  - Spring Boot 3.2.5
  - Jar
- Dependencies
  - Spring Web
  - Spring Security
  - OAuth2 Resource Server
  - Lombok
  - Spring REST Docs

## Test

계정 토큰 얻기

```bash
USER_ID=admin
USER_PWD=admin
TOKEN=$(curl -X POST http://localhost:8080/auth/realms/wintershop/protocol/openid-connect/token \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=password&client_id=shop&username=${USER_ID}&password=${USER_PWD}" \
    | jq -r '.access_token')
echo $TOKEN
```

```bash
curl -v -H "Authorization: Bearer ${TOKEN}" http://localhost:8001/api/v1/product
```
