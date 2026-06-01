---
name: deploy
description: Deploy functions, hosting, or full release to Firebase. Use when deploying changes to production or staging.
disable-model-invocation: true
---

# Deploy Skill

Deploy PriceTrack components to Firebase.

## Usage

`/deploy [target]` where target is one of:
- `functions` — deploy Cloud Functions only
- `hosting` — deploy frontend only
- `all` — deploy everything (functions + hosting + rules)
- (no argument) — deploy based on changed files

## Steps

1. **Detect changes**: If no target specified, check `git diff --name-only HEAD~1` to determine what changed:
   - `functions/**` → deploy functions
   - `hosting/**` → deploy hosting
   - Both → deploy both

2. **Pre-deploy checks**:
   - Functions: `cd functions && npm run lint`
   - Hosting: `cd hosting && npm run lint`

3. **Deploy**:
   - Functions: `cd functions && npm run deploy`
   - Hosting: `cd hosting && npm run deploy`
   - All (requires releases branch): `firebase deploy --only functions,hosting,database,storage,firestore --token "$FIREBASE_TOKEN" --non-interactive`

4. **Verify**: Check the Firebase deploy output for success/failure URLs.

## Notes

- Deploy requires `FIREBASE_TOKEN` env var (set in GitHub Actions secrets)
- Master push auto-deploys via CI — manual deploy is for local use only
- `releases/*` branches trigger full deploy in CI
