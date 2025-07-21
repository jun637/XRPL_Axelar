### XRPL ↔ Axelar 크로스체인 전송 시스템

## 목적
XRPL(XRP Ledger)에서 발행한 스테이블코인(IOU)을 Axelar Interchain Token Service(ITS)를 통해 이더리움 등 타 블록체인으로 안전하게 전송하는 과정을 실제 코드로 구현하고, 실전에 적용할 수 있도록 문서화


## 목차
1. [기술 스택](#기술-스택)
2. [핵심 용어](#핵심-용어)
3. [전체 흐름](#전체-흐름)
4. [설치 및 환경설정](#설치-및-환경설정)
5. [XRPL 핵심 코드 및 설명](#XRPL-핵심-코드-및-설명)
    - [XRPL 연결 및 지갑 생성](#xrpl-연결-및-지갑-생성)
    - [계정 활성화(Payment)](#계정-활성화payment)
    - [TrustSet(신뢰설정)](#trustset신뢰설정)
    - [XRP/IOU 전송(Payment)](#xrpiou-전송payment)
6. [Axelar 핵심 코드 및 설명](#Axelar-핵심-코드-및-설명)
    - [크로스체인 전송 관련 트랜잭션(Memo)](#크로스체인-전송-관련-트랜잭션-memo)
7. [참고 자료/공식 문서](#참고-자료공식-문서)
8. [주의사항](#주의사항)
9. [라이선스](#라이선스)
---
## 기술 스택
- **Blockchain**: XRPL, Ethereum, Axelar
- **Language**: TypeScript
- **Libraries**:
  - [`xrpl`](https://js.xrpl.org/): XRPL 공식 JS/TS 라이브러리
  - [`ethers`](https://docs.ethers.org/): Ethereum 인터페이스
  - [`@axelar-network/axelarjs-sdk`](https://docs.axelar.dev/dev/axelarjs-sdk): Axelar SDK
  - [`@axelar-network/interchain-token-service`](https://docs.axelar.dev/dev/interchain-token-service): ITS 서비스
---
## 핵심 용어
**1. **XRPL**** - 리플의 퍼블릭 블록체인 네트워크

**2. **XRP**** - XRPL의 네이티브 토큰, 계정 활성화/수수료에 사용

**3. IOU** -XRPL에서 발행자가 발행하는 토큰(예: USD, USDT 등) 

**4. Trustset** - IOU 토큰 수신을 위한 신뢰 한도(Trustline) 설정 트랜잭션, XRPL의 네이티브 토큰인 XRP를 주고받는 데는 Trustset이 필요 없음.

**5. Payment** - 자산(XRP/IOU) 전송용 XRPL 트랜잭션,

**6. Memo** - 트랜잭션에 부가 정보를 담는 필드, 크로스체인 메타데이터 전달에 사용

**7. Multisig Account** - 여러 명이 서명해야 트랜잭션 실행되는 XRPL 계정, Axelar Gateway 역할

**8. Axelar Gateway** - XRPL과 타 체인(EVM 등) 간 크로스체인 전송 중계, XRPL에서는 multisig

**9. ITS** - Axelar의 크로스체인 토큰화 서비스

**10. GMP** - Axelar의 크로스체인 메시지/컨트랙트 호출 프로토콜

**11. Drops** - XRP의 최소 단위(1 XRP = 1,000,000 drops)

**12. EVM** - Ethereum Virtual Machine, 이더리움 및 호환 네트워크

---
## 전체 흐름
```

1. **XRPL 연결**: XRPL 테스트넷에 연결하고 Admin/User 지갑 로드
2. **잔액 확인**: Admin과 User 계정의 XRP 잔액 확인
3. **Admin → User IOU(XRP) 발행**: 관리자가 사용자에게 XRP 전송
4. **User → Axelar Gateway 전송**: 사용자가 Axelar Gateway로 XRP 전송 (크로스체인 정보 포함)
5. **ITS 토큰 등록 확인 및 크로스체인 전송**: ITS에서 XRP 토큰 등록 상태 확인 후 크로스체인 전송
6. **GMP 메시지 전송**: General Message Passing 메시지 전송
7. **ITS 컨트랙트 실행**: 목적지 체인에서 ITS 컨트랙트 실행
8. **최종 확인**: 전체 전송 과정 검증 및 완료
```
---
## 설치 및 환경설정
```bash
npm install
npm install ethers @axelar-network/axelarjs-sdk @axelar-network/interchain-token-service
# (TypeScript 개발 시)
npm install --save-dev typescript ts-node @types/node
cp .env.example .env # 환경변수 파일 생성 후 값 입력
```

* 환경변수(.env 파일) : 테스트용 지갑 시드, XRPL,Axelar,Ethereum 등 사용 네트워크의 RPC 및 프라이빗 키 등
---

## XRPL 핵심 코드 및 설명

### XRPL 연결 및 지갑 생성
- [XRPL 공식 문서: JS 라이브러리 - 지갑 생성](https://js.xrpl.org/interfaces/Wallet.html#generate)
```typescript
<<<<<<< HEAD
import { Client, Wallet } from 'xrpl'
const client = new Client('wss://s.altnet.rippletest.net:51233')
await client.connect()
// 기존 지갑 로드(admin용)
const adminWallet = Wallet.fromSeed('sEdThoRiyqRs7jZaBvYoL2ePXfQc5A6')
=======
>>>>>>> 6216f0dab24f220700564267e047585416368687
// 1. 새 지갑 생성(user)
const newWallet = Wallet.generate()
console.log(`📍 주소: ${newWallet.address}`)
console.log(`🔑 시드: ${newWallet.seed}`)
```
* XRPL에서는 Wallet.generete()로 오프라인에서 키쌍(지갑) 생성을 합니다. 다만 이 지갑이 활성화되려면 계정 활성화를 위한 트랜잭션을 제출해야 합니다.
* 위 코드에서는 하드코딩된 admin 지갑주소(XRPL에 기존 연결되어 있음)를 로드하고, Wallet.generate()로 user의 지갑을 생성합니다. 

### 계정 활성화(Payment)
- [XRPL 공식 Payment 트랜잭션](https://xrpl.org/payment.html)
```typescript
const fundTx = {
  TransactionType: 'Payment',
  Account: adminWallet.address, // Admin이 펀딩
  Destination: newWallet.address,
  Amount: '20000000', // 20 XRP in drops
  Fee: '12'
}
const prepared = await client.autofill(fundTx)
const signed = adminWallet.sign(prepared)
const result = await client.submitAndWait(signed.tx_blob)
if (result.result.meta?.TransactionResult === 'tesSUCCESS') {
  console.log('✅ 계정 활성화 완료')
}
```
* 실제로 XRPL 네트워크에 계정(지갑)이 등록되는 것은 위 Payment 트랜잭션(계정 활성화)를 통해서입니다.
* 이 때 base reserve로 최소 10XRP(테스트넷의 경우 20XRP)를 전송해야 계정이 활성화됩니다. 

### TrustSet(신뢰설정)
- [XRPL 공식 TrustSet 트랜잭션](https://xrpl.org/trustset.html)
```typescript
const trustSetTx = {
  TransactionType: 'TrustSet',
  Account: userWallet.address,
  LimitAmount: {
    currency: 'USD',
    issuer: 'rGatewayAddress',
    value: '10000'
  },
  Flags: 0,
  Fee: '12'
}
const prepared = await client.autofill(trustSetTx)
const signed = userWallet.sign(prepared)
const result = await client.submitAndWait(signed.tx_blob)
if (result.result.meta?.TransactionResult === 'tesSUCCESS') {
  console.log('✅ TrustLine 설정 완료')
}
```
* XRPL에서는 XRPL의 네이티브 토큰인 XRP를 제외한 IOU(토큰)를 받으려면, 해당 IOU의 issuer에 대해 trustline을 먼저 설정해야 합니다.
* 받는 쪽(수신자)이 반드시 해당 issuer에 대해 trustline을 먼저 설정해야 그 토큰을 받을 수 있습니다.
* 위 코드는 XRPL에서 Trustline을 설정하기 위한 TrustSet 트랜잭션 예시 코드입니다.
  
### XRP/IOU 전송(Payment)
- [XRPL 공식 Payment 트랜잭션](https://xrpl.org/payment.html)
```typescript
// 기존 지갑 로드(user용)
const userWallet = Wallet.fromSeed('sEd7Su6LCR6xaA1aYd3cHrWi6U4nRWg')
// XRP 전송
const paymentTx = {
  TransactionType: 'Payment',
  Account: adminWallet.address,
  Destination: userWallet.address,
  Amount: '10000000', // 10 XRP in drops
  Fee: '12'
}
// IOU 전송
const iouPaymentTx = {
  TransactionType: 'Payment',
  Account: adminWallet.address,
  Destination: userWallet.address,
  Amount: {
    currency: 'USD',
    issuer: 'rGatewayAddress',
    value: '1000'
  },
  Fee: '12'
}
```
---
## Axelar 핵심 코드 및 설명

### 크로스체인 전송 관련 트랜잭션(Memo)
- [Axelar 공식 문서: XRPL ITS](https://docs.axelar.dev/dev/send-tokens/xrpl/xrpl-its/)
- 크로스체인 전송 트랜잭션의 json 형식입니다. (Axelar 공식 문서 기반)
```
const crossChainTx = {
  TransactionType: "Payment",
  Account: userWallet.address,
  Amount: "1000000", // (1 XRP)
  // Amount: { // alternatively, an IOU token amount can be used to cover gas fees
  //   currency: "ABC", // IOU의 currency code
  //   issuer: "r4DVHyEisbgQRAXCiMtP2xuz5h3dDkwqf1", // IOU issuer의 XRPL 주소
  //   value: "1" // 브릿지할 IOU 수량 (이 예시에서는 1 ABC.r4DVH, 가스비 포함)
  // },
  Destination: gateway.address, // Axelar Gateway XRPL 주소
  Memos: [
    {
      Memo: {
        MemoType: "74797065", // hex("type")
        MemoData: "696e746572636861696e5f7472616e73666572" // hex("interchain_transfer")
      },
    },
    {
      Memo: {
        MemoType: "64657374696e6174696f6e5f61646472657373", // hex("destination_address")
        MemoData: "30413930633041663142303766364143333466333532303334384462666165373342446133353845" // hex("0A90c0Af1B07f6AC34f3520348Dbfae73BDa358E"), 0x 없이
      },
    },
    {
      Memo: {
        MemoType: "64657374696E6174696F6E5F636861696E", // hex("destination_chain")
        MemoData: "7872706c2d65766d2d6465766e6574", // hex("xrpl-evm-devnet")
      },
    },
    {
      Memo: {
        MemoType: "6761735f6665655f616d6f756e74", // hex("gas_fee_amount")
        MemoData: "30", // 가스비
      },
    },
    { // GMP 호출 시에만 포함
      Memo: {
        MemoType: "7061796c6f6164", // hex("payload")
        // abi-encoded payload/data with which to call the Executable destination contract address:
        MemoData: "0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e474d5020776f726b7320746f6f3f000000000000000000000000000000000000",
      },
    },
  ],
}
```
- 다음은 위의 트랜잭션 구조를 기반으로, xrpl.js 라이브러리로 실제로 트랜잭션을 만들어 전송하는 함수입니다.

```ts

await interchainTransfer({
  client,
  userWallet,
  gatewayAddress: 'rMultisigGatewayAddress',
  amount: '1000000',
  destinationEvmAddress: '30413930633041663142303766364143333466333532303334384462666165373342446133353845', // 0x 없이 hex
  destinationChain: 'xrpl-evm-devnet',
  gasFeeAmount: '30',
  // payloadHex: '...' // GMP 호출 시에만
})
```
---

## 🔄 전송 흐름

```
Admin 지갑 → User 지갑 (XRP 발행) - Payment 트랜잭션
     ↓
User 지갑 → Axelar Gateway(실제로는 XRPL multisig) - Payment + memo 형식의 크로스체인 트랜잭션 
     ↓
Axelar Gateway → Axelar 네트워크 (Memo 해석)
     ↓
Axelar ITS → Ethereum (토큰화된 XRP 전달)
```

**실제 전송 과정에서는 5~7의 단계는 Axelar ITS 내 Amplifier 노드가 자동 수행**

### 💡 실전 예시

```bash
# Axelar 공식 문서의 실제 명령어 예시
ts-node xrpl/interchain-transfer.js -e devnet-amplifier -n xrpl XRP 1 xrpl-evm-sidechain 0x0A90c0Af1B07f6AC34f3520348Dbfae73BDa358E --gasFeeAmount 0
```

위 명령어는 XRPL에서 1 XRP를 EVM 사이드체인 주소로 전송하는 예시입니다. 실제로는 Payment 트랜잭션의 Memo에 크로스체인 정보가 담깁니다.

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
- 파일: `step3_admin_to_user_xrp_issue.ts`
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
- 파일: `step4_user_to_gateway_payment.ts`

**실제 트랜잭션 구조 (Axelar 공식 문서 기반):**
[ITS Interchain transfer](https://github.com/axelarnetwork/axelar-contract-deployments/blob/main/xrpl/interchain-transfer.js)
```json
{
  "TransactionType": "Payment",
  "Account": "user.address",
  "Amount": "1000000",
  "Destination": "multisig.address",
  "Memos": [
    { "Memo": { "MemoType": "74797065", "MemoData": "696e746572636861696e5f7472616e73666572" } },
    { "Memo": { "MemoType": "64657374696e6174696f6e5f61646472657373", "MemoData": "<hex-encoded EVM address>" } },
    { "Memo": { "MemoType": "64657374696E6174696F6E5F636861696E", "MemoData": "<hex-encoded chain name>" } },
    { "Memo": { "MemoType": "6761735f6665655f616d6f756e74", "MemoData": "<hex-encoded gas fee>" } }
  ]
}
```

## 참고 자료/공식 문서
- [XRPL 공식 JS 라이브러리](https://js.xrpl.org/)
- [XRPL Payment 트랜잭션](https://xrpl.org/payment.html)
- [XRPL TrustSet 트랜잭션](https://xrpl.org/trustset.html)
- [Axelar 공식 문서: XRPL ↔ EVM](https://docs.axelar.dev/dev/xrpl)

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

 

## 📞 지원

문제가 발생하거나 질문이 있으시면:

1. GitHub Issues에 문제를 등록하세요
2. 로그 파일을 첨부해주세요
3. 사용한 명령어와 환경 정보를 포함해주세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**⚠️**: 이 프로젝트는 테스트 목적으로 제작되었습니다. 
