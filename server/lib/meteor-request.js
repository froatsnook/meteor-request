// Get our NPM stuff.
var Future = Npm.require("fibers/future");
request = Npm.require("request");

// This is our main wrapping function, using Fibers.
var requestSync = function(uri, options) {
	var future = new Future();
	request(uri, options, function(error, response, body) {
		if (error) {
			console.log(error);
			throw error;
		}
		future.return({
			response: response,
			body: body
		});
	});
	return future.wait();
};

// Use this to extend the prototype
_.extend(request, {

	putSync: function(uri, options) {
		options.method = "PUT";
		return requestSync(uri, options);
	},

	patchSync: function(uri, options) {
		options.method = "PATCH";
		return requestSync(uri, options);
	},

	postSync: function(uri, options) {
		options.method = "POST";
		return requestSync(uri, options);
	},

	headSync: function(uri, options) {
		options.method = "HEAD";
		return requestSync(uri, options);
	},

	delSync: function(uri, options) {
		options.method = "DELETE";
		return requestSync(uri, options);
	},

	getSync: requestSync

});