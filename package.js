Package.describe({
    summary: "A Simplified HTTP client which supports retrieving binary data",
    version: "2.64.0",
    git: "https://github.com/froatsnook/meteor-request.git",
    name: "froatsnook:request"
});

Npm.depends({
    "request": "2.67.0"
})

Package.onUse(function(api) {
    api.versionsFrom("METEOR@0.9.0.1");
    api.use("underscore", "server");
    api.addFiles("server/lib/meteor-request.js", "server");
    api.export("request", "server");
});

Package.onTest(function(api) {
    api.use("tinytest");
    api.use("froatsnook:request");

    api.addFiles("test/request-tests.js");
});

