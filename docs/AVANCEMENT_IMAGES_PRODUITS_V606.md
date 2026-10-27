# Avancement images produits — complément v606

**État initial : PRÉPARÉ, EN ATTENTE de validation PR et déploiement.** Le suivi historique central reste `docs/AVANCEMENT_IMAGES_PRODUITS.md`, non modifié pendant la préparation du lot. Base immuable `main` `71c0d1c4a2e621e4d4b3dd86aa4f8bb15752e184`, version v605. Détails des 9 fichiers et crédits dans `docs/IMAGE_CREDITS_V606.md`.

| Catégorie | Produit | Avant (octets) | Après (octets) |
|---|---|---:|---:|
| Maison | Détartrant | 2010 | 15918 |
| Maison | Nettoyant salle de bain | 2844 | 17284 |
| Maison | Liquide rinçage | 2806 | 14668 |
| Boissons | Sirop de grenadine | 2220 | 12520 |
| Boissons | Sirop de menthe | 2306 | 11532 |
| Boissons | Sirop de pêche | 2330 | 12760 |
| Petit-déjeuner | Infusion camomille | 4080 | 29020 |
| Petit-déjeuner | Infusion menthe | 3852 | 29282 |
| Petit-déjeuner | Infusion verveine | 3798 | 24978 |
| **Total** | **9 nouveaux WebP unitaires** | **26 246** | **167 962** |

**Après publication à confirmer :** 330 produits distincts renouvelés / 414 ; 84 non renouvelés ; au moins 24 conservés sans double comptage ; au moins 354 décisions définitives ; au plus 60 sans décision. 414 WebP pour un total calculé de 10 478 438 octets (+141 716 octets). Aucun doublon de produit renouvelé, ni remplacement de fichier déjà renouvelé. Suite de tests `bash scripts/validate_repo.sh` (incluant `node --test tests/*.test.mjs`) requise avant fusion, puis CI `main` et GitHub Pages à confirmer.

**REJETÉ :** collages de produits, fonds opaques, substitution de nettoyant sol par un bidon de lessive ou un flacon de liquide vaisselle. **CONSERVÉ :** le contenu déjà satisfaisant des autres produits. Aucun changement de sécurité, Home Assistant, navigation, tuiles, safe areas iOS, biométrie, verrouillage, mode test ou synchronisation WebSocket. Les contrôles sur iPhone réel et en réseau totalement déconnecté restent non effectués.
