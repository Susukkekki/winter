# wintershop

- [wintershop](#wintershop)
  - [How To run](#how-to-run)
  - [Keycloak Group](#keycloak-group)
    - [Group 정보를 Token 에 제공하는 방법은?](#group-정보를-token-에-제공하는-방법은)
    - [Group/Role 에 설정한 attribute 정보는?](#grouprole-에-설정한-attribute-정보는)
      - [Group Attribute 는 어떻게 활용해야 할까?](#group-attribute-는-어떻게-활용해야-할까)

---

- [ ] Keycloak 스키마 분석
- [ ] Role 과 API 권한을 URL 과 매핑가능한가?

## How To run

```bash
docker-compose up
```

## Keycloak Group

Realm roles 에 다음을 추가하였다.

- product-create
  - Attributes
    - `custom-attr` : `product-create-value`
- product-read
- product-update
- product-delete

다음 Group 을 생성하였다.

> Group 은 parent-child 구조로 hierarchy 를 구성할 수 있다.

- `admin-group`
  - Child groups
    - `admin-sub-group`
  - Attributes
    - `custom-attr` : `admin-group-value`
  - Role mapping
    - product-* 전체
- `user-group`
  - Role mapping
    - product-read

그리고 사용자에게 group 부여

- `admin` 계정에게는 `admin-group` 할당
- `user` 계정에게는 `user-group` 할당

admin 계정으로 토큰을 생성해서 jwt.io 에서 PAYLOAD 부분을 확인해 보면 다음과 같았다.

```json
{
  "exp": 1716182621,
  "iat": 1716182321,
  "jti": "dbab7a56-5655-41e8-a3dc-2c5c0df19882",
  "iss": "http://localhost:8080/auth/realms/wintershop",
  "aud": "account",
  "sub": "e0e52294-30b7-47e1-af17-add374f774a2",
  "typ": "Bearer",
  "azp": "shop",
  "session_state": "4741322e-179b-442a-8689-6a3097a56809",
  "acr": "1",
  "allowed-origins": [
    "/*",
    "http://localhost:3001",
    "http://localhost:3000"
  ],
  "realm_access": {
    "roles": [
      "product-create",
      "product-update",
      "product-read",
      "default-roles-wintershop",
      "product-delete",
      "offline_access",
      "admin",
      "uma_authorization",
      "user"
    ]
  },
  "resource_access": {
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links",
        "view-profile"
      ]
    }
  },
  "scope": "email profile",
  "sid": "4741322e-179b-442a-8689-6a3097a56809",
  "email_verified": false,
  "preferred_username": "admin"
}
```

Group 정보는 보이지 않고, Group 에 연결된 Role 정보가 추가되어 있음을 확인할 수 있다.

이제 다음과 같은 의문이 떠오른다.

### Group 정보를 Token 에 제공하는 방법은?

> 가능하다!

설정 순서를 요약하면 다음과 같다.

1. Client Scope 생성
2. Mapper 추가
3. Client 에 생성한 Client Scope 추가

하나씩 해보자.

Client scopes 에서 `Create client scope` 을 클릭한다.

- Name : `groups`
- Type : `Default`
- Protocol : `OpenID Connect` 선택

생성 후, `Mappers` 탭에서, `Add mapper`, `By configuration` 선택

- `Group Membership` 선택
- Name : `group-membership`
- Token Claim Name : `groups`

다음은 이걸 Client 에 추가해 주어야 한다.

Clients 메뉴에서 `shop` 클라이언트 선택, `Client scopes` 탭으로 이동

`Add client scope` 클릭 후 `groups` 를 `Default` 로 추가한다.

이렇게 한 후 token 을 생성하여 살펴 보면 다음과 같이 추가된 것을 확인할 수 있다.

```json
  "groups": [
    "/admin-group"
  ],
```

### Group/Role 에 설정한 attribute 정보는?

> - Group attribute 는 추가 가능
>   - User Custom Attribute 로 추가한다.
>   - 만약 Group 및 User 에 모두 설정된 경우는 설정 옵션에 따라 단일 값 또는 다중 값을 가질 수 있다.
>     - Aggregate attribute values Off 시
>       - 사용자 > Group 의 우선순위로 설정된 값이 최종 적용된다.
>     - Aggregate attribute values On 시 (OpenID Connect 의 경우 Multivalued On 필요)
>       - 설정된 다중 값을 모두 토큰에 추가한다.
> - Role attribute 는 추가 불가 (아래 관련 이슈 링크)
>   - [KeyCloak - How to add Role's attribute into a user JWT (Access Token)?](https://stackoverflow.com/questions/76042439/keycloak-how-to-add-roles-attribute-into-a-user-jwt-access-token)
>   - [\[KEYCLOAK-17418\] Should role attributes be made available as user attributes?](https://github.com/keycloak/keycloak/issues/10002)

이걸 테스트하기 위해서는 다음의 설정이 필요하다.

1. custom-attr 생성

Realm settings > User profile 탭

`Create attribute` 클릭

- Attribute \[name\] : custom-attr
- Display name : custom-attr (Display name 은 localized values 지정가능하다고 한다.)
- Attribute group : user-metadata
- Who can view? Check `User` and `Admin`

2. 사용자 정보에 custom-attr 설정

그리고 테스트를 위해서 admin 계정에 값을 설정한다.

Users > Details 탭

custom-attr : `user-custom-value`

3. Realm role 에 custom-attr 설정

그리고 나서 `Realm roles` 메뉴에서 `product-create` 선택

`Attributes` 탭으로 이동하고, attribute 추가

- `custom-attr` : `product-create-value`

4. Groups 에 custom-attr 설정

`Groups` 메뉴에서 `admin-group` 선택, `Attributes` 탭으로 이동

- `custom-attr` : `admin-group-value`

그리고 Client scopes 에서 `groups` 선택, `Mappers` 탭으로 이동

`Add mapper` 버튼 클릭 후 `By configuration` 클릭, `User Attribute` 선택

- Name : `custom-attr`
- User Attribute : `custom-attr` 선택
- Token Claim Name : `custom-attr`

완료 후, admin 의 Token 을 살펴보면 다음과 같다.

```json
  "custom-attr": "user-custom-value"
```

이제 `cusom-attr` mapper 의 설정을 변경해서 테스트 해보자.

- Multivalued : `On`
- Aggregate attribute values : `On`

저장 후 admin 계정으로 테스트 해보면 다음과 같다.

```json
  "custom-attr": [
    "admin-group-value",
    "user-custom-value"
  ]
```

왜 product-create 의 custom-attr 값은 빠지는 걸까?

다시 admin 계정에, ADMIN group 은 제거하고, 직접 product-create Role 을 추가해서 테스트 해 보았다.

```json
  "realm_access": {
    "roles": [
      "product-create",
      // ... 생략 ...
    ]
  },
  "custom-attr": [
    "user-custom-value"
  ]
```

역시 role 에 지정한 attribute 는 무시 되는거 같다. 이건 [\[KEYCLOAK-17418\] Should role attributes be made available as user attributes?](https://github.com/keycloak/keycloak/issues/10002) 에서 주고받은 답변의 내용과 동일하다.

이건 의미가 없으므로 원복하자.

- admin 계정의 product-create 삭제
- admin 계정을 user-group 으로 추가
- custom-attr mapper 에서 Multivalued 와 Aggregate attribute values `Off`

#### Group Attribute 는 어떻게 활용해야 할까?

만약 Group / User 에 override 나 다중 값이 필요한 경우에는 User 에게 설정가능하도록 하고, 그렇지 않은 경우는 User 에는 편집가능하지 않도록 하여 특정 값을 할당하여 사용하는 시나리오에 적합할 것이다.
