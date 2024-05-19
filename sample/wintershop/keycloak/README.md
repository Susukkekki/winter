# Keycloak

- [Keycloak](#keycloak)
  - [Configure wintershop realm](#configure-wintershop-realm)
    - [Create shop client](#create-shop-client)
    - [Configure Realm roles](#configure-realm-roles)
    - [Configure Users](#configure-users)
    - [wintershop Realm settings](#wintershop-realm-settings)
    - [Export wintershop realm including users](#export-wintershop-realm-including-users)
  - [Configure saml-sso realm](#configure-saml-sso-realm)
    - [Create saml-sso realm](#create-saml-sso-realm)
    - [Create saml-sso client](#create-saml-sso-client)
    - [Add users in saml-sso realm](#add-users-in-saml-sso-realm)
    - [saml-sso Realm settings](#saml-sso-realm-settings)
    - [Configure Identity Providers in wintershop realm](#configure-identity-providers-in-wintershop-realm)
    - [Configure Logout Service POST Binding URL in saml-sso realm](#configure-logout-service-post-binding-url-in-saml-sso-realm)
    - [Export saml-sso realm including users](#export-saml-sso-realm-including-users)
  - [Troubleshooting](#troubleshooting)
    - [invalid\_signature error](#invalid_signature-error)
    - [invalid\_redirect\_uri error](#invalid_redirect_uri-error)
    - [Provisional headers are shown when logout](#provisional-headers-are-shown-when-logout)
    - [Configure the logout service url error](#configure-the-logout-service-url-error)

---

- [ ] invalid_signature (Off 하지 않아야 함.)
- [x] Logout failed : [Configure the logout service url error](#configure-the-logout-service-url-error)

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

### wintershop Realm settings

- Login
  - User registration : On
- User registration
  - Assign role : user 추가 (회원 가입 시 디폴트 role 로 추가되기 위함)

### Export wintershop realm including users

> 사용자 정보를 함께 export 하기 위해서는 `kc export` 를 실행해야 한다.

keycloak docker container id 확인

```bash
CONTAINER_ID=$(docker ps | grep -e "keycloak"| grep -v "keycloak-saml" | awk '{print $1}')
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
  - Client ID : `http://wintershop.io/auth/realms/wintershop`
  - Name : `saml-sso`
- Login settings
  - Valid redirect URIs : `http://wintershop.io/*` 추가

생성 후,

- Settings 탭
  - SAML capabilities
    - Name ID format : `email`
- Keys 탭
  - Client signature required : `Off`

> SAML 2.0 Identity Provider Metadata 는 `Realm settings` 의 Endpoints 에서 확인 가능

### Add users in saml-sso realm

admin user

- Username : `admin@saml.io`
- Email : `admin@saml.io`
- Password : `admin` (Temporary : `off`)

normal user

- Username : `user@saml.io`
- Email : `user@saml.io`
- Password : `user` (Temporary : `off`)

### saml-sso Realm settings

User profile 탭

- firstName : Required field `Off`
- lastName : Required field `Off`

### Configure Identity Providers in wintershop realm

- Identity providers
  - Select `SAML v2.0`

- Add SAML provider
  - Alias : `saml`
  - Display name : `saml`
  - Service provider entity : `http://wintershop.io/auth/realms/wintershop` (디폴트로 설정되는 값이다.)
  - SAML entity descriptor : `http://saml.io/realms/saml-sso/protocol/saml/descriptor`

생성 후, Settings > General settings > `SAML 2.0 Service Provider Metadata` 클릭

> Broker 의 SAML 정보를 확인할 수 있으며 여기서 logout endpoint 를 확인한다.

`SingleLogoutService` 의 `Location` 값을 복사해 둔다.

```xml
<md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="http://wintershop.io/auth/realms/wintershop/broker/saml/endpoint"/>
```

### Configure Logout Service POST Binding URL in saml-sso realm

saml client 선택 > Advanced 탭

- Fine Grain SAML Endpoint Configuration
  - Logout Service POST Binding URL : `http://wintershop.io/auth/realms/wintershop/broker/saml/endpoint`

이걸 설정해 주어야, sso 로 로그인 한 계정이 정상적으로 logout 할 수 있다.

### Export saml-sso realm including users

> 사용자 정보를 함께 export 하기 위해서는 `kc export` 를 실행해야 한다.

keycloak-saml docker container id 확인

```bash
CONTAINER_ID=$(docker ps | grep -e "keycloak-saml" | awk '{print $1}')
```

```bash
docker exec -it $CONTAINER_ID /opt/keycloak/bin/kc.sh export --realm saml-sso --file /opt/keycloak/bin/saml-sso-realm.json
```

```bash
docker cp $CONTAINER_ID:/opt/keycloak/bin/saml-sso-realm.json .
```

## Troubleshooting

### invalid_signature error

> `VerificationException: Invalid signature on document`는 client 에서 `Keys` 탭의 `Client signature required` 를 off 하니 일단 동작했다.

### invalid_redirect_uri error

`Valid redirect URIs` 설정해 주면 됨.

### Provisional headers are shown when logout

> ~~영문을 모르겠음.~~

혹시나 해서 `<a href='/#' onClick={() => keycloak.logout()}>Logout</a>` 에서 `href='/#'`를 삭제했더니 잘 된다.

### Configure the logout service url error

`Can't finish SAML logout as there is no logout binding set.  Please configure the logout service url in the admin console for your client applications.` 에러

saml-sso 렐름, `http://wintershop.io/auth/realms/wintershop` client 의 Advanced 설정에서 `Logout Service POST Binding URL`을 다음과 같이 broker 의 logout url 로 하면 된다.

- http://wintershop.io/auth/realms/wintershop/broker/saml/endpoint

이 정보는 wintershop 렐름의 `Identity providers` 의 saml 설정에서 `General settings > Endpoints` : `SAML 2.0 Service Provider Metadata` 에서 확인할 수 있다.

```xml
<md:EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
    xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
    entityID="http://wintershop.io/auth/realms/wintershop"
    ID="ID_0a0621e0-abcb-4e23-a163-4de61b04384e">
    <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"
        AuthnRequestsSigned="true" WantAssertionsSigned="false">
        <md:KeyDescriptor use="signing">
            <ds:KeyInfo>
                <ds:KeyName>hKQwKO89YkjiWKZnZ-q-tE3QlImCDxNM5In50VovHHE</ds:KeyName>
                <ds:X509Data>
                    <ds:X509Certificate>
                        MIICozCCAY... 생략 ...
                    </ds:X509Certificate>
                </ds:X509Data>
            </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
            Location="http://wintershop.io/auth/realms/wintershop/broker/saml/endpoint"></md:SingleLogoutService>
        <md:NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:persistent</md:NameIDFormat>
        <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
            Location="http://wintershop.io/auth/realms/wintershop/broker/saml/endpoint"
            isDefault="true" index="1"></md:AssertionConsumerService>
    </md:SPSSODescriptor>
</md:EntityDescriptor>
```

> `md:SingleLogoutService` 의 `Location` 값이다.
