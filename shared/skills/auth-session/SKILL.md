---
name: auth-session
description: 로그인·토큰 세션 규율 — 토큰은 우리 도메인 httpOnly 쿠키, 갱신은 proxy.ts. RSC가 쿠키를 못 쓰는 제약과 그 우회, 캐싱 경계. api-developer/frontend-dev/code-reviewer가 참조.
---

# 인증 세션 (RSC + BFF 기준)

> 외부 Spring(marketgo)의 JWT를 **우리 서버가 보관**하는 구조. 스펙 자체는 `backend-api-reference`.
> 이 스킬은 "토큰을 어디 두고 언제 갱신하는가"만 다룬다.

## 1. 왜 이렇게 됐나 (BE 문서를 그대로 따르지 않는 이유)

BE가 준 `kakao_login.md`는 **브라우저가 Spring을 직접 호출하는 SPA**를 전제로 이렇게 안내한다:
accessToken은 메모리(React state)에 / `credentials: 'include'` / 401 받으면 재발급 후 재시도.

이 프로젝트는 **풀 RSC + BFF**라 그대로 쓸 수 없다:

- **브라우저 메모리의 토큰은 서버가 읽을 수 없다.** Server Component가 데이터를 가져오려면
  요청 시점에 서버가 토큰을 갖고 있어야 한다. 메모리에 두면 로그인 필요한 화면이 전부
  클라이언트 컴포넌트가 되고 RSC 전제가 무너진다.
- **`SameSite=Lax` 쿠키는 크로스 사이트 fetch에 실리지 않는다.** 프론트 도메인과 API 도메인이
  다르면 브라우저에서 재발급을 호출해도 쿠키가 안 붙는다.

**BE는 바꿀 게 없다.** 서버 입장에선 `Authorization` 헤더가 오는 건 동일하다.

## 2. 구조

```
브라우저 ──(우리 도메인 httpOnly 쿠키)── Next 서버 ──(Authorization: Bearer)── Spring
```

| 무엇 | 어디 |
|---|---|
| accessToken | 우리 도메인 httpOnly 쿠키 (`mg_access_token`) |
| refreshToken | 우리 도메인 httpOnly 쿠키 (`mg_refresh_token`) — Spring이 자기 도메인에 심으려던 걸 **옮겨 심은 것** |
| 갱신 | 루트 `proxy.ts` (렌더 **전**) |
| 쿠키 쓰기 | Route Handler · Server Action · `proxy.ts` **에서만** |

- 서버 fetch에는 쿠키 저장소가 없다 → 재발급할 때 `Cookie` 헤더를 **손으로 붙인다**.
- 토큰은 **응답 본문에 담지 않는다.** BFF는 `{ ok: true }`만 돌려준다.

## 3. 핵심 제약 — RSC는 쿠키를 쓸 수 없다

Server Component에서 `cookies().set()`은 **에러다**(읽기만 된다). 그래서 RSC 안에서 재발급을
받아봐야 새 토큰을 저장할 데가 없고, 다음 요청도 만료 토큰으로 시작한다.

→ **갱신은 `proxy.ts`에서 한다.** 렌더 전에 돌고 응답에 쿠키를 쓸 수 있다.

```
요청 → proxy: exp 확인 ─┬─ 여유 있음 → 통과
                        └─ 임박/만료 → reissue → 쿠키 갱신 → 통과
     → RSC: 항상 유효한 토큰을 읽는다
```

**요청 쿠키까지 바꿔야 이번 렌더에 반영된다**: `request.cookies.set(...)` 후
`NextResponse.next({ request })`. 응답 쿠키만 세팅하면 다음 요청부터 적용된다.

## 4. 반드시 지킬 것

- **인증 실패와 통신 실패를 구분한다.** 뭉치면 Spring이 잠깐 죽었을 때 로그인 사용자 전원의
  refreshToken까지 지워 재로그인시킨다. 401/403만 세션 종료, **5xx·타임아웃·이상한 응답은
  쿠키를 건드리지 않고 통과**시킨다.
- **토큰을 프론트에서 검증하지 않는다.** 서명 검증은 Spring이 한다. 우리는 `exp`만 디코드해
  "곧 만료되나"만 본다. 프론트에서 검증하려면 비밀키가 필요해지는데 그건 절대 하면 안 된다.
- **`proxy.ts`의 matcher에서 인증 라우트를 제외**한다(`api/auth/`). 안 그러면 재발급이
  자기 자신을 부른다.
- 세션 종료 시 **요청·응답 쿠키를 둘 다** 지운다. 응답만 지우면 이번 렌더 RSC가 죽은 토큰을 읽는다.
- Edge에서 import되는 파일(`auth/tokens.ts`)에는 **`server-only`를 붙이지 않고**, zod 같은
  무거운 의존도 넣지 않는다.

## 5. 캐싱 경계 (설계 시 먼저 정할 것)

`cookies()`를 부르는 순간 그 라우트는 **동적 렌더링**이 된다. 헤더·레이아웃 같은 공통 셸에서
로그인 여부를 한 번만 읽어도 **앱 전체가 Full Route Cache를 잃는다.**

- 셸은 정적으로 두고, 개인화는 `Suspense` 경계 안쪽 leaf로 민다.
- 개인화 필드(`isLiked` 등)가 섞인 응답은 **절대 공유 캐시에 넣지 않는다** — 남의 찜이 보인다.
  이 프로젝트는 `token` 유무로 캐시 정책을 가른다(`server/items.ts`·`server/stores.ts` 참고):
  토큰이 있으면 `no-store`, 없으면 공유 캐시. 같은 변수 하나가 헤더와 캐시를 동시에 정하므로
  **"인증했는데 공유 캐시에 들어가는" 상태가 만들어지지 않는다.** 이 커플링을 깨지 말 것.
- ⚠️ 스펙에 `security` 선언이 없어도 개인화 응답일 수 있다(`backend-api-reference` §2).

## 6. 아직 미정 (건드리면 확인)

- `TODO(✍️):` 보호 라우트 접근 제어 — 비회원 허용 범위가 미정이라 리다이렉트를 안 걸었다
- `TODO(✍️):` 신규/기존 회원 구분 — 로그인 응답에 단서가 없다
- `TODO(✍️):` refreshToken 회전 여부 — 회전한다면 요청 간 동시 갱신에 락이 필요하다
- 위 3건은 `농산물-문서/be-요청사항.md`에서 BE 답변 대기 중
