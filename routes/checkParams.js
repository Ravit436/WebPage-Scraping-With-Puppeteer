const Joi               = require('joi');
const constants         = require('./constants');
const utils             = require('./utils');
const responseMessages  = require('./responseMessages');

exports.isScrapeReviewsValid = isScrapeReviewsValid;

function isScrapeReviewsValid(req, res, next){
    let options = req.body;

    let schema = Joi.object().keys({
		url: Joi.string().required()
				.regex(new RegExp('^(' + constants.allowedUrl + ')'))
    })
    .options({ allowUnknown: true });

    let result = Joi.validate(options, schema);

    if(result.error){
        console.error(result.error);
        let error = new Error(responseMessages.ENTER_VALID_URL);
        error.show_error = 1;
        return utils.sendErrorResponse(error, res);
    }

	options.url = options.url.replace(/(pagenumber=)\w+&/g, '');
    next();
}
