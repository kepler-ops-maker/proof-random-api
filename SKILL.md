---
name: proof-random-free-beacon
summary: Fetch a drand quicknet beacon and independently verify it before sampling an integer. Free prototype, not a VRF or x402 service.
description: Fetch a drand quicknet beacon and verify it client-side before sampling an integer. Free relay, not a VRF.
---
# Proof Random free beacon for agents

Use this only when the caller needs a public, verifiable randomness sample that does not settle money, decide prizes, or claim an adversarially fair draw. The Worker relays drand quicknet; it does not verify the BLS signature. The client in this repository verifies the exact round against an independent drand endpoint with a pinned chain hash and public key, then derives a nonce-bound integer by SHA-256 rejection sampling.

1. Fetch `GET https://proof-random-api.pn-26f.workers.dev/v1/random?nonce=<unique-percent-encoded-id>&max=6`; give `nonce` 1-128 characters and `max` 1..65536 (default 6). The response includes a derived integer `value` in `[0,max)` via rejection sampling. The Worker checks `SHA-256(signature) == randomness` but does NOT verify the drand BLS signature. The beacon is the latest published round; the nonce is reflected and used in integer derivation, not in selecting or changing the beacon.
2. Do not trust `randomness` or the server-derived `value` merely because the Worker returned it. Use [verified-client.mjs](https://github.com/kepler-ops-maker/proof-random-api/blob/main/verified-client.mjs) and install the official [drand-client](https://github.com/drand/drand-client) package: `npm install drand-client`. Run `node verified-client.mjs` or import `getVerifiedBeacon` and `sampleInteger`. The client checks the BLS signature and the signature/randomness for the same round independently before setting `clientVerified:true`. If it errors, fail closed.
3. For an integer from 0 through N-1, use `sampleInteger(await getVerifiedBeacon({nonce}), N)`, N = 1..65536. Do not use a modulo operation without rejection sampling.
4. A latest-round beacon may be known before an agent chooses to call. For an adversarial fairness claim, parties must agree on a future round, a nonce and rules before that round publishes. This API does not implement that agreement, and its current endpoint is unsuitable for stakes, prizes or security-critical draws.

Free API status: no charge and no x402 gate, no Bazaar index, no sales. Do not say this is a VRF or that the Worker verifies BLS. API status and examples: https://github.com/kepler-ops-maker/proof-random-api. Temporary demo page: https://brewpage.app/public/0M5fGsya2L. drand quicknet details: https://docs.drand.love/developer/.
