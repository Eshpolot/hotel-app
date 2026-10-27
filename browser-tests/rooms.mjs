// Runs against a local production server. All external traffic is mocked/blocked.
// npm run build && npm start; then npm run test:browser
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const source = readFileSync('src/data/roomSnapshot.ts', 'utf8');
const rooms = Function(source.slice(source.indexOf('export const')).replace('export const roomSnapshot: Room[]', 'const roomSnapshot') + '; return roomSnapshot;')();
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath: process.env.CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox','--single-process','--no-zygote','--disable-dev-shm-usage']} : {}),
});
const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
await page.emulateMedia({reducedMotion:'reduce'});
const errors = [];
page.on('pageerror', e => errors.push(e.message));
let mode = 'live';
const guest = { id: '11111111-1111-4111-8111-111111111111', aud: 'authenticated', role: 'authenticated', email: 'test@example.com', user_metadata: {full_name: 'Test Guest'}, app_metadata: {}, created_at: new Date().toISOString() };
const token = Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url') + '.' + Buffer.from(JSON.stringify({sub:guest.id,exp:Math.floor(Date.now()/1000)+3600,aud:'authenticated',role:'authenticated'})).toString('base64url') + '.testsignature';
await page.route('**/*', route => {
  const url = route.request().url();
  if (url.includes('/rest/v1/rooms')) return mode === 'offline' ? route.abort() : route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(mode === 'empty' ? [] : rooms)});
  if (url.includes('/auth/v1/token')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:token,refresh_token:'test-refresh',expires_in:3600,token_type:'bearer',user:guest})});
  if (url.includes('/rest/v1/profiles')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({id:guest.id,full_name:'Test Guest',role:'guest'})});
  if (!url.startsWith(base)) return route.abort();
  return route.continue();
});
const next = (days) => new Date(Date.now() + days*86400000).toISOString().slice(0,10);
const arrival = next(10), departure = next(13);
try {
  await page.goto(`${base}/rooms`);
  await page.locator('.room-details-link').nth(1).click();
  await page.getByRole('heading',{name:'Делюкс',exact:true}).waitFor();
  await page.getByLabel('Дата заезда', {exact:true}).fill(arrival);
  await page.getByLabel('Дата выезда', {exact:true}).fill(departure);
  await page.getByLabel('Количество гостей', {exact:true}).selectOption('2');
  assert.match(await page.locator('.detail-total').innerText(),/19\s?500/);
  assert.match(page.url(),new RegExp(`checkIn=${arrival}`));
  await page.reload();
  assert.equal(await page.getByLabel('Дата заезда',{exact:true}).inputValue(),arrival);
  await page.getByRole('button',{name:'Открыть фотографию'}).click();
  await page.waitForFunction(()=>document.querySelector('.photo-viewer img')?.naturalWidth > 0);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.querySelector('.photo-viewer').contains(document.activeElement)),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(),0);
  console.log('PASS detail navigation, total, persisted URL dates, full photo, keyboard focus');

  await page.getByRole('button',{name:'Поделиться',exact:true}).click();
  // Clipboard support depends on browser permissions; both supported outcomes are accessible.
  await page.waitForFunction(()=>document.querySelector('.detail-share').textContent.includes('скопирована') || !!document.querySelector('.detail-share-status input'));
  await page.getByLabel('Language').selectOption('en');
  await page.getByRole('heading',{name:'Deluxe',exact:true}).waitFor();
  await page.getByLabel('Language').selectOption('kg');
  assert.equal(await page.locator('html').getAttribute('lang'),'ky');
  await page.getByLabel('Language').selectOption('ru');
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),true);
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({width,height:844});
    const box = await page.getByRole('button',{name:'Menu',exact:true}).boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= width, `Mobile menu fits at ${width}px`);
  }
  await page.setViewportSize({width:390,height:844});
  if (process.env.SCREENSHOT_PATH) await page.screenshot({path:process.env.SCREENSHOT_PATH,fullPage:true});
  console.log('PASS share action, RU/EN/KG, mobile overflow check');

  mode='offline';
  await page.goto(`${base}/rooms/3`);
  await page.locator('.detail-offline').waitFor();
  assert.equal(await page.getByRole('button',{name:'Оставить заявку'}).isDisabled(),true);
  assert.match(await page.locator('.detail-secondary').getAttribute('href'),/^https:\/\/wa.me\//);
  mode='empty';
  await page.goto(`${base}/rooms/3`);
  await page.getByRole('heading',{name:'Номер не найден',exact:true}).waitFor();
  mode='live';
  await page.goto(`${base}/rooms/9999`);
  await page.getByRole('heading',{name:'Номер не найден',exact:true}).waitFor();
  await page.goto(`${base}/rooms/2?checkIn=garbage&checkOut=2027-02-31&guests=-8`);
  assert.equal(await page.getByLabel('Количество гостей',{exact:true}).inputValue(),'1');
  await page.goto(`${base}/rooms/2?checkIn=${arrival}&checkOut=${next(110)}`);
  await page.getByRole('alert').waitFor();
  assert.equal(await page.getByRole('button',{name:'Оставить заявку'}).isDisabled(),true);
  console.log('PASS offline safety, empty/unknown rooms, malformed URL, 90-night limit');

  await page.goto(`${base}/rooms/2?checkIn=${arrival}&checkOut=${departure}&guests=2`);
  await page.waitForFunction(()=>document.querySelector('.detail-primary')?.disabled === false);
  await page.getByRole('button',{name:'Оставить заявку'}).click();
  await page.getByRole('dialog').getByLabel('Email',{exact:true}).fill(guest.email);
  await page.getByRole('dialog').getByLabel('Пароль',{exact:true}).fill('test-password');
  await page.getByRole('dialog').getByRole('button',{name:'Войти',exact:true}).click();
  await page.getByRole('dialog').getByLabel('Имя гостя', {exact:true}).waitFor();
  assert.equal(await page.getByRole('dialog').getByLabel('Дата заезда',{exact:true}).inputValue(),arrival);
  assert.equal(await page.getByRole('dialog').getByLabel('Количество гостей',{exact:true}).inputValue(),'2');
  assert.deepEqual(errors,[]);
  console.log('PASS email sign-in continues booking with selected stay; no JS exceptions');
} finally { await browser.close(); }
