Package.describe({
	summary: "A Simplified HTTP client",
	version: "2.40.0",
	git: "https://github.com/czbaker/meteor-request.git",
	name: "czbaker:request"
});

Npm.depends({
	"request": "2.40.0"
})

Package.onUse(function(api) {
	api.versionsFrom('METEOR@0.9.0.1');
	api.use('underscore','server');
	api.addFiles('server/lib/meteor-request.js','server');
	api.export('request','server');
});