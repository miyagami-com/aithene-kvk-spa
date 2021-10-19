// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const puppeteer = require('puppeteer');

async function startBrowser() {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--disable-setuid-sandbox"],
            'ignoreHTTPSErrors': true
        });
    } catch (err) {
        return (err)
    }
    return browser;
}

async function scrapeAll(browserInstance, query) {
    let browser;
    try {
        browser = await browserInstance;
        return await pageScraper(browser, query);
    } catch (err) {
        return (err)
    }
}

async function pageScraper(browser, query) {
    const url = `https://www.kvk.nl/zoeken/handelsregister/?handelsnaam=${encodeURIComponent(query)}`
    let page = await browser.newPage().catch(error => {
        return (error);
    });

    await page.setViewport({width: 1366, height: 1400}).catch(error => {
        return (error);
    });
    // Navigate to the selected page
    await page.goto(url).catch(error => {
        return (error);
    });
    // Wait for the required DOM to be rendered

    await page.waitForSelector('#js-search-results > div > ul.results').catch(error => {
        return (error);
    });
    // Get the link to all the required books
    return await page.$$eval('#js-search-results > div > ul.results > li', items => {
        let data = [];
        const names = items.map((el) => el.querySelector('div.more-search-info > p').textContent)
        const kvks = items.map((el) => el.querySelector('div.content > ul > li:nth-child(1)').textContent)
        const links = items.map((el) => el.querySelector('div.handelsnaamHeaderWrapper > h3 > a').href)
        for (let i = 0; i < items.length; i++) {
            data[i] = {
                name: names[i],
                kvk: kvks[i].slice(4, -1),
                href: [links[i]]
            }
        }
        return data;
    }).catch(error => {
        return (error);
    });
}


export default async function handler(req, res) {
    let query = req.query.query;
    let browserInstance = startBrowser();

    try {
        await scrapeAll(browserInstance, query).then((val) => {
            res.status(200).send(val)
        });
    } catch (e) {
        res.status(400).send(e);
    }
}
