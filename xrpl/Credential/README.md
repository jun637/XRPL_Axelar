## Credential
* XRPL 원장에 기록되는 **신원·권한 증명 레코드**입니다.  
* 발급자(issuer)가 피발급자(subject)에게 Credential을 발급하면, 도메인 정책(`AcceptedCredentials`)과 연동되어 **접근 제어**에 활용됩니다.  

- 주요 필드: `Subject`, `CredentialType(hex)`, `Expiration`, `URI(hex)`  
- 발급(Create) → 수락(Accept) → 조회(Check) → 삭제(Delete) 순서로 관리  

---

## 🎯 시나리오 실행 명령어 및 설명  

### 1. Credential 발급
```bash
npx ts-node xrpl/Credential/createCredential.ts
```
* Admin(발급자)이 Subject 계정에 Credential 발급 (`CredentialType`, `Expiration`, `URI` 지정)  
---
### 2. Credential 수락
```bash
npx ts-node xrpl/Credential/acceptCredential.ts
```
* Subject(피발급자)가 발급된 Credential을 수락하여 유효 상태로 전환  
---
### 3. Credential 조회
```bash
npx ts-node xrpl/Credential/checkCredential.ts
```
* Subject 계정의 `account_objects`를 조회하여 보유 중인 Credential 확인  
---
### 4. Credential 삭제
```bash
npx ts-node xrpl/Credential/deleteCredential.ts
```
* Subject 계정이 본인 Credential 삭제 → 도메인 정책 접근 권한 제거될 수 있음  

---

## ✅ 예상 결과
성공 시:
* createCredential 실행 → Subject 계정에 Credential 생성됨  
* acceptCredential 실행 → Credential 상태가 “수락됨”으로 변경  
* checkCredential 실행 → 유효 Credential(발급자, 타입, 만료 등) 목록 출력  
* deleteCredential 실행 → 해당 Credential 삭제, Explorer에서 `tesSUCCESS` 확인 가능  

실패 시:
* hex 인코딩 값 불일치 → 트랜잭션 거부  
* 만료된 Credential 사용 → 도메인 접근 제한  
* .env 누락 또는 노드 연결 실패 → 실행 불가  

---

## 🔍 추가 참고
전체 코드 / 상세 실행 로그 / 필드 해석은 Notion 문서 참고 → [Credential](https://catalyze-research.notion.site/Credential-241898c680bf802eadd0dcf5bdfc0ded?source=copy_link)


