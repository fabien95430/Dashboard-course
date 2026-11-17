# Version famille

Les foyers de la famille utilisent la même application (GitHub Pages) avec leur propre liste, synchronisée en temps réel entre leurs téléphones via Supabase. Le compte administrateur reste indépendant de Supabase : coffre local chiffré + Home Assistant, comme avant.

## Connexion

- Écran d’accueil unique « Accès privé » : **Identifiant** puis **Mot de passe**. L’identifiant est mémorisé sur l’appareil.
- `admin` → version administrateur (coffre local, Home Assistant). Home Assistant se connecte depuis Réglages › Connexion Home Assistant.
- Tout autre identifiant → compte famille Supabase (`<identifiant>@famille.invalid`). Une fois connecté, plus de mot de passe ni de verrouillage.
- Au premier lancement, chaque téléphone famille reçoit un nom (« Cet appareil »).

## Ce que voit une famille

- Sa liste (partagée entre ses téléphones), Catalogue, Plats, Préférences, Personnalisation des recettes.
- Catalogue des produits : **demandes** d’ajout uniquement (pas de suppression, pas d’OpenAI/ChatGPT).
- Gestion de l’application : Historique, Documentation, Notifications.
- Appareils connectés : lecture seule. Seul l’administrateur peut déconnecter un téléphone.
- Masqués : Connexion Home Assistant, Sécurité, Administrateur, Messages d’erreur.

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

Seule la clé **publishable** figure dans le code (`family-service.js`). Ne jamais committer la clé secrète / `service_role`.

Le workflow `.github/workflows/supabase-keepalive.yml` appelle `ping()` le lundi et le jeudi pour éviter la mise en pause de l’offre gratuite (7 jours sans activité).

## Ajouter une famille

Authentication › Users › Add user : e-mail `<identifiant>@famille.invalid` (sans accent), mot de passe, « Auto Confirm User ». L’identifiant se partage entre les membres du foyer.
