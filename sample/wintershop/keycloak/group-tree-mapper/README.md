# Keycloak Custom Mapper - Group Tree Mapper

> Keycloak Custom Mapper 예제로 사용자가 속한 Group 의 Hierarchy 를 Token 에 추가한다.  
> 목적은 토큰을 통해서 메뉴와 같은 Tree 구조의 정보를 구조화하고 권한과 맵핑하기 위함이다.

- [Keycloak Custom Mapper - Group Tree Mapper](#keycloak-custom-mapper---group-tree-mapper)
  - [Create a Maven Project](#create-a-maven-project)
  - [References](#references)

## Create a Maven Project

- 프로젝트 생성

```bash
mvn archetype:generate -DgroupId=io.winter.keycloak -DartifactId=group-tree-mapper -DarchetypeArtifactId=maven-archetype-quickstart -DarchetypeVersion=1.4
```

- 의존성 추가

```xml
<dependency>
    <groupId>org.keycloak</groupId>
    <artifactId>keycloak-core</artifactId>
    <scope>provided</scope>
    <version>21.0.1</version>
</dependency>
<dependency>
    <groupId>org.keycloak</groupId>
    <artifactId>keycloak-server-spi</artifactId>
    <scope>provided</scope>
    <version>21.0.1</version>
</dependency>
<dependency>
    <groupId>org.keycloak</groupId>
    <artifactId>keycloak-server-spi-private</artifactId>
    <scope>provided</scope>
    <version>21.0.1</version>
</dependency>
<dependency>
    <groupId>org.keycloak</groupId>
    <artifactId>keycloak-services</artifactId>
    <scope>provided</scope>
    <version>21.0.1</version>
</dependency>
```

- `App.java` 삭제
- `CustomProtocolMapper.java` 추가 및 아래 코드 구현

```java
public class CustomProtocolMapper extends AbstractOIDCProtocolMapper implements OIDCAccessTokenMapper,
  OIDCIDTokenMapper, UserInfoTokenMapper {
}
```

- `src/main/resources` 하위 아래 경로에 `org.keycloak.protocol.ProtocolMapper` 다음 파일 추가

```text
.
└── resources
    └── META-INF
        └── services
            └── org.keycloak.protocol.ProtocolMapper
```

명령어로는 다음과 같이 생성

```bash
mkdir -p src/main/resources/META-INF/services
echo io.winter.keycloak.CustomProtocolMapper > src/main/resources/META-INF/services/org.keycloak.protocol.ProtocolMapper
```

## References

- https://www.baeldung.com/keycloak-custom-protocol-mapper