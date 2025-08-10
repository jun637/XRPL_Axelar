## 1. MPT(Multi-Purpose Token)이란?

MPT는 **XRPL의 새로운 펀저블 토큰 타입**으로, 기존 IOU(양방향 트러스트라인)보다 **단순한 발행·보유 모델**을 제공한다.

토큰은 두 가지 원장 객체로 다뤄진다:

- **MPTokenIssuance**: 발행 정의(스케일, 최대발행량, 전송/락/클로백/권한필요 등의 정책)
- **MPToken**: 개별 계정이 특정 발행본을 얼마나 보유하는지

> v1의 특징: 직접 결제만 지원(계정→계정). DEX 거래는 불가.
> 

---

## 2. 왜 필요한가?

- **간결한 운영 모델**
    
    Trustline 없이 발행·전송 중심의 단방향 모델.
    
- **정책 일원화**
    
    전송 가능 여부, 권한 필요(RequireAuth), 락/언락, 클로백 등의 **발행본 단위 정책**을 한 곳에서 관리.
    
- **명확한 식별자**
    
    결제에 **MPTokenIssuanceID**(고유 ID)를 사용 → 토큰 정의를 명확히 구분.
    
- **스케일(소수점) 내장**
    
    `AssetScale`로 최소단위를 정의 → 금액 처리가 예측 가능.
    

---

## 3. 시나리오: `createIssuance` → `authorizeHolder` → `sendMPT` (+ `setIssuance`, `destroyIssuance` )

### Step 1. 발행 정의 생성 (`createIssuance.ts`)

- **주체**: ADMIN(발행자)
- **행동**: `MPTokenIssuanceCreate`  트랜잭션 전송
- **내용**:
    - `AssetScale`(소수 자리수), `MaximumAmount`(선택), `Flags`( `tfMPTCanTransfer`, `tfMPTRequireAuth` 등) 지정
    - 
- **`tfMPTRequireAuth: true`** – 발행자가 사전 승인(`MPTokenAuthorize`)한 계정만 해당 MPT를 보유·수령 가능하게 하는 화이트리스트 모드. KYC/AML 등 규제 준수형 토큰에 활용.

```tsx
 const tx: Transaction = {
    TransactionType: "MPTokenIssuanceCreate",
    Account: admin.address,
    AssetScale: 0,                            // 소수 0자리
    MaximumAmount: "1000000000",             // 최대 발행량(옵션)
    Flags: {                                  // 플래그 예시
      tfMPTCanTransfer: true,
      tfMPTRequireAuth: true                  // 기본값은 false, 활성화 시 true로 전송
    },
    // MPTokenMetadata: "<hex-encoded string>" // 원하면 메타데이터(hex) 추가
  }
```

- 출력 예시

```powershell
IssuanceID(created): 006419063CEBEB49FC20032206CE0F203138BFC59F1A####
```

- **결과 로그에서 `IssuanceID`를 복사** → 이후 모든 단계에 사용

---

### Step 2. 홀더 권한 부여 (`authorizeHolder.ts`)

- **주체**: ADMIN
- **행동**: `MPTokenAuthorize` 트랜잭션 전송
- **내용**:
    - 발행본이 `tfMPTRequireAuth=true`면 **전송 전에** 홀더(USER)를 허가해야 함
    - `MPTokenIssuanceID: <복사한 ID>`, `Holder: USER.address`
    - (해제는 `Flags.tfMPTUnauthorize`)

1단계 : User가 Issuance에 옵트인

- Account : User 주소
- 트랜잭션 서명 주체 : User

```tsx
// createIssuance 실행 로그에서 복사한 IssuanceID
const ISSUANCE_ID = "006419063CEBEB49FC20032206CE0F203138BFC59F1A####"

const tx: Transaction = {
   TransactionType: "MPTokenAuthorize",
   Account: user.address,
   MPTokenIssuanceID: ISSUANCE_ID,
   //Holder 필드는 사용하지 않음 
   // Flags: { tfMPTUnauthorize: true } // 해제하고 싶을 때만 사용
}

 const prepared = await client.autofill(tx)
 const signed = user.sign(prepared) // 트랜잭션 서명 주체 : User
 const result = await client.submitAndWait(signed.tx_blob)
```

2단계 : Admin(발행자)가 허용

- Account : Admin 주소
- Holder : User 주소
- 트랜잭션 서명 주체 : Admin

```tsx
// createIssuance 실행 로그에서 복사한 IssuanceID
const ISSUANCE_ID = "006419063CEBEB49FC20032206CE0F203138BFC59F1A####"

const tx: Transaction = {
   TransactionType: "MPTokenAuthorize",
   Account: admin.address,
   MPTokenIssuanceID: ISSUANCE_ID,
   Holder: user.address
   // Flags: { tfMPTUnauthorize: true } // 해제하고 싶을 때만 사용
}
```

