const CACHE='courses-app-v792-r1';
const VISUAL_CACHE='courses-visuals-v2';
const ERROR_INBOX_CACHE='courses-error-inbox-v1';
// Empreintes du contenu des visuels persistants (www/Items, www/Plats/cartes, www/Plats/fiches).
// Générées par scripts/update_visual_hashes.py et vérifiées par les tests : ne pas modifier à la main,
// et ne jamais ajouter de liste de visuels à invalider. Les marqueurs ETag/Last-Modified de GitHub Pages
// changent à chaque mise en ligne, même pour un fichier identique : seul le contenu fait foi.
const VISUAL_HASHES={"Items/abricots-secs.webp":"5fe3f8fe32","Items/abricots.webp":"d4c3c611a8","Items/adoucissant.webp":"1d2ee03b0c","Items/agneau.webp":"03f247a354","Items/ail.webp":"53b12f273c","Items/alcool-70.webp":"e5f39947c6","Items/amandes-en-poudre.webp":"43a18e151b","Items/amandes.webp":"a9b1f9aadd","Items/amidon.webp":"5123c2a5a3","Items/ananas.webp":"c67284f995","Items/antiseptique.webp":"51bbcb2358","Items/apres-shampoing.webp":"7a49081b83","Items/artichauts.webp":"f1dbf960df","Items/asperges.webp":"5e573db0ed","Items/aubergines.webp":"d536ae656f","Items/avocat.webp":"1baadc01ee","Items/bacon.webp":"20f461c0b7","Items/bagels.webp":"d2479880df","Items/baguette.webp":"83a838b84f","Items/bananes.webp":"a3ed88000c","Items/barres-cereales.webp":"1eda3b94b7","Items/basilic.webp":"26df477cb3","Items/baume-levres.webp":"baeb652759","Items/betteraves.webp":"41fe2fcb5c","Items/beurre-de-cacahuete.webp":"d4c1038bb6","Items/beurre.webp":"15e5e7d9e5","Items/bicarbonate.webp":"b18df684b7","Items/biere-ambree.webp":"0b0d20ef31","Items/biere-aux-fruits.webp":"66665fae9a","Items/biere-blanche.webp":"624c1153b4","Items/biere-blonde.webp":"708844726e","Items/biere-brune.webp":"185c73706b","Items/biere-ipa.webp":"ff54938473","Items/biere-sans-alcool.webp":"5c11be3c97","Items/biere-triple.webp":"188b2f33f9","Items/biscottes.webp":"898cfc89a5","Items/biscuits-aperitifs.webp":"b56cf5535e","Items/biscuits-bebe.webp":"5b5b68fd81","Items/biscuits-beurre.webp":"aa3f5f63a3","Items/biscuits-chocolat.webp":"8a28bfcd7d","Items/blanc-de-poulet.webp":"47c23bf64e","Items/boeuf.webp":"f2e2c7ef06","Items/boisson-energetique.webp":"c45120a163","Items/bolognaise.webp":"c0bb7a4a24","Items/bonbons.webp":"5268dc74f0","Items/boudoirs-bebe.webp":"098c10466f","Items/bouillon-cubes.webp":"634ac4d4bb","Items/boulgour.webp":"518899e045","Items/bretzels.webp":"5a124d669d","Items/brie.webp":"057a1894a8","Items/brioche.webp":"f12292b777","Items/brocoli.webp":"5c230265bb","Items/brosses-a-dents.webp":"409c8ad07d","Items/brossettes-interdentaires.webp":"17a53971c6","Items/brownies.webp":"34df652d91","Items/burrata.webp":"8cdef702cf","Items/butternut.webp":"5274cdfe43","Items/cabillaud.webp":"8dcc2dab94","Items/cacahuetes.webp":"3d5c5d1028","Items/cafe-en-grains.webp":"d6c3de36fd","Items/cafe-moulu.webp":"8b949e7a6b","Items/cafe-soluble.webp":"572f17367c","Items/camembert.webp":"70553f9734","Items/capsules-cafe.webp":"7b44f532ad","Items/carottes.webp":"33bdb749b2","Items/celeri.webp":"e01122c59d","Items/cereales-infantiles.webp":"d9f560e489","Items/cereales-lion.webp":"7c6e774a1c","Items/cereales.webp":"0b96745bdd","Items/cerises.webp":"c7dab117f5","Items/champagne.webp":"6f7e698b30","Items/champignons-en-boite.webp":"2f273d26cf","Items/champignons.webp":"6c999755bb","Items/chapelure.webp":"864c1d42c9","Items/cheddar.webp":"5352a127c8","Items/chevre.webp":"cd140890ce","Items/chicoree.webp":"d0352cda57","Items/chili.webp":"a7eb0580c3","Items/chips.webp":"297f170b7a","Items/chocolat-au-lait.webp":"7344b91760","Items/chocolat-blanc.webp":"ecd69be62d","Items/chocolat-en-poudre.webp":"94b8e59fed","Items/chocolat-noir.webp":"2a9742de1f","Items/chorizo.webp":"c7fa333520","Items/chou-blanc.webp":"8171a910c2","Items/chou-fleur.webp":"d534423c43","Items/chou-rouge.webp":"361839fc25","Items/choux-de-bruxelles.webp":"59bae4c3c6","Items/ciboulette.webp":"8e7a8402a8","Items/citron-vert.webp":"7d69683ea0","Items/citronnade.webp":"412aae57e0","Items/citrons.webp":"f7c6fe83e5","Items/clementines.webp":"3e152e0aa8","Items/coca-zero.webp":"903b9bd6e9","Items/coca.webp":"5669898904","Items/compotes-bebe.webp":"34be5d68f0","Items/compotes-gourdes.webp":"4ba14fa48f","Items/comte.webp":"7b84531ad3","Items/concentre-de-tomate.webp":"de57722076","Items/conchiglie.webp":"c5a28e2484","Items/concombres.webp":"45339292af","Items/confiture-abricot.webp":"db7447062e","Items/confiture-cerise.webp":"ad897ec3c5","Items/confiture-figue.webp":"65ae872b5b","Items/confiture-fraise.webp":"0310e21f52","Items/confiture-framboise.webp":"fe3bb09251","Items/confiture-fruits-rouges.webp":"f818f634ab","Items/confiture-mirabelles.webp":"19afcc8bc1","Items/confiture-mure.webp":"550ac6ab80","Items/confiture-myrtille.webp":"1ee92ad045","Items/confiture-orange.webp":"6d1ee8bee8","Items/confiture-peche.webp":"a3f7b716c5","Items/cookies.webp":"6ce20124fc","Items/coppa.webp":"e9135c0ac1","Items/coquillettes.webp":"ce9b42790e","Items/coriandre.webp":"d864896ca4","Items/cornichon.webp":"4431f4f969","Items/cotes-de-porc.webp":"a57a60a931","Items/coton.webp":"ab16daf223","Items/cotons-tiges.webp":"18560f52bc","Items/couches.webp":"45880a943c","Items/coulis-de-fruit.webp":"c4103ad691","Items/coulis-de-tomate.webp":"3cd4646439","Items/courge.webp":"6bf385610b","Items/courgettes.webp":"1c769e0a07","Items/couscous.webp":"2dfc4be836","Items/crackers.webp":"8d58626c99","Items/creme-anglaise.webp":"67294b73c3","Items/creme-de-coco.webp":"74efa7a461","Items/creme-de-marrons.webp":"40e9d286c3","Items/creme-dessert-caramel.webp":"06cd78fad0","Items/creme-dessert-chocolat.webp":"ba78d1543e","Items/creme-dessert-vanille.webp":"fc7f9b5fd9","Items/creme-epaisse.webp":"089afa0d56","Items/creme-fraiche.webp":"523553c28e","Items/creme-hydratante.webp":"e0e659eea7","Items/creme-liquide.webp":"77266459bd","Items/creme-mains.webp":"0e746628e1","Items/crepes.webp":"1f0b6367e6","Items/crevettes.webp":"3aed02e05c","Items/croissants.webp":"b111ae4349","Items/croutons.webp":"387a6d7cd1","Items/curcuma.webp":"d41b2dfb7c","Items/curry.webp":"ff2c12cdb6","Items/dattes.webp":"e99b5f5db1","Items/demaquillant.webp":"7d339998fe","Items/dentifrice.webp":"0d4bf3155b","Items/deodorant.webp":"ad7cad2d49","Items/desinfectant.webp":"f2d5e01afb","Items/desodorisant-textile.webp":"b65168edfd","Items/desserts-lactes-bebe.webp":"729f2d7d80","Items/detachant.webp":"0abc8de806","Items/detartrant.webp":"aede29f471","Items/dinde.webp":"7418d48d83","Items/disques-coton.webp":"10380b5488","Items/dosettes-cafe.webp":"ed980df496","Items/eau-aromatisee.webp":"5eef836080","Items/eau-gazeuse.webp":"e74590ea4c","Items/eau-micellaire.webp":"c7c3f47c92","Items/eau-plate.webp":"b30c13c9fa","Items/echalotes.webp":"0af8079cf0","Items/emmental-rape.webp":"dee1e9e73c","Items/emmental.webp":"96c2f4082f","Items/endives.webp":"2c11758cf8","Items/epinards-haches-surgeles.webp":"cc429601de","Items/epinards-surgeles.webp":"9eb4913217","Items/epinards.webp":"5115c089f0","Items/eponges-magiques.webp":"6a98a10cf5","Items/eponges.webp":"8543cc88cc","Items/escalopes-de-poulet.webp":"9c5c02249a","Items/essuie-tout.webp":"e2c7ca32ac","Items/essuie-verres.webp":"57424c3058","Items/farfalle.webp":"7fa6f5d5e0","Items/farine.webp":"89a0f24ddb","Items/fenouil.webp":"07807567ef","Items/feta.webp":"a9005975b0","Items/figues-seches.webp":"f410e7feb0","Items/fil-dentaire.webp":"a33aa48c72","Items/filet-de-lavage.webp":"9e8ca47888","Items/filets-de-poulet.webp":"0d0769c14a","Items/film-alimentaire.webp":"98427913a0","Items/filtres-a-cafe.webp":"0832a7586c","Items/flageolets.webp":"374572e267","Items/flocons-d-avoine.webp":"2ccb414449","Items/fraises.webp":"f3049b71f6","Items/framboises.webp":"351ed69f70","Items/frites-surgelees.webp":"953cfd8298","Items/fromage-blanc.webp":"a8e7ca5423","Items/fromage-rape.webp":"661077c8e4","Items/fruit-de-la-passion.webp":"7830ec0f10","Items/fusilli.webp":"0179bd8cf2","Items/galettes-de-ble.webp":"b2c2559f1f","Items/galettes-de-riz-bebe.webp":"82ce82b5ad","Items/gants-menage.webp":"18b8523caa","Items/gateaux-bebe.webp":"2662512115","Items/gaufres.webp":"6c2e9ed878","Items/gel-douche.webp":"73b297e60d","Items/gel-hydroalcoolique.webp":"a15d801013","Items/gelatine.webp":"a62f349a11","Items/gin.webp":"7bed2749df","Items/gingembre.webp":"60d71165ad","Items/ginger-beer.webp":"21f396fb72","Items/glace-chocolat.webp":"83d15049e7","Items/glace-nuii.webp":"46bb8c3822","Items/glace-vanille.webp":"1a176a4f65","Items/glacons.webp":"2265c34b34","Items/gnocchis.webp":"7ae5530fbc","Items/gouda.webp":"bfe124a8fa","Items/granola.webp":"0d6695939d","Items/grattoirs.webp":"8e2ddc1c66","Items/grenade.webp":"5389f1b088","Items/gressins.webp":"7dd51b62f7","Items/guacamole.webp":"2806d299ee","Items/haricots-blancs.webp":"9825be353f","Items/haricots-rouges.webp":"bcd4fc0516","Items/haricots-verts-en-boite.webp":"9e077a49bf","Items/haricots-verts-surgeles.webp":"d490a8ee04","Items/haricots-verts.webp":"d57c97680c","Items/harissa.webp":"663764d50e","Items/houmous.webp":"335725521f","Items/huile-d-olive.webp":"6233f0238c","Items/huile-de-sesame.webp":"6e0faedb1f","Items/huile-de-tournesol.webp":"9a392a387d","Items/infusion-camomille.webp":"59c7f7a664","Items/infusion-menthe.webp":"0ce90868e1","Items/infusion-verveine.webp":"4817c2cad3","Items/jambon-blanc.webp":"04e6aacd6b","Items/jambon-cru.webp":"acd15f9d0c","Items/javel.webp":"6c2accdab9","Items/jus-d-ananas.webp":"1a2d063da1","Items/jus-d-orange.webp":"d92affa4eb","Items/jus-de-poire.webp":"80d2ea316e","Items/jus-de-pomme.webp":"7f9625d22d","Items/jus-de-raisin.webp":"8da7eb59ad","Items/jus-de-tomate.webp":"1b9b0f47fa","Items/jus-multifruits.webp":"057bafaecf","Items/ketchup.webp":"2dfeeb2de6","Items/kinder-maxi.webp":"959cb8d831","Items/kiwis.webp":"422f1abfa8","Items/lait-chocolate.webp":"b9e4cf230f","Items/lait-d-amande.webp":"54219ca6e1","Items/lait-d-avoine.webp":"9fbce70300","Items/lait-de-coco.webp":"c86e212c77","Items/lait-de-soja.webp":"822e028b71","Items/lait-demi-ecreme.webp":"ecfc80e49c","Items/lait-ecreme.webp":"11134b135d","Items/lait-entier.webp":"c2eaeebe29","Items/lait-infantile.webp":"c0e2f02718","Items/lait-sans-lactose.webp":"47df01d830","Items/lait.webp":"b7ec5f8335","Items/lardons.webp":"27a7e700c6","Items/lasagnes.webp":"19355be135","Items/lave-glace.webp":"7b6df115ca","Items/legumes-surgeles.webp":"928b642d00","Items/lentilles.webp":"b7b1dff45b","Items/lessive-capsules.webp":"f1df0f2c37","Items/lessive-liquide.webp":"adecb88a84","Items/lessive-poudre.webp":"0b0497c368","Items/levure-boulangere.webp":"bf8cd8a20a","Items/levure-chimique.webp":"ca83dd013a","Items/limonade.webp":"50e422c476","Items/lingettes-anti-decoloration.webp":"cd1a5ee67c","Items/lingettes-bebe.webp":"db761bfcc9","Items/lingettes-menage.webp":"bbea3ac6a2","Items/linguine.webp":"3ed6e30541","Items/liquide-rincage.webp":"f91af0dee4","Items/liquide-vaisselle-mains-sensibles.webp":"e0827f855f","Items/liquide-vaisselle.webp":"2ab3f09fc1","Items/macaronis.webp":"cb6ec8eb1b","Items/mache.webp":"56893c460a","Items/madeleines.webp":"856ead9da2","Items/mais-en-boite.webp":"159f9aac15","Items/mais.webp":"f0fc1c410e","Items/maizena.webp":"6704cf301a","Items/mangue.webp":"505c68fb19","Items/maquereaux.webp":"190fc46587","Items/mascarpone.webp":"50040c887d","Items/matcha.webp":"3b14b5b970","Items/mayonnaise.webp":"bd34b23213","Items/melon.webp":"19671648ae","Items/menthe.webp":"5f91e01cfe","Items/merguez.webp":"b03bda3dd8","Items/miel.webp":"dab35c6745","Items/mortadelle.webp":"27b0e98030","Items/mouchoirs-poche.webp":"2851a76ec9","Items/mouchoirs.webp":"1656feb05f","Items/moules.webp":"f430a4c390","Items/mousse-a-raser.webp":"dac5032b07","Items/moutarde.webp":"0fb8b75f4a","Items/mozzarella-en-billes.webp":"bb21d06a98","Items/mozzarella-rapee.webp":"b7d16760fe","Items/mozzarella.webp":"617a7e47e0","Items/muesli.webp":"48d6ab7433","Items/muffins.webp":"2c63a86ed3","Items/mures.webp":"80c91fd9f1","Items/myrtilles.webp":"daac819053","Items/navets.webp":"6badcbeb7d","Items/nectarines.webp":"5eb0fe0e01","Items/nettoyant-lave-vaisselle.webp":"5f54a917f9","Items/nettoyant-machine-a-laver.webp":"50ad1af8ad","Items/nettoyant-multi-usages.webp":"ec35e44928","Items/nettoyant-salle-de-bain.webp":"e9fc17baf0","Items/nettoyant-sol.webp":"e8a7958318","Items/nettoyant-vitres.webp":"0301adf5c5","Items/nettoyant-wc.webp":"70e5d62267","Items/noisettes.webp":"757b96121a","Items/noix-de-cajou.webp":"5f64413065","Items/noix-de-coco-rapee.webp":"4d9ca5cf0a","Items/noix-de-coco.webp":"c5feca8fc9","Items/noix-de-pecan.webp":"735d71c21e","Items/noix-du-bresil.webp":"e25d276f87","Items/noix.webp":"e09a4619ff","Items/nouilles-chinoises.webp":"eb1ddf6777","Items/nouilles-instantanees.webp":"1c88329c13","Items/oeufs.webp":"36b5208723","Items/oignons-jaunes.webp":"d3e8c87ac5","Items/oignons-rouges.webp":"26d80e34f8","Items/olives-fraiches.webp":"9898d6add7","Items/olives.webp":"9b5404abd0","Items/orangeade.webp":"155ae48031","Items/oranges.webp":"ea6a1e9e52","Items/orecchiette.webp":"1faf44fa1b","Items/pain-aux-cereales.webp":"23aa0c79b8","Items/pain-complet.webp":"765c74d0a9","Items/pain-de-mie-complet.webp":"b2e89a4693","Items/pain-de-mie.webp":"d8da06ef31","Items/pain-naan.webp":"2ac5730b51","Items/pain-pita.webp":"db13a748d8","Items/pain.webp":"d5de6271b8","Items/pains-au-chocolat.webp":"55e0632f9e","Items/pains-burger.webp":"115862414f","Items/pains-hot-dog.webp":"6bd63a4231","Items/pamplemousse.webp":"bda2fd5e61","Items/panache.webp":"5a63916df5","Items/pancakes.webp":"25d4f6c080","Items/pansements.webp":"ac5d5f4436","Items/papier-aluminium.webp":"d232e72b52","Items/papier-cadeau.webp":"a37a6a9434","Items/papier-cuisson.webp":"0ec6a5156d","Items/papier-toilette-humide.webp":"fc7aeda36d","Items/papier-toilette.webp":"c8f0ddc443","Items/paprika.webp":"83e946fd53","Items/parmesan-rape.webp":"813acda686","Items/parmesan.webp":"f55469d453","Items/pasteque.webp":"e80c5f3482","Items/patates-douces.webp":"1e6c95cc7e","Items/pate-a-pizza.webp":"7fbb299c56","Items/pate-a-tartiner.webp":"c8a12b8897","Items/pate-brisee.webp":"83fe85f087","Items/pate-feuilletee.webp":"4e21db724e","Items/pate-sablee.webp":"ef79cfbef2","Items/pate.webp":"e2b3a6e21d","Items/pates-fraiches.webp":"48351f372d","Items/peches.webp":"03dbe21fc9","Items/penne.webp":"47629fe7bd","Items/peperroni.webp":"4f3e27c78a","Items/pepites-chocolat.webp":"d8e0d74b08","Items/persil.webp":"526bdd6d72","Items/pesto.webp":"d3de782ac2","Items/petites-pates-bebe.webp":"c1eaf89645","Items/petits-pois-carottes.webp":"44278281fc","Items/petits-pois-surgeles.webp":"c7d34ed5ae","Items/petits-pois.webp":"92da4d1dcc","Items/petits-pots.webp":"257214bb56","Items/petits-suisses.webp":"c30093157c","Items/pile-9v.webp":"dd914e32a3","Items/pile-aaa.webp":"489b0aa3c0","Items/piles-aa.webp":"e7d3cb9278","Items/piles-cr123a.webp":"1cc86a33c5","Items/piles-cr2025.webp":"225b16d4d3","Items/piles-cr2032.webp":"c6bd014a2f","Items/piles-cr2450.webp":"a71929562a","Items/piles-lr44.webp":"4b225ec86d","Items/piments.webp":"5ba01ed08d","Items/pinces-a-linge.webp":"0604918f16","Items/pistaches.webp":"d38a4deddd","Items/poelee-de-legumes.webp":"dfc6ff356e","Items/poireaux.webp":"413ca62483","Items/poires.webp":"7316f9274a","Items/pois-chiches.webp":"8a3f9660ba","Items/poisson-pane.webp":"bd8068a95d","Items/poisson-surgele.webp":"af37c96013","Items/poivre.webp":"bdad835c7f","Items/poivrons.webp":"de767c5c4b","Items/polenta.webp":"31e73957ed","Items/pommes-de-terre.webp":"061f15f22d","Items/pommes.webp":"61be277f19","Items/pop-corn.webp":"5b0427f2a8","Items/porc.webp":"2af3227cd8","Items/potiron.webp":"b81b9c703d","Items/poulet.webp":"0b56932e94","Items/produit-inox.webp":"f89fb84a8d","Items/prosecco.webp":"d05d96ebf7","Items/protections-hygieniques.webp":"8c834bb28e","Items/pruneaux.webp":"73a385d85c","Items/prunes.webp":"cd158298c4","Items/puree-bebe.webp":"e5b0c4c115","Items/puree-en-flocons.webp":"6fbcca6577","Items/quiche.webp":"d25083457e","Items/quinoa.webp":"dd0d2d7982","Items/raclette.webp":"83c6d4ec7a","Items/radis.webp":"ca1348c71c","Items/raisin.webp":"07500a8e89","Items/raisins-secs.webp":"a3969456c8","Items/rasoirs.webp":"d6d1a4700f","Items/raviolis-en-boite.webp":"9a0092e6e2","Items/reblochon.webp":"3cf0a5d0cb","Items/rhum.webp":"37c7351d63","Items/ricard.webp":"4581bbd66f","Items/ricotta.webp":"81c6e0d21d","Items/rigatoni.webp":"10b0e24d96","Items/rillettes.webp":"0eb7452b16","Items/riz-a-sushi.webp":"bab5cac0fa","Items/riz-arborio.webp":"2c006fa040","Items/riz-au-lait.webp":"db682e1f47","Items/riz-basmati.webp":"9d3a66c9b3","Items/riz-blanc.webp":"b84137184d","Items/riz-complet.webp":"c6cdc59c03","Items/riz-gluant.webp":"03f0f1b8ad","Items/riz-jasmin.webp":"cf88f3659f","Items/riz-long.webp":"2df9ece16c","Items/riz-noir.webp":"d1d2e0a2d5","Items/riz-rouge.webp":"7c0530c625","Items/riz-sauvage.webp":"baf0e45471","Items/romarin-frais.webp":"087d4058a3","Items/roquefort.webp":"6cc78be032","Items/roquette.webp":"77ef2f626f","Items/rosette.webp":"64ad2244e5","Items/sacs-a-couches.webp":"6785e5f574","Items/sacs-congelation.webp":"4b1383df86","Items/sacs-linge-delicat.webp":"f19019dd0e","Items/sacs-poubelle-30l.webp":"deeea4ea49","Items/sacs-poubelle-50l.webp":"f8e427c44f","Items/sacs-zip.webp":"a9c1db228c","Items/salade-verte.webp":"af2aea6bf8","Items/sardines.webp":"e240506270","Items/sauce-aigre-douce.webp":"8a7bfa7506","Items/sauce-algerienne.webp":"9fd6319626","Items/sauce-andalouse.webp":"4c4f2d51fe","Items/sauce-au-poivre.webp":"fb96f02dba","Items/sauce-au-roquefort.webp":"18e4331322","Items/sauce-aux-champignons.webp":"1c8144460e","Items/sauce-barbecue.webp":"b149007ac5","Items/sauce-bearnaise.webp":"a049a19b2f","Items/sauce-blanche.webp":"3de7f17418","Items/sauce-burger.webp":"aff8fed321","Items/sauce-cesar.webp":"763c269e46","Items/sauce-curry.webp":"90113fb4ed","Items/sauce-hollandaise.webp":"4e263fd680","Items/sauce-miel-moutarde.webp":"39492e68f5","Items/sauce-napolitaine.webp":"fba6bd20d8","Items/sauce-ranch.webp":"57122c338f","Items/sauce-samourai.webp":"0203d2adf5","Items/sauce-soja.webp":"91661f2118","Items/sauce-tartare.webp":"aa21665e33","Items/sauce-teriyaki.webp":"7718df9fea","Items/sauce-tomate.webp":"a27fa912a9","Items/saucisses.webp":"e52d831af0","Items/saucisson.webp":"84d5bda03e","Items/saumon-fume.webp":"76a0e557ea","Items/saumon.webp":"211b2e1c1a","Items/savon-mains.webp":"44e333125b","Items/sel-lave-vaisselle.webp":"aeb3bcf98f","Items/sel.webp":"f3cafbf536","Items/semoule.webp":"a75a08079b","Items/serviettes-papier.webp":"181cbc712b","Items/shampoing.webp":"7bb1c9dd35","Items/sirop-d-erable.webp":"1789b48b73","Items/sirop-de-grenadine.webp":"57a0984e8a","Items/sirop-de-menthe.webp":"e8f75caf06","Items/sirop-de-peche.webp":"1a7343da93","Items/sirot-d-erable.webp":"37deb7fa1c","Items/skyr.webp":"a5df609e80","Items/soda-citron.webp":"f5dc0abafa","Items/soignon.webp":"13279b11e7","Items/soupes-en-brique.webp":"7128c5d746","Items/spaghetti.webp":"c26c4fc1f1","Items/speculoos.webp":"fe79017b4d","Items/speculos.webp":"e78d43077c","Items/steaks-haches.webp":"a8f3fd68b8","Items/sucre-glace.webp":"9f0b072644","Items/sucre-roux.webp":"e8a1a02216","Items/sucre.webp":"e762c67736","Items/surimi.webp":"a348163b1a","Items/tabasco.webp":"f51bd23ed2","Items/tablettes-lave-vaisselle.webp":"2261a824b6","Items/tagliatelles.webp":"b452ce1154","Items/tapenade.webp":"d97e832cd1","Items/the-earl-grey.webp":"a378dbd61c","Items/the-fruits-rouges.webp":"896f8f780f","Items/the-noir.webp":"474abc1846","Items/the-vert.webp":"6ec8742cff","Items/thermometre-piles.webp":"8fbdc0fb76","Items/thon-en-boite.webp":"3de37b3a98","Items/thon-frais.webp":"bd3ca4c1a6","Items/thym-frais.webp":"ca7758d4c0","Items/tofu.webp":"55a575f0f1","Items/tomates-pelees.webp":"74c3f143f3","Items/tomates.webp":"6b02eee789","Items/tonic.webp":"06e08fd894","Items/torchons.webp":"3a1a37ddda","Items/tortillas.webp":"93859d56fc","Items/truite.webp":"6707fdd96d","Items/vanille.webp":"5b5b77984a","Items/veau.webp":"aa674f42b5","Items/vermicelles.webp":"a8ec843c8c","Items/viande-hachee.webp":"2f2b7ee97f","Items/vin-blanc.webp":"b83ea96cd2","Items/vin-rose.webp":"0648d1bc25","Items/vin-rouge.webp":"c35192db07","Items/vinaigre-balsamique.webp":"b1b309d7c1","Items/vinaigre-de-cidre.webp":"0fa61fc01a","Items/vinaigre-de-vin.webp":"aa2c56e555","Items/vinaigre-menager.webp":"6830aff6f0","Items/whisky.webp":"eec361006f","Items/wraps.webp":"b2c2559f1f","Items/yaourt-a-boire.webp":"b52658e2b3","Items/yaourt.webp":"f3c38746f0","Items/yaourts-citron.webp":"90a13f954c","Items/yaourts-fruits.webp":"16d86bdc85","Items/yaourts-grecs.webp":"09c9d2c51d","Items/yaourts-nature.webp":"49915b3cbf","Items/yaourts-noix-de-coco.webp":"8ce8efbe54","Items/yaourts-vanille.webp":"23da6184dc","Plats/cartes/boeuf-riz-poivrons.webp":"9fa3ef58f8","Plats/cartes/boeuf-sauce-tomate-pommes-de-terre.webp":"729e3eb8f2","Plats/cartes/boulettes-sauce-tomate.webp":"8cd041cb5b","Plats/cartes/bruschetta-tomate-mozzarella.webp":"8003372cb0","Plats/cartes/buddha-bowl-quinoa.webp":"99f0fe799c","Plats/cartes/burger-maison.webp":"0ba188fed0","Plats/cartes/cabillaud-pommes-de-terre.webp":"6cdeb064dc","Plats/cartes/cabillaud-riz-legumes.webp":"336760fbb4","Plats/cartes/chili-con-carne.webp":"e9ee5fa6b0","Plats/cartes/chili-sin-carne.webp":"9bf388181a","Plats/cartes/couscous-merguez.webp":"5f82a1d3ae","Plats/cartes/crevettes-curry-coco.webp":"a6a93cb0fb","Plats/cartes/crevettes-nouilles-asiatiques.webp":"1728276e20","Plats/cartes/croque-monsieur.webp":"df14065f63","Plats/cartes/croque-poulet-fromage.webp":"ce4c63aeeb","Plats/cartes/curry-pois-chiches.webp":"31284a7c4d","Plats/cartes/enfant-boulettes-riz.webp":"fd0f5932a3","Plats/cartes/enfant-coquillettes-jambon.webp":"f32f3fdecf","Plats/cartes/enfant-couscous-poulet-legumes.webp":"476b906299","Plats/cartes/enfant-creme-brulee.webp":"4fb8f05265","Plats/cartes/enfant-gratin-pommes-de-terre.webp":"0b8c4305a6","Plats/cartes/enfant-pates-jambon.webp":"ff3c126dfa","Plats/cartes/enfant-puree-carotte-poulet.webp":"15ebbda7d1","Plats/cartes/enfant-risotto-poulet.webp":"2b51aeb60e","Plats/cartes/enfant-riz-au-lait.webp":"267d0aaabe","Plats/cartes/enfant-saumon-brocoli.webp":"c1492d03e8","Plats/cartes/enfant-steak-frites.webp":"d611050ced","Plats/cartes/enfant-veloute-carottes.webp":"2f9b4d5be3","Plats/cartes/fajitas-poulet.webp":"291d3f0e83","Plats/cartes/gratin-brocoli-poulet.webp":"65bd191ca0","Plats/cartes/gratin-courgettes.webp":"6c66dd73d2","Plats/cartes/gratin-pommes-de-terre-jambon.webp":"bd5d30bdb5","Plats/cartes/hachis-parmentier.webp":"b0f0bc983f","Plats/cartes/hot-dog.webp":"e1e4bcb6bc","Plats/cartes/lasagnes-bolognaise.webp":"2bd9e6ab9f","Plats/cartes/moules-frites.webp":"dabd0e3388","Plats/cartes/omelette-jambon-fromage.webp":"5803419072","Plats/cartes/pannacotta.webp":"327bb26a07","Plats/cartes/pates-pesto-mozzarella.webp":"99f5064f66","Plats/cartes/pates-pesto-poulet.webp":"bf5497a668","Plats/cartes/pates-tomate-mozzarella.webp":"ced8cf8b08","Plats/cartes/penne-chorizo-poivrons.webp":"7b758fa1e5","Plats/cartes/penne-poulet-creme.webp":"39aecce706","Plats/cartes/pizza-wrap.webp":"0f500c58fb","Plats/cartes/poelee-pommes-de-terre-saucisses.webp":"57da22d4d7","Plats/cartes/poelee-poulet-courgettes.webp":"0e6c72ca77","Plats/cartes/poulet-brocoli-riz.webp":"faa6b5e263","Plats/cartes/poulet-creme-champignons.webp":"27c0bd41dd","Plats/cartes/poulet-curry.webp":"c66fec36f5","Plats/cartes/poulet-miel-moutarde.webp":"072eb2794b","Plats/cartes/poulet-paprika-creme.webp":"770dd7efcf","Plats/cartes/poulet-parmesan-tomate.webp":"f8436332ca","Plats/cartes/poulet-pommes-de-terre-four.webp":"baf79338c5","Plats/cartes/poulet-riz-legumes.webp":"5553e47ab5","Plats/cartes/poulet-teriyaki-riz.webp":"1cf574ec04","Plats/cartes/poulet-tomate-mozzarella.webp":"dbcc2b3c88","Plats/cartes/quiche-lorraine.webp":"22a2fa7e08","Plats/cartes/quiche-poireaux-chevre.webp":"108f059e72","Plats/cartes/raclette.webp":"9378f0abc4","Plats/cartes/ratatouille.webp":"2d3ff73077","Plats/cartes/riz-champignons-parmesan.webp":"652b9bea8f","Plats/cartes/riz-crevettes-legumes.webp":"122b98bd4f","Plats/cartes/riz-poulet-curry-coco.webp":"61cf9d2a10","Plats/cartes/riz-saute-poulet-legumes.webp":"39085de95e","Plats/cartes/rougail-saucisse.webp":"a82f74fd64","Plats/cartes/salade-cesar-saumon.webp":"95a12be01c","Plats/cartes/salade-cesar.webp":"562ea800e2","Plats/cartes/salade-chevre-noix.webp":"b88eb82094","Plats/cartes/salade-mozzarella-avocat.webp":"a29c52af60","Plats/cartes/salade-poulet-avocat.webp":"16cd00d8bf","Plats/cartes/salade-saumon-avocat.webp":"a1c8d00eba","Plats/cartes/salade-thon-riz-mais.webp":"b969541eef","Plats/cartes/sandwich-poulet.webp":"e6e1b9865c","Plats/cartes/saucisse-lentille.webp":"b419107223","Plats/cartes/saucisses-pommes-de-terre.webp":"429be53d31","Plats/cartes/saumon-creme-epinards.webp":"5d823c154f","Plats/cartes/saumon-pommes-de-terre.webp":"c197e4649a","Plats/cartes/saumon-riz-brocoli.webp":"3dfbf033f5","Plats/cartes/spaghetti-bolognaise.webp":"e6768758b3","Plats/cartes/spaghetti-carbonara.webp":"4040a66863","Plats/cartes/steak-pommes-de-terre.webp":"ec24f5cd1e","Plats/cartes/steak-tartare.webp":"dd165289c6","Plats/cartes/sushis.webp":"e61ab73bde","Plats/cartes/tacos-boeuf.webp":"d467cda610","Plats/cartes/tagliatelles-saumon.webp":"15942293e6","Plats/cartes/tarte-tomate-mozzarella.webp":"7ab020c0cc","Plats/cartes/tartiflette.webp":"a9bbe2848c","Plats/cartes/wrap-poulet-crudites.webp":"5d24915621","Plats/fiches/boeuf-riz-poivrons.webp":"49dfc5491c","Plats/fiches/boeuf-sauce-tomate-pommes-de-terre.webp":"6075a469e3","Plats/fiches/boulettes-sauce-tomate.webp":"5edfb642fd","Plats/fiches/bruschetta-tomate-mozzarella.webp":"f5e1cf9e2d","Plats/fiches/buddha-bowl-quinoa.webp":"96cfd94fbf","Plats/fiches/burger-maison.webp":"ede9eef10d","Plats/fiches/cabillaud-pommes-de-terre.webp":"f45db0682f","Plats/fiches/cabillaud-riz-legumes.webp":"3ce75f7d86","Plats/fiches/chili-con-carne.webp":"a8e721cd9f","Plats/fiches/chili-sin-carne.webp":"9ed5bf1df3","Plats/fiches/couscous-merguez.webp":"35160f68d9","Plats/fiches/crevettes-curry-coco.webp":"be295b6bd5","Plats/fiches/crevettes-nouilles-asiatiques.webp":"94ba1fd020","Plats/fiches/croque-monsieur.webp":"93d61cb6e4","Plats/fiches/croque-poulet-fromage.webp":"3fa61405fb","Plats/fiches/curry-pois-chiches.webp":"3a38538124","Plats/fiches/enfant-boulettes-riz.webp":"a0241fe52e","Plats/fiches/enfant-coquillettes-jambon.webp":"31ba5b692e","Plats/fiches/enfant-couscous-poulet-legumes.webp":"19478da509","Plats/fiches/enfant-creme-brulee.webp":"a02de5e1da","Plats/fiches/enfant-gratin-pommes-de-terre.webp":"b5efbf4818","Plats/fiches/enfant-pates-jambon.webp":"bd0422e52a","Plats/fiches/enfant-puree-carotte-poulet.webp":"b35539b1ea","Plats/fiches/enfant-risotto-poulet.webp":"a3191d924a","Plats/fiches/enfant-riz-au-lait.webp":"57048066a1","Plats/fiches/enfant-saumon-brocoli.webp":"05bd1ab547","Plats/fiches/enfant-steak-frites.webp":"78c52f6466","Plats/fiches/enfant-veloute-carottes.webp":"ff23e02361","Plats/fiches/fajitas-poulet.webp":"af47abec36","Plats/fiches/gratin-brocoli-poulet.webp":"761f97ec98","Plats/fiches/gratin-courgettes.webp":"e9a5615378","Plats/fiches/gratin-pommes-de-terre-jambon.webp":"04b03545c6","Plats/fiches/hachis-parmentier.webp":"c3391fc3ca","Plats/fiches/hot-dog.webp":"00bc4594c9","Plats/fiches/lasagnes-bolognaise.webp":"1b280d44ff","Plats/fiches/moules-frites.webp":"bd7ca37e82","Plats/fiches/omelette-jambon-fromage.webp":"6ba3b099af","Plats/fiches/pannacotta.webp":"d9ec787574","Plats/fiches/pates-pesto-mozzarella.webp":"36a27f7dcb","Plats/fiches/pates-pesto-poulet.webp":"d7fe18ca1a","Plats/fiches/pates-tomate-mozzarella.webp":"05258b6b85","Plats/fiches/penne-chorizo-poivrons.webp":"38acd57987","Plats/fiches/penne-poulet-creme.webp":"52fe76a939","Plats/fiches/pizza-wrap.webp":"667b3f80d5","Plats/fiches/poelee-pommes-de-terre-saucisses.webp":"48bf966cd5","Plats/fiches/poelee-poulet-courgettes.webp":"4ebfa934d2","Plats/fiches/poulet-brocoli-riz.webp":"1cae54bbc5","Plats/fiches/poulet-creme-champignons.webp":"812f64a49c","Plats/fiches/poulet-curry.webp":"2c911f1761","Plats/fiches/poulet-miel-moutarde.webp":"0268645664","Plats/fiches/poulet-paprika-creme.webp":"c40d53204b","Plats/fiches/poulet-parmesan-tomate.webp":"8eb547345a","Plats/fiches/poulet-pommes-de-terre-four.webp":"6154d01ae1","Plats/fiches/poulet-riz-legumes.webp":"4e9e1e6000","Plats/fiches/poulet-teriyaki-riz.webp":"96f8b1204e","Plats/fiches/poulet-tomate-mozzarella.webp":"30fc89102c","Plats/fiches/quiche-lorraine.webp":"63569058fc","Plats/fiches/quiche-poireaux-chevre.webp":"b0415f0ef9","Plats/fiches/raclette.webp":"ddc75aa176","Plats/fiches/ratatouille.webp":"9ecb3b88f5","Plats/fiches/riz-champignons-parmesan.webp":"112922dff5","Plats/fiches/riz-crevettes-legumes.webp":"313fd12810","Plats/fiches/riz-poulet-curry-coco.webp":"33a4493ebb","Plats/fiches/riz-saute-poulet-legumes.webp":"c608cf140f","Plats/fiches/rougail-saucisse.webp":"ef882f6dc3","Plats/fiches/salade-cesar-saumon.webp":"4d90817d3f","Plats/fiches/salade-cesar.webp":"975ec4f09c","Plats/fiches/salade-chevre-noix.webp":"7e08261fb9","Plats/fiches/salade-mozzarella-avocat.webp":"f61cf4d64b","Plats/fiches/salade-poulet-avocat.webp":"d7d8e08c44","Plats/fiches/salade-saumon-avocat.webp":"6cefbccb20","Plats/fiches/salade-thon-riz-mais.webp":"c89c0cb95a","Plats/fiches/sandwich-poulet.webp":"cb71ab49dd","Plats/fiches/saucisse-lentille.webp":"461a7c9fb1","Plats/fiches/saucisses-pommes-de-terre.webp":"950b541ec5","Plats/fiches/saumon-creme-epinards.webp":"de8ca7ce43","Plats/fiches/saumon-pommes-de-terre.webp":"59589cd245","Plats/fiches/saumon-riz-brocoli.webp":"a66fd3f0e1","Plats/fiches/spaghetti-bolognaise.webp":"78bce866e6","Plats/fiches/spaghetti-carbonara.webp":"8187396231","Plats/fiches/steak-pommes-de-terre.webp":"702af4af33","Plats/fiches/steak-tartare.webp":"504e3bafed","Plats/fiches/sushis.webp":"cb0dfe0dfb","Plats/fiches/tacos-boeuf.webp":"38d9384a31","Plats/fiches/tagliatelles-saumon.webp":"c506fa4280","Plats/fiches/tarte-tomate-mozzarella.webp":"4c9b710394","Plats/fiches/tartiflette.webp":"863445495c","Plats/fiches/wrap-poulet-crudites.webp":"6d963c31ea"};
const VISUAL_HASH_HEADER='X-Courses-Hash';
const CORE_VISUALS=[
  './welcome-cart-transparent-v46.png',
  './welcome-background-v40.webp',
  './www/empty-list-premium-v4.webp?v=305',
  './www/list-header-pomme-poire-v792.webp'
];
const SHELL=["./index.html","./marble-ivory-sage-v517.svg","./styles.css?v=792","./product-item-first-paint.css?v=610","./catalog.js?v=792","./preferences-service.js?v=398","./missing-requests-store.js?v=718","./courses-notifications.js?v=482","./bottom-nav-liquid.js?v=573","./app.js?v=786","./settings-tab-badge.js?v=410","./settings-ui.js?v=712","./error-center.js?v=630","./dishes.css?v=675","./catalog-liquid.css?v=675","./dish-detail.css?v=675","./catalog-liquid.js?v=635","./dishes-ui.js?v=717","./catalog-quantities.js?v=778","./repurchase-soon.js?v=701","./dish-local-images.js?v=792","./app-ui.js?v=755","./runtime-features.js?v=786","./missing-products-fixes.js?v=656","./missing-products-popup-ui.js?v=675","./product-item-images.js?v=792","./catalog-product-admin.js?v=712","./purchase-intelligence.js?v=718","./missing-products-dishes.js?v=712","./missing-products-modern.js?v=635","./dish-added-marker.js?v=679","./manifest.webmanifest?v=43","./icon-premium-v40.svg","./icon.svg","./apple-touch-icon.png","./docs/guide-fonctionnement-courses.pdf?v=299"];
const refreshedVisuals=new Set();
// Fichiers précachés de la version courante (adresses versionnées) : servis depuis le cache, sans attendre le réseau.
const SHELL_SUFFIXES=SHELL.filter(src=>src!=='./index.html').map(src=>src.slice(1));
function isPrecachedShellAsset(url){
  const tail=url.pathname+url.search;
  return SHELL_SUFFIXES.some(suffix=>tail.endsWith(suffix));
}
// Marque posée sur chaque visuel téléchargé : un visuel déjà vérifié pour cette version n'est plus re-téléchargé à chaque lancement.
const VISUAL_REFRESH_MARK='X-Courses-Refreshed';

