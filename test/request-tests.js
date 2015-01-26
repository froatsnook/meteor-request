if (Meteor.isServer) {
    // Start a server to test HTTP client streams.
    var http = Npm.require("http");
    var server = http.createServer(function(req, res) {
        var url = req.url;

        switch (url) {
            case "/test1":
                res.write("OK");
                res.end();
                break;

            case "/test2":
                res.write("1");
                setTimeout(function() { res.write("2"); }, 10);
                setTimeout(function() { res.write("3"); }, 20);
                setTimeout(function() { res.write("4"); }, 30);
                setTimeout(function() { res.write("5"); }, 40);
                setTimeout(function() { res.end(); }, 50);
                break;
        }
    });

    var port = 10492;
    server.listen(port, "127.0.0.1");

    Tinytest.add("GET /test1", function(test) {
        var res = request.getSync("http://127.0.0.1:" + port + "/test1");
        test.equal(res.body, "OK");
    });

    Tinytest.add("GET /test2", function(test) {
        var res = request.getSync("http://127.0.0.1:" + port + "/test2");
        test.equal(res.body, "12345");
    });
}

