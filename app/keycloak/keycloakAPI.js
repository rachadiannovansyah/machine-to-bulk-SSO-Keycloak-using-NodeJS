const express = require('express');
const keycloakService = require('./keycloakService');

const router = express.Router();

router.post('/upload', keycloakService.bulk);

router.post('/set-credentials', keycloakService.bulkSetPassword);

module.exports = router;