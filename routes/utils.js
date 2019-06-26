const zlib				= require('zlib');

exports.sendErrorResponse = sendErrorResponse;
exports.sendZippedResponse = sendZippedResponse;

/**
 * Sends a response in case of an error
 * @param  {object} error       {status, message}
 * @param  {stream} res         express res stream
 */
function sendErrorResponse(error, res) {
	let response =  {
		status : false,
		message : "Failed",
	};

	if(error.show_error){
		response.message = error.message;
	}

	console.log(error.stack);
	res.send(response);
}

/**
 * Compresses a given response object and sends it.
 * @param  {object} response    Contains the final result of any API
 * @param  {stream} res         express res stream
 */
function sendZippedResponse(response, res) {
    zlib.gzip(JSON.stringify(response), function(error, zippedData) {
        if(error){
            console.error(error.stack);
            return res.send(response);
        }
        res.set({'Content-Encoding': 'gzip'});
        return res.send(zippedData);
    });
}
