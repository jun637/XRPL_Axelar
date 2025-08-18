---

## 들어가며

### 1. XRPL (XRP Ledger)의 특징

- XRPL(XRP Ledger)은 빠른 거래 확정성(Finality)과 낮은 수수료, 그리고 계정 기반 구조(AccountSet, TrustLine 등)라는 특유의 설계를 갖춘 블록체인입니다.
- 메인넷과 Devnet은 구조적으로 동일하지만, 메인넷과 Devnet은 구조적으로 동일하지만, Devnet은 무료 발급 시드와 Faucet을 통한 테스트 자산 지급이 가능하며, 최신 기능들을 시험할 수 있어 이번 프로젝트에서는 Devnet 환경을 사용했습니다.

---

### **2. 해당 문서의 목적**

- 각 기능(Amendment/기본 트랜잭션) 별로 폴더를 나누고, 해당 기능을 활용하는 **짧고 명확한 시나리오 기반 코드** 제공
- 복잡한 구현보다 직관적이고 학습 중심적인 코드 예시 제공에 초점을 맞춤.
- XRPL 개발 입문자가 XRPL 주요 기능을 빠르게 이해하고 응용할 수 있는 **학습 자료**로 활용되도록 설계
## 문서 모음
- [Quickstart](./README.md#-quickstart)
- [XRPL 스크립트 가이드](./xrpl/README.md)
- [Wallet 예제](./xrpl/Wallet/README.md)
- [MPTokensV1](./xrpl/MPTokensV1/README.md)

---

### 3. 코드 및 콘솔 출력값의 구조

- 해당 프로젝트에서는 XRPL의 주요 기능들을 폴더 구조로 나누어, 각 기능들을 구성하는 짧고 명확한 시나리오 스크립트를 폴더에 배치했습니다.
- 폴더 내부 예제 코드는 복잡한 구현보다는 직관적인 학습과 테스트에 초점을 맞추어 코드의 구조를 통일했으며, 스크립트를 실행하면 트랜잭션 JSON 원문 로그가 함께 출력되도록 구성했습니다.
- 각 스크립트에서 사용될 코드의 구조는 다음과 같습니다 :

```tsx
import dotenv from "dotenv"                                         //
import path from "path"                                             //1. 필요한 모듈 import 
import { Client, Wallet, TrustSet as TrustSetTx } from "xrpl"       //

dotenv.config({ path: path.join(__dirname, "..", ".env") })         // 2. 환경변수 로드 모듈

export async function TrustSet() {                                 //
  const client = new Client("wss://s.devnet.rippletest.net:51233") // 3. XRPL 연결 (Devnet)
  await client.connect()                                           //

  const ADMIN_SEED = process.env.ADMIN_SEED                        //
  const USER_SEED = process.env.USER_SEED                          // 4. 환경변수에서 시드 불러오기
  if (!ADMIN_SEED || !USER_SEED) throw new Error("Missing env: ADMIN_SEED, USER_SEED")

  const admin = Wallet.fromSeed(ADMIN_SEED.trim())                 //
  const user = Wallet.fromSeed(USER_SEED.trim())                   // 5. 불러온 시드로 지갑 연결
 

  // TrustSet 트랜잭션
  const tx: TrustSetTx = {                                         //
    TransactionType: "TrustSet",                                   //
    Account: user.address,                                         //
    LimitAmount: {                                                 //6. 핵심부(메인 트랜잭션)
      currency: "USD",                                             //
      issuer: admin.address,                                       //
      value: "10000",                                              //
    },                                                             //
  }                                                                //

  try {
    const prepared = await client.autofill(tx)                     //
    const signed = user.sign(prepared)                             //7. 트랜잭션 서명
    const result = await client.submitAndWait(signed.tx_blob)      //

    console.log(JSON.stringify(result, null, 2))                   //8. 트랜잭션 원문 콘솔에 출력 
    return result
  } finally {
    await client.disconnect()                                      //9. XRPL 연결 해제
  }
}

if (require.main === module) {
  TrustSet().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}

```

- 실행 후 출력되는 로그는 다음과 같습니다 :

```bash
                           # 확인할 부분(하단에 위치)
    "TransactionIndex": 0,
    "TransactionResult":"tesSUCCESS" # 트랜잭션 실행 결과 코드 (tesSUCCESS = 정상 처리 완료)
    },
    "tx_json": {                    # 실제 제출된 트랜잭션 원문(JSON)
      "Account": "rnD149aGRA''",    # 트랜잭션 서명/제출 계정 주소
      "Fee": "1",                   # 수수료 (drops 단위, 1 drop = 0.000001 XRP)
      "Flags": 0,                   # 플래그 값 (0이면 특별한 설정 없음)
      "LastLedgerSequence": 5223890,# 이 Ledger Index까지만 유효 (그 이후에는 무효)
      "LimitAmount": {              # 한도 설정 값(amount)
        "currency": "USD",          # 통화 코드
        "issuer": "rER8ArNF''"      # 발행자 주소
        "value": "10000"            # 허용 한도 (여기선 10,000 USD)
      },
      "Sequence": 4836822,          # 계정의 현재 시퀀스 번호
      "SigningPubKey": "EDEC88~",   # 서명에 사용된 공개키
      "TransactionType": "TrustSet",# 트랜잭션 타입 (TrustSet = 신용한도 설정)
      "TxnSignature": "3FD7E071~",  # 서명 결과값 (트랜잭션 무결성 검증에 사용)
      "ctid": "C04FB5C000000002",   # Compact Transaction ID
      "date": 808200681,            # Ledger Epoch 기준 timestamp 
      "ledger_index": 5223872       # 포함된 원장(Ledger) 번호
    },
    "validated": true               # 해당 트랜잭션이 원장에 최종 반영되었는지 여부
  },
  "type": "response"
}
```

이를 통해 트랜잭션 타입(TxType), 계정(Account), 금액(Amount), 수수료(Fee) 등의 필드를 직접 확인할 수 있습니다. 각 스크립트 실행 로그에서 핵심적인 내용은 폴더별 README에 명시해 놓았습니다.

---

### 4. 목적에 따른 문서 활용법

- XRPL 개발이 처음이라면 : Quickstart를 먼저 따라한 뒤, Wallet, Payment, TrustSet 등의 기본적인 기능 먼저 테스트 -> 정상 동작 확인 후 다른 주요 기능 README를 따라 실행
- 특정 기능만 테스트하려면 : Quickstart를 따라한 뒤, 해당 기능 폴더의 README로 바로 이동해 시나리오 학습 후 실행
- 전체 흐름을 학습하려면 : Quickstart를 따라한 뒤 주요 기능 2~3개(ex. PermissionedDomains - Credential - PermissionedDEX) 를 조합해 테스트

**루트 README(하이퍼링크)는 전체적인 맥락을 제공하며, 각 폴더 README는 기능별 상세 가이드와 실행 예시를 제공합니다**. **본 문서는 향후 기능과 예제를 지속적으로 업데이트할 예정이며, 이를 통해 XRPL의 다양한 기능을 실습하고 응용할 수 있습니다.**

---

## **🚀 Quickstart(깃허브 링크)**

먼저 깃허브 repo를 본인의 작업환경으로 가져온 뒤, 의존성 및 필요 라이브러리를 설치합니다.

```bash
# 0) 레포 클론 (혹은 수정/PR을 원한다면 먼저 Fork 후 클론)
git clone https://github.com/jun637/XRPL.git
cd XRPL

# 1) 의존성 설치
npm install
```

다음으로 해당 문서 기능을 테스트하기 위해 필요한 XRPL Devnet 지갑 3개를 생성합니다.

```bash
# 2) 시나리오 테스트에 필요한 지갑(Admin,User,User2 - 총 3개) 생성 후 출력되는 시드를 환경변수 파일(.env)에 기록

# 지갑 생성 후 환경변수 입력하는 방법

# 2-1. 아래 명령어를 터미널에 입력(총 3번 실행)
npx ts-node xrpl/Wallet/createNewWallet.ts

# 2-2. 1회 실행 시마다 아래와 같은 로그가 출력됨 
주소: r""""""""""""""""""""""""""""""
시드: sE"""""""""""""""""""""""""""""  # <- 이 값 복사해서 .env 파일에 입력!
공개키: E""""""""""""""""""""""""""""

# 2-3. .env 파일 예시
#   ADMIN_SEED=sEdXXXXXXXXXXXXXXXXX   <- 첫 번째 시드(Admin)
#   USER_SEED=sEdYYYYYYYYYYYYYYYYY    <- 두 번째 시드(User)
#   USER2_SEED=sEdZZZZZZZZZZZZZZZZ    <- 세 번째 시드(User2)
```

기능을 테스트하기 위해, 지갑을 활성화한 뒤, 원하는 기능에 대한 작업을 진행하면 됩니다.

```bash
# 3) 지갑 활성화
npx ts-node xrpl/Wallet/faucet.ts #<- 필수

# 4) 간단한 기능 테스트
npx ts-node xrpl/Wallet/LoadWallet.ts # 지갑의 주소와 시드 확인
npx ts-node xrpl/Wallet/WalletInfo.ts # 지갑의 잔고, 신뢰선, 시퀀스 등 전반적인 정보 확인

# 5) 서버 기능 확인 (선택)
npx ts-node xrpl/Server/serverInfo.ts # 연결된 노드의 rippled 버전 (2.5.0) 및 
                                      # 현재 네트워크에서의 기능(Amendments) 활성화 여부 확인
```

---

## 🗂️ 전체 디렉토리 구조

```bash
xrpl/
├── Wallet/
│ ├── createNewWallet.ts
│ ├── faucet.ts
│ ├── LoadWallet.ts
│ └── WalletInfo.ts
│
├── Payment/
│ ├── sendIOU.ts
│ └── sendXRP.ts
│
├── TrustSet/
├ ├── requireAuth.ts
│ └── TrustSet.ts
│
├── AccountSet/
│ └── AccountSet.ts
│
├── Credential/
│ ├── acceptCredential.ts
│ ├── checkCredential.ts
│ ├── createCredential.ts
│ └── deleteCredential.ts
│
├── PermissionedDEX/
│ ├── bookOffers.ts
│ ├── cancelOffer.ts
│ └── createPermissionedOffer.ts
│
├── PermissionedDomains/
│ ├── AcceptedCredentials.ts
│ ├── createDomain.ts
│ └── deleteDomain.ts
│
├── TokenEscrow/
│ ├── escrowCancel.ts
│ ~~├── escrowCreateIOU.ts~~
│ ├── escrowCreateMPT.ts
│ └── escrowFinish.ts
│
├── MPTokensV1/
│ ├── authorizeHolder.ts
│ ├── createIssuance.ts
│ ├── destroyIssuance.ts
│ ├── sendMPT.ts
│ └── setIssuance.ts
│
├── Batch/
│ ├── AllOrNothing.ts
│ ├── Independent.ts
│ ├── OnlyOne.ts
│ └── UntilFailure.ts
│
├── Server/
│ └── serverInfo.ts
│
```

## 

---

[📦 주요 기능(폴더)별 README](https://www.notion.so/24c898c680bf80b2b1d5cb52714c2fbf?pvs=21)

### XRPL Devnet Explorer(트랜잭션 확인)

https://devnet.xrpl.org/

---

## **🌐 네트워크 / 버전**

네트워크: XRPL Devnet (wss://s.devnet.rippletest.net:51233)

rippled 버전: 2.5.0

xrpl.js 버전: package.json 참조

Node.js: LTS 권장

---
