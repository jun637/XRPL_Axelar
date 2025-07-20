# XRPL ↔ Axelar 크로스체인 전송 시스템

이 프로젝트는 **XRPL(리플) 네트워크에서 스테이블코인(또는 XRP/IOU)을 발행**한 뒤, **Axelar Interchain Token Service(ITS)**를 활용하여 이더리움 등 타 블록체인 네트워크로 안전하게 크로스체인 전송하는 과정을 자동화한 시스템입니다.

### 🏦 시스템 구조 및 핵심 원리

**XRPL에는 스마트컨트랙트가 없으므로, 모든 상호작용은 Payment 트랜잭션 + Memo 필드로 이루어집니다.**

- **Axelar Gateway 및 ITS 역할은 XRPL의 multisig 계정이 대행**
- **사용자는 multisig 계정으로 Payment를 보내고, Memo에 크로스체인 정보를 담아 전송**
- **Axelar 네트워크가 Memo 정보를 해석하여 타 체인으로 토큰화 전송**

### 🔗 실제 크로스체인 전송 트랜잭션 구조

```json
{
  "TransactionType": "Payment",
  "Account": "user.address",           // 송신자 XRPL 계정
  "Amount": "1000000",                 // 전송할 XRP(또는 IOU) drops 단위, 가스 포함
  "Destination": "multisig.address",   // Axelar multisig 계정
  "Memos": [
    {
      "Memo": {
        "MemoType": "74797065",        // hex("type")
        "MemoData": "696e746572636861696e5f7472616e73666572" // hex("interchain_transfer")
      }
    },
    {
      "Memo": {
        "MemoType": "64657374696e6174696f6e5f61646472657373", // hex("destination_address")
        "MemoData": "<hex-encoded EVM address>" // 예: 0x... (0x 없이, hex 인코딩)
      }
    },
    {
      "Memo": {
        "MemoType": "64657374696E6174696F6E5F636861696E", // hex("destination_chain")
        "MemoData": "<hex-encoded chain name>" // 예: xrpl-evm-devnet
      }
    },
    {
      "Memo": {
        "MemoType": "6761735f6665655f616d6f756e74", // hex("gas_fee_amount")
        "MemoData": "<hex-encoded gas fee>" // 예: 30 (drops)
      }
    }
  ]
}
```

## 🚀 주요 기능

- **Admin → User XRP 발행**: 관리자가 사용자에게 XRP 발행
- **User → Axelar Gateway 전송**: 사용자가 Axelar Gateway로 XRP 전송
- **ITS(Interchain Token Service) 토큰화**: XRP를 이더리움 네트워크로 토큰화 전송
- **실시간 전송 상태 모니터링**
- **완전한 전송 검증 및 리포트 생성**

## 📋 시스템 요구사항

- Node.js 18.0 이상
- TypeScript 5.0 이상
- npm 또는 yarn

## 🛠️ 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 정보를 설정하세요:

```env
# XRPL 설정
XRPL_TESTNET_URL=wss://s.altnet.rippletest.net:51233
XRPL_MAINNET_URL=wss://xrplcluster.com

# Ethereum 설정
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHEREUM_PRIVATE_KEY=your_private_key

# Axelar 설정
AXELAR_RPC_URL=https://axelar-testnet-rpc.axelar-dev.workers.dev
AXELAR_CHAIN_ID=axelar-testnet

# ITS 컨트랙트 주소
ITS_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# API 키들
INFURA_API_KEY=your_infura_key
ALCHEMY_API_KEY=your_alchemy_key
```

## 🎯 사용법

### 전체 크로스체인 전송 실행

모든 단계를 순차적으로 실행하려면:

```bash
npm run complete-transfer
```

### 개별 단계 실행

특정 단계만 실행하려면:

```bash
# Step 1: XRPL 연결
npm run step1

# Step 2: 잔액 확인
npm run step2

# Step 3: Admin → User XRP 발행
npm run step3

# Step 4: User → Axelar Gateway 전송
npm run step4

# Step 5: ITS 토큰 등록 확인 및 크로스체인 전송
npm run step5

# Step 6: GMP 메시지 전송
npm run step6

# Step 7: ITS 컨트랙트 실행
npm run step7

# Step 8: 최종 확인
npm run step8
```

## 📁 프로젝트 구조

