const express = require('express');
const keycloakService = require('./keycloakService');

const router = express.Router();

router.post('/upload', keycloakService.bulk);

module.exports = router;