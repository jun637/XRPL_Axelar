## MPT (Multi-Purpose Token)
* XRPL의 **새로운 펀저블 토큰 타입**으로, 기존 IOU보다 단순한 발행·보유 모델을 제공합니다.  
* Trustline 없이 발행·전송 중심의 단방향 모델이며, 발행 정책(RequireAuth, Lock, TransferFee 등)을 발행 정의에서 일괄 관리할 수 있습니다.  
* v1은 계정 간 직접 결제만 지원(DEX 거래 불가).  

---

## 🎯 시나리오 실행 명령어 및 설명  

### 1. 발행 정의 생성
```bash
npx ts-node xrpl/MPTokensV1/createIssuance.ts
```
* Admin 계정이 `MPTokenIssuanceCreate` 트랜잭션으로 새로운 발행본 정의를 생성  
* AssetScale, MaximumAmount, Flags(tfMPTCanTransfer, tfMPTRequireAuth 등) 지정 → 로그에서 IssuanceID 복사  

### 2. 홀더 권한 부여 (RequireAuth 켜진 경우)
```bash
npx ts-node xrpl/MPTokensV1/authorizeHolder.ts
```
* 발행본이 RequireAuth 모드일 때 User는 먼저 Authorize 요청을 보내고, Admin이 승인해야 보유 가능  

### 3. MPT 결제
```bash
npx ts-node xrpl/MPTokensV1/sendMPT.ts
```
* Admin → User로 MPT 전송 (`Amount: { mpt_issuance_id, value }`)  
* v1은 직접 결제만 지원  

### (옵션) 4. 발행본 락/언락
```bash
npx ts-node xrpl/MPTokensV1/setIssuance.ts <lock|unlock> [holderAddress]
``` 
* 발행자가 발행본 전체 또는 특정 홀더만 잠금/해제  

### (옵션) 5. 발행 정의 삭제
```bash
npx ts-node xrpl/MPTokensV1/destroyIssuance.ts
```
* 모든 홀더 잔액이 0일 경우 발행 정의 삭제, 리저브 반환  

---

## ✅ 예상 결과
성공 시:
* createIssuance 실행 → 콘솔에 IssuanceID 출력 (모든 후속 단계에서 사용)  
* authorizeHolder 실행 → User가 해당 발행본 보유 가능  
* sendMPT 실행 → User 지갑에 지정한 수량의 MPT 도착 (`tesSUCCESS`)  
* setIssuance 실행 → 글로벌 또는 특정 홀더만 잠금/해제 반영  
* destroyIssuance 실행 → 발행 정의 삭제, Explorer에서 `tesSUCCESS` 확인  

실패 시:
* RequireAuth 활성화 상태에서 승인 누락 → 수취 실패  
* 발행 정의 삭제 시 잔액 남아있음 → `tecHAS_OBLIGATIONS` 오류  
* .env 누락 또는 노드 연결 실패 → 실행 불가  

---

## 🔍 추가 참고
전체 코드 / 상세 실행 로그 / 필드 해석은 Notion 문서 참고 → [MPTokensV1](https://catalyze-research.notion.site/MPtokensV1-241898c680bf801694fffcf16c9ef20c?source=copy_link)
