# Proof Random API

A free prototype relaying the [drand quicknet](https://docs.drand.love/developer/) beacon to agent clients. This is not a VRF implementation or a paid x402 product.

- Live API: https://proof-random-api.pn-26f.workers.dev/v1/random?nonce=your-unique-id&max=6
- [Agent skill](SKILL.md), [verified JavaScript client](verified-client.mjs), and [Worker source](worker.js)
- Discovery: [agent text](https://proof-random-api.pn-26f.workers.dev/llms.txt), [OpenAPI 3.1](https://proof-random-api.pn-26f.workers.dev/openapi.json), and [sitemap](https://proof-random-api.pn-26f.workers.dev/sitemap.xml)
- Mobile demo page (temporary, 30-day expiry): https://brewpage.app/public/0M5fGsya2L
- Method: `GET`. `nonce` required, 1-128 characters, reflected verbatim; `max` optional integer 1..65536, default 6.
- Response includes `value` in `[0,max)`, `range`, `round`, `randomness`, `signature`, `nonce`, `signatureDigestMatches:true`, `blsVerified:false`, `x402:false`.

```bash
curl -sS 'https://proof-random-api.pn-26f.workers.dev/v1/random?nonce=example&max=6'
npm install drand-client
node verified-client.mjs
```

**Trust boundary:** The Worker checks only `SHA-256(signature) == randomness` and derives an integer with rejection sampling. It does **not** authenticate drand's BLS signature. The [reference client](verified-client.mjs) pins quicknet chain hash and public key, fetches and verifies the same round with official `drand-client`, compares the response's signature/randomness, then derives its own nonce-bound integer. For a security-sensitive use, verify independently, review code, and do not rely on the server's `value` alone. A latest-round beacon can already be known before the requester chooses to call. Fairness needs a fixed nonce and agreed *future* round before publication, which this API does not enforce. Do not use it for stakes, prizes, audited draws or adversarially fair decisions.


## Usage signals

The Worker writes aggregate request metadata to Cloudflare Analytics Engine: URL path, referrer hostname (or `direct`), HTTP status, and a whitelisted `src` campaign (`devto`, `github`, `awesome`, `brewpage`, `direct`, or `other`). It does not send nonce, IP address, full referrer URL, or user-agent to that custom dataset. Cloudflare's normal Worker metrics remain separate. Add `&src=github` or another listed source to a test URL if you want to measure a campaign. These counts include our own tests; they are not proof that outside agents have used the API.

No user deposits, stakes, sponsor prizes, x402 charges or real-money coin flips are part of this demo. Do not advertise Bazaar indexing before a settled payment and a live search result. See [Bazaar requirements](https://docs.cdp.coinbase.com/x402/validate-endpoint).

Status 2026-09-26: free prototype deployed, with a landing page and discovery routes. BLS verification: client-side only. x402: not enabled. Bazaar: not indexed. Sales: none.