function isPersistentVisual(url){
  return url.pathname.includes('/www/Plats/')&&!isDishOriginalPhoto(url)
    ||url.pathname.includes('/www/Items/')
    ||url.pathname.endsWith('/www/empty-list-premium-v4.webp')
    ||url.pathname.endsWith('/welcome-cart-transparent-v46.png')
    ||url.pathname.endsWith('/welcome-background-v40.webp')
    ||url.pathname.endsWith('/www/list-header-pomme-poire-v792.webp');
}

function visualHashKey(url){
  const match=url.pathname.match(/\/www\/((?:Items|Plats\/cartes|Plats\/fiches)\/[^/]+)$/);
  if(!match)return '';
  try{return decodeURIComponent(match[1])}catch(_){return match[1]}
}
function expectedVisualHash(url){
  const key=visualHashKey(url);
  return key&&Object.prototype.hasOwnProperty.call(VISUAL_HASHES,key)?VISUAL_HASHES[key]:'';
}
async function contentHash(buffer){
  const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',buffer));
  return Array.from(digest,byte=>byte.toString(16).padStart(2,'0')).join('').slice(0,10);
}
// Copie en cache marquée avec l'empreinte réelle de son contenu (et non celle attendue) :
// une copie périmée servie par le CDN sera donc re-téléchargée à la demande suivante.
async function storeHashedVisual(cache,request,response){
  const buffer=await response.arrayBuffer();
  const headers=new Headers(response.headers);
  headers.set(VISUAL_HASH_HEADER,await contentHash(buffer));
  await cache.put(request,new Response(buffer,{status:response.status,statusText:response.statusText,headers}));
}
async function serveHashedVisual(request,expected){
  const cache=await caches.open(VISUAL_CACHE);
  const hit=await cache.match(request);
  if(hit&&hit.headers.get(VISUAL_HASH_HEADER)===expected)return hit;
  try{
    const response=await fetch(new Request(request,{cache:'reload'}));
    if(response.ok)await storeHashedVisual(cache,request,response.clone()).catch(()=>{});
    return response;
  }catch(_){
    // Hors ligne : l'ancienne copie plutôt qu'une image vide.
    return hit||Response.error();
  }
}
// À l'activation d'une version : ne retirer que les visuels dont le contenu a changé ou qui n'existent plus.
// Une copie sans marque (cache antérieur) est comparée sur son contenu et marquée si elle est à jour.
async function pruneChangedVisuals(){
  const cache=await caches.open(VISUAL_CACHE);
  const requests=await cache.keys();
  await Promise.all(requests.map(async request=>{
    const url=new URL(request.url);
    if(!visualHashKey(url))return;
    const expected=expectedVisualHash(url);
    if(!expected)return cache.delete(request);
    const hit=await cache.match(request);
    if(!hit)return;
    const stored=hit.headers.get(VISUAL_HASH_HEADER);
    if(stored===expected)return;
    if(stored)return cache.delete(request);
    const buffer=await hit.arrayBuffer();
    if(await contentHash(buffer)!==expected)return cache.delete(request);
    const headers=new Headers(hit.headers);
    headers.set(VISUAL_HASH_HEADER,expected);
    return cache.put(request,new Response(buffer,{status:hit.status,statusText:hit.statusText,headers}));
  }));
}

