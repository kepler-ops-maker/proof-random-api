/** Proof Random API client, free demo. Independently verifies source via drand-client.
 * No x402 payment and no claim that the Worker verifies signatures. */
import {HttpCachingChain, HttpChainClient, fetchBeacon} from 'drand-client';
import {createHash, randomUUID} from 'node:crypto';
const ORIGIN='https://proof-random-api.pn-26f.workers.dev';
const CHAIN='52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971';
const PUBKEY='83cf0f2896adee7eb8b5f01fcad3912212c437e0073e911fb90022d3e760183c8c4b450b6a0a6c3ac6a5776a2d1064510d1fec758c921cc22b0e17e63aaf4bcb5ed66304de9cf809bd274ca73bab4af5a6e9c76a4bc09e76eae8991ef5ece45a';
export const source={chainHash:CHAIN,publicKey:PUBKEY};
export async function getVerifiedBeacon({nonce=randomUUID()}={}) {
  if(typeof nonce!=='string'||!nonce||nonce.length>128)throw Error('nonce must be 1..128 characters');
  const url=ORIGIN+'/v1/random?nonce='+encodeURIComponent(nonce);
  const response=await fetch(url,{signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error('Proof Random HTTP '+response.status);
  const data=await response.json();
  if(data.nonce!==nonce || !Number.isSafeInteger(data.round) || data.round<1 || !/^[a-f0-9]{64}$/i.test(data.randomness)|| !/^[a-f0-9]{96}$/i.test(data.signature))throw Error('Malformed or mismatched beacon response');
  // The trusted chain hash and BLS public key are pinned above, not read from the response.
  const options={disableBeaconVerification:false,noCache:false,chainVerificationParams:{chainHash:CHAIN,publicKey:PUBKEY}};
  const client=new HttpChainClient(new HttpCachingChain('https://drand.cloudflare.com/'+CHAIN,options),options);
  const independent=await fetchBeacon(client,data.round); // verifies BLS and SHA-256(signature)
  if(independent.signature.toLowerCase()!==data.signature.toLowerCase()||independent.randomness.toLowerCase()!==data.randomness.toLowerCase())throw Error('Worker beacon differs from independently verified drand beacon');
  return {...data,clientVerified:true,verification:'BLS signature and randomness hash checked independently by drand-client; compared exact same round and signature'};
}
// Deterministic, unbiased integer derived from a VERIFIED beacon and an agreed nonce.
// For adversarial fairness, agree on a FUTURE round and nonce before the round is known;
// the free Worker currently returns the latest beacon and does not enforce this rule.
export function sampleInteger(verified,max){
  if(!verified.clientVerified)throw Error('Client verification required');
  if(!Number.isSafeInteger(max)||max<1||max>65536)throw Error('max must be integer 1..65536');
  const bound=Math.floor(4294967296/max)*max;
  for(let counter=0;counter<1000;counter++){
    const input=`${CHAIN}:${verified.round}:${verified.randomness.toLowerCase()}:${verified.nonce}:${counter}`;
    const raw=createHash('sha256').update(input,'utf8').digest().readUInt32BE(0);
    if(raw<bound)return {value:raw%max,range:[0,max],counter,input,algorithm:'SHA-256 UTF-8; uint32be; rejection sampling'};
  }
  throw Error('Sampling exhausted');
}
if(import.meta.url===`file://${process.argv[1]}`){const b=await getVerifiedBeacon();console.log(JSON.stringify({beacon:b,sample:sampleInteger(b,6)},null,2));}
