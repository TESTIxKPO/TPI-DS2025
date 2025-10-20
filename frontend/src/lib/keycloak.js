// src/lib/keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'ds-2025-realm',
  clientId: 'grupo-02',
});

export default keycloak;