function isStartupShellAsset(url){
  return url.pathname.endsWith('/styles.css')
    ||url.pathname.endsWith('/catalog.js')
    ||url.pathname.endsWith('/preferences-service.js')
    ||url.pathname.endsWith('/missing-requests-store.js')
    ||url.pathname.endsWith('/app.js')
    ||url.pathname.endsWith('/settings-tab-badge.js')
    ||url.pathname.endsWith('/settings-ui.js')
    ||url.pathname.endsWith('/error-center.js');
}

async function seedCoreVisuals(){
  const cache=await caches.open(VISUAL_CACHE);
  await Promise.all(CORE_VISUALS.map(async src=>{
    if(await cache.match(src))return;
    const existing=await caches.match(src);
    if(existing){
      await cache.put(src,existing.clone());
      return;
    }
    try{
      const response=await fetch(new Request(src,{cache:'reload'}));
      if(response.ok)await cache.put(src,response.clone());
    }catch(_){}
  }));
}

// Les photos de plats avaient une adresse changeant à chaque version (?v=) : ces anciennes
// copies, désormais inutiles, sont retirées une fois pour libérer l'espace.
// Les photos PNG d'origine (~2,4 Mo chacune) ne servent plus qu'en secours : la fiche affiche
// sa copie WebP. Elles sont retirées du cache persistant pour qu'il ne grossisse pas sans limite.
function isDishOriginalPhoto(url){
  return /\/www\/Plats\/[^/]+\.png$/.test(url.pathname);
}
async function pruneVersionedDishVisuals(){
  const cache=await caches.open(VISUAL_CACHE);
  const requests=await cache.keys();
  await Promise.all(requests.filter(request=>{
    const url=new URL(request.url);
    return url.pathname.includes('/www/Plats/')&&url.search||isDishOriginalPhoto(url);
  }).map(request=>cache.delete(request)));
}