---

### Step 3. MPT 결제 (`sendMPT.ts`)

- **주체**: ADMIN(보내는 쪽)
- **행동**: `Payment` 트랜잭션 전송
- **내용**:
    - `Amount`는 **MPTAmount** 형식:
        
        `{ mpt_issuance_id: "<복사한 ID>", value: "<정수 문자열>" }`
        
    - v1은 **직접 결제만** 지원(DEX/경로탐색 없음)

```tsx
// createIssuance 실행 로그에서 복사한 IssuanceID
const ISSUANCE_ID = "006419063CEBEB49FC20032206CE0F203138BFC59F1A####"

const tx: Transaction = {
    TransactionType: "Payment",
    Account: admin.address,
    Destination: user.address,
    Amount: {
      mpt_issuance_id: ISSUANCE_ID,
      value: "100"
    }
    // 필요시 DeliverMax/SendMax도 같은 구조로 추가 가능
}
```

---

### (옵션) Step 4. 발행본 락/언락 (`setIssuance.ts`)

- **주체**: ADMIN
- **행동**: `MPTokenIssuanceSet` 트랜잭션 전송
- **내용**:
    - **글로벌 잠금/해제**: `Flags.tfMPTLock` / `Flags.tfMPTUnlock`
    - **특정 홀더만 잠금/해제**: `Holder`에 대상 주소 지정 + 같은 플래그 사용
    - 효과: 잠금 중에는 해당 범위 전송/사용 제한(정책에 따름)

```tsx
// createIssuance 실행 로그에서 복사한 IssuanceID
const ISSUANCE_ID = "006419063CEBEB49FC20032206CE0F203138BFC59F1A####"

// ===== CLI 인자 파싱 =====
// 사용법: ts-node setIssuance.ts <lock|unlock> [holderAddress]
// - 첫 번째 인자(mode): "lock" 이면 잠금, "unlock" 이면 잠금 해제
// - 두 번째 인자(holder): 선택값. 특정 홀더만 잠그거나 풀 때 그 XRPL 주소를 넣음.
//   * holder를 생략하면 "글로벌" 적용(발행본 전체를 잠그거나 풂).
const mode = (process.argv[2] || "").toLowerCase()
const holder = process.argv[3]

// 인자 검증: lock/unlock 외 값이면 사용법 안내 후 종료(비정상 종료 코드 1)
if (mode !== "lock" && mode !== "unlock") {
  console.error('Usage: ts-node setIssuance.ts <lock|unlock> [holderAddress]')
  process.exit(1)
}

// XRPL 트랜잭션 Flags 설정
// - MPTokenIssuanceSet는 boolean 플래그로 설정 가능
//   * { tfMPTLock: true }   -> 잠금
//   * { tfMPTUnlock: true } -> 잠금 해제
const flags = mode === "lock" ? { tfMPTLock: true } : { tfMPTUnlock: true }

// ===== 트랜잭션 구성 =====
const tx: Transaction = {
  TransactionType: "MPTokenIssuanceSet",
  Account: admin.address,            // 발행자(ADMIN) 서명/전송
  MPTokenIssuanceID: ISSUANCE_ID,    // createIssuance 결과로 얻은 발행 정의 ID

  // Holder 필드는 선택값:
  // - 포함하면 "해당 홀더 주소만" 대상(개별 잠금/해제)
  // - 생략하면 발행본 전체 대상(글로벌 잠금/해제)
  ...(holder ? { Holder: holder } : {}),

  Flags: flags                       // 위에서 mode에 따라 lock/unlock 플래그 지정
}
```

- 사용 방법 : 터미널 명령어 예시

```bash
# 글로벌 잠금
$npx ts-node setIssuance.ts lock

# 글로벌 잠금 해제
$npx ts-node setIssuance.ts unlock

# 특정 홀더(User)만 잠금
$npx ts-node setIssuance.ts lock <user 주소>

# 특정 홀더(User)만 잠금 해제
$npx ts-node setIssuance.ts unlock <user주소>

```

---

### (옵션) Step 5. 발행 정의 삭제 (`destroyIssuance.ts`)

- **주체**: ADMIN
- **행동**: `MPTokenIssuanceDestroy` 트랜잭션 전송
- **성공 조건**: **모든 홀더의 잔액이 0**이어야 함(한 명이라도 남아있으면 실패)
- **효과**: 발행 정의 제거, 리저브 1 감소(소유 오브젝트 수 감소)

```tsx
// createIssuance 실행 로그에서 복사한 IssuanceID
const ISSUANCE_ID = "006419063CEBEB49FC20032206CE0F203138BFC59F1A####"

const tx: Transaction = {
    TransactionType: "MPTokenIssuanceDestroy",
    Account: admin.address,
    MPTokenIssuanceID: ISSUANCE_ID
  }
```
