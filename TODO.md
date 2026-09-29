# TODO

- [x] Update `src/modules/riskAssesment/pages/RiskAssessment.js` to avoid the full-screen loading/layout swap caused by the early return condition.

- [ ] Keep logic intact: no unnecessary UI/behavior changes besides ensuring the same layout renders before/after reload.
- [ ] Use fallback values for stats/charts while `user/loadingRisks/frameworksLoading` are resolving.
- [ ] Verify by running the Next.js app and checking RiskAssessment page behavior before and after reload.

