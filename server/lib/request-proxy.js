Meteor.methods({
    "froatsnook:request/request": function(options) {
        var result = request.sync(options);

        var cleanResponse = JSON.parse(JSON.stringify(result.response));

        //var cleanResponse = _.omit(result.response, function(val, key) {
        //    // Don't send "private API" response parts
        //    if (key.indexOf("_") === 0) {
        //        return true;
        //    }

        //    // Don't send functions
        //    if (_.isFunction(val)) {
        //        return true;
        //    }

        //});

        var cleanBody = result.body;

        // Strip away parts that can't be sent to the client, like functions.
        return {
            response: cleanResponse,
            body: cleanBody,
        };
    },
});

