// Pick a low-stakes agent task with an independently verified public beacon.
// Usage: node agent-pick.mjs 'review docs' 'triage bugs' 'write tests'
import {getVerifiedBeacon, sampleInteger} from './verified-client.mjs';

const choices=process.argv.slice(2);
if(choices.length<2 || choices.length>100 || choices.some(x=>!x.trim())){
  console.error('Usage: node agent-pick.mjs "review docs" "triage bugs" [more choices]');
  process.exit(2);
}
const beacon=await getVerifiedBeacon();
const sample=sampleInteger(beacon, choices.length);
console.log(JSON.stringify({
  choice:choices[sample.value],choices,
  proof:{chainHash:beacon.chainHash,round:beacon.round,nonce:beacon.nonce,
    randomness:beacon.randomness,signature:beacon.signature,
    clientVerified:beacon.clientVerified,counter:sample.counter,
    algorithm:sample.algorithm,
    caveat:"Latest beacon may have been known before this call. This is for low-stakes task rotation, not fair draws or prizes."}
},null,2));
