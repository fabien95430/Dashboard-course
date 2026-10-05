# Automatisation des plats manquants

Cette automatisation concerne **uniquement les plats**. Elle ne modifie ni `catalog.js`, ni les atlas produits, ni la liste Home Assistant `Courses`, ni OAuth, le coffre chiffré, le verrouillage ou la biométrie.

## Flux

1. Dans **Réglages → Produits & plats manquants → Plats**, l'utilisateur note un plat puis touche **Intégrer**.
2. La PWA utilise le WebSocket Home Assistant déjà authentifié pour appeler `rest_command.courses_integrate_dish`.
3. Home Assistant déclenche l'événement GitHub `repository_dispatch` `courses_dish_request`. Aucun secret GitHub/OpenAI n'est présent dans le JavaScript de l'application.
4. GitHub Actions :
   - déduit les tags et ingrédients en imposant des noms présents dans `catalog.js` ;
   - génère **une seule image PNG par plat** conformément à `docs/IMAGES_PLATS.md` ;
   - ajoute le plat à `dishes-ui.js` ;
   - ajoute l'image dans `www/Plats/` ;
   - met à jour la liste enfant si nécessaire ;
   - incrémente la version globale et le cache du service worker ;
   - effectue un commit atomique sur `main` ;
   - attend que la nouvelle version et l'image soient réellement servies par GitHub Pages.
5. Après confirmation du déploiement, une notification Web Push **Courses** est envoyée. Un appui ouvre directement le Catalogue sur le plat.

En cas de conflit avec un nouveau commit sur `main`, le workflow s'arrête au lieu d'écraser la modification concurrente.

## Configuration GitHub — une seule fois

Dans **Settings → Secrets and variables → Actions**, créer :

- `OPENAI_API_KEY` : clé API OpenAI utilisée uniquement par GitHub Actions ;
- `COURSES_VAPID_PRIVATE_KEY` : clé privée VAPID utilisée uniquement pour signer les notifications Web Push.

La génération d'images utilise par défaut `gpt-image-2`. Le script permet de remplacer les modèles avec les variables d'environnement `COURSES_IMAGE_MODEL` et `COURSES_TEXT_MODEL` si nécessaire.

### Paire VAPID

Générer une paire VAPID dans un environnement de confiance, par exemple avec :

```sh
npx web-push generate-vapid-keys
```

- **Private Key** → secret GitHub `COURSES_VAPID_PRIVATE_KEY` ;
- **Public Key** → helper Home Assistant `input_text.courses_vapid_public_key` ci-dessous.

Ne jamais mettre la clé privée dans Home Assistant côté état public, dans le dépôt, dans `localStorage` ou dans le JavaScript de la PWA.

## Configuration Home Assistant — une seule fois

Créer un helper texte dont l'identifiant d'entité est exactement :

```text
input_text.courses_vapid_public_key
```

Sa valeur est la **clé VAPID publique**. Elle n'est pas secrète.

Créer ensuite un jeton GitHub limité au dépôt `fabien95430/Dashboard-course` avec la permission dépôt **Contents: Read and write**. Cette permission est requise par l'endpoint GitHub `repository_dispatch`.

Dans `secrets.yaml` :

```yaml
courses_github_authorization: "Bearer github_pat_..."
```

Puis dans la configuration Home Assistant :

```yaml
rest_command:
  courses_integrate_dish:
    url: "https://api.github.com/repos/fabien95430/Dashboard-course/dispatches"
    method: POST
    timeout: 30
    headers:
      Authorization: !secret courses_github_authorization
      Accept: "application/vnd.github+json"
      X-GitHub-Api-Version: "2026-03-10"
      Content-Type: "application/json"
    payload: >-
      {{
        {
          "event_type": "courses_dish_request",
          "client_payload": {
            "name": dish_name,
            "category": dish_category,
            "request_id": request_id,
            "push_endpoint": push_endpoint | default('', true),
            "push_p256dh": push_p256dh | default('', true),
            "push_auth": push_auth | default('', true),
            "push_public_key": push_public_key | default('', true)
          }
        } | to_json
      }}
```

Redémarrer/recharger la configuration concernée après création du `rest_command`.

## Notifications iPhone

Pour recevoir la notification quand Courses est en arrière-plan ou fermée :

- Courses doit être installée sur l'écran d'accueil en tant que PWA ;
- l'autorisation de notifications doit être accordée ;
- la clé VAPID publique Home Assistant et la clé privée GitHub doivent appartenir à la même paire.

Le service worker écoute les événements `push` et `notificationclick`. La souscription Push est transmise uniquement dans le payload temporaire du déclenchement GitHub ; elle n'est pas enregistrée dans le dépôt.

## Garde-fous

- Le workflow n'ajoute jamais de produit et ne reconstruit aucun atlas.
- Les ingrédients générés sont rejetés s'ils ne correspondent pas exactement à un produit existant de `catalog.js`.
- Une image de plat reste un fichier individuel ; aucun atlas/collage/grille n'est créé.
- Le workflow vérifie que `main` n'a pas changé depuis le début de la génération avant de committer.
- Le push de succès n'est envoyé qu'après confirmation du déploiement GitHub Pages.
- Si la notification Push n'est pas configurée, l'intégration du plat peut tout de même fonctionner ; seule la notification finale est absente.
