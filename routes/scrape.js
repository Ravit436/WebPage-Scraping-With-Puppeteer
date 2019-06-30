const Promise			= require('bluebird');
const puppeteer			= require('puppeteer');
const randomUA 			= require('modern-random-ua');
const utils             = require('./utils');
const constants         = require('./constants');
const responseMessages  = require('./responseMessages');

exports.scrapeReviews = scrapeReviews;

async function scrapeReviews(req, res){
	let browser;
	try {
		let options = req.body;
		browser = await puppeteer.launch();
		let page = await browser.newPage();
		await page.setUserAgent(randomUA.generate());
		await page.setRequestInterception(true);
		page.on('request', interceptedRequest => {
			if (interceptedRequest.url().includes('.jpg') || interceptedRequest.url().includes('.jpeg')
				|| interceptedRequest.url().includes('.png')
				|| (constants.excludeDefaultImg != interceptedRequest.url() && interceptedRequest.url().includes('.gif'))){
				interceptedRequest.abort();
			}
			else{
				interceptedRequest.continue();
			}
		});
		await page.goto(options.url);
		let reviewsList = await fetchAllReviews(page);

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
	finally{
		await browser.close();
	}
}

async function fetchAllReviews(page) {
	let reviewsExists = await page.$("#reviewtab a");
	if(!reviewsExists){
		let error = new Error(responseMessages.NO_REVIEWS_EXISTS);
		error.show_error = 1;
		throw error;
	}
	await reviewsExists.click();

	let endOfReviews = 0, firstPage = 1;
	let reviewsList = [];
	while(!endOfReviews){
		let reviewsElements = await page.$$("div.review");
		let currentReviews = await Promise.map(reviewsElements, element => {
			return fetchElementReview(element);
		});

		reviewsList = reviewsList.concat(currentReviews);
		let pageElements = await page.$$(".reviewPage a");
		if(pageElements){
			if(firstPage){
				await pageElements[0].click();
				await page.waitForNavigation();
			}
			else if(pageElements.length == 4){
				await pageElements[1].click();
				await page.waitForNavigation();
			}
			else{
				endOfReviews = 1;
			}
			firstPage = 0;
		}
		else{
			endOfReviews = 1;
		}
	}

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

