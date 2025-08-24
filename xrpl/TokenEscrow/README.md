## TokenEscrow

* XRPL의 **기존 XRP 전용 Escrow 기능을 확장**하여, IOU 토큰과 MPT(Multi-Purpose Token)도 에스크로에 걸 수 있게 하는 기능입니다.  
* IOU는 TrustLine과 발행자 정책(RequireAuth, Freeze 등)이 필요하며, MPT는 별도의 플래그(tfMPTCanEscrow, tfMPTCanTransfer)로 제어됩니다.  

---

## 🎯 시나리오 실행 명령어 및 설명  

### 1. 에스크로 생성
```bash
    npx ts-node xrpl/TokenEscrow/escrowCreateMPT.ts
    npx ts-node xrpl/TokenEscrow/escrowCreateIOU.ts
```
* User가 특정 IOU/MPT를 Escrow에 잠그는 트랜잭션 실행 (FinishAfter / CancelAfter 조건 포함)  

### 2. 에스크로 해제
```bash
    npx ts-node xrpl/TokenEscrow/escrowFinish.ts
```
* FinishAfter가 경과하면, 누구나 Escrow 객체를 해제하고 잔액을 목적지로 이동  

### 3. 에스크로 취소
```bash
    npx ts-node xrpl/TokenEscrow/escrowCancel.ts
```
* CancelAfter가 경과하면, 누구나 Escrow 객체를 취소하고 원래 소스로 자산 반환  

---

## ✅ 예상 결과
성공 시:

* EscrowCreate 실행 → Explorer에서 `tesSUCCESS` 및 Escrow 객체 생성 확인  
* EscrowFinish 실행 → Escrow 객체 삭제 및 잔액 이동  
* EscrowCancel 실행 → Escrow 객체 삭제 및 원래 소스로 잔액 반환  

실패 시:

* IOU/MPT 조건 위반 (CancelAfter 누락, 발행자 플래그 미설정 등) → Invalid Transaction  
* RequireAuth / Freeze / Lock 정책 위반 시 거부  
* xrpl.js 기본 서명 사용 시 IOU/MPT Escrow는 Invalid signature → 반드시 raw signing 방식 필요(노션 참고)  

---

## 🔍 추가 참고
전체 코드 / 상세 실행 로그 / 필드 해석은 Notion 문서 참고 → [TokenEscrow](https://catalyze-research.notion.site/TokenEscrow-241898c680bf80deb2a7db0f1c960696?source=copy_link)