```
xrpl-wallet-creator/
├── step1_xrpl_connection.ts          # XRPL 연결 및 지갑 로드
├── step2_balance_check.ts            # Admin/User 잔액 확인
├── step3_xrpl_to_axelar.ts           # Admin → User XRP 발행
├── step4_axelar_gateway_processing.ts # User → Axelar Gateway 전송
├── step5_its_cross_chain_transfer.ts # ITS 토큰 등록 확인 및 크로스체인 전송
├── step6_gmp_message_transmission.ts # GMP 메시지 전송
├── step7_its_contract_execution.ts   # ITS 컨트랙트 실행
├── step8_final_verification.ts       # 최종 확인
├── run-complete-transfer.ts          # 전체 실행 스크립트
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 기술 스택

- **Blockchain**: XRPL, Ethereum, Axelar
- **Language**: TypeScript
- **Libraries**: 
  - `xrpl`: XRPL 클라이언트
  - `ethers`: Ethereum 인터페이스
  - `@axelar-network/axelarjs-sdk`: Axelar SDK
  - `@axelar-network/interchain-token-service`: ITS 서비스

## 📊 전송 과정

1. **XRPL 연결**: XRPL 테스트넷에 연결하고 Admin/User 지갑 로드
2. **잔액 확인**: Admin과 User 계정의 XRP 잔액 확인
3. **Admin → User XRP 발행**: 관리자가 사용자에게 XRP 전송
4. **User → Axelar Gateway 전송**: 사용자가 Axelar Gateway로 XRP 전송 (크로스체인 정보 포함)
5. **ITS 토큰 등록 확인 및 크로스체인 전송**: ITS에서 XRP 토큰 등록 상태 확인 후 크로스체인 전송
6. **GMP 메시지 전송**: General Message Passing 메시지 전송
7. **ITS 컨트랙트 실행**: 목적지 체인에서 ITS 컨트랙트 실행
8. **최종 확인**: 전체 전송 과정 검증 및 완료

## 🔄 전송 흐름

```
Admin 지갑 → User 지갑 (XRP 발행)
     ↓
User 지갑 → Axelar multisig (Payment + Memo)
     ↓
multisig → Axelar 네트워크 (Memo 해석)
     ↓
