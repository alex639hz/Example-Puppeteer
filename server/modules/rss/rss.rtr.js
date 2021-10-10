var express = require('express');
var rssCtrl = require('./rss.ctrl');

const router = express.Router()

// returns JSON format of all the scraped podcasts
router.route('/list').get(rssCtrl.list)

// scrapes https://soundcloud.com/tags/podcast and updates the DB with scraped documents
router.route('/update').post(rssCtrl.update)

// returns an RSS (XML) feed according to these standards: https://support.google.com/podcast-publishers/answer/9889544?hl=en
router.route('/rss').get(rssCtrl.rss)

// verify the RSS feed with the following service https://validator.w3.org/feed/#validate_by_input and return the output.
router.route('/verify').get(rssCtrl.verify)

module.exports = router;
