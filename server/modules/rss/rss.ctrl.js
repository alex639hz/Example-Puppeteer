const puppeteer = require('puppeteer')
const { Song } = require('./rss.model');
const fs = require('fs-extra');
const xml = require('xml');
const errorHandler = require('../../helpers/dbErrorHandler');

const list = async (req, res) => {
  try {
    let rss = await Song.find().select('-_id title time').lean()
    res.json(rss)
  } catch (err) {
    console.log(err)
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}


const update = async (req, res) => {

  const url = "https://soundcloud.com/tags/podcast";

  const browser = await puppeteer.launch({ headless: 1 })
  const page = await browser.newPage()

  await page.goto(url);
  await page.waitForSelector('#onetrust-accept-btn-handler');
  await page.click('#onetrust-accept-btn-handler');

  const headers = await page.$$eval("div.soundTitle__titleContainer", links => //links
    links.map(link => ({
      title: link.getElementsByClassName("soundTitle__title")[0].textContent.trim(),
      time: link.getElementsByClassName("relativeTime")[0].getAttribute('dateTime'),
    }))
  )
  await browser.close();

  try {

    await Song.insertMany(headers, { ordered: false })

    res.json(headers);

  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }

}

const rss = async (req, res) => {
  try {
    let songs = await Song.find().select('_id title time').lean()

    const feedObject = {
      rss: [
        {
          _attr: {
            version: "2.0",
            "xmlns:atom": "http://www.w3.org/2005/Atom",
          },
        },
        {
          channel: [
            {
              "atom:link": {
                _attr: {
                  href: "http://www.example.com/feed.rss",
                  rel: "self",
                  type: "application/rss+xml",
                },
              },
            },
            {
              title: "YOUR-WEBSITE-TITLE",
            },
            {
              link: "http://www.example.com",
            },
            { description: "YOUR-WEBSITE-DESCRIPTION" },
            { language: "en-US" },
            // todo: add the feed items here
            ...songs.map(song => ({
              item: [
                { title: song.title },
                {
                  pubDate: song.time,
                },
                {
                  guid: [
                    { _attr: { isPermaLink: true } },
                    `http://www.example.com/${song._id}/`,
                  ],
                },
                {
                  description: {
                    _cdata: song.title,
                  },
                },
              ],
            }))
          ],
        },
      ],
    };

    const feed = '<?xml version="1.0" encoding="UTF-8"?>' + xml(feedObject);

    fs.writeFile("./feed1.rss", feed, "utf8").catch(err => console.log);

    res.set('Content-Type', 'application/rss+xml');
    res.send(feed);

  } catch (err) {
    console.log(err)
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const verify = async (req, res) => {

  var xmlStrExample = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><atom:link href="http://www.example.com/feed.rss" rel="self" type="application/rss+xml"/><title>YOUR-WEBSITE-TITLE</title><link>http://www.example.com</link><description>YOUR-WEBSITE-DESCRIPTION</description><language>en-US</language></channel></rss>`;

  const url = "https://validator.w3.org/feed/#validate_by_input"; // routed to https://validator.w3.org/feed/check.cgi
  const xmlStr = await (await fs.readFile("./feed1.rss")).toString()
  console.log(xmlStr)
  const browser = await puppeteer.launch({ headless: 0 })
  const page = await browser.newPage()

  await page.goto(url);
  await page.type('#rawdata', xmlBodyStr)

  await page.evaluate(() => {
    console.log('blablabla')
    document.querySelector('input[type=submit]').click();
  });

  // await browser.close();

}

module.exports = {
  list,
  update,
  rss,
  verify,
}
