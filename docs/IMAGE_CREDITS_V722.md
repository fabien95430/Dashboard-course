# Correction du détourage et des marges — Épicerie v722

13 visuels existants reconditionnés individuellement à partir de la planche Épicerie déjà validée (source issue de la génération d'image ChatGPT). Les coordonnées de détourage ont été calculées sur la véritable résolution du master (1448 × 1086), au lieu de celles d'une prévisualisation redimensionnée. Les bas d'emballages et leurs marges sont conservés, sans les libellés de la planche. Contrôles Pillow effectués sur fond ivoire, sauge et sombre : 384 × 384 px, RGBA, alpha nul aux quatre coins, marges supérieures/inférieures de 36 px minimum, poids réel inférieur à 150 Kio.

La version du cache de cadrage est désormais prise en compte pour éviter de restaurer les décalages d'anciennes images. Le catalogue, les quantités et Home Assistant restent inchangés. Aucun visuel des riz et des pâtes sèches n'a été touché.

- `www/Items/bouillon-cubes.webp` — `ac114218a485947c99d392234849ee731a866366`
- `www/Items/couscous.webp` — `f4bfd2b2cf4f20a9d75cc615e2704714bb16dd46`
- `www/Items/gelatine.webp` — `fef7e297948c6c80ce42fc5c0c0f19ff987cc314`
- `www/Items/haricots-rouges.webp` — `c7dfd41703f2f5c4e3ef2ab9371bed287940999e`
- `www/Items/lentilles.webp` — `4de236fc6ba1efabf08b5d71a7eb565e0b68265b`
- `www/Items/levure-chimique.webp` — `8b60de1eec8243d671e7fa7be3e9ee436b950206`
- `www/Items/noix-de-coco-rapee.webp` — `d53e7dbd335229056a5f0f136256db352f2abbf2`
- `www/Items/nouilles-chinoises.webp` — `26121f23ece73bda79df3f947476900014e60714`
- `www/Items/nouilles-instantanees.webp` — `0147f435a93755cfa5b8645e64ecf5c9b28c023d`
- `www/Items/pepites-chocolat.webp` — `56dc37203b368cbd8f25a2997913a23abfc381b2`
- `www/Items/pois-chiches.webp` — `6c93eadcae9233e268194ed8e73e76a264808af9`
- `www/Items/polenta.webp` — `0ad4ea4679ed26cf49aa6733f1d08f320268ff52`
- `www/Items/quinoa.webp` — `1bc93a5ac3dc2db08123a0d47c7dafa650ead885`

La vérification finale du code revient à `bash scripts/validate_repo.sh` sur la CI GitHub ; aucun essai iPhone physique n'est revendiqué.
