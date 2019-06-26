const Joi               = require('joi');
const constants         = require('./constants');
const utils             = require('./utils');
const responseMessages  = require('./responseMessages');

exports.isScrapeReviewsValid = isScrapeReviewsValid;

function isScrapeReviewsValid(req, res, next){
    let options = req.body;

    let schema = Joi.object().keys({
        url: Joi.string().required()
    })
    .options({ allowUnknown: true });

    let result = Joi.validate(options, schema);

    if(result.error){
        console.error(result.error);
        let error = new Error(result.error.details[0].message.replace(/\"/g, ""))
        error.show_error = 1;
        return utils.sendErrorResponse(error, res);
    }

    next();
}