Axelar ITS → Ethereum (토큰화된 XRP 전달)
```

### 💡 실전 예시

```bash
# Axelar 공식 문서의 실제 명령어 예시
ts-node xrpl/interchain-transfer.js -e devnet-amplifier -n xrpl XRP 1 xrpl-evm-sidechain 0x0A90c0Af1B07f6AC34f3520348Dbfae73BDa358E --gasFeeAmount 0
```

위 명령어는 XRPL에서 1 XRP를 EVM 사이드체인 주소로 전송하는 예시입니다. 실제로는 Payment 트랜잭션의 Memo에 크로스체인 정보가 담깁니다.

## 🚨 주의사항

- 이 프로젝트는 **테스트넷**용으로 설계되었습니다
- 실제 자금을 사용하기 전에 충분한 테스트를 진행하세요
- 개인키는 절대 공개하지 마세요
- 환경 변수 파일(.env)을 .gitignore에 추가하세요

## 🐛 문제 해결

### 일반적인 오류

1. **TypeScript 컴파일 오류**
   ```bash
   npm install @types/node
   ```

2. **XRPL 연결 실패**
   - 네트워크 연결 확인
   - XRPL 테스트넷 상태 확인

3. **Ethereum RPC 오류**
   - Infura/Alchemy API 키 확인
   - 네트워크 설정 확인

### 로그 확인

각 단계별로 상세한 로그가 출력됩니다. 오류 발생 시 해당 단계의 로그를 확인하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면:

1. GitHub Issues에 문제를 등록하세요
2. 로그 파일을 첨부해주세요
3. 사용한 명령어와 환경 정보를 포함해주세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**⚠️**: 이 프로젝트는 테스트 목적으로 제작되었습니다. 

## 단계별 핵심 로직 요약

### [Step 1] XRPL 연결 및 지갑 로드
**핵심 로직:**
- XRPL 테스트넷에 연결하고 Admin/User 지갑을 로드합니다.
- 파일: `step1_xrpl_connection.ts`
```ts
// XRPL 네트워크 연결 및 지갑 로드
await client.connect();
this.adminWallet = Wallet.fromSeed(adminSeed);
this.userWallet = Wallet.fromSeed(userSeed);
```

---

### [Step 2] 잔액 확인
**핵심 로직:**
- Admin과 User의 XRP 잔액을 확인합니다.
- 파일: `step2_balance_check.ts`
```ts
// 잔액 확인
const adminBalance = await client.getXrpBalance(adminWallet.address);
const userBalance = await client.getXrpBalance(userWallet.address);
```

---

### [Step 3] Admin → User XRP 발행
**핵심 로직:**
- Admin 지갑에서 User 지갑으로 XRP를 전송합니다.
- 파일: `step3_xrpl_to_axelar.ts`
```ts
// ⭐ 핵심: Admin에서 User로 XRP 발행 (XRPL 내부 전송)
const paymentTx = {
  TransactionType: 'Payment',
  Account: this.adminWallet.address,      // 👑 Admin 지갑 (발행자)
  Destination: this.userWallet.address,   // 👤 User 지갑 (수신자)
  Amount: xrpl.xrplToDrops(amount)        // 💰 전송할 XRP 양 (drops 단위로 변환)
}
```
이 코드는 Admin이 User에게 실제로 XRP를 지급하는 부분입니다.

---

### [Step 4] User → Axelar Gateway 전송
**핵심 로직:**
- User가 Axelar Gateway(multisig 계정)로 XRP를 전송하며, Memo 필드에 크로스체인 정보를 포함합니다.
- 파일: `step4_axelar_gateway_processing.ts`

**실제 트랜잭션 구조 (Axelar 공식 문서 기반):**
```json
{
  "TransactionType": "Payment",
  "Account": "user.address",           // 👤 User 지갑 (실제 전송자)
  "Amount": "1000000",                 // 💰 전송할 XRP 양 (drops 단위)
  "Destination": "multisig.address",   // 🌉 Axelar multisig 계정 (Gateway 역할)
  "Memos": [
    {
      "Memo": {
        "MemoType": "74797065",        // hex("type")
        "MemoData": "696e746572636861696e5f7472616e73666572" // hex("interchain_transfer")
      }
    },
    {
      "Memo": {
        "MemoType": "64657374696e6174696f6e5f61646472657373", // hex("destination_address")
        "MemoData": "<hex-encoded EVM address>" // 🎯 이더리움 주소 (0x 없이)
      }
    },
    {
      "Memo": {
        "MemoType": "64657374696E6174696F6E5F636861696E", // hex("destination_chain")
        "MemoData": "<hex-encoded chain name>" // 🎯 목적지 체인 (예: xrpl-evm-devnet)
      }
    },
    {
      "Memo": {
        "MemoType": "6761735f6665655f616d6f756e74", // hex("gas_fee_amount")
        "MemoData": "<hex-encoded gas fee>" // ⛽ 가스 수수료
      }
    }
  ]
}
```

**코드 구현:**
```ts
// ⭐ 핵심: 크로스체인 전송 정보 구성
const crossChainInfo = {
  destinationChain: 'ethereum',           // 🎯 목적지 체인
  destinationAddress: memoData.destinationAddress, // 🎯 최종 수신자 (이더리움 주소)
  tokenSymbol: 'XRP',                     // 🪙 전송할 토큰
  amount: memoData.amount,                // 💰 전송 금액
  timestamp: Date.now(),                  // ⏰ 타임스탬프
  transferId: ...                         // 🆔 고유 전송 ID
}
// ⭐ 핵심: User에서 Axelar Gateway로 XRP 전송 (크로스체인 전송 시작)
const paymentTx = {
  TransactionType: 'Payment',
  Account: memoData.userAddress,           // 👤 User 지갑 (실제 전송자)
  Destination: this.gatewayAddress,        // 🌉 Axelar Gateway 주소
  Amount: xrpl.xrplToDrops(memoData.amount), // 💰 전송할 XRP 양
  Memos: [{ Memo: { MemoType: memoType, MemoData: memoDataHex } }]
}
```

**설명:** 이 코드는 User가 크로스체인 전송을 시작하는 부분입니다. Axelar 공식 문서의 트랜잭션 구조와 동일하게, multisig 계정으로 Payment를 보내고 Memo 필드에 크로스체인 정보를 hex로 인코딩하여 포함합니다.

---

### [Step 5] ITS 토큰 등록 확인 및 크로스체인 전송
**핵심 로직:**
- XRP가 ITS에 등록되어 있는지 확인하고, 실제 크로스체인 전송을 요청합니다.
- 파일: `step5_its_cross_chain_transfer.ts`

**실제 ITS 전송 과정:**
1. **multisig 계정이 Memo 정보를 해석**하여 Axelar 네트워크로 전달
2. **Axelar ITS가 XRPL의 XRP를 이더리움의 토큰화된 XRP로 변환**
3. **목적지 체인에서 토큰화된 자산을 수령자에게 전달**

**코드 구현:**
```ts
// ⭐ 핵심: ITS 토큰 등록 확인 (Step 5 기능 통합)
const tokenRegistration = await this.axelarJS.getTokenRegistration({
  tokenSymbol: 'XRP',
  sourceChain: 'xrpl',
  destinationChain: 'ethereum'
});
if (!tokenRegistration.isRegistered) {
  throw new Error('XRP 토큰이 ITS에 등록되지 않았습니다');
}
// ⭐ 핵심: ITS 토큰화 전송 요청 구성 (실제 크로스체인 전송)
const itsTransferRequest = {
  sourceChain: 'xrpl',                     // 📤 출발 체인
  destinationChain: 'ethereum',            // 📥 목적지 체인
  tokenSymbol: 'XRP',                      // 🪙 토큰 심볼
  amount: transferParams.amount,           // 💰 전송 금액
  sourceAddress: transferParams.sourceAddress,      // 👤 User 지갑 주소 (XRPL)
  destinationAddress: transferParams.destinationAddress, // 🎯 이더리움 주소
  tokenId: tokenRegistration.tokenId,      // 🆔 토큰 ID
  fee: fee,                                // 💸 수수료
  gasLimit: this.estimateGasLimit('ethereum'), // ⛽ 가스 한도
  gasPrice: await this.getGasPrice('ethereum'), // ⛽ 가스 가격
  // 🚀 ITS 특별 파라미터 (크로스체인 전송용)
  interchainTokenId: tokenRegistration.interchainTokenId, // 🔗 인터체인 토큰 ID
  salt: this.generateSalt(),               // 🧂 보안용 솔트
  expiry: Date.now() + (30 * 60 * 1000)   // ⏰ 만료 시간 (30분)
}
```

**설명:** 이 코드는 ITS를 통한 실제 크로스체인 전송의 핵심입니다. Step 4에서 multisig로 보낸 Payment 트랜잭션의 Memo 정보를 바탕으로, Axelar ITS가 XRPL의 네이티브 XRP를 이더리움의 토큰화된 XRP로 변환하여 전송합니다.

---

### [Step 6] GMP 메시지 전송
**핵심 로직:**
- GMP(General Message Passing) 메시지를 전송하여 상태를 동기화합니다.
- 파일: `step6_gmp_message_transmission.ts`

**실제 GMP 트랜잭션 구조 (Axelar 공식 문서 기반):**
```json
{
  "TransactionType": "Payment",
  "Account": "user.address",           // 송신자 XRPL 계정
  "Amount": "1000000",                 // 가스 수수료용 XRP (drops)
  "Destination": "multisig.address",   // Axelar multisig 계정
  "Memos": [
    {
      "Memo": {
        "MemoType": "74797065",        // hex("type")
        "MemoData": "63616c6c5f636f6e7472616374" // hex("call_contract")
      }
    },
    {
      "Memo": {
        "MemoType": "64657374696e6174696f6e5f61646472657373", // hex("destination_address")
        "MemoData": "<hex-encoded contract address>" // 스마트컨트랙트 주소
      }
    },
    {
      "Memo": {
        "MemoType": "64657374696E6174696F6E5F636861696E", // hex("destination_chain")
        "MemoData": "<hex-encoded chain name>" // 목적지 체인
      }
    },
    {
      "Memo": {
        "MemoType": "7061796c6f6164", // hex("payload")
        "MemoData": "<abi-encoded payload>" // 스마트컨트랙트 호출 데이터
      }
    }
  ]
}
```

**코드 구현:**
```ts
// GMP 메시지 전송
await gmp.sendGMPMessage({ ... });
```

**설명:** GMP는 순수한 메시지 전송으로, 토큰 전송 없이 스마트컨트랙트를 호출할 수 있습니다. Step 4와 동일한 구조이지만 MemoType이 "call_contract"이고 payload가 포함됩니다.

---

### [Step 7] ITS 컨트랙트 실행
**핵심 로직:**
- 이더리움 등 목적지 체인에서 ITS 컨트랙트를 실행합니다.
- 파일: `step7_its_contract_execution.ts`
```ts
// ITS 컨트랙트 실행
await itsContract.executeITSContract({ ... });
```

---

### [Step 8] 최종 확인
**핵심 로직:**
- 전체 전송 과정이 정상적으로 완료되었는지 검증합니다.
- 파일: `step8_final_verification.ts`
```ts
// 최종 검증 및 리포트 생성
await finalVerifier.performFinalVerification(...);
``` 