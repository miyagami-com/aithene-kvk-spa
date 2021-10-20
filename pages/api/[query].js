// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const chromium = require('chrome-aws-lambda');

// async function startBrowser() {
//     let browser;
//     try {
//         browser = await puppeteer.launch({
//             headless: true,
//             args: ["--disable-setuid-sandbox"],
//             'ignoreHTTPSErrors': true
//         });
//     } catch (err) {
//         return (err)
//     }
//     return browser;
// }

// async function scrapeAll(query) {
//     let browser;
//     try {
//         browser = await startBrowser();
//         return await pageScraper(browser, query);
//     } catch (err) {
//         return (err)
//     }
// }
//
// async function pageScraper(browser, query) {
//     const url = `https://www.kvk.nl/zoeken/handelsregister/?handelsnaam=${encodeURIComponent(query)}`
//     let page = await browser.newPage();
//
//     await page.setViewport({width: 1366, height: 1400})
//     // Navigate to the selected page
//     await page.goto(url);
//     // Wait for the required DOM to be rendered
//
//     await page.waitForSelector('#js-search-results > div > ul.results').catch(error => {
//         return (error);
//     });
//     // Get the link to all the required books
//     await page.$$eval('#js-search-results > div > ul.results > li', items => {
//         let data = [];
//         const names = items.map((el) => el.querySelector('div.more-search-info > p').textContent)
//         const kvks = items.map((el) => el.querySelector('div.content > ul > li:nth-child(1)').textContent)
//         const links = items.map((el) => el.querySelector('div.handelsnaamHeaderWrapper > h3 > a').href)
//         for (let i = 0; i < items.length; i++) {
//             data[i] = {
//                 name: names[i],
//                 kvk: kvks[i].slice(4, -1),
//                 href: [links[i]]
//             }
//         }
//         return data;
//     }).catch(error => {
//         return (error);
//     });
// }


export default async function handler(req, res) {
    const query = req?.query?.query;
    if (!query) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({}))
        return;
    }

    let browser = null;
    let result = null;
    const url = `https://www.kvk.nl/zoeken/handelsregister/?handelsnaam=${encodeURIComponent(query)}`

    try {
        browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        }).catch(error => {
            return (error);
        });

        let page = await browser.newPage().catch(error => {
            return (error);
        });

        await page.goto(url).catch(error => {
            return (error);
        });

        await page.waitForSelector('#js-search-results > div > ul.results').catch(error => {
            return (error);
        });

        result = await page.$$eval('#js-search-results > div > ul.results > li', items => {
            let data = [];
            console.log(items)
            if (items) {
                const kvks = items?.map((el) => el?.querySelector('div.content > ul > li:nth-child(1)')?.textContent)
                const links = items?.map((el) => el?.querySelector('div.handelsnaamHeaderWrapper > h3 > a')?.href)
                const names = items?.map((el) => el?.querySelector('div.handelsnaamHeaderWrapper > h3 > a')?.textContent)
                //     .catch(error => {
                //     return (error);
                // });
                for (let i = 0; i < items?.length; i++) {
                    data[i] = {
                        name: names?.[i],
                        kvk: kvks?.[i]?.slice(4, -1),
                        href: [links?.[i]]
                    }
                }
            }
            return data;
        }).catch(error => {
            return (error);
        });
        // Get the link to all the required books
    } catch (error) {
        return (error);
    } finally {
        if (browser !== null) {
            await browser.close().catch(error => {
                return (error);
            });
        }
    }
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(result))

    // res.statusCode = 200
    // res.setHeader('Content-Type', 'application/json')
    // res.end(JSON.stringify(content))

    // try {
    //     await scrapeAll(query).then((val) => {
    //         res.status(200).send(val)
    //     });
    // } catch (e) {
    //     res.status(400).send(e);
    // }
}