function markVisualRefreshed(response){
  const headers=new Headers(response.headers);
  headers.set(VISUAL_REFRESH_MARK,CACHE);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

function refreshVisual(cache,request,hit){
  const key=request.url;
  if(refreshedVisuals.has(key))return Promise.resolve();
  if(hit?.headers?.get(VISUAL_REFRESH_MARK)===CACHE)return Promise.resolve();
  refreshedVisuals.add(key);
  // Revalidation conditionnelle : un visuel inchangé répond 304 sans corps, au lieu d'être
  // re-téléchargé en entier à chaque nouvelle version de l'application.
  const headers=new Headers();
  const etag=hit?.headers?.get('ETag');
  const modified=hit?.headers?.get('Last-Modified');
  if(etag)headers.set('If-None-Match',etag);
  if(modified)headers.set('If-Modified-Since',modified);
  const conditional=Boolean(etag||modified);
  const refresh=conditional
    ?new Request(request.url,{headers,cache:'no-store',credentials:'same-origin'})
    :new Request(request,{cache:'reload'});
  return fetch(refresh).then(response=>{
    if(response.status===304&&hit)return cache.put(request,markVisualRefreshed(hit.clone()));
    if(!response.ok){
      refreshedVisuals.delete(key);
      return;
    }
    return cache.put(request,markVisualRefreshed(response.clone()));
  }).catch(()=>{
    refreshedVisuals.delete(key);
  });
}

function refreshShell(cache,request){
  return fetch(new Request(request,{cache:'reload'})).then(async response=>{
    if(response.ok)await cache.put(request,response.clone());
    return response;
  });
}

async function storeErrorSignal(payload){
  const status=String(payload?.status||'').toLowerCase();
  if(status!=='error'&&status!=='added')return;
  const id=String(payload?.requestId||payload?.request_id||payload?.tag||Date.now()).replace(/[^a-z0-9_-]+/gi,'-').slice(0,120)||String(Date.now());
  const url=new URL('./__courses_error_event__/'+id+'-'+Date.now(),self.location.href);
  const cache=await caches.open(ERROR_INBOX_CACHE);
  await cache.put(new Request(url.href),new Response(JSON.stringify({...payload,receivedAt:Date.now()}),{headers:{'Content-Type':'application/json'}}));
}

async function deliverErrorSignal(payload){
  const status=String(payload?.status||'').toLowerCase();
  if(status!=='error'&&status!=='added')return;
  const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const visible=clients.filter(client=>client.visibilityState==='visible');
  if(!visible.length){
    await storeErrorSignal(payload);
    return;
  }
  let delivered=false;
  for(const client of visible){
    try{client.postMessage({type:'courses-error-signal',payload});delivered=true}catch(_){}
  }
  if(!delivered)await storeErrorSignal(payload);
}

self.addEventListener('install',event=>event.waitUntil(
  Promise.all([
    caches.open(CACHE).then(cache=>cache.addAll(SHELL)),
    seedCoreVisuals()
  ]).then(()=>self.skipWaiting())
));

self.addEventListener('activate',event=>event.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>key!==CACHE&&key!==VISUAL_CACHE&&key!==ERROR_INBOX_CACHE).map(key=>caches.delete(key))))
    .then(()=>pruneVersionedDishVisuals().catch(()=>{}))
    .then(()=>pruneChangedVisuals().catch(()=>{}))
    .then(()=>self.clients.claim())
));

