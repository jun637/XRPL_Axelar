## Wallet 
* XRPL 지갑을 **생성 → Devnet 펀딩 → 상태 조회**하는 스크립트 모음입니다.
  
---
## 🎯 시나리오 실행 명령어 및 설명  

## 1. 새 지갑 생성
```bash
npx ts-node xrpl/Wallet/createNewWallet.ts
```
* 새 지갑을 생성하고 address / seed / publicKey를 콘솔에 출력

## 2. 지갑 로드/검증
```bash
npx ts-node xrpl/Wallet/LoadWallet.ts
```
* .env에 기록된 시드값을 불러와 지갑을 로드하고, 주소 유효성을 검증
  
## 3. Devnet 펀딩
```bash
npx ts-node xrpl/Wallet/faucet.ts
```
* Devnet Faucet을 통해 지갑에 XRP를를 입금하여 트랜잭션 가능 상태로 활성화

## 4. 지갑 정보 조회
```bash
npx ts-node xrpl/Wallet/WalletInfo.ts
```
* 지정된 지갑의 잔액, 시퀀스 번호, TrustLines 등 계정 전반의 상태를 조회

---

## ✅ 예상 결과 
성공 시:

* 새 지갑은 주소/시드가 콘솔에 표시

* Faucet 호출 후 잔액 증가 및 validated 트랜잭션 확인 가능

* WalletInfo는 XRP 잔액/시퀀스/Flags/TrustLines 등을 출력

실패 시:

* Faucet 제한/네트워크 지연 → 잠시 후 재시도

* .env 누락(로드 스크립트 사용 시) → 필요 변수 확인

* 노드 연결 실패 → Devnet WS URL 확인

---
## 🔍 추가 참고
전체 코드/상세 로그/필드 해석: Notion [Wallet](https://catalyze-research.notion.site/Wallet-241898c680bf80ee8865f907a8f6955e?source=copy_link)
참고




