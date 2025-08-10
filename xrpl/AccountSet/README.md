## 1. AccountSet이란?

**AccountSet**은 계정의 **플래그/설정값**을 변경하는 트랜잭션이다.

예: `RequireAuth`, `DefaultRipple`, `DisallowXRP`, `TickSize` 등.

- 표준 플래그는 **asf 계열**(ex. `asfRequireAuth`) 사용 권장
- 특정 구현에서는 비트값 직접 지정 가능 (테스트/실험용)

---

## 2. 왜 필요한가?

- **정책 전환**: RequireAuth(승인형 IOU), DefaultRipple(리플 경로) 등 기능 활성화
- **보안/운영**: MasterKey 비활성화, Domain 설정, TransferRate 등

---

## 3. 시나리오:`AccountSet` → (옵션) `TrustSet` 승인 연계

### Step 1. RequireAuth 활성화 (`AccountSet.ts`)

- **주체**: Admin
- **행동**: `AccountSet` 트랜잭션 전송
- **내용**:
    - `SetFlag`: `asfRequireAuth` (또는 프로젝트에서 쓰는 비트값)

```tsx
const tx = {
  TransactionType: "AccountSet",
  Account: admin.address,
  SetFlag: 2 // 예시: asfRequireAuth (xrpl.js 상수 사용 가능: AccountSetAsfFlags.asfRequireAuth)
}
```

---

### Step 2. (옵션) RequireAuth 환경에서 TrustSet 승인

- **주체**: Admin
- **행동**: 특정 User의 IOU 신뢰선 승인(User가 TrustSet을 Admin에게 이미 보낸 상태)
- **내용**: 이후 User가 해당 IOU 수취 가능

```tsx
const tx = {
  TransactionType: "TrustSet",
  Account: admin.address,
  LimitAmount: {
    currency: "USD",
    issuer: user.address,// 승인 시에는 user 주소
    value: "0"
  }
  // Flags / Memo로 승인 의사 표시 (레포 규약에 맞춤)
}

```

- 만약 XRPL의 네이티브 토큰인 XRP를 주고받거나, 발행하는 토큰에 대한 부가 설정 및 통제가 굳이 필요하지 않다면, 이 과정 없이 2번의 일반적인 `TrustSet` 트랜잭션만 전송해도 괜찮음
