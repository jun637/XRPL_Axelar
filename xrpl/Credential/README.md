## 1. Credential이란?

**Credential**은 XRPL 원장에 저장되는 **“발급자 → 피발급자” 신원·권한 증명 레코드**다.

타입, 만료, 참조 URI 같은 **메타데이터**를 포함한다.

- **발급(Create)**: 발급자(issuer) 지갑이 수행
- **수락(Accept)**: 피발급자(subject) 지갑이 수행
- **도메인 정책 연계**: 도메인의 `AcceptedCredentials`와 결합해 **접근 제어**에 사용
- 주요 필드 예
    - `Subject`: 피발급자 주소
    - `CredentialType`: 예 `"KYC"` → **hex 인코딩 문자열**
    - `Expiration`: 만료 시각(리플 에폭 기준 초)
    - `URI`: 참조 리소스의 **hex 인코딩 URL**

> 헬퍼: toHex("KYC"), toHex("https://...") 같은 간단한 hex 인코더를 스크립트에 포함해 쓰면 편함.
> 

---

## 2. 왜 필요한가?

- **규제 준수**: KYC/AML 충족 계정만 서비스·거래 접근 허용
- **접근 통제**: 특정 Credential 보유자만 도메인/오더북/기능 참여
- **정책 분리**: 자산·오퍼에 직접 제약을 박지 않고 **도메인 정책**에서 일괄 관리
- **유연성/상호운용**: 타입/만료/URI를 조합해 다양한 접근 모델 구성

---

## 3. 시나리오: `create` → `accept` → `check` → `delete`

### Step 1. Credential 발급 (Create)

- **주체**: 발급자(관리자)
- **행동**: `CredentialCreate` 트랜잭션 전송
- **내용**:
    - `Subject`: 피발급자 주소
    - `CredentialType`: 예 `hex("KYC")`
    - `Expiration`: 예 `now + 3600`
    - `URI`: 참조 링크의 hex

```tsx
function toHex(s: string) { return Buffer.from(s, "utf8").toString("hex").toUpperCase() }
const now = () => Math.floor(Date.now()/1000)

const tx = {
  TransactionType: "CredentialCreate",
  Account: issuer.address,                  // 발급자(서명자)
  Subject: subject.address,                 // 피발급자
  CredentialType: toHex("KYC"),             // "KYC" → hex
  Expiration: now() + 3600,                 // 1시간 후 만료
  URI: toHex("https://example.com/credentials/kyc/user")
}


```

- 만료가 지나면 도메인 정책에서 해당 Credential을 부적격으로 간주할 수 있음.

---

### Step 2. Credential 수락 (Accept)

- **주체**: 피발급자(사용자)
- **행동**: `CredentialAccept` 트랜잭션 전송
- **내용**:
    - `Account`: 피발급자(서명자)
    - `Issuer`: 발급자 주소
    - `CredentialType`: Create 단계와 동일한 **hex 타입**

```tsx
function toHex(s: string) { return Buffer.from(s, "utf8").toString("hex").toUpperCase() }

const tx = {
  TransactionType: "CredentialAccept",
  Account: subject.address,                 // 피발급자(서명자)
  Issuer: issuer.address,                   // 발급자
  CredentialType: toHex("KYC")
}


```

- 일부 도메인은 수락(accept) 된 Credential만 유효로 인정할 수 있음.

---

### Step 3. Credential 조회 (Check)

- **주체**: 누구나(공개 원장 조회)
- **행동**: `account_objects` RPC → `LedgerEntryType === "Credential"` 필터

```tsx
 const r = await client.request({
  command: "account_objects",
  account: subject.address,
  limit: 400
})
const creds = (r.result.account_objects || []).filter(
  (o: any) => o.LedgerEntryType === "Credential"
)


```

- Issuer, CredentialType, Expiration 등을 기준으로 유효 Credential만 골라서 표시.

---

### Step 4. Credential 삭제 (Delete)

- **주체**: 피발급자(본인)
- **행동**: `CredentialDelete` 트랜잭션 전송
- **내용**:
    - `Account`: 피발급자(서명자)
    - `Issuer`: 발급자 주소
    - `Subject`: 피발급자 주소
    - `CredentialType`: 삭제할 타입(hex)

```tsx
 
function toHex(s: string) { return Buffer.from(s, "utf8").toString("hex").toUpperCase() }

const tx = {
  TransactionType: "CredentialDelete",
  Account: subject.address,                 // 피발급자(서명자)
  Issuer: issuer.address,                   // 발급자
  Subject: subject.address,                 // 피발급자
  CredentialType: toHex("KYC")
}


```

- 도메인 정책이 “보유 중” Credential을 요구하는 경우, 삭제 후엔 접근이 제한될 수 있음.

