# Version famille

Les foyers de la famille utilisent la même application (GitHub Pages) avec leur propre liste, synchronisée en temps réel entre leurs téléphones via Supabase. Le compte administrateur reste indépendant de Supabase : coffre local chiffré + Home Assistant, comme avant.

## Connexion

- Écran d’accueil unique « Accès privé » : **Identifiant** puis **Mot de passe**. L’identifiant est mémorisé sur l’appareil.
- `admin` → version administrateur (coffre local, Home Assistant). Home Assistant se connecte depuis Réglages › Connexion Home Assistant.
- Tout autre identifiant → compte famille Supabase (`<identifiant>@famille.invalid`). Une fois connecté, plus de mot de passe ni de verrouillage.
- Au premier lancement, chaque téléphone famille reçoit un nom (« Cet appareil »).

## Ce que voit une famille

- Sa liste (partagée entre ses téléphones), Catalogue, Plats.
- Réglages › **Compte** : Appareils connectés, en lecture seule. Seul l’administrateur peut déconnecter un téléphone.
- Réglages › **Préférences** : Affichage et liste (dont l’historique des achats), Notifications.
- Réglages › **Catalogue et recettes** : Catalogue des produits (**demandes** d’ajout uniquement, pas de suppression, pas d’OpenAI/ChatGPT), Personnalisation des recettes.
- Réglages › **Contribuer** : Idées et corrections.
- Réglages › **Aide** : Documentation.
- Masqués : Connexion Home Assistant, Sécurité, Familles, Bureau, Messages d’erreur.

## Écran administrateur « Familles »

Réglages › Administrateur › Familles. Au premier accès, saisir le compte administrateur Supabase : il est rangé dans le coffre chiffré (mot de passe de l’application demandé quand un coffre existe) et effacé de la mémoire au verrouillage.

Pour chaque foyer :

- **Demandes** : produits et plats demandés. Ligne dépliable → ✦ OpenAI, ↗ ChatGPT (mêmes intégrations que « À intégrer »), corbeille = refuser (avec confirmation). Rien n’arrive dans les onglets de l’administrateur.
- **Stats** : courses du mois, produits cochés, plus achetés (31 jours), catégories.
- **Modifs** : plats personnalisés comparés au plat de base (le plat de base ne change jamais).
- **Appareils** : téléphones actifs, « Déconnecter » (deux appuis).

## Supabase

Scripts à exécuter une seule fois, dans l’ordre (SQL Editor › New query › Run) :

1. `supabase/01-famille.sql` — tables, règles RLS, temps réel, `ping()`, droits ; puis la ligne `insert into public.admins …`.
2. `supabase/02-famille.sql` — demandes (statut), lecture admin des personnalisations, historique `achats`.
3. `supabase/03-famille.sql` — notes de plats et ordre de la liste.
4. `supabase/04-famille.sql` — fonction `familles()` pour les noms des foyers.
5. `supabase/05-famille.sql` — notifications des familles (abonnements + déclencheurs), après la fonction Edge ci-dessous. Fait le 18/11/2026, avec les secrets VAPID et les deux fonctions Edge.

## Notifications des familles

- Clé Web Push **réservée aux familles** : la clé publique est dans `family-service.js`, la clé privée uniquement dans les secrets Supabase (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`). L'administrateur garde sa propre clé (Home Assistant → GitHub).
- Fonction Edge `notifier` (`supabase/functions/notifier/index.ts`), « Verify JWT » désactivé : appelée par les déclencheurs de `05-famille.sql`.
- Article ajouté → les autres téléphones du foyer ; demande intégrée → tous les téléphones du foyer.
- Chaque téléphone famille active les notifications dans Réglages › Préférences › Notifications.

Seule la clé **publishable** figure dans le code (`family-service.js`). Ne jamais committer la clé secrète / `service_role`.

Le workflow `.github/workflows/supabase-keepalive.yml` appelle `ping()` le lundi et le jeudi pour éviter la mise en pause de l’offre gratuite (7 jours sans activité).

## Gérer les familles depuis l’app

Réglages › Familles : « Ajouter un foyer » (prénom + mot de passe → compte `<prénom>@famille.invalid` confirmé) ; dans un foyer, onglet Appareils › Compte : « Changer le mot de passe », « Supprimer le foyer » (deux appuis, toutes ses données partent avec le compte).

Fonction Edge `familles-admin` (`supabase/functions/familles-admin/index.ts`), « Verify JWT » **désactivé** (les jetons du projet ne sont plus signés par l’ancien secret) : elle vérifie elle-même la session et que l’appelant est dans `admins` et utilise la clé secrète fournie par Supabase côté serveur (jamais dans l’app). Le compte administrateur ne peut être ni modifié ni supprimé par elle.

Sans cette fonction : Authentication › Users › Add user, e-mail `<identifiant>@famille.invalid` (sans accent), « Auto Confirm User ».
