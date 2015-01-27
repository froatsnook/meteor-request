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

            case "/method":
                res.setHeader("X-METHOD", "HEAD");

                if (req.method !== "HEAD") {
                    res.write(req.method);
                }

                res.end();
                break;

            case "/echo":
                var body = "";

                req.on("data", function(data) {
                    body += data;
                });

                req.on("end", function() {
                    res.write(body);
                    res.end();
                });

                break;
        }
    });

    var port = 10492;
    server.listen(port, "127.0.0.1");

    var makeAddr = function(path) {
        return "http://127.0.0.1:" + port + path;
    };

    Tinytest.add("GET /test1", function(test) {
        var addr = makeAddr("/test1");
        var res = request.getSync(addr);
        test.equal(res.body, "OK");
    });

    Tinytest.add("GET /test2", function(test) {
        var addr = makeAddr("/test2");
        var res = request.getSync(addr);
        test.equal(res.body, "12345");
    });

    Tinytest.add("PATCH /echo", function(test) {
        var addr = makeAddr("/echo");
        var res = request.patchSync(addr, {
            body: "patch test"
        });
        test.equal(res.body, "patch test");
    });

    Tinytest.add("POST /echo", function(test) {
        var addr = makeAddr("/echo");
        var res = request.postSync(addr, {
            body: "post test"
        });
        test.equal(res.body, "post test");
    });

    Tinytest.add("PUT /echo", function(test) {
        var addr = makeAddr("/echo");
        var res = request.putSync(addr, {
            body: "put test"
        });
        test.equal(res.body, "put test");
    });

    Tinytest.add("GET /method", function(test) {
        var addr = makeAddr("/method");
        var res = request.getSync(addr);
        test.equal(res.body, "GET");
    });

    Tinytest.add("PUT /method", function(test) {
        var addr = makeAddr("/method");
        var res = request.putSync(addr);
        test.equal(res.body, "PUT");
    });

    Tinytest.add("PATCH /method", function(test) {
        var addr = makeAddr("/method");
        var res = request.patchSync(addr);
        test.equal(res.body, "PATCH");
    });

    Tinytest.add("POST /method", function(test) {
        var addr = makeAddr("/method");
        var res = request.postSync(addr);
        test.equal(res.body, "POST");
    });

    Tinytest.add("HEAD /method", function(test) {
        var addr = makeAddr("/method");
        var res = request.headSync(addr);
        var method = res.response.headers["x-method"];
        test.equal(method, "HEAD");
    });

    Tinytest.add("DELETE /method", function(test) {
        var addr = makeAddr("/method");
        var res = request.delSync(addr);
        test.equal(res.body, "DELETE");
    });
}

