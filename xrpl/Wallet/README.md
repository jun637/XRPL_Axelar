## Wallet 
* XRPL 지갑을 **생성 → Devnet 펀딩 → 상태 조회**하는 스크립트 모음입니다.
  
---
## 🎯 시나리오 실행 명령어 및 설명  

## 1. 새 지갑 생성(주소/시드 출력)
```bash
npx ts-node xrpl/Wallet/createNewWallet.ts
```
* 설명

## 2. 지갑 로드/검증
```bash
npx ts-node xrpl/Wallet/LoadWallet.ts
```
* 설명
  
## 3. Devnet 펀딩(필수)
```bash
npx ts-node xrpl/Wallet/faucet.ts
```
* 설명

## 4. 지갑 정보 조회(잔액/시퀀스/TrustLines 등)
```bash
npx ts-node xrpl/Wallet/WalletInfo.ts
```
* 설명

---

## ✅ 예상 결과 
성공 시:

새 지갑은 주소/시드가 콘솔에 표시

Faucet 호출 후 잔액 증가 및 validated 트랜잭션 확인 가능

WalletInfo는 XRP 잔액/시퀀스/Flags/TrustLines 등을 출력

실패 시:

Faucet 제한/네트워크 지연 → 잠시 후 재시도

.env 누락(로드 스크립트 사용 시) → 필요 변수 확인

노드 연결 실패 → Devnet WS URL 확인

---
## 🔍 추가 참고
전체 코드/상세 로그/필드 해석: Notion [Wallet](https://catalyze-research.notion.site/Wallet-241898c680bf80ee8865f907a8f6955e?source=copy_link)
참고



