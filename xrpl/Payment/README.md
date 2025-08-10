## 1. Payment

**Payment**는 XRPL에서 **계정 간 자산 전송**을 수행하는 트랜잭션이다.

자산은 **XRP**(drops 단위 문자열) 또는 **IOU**(CurrencyAmount 오브젝트)로 보낼 수 있다.

- **XRP 전송**: `Amount: "1000"` (drops)
- **IOU 전송**: `Amount: { currency, issuer, value }`
- **사전 조건(IOU)**: **수신자**가 해당 IOU에 대한 **신뢰선(TrustLine)** 을 보유해야 수취 가능
- **권한 요구(RequireAuth)**: 발행자가 RequireAuth를 켰다면, 수신자는 **승인(allow trust)** 되어야 수취 가능

---

## 2. 왜 필요한가?

- **기본 송금**: XRP/IOU를 다른 계정으로 보냄
- **에스크로/DEX 전 단계**: 자산 분배, 수수료 처리, 정산 등에 필수
- **정책 반영**: RequireAuth, Freeze, TransferRate 등 **발행자 정책**의 효과를 실제 송금에서 확인

---

## 3. 시나리오: `send-xrp` → `send-iou`

### Step 1. XRP 전송 (`send-xrp.ts`)

- **주체**: Admin
- **행동**: `Payment`(XRP) 전송
- **내용**:
    - `Amount`: drops 문자열 (예: `"1000"` = 0.001 XRP)
    - `Destination`: User 주소

```tsx
const tx = {
  TransactionType: "Payment",
  Account: admin.address,         // 송신자(Admin)
  Destination: user.address,      // 수신자(User)
  Amount: "1000000"               // 10 XRP 
}

// 실행: npx ts-node xrpl/Payment/send-xrp.ts
// env: ADMIN_SEED, USER_SEED

```

---

### Step 2. IOU 전송 (`send-iou.ts`)

- **주체**: Admin(해당 IOU의 발행자)
- **행동**: `Payment`(IOU) 전송
- **내용**:
    - `Amount`: CurrencyAmount `{ currency, issuer, value }`
    - **수신자(User)** 는 사전에 해당 IOU **TrustLine 필요**

```tsx
tsx
복사편집
const tx = {
  TransactionType: "Payment",
  Account: admin.address,         // IOU 발행자(송신자)
  Destination: user.address,      // 수신자
  Amount: {
    currency: "USD",              // 통화 코드(3자 등)
    issuer: admin.address,        // 발행자 주소
    value: "100"                   // 문자열 수량
  }
}
```

- **주의**:
    - User가 해당 IOU에 대한 **TrustLine 미보유** → `tecNO_LINE`/`tecNO_AUTH` 등 실패
    - 발행자 **RequireAuth 활성화** 시 → 수신자는 **승인** 상태여야 수취 가능
