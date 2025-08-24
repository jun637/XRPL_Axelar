# XRPL 핵심 기능별 샘플 코드

> XRPL에서 주요 기능(지갑 생성/관리, 송금, Trustset, Credential 등)을 테스트할 수 있는 시나리오 기반 예제 코드 모음입니다.

---

## 📑 목차
- [🚀 Quickstart](#-quickstart)
- [🗂️ 전체 디렉토리 구조](#전체-디렉토리-구조)
- [📂 폴더별 README 바로가기](#-폴더별-readme-바로가기)
- [XRPL Devnet Explorer](#xrpl-devnet-explorer)
- [🌐 네트워크 / 버전](#-네트워크--버전)

---

## 🚀 Quickstart

```bash
# 0) 레포 클론
git clone https://github.com/jun637/XRPL.git
cd XRPL

# 1) 의존성 설치
npm install

# 2) Devnet 지갑 생성 (Admin, User, User2)
npx ts-node xrpl/Wallet/createNewWallet.ts

# 3) faucet으로 자산 활성화
npx ts-node xrpl/Wallet/faucet.ts

# 4) 지갑 정보 조회
npx ts-node xrpl/Wallet/WalletInfo.ts
```
* 기능별 실행 명령어 및 간단한 시나리오 이해는 폴더별 README에서,
* 전체 코드 및 상세 실행 로그를 포함한 스크립트 해석은 Notion 문서에서 확인하세요.

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
---
## 📂 폴더별 README 바로가기

- [Wallet](./xrpl/Wallet/README.md)
- [TrustSet](./xrpl/TrustSet/README.md)
- [TokenEscrow](./xrpl/TokenEscrow/README.md)
- [Server](./xrpl/Server/README.md)
- [PermissionedDomains](./xrpl/PermissionedDomains/README.md)
- [PermissionedDEX](./xrpl/PermissionedDEX/README.md)
- [Payment](./xrpl/Payment/README.md)
- [MPTokensV1](./xrpl/MPTokensV1/README.md)
- [Credential](./xrpl/Credential/README.md)
- [Batch](./xrpl/Batch/README.md)
- [AccountSet](./xrpl/AccountSet/README.md)

---
## XRPL Devnet Explorer
👉 https://devnet.xrpl.org/
---
## 🌐 네트워크 / 버전
항목	값
네트워크	XRPL Devnet (wss://s.devnet.rippletest.net:51233)
rippled	v2.5.0
xrpl.js	package.json 참조
Node.js	LTS 권장
