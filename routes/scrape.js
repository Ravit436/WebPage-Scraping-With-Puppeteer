const Promise			= require('bluebird');
const puppeteer			= require('puppeteer');
const utils             = require('./utils');
const responseMessages  = require('./responseMessages');

exports.scrapeReviews = scrapeReviews;

async function scrapeReviews(req, res){
	try {
		let options = req.body;
		let browser = await puppeteer.launch();
		let page = await browser.newPage();
		await page.goto(options.url, {waitUntil: "networkidle0"});
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

async function fetchAllReviews(page) {
	let reviewsElements = await page.$$("div.review");

	let reviewsList = await Promise.map(reviewsElements, element => {
		return fetchElementReview(element);
	});
	return reviewsList;
}

async function fetchElementReview(element) {
	let [rating, commentTitle, commentBody, reviewer, reviewDate] = await Promise.all([
		element.$eval("div.itemRating > strong", rating => rating.innerText),
		element.$eval(".rightCol h6", commentTitle => commentTitle.innerText),
		element.$eval(".rightCol p", commentBody => commentBody.innerText),
		element.$eval(".reviewer > dd:nth-child(2)", reviewer => reviewer.innerText),
		element.$eval(".reviewer > dd:nth-child(4)", reviewDate => reviewDate.innerText)
	]);

	let review = {
		rating: rating,
		comments: {
			title: commentTitle,
			body: commentBody
		},
		reviewer: reviewer,
		date: reviewDate
	};
	return review;
}

