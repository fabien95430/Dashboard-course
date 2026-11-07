# Dimensions v788 — audit révisé validé intégralement

Les 358 réductions de l’audit révisé (112 prioritaires et 246 modérées) sont appliquées par remplacement des profils absolus du module propriétaire. Aucun cumul avec les facteurs v786. Le manifeste JSON associé consigne les 522 décisions, y compris 163 conservations et Limonade dont le chargement reste à vérifier. Un profil hérité inchangé reste présent : 359 entrées de profils ne signifie pas 359 nouvelles corrections.

La mesure brute et le cache local sont inchangés ; les profils sont appliqués à l’affichage, séparément pour Catalogue et Ma liste. Aucune image remplacée, aucune purge des visuels, aucun changement Home Assistant, sécurité, coffre, biométrie ou architecture.

Les tests de migration conservent leurs contrôles de mesures invalidées ou conservées ; leurs attentes d’affichage suivent les nouveaux profils. Un contrôle des rapports de largeur/hauteur impose le pot enfant inférieur au paquet dans les deux vues, et les épices inférieures aux sauces puis aux paquets de riz.

Validation : syntaxe JavaScript et suite Node exécutées. Le script Bash a été tenté mais /dev/fd/63 est indisponible ; ses deux contrôles ont été exécutés séparément. Pas de nouveau contrôle interactif mobile : Chromium absent de l’environnement. Les comparaisons statiques du rapport approuvé servent de référence visuelle. La validation CI permanente doit confirmer la suite après publication.
