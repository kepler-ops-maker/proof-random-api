# Proof Random API

A free prototype relaying the [drand quicknet](https://docs.drand.love/developer/) beacon to agent clients. This is not a VRF implementation or a paid x402 product yet.

- Live free API: https://proof-random-api.pn-26f.workers.dev/v1/random?nonce=your-unique-id
- [Agent skill](SKILL.md) and [independently verifying JavaScript client](verified-client.mjs)
- Mobile-first demo documentation (temporary, 30-day expiry): https://brewpage.app/public/0M5fGsya2L
- HTTP method: `GET`. Parameter: `nonce` (required, reflected verbatim in the response; not bound to randomness yet).
- Response: `round`, `randomness`, `signature`, `nonce`, `verified:false`, `x402:false`.

```bash
curl -sS 'https://proof-random-api.pn-26f.workers.dev/v1/random?nonce=example'
npm install drand-client
node verified-client.mjs
```

**Trust boundary:** The Worker does not verify drand's BLS signature. It only relays a public beacon. The [reference client](verified-client.mjs) pins quicknet chain hash and public key, fetches and verifies the same round with the official `drand-client`, compares the response's signature/randomness, then derives a nonce-bound integer with rejection sampling. The latest-round beacon can already be known to the requester; fairness needs an agreed future round and fixed nonce commitment before publication. This endpoint does not enforce that rule. Do not use it for security-sensitive decisions, money games, prizes or audited draws.

No user deposits, stakes, sponsor prizes, x402 charges or real-money coin flips are part of this demo. Do not advertise Bazaar indexing before a settled payment and a live search result. See [Bazaar validation requirements](https://docs.cdp.coinbase.com/x402/validate-endpoint).

Status 2026-09-25: free prototype deployed. BLS verification: client-side only. x402: not enabled. Bazaar: not indexed. Sales: none.
