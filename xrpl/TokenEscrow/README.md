## 1. TokenEscrow란?

TokenEscrow는 **XRPL의 기존 XRP 전용 Escrow 기능을 확장**해,

**IOU 토큰**과 MPT(Multi-Purpose Token)도 에스크로에 걸 수 있게 하는 기능이다.

토큰 타입별 특징:

- **~~IOU~~**
    - ~~발행자와 보유자 간 **Trustline** 필요~~
    - ~~발행자 정책: RequireAuth, Freeze, TransferRate~~
    - ~~Escrow 허용 플래그: `lsfAllowTrustLineLocking` (AccountRoot)~~
- **MPT**
    - **Trustline 없음**
    - 발행자 정책: RequireAuth, Lock, TransferFee
    - Escrow 허용 플래그: `tfMPTCanEscrow` (MPTokenIssuance 트랜잭션에 명시해야 Escrow 가능)
    - 전송 가능 플래그: `tfMPTCanTransfer` (MPTokenIssuance 트랜잭션에 명시, 없으면 발행자에게만 전송 가능)

---

## 2. 왜 필요한가?

- **자산 잠금 지원 확대**
    - XRP뿐 아니라, 발행 토큰(스테이블코인·포인트·권리증서 등)도 에스크로 가능.
- **정산 예측성 보장**
    - Escrow 생성 시점의 TransferRate/TransferFee를 고정, 이후 변경에도 영향을 받지 않음.
- **발행자 정책 준수**
    - RequireAuth·Freeze·Lock 등의 제어가 Escrow에도 동일하게 적용.
- **다양한 시나리오 지원**
    - 계약금, 지급 보류, 조건부 지급, 베스팅(vesting) 등에 IOU/MPT 사용 가능.

---

## 3. 시나리오: `escrowCreate` → `escrowFinish` → (옵션) `escrowCancel`

### Step 1. 에스크로 생성 (`escrowCreate.ts`)

- **주체**: 송금자(Source)
- **행동**: `EscrowCreate` 트랜잭션 전송
- **Amount 형식**:
    - XRP: drops 문자열
    - IOU/MPT: `CurrencyAmount` 객체
- **필수 조건**:
    - IOU/MPT → `CancelAfter` 필수
    - 발행자가 Source이면 불가
    - 발행자 Escrow 허용 플래그 설정 필요
    - Source가 RequireAuth 토큰이면 사전 승인 필요
    - Source 잔액·Trustline·Authorize 상태 정상

```tsx
const tx: Transaction = {
      TransactionType: "EscrowCreate",
      Account: user.address,              // 소스 = User
      Destination: user2.address,         // 목적지 = User2 (Merchant)
      Amount: {
        currency: "USD",                  // 예시 통화 코드
        issuer: admin.address,            // IOU 발행자 (Admin)
        value: "50"                       // 문자열 수치
      } as any,
      FinishAfter: now() + 600,           // 10분 후 해제 가능
      CancelAfter: now() + 3600           // 60분 후 취소 가능
      // Condition: "<hex>"               // 조건부 escrow 시
    }
```

- 서명 방식 : xrpl.js가 아직 **EscrowCreate의 Amount를 “XRP 문자열”로만** 검증/직렬화하려고 해서 IOU/MPT 객체 넣으면 **클라이언트에서 막혀** **Invalid signature**가 남.
- 그래서 **raw 서명(encodeForSigning + ripple-keypairs.sign)** 으로 **검증/직렬화를 우회**하면 서버가 그대로 받아서 정상 처리.

```tsx
//기존 방식
const prepared = await client.autofill(tx)
const signed   = user.sign(prepared)
const result   = await client.submitAndWait(signed.tx_blob)
```

```tsx
//TokenEscrow에서 사용해야 하는 서명 방식
import { encodeForSigning, encode } from "ripple-binary-codec"
import { sign as kpSign, deriveKeypair } from "ripple-keypairs"

const prepared = await client.autofill(tx)
// 1) 서명 대상 객체에 SigningPubKey를 "미리" 넣는다
const toSign = {
...prepared,
SigningPubKey: user.publicKey,   // 보통 'ED...' 33바이트(hex)
}   
// 2) seed로 keypair 파생 (★ Wallet.privateKey 대신, seed→derive 사용)
const { privateKey, publicKey } = deriveKeypair(USER_SEED)
// 3) 서명 (프리픽스 자르지 말고 그대로 전달)
const signingData = encodeForSigning(toSign as any)
const signature   = kpSign(signingData, privateKey)
// 4) 최종 인코딩 & 제출
const signedTx = { ...toSign, TxnSignature: signature }
const tx_blob  = encode(signedTx)
const result = await client.submitAndWait(tx_blob)
```

- 콘솔 출력 예시

```bash
EscrowCreate(MPT User→User2) -> Owner=<User주소>, OfferSequence=123456
```

---

### Step 2. 에스크로 해제 (`escrowFinish.ts`)

- **주체**: 누구나(조건 충족 시)
- **행동**: `EscrowFinish` 트랜잭션 전송
- **필수 조건**:
    - FinishAfter 시간 경과
    - Destination이 RequireAuth이면 사전 승인 필요
    - IOU → Trustline 존재 / MPT → 토큰 보유 또는 자동 생성 가능
    - Freeze/Lock 상태 체크
- **상태 변화**:
    - 잔액 이동: 발행자/수신자 조합에 따라 EscrowedAmount, OutstandingAmount 처리 규칙 다름
    - Escrow 객체 삭제

```tsx
// EscrowCreate 스크립트 실행 후 콘솔에 출력된 Sequence 값
const OFFER_SEQUENCE = 123456

const tx: Transaction = {
   TransactionType: "EscrowFinish",
   Account: finisherWallet.address,  // Finish 실행자
   Owner: ownerWallet.address,       // Escrow 소스 주소
   OfferSequence: OFFER_SEQUENCE
}
```

---

### Step 3. 에스크로 취소 (`escrowCancel.ts`)

- **주체**: 누구나(조건 충족 시)
- **행동**: `EscrowCancel` 트랜잭션 전송
- **필수 조건**:
    - CancelAfter 경과
    - Source Authorize·Trustline/MPT 보유 상태 정상
    - Freeze/Lock 상태는 취소 가능
- **상태 변화**:
    - 잔액 반환
    - Escrow 객체 삭제

```tsx
// EscrowCreate 스크립트 실행 후 콘솔에 출력된 Sequence 값
const OFFER_SEQUENCE = 123456

const tx: Transaction = {
   TransactionType: "EscrowCancel",
   Account: cancellerWallet.address, // Cancel 실행자
   Owner: ownerWallet.address,       // Escrow 소스 주소
   OfferSequence: OFFER_SEQUENCE
}

```

