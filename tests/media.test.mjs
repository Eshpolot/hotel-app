import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const images=JSON.parse(readFileSync('src/data/hotelImages.json','utf8'));
test('all migrated hotel images are bundled as WebP',()=>{
 assert.equal(Object.keys(images).length,10);
 for (const file of Object.values(images)) {
   assert.ok(existsSync('public'+file),file);
   const bytes=readFileSync('public'+file);
   assert.equal(bytes.subarray(0,4).toString(),'RIFF');
   assert.equal(bytes.subarray(8,12).toString(),'WEBP');
 }
});
test('catalogue fallback remains labelled and gated from online booking',()=>{
 const source=readFileSync('src/components/Rooms.tsx','utf8');
 assert.match(source,/if \(loading \|\| error\) return/);
 assert.match(source,/сохранённый каталог/);
 assert.match(source,/setRooms\(data \|\| \[\]\)/);
});
