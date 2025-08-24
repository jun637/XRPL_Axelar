## Batch
* 여러 XRPL 트랜잭션을 **하나의 Batch 트랜잭션**으로 묶어 실행할 수 있는 기능입니다.  
* Inner 트랜잭션은 최대 8개까지 포함할 수 있으며, 실행 모드는 Outer Transaction의 `Flags` 값에 따라 달라집니다.  

---

## 🎯 시나리오 실행 명령어 및 설명  

### 1. AllOrNothing
```bash
npx ts-node xrpl/Batch/AllOrNothing.ts  
```
* 모든 Inner가 성공해야만 커밋. 하나라도 실패하면 전부 롤백.  
---
### 2. OnlyOne
```bash
npx ts-node xrpl/Batch/OnlyOne.ts  
```
* 여러 Inner 중 첫 번째로 성공하는 트랜잭션만 반영, 나머지는 미실행.  
---
### 3. UntilFailure
```bash
npx ts-node xrpl/Batch/UntilFailure.ts  
```
* 순차 실행하다가 첫 실패가 나오면 이후는 실행되지 않음.  
---
### 4. Independent
```bash
npx ts-node xrpl/Batch/Independent.ts
```
* 모든 Inner를 실행 시도. 일부 실패해도 나머지는 계속 반영.  

---

## ✅ 예상 결과
성공 시:
* AllOrNothing → 모든 Inner가 ledger 반영  
* OnlyOne → 첫 번째 성공만 반영, 나머지는 미실행  
* UntilFailure → 실패 전까지 실행, 실패 이후는 중단  
* Independent → 실패/성공 여부와 상관없이 가능한 모든 Inner 실행  

실패 시:
* Fee/Flags/서명 조건 미충족 → `temMALFORMED`  
* Inner 개수 8개 초과 → 트랜잭션 거부  
* 잔액 부족/조건 불일치 → 해당 Inner만 실패 처리 (Independent 모드에서)  

---

## 🔍 추가 참고
전체 코드 / 상세 실행 로그 / 필드 해석은 Notion 문서 참고 → [Batch](https://catalyze-research.notion.site/Batch-241898c680bf8093b815fc83403d82ad?source=copy_link)

