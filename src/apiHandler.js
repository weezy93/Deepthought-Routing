var config;
var models = [];
var apiModel = require('./apiModel.js');
var logger = require('technicolor-logger');

function getRoutes(req, res) {
    var urls = [];
    var apiRoutes = apiModel.routes;
    for (var route in apiRoutes) {
        if (!apiRoutes[route]) { continue; }
        var url = {};
        url[route] = {
            'description': apiRoutes[route].description
            , 'parameters': apiRoutes[route].parameters
        };

        urls.push(url);
    }

    res.json(urls);
}

function setup(app, cfg) {
    config = cfg || require('../config.json');
    models = config.models || models;

    apiModel.routeRegistered.on('registeredSuccessfully', function(route) {
        preRegisterRoute(route);
        app[route.method](route.pattern, route.handler);
    });

    apiModel.routeRegisteredError.on('registrationError', function(route) {
        throw new Error('Unable to register route:', route);
    });

    setupRoutes();

    return apiModel;
}

function preRegisterRoute(route) {
    var tempRoute = route;

    if (!config.logRouteRegistration) {
        logger.info(JSON.stringify(tempRoute));
    }
}

function setupRoutes() {
    for (var prop in models) {
        if (models[prop]) {
            models[prop].init(apiModel);
        }
    }

    if (config.routesUri) {
        apiModel.registerPublicRoute('get', 'displayAvailableRoutes', config.routesUri, getRoutes, null, 'Displays the available routes.');
    }
}

exports.setup = setup;
exports.models = models;
