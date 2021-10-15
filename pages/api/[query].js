// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const puppeteer = require('puppeteer');

let browserInstance = startBrowser();

async function startBrowser(){
    let browser;
    try {
        console.log("Opening the browser......");
        browser = await puppeteer.launch({
            headless: true,
            args: ["--disable-setuid-sandbox"],
            'ignoreHTTPSErrors': true
        });
    } catch (err) {
        console.log("Could not create a browser instance => : ", err);
    }
    return browser;
}

async function scrapeAll(browserInstance, query){
    let browser;
    try{
        browser = await browserInstance;
        console.log("Scraped all");
        return await pageScraper(browser, query);
    }
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
    }
}

async function pageScraper(browser, query){
    const url = `https://www.kvk.nl/zoeken/handelsregister/?handelsnaam=${query}`
    let page = await browser.newPage();

    await page.setViewport({width: 1366, height: 1400})
    console.log(`Navigating to ${url}...`);
    // Navigate to the selected page
    await page.goto(url);
    // Wait for the required DOM to be rendered
    await page.waitForSelector('#js-search-results > div > ul.results');
    // Get the link to all the required books
    let urls = await page.$$eval('#js-search-results > div > ul.results > li', items => {
        let data = [];

        console.log('items', items)

        const names = items.map((el) => el.querySelector('div.more-search-info > p').textContent)
        console.log('names', names)
        const kvks = items.map((el) => el.querySelector('div.content > ul > li:nth-child(1)').textContent)
        console.log('kvks', kvks)
        const links = items.map((el) => el.querySelector('div.handelsnaamHeaderWrapper > h3 > a').href)
        console.log('links', links)

        for (let i = 0; i < items.length; i++) {
            data[i] = {
                name: names[i],
                kvk: kvks[i].slice(4,-1),
                href: [links[i]]
            }
        }

        return data;
    });
    return urls;
}


export default function handler(req, res) {
  let query = req.query.query;

  try {
    scrapeAll(browserInstance, query).then((val) => {
      const data = {
          name: query,
          items: val,
      }
      res.send(data)
    });
  } catch (e) {
    res.send(e);
  }


  //res.status(200).json({ name: 'John Doe' })
}
