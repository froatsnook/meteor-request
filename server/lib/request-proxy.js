Meteor.methods({
    "froatsnook:request/request": function(options) {
        var result = request.sync(options);

        var cleanResponse = JSON.parse(JSON.stringify(result.response));
        var cleanBody = result.body;

        // Strip away parts that can't be sent to the client, like functions.
        return {
            response: cleanResponse,
            body: cleanBody,
        };
    },
});

