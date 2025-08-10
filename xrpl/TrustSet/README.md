## 1. TrustSet

**TrustSet**은 **IOU 신뢰선 생성/수정**을 위한 트랜잭션이다.

특정 통화에 대해 **수신 한도(limit)** 를 설정하고, 발행자 정책(RequireAuth 등)에 따라 **승인 흐름**을 거칠 수 있다.

- **수신자(User)**: 발행자 IOU를 **받기 위해** 자신의 계정에 신뢰선 생성 (limit 설정)
- **발행자(Admin)**: `RequireAuth`를 켠 경우, **승인(allow)** 을 통해 수신자 사용 허가

---

## 2. 왜 필요한가?

- **IOU 보유 전제**: TrustLine 없으면 IOU 수취/보유 불가
- **정책 반영**: RequireAuth, Freeze, QualityIn/Out 등 **통화 정책**과 연동
- **리스크 한도**: 계정별 보유 한도 관리

---

## 3. 시나리오:  `Trustset` → `authorizeTrustLine (RequireAuth)`

### Step 1. User 신뢰선 생성 (`Trustset.ts`)

- **주체**: User
- **행동**: `TrustSet` 트랜잭션 전송
- **내용**:
    - `LimitAmount`: `{ currency, issuer, value }`
    - 필요 시 Quality/Flags 추가 가능

```tsx
 const tx = {
  TransactionType: "TrustSet",
  Account: user.address,          // 수신자(User)
  LimitAmount: {
    currency: "USD",
    issuer: admin.address,        // IOU 발행자
    value: "10000"                 // 수신 허용 한도
  }
}
```

---

### Step 2. 발행자 승인 (`authorizeTrustLine.ts`)

- **주체**: Admin (발행자)
- **행동**: admin의 계정 플래그가 RequireAuth일 때 **특정 User 라인 승인**
- **내용**
    - `TrustSet`에서 발행자 Flags/Quality로 **승인 표현** 또

```tsx
const tx : Transaction = {
    TransactionType: 'TrustSet',
    Account: adminWallet.address,    // 발행자(RequireAuth 설정된 계정)
    LimitAmount: {
      currency: 'USD',
      issuer: userWallet.address,   // 발행자 자신
      value: '0'
    },
    Flags: 0x00000001,                // tfSetAuth = 승인
}
```

- 핵심은 **RequireAuth 활성화 환경에서 수신자가 IOU를 받으려면 발행자 승인이 필요**하다는 점.
