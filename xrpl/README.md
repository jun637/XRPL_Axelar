# XRPL 핵심 기능별 샘플 코드

> XRPL에서 주요 기능(지갑 생성/관리, 송금, Trustset, Credential 등)을 테스트할 수 있는 시나리오 기반 예제 코드 모음입니다.

---

## 📑 목차
- [🚀 Quickstart](#-quickstart)
- [🗂️ 전체 디렉토리 구조](#-전체-디렉토리-구조)
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

# 4) 간단 실행 예시
npx ts-node xrpl/Wallet/WalletInfo.ts
⚡ 전체 코드 및 상세 실행 로그는 폴더별 README 또는 Notion 문서에서 확인하세요.

🗂️ 전체 디렉토리 구조
bash
xrpl/
├── Wallet/             # 지갑 생성/조회
├── Payment/            # XRP/IOU 전송
├── TrustSet/           # 신뢰선 설정
├── AccountSet/         # 계정 옵션 설정
├── Credential/         # Credential 발급/검증
├── PermissionedDEX/    # 권한 기반 DEX
├── PermissionedDomains/# Domain 기반 권한 관리
├── TokenEscrow/        # 에스크로
├── MPTokensV1/         # Multi-Party Tokens (v1)
├── Batch/              # 배치 트랜잭션
├── Server/             # 서버 정보 확인
📂 폴더별 README 바로가기
Wallet

Payment

TrustSet

AccountSet

Credential

PermissionedDEX

PermissionedDomains

TokenEscrow

MPTokensV1

Batch

Server

XRPL Devnet Explorer
👉 https://devnet.xrpl.org/

🌐 네트워크 / 버전
항목	값
네트워크	XRPL Devnet (wss://s.devnet.rippletest.net:51233)
rippled	v2.5.0
xrpl.js	package.json 참조
Node.js	LTS 권장
