const puppeteer			= require('puppeteer');
const utils             = require('./utils');
const responseMessages  = require('./responseMessages');

exports.scrapeReviews = scrapeReviews;

async function scrapeReviews(req, res){
	try {
		let options = req.body;
		let browser = await puppeteer.launch();
		let page = await browser.newPage();
		await page.goto(options.url);
		let reviewsList = await fetchAllReviews(page);
		await browser.close();
		let response = {
			status: true,
			message: responseMessages.REVIEWS_FETCHED,
			reviews: reviewsList
		}
		return utils.sendZippedResponse(response, res);
	}
	catch(error) {
		utils.sendErrorResponse(error, res);
	}
}

function fetchAllReviews(page) {
	return page.evaluate(() => {
		return Array.from(document.querySelectorAll("div.review"))
		.map(review => ({
			rating: review.querySelector("div.itemRating > strong").innerText,
			comments: {
				title: review.querySelector(".rightCol h6").innerText,
				body: review.querySelector(".rightCol p").innerText.trim()
			},
			reviewer: review.querySelector(".reviewer > dd:nth-child(2)").innerText,
			date: review.querySelector(".reviewer > dd:nth-child(4)").innerText
		}));
	});
}

