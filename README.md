# XRPL 핵심 기능별 샘플 코드

## ✅ 목적
각 기능(Amendment/기본 트랜잭션) 별로 폴더를 나누고, 해당 기능을 활용하는 **짧고 명확한 시나리오 기반 코드** 제공  
복잡한 구현보다 직관적이고 학습 중심적인 코드 예시 제공에 초점을 맞춤.  
해커톤 참가자 XRPL 개발 입문자가 XRPL 주요 기능을 빠르게 이해하고 응용할 수 있는 **학습 자료**로 활용되도록 설계  
- **언어**: TypeScript
- **라이브러리**: xrpl.js

---
🌐 네트워크 / 버전 정보
네트워크: XRPL Devnet (wss://s.devnet.rippletest.net:51233)

rippled 버전: Server/serverInfo.ts 실행 시 출력 (예: 2.5.0)

xrpl.js 버전: package.json 참조

Node.js: LTS 권장

---
## 🚀 Quickstart

```bash
# 1) 의존성 설치
npm install

# 2) .env 작성 (Devnet 테스트 전용)
#   ADMIN_SEED=sEdXXXXXXXXXXXXXXXXX
#   USER_SEED=sEdYYYYYYYYYYYYYYYYY
#   USER2_SEED=sEdZZZZZZZZZZZZZZZZ
#   NEW_SEED=sEdAAAAAAAAAAAAAAAAA (옵션: faucet 테스트용)

# 3) 서버 기능 확인 (선택)
npx ts-node xrpl/Server/serverInfo.ts

# 4) 예제 실행 (예: 새 지갑 생성 → 펀딩 → 정보 조회)
npx ts-node xrpl/Wallet/createNewWallet.ts
npx ts-node xrpl/Wallet/faucet.ts
npx ts-node xrpl/Wallet/WalletInfo.ts

## 🗂️ 전체 디렉토리 구조

```bash
xrpl/
├── Wallet/
│ ├── createNewWallet.ts
│ ├── faucet.ts
│ ├── loadWallets.ts
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
│ ├── escrowCreateIOU.ts
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

---
## 📖 주요 기능별 README 인덱스
폴더	설명	README
Wallet	지갑 생성/펀딩/정보 조회	Wallet/README.md
Payment	XRP/IOU 전송	Payment/README.md
TrustSet	TrustLine 설정 및 RequireAuth 승인	TrustSet/README.md
AccountSet	계정 플래그 설정	AccountSet/README.md
Credential	온체인 신원/권한 관리	Credential/README.md
PermissionedDEX	도메인 규칙 기반 DEX 거래	PermissionedDEX/README.md
PermissionedDomains	도메인 생성/정책 관리	PermissionedDomains/README.md
TokenEscrow	토큰 예치/해제	TokenEscrow/README.md
MPTokensV1	발행자 승인형 토큰 발행/전송	MPTokensV1/README.md
Batch	배치 트랜잭션(AllOrNothing 등)	Batch/README.md
Server	서버 정보 및 Amendment 지원 확인	Server/README.md
## 📦 주요 기능별 시나리오

| 폴더명 | 주요 내용 | 시나리오 |
| --- | --- | --- |
| **Wallet** | 지갑 생성, 기존 지갑 불러오기 및 balance, trustline, flag 조회 | 지갑 생성 → 시드 출력 → 시드로 기존 지갑 로드 → 잔액·TrustLine·Flags 조회 |
| **Payment** | XRP/IOU 전송 |  XRP 전송 → IOU 전송(사전 조건: TrustLine 설정) |
| **TrustSet** | TrustLine 설정 (사용자 측) 및 발행자 승인(RequireAuth 시) | 사용자(User) → TrustLine 생성 → 발행자(Admin) → tfSetAuth 승인 |
| **AccountSet** | 계정 설정 변경 (플래그) | Admin → RequireAuth 플래그 설정 → 상태 조회 |
| **Credential** | 온체인 신원/권한 증명 | 발급자(Admin) → CredentialCreate → 피발급자(User) → CredentialAccept → 조회(account_objects) → 삭제(CredentialDelete) |
| **PermissionedDex** | 도메인 규칙 적용된 DEX 거래 | (사전 조건: AcceptedCredentials 충족) → Permissioned Offer 생성 → book_offers로 도메인 오더북 조회 → OfferCancel |
| **PermissionedDomains** | 도메인 생성·정책 관리 | Admin → 도메인 생성 → AcceptedCredentials 정책 등록/변경 → 해당 도메인에 맞는 계정만 거래 가능 |
| **TokenEscrow** | 토큰 예치·해제 | EscrowCreate(FinishAfter/CancelAfter 지정) → 기간 도래 후 EscrowFinish 또는 EscrowCancel |
| **MPtokensV1** | 발행자 승인형 토큰 발행/전송 | Issuance 생성 → Holder 승인(MPTokenAuthorize) → 토큰 전송 → 승인 해제(tfMPTUnauthorize) |
| **Batch** | 여러 트랜잭션을 하나의 Batch로 처리 | 단일 계정: ALLORNOTHING / ONLYONE / UNTILFAILURE / INDEPENDENT 모드별 Batch 트랜잭션 실행 |

---
### XRPL Devnet Explorer

https://devnet.xrpl.org/

---
### 실행 명령어 모음

```powershell
# Credential
npx ts-node xrpl/Credential/createCredential.ts
npx ts-node xrpl/Credential/acceptCredential.ts
npx ts-node xrpl/Credential/checkCredential.ts
npx ts-node xrpl/Credential/deleteCredential.ts

# PermissionedDomains
npx ts-node xrpl/PermissionedDomains/createDomain.ts
npx ts-node xrpl/PermissionedDomains/deleteDomain.ts

# PermissionedDEX
npx ts-node xrpl/PermissionedDEX/createPermissionedOffer.ts
npx ts-node xrpl/PermissionedDEX/cancelOffer.ts
npx ts-node xrpl/PermissionedDEX/bookOffers.ts

# TrustSet
npx ts-node xrpl/TrustSet/TrustSet.ts
npx ts-node xrpl/TrustSet/authorizeTrustLine.ts

# AccountSet
npx ts-node xrpl/AccountSet/AccountSet.ts

# Wallet
npx ts-node xrpl/Wallet/createNewWallet.ts
npx ts-node xrpl/Wallet/faucet.ts
npx ts-node xrpl/Wallet/WalletInfo.ts
npx ts-node xrpl/Wallet/loadWallets.ts

# Server
npx ts-node xrpl/Server/serverInfo.ts

# MPTokensV1
npx ts-node xrpl/MPTokensV1/createIssuance.ts
npx ts-node xrpl/MPTokensV1/setIssuance.ts   # 사용법: lock|unlock [holderAddress]
npx ts-node xrpl/MPTokensV1/authorizeHolder.ts
npx ts-node xrpl/MPTokensV1/sendMPT.ts
npx ts-node xrpl/MPTokensV1/destroyIssuance.ts

# TokenEscrow
~~npx ts-node xrpl/TokenEscrow/escrowCreateIOU.ts~~
npx ts-node xrpl/TokenEscrow/escrowCreateMPT.ts
npx ts-node xrpl/TokenEscrow/escrowFinish.ts
npx ts-node xrpl/TokenEscrow/escrowCancel.ts

# Batch
npx ts-node xrpl/Batch/AllOrNothing.ts
npx ts-node xrpl/Batch/Independent.ts
npx ts-node xrpl/Batch/OnlyOne.ts
npx ts-node xrpl/Batch/UntilFailure.ts
```
