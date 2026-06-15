# Screen Map

Dev-only badge: fixed position, bottom-right corner, rendered only in `development` mode.

## H — Home / Wizard (공통 마법사)

| ID | Screen | Route | File |
|---|---|---|---|
| SCR-H1 | 홈 | `/` | `app/page.tsx` |
| SCR-H2 | 마법사 Step 1: 상황 선택 | `/wizard` | `app/wizard/page.tsx` |
| SCR-H3 | 마법사 Step 2: 물건 가격 | `/wizard` | `app/wizard/page.tsx` |
| SCR-H4 | 마법사 Step 3: 주택 수 | `/wizard` | `app/wizard/page.tsx` |
| SCR-H5 | 마법사 Step 4: 조정대상지역 | `/wizard` | `app/wizard/page.tsx` |
| SCR-H6 | 마법사 Step 5: 전용면적 | `/wizard` | `app/wizard/page.tsx` |
| SCR-H7 | 마법사 결과 | `/wizard/results` | `app/wizard/results/page.tsx` |
| SCR-H8 | 절세 방법 비교 | `/wizard/compare` | `app/wizard/compare/page.tsx` |

## A — Acquire (살 때 — 취득세)

| ID | Screen | Route | File |
|---|---|---|---|
| SCR-A1 | Step 1: 취득유형 선택 | `/flow/acquisition` | `app/flow/acquisition/page.tsx` |
| SCR-A2 | Step 2: 주택 수 선택 | `/flow/acquisition` | `app/flow/acquisition/page.tsx` |
| SCR-A3 | Step 3: 조정대상지역 | `/flow/acquisition` | `app/flow/acquisition/page.tsx` |
| SCR-A4 | Step 4: 취득가액 입력 | `/flow/acquisition` | `app/flow/acquisition/page.tsx` |
| SCR-A5 | Step 5: 공시가격 입력 | `/flow/acquisition` | `app/flow/acquisition/page.tsx` |
| SCR-A6 | Step 6: 전용면적 입력 | `/flow/acquisition` | `app/flow/acquisition/page.tsx` |
| SCR-A7 | Step 7: 추가정보 (감면·특례·취득일) | `/flow/acquisition` | `app/flow/acquisition/page.tsx` |
| SCR-A8 | 취득세 결과 | `/flow/acquisition/result` | `app/flow/acquisition/result/page.tsx` |

## S — Sell (팔 때 — 양도소득세)

| ID | Screen | Route | File |
|---|---|---|---|
| SCR-S1 | Step 1: 취득가액 | `/flow/capital-gains` | `app/flow/capital-gains/page.tsx` |
| SCR-S2 | Step 2: 양도가액 | `/flow/capital-gains` | `app/flow/capital-gains/page.tsx` |
| SCR-S3 | Step 3: 필요경비 | `/flow/capital-gains` | `app/flow/capital-gains/page.tsx` |
| SCR-S4 | Step 4: 취득일·양도일 | `/flow/capital-gains` | `app/flow/capital-gains/page.tsx` |
| SCR-S5 | Step 5: 거주기간 | `/flow/capital-gains` | `app/flow/capital-gains/page.tsx` |
| SCR-S6 | Step 6: 조정대상지역 | `/flow/capital-gains` | `app/flow/capital-gains/page.tsx` |
| SCR-S7 | Step 7: 주택 수 | `/flow/capital-gains` | `app/flow/capital-gains/page.tsx` |
| SCR-S8 | 양도소득세 결과 | `/flow/capital-gains/result` | `app/flow/capital-gains/result/page.tsx` |

## G — Gift (증여할 때 — 증여세)

