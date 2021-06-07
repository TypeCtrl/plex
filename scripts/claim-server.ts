import puppeteer from 'puppeteer';

import { password, username } from '../test/test-client';

async function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

// handle setup and association of a plex server to a user account
async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await delay(5000);
  await page.setViewport({ width: 900, height: 1000 });
  await page.goto('http://localhost:32400/web');
  await page.waitForRequest(request => request.url() === 'https://app.plex.tv/auth-form/');
  await page.waitForSelector('[title="Plex Authentication"]');
  const authPage = await page.evaluate(() => {
    // @ts-expect-error
    return document.querySelectorAll('[title="Plex Authentication"]')[0].attributes.src.value;
  });
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  await page.goto(`https://app.plex.tv${authPage}`);
  let step = 1;
  console.log(`step ${step++} - start`);
  await page.waitForSelector('[data-qa-id="signIn--email"]');
  await delay(5000);
  await page.click('[data-qa-id="signIn--email"]');

  console.log(`step ${step++} - submit form`);
  await page.waitForSelector('#email');
  await page.type('#email', username);
  await page.type('#password', password);
  await page.click('[type="submit"]');

  await delay(2000);
  console.log(`step ${step++} - how plex works`);
  await delay(4000);
  await page.reload();
  await page.waitForSelector('[data-subset="setupLoading"]');
  await page.click('[data-subset="setupLoading"]');
  await delay(4000);

  console.log(`step ${step++} - close modal`);
  const elements = await page.$$('button[data-uid]');
  await elements[elements.length - 1].click();
  await delay(1000);

  console.log(`step ${step++} - deselect access media outside my home`);
  await page.waitForSelector('#PublishServerOnPlexOnlineKey');
  await page.click('#PublishServerOnPlexOnlineKey');
  console.log(`step ${step++} - name server`);
  await page.waitForSelector('[type="submit"]');
  await page.click('[type="submit"]');
  console.log(`step ${step++} - media library`);
  await page.waitForSelector('[data-subset="setupComplete"]');
  await page.click('[data-subset="setupComplete"]');
  console.log(`step ${step++} - finish`);
  await delay(3000);
  await page.waitForSelector('.submit-btn');
  await page.click('.submit-btn');
  await browser.close();
  await delay(3000);

  // const account = await createAccount();
  // console.log(`step ${step++} - get claimToken`);
  // const claimToken = await account.claimToken();
  // console.log(`step ${step++} - claimServer`);
  // await account.claimServer(claimToken);
}

if (!module.parent) {
  main()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