self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||event.request.method!=='GET')return;
  // Contrôles de version de l'application : toujours le réseau, jamais conservés dans le cache.
  if(url.searchParams.has('courses-version-check')||url.searchParams.has('courses-shell-refresh'))return;

  if(event.request.mode==='navigate'){
    const cachePromise=caches.open(CACHE);
    const networkPromise=cachePromise.then(cache=>refreshShell(cache,event.request));
    event.waitUntil(networkPromise.catch(()=>{}));
    event.respondWith(cachePromise.then(async cache=>{
      const hit=await cache.match(event.request)||await cache.match('./index.html');
      if(hit)return hit;
      try{return await networkPromise}catch(_){return Response.error()}
    }));
    return;
  }

  if(isPersistentVisual(url)){
    const expectedHash=expectedVisualHash(url);
    if(expectedHash){
      event.respondWith(serveHashedVisual(event.request,expectedHash));
      return;
    }
    const cachePromise=caches.open(VISUAL_CACHE);
    const hitPromise=cachePromise.then(cache=>cache.match(event.request));
    event.waitUntil(
      hitPromise.then(hit=>{
        if(!hit)return;
        return cachePromise.then(cache=>refreshVisual(cache,event.request,hit));
      }).catch(()=>{})
    );
    event.respondWith(
      Promise.all([cachePromise,hitPromise]).then(async([cache,hit])=>{
        if(hit)return hit;
        try{
          const response=await fetch(new Request(event.request,{cache:'reload'}));
          if(response.ok)await cache.put(event.request,markVisualRefreshed(response.clone()));
          return response;
        }catch(_){
          return Response.error();
        }
      })
    );
    return;
  }

  if(isStartupShellAsset(url)){
    const cachePromise=caches.open(CACHE);
    const hitPromise=cachePromise.then(cache=>cache.match(event.request));
    const networkPromise=cachePromise.then(cache=>refreshShell(cache,event.request));
    event.waitUntil(networkPromise.catch(()=>{}));
    event.respondWith(hitPromise.then(async hit=>{
      if(hit)return hit;
      try{return await networkPromise}catch(_){return Response.error()}
    }));
    return;
  }

  if(isPrecachedShellAsset(url)){
    event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request)).then(hit=>{
      if(hit)return hit;
      return fetch(new Request(event.request,{cache:'reload'})).then(response=>{
        const copy=response.clone();
        if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        return response;
      }).catch(()=>Response.error());
    }));
    return;
  }

  const networkRequest=new Request(event.request,{cache:'reload'});
  event.respondWith(fetch(networkRequest).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>caches.match(event.request).then(hit=>{
    if(hit)return hit;
    return Response.error();
  })));
});

self.addEventListener('push',event=>{
  let payload={};
  try{payload=event.data?.json?.()||{}}catch(_){
    try{payload={body:event.data?.text?.()||''}}catch(__){payload={}}
  }
  const title=String(payload.title||'Courses');
  const body=String(payload.body||'Le catalogue a été mis à jour.');
  const tag=String(payload.tag||'courses-catalog-update');
  const url=String(payload.url||'./');
  event.waitUntil(Promise.all([
    deliverErrorSignal(payload).catch(()=>{}),
    self.registration.showNotification(title,{
      body,
      tag,
      icon:'./apple-touch-icon.png',
      badge:'./apple-touch-icon.png',
      data:{url},
      renotify:true
    })
  ]));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=new URL(String(event.notification.data?.url||'./'),self.location.href).href;
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{
    for(const client of clients){
      try{
        if(new URL(client.url).origin!==self.location.origin)continue;
        if('navigate' in client)await client.navigate(target);
        if('focus' in client)return client.focus();
      }catch(_){}
    }
    return self.clients.openWindow?self.clients.openWindow(target):undefined;
  }));
});

