# Crédits visuels produits — lot v604

**Base de préparation :** `main` `f344522c8904cee430d7123e971ac242e775fd33` (v603). **3 images WebP indépendantes** : création originale avec la fonctionnalité native de génération d’images ChatGPT, sans utiliser l’API OpenAI payante du projet et sans source externe ni logo/marque inventée. Les fichiers ont été extraits uniquement de rendus unitaires (jamais d’une planche) puis optimisés localement en 384 × 384 px. Les résultats composites de génération ont été rejetés.

| Catégorie | Produit | Avant (octets) | Après (octets) | SHA blob Git |
|---|---|---:|---:|---|
| Petit-déjeuner | Chicorée | 4328 | 30116 | `5a016b5bd5e296e0f625db3c3b310478a63666b3` |
| Maison | Liquide vaisselle | 2930 | 16514 | `52bc36e8be062cd9f6852ac6113f186cf1332044` |
| Maison | Lessive poudre | 3028 | 22458 | `f0c5df4e5b368b93cf90504c20be5db154fcf7a7` |
| **TOTAL** | **3 fichiers** | **10286** | **69088** | **+58802 octets** |

**Contrôle technique local :** WebP RGBA indépendant pour chacun, 384 × 384, alpha couvrant 0–255, coins totalement transparents, objet centré avec marges intactes, bords non coupés et poids inférieur à 100 000 octets. Comparaison de chaque candidat à 192 px sur fonds blanc et sauge avec l’ancien visuel consulté depuis `main`.

**Fidélité :** Chicorée en bocal fermé avec motif botanique de chicorée bleue (distinct du café soluble), Liquide vaisselle en flacon vert muni d’un bouchon applicateur, Lessive poudre en boîte rigide fermée avec motifs génériques. Pas de décor, de second produit, de tas de poudre ni de bouteille substituée à la boîte de poudre.

**Candidats REJETÉS ou conservés :** toutes les nouvelles planches composites ; variantes CC0 qui changent l’emballage ou la fonction (éponge jaune au lieu d’éponges magiques, bicarbonate en poudre renversée, antiseptique en pompe au lieu du flacon existant, thé servi dans un gobelet au lieu du bocal). Les images existantes plus fidèles restent inchangées. Aucun test matériel iPhone ou déconnexion HA réel n’est revendiqué.

**Statut au stade PR :** préparé et contrôlé graphiquement. La publication ne sera confirmée qu’après succès CI PR, fusion sur `main`, CI main et GitHub Pages ; le SHA réel publié sera ajouté au suivi lorsque ces validations seront terminées.


### Statut final GitHub confirmé — 27 octobre 2026

**PUBLIÉ** : [PR #104 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/104), commit `a85c4b562e26247c2d754db33cdcb5e4d38dfc84` sur `main`. [CI de la PR réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40575861943), [CI main réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40576042793) et [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40576042462). Vérification des trois empreintes WebP sur le véritable arbre Git : conforme au tableau ci-dessus. Les mentions « PRÉPARÉ » du suivi représentent l'état historique avant cette confirmation.
