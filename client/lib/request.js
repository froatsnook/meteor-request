request = function(options, callback) {
    Meteor.call("froatsnook:request/request", options, function(err, result) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, result.response, result.body);
    });
};

