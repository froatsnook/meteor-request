if (Meteor.isServer) {
    // Start a server to test HTTP client streams.
    var http = Npm.require("http");
    var url = Npm.require("url");
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

            case "/test3":
                var buf1 = new Buffer([1,2,3,4]);
                res.write(buf1);

                setTimeout(function() {
                    var buf2 = new Buffer([5,6,7,8]);
                    res.write(buf2);

                    res.end();
                }, 50);

                break;

            case "/test4":
                var buffers = [];

                req.on("data", function(data) {
                    buffers.push(data);
                });

                req.on("end", function() {
                    res.write(Buffer.concat(buffers));
                    res.end();
                });

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

            case "/hang":
                // Do not respond.
                break;

            case "/getToken":
                var token = req.headers["x-token"];
                res.write(token);
                res.end();
                break;

            case "/404":
                res.writeHead(404, "Not found.");
                res.end();
                break;

            case "/500":
                res.writeHead(500, "Internal server error.");
                res.end();
                break;

            default:
                console.error("Bad path");
                res.writeHead(400, "Bad path");
                res.end();
                break;
        }
    });

    var port = 10492;
    server.listen(port, "127.0.0.1");

    var makeAddr = function(path) {
        return "http://127.0.0.1:" + port + path;
    };

    Tinytest.add("basic - GET /test1 (basic)", function(test) {
        var addr = makeAddr("/test1");
        var res = request.getSync(addr);
        test.equal(res.body, "OK");
    });

    Tinytest.add("basic - GET /test2 (\"more\" async)", function(test) {
        var addr = makeAddr("/test2");
        var res = request.getSync(addr);
        test.equal(res.body, "12345");
    });

    Tinytest.add("basic - GET /test3 (buffer)", function(test) {
        var addr = makeAddr("/test3");
        var res = request.getSync(addr, {
            encoding: null
        });

        test.isTrue(res.body instanceof Buffer, "res.body should be a Buffer");
        for (var i = 0; i < 8; i++) {
            test.equal(res.body[i], i + 1);
        }
    });

    Tinytest.add("basic - POST /test4 (echo binary)", function(test) {
        var addr = makeAddr("/test4");
        var buf = new Buffer([0,1,2]);
        var res = request.postSync(addr, {
            body: buf,
            encoding: null
        });

        test.isTrue(res.body instanceof Buffer, "res.body should be a buffer");
        test.equal(res.body.length, 3);
        test.equal(res.body[0], 0);
        test.equal(res.body[1], 1);
        test.equal(res.body[2], 2);
    });

    Tinytest.add("echo - PATCH /echo", function(test) {
        var addr = makeAddr("/echo");
        var res = request.patchSync(addr, {
            body: "patch test"
        });
        test.equal(res.body, "patch test");
    });

    Tinytest.add("echo - POST /echo", function(test) {
        var addr = makeAddr("/echo");
        var res = request.postSync(addr, {
            body: "post test"
        });
        test.equal(res.body, "post test");
    });

    Tinytest.add("echo - PUT /echo", function(test) {
        var addr = makeAddr("/echo");
        var res = request.putSync(addr, {
            body: "put test"
        });
        test.equal(res.body, "put test");
    });

    Tinytest.add("methods - GET /method", function(test) {
        var addr = makeAddr("/method");
        var res = request.getSync(addr);
        test.equal(res.body, "GET");
    });

    Tinytest.add("methods - PUT /method", function(test) {
        var addr = makeAddr("/method");
        var res = request.putSync(addr);
        test.equal(res.body, "PUT");
    });

    Tinytest.add("methods - PATCH /method", function(test) {
        var addr = makeAddr("/method");
        var res = request.patchSync(addr);
        test.equal(res.body, "PATCH");
    });

    Tinytest.add("methods - POST /method", function(test) {
        var addr = makeAddr("/method");
        var res = request.postSync(addr);
        test.equal(res.body, "POST");
    });

    Tinytest.add("methods - HEAD /method", function(test) {
        var addr = makeAddr("/method");
        var res = request.headSync(addr);
        var method = res.response.headers["x-method"];
        test.equal(method, "HEAD");
    });

    Tinytest.add("methods - DELETE /method", function(test) {
        var addr = makeAddr("/method");
        var res = request.delSync(addr);
        test.equal(res.body, "DELETE");
    });

    Tinytest.add("options - Just options (url in options)", function(test) {
        var addr = makeAddr("/method");
        var res = request.getSync({
            url: addr
        });
        test.equal(res.body, "GET");
    });

    Tinytest.add("options - Just options, no options.url should throw", function(test) {
        test.throws(function() {
            var res = request.getSync({ });
        });
    });

    // To me this seems undocumented, but it's how request works.
    Tinytest.add("options - With parsed url object (surprisingly fails)", function(test) {
        test.throws(function() {
            var addr = makeAddr("/method");
            var uri = url.parse(addr);
            request.getSync(uri);
        });
    });

    Tinytest.add("options - With parsed url object and options", function(test) {
        var addr = makeAddr("/getToken");
        var uri = url.parse(addr);
        var res = request.getSync(uri, {
            headers: { "X-TOKEN": "XYZ" }
        });
        test.equal(res.body, "XYZ");
    });

    Tinytest.add("options - With parsed url object in options", function(test) {
        var addr = makeAddr("/method");
        var uri = url.parse(addr);
        var res = request.getSync({
            uri: uri
        });
        test.equal(res.body, "GET");
    });

    Tinytest.add("options - Throw without URI/options", function(test) {
        test.throws(function() {
            request.getSync();
        });
    });

    Tinytest.add("errors - Timeout", function(test) {
        test.throws(function() {
            var addr = makeAddr("/hang");
            request.getSync(addr, {
                timeout: 100
            });
        });
    });

    Tinytest.add("errors - GET /404", function(test) {
        var addr = makeAddr("/404");
        var res = request.getSync(addr);
        test.equal(res.response.statusCode, 404);
    });

    Tinytest.add("errors - GET /500", function(test) {
        var addr = makeAddr("/500");
        var res = request.getSync(addr);
        test.equal(res.response.statusCode, 500);
    });

    Tinytest.add("defaults - Test defaults", function(test) {
        var defaults = request.defaults({
            headers: { "X-TOKEN": "XYZ" }
        });

        var addr = makeAddr("/getToken");
        var res = defaults.getSync(addr);
        test.equal(res.body, "XYZ");
    });

    Tinytest.add("defaults - Test baseUrl", function(test) {
        var defaults = request.defaults({
            baseUrl: makeAddr("/")
        });

        var res = defaults.sync("getToken", {
            headers: { "X-TOKEN": "XYZ" }
        });

        test.equal(res.body, "XYZ");
    });

    Tinytest.add("sync - request.sync should exist", function(test) {
        test.equal(typeof request.sync, "function");
    });

    Tinytest.add("sync - request.sync should default to GET", function(test) {
        var addr = makeAddr("/method");
        var res = request.sync(addr);
        test.equal(res.body, "GET");
    });

    Tinytest.add("sync - request.sync GET should work", function(test) {
        var addr = makeAddr("/method");
        var res = request.sync(addr);
        test.equal(res.body, "GET");
    });

    Tinytest.add("sync - request.sync with options should work", function(test) {
        var addr = makeAddr("/getToken");
        var res = request.sync({
            url: addr,
            headers: { "X-TOKEN": "XYZ" }
        });
        test.equal(res.body, "XYZ");
    });
}

