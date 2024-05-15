# Keycloak

- [Keycloak](#keycloak)
  - [Configure wintershop realm](#configure-wintershop-realm)
    - [Create shop client](#create-shop-client)
    - [Configure Realm roles](#configure-realm-roles)
    - [Configure Users](#configure-users)
    - [Realm settings](#realm-settings)
    - [Export wintershop realm including users](#export-wintershop-realm-including-users)
  - [Configure saml-sso realm](#configure-saml-sso-realm)
    - [Create saml-sso realm](#create-saml-sso-realm)
    - [Create saml-sso client](#create-saml-sso-client)
    - [Configure Identity Providers in wintershop realms](#configure-identity-providers-in-wintershop-realms)
    - [Troubleshooting](#troubleshooting)

---

- [ ] invalid_signature (Off 하지 않아야 함.)
- [ ] Logout failed

## Configure wintershop realm

### Create shop client

- Client ID : shop
- Name : shop

다음 아래 설정

- Access Settings
  - Valid redirect URIs : 아래 추가
    - `http://localhost:3000/`
    - `http://localhost:3001/`
  - Web origins : 아래 추가 (CORS 허용을 위함)
    - `http://localhost:3001`
    - `http://localhost:3000`

### Configure Realm roles

- admin, user role 추가

### Configure Users

다음 사용자 추가

- admin (role : user, admin)
  - Credentials
    - Password : admin
    - Temporary : Off
- user (role : user)
  - Credentials
    - Password : user
    - Temporary : Off

### Realm settings

- Login
  - User registration : On
- User registration
  - Assign role : user 추가 (회원 가입 시 디폴트 role 로 추가되기 위함)

### Export wintershop realm including users

> 사용자 정보를 함께 export 하기 위해서는 `kc export` 를 실행해야 한다.

keycloak docker container id 확인

```bash
CONTAINER_ID=$(docker ps | grep keycloak | awk '{print $1}')
```

```bash
docker exec -it $CONTAINER_ID /opt/keycloak/bin/kc.sh export --realm wintershop --file /opt/keycloak/bin/wintershop-realm.json
```

```bash
docker cp $CONTAINER_ID:/opt/keycloak/bin/wintershop-realm.json .
```

## Configure saml-sso realm

saml sso 연계를 위해서 saml 을 구성해 보자.

아키텍처 구성은 아래와 같이 할 것이다.

(keycloak saml realm) - (keycloak oidc saml 연계) - wintershop

### Create saml-sso realm

- name : saml-sso

### Create saml-sso client

- General Settings
  - Client type : `SAML`
  - Client ID : `saml-sso`
  - Name : `saml-sso`

- SAML capabilities
  - Name ID format : `email`

> SAML 2.0 Identity Provider Metadata 는 `Realm settings` 의 Endpoints 에서 확인 가능

### Configure Identity Providers in wintershop realms

- Identity providers
  - Select `SAML v2.0`

- Add SAML provider
  - Alias : saml
  - Display name : saml
  - SAML entity descriptor : `http://172.17.118.82:8081/realms/saml-sso/protocol/saml/descriptor`

### Troubleshooting

`invalid_signature` 에러

> `VerificationException: Invalid signature on document`는 client 에서 `Client signature required` 를 off 하니 일단 동작했다.

`invalid_redirect_uri` 에러
