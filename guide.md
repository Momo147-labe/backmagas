===============================
BACKEND LICENCES - GUIDE COMPLET
===============================

Description :
-------------
Ce backend gère un système de licences pour une application Desktop ou Mobile :
- Génération de licences sécurisées (HMAC SHA-256)
- Stockage dans un fichier JSON
- Attribution automatique d’une licence après achat
- Activation sur un seul appareil par licence
- Protection contre doublons et usages frauduleux
- Routes pour direction / admin

Technologies :
---------------
- Node.js
- Express 5
- JSON pour stockage initial
- HMAC SHA-256 pour signature des licences

-------------------------------
1. STRUCTURE DU PROJET
-------------------------------
license-backend/
│
├── data/
│   └── licenses.json          # Stockage licences
├── routes/
│   └── license.routes.js      # Routes API
├── utils/
│   └── license.utils.js       # Fonctions utilitaires
├── generate-licenses.js       # Générateur de licences sécurisées
├── server.js                  # Serveur Express principal
└── package.json               # Dépendances et scripts

-------------------------------
2. ENDPOINTS API
-------------------------------

1️⃣ ATTRIBUTION LICENCE (APRES ACHAT)
------------------------------------
POST /api/license/assign
Headers:
  x-payment-token: PAYMENT_SECRET
Body JSON:
{
  "client_id": "CLIENT_1023"
}
Réponse réussie :
{
  "success": true,
  "license_key": "LIC-XXXXXXXX-YYYYYYYYYYYYYYYY"
}
Erreurs possibles :
- 400 : client_id manquant
- 403 : paiement non autorisé
- 404 : plus de licences disponibles

------------------------------------
2️⃣ RECUPERER UNE LICENCE DISPONIBLE (DIRECTION / ADMIN)
GET /api/license/available
Headers:
  x-admin-key: ADMIN_SECRET_2025
Réponse réussie :
{
  "success": true,
  "license_key": "LIC-XXXXXXXX-YYYYYYYYYYYYYYYY"
}
Erreurs possibles :
- 403 : accès refusé
- 404 : aucune licence disponible

------------------------------------
3️⃣ LIBERER UNE LICENCE RESERVEE
POST /api/license/release
Headers:
  x-admin-key: ADMIN_SECRET_2025
Body JSON:
{
  "license_key": "LIC-XXXXXXXX-YYYYYYYYYYYYYYYY"
}
Réponse réussie :
{
  "success": true,
  "message": "Licence remise en stock"
}

------------------------------------
4️⃣ ACTIVATION LICENCE SUR APPAREIL
POST /api/license/activate
Body JSON:
{
  "license_key": "LIC-XXXXXXXX-YYYYYYYYYYYYYYYY",
  "client_id": "CLIENT_1023",
  "device_id": "DEVICE_ABC_001"
}
Réponse réussie :
{
  "success": true,
  "message": "Licence activée"
}
Erreurs possibles :
- 400 : données manquantes
- 403 : licence falsifiée ou réservée à un autre client
- 403 : licence déjà utilisée sur un autre appareil
- 404 : licence inconnue

-------------------------------
3. STOCKAGE LICENCE JSON
-------------------------------
{
  "licenses": [
    {
      "key": "LIC-XXXXXXXX-YYYYYYYYYYYYYYYY",
      "active": false,
      "reserved": false,
      "reserved_for": null,
      "reserved_at": null,
      "device_id": null,
      "activated_at": null
    }
  ]
}

-------------------------------
4. UTILISATION FRONT (EXEMPLE FLUTTER DESKTOP / MOBILE)
-------------------------------

1️⃣ Installer package HTTP
- Ajouter dans pubspec.yaml :
  dependencies:
    http: ^1.1.0
- flutter pub get

2️⃣ Créer un service LicenceService
- assignLicense(clientId) → récupérer licence après paiement
- activateLicense(licenseKey, clientId, deviceId) → activer sur l’appareil

Exemple d’appel Flutter :

import 'services/license_service.dart';

final licenseService = LicenseService();
final clientId = "CLIENT_1023";

// 1. Récupération licence après paiement
String? license = await licenseService.assignLicense(clientId);

// 2. Récupération deviceId Desktop
String deviceId = getDeviceId(); // système ou package system_info

// 3. Activation licence
bool success = await licenseService.activateLicense(license, clientId, deviceId);

-------------------------------
5. NOTES IMPORTANTES
-------------------------------
- Chaque licence est unique et signée avec HMAC SHA-256
- DeviceId Desktop : combine hostName, kernel, CPU info pour un identifiant unique
- Stocker la licence activée localement (SharedPreferences / secure_storage)
- Routes sensibles protégées avec x-payment-token (achat) ou x-admin-key (admin)
- Ne jamais exposer SECRET ou PAYMENT_SECRET côté client

-------------------------------
6. FLUX COMPLET
-------------------------------
Achat client → assign → licence réservée → activation sur appareil → licence active
Direction → get available → récupération d’une licence libre
Admin → release → libération d’une licence si besoin

-------------------------------
7. RECOMMANDATIONS
-------------------------------
- Protéger les routes critiques
- Stocker localement la licence sur le Desktop
- HMAC + secrets longs pour éviter falsification
- En prod, passer à SQLite ou PostgreSQL pour historique et fiabilité

-------------------------------
FIN DU GUIDE
===============================
