require('express-async-errors');
const KeycloakRouter = require('../app/keycloak/keycloakAPI');
const requestNotFound = require('../middlewares/requestNotFound');
const error = require('../middlewares/error');

module.exports = (app) => {
    app.use('/api', KeycloakRouter);
    app.use(requestNotFound);
    app.use(error);
}