| ID | Screen | Route | File |
|---|---|---|---|
| SCR-G1 | Step 1: 증여 관계 선택 | `/flow/gift` | `app/flow/gift/page.tsx` |
| SCR-G2 | Step 2: 증여재산 가액 입력 | `/flow/gift` | `app/flow/gift/page.tsx` |
| SCR-G3 | Step 3: 채무 승계 여부 | `/flow/gift` | `app/flow/gift/page.tsx` |
| SCR-G4 | Step 4: 조정대상지역 | `/flow/gift` | `app/flow/gift/page.tsx` |
| SCR-G5 | Step 5: 수증자 주택 수 | `/flow/gift` | `app/flow/gift/page.tsx` |
| SCR-G6 | Step 6: 이전 증여 이력 | `/flow/gift` | `app/flow/gift/page.tsx` |
| SCR-G7 | 증여세 결과 | `/flow/gift/result` | `app/flow/gift/result/page.tsx` |

## I — Inherit (상속받을 때 — 상속세)

| ID | Screen | Route | File |
|---|---|---|---|
| SCR-I1 | Step 1: 상속재산 가액 입력 | `/flow/inheritance` | `app/flow/inheritance/page.tsx` |
| SCR-I2 | Step 2: 상속인 구성 | `/flow/inheritance` | `app/flow/inheritance/page.tsx` |
| SCR-I3 | Step 3: 다른 상속재산 여부 | `/flow/inheritance` | `app/flow/inheritance/page.tsx` |
| SCR-I4 | Step 4: 상속인 주택 수 | `/flow/inheritance` | `app/flow/inheritance/page.tsx` |
| SCR-I5 | 상속세 결과 | `/flow/inheritance/result` | `app/flow/inheritance/result/page.tsx` |

## O — Own (보유할 때 — 재산세·종부세)

| ID | Screen | Route | File |
|---|---|---|---|
| SCR-O1 | Step 1: 공시가격 입력 | `/flow/property` | `app/flow/property/page.tsx` |
| SCR-O2 | Step 2: 주택 보유 수 | `/flow/property` | `app/flow/property/page.tsx` |
| SCR-O3 | Step 3: 조정대상지역 | `/flow/property` | `app/flow/property/page.tsx` |
| SCR-O4 | 보유세 결과 | `/flow/property/result` | `app/flow/property/result/page.tsx` |

## R — Rent (임대할 때 — 임대소득세)

| ID | Screen | Route | File |
|---|---|---|---|
| SCR-R1 | Step 1: 임대 유형 선택 | `/flow/rental` | `app/flow/rental/page.tsx` |
| SCR-R2 | Step 2: 임대 조건 입력 | `/flow/rental` | `app/flow/rental/page.tsx` |
| SCR-R3 | Step 3: 주택 보유 수 | `/flow/rental` | `app/flow/rental/page.tsx` |
| SCR-R4 | Step 4: 다른 소득 여부 | `/flow/rental` | `app/flow/rental/page.tsx` |
| SCR-R5 | 임대소득세 결과 | `/flow/rental/result` | `app/flow/rental/result/page.tsx` |

## X — eXtra / Professional (전문가용 계산기)

| ID | Screen | Route | File |
|---|---|---|---|
| SCR-X1 | 취득세 계산기 | `/acquisition-tax` | `app/acquisition-tax/page.tsx` |
| SCR-X2 | 양도소득세 계산기 | `/capital-gains-tax` | `app/capital-gains-tax/page.tsx` |
| SCR-X3 | 보유세 계산기 | `/property-tax` | `app/property-tax/page.tsx` |
| SCR-X4 | 증여세 계산기 | `/gift-tax` | `app/gift-tax/page.tsx` |
| SCR-X5 | 상속세 계산기 | `/inheritance-tax` | `app/inheritance-tax/page.tsx` |
| SCR-X6 | 법인 양도소득세 계산기 | `/corporate-gains-tax` | `app/corporate-gains-tax/page.tsx` |
| SCR-X7 | 부담부증여 계산기 | `/encumbered-gift` | `app/encumbered-gift/page.tsx` |

---

**Total: 47 screens** (H×8, A×8, S×8, G×7, I×5, O×4, R×5, X×7) — last updated 2026-06-11
