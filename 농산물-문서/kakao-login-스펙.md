> **BE가 전달한 원본 문서** (2026-08-18 수령). 아래 본문은 손대지 않았다.
>
> ⚠️ **§2「프론트엔드 구현 및 연동 규칙」은 이 프로젝트에서 따르지 않는다.**
> 브라우저가 Spring을 직접 호출하는 SPA를 전제로 쓰였는데, 우리는 RSC + BFF다
> (메모리 보관 토큰은 서버가 못 읽고, `SameSite=Lax`는 크로스 사이트 fetch에 안 실린다).
> 우리가 쓰는 방식은 `auth-session` 스킬이 진실 소스다. **BE가 바꿀 것은 없다.**
>
> §1 API 명세와 스웨거가 어긋나는 지점은 `be-요청사항.md` C표 참조.

---

<aside>

**Base URL (Local):** `http://localhost:8080`

**Kakao 로그인 API: `POST** api/v1/auth/kakao/login`

</aside>

## 1. API 명세

### 1.1 Kakao 로그인

카카오 로그인 성공 후 발급받은 `idToken` 을 전달하여 서비스 토큰을 발급받습니다.

- HTTP Method : `Post`
- Endpoint: `/api/auth/kakao/login`
- Headers: `Content-Type: application/json`

#### Request Body

```json
{
  "idToken": "<Kakao OIDC id_token>"
}
```

Kakao Access Token이 아닌 idToken을 전달합니다.

#### Response Body

```json
{
  "accessToken": "<서비스 Access Token>"
}
```

- Set-Cookie (Response Header)

```
refreshToken=<서비스 Refresh Token>; HttpOnly; SameSite=Lax; Secure
```

### **1.2 Access Token 재발급**

Access Token이 만료되었을 때 쿠키의 Refresh Token을 이용해 재발급을 요청합니다.

- **HTTP Method:** `POST`
- **Endpoint:** `/api/auth/reissue`
- **Request Body:** 없음 (브라우저 쿠키 자동 전송)

#### Response Body

```json
{
  "accessToken": "<새로운 Access Token>"
}
```

### **1.3 로그아웃**

로그아웃을 수행하고 서버 측 Refresh Token 및 쿠키를 만료시킵니다.

- **HTTP Method:** `POST`
- **Endpoint:** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <Access Token>`

**Response**

- **Status Code:** `204 No Content`
- **Side Effect:** Refresh Token Cookie 삭제

## 2. 프론트엔드 구현 및 연동 규칙

### 2-1. 토큰 관리 규칙

- **Access Token:** 메모리(React State, Zustand, Redux 등)에 보관하며 요청 Header의 Authorization에 담아 전송합니다.
- **Refresh Token:** `HttpOnly` 쿠키로 전달되므로 프론트엔드 코드에서 직접 읽거나 저장하지 않습니다.

### 2-2. 네트워크 요청 설정 (CORS / Credentials)

- 쿠키 주고받기를 위해 모든 인증 관련 HTTP 요청에는 **`credentials: 'include'`** (또는 Axios 기준 `withCredentials: true`) 옵션을 반드시 설정해야 합니다.
- 프론트엔드와 백엔드의 Origin이 다를 경우 CORS 및 credentials 연동 설정이 필요합니다.

### 2-3. 토큰 재발급 프로세스

1. API 요청 중 Access Token 만료 응답(401) 수신 시 `/api/auth/reissue`를 호출합니다.
2. 재발급 성공 시 새 `accessToken`을 메모리에 갱신하고 기존 요청을 재시도합니다.
3. 재발급 실패(401/403) 시 저장된 상태를 비우고 로그인 화면으로 이동시킵니다.