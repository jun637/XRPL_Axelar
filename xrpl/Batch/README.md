## 1. Batch란?

Batch는 **여러 개의 XRPL 트랜잭션을 하나로 묶어** Outer Transaction(Wrapper) 안에서 **한 번에 실행**할 수 있게 해주는 기능이다.

- **Outer Transaction**: `TransactionType: "Batch"`
- **Inner Transactions**: 실제 실행되는 트랜잭션들 (최대 8개)

Batch 실행 모드는 Outer Transaction의 **Flags 값**으로 결정되며, 각 모드는 트랜잭션 처리 방식을 정의한다.

---

### Batch 실행 모드 4가지(Flags)

### 1.1 AllOrNothing (`0x00010000`)

- **설명**: 모든 Inner가 `tesSUCCESS`여야 커밋. 하나라도 실패하면 전부 롤백.
- **사용 예시**:
    - NFT 발행 + 오퍼 생성 (오퍼 실패 시 발행 취소)
    - 멀티계정 스왑 (한쪽 실패 시 전체 취소)

---

### 1.2 OnlyOne (`0x00020000`)

- **설명**: 첫 번째로 성공하는 Inner만 실행, 나머지는 실행 안 함.
- **사용 예시**:
    - 여러 가격의 오퍼를 동시에 제출 → 가장 먼저 체결되는 것만 실행.
    - 여러 경로의 송금 → 첫 성공 경로만 사용.

---

### 1.3 UntilFailure (`0x00040000`)

- **설명**: 순서대로 실행하다가 첫 실패가 나오면 이후는 실행 안 함.
- **사용 예시**:
    - 여러 계정에 순차 송금하다가 잔고 부족 시 중단.
    - 여러 단계 작업 중, 특정 시점까지는 실패해도 괜찮지만 이후는 중단.

---

### 1.4 Independent (`0x00080000`)

- **설명**: 모든 Inner를 실행. 실패 여부 상관없이 전부 시도.
- **사용 예시**:
    - 에어드랍/보상 지급 (몇 개 실패해도 나머지 계속 지급)
    - 대량 오퍼 등록 (중간 실패 무시)

---

## 2. 왜 필요한가?

- **원자성(Atomic) 보장**
    - 여러 단계 작업이 모두 성공해야만 커밋 → 일부만 실행되는 불완전 상태 방지.
- **워크플로우 단순화**
    - NFT 발행 → 오퍼 생성, 토큰 발행 → 전송 등 복합 작업을 하나로 묶음.
- **MultiAccount Transfer**
    - 서로 다른 계정의 트랜잭션을 하나의 Batch에서 동시 실행 가능.
- **수수료 최적화**
    - Inner Transaction들은 Fee=0 → 실제 수수료는 Outer Transaction에서 한 번에 결제.

---

## 3. 시나리오: `batchAllOrNothing` → `batchOnlyOne` → `batchUntilFailure` → `batchIndependent`

### Step 1. AllOrNothing (전부 성공 or 전부 롤백)

- **주체**: User
- **행동**: `Batch` 트랜잭션 전송
- **내용**:
    - `Flags`: `0x00010000` (AllOrNothing)
    - `RawTransactions`: Payment 2건을 **inner**로 포함
    - 각 inner는 `tfInnerBatchTxn(0x40000000)` + `Fee:"0"` + `SigningPubKey:""` + `Sequence` 필수
    - 둘 중 하나라도 실패하면 **둘 다 롤백**

```tsx
// 현재 계정의 최신 시퀀스 번호 조회
// outer 및 inner 트랜잭션의 Sequence 값 계산에 사용
const ai = await client.request({ command: "account_info", account: user.address })
const seq = ai.result.account_data.Sequence

const tx: any = {
  TransactionType: "Batch",
  Account: user.address,
  Flags: 0x00010000, // AllOrNothing
  RawTransactions: [
    { RawTransaction: {
        TransactionType: "Payment",
        Flags: 0x40000000, // tfInnerBatchTxn
        Account: user.address,
        Destination: user2.address,
        Amount: "5000000",         // 5 XRP
        Sequence: seq + 1,
        Fee: "0",
        SigningPubKey: ""
    }},
    { RawTransaction: {
        TransactionType: "Payment",
        Flags: 0x40000000,
        Account: user.address,
        Destination: user2.address,
        Amount: "10000000",         // 10 XRP
        Sequence: seq + 2,
        Fee: "0",
        SigningPubKey: ""
    }}
  ],
  Sequence: seq
}

```

- **검증 포인트**: outer는 `tesSUCCESS`라도, **inner 2건이 모두 ledger에 기록**됐는지 확인. 하나라도 실패면 둘 다 없음.

---

### Step 2. OnlyOne (첫 성공만 적용)

- **주체**: User
- **행동**: `Batch` 트랜잭션 전송
- **내용**:
    - `Flags`: `0x00020000` (OnlyOne)
    - 여러 inner 중 **가장 먼저 성공한 1건만** 반영, 나머지는 시도 안 하거나 미적용

```tsx
// 현재 계정의 최신 시퀀스 번호 조회
// outer 및 inner 트랜잭션의 Sequence 값 계산에 사용
const ai = await client.request({ command: "account_info", account: user.address })
const seq = ai.result.account_data.Sequence

const tx: any = {
  TransactionType: "Batch",
  Account: user.address,
  Flags: 0x00020000, // OnlyOne
  RawTransactions: [
    { RawTransaction: {
        TransactionType: "Payment",
        Flags: 0x40000000,
        Account: user.address,
        Destination: user2.address,
        Amount: "5000000",         // 5 XRP
        Sequence: seq + 1,
        Fee: "0",
        SigningPubKey: ""
    }},
    { RawTransaction: {
        TransactionType: "Payment",
        Flags: 0x40000000,
        Account: user.address,
        Destination: user2.address,
        Amount: "10000000",         // 10 XRP
        Sequence: seq + 2,
        Fee: "0",
        SigningPubKey: ""
    }}
  ],
  Sequence: seq
}

```

- **검증 포인트**: **첫 번째 inner만** ledger 반영. 두 번째는 **미실행/미반영**.

---

### Step 3. UntilFailure (실패가 나오기 전까지 순차 실행)

- **주체**: User
- **행동**: `Batch` 트랜잭션 전송
- **내용**:
    - `Flags`: `0x00040000` (UntilFailure)
    - 앞에서부터 순차 적용, **첫 실패가 나오면 그 이후는 중단**

```tsx
// 현재 계정의 최신 시퀀스 번호 조회
// outer 및 inner 트랜잭션의 Sequence 값 계산에 사용
const ai = await client.request({ command: "account_info", account: user.address })
const seq = ai.result.account_data.Sequence

const tx: any = {
  TransactionType: "Batch",
  Account: user.address,
  Flags: 0x00040000, // UntilFailure
  RawTransactions: [
    { RawTransaction: {
        TransactionType: "Payment",
        Flags: 0x40000000,
        Account: user.address,
        Destination: user2.address,
        Amount: "5000000",         // 5 XRP
        Sequence: seq + 1,
        Fee: "0",
        SigningPubKey: ""
       }
    },
    // 2번째 내부 트랜잭션에서 의도적 실패 유도 (과도한 금액 전송)
    { RawTransaction: {
        TransactionType: "Payment",       
        Flags: 0x40000000,
        Account: user.address,
        Destination: user2.address,
        Amount: "50000000000",         // 50000 XRP (과도한 금액)
        Sequence: seq + 2,
        Fee: "0",
        SigningPubKey: ""
    }},
    { RawTransaction: {
        TransactionType: "Payment",
        Flags: 0x40000000,
        Account: user.address,
        Destination: user2.address,
        Amount: "10000000",         // 10 XRP
        Sequence: seq + 3,
        Fee: "0",
        SigningPubKey: ""
    }}
  ],
  Sequence: seq
}

```

- **검증 포인트**: 1번은 성공, 2번에서 실패, **3번은 미실행**.

---

### Step 4. Independent (모두 시도, 성공/실패 독립)

- **주체**: User
- **행동**: `Batch` 트랜잭션 전송
- **내용**:
    - `Flags`: `0x00080000` (Independent)
    - **모든 inner를 시도**. 일부 실패해도 나머지는 계속 진행

```tsx
// 현재 계정의 최신 시퀀스 번호 조회
// outer 및 inner 트랜잭션의 Sequence 값 계산에 사용
const ai = await client.request({ command: "account_info", account: user.address })
const seq = ai.result.account_data.Sequence

const tx: any = {
  TransactionType: "Batch",
  Account: user.address,
  Flags: 0x00080000, // Independent
  RawTransactions: [
    { RawTransaction: {
        TransactionType: "Payment",
        Flags: 0x40000000,
        Account: user.address,
        Destination: user2.address,
        Amount: "100000000000",         // 100000 XRP(과도한 금액)
        Sequence: seq + 1,
        Fee: "0",
        SigningPubKey: ""
    }},
    { RawTransaction: {
        TransactionType: "Payment",       
        Flags: 0x40000000,
        Account: user.address,
        Destination: user2.address,
        Amount: "50000000000",         // 50000 XRP(과도한 금액)
        Sequence: seq + 2,
        Fee: "0",
        SigningPubKey: ""
    }},
    { RawTransaction: {
        TransactionType: "Payment",
        Flags: 0x40000000,
        Account: user.address,
        Destination: user2.address,
        Amount: "5000000",         // 5 XRP
        Sequence: seq + 3,
        Fee: "0",
        SigningPubKey: ""
    }}
  ],
  Sequence: seq
}

```

- **검증 포인트**: 실패한 inner가 있어도 **다른 inner들은 정상 반영**.

## 4. 구현 시 유의사항

- **Inner Transaction 제한**
    - `Fee: "0"`이어야 함 (Outer가 수수료 부담)
    - 서명 없음 (`SigningPubKey: ""`, `TxnSignature` 생략)
    - `Flags`에 `tfInnerBatchTxn (0x40000000)` 필수
- **Outer Transaction**
    - 모든 Inner를 포함하고, 필요한 경우 `BatchSigners`로 다중 계정 서명 포함
- **Inner Transaction 수**
    - 최대 8개 (향후 완화 가능)
