(() => {
'use strict';

// Références techniques utilisées uniquement pour convertir un besoin de recette
// en nombre d'unités à ajouter. Elles ne sont jamais affichées comme un format fixe.
const PURCHASE_REFERENCES=Object.freeze({
  'Spaghetti':{amount:500,unit:'g'},
  'Penne':{amount:500,unit:'g'},
  'Coquillettes':{amount:500,unit:'g'},
  'Tagliatelles':{amount:500,unit:'g'},
  'Lasagnes':{amount:500,unit:'g'},
  'Riz basmati':{amount:500,unit:'g'},
  'Riz long':{amount:500,unit:'g'},
  'Quinoa':{amount:500,unit:'g'},
  'Couscous':{amount:500,unit:'g'},
  'Nouilles chinoises':{amount:250,unit:'g'},
  'Lardons':{amount:200,unit:'g'},
  'Parmesan':{amount:100,unit:'g'},
  'Crème fraîche':{amount:200,unit:'ml'},
  'Crème liquide':{amount:200,unit:'ml'},
  'Crème épaisse':{amount:200,unit:'ml'},
  'Œufs':{amount:6,unit:'piece'},
  'Mascarpone':{amount:250,unit:'g'},
  'Frites surgelées':{amount:1000,unit:'g'},
  'Mozzarella':{amount:125,unit:'g'},
  'Fromage râpé':{amount:200,unit:'g'},
  'Pains burger':{amount:4,unit:'piece'},
  'Pains hot-dog':{amount:4,unit:'piece'},
  'Wraps':{amount:6,unit:'piece'},
  'Galettes de blé':{amount:8,unit:'piece'},
  'Pâte brisée':{amount:1,unit:'piece'},
  'Sauce tomate':{amount:400,unit:'g'},
  'Pesto':{amount:190,unit:'g'},
  'Sauce soja':{amount:150,unit:'ml'},
  'Moutarde':{amount:370,unit:'g'},
  'Miel':{amount:375,unit:'g'},
  'Curry':{amount:40,unit:'g'},
  'Lait de coco':{amount:400,unit:'ml'},
  'Haricots rouges':{amount:400,unit:'g'},
  'Pois chiches':{amount:400,unit:'g'},
  'Tomates pelées':{amount:400,unit:'g'},
  'Maïs en boîte':{amount:300,unit:'g'},
  'Thon en boîte':{amount:140,unit:'g'},
  'Lentilles':{amount:400,unit:'g'},
  'Farine':{amount:1000,unit:'g'},
  'Sucre':{amount:1000,unit:'g'},
  'Beurre':{amount:250,unit:'g'},
  'Lait':{amount:1000,unit:'ml'},
  'Lait entier':{amount:1000,unit:'ml'},
  'Lait demi-écrémé':{amount:1000,unit:'ml'},
  'Lait écrémé':{amount:1000,unit:'ml'},
  'Lait sans lactose':{amount:1000,unit:'ml'},
  "Lait d'amande":{amount:1000,unit:'ml'},
  "Lait d'avoine":{amount:1000,unit:'ml'},
  'Chapelure':{amount:250,unit:'g'},
  'Croûtons':{amount:100,unit:'g'},
  'Vanille':{amount:1,unit:'piece'}
});

const PRODUCT_META=new Map();
Object.entries(window.COURSES_CATALOG?.groups||{}).forEach(([category,subgroups])=>{
  Object.entries(subgroups||{}).forEach(([sub,names])=>{
    (Array.isArray(names)?names:[]).forEach(name=>PRODUCT_META.set(name,{category,sub}));
  });
});

// Libellés visibles : mode d'achat / type de conditionnement uniquement.
const DISPLAY_MODE_BY_SUB=Object.freeze({
  'Laits & crèmes':'Bouteille',
  'Yaourts & desserts':'Pot',
  'Fromages':'Poids',
  'Charcuterie':'Barquette',
  'Viandes':'Poids',
  'Poissons & traiteur':'Poids',
  'Surgelés':'Sachet',
  'Boulangerie':'Pièce',
  'Pâtes à tarte':'Pièce',
  'Fruits classiques':'Poids',
  'Fruits rouges & exotiques':'Poids',
  'Légumes du quotidien':'Poids',
  'Légumes variés':'Poids',
  'Salades & herbes':'Pièce',
  'Pommes de terre & aromates':'Poids',
  'Pâtes, riz & céréales':'Paquet',
  'Conserves':'Boîte',
  'Sauces & condiments':'Flacon',
  'Petit-déjeuner':'Paquet',
  'Biscuits & goûters':'Paquet',
  'Pâtisserie & cuisine':'Paquet',
  'Apéritif':'Sachet',
  'Monde & pratique':'Paquet',
  'Eaux & jus':'Bouteille',
  'Sodas & sirops':'Bouteille',
  'Café & thé':'Boîte',
  'Bières & vins':'Bouteille',
  'Entretien':'Flacon',
  'Lessive':'Flacon',
  'Vaisselle':'Flacon',
  'Papier & sacs':'Paquet',
  'Hygiène':'Flacon',
  'Salle de bain & soins':'Flacon',
  'Enfant':'Paquet',
  'Produits laitiers':'Pot',
  'Poissons en conserve':'Boîte',
  'Traiteur frais':'Pièce'
});

const DISPLAY_MODE_BY_PRODUCT=Object.freeze({
  'Crème fraîche':'Pot','Crème liquide':'Brique','Crème épaisse':'Pot','Œufs':'Boîte','Mascarpone':'Pot',
  'Beurre':'Plaquette','Camembert':'Pièce','Chèvre':'Pièce','Mozzarella':'Sachet','Raclette':'Barquette','Reblochon':'Pièce','Fromage râpé':'Sachet',
  'Saucisson':'Pièce','Chorizo':'Pièce','Pâté':'Barquette','Rillettes':'Pot',
  'Surimi':'Paquet','Saumon fumé':'Paquet','Poisson pané':'Boîte','Quiche':'Pièce','Pizza fraîche':'Boîte','Pâtes fraîches':'Paquet',
  'Steaks hachés surgelés':'Boîte','Pizza surgelée':'Boîte','Glace vanille':'Pot','Glace chocolat':'Pot','Sorbet':'Pot','Glaçons':'Sac',
  'Pain de mie':'Paquet','Brioche':'Paquet','Croissants':'Paquet','Pains au chocolat':'Paquet','Wraps':'Paquet','Pains burger':'Paquet','Pains hot-dog':'Paquet','Galettes de blé':'Paquet','Pâte brisée':'Pièce',
  'Citrons':'Pièce','Kiwis':'Pièce','Fraises':'Barquette','Framboises':'Barquette','Myrtilles':'Barquette','Mûres':'Barquette',
  'Ananas':'Pièce','Mangue':'Pièce','Avocat':'Pièce','Noix de coco':'Pièce','Grenade':'Pièce','Fruit de la passion':'Pièce','Melon':'Pièce',
  'Concombres':'Pièce','Brocoli':'Pièce','Chou-fleur':'Pièce','Épinards':'Sachet','Poireaux':'Botte',
  'Champignons':'Barquette','Courge':'Pièce','Potiron':'Pièce','Butternut':'Pièce','Fenouil':'Pièce','Céleri':'Pièce','Artichauts':'Pièce','Asperges':'Botte','Maïs':'Pièce','Radis':'Botte',
  'Mâche':'Sachet','Roquette':'Sachet','Endives':'Sachet',
  'Persil':'Botte','Ciboulette':'Botte','Basilic':'Botte','Coriandre':'Botte','Menthe':'Botte','Thym frais':'Botte','Romarin frais':'Botte',
  'Ail':'Pièce','Piments':'Pièce','Citron vert':'Pièce','Olives fraîches':'Barquette',
  'Mayonnaise':'Pot','Moutarde':'Pot','Sauce tomate':'Pot','Pesto':'Pot','Sauce César':'Flacon','Vinaigre balsamique':'Bouteille','Vinaigre de vin':'Bouteille','Vinaigre de cidre':'Bouteille','Huile d\'olive':'Bouteille','Huile de tournesol':'Bouteille',
  'Café soluble':'Pot','Thé noir':'Boîte','Thé vert':'Boîte','Chocolat en poudre':'Boîte','Céréales':'Boîte','Miel':'Pot','Pâte à tartiner':'Pot',
  'Bonbons':'Sachet','Chocolat noir':'Tablette','Chocolat au lait':'Tablette',
  'Levure chimique':'Sachet','Levure boulangère':'Sachet','Maïzena':'Boîte','Vanille':'Sachet','Pépites chocolat':'Sachet','Noix de coco râpée':'Sachet','Amandes en poudre':'Sachet','Gélatine':'Paquet',
  'Olives':'Pot','Crackers':'Paquet','Mini saucissons':'Paquet','Tapenade':'Pot','Houmous':'Pot',
  'Nouilles instantanées':'Paquet','Nouilles chinoises':'Paquet','Tortillas':'Paquet','Couscous':'Paquet','Curry':'Flacon','Lait de coco':'Boîte','Harissa':'Tube','Guacamole':'Pot','Purée en flocons':'Paquet','Bouillon cubes':'Boîte','Soupes en brique':'Brique','Croûtons':'Sachet','Curcuma':'Flacon','Paprika':'Flacon','Chili':'Flacon',
  'Chicorée':'Pot','Matcha':'Boîte','Chocolat chaud':'Boîte','Filtres à café':'Boîte',
  'Éponges magiques':'Paquet','Lingettes ménage':'Paquet','Bicarbonate':'Paquet','Vinaigre ménager':'Bouteille',
  'Lessive capsules':'Boîte','Lessive poudre':'Paquet','Lingettes anti-décoloration':'Boîte','Filet de lavage':'Pièce','Pinces à linge':'Paquet','Sacs linge délicat':'Paquet',
  'Tablettes lave-vaisselle':'Boîte','Sel lave-vaisselle':'Paquet','Éponges':'Paquet','Grattoirs':'Paquet','Brosses vaisselle':'Pièce','Gants ménage':'Paire','Torchons':'Paquet','Essuie-verres':'Paquet',
  'Papier aluminium':'Rouleau','Film alimentaire':'Rouleau','Papier cuisson':'Rouleau',
  'Dentifrice':'Tube','Brosses à dents':'Pièce','Cotons-tiges':'Boîte','Disques coton':'Paquet','Mouchoirs poche':'Paquet','Papier toilette humide':'Paquet',
  'Crème hydratante':'Tube','Crème mains':'Tube','Baume lèvres':'Stick','Rasoirs':'Paquet','Coton':'Paquet','Protections hygiéniques':'Paquet','Pansements':'Boîte','Thermomètre piles':'Pièce','Pile AAA':'Paquet',
  'Lait infantile':'Boîte','Petits pots':'Pot','Compotes bébé':'Pot','Croquettes chat':'Sac','Pâtée chat':'Boîte','Litière chat':'Sac','Croquettes chien':'Sac','Sacs déjections':'Paquet','Friandises animaux':'Paquet',
  "Piles AA":"Paquet",
  "Cornichon":"Pot",
  "Confiture fraise":"Pot",
  "Confiture mirabelles":"Pot",
  "Chips":"Paquet",
  "Pâte feuilletée":"Paquet",
  "Kinder Maxi":"Boîte",
  "Ricard":"Bouteille"
});

// Modes techniques conservés séparément pour le modèle de doublons Home Assistant.
const TECHNICAL_MODE_BY_SUB=Object.freeze({
  'Laits & crèmes':'Volume',
  'Yaourts & desserts':'Pot',
  'Fromages':'Poids',
  'Charcuterie':'Barquette',
  'Viandes':'Poids',
  'Poissons & traiteur':'Poids',
  'Surgelés':'Sachet',
  'Boulangerie':'Pièce',
  'Pâtes à tarte':'Pièce',
  'Fruits classiques':'Poids',
  'Fruits rouges & exotiques':'Poids',
  'Légumes du quotidien':'Poids',
  'Légumes variés':'Poids',
  'Salades & herbes':'Pièce',
  'Pommes de terre & aromates':'Poids',
  'Pâtes, riz & céréales':'Paquet',
  'Conserves':'Boîte',
  'Sauces & condiments':'Flacon',
  'Petit-déjeuner':'Paquet',
  'Biscuits & goûters':'Paquet',
  'Pâtisserie & cuisine':'Paquet',
  'Apéritif':'Sachet',
  'Monde & pratique':'Sachet',
  'Eaux & jus':'Bouteille',
  'Sodas & sirops':'Bouteille',
  'Café & thé':'Boîte',
  'Bières & vins':'Bouteille',
  'Entretien':'Flacon',
  'Lessive':'Flacon',
  'Vaisselle':'Flacon',
  'Papier & sacs':'Paquet',
  'Hygiène':'Flacon',
  'Salle de bain & soins':'Flacon',
  'Enfant':'Paquet',
  'Produits laitiers':'Pot',
  'Poissons en conserve':'Boîte',
  'Traiteur frais':'Pièce'
});

const TECHNICAL_MODE_BY_PRODUCT=Object.freeze({
  'Surimi':'Paquet','Poisson pané':'Boîte','Quiche':'Pièce','Pizza fraîche':'Pièce','Pâtes fraîches':'Paquet','Pâte brisée':'Pièce',
  'Ananas':'Pièce','Mangue':'Pièce','Avocat':'Pièce','Noix de coco':'Pièce','Grenade':'Pièce','Fruit de la passion':'Pièce','Melon':'Pièce',
  'Citrons':'Pièce','Concombres':'Pièce','Brocoli':'Pièce','Chou-fleur':'Pièce','Courge':'Pièce','Potiron':'Pièce','Butternut':'Pièce','Fenouil':'Pièce','Céleri':'Pièce','Artichauts':'Pièce',
  'Ail':'Pièce','Piments':'Pièce','Citron vert':'Pièce'
});

// Une occurrence synchronisée avec Home Assistant représente 100 g (ou 100 ml)
// pour les produits vendus à quantité variable. Cela conserve le modèle actuel
// de quantité par doublons tout en permettant aux plats de transporter leur besoin réel.
const VARIABLE_PURCHASE_STEPS=Object.freeze({
  'Poids':{amount:100,unit:'g'},
  'Coupe':{amount:100,unit:'g'},
  'Volume':{amount:100,unit:'ml'}
});

// Besoin culinaire par défaut. Les recettes natives ont désormais leur propre base pour 2 personnes.
const NEED_PER_PERSON=Object.freeze({
  'Spaghetti':100,'Penne':100,'Coquillettes':100,'Tagliatelles':100,'Lasagnes':100,
  'Riz basmati':70,'Riz long':70,'Quinoa':70,'Couscous':50,'Nouilles chinoises':90,
  'Lardons':50,'Parmesan':25,'Crème fraîche':35,'Crème liquide':125,'Œufs':1,
  'Poulet':125,'Escalopes de poulet':125,'Viande hachée':110,'Bœuf':125,
  'Steaks hachés':1,'Saucisses':1,'Merguez':2,
  'Saumon':150,'Cabillaud':150,'Crevettes':100,'Moules':500,'Saumon fumé':50,'Frites surgelées':200,
  'Mozzarella':62.5,'Fromage râpé':35,'Emmental':40,'Raclette':200,'Reblochon':100,'Chèvre':50,
  'Jambon blanc':1,'Jambon cru':25,'Rosette':25,'Chorizo':40,'Blanc de poulet':2,
  'Pains burger':1,'Pains hot-dog':2,'Wraps':1,'Galettes de blé':1,'Pâte brisée':0.5,
  'Pain de mie':70,'Pain':100,'Baguette':60,
  'Sauce tomate':100,'Pesto':15,'Sauce soja':15,'Sauce César':30,'Moutarde':5,'Miel':7.5,'Curry':5,'Paprika':4,'Curcuma':2.5,'Chili':3,'Lait de coco':50,
  'Haricots rouges':100,'Pois chiches':100,'Tomates pelées':100,'Maïs en boîte':60,'Thon en boîte':70,'Lentilles':70,
  'Tomates':100,'Carottes':85,'Courgettes':100,'Aubergines':80,'Poivrons':85,'Champignons':100,
  'Brocoli':150,'Haricots verts':150,'Épinards':100,'Poireaux':150,'Pommes de terre':225,
  'Oignons jaunes':50,'Oignons rouges':50,'Salade verte':0.25,'Avocat':0.5,'Concombres':0.25,
  'Citrons':0.25,'Ail':0.5,'Piments':0.5,'Gingembre':10,'Basilic':4,'Romarin frais':2,'Noix':25,
  'Farine':65,'Sucre':25,'Beurre':20,'Lait':75,'Lait entier':250,'Vin blanc':20,'Gélatine':1.5,'Chapelure':20,'Croûtons':25,'Vanille':0.25
});

const RECIPE_UNITS=Object.freeze({
  'Crème fraîche':'ml','Crème liquide':'ml','Crème épaisse':'ml','Sauce soja':'ml','Sauce César':'ml','Lait de coco':'ml','Lait':'ml','Lait entier':'ml','Vin blanc':'ml',
  'Œufs':'piece','Steaks hachés':'piece','Saucisses':'piece','Merguez':'piece','Jambon blanc':'piece',
  'Blanc de poulet':'piece','Pains burger':'piece','Pains hot-dog':'piece','Wraps':'piece','Pâte brisée':'piece','Gélatine':'piece','Piments':'piece',
  'Galettes de blé':'piece','Salade verte':'piece','Avocat':'piece','Concombres':'piece','Citrons':'piece','Ail':'piece','Vanille':'piece'
});

const DISH_NEEDS_FOR_TWO=Object.freeze({
  'Spaghetti carbonara':{'Spaghetti':200,'Lardons':100,'Œufs':2,'Parmesan':80},
  'Spaghetti bolognaise':{'Spaghetti':200,'Viande hachée':200,'Sauce tomate':200,'Oignons jaunes':100,'Carottes':100,'Ail':1},
  'Penne poulet crème':{'Penne':200,'Poulet':250,'Crème fraîche':100,'Champignons':200,'Parmesan':40},
  'Pâtes tomate mozzarella':{'Penne':200,'Sauce tomate':200,'Mozzarella':125,'Basilic':8},
  'Lasagnes bolognaise':{'Lasagnes':200,'Viande hachée':250,'Sauce tomate':250,'Fromage râpé':80,'Crème fraîche':100},
  'Tagliatelles au saumon':{'Tagliatelles':200,'Saumon':250,'Crème fraîche':80,'Citrons':0.5},
  'Pâtes pesto poulet':{'Penne':200,'Poulet':250,'Pesto':30,'Parmesan':30},
  'Penne chorizo poivrons':{'Penne':180,'Chorizo':80,'Sauce tomate':200,'Poivrons':200},
  'Burger maison':{'Pains burger':2,'Steaks hachés':2,'Emmental':60,'Tomates':120,'Salade verte':0.5,'Oignons rouges':50},
  'Tacos bœuf':{'Galettes de blé':2,'Viande hachée':200,'Fromage râpé':60,'Tomates':120,'Salade verte':0.5,'Avocat':1},
  'Chili con carne':{'Viande hachée':200,'Haricots rouges':200,'Tomates pelées':200,'Oignons jaunes':50,'Riz basmati':140,'Chili':6},
  'Couscous merguez':{'Couscous':80,'Merguez':4,'Carottes':300,'Courgettes':150,'Pois chiches':100,'Tomates':250},
  'Steak pommes de terre':{'Steaks hachés':2,'Pommes de terre':500,'Salade verte':0.5},
  'Saucisses pommes de terre':{'Saucisses':2,'Pommes de terre':500,'Oignons jaunes':100},
  'Tartiflette':{'Pommes de terre':500,'Reblochon':200,'Lardons':100,'Oignons jaunes':100,'Crème fraîche':30,'Vin blanc':40},
  'Raclette':{'Raclette':400,'Pommes de terre':500,'Jambon blanc':2,'Jambon cru':50,'Rosette':50},
  'Poulet curry':{'Poulet':250,'Riz basmati':140,'Lait de coco':60,'Oignons jaunes':100,'Curry':10},
  'Poulet riz légumes':{'Poulet':250,'Riz basmati':140,'Poivrons':150,'Courgettes':150,'Carottes':150},
  'Wrap poulet crudités':{'Wraps':2,'Poulet':200,'Salade verte':0.5,'Tomates':150,'Avocat':1},
  'Poulet crème champignons':{'Poulet':250,'Crème fraîche':100,'Champignons':250,'Riz basmati':140},
  'Salade César':{'Salade verte':0.5,'Poulet':200,'Parmesan':40,'Croûtons':50,'Sauce César':60},
  'Poulet tomate mozzarella':{'Escalopes de poulet':250,'Mozzarella':125,'Tomates':200,'Sauce tomate':100},
  'Poulet brocoli riz':{'Poulet':250,'Brocoli':300,'Riz basmati':140,'Crème fraîche':60},
  'Fajitas poulet':{'Galettes de blé':2,'Poulet':200,'Poivrons':200,'Oignons rouges':100,'Avocat':1},
  'Saumon riz brocoli':{'Saumon':300,'Riz basmati':140,'Brocoli':300,'Citrons':0.5},
  'Cabillaud pommes de terre':{'Cabillaud':300,'Pommes de terre':300,'Haricots verts':300,'Citrons':0.5},
  'Crevettes nouilles asiatiques':{'Crevettes':200,'Nouilles chinoises':180,'Poivrons':150,'Carottes':150,'Sauce soja':30},
  'Salade saumon avocat':{'Saumon fumé':100,'Avocat':1,'Salade verte':0.5,'Tomates':150,'Citrons':0.5},
  'Salade thon riz maïs':{'Thon en boîte':140,'Riz long':140,'Maïs en boîte':150,'Tomates':150,'Concombres':0.5},
  'Moules frites':{'Moules':1000,'Frites surgelées':400},
  'Hot-dog':{'Pains hot-dog':4,'Saucisses':4,'Oignons jaunes':100},
  'Omelette jambon fromage':{'Œufs':4,'Jambon blanc':2,'Fromage râpé':60,'Champignons':150},
  'Croque-monsieur':{'Pain de mie':140,'Jambon blanc':2,'Emmental':80,'Crème fraîche':60},
  'Pizza wrap':{'Wraps':2,'Sauce tomate':150,'Mozzarella':125,'Jambon blanc':2},
  'Bruschetta tomate mozzarella':{'Baguette':120,'Tomates':250,'Mozzarella':125,'Basilic':8},
  'Sandwich poulet':{'Pain':200,'Blanc de poulet':4,'Salade verte':0.5,'Tomates':150},
  'Curry pois chiches':{'Pois chiches':200,'Lait de coco':120,'Tomates pelées':200,'Épinards':200,'Riz basmati':140,'Curry':10},
  'Buddha bowl quinoa':{'Quinoa':140,'Avocat':1,'Pois chiches':160,'Carottes':150,'Concombres':0.5},
  'Gratin de courgettes':{'Courgettes':500,'Crème fraîche':100,'Fromage râpé':80,'Œufs':2},
  'Ratatouille':{'Tomates':250,'Courgettes':160,'Aubergines':160,'Poivrons':160,'Oignons jaunes':100,'Ail':1},
  'Salade chèvre noix':{'Salade verte':0.5,'Chèvre':100,'Noix':50,'Tomates':150},
  'Pâtes pesto mozzarella':{'Penne':200,'Pesto':30,'Mozzarella':125,'Tomates':150},
  'Chili sin carne':{'Haricots rouges':200,'Maïs en boîte':100,'Tomates pelées':200,'Poivrons':150,'Oignons jaunes':100,'Riz basmati':140,'Carottes':100,'Chili':6},
  'Riz champignons parmesan':{'Riz long':140,'Champignons':300,'Parmesan':40,'Crème fraîche':60},
  'Poulet parmesan tomate':{'Escalopes de poulet':250,'Sauce tomate':200,'Parmesan':40,'Mozzarella':125,'Chapelure':50},
  'Poulet miel moutarde':{'Poulet':250,'Miel':15,'Moutarde':10,'Crème fraîche':60,'Oignons rouges':100},
  'Poulet teriyaki riz':{'Poulet':250,'Riz basmati':140,'Sauce soja':30,'Miel':20,'Gingembre':20},
  'Poulet paprika crème':{'Poulet':250,'Crème fraîche':80,'Riz basmati':140,'Oignons jaunes':100,'Paprika':8},
  'Poulet pommes de terre au four':{'Poulet':250,'Pommes de terre':400,'Oignons jaunes':100,'Romarin frais':4},
  'Riz poulet curry coco':{'Poulet':250,'Riz basmati':140,'Lait de coco':100,'Curry':10},
  'Riz sauté poulet légumes':{'Poulet':200,'Riz basmati':140,'Poivrons':150,'Carottes':100,'Œufs':2,'Sauce soja':30},
  'Riz crevettes légumes':{'Crevettes':200,'Riz basmati':140,'Poivrons':150,'Carottes':100,'Œufs':2,'Sauce soja':30},
  'Bœuf riz poivrons':{'Bœuf':250,'Riz basmati':140,'Poivrons':200,'Oignons jaunes':100,'Sauce soja':30},
  'Bœuf sauce tomate pommes de terre':{'Bœuf':250,'Pommes de terre':400,'Sauce tomate':200,'Oignons jaunes':100,'Carottes':150},
  'Hachis parmentier':{'Viande hachée':250,'Pommes de terre':400,'Lait':100,'Beurre':20,'Oignons jaunes':50,'Fromage râpé':40},
  'Boulettes sauce tomate':{'Viande hachée':250,'Sauce tomate':200,'Œufs':1,'Chapelure':40,'Oignons jaunes':50},
  'Gratin pommes de terre jambon':{'Pommes de terre':500,'Jambon blanc':2,'Crème fraîche':100,'Fromage râpé':100},
  'Gratin brocoli poulet':{'Brocoli':350,'Poulet':250,'Crème fraîche':100,'Fromage râpé':80},
  'Quiche lorraine':{'Pâte brisée':1,'Œufs':2,'Lardons':100,'Crème fraîche':100,'Lait':100},
  'Quiche poireaux chèvre':{'Pâte brisée':1,'Poireaux':300,'Chèvre':100,'Œufs':2,'Crème fraîche':100},
  'Tarte tomate mozzarella':{'Pâte brisée':1,'Tomates':300,'Mozzarella':125,'Moutarde':20,'Basilic':8},
  'Salade poulet avocat':{'Poulet':200,'Avocat':1,'Salade verte':0.5,'Tomates':150},
  'Salade César saumon':{'Salade verte':0.5,'Saumon':250,'Parmesan':40,'Croûtons':50,'Sauce César':60,'Citrons':0.5},
  'Salade mozzarella avocat':{'Mozzarella':125,'Avocat':1,'Tomates':200,'Salade verte':0.5},
  'Saumon pommes de terre':{'Saumon':300,'Pommes de terre':400,'Citrons':0.5},
  'Saumon crème épinards':{'Saumon':300,'Crème fraîche':60,'Épinards':200,'Riz basmati':140},
  'Cabillaud riz légumes':{'Cabillaud':300,'Riz basmati':140,'Poivrons':150,'Courgettes':150,'Carottes':150},
  'Crevettes curry coco':{'Crevettes':200,'Riz basmati':140,'Lait de coco':100,'Curry':10},
  'Poêlée pommes de terre saucisses':{'Saucisses':2,'Pommes de terre':500,'Oignons jaunes':100},
  'Poêlée poulet courgettes':{'Poulet':250,'Courgettes':300,'Oignons jaunes':100,'Ail':1},
  'Croque poulet fromage':{'Pain de mie':140,'Blanc de poulet':4,'Emmental':80,'Crème fraîche':60},
  'Boulettes riz':{'Viande hachée':250,'Riz basmati':140,'Sauce tomate':200,'Œufs':1,'Chapelure':40},
  'Coquillettes jambon':{'Coquillettes':200,'Jambon blanc':2,'Crème fraîche':60,'Fromage râpé':60},
  'Couscous poulet légumes':{'Couscous':100,'Poulet':200,'Carottes':150,'Courgettes':150},
  'Gratin pommes de terre':{'Pommes de terre':500,'Crème fraîche':100,'Fromage râpé':80},
  'Pâtes jambon':{'Penne':200,'Jambon blanc':2,'Crème fraîche':60},
  'Purée carotte poulet':{'Pommes de terre':300,'Carottes':300,'Poulet':200,'Lait':120,'Beurre':20},
  'Risotto poulet':{'Riz long':160,'Poulet':200,'Parmesan':40,'Crème fraîche':40},
  'Saumon brocoli':{'Saumon':250,'Brocoli':300,'Riz basmati':120},
  'Steak frites':{'Steaks hachés':2,'Frites surgelées':400},
  'Velouté carottes':{'Carottes':500,'Pommes de terre':200,'Crème fraîche':60,'Oignons jaunes':80},
  'Steak tartare':{'Bœuf':300,'Œufs':2,'Oignons rouges':60},
  'Sushis':{'Saumon':200,'Riz long':160,'Avocat':1,'Concombres':0.5},
  'Saucisse lentille':{'Saucisses':2,'Lentilles':140,'Carottes':100,'Oignons jaunes':50},
  'Crème brûlée':{'Crème liquide':250,'Œufs':3,'Sucre':50,'Vanille':0.5},
  'Pannacotta':{'Crème liquide':400,'Sucre':50,'Vanille':0.5,'Gélatine':3},
  'Riz au lait':{'Lait entier':500,'Riz long':60,'Sucre':40,'Vanille':0.5},
  'Rougail saucisse':{'Saucisses':2,'Tomates pelées':200,'Oignons jaunes':50,'Ail':1,'Piments':1,'Riz long':140,'Gingembre':10,'Curcuma':5}
});

const BASE_SERVINGS=2;
let dialog=null;
let list=null;
let products=null;
let shoppingList=null;
let pending=false;
let productFrame=0;
let shoppingListFrame=0;
let dishFrame=0;
let eventsBound=false;
const STORAGE_SERVINGS='courses-dish-servings-v1';
const STORAGE_RECIPE_NEEDS='courses-dish-need-overrides-v2';
const LEGACY_STORAGE_RECIPE_NEEDS='courses-dish-need-overrides-v1';
const STORAGE_DISH_CONTRIBUTIONS='courses-dish-contributions-v1';
let recipeNeedOverrides=readRecipeNeedOverrides();
let dishContributions=readDishContributions();

window.COURSES_PRODUCT_PACKS=PURCHASE_REFERENCES;

function servings(){
  const input=dialog?.querySelector('.dish-servings-value');
  const value=Math.round(Number(input?.value)||BASE_SERVINGS);
  return Math.max(1,Math.min(12,value));
}
function currentDish(){
  return dialog?.querySelector('.dish-sheet-head h2')?.textContent?.trim()||'';
}
function purchaseReferenceFor(name){
  const reference=PURCHASE_REFERENCES[name];
  return reference&&Number(reference.amount)>0?reference:null;
}
function purchaseLabel(name){
  const explicit=DISPLAY_MODE_BY_PRODUCT[name];
  if(explicit)return explicit;
  const meta=PRODUCT_META.get(name);
  return DISPLAY_MODE_BY_SUB[meta?.sub]||'Unité';
}
function technicalMode(name){
  const explicit=TECHNICAL_MODE_BY_PRODUCT[name];
  if(explicit)return explicit;
  const meta=PRODUCT_META.get(name);
  return TECHNICAL_MODE_BY_SUB[meta?.sub]||'Unité';
}
function variablePurchaseStepFor(name){
  if(purchaseReferenceFor(name))return null;
  const step=VARIABLE_PURCHASE_STEPS[technicalMode(name)];
  if(!step)return null;
  const recipeUnit=RECIPE_UNITS[name]||'g';
  return recipeUnit===step.unit?step:null;
}
function recipeUnitFor(name){
  return RECIPE_UNITS[name]||purchaseReferenceFor(name)?.unit||variablePurchaseStepFor(name)?.unit||'g';
}
function auditPurchaseModes(){
  const missing=[];
  PRODUCT_META.forEach((meta,name)=>{
    if(DISPLAY_MODE_BY_PRODUCT[name]||DISPLAY_MODE_BY_SUB[meta?.sub])return;
    missing.push(name);
  });
  if(missing.length)console.warn('Catalogue : mode d’achat non défini',missing);
}
function sanitizeRecipeNeeds(raw,scale=1){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};
  const clean={};
  Object.entries(raw).forEach(([dish,values])=>{
    if(!values||typeof values!=='object'||Array.isArray(values))return;
    const dishValues={};
    Object.entries(values).forEach(([name,value])=>{
      const amount=Number(value)*scale;
      if(PRODUCT_META.has(name)&&Number.isFinite(amount)&&amount>0)dishValues[name]=Math.round(amount*100)/100;
    });
    if(Object.keys(dishValues).length)clean[String(dish)]=dishValues;
  });
  return clean;
}
function readRecipeNeedOverrides(){
  try{
    const current=JSON.parse(localStorage.getItem(STORAGE_RECIPE_NEEDS)||'null');
    if(current)return sanitizeRecipeNeeds(current);
    const legacy=JSON.parse(localStorage.getItem(LEGACY_STORAGE_RECIPE_NEEDS)||'null');
    const migrated=sanitizeRecipeNeeds(legacy,BASE_SERVINGS/4);
    if(Object.keys(migrated).length)localStorage.setItem(STORAGE_RECIPE_NEEDS,JSON.stringify(migrated));
    return migrated;
  }catch(_){return {}}
}
function persistRecipeNeedOverrides(){
  try{localStorage.setItem(STORAGE_RECIPE_NEEDS,JSON.stringify(recipeNeedOverrides))}catch(_){}
}
function readDishContributions(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_DISH_CONTRIBUTIONS)||'{}');
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};
    const clean={};
    Object.entries(raw).forEach(([dish,values])=>{
      if(!values||typeof values!=='object'||Array.isArray(values))return;
      const dishValues={};
      Object.entries(values).forEach(([name,value])=>{
        const amount=Number(value);
        if(PRODUCT_META.has(name)&&Number.isFinite(amount)&&amount>=0)dishValues[name]=Math.round(amount*100)/100;
      });
      if(Object.keys(dishValues).length)clean[String(dish)]=dishValues;
    });
    return clean;
  }catch(_){return {}}
}
function persistDishContributions(){
  try{localStorage.setItem(STORAGE_DISH_CONTRIBUTIONS,JSON.stringify(dishContributions))}catch(_){}
}
function baseNeedFor(name,dish=currentDish(),count=servings()){
  const currentServings=Math.max(1,Math.min(12,Math.round(Number(count)||BASE_SERVINGS)));
  const dishNeed=Number(DISH_NEEDS_FOR_TWO[dish]?.[name]);
  if(Number.isFinite(dishNeed)&&dishNeed>0)return dishNeed*currentServings/BASE_SERVINGS;
  const perPerson=Number(NEED_PER_PERSON[name]);
  return Number.isFinite(perPerson)&&perPerson>0?perPerson*currentServings:null;
}
function needFor(name,dish=currentDish(),count=servings()){
  const currentServings=Math.max(1,Math.min(12,Math.round(Number(count)||BASE_SERVINGS)));
  const custom=Number(recipeNeedOverrides[dish]?.[name]);
  if(Number.isFinite(custom)&&custom>0)return custom*currentServings/BASE_SERVINGS;
  return baseNeedFor(name,dish,currentServings);
}
function quantityForNeed(name,need,present=true){
  if(!present)return 0;
  const purchaseUnit=purchaseReferenceFor(name)||variablePurchaseStepFor(name);
  if(!purchaseUnit||!(Number.isFinite(need)&&need>0))return 1;
  return Math.max(1,Math.ceil(need/purchaseUnit.amount));
}
function quantityFor(name,dish=currentDish(),count=servings()){
  return quantityForNeed(name,needFor(name,dish,count),true);
}
function aggregateContribution(name,replaceDish='',replaceAmount=undefined){
  let total=0,present=false;
  Object.entries(dishContributions).forEach(([dish,values])=>{
    if(dish===replaceDish)return;
    if(!Object.prototype.hasOwnProperty.call(values,name))return;
    present=true;
    total+=Math.max(0,Number(values[name])||0);
  });
  if(replaceDish&&replaceAmount!==undefined){
    present=true;
    total+=Math.max(0,Number(replaceAmount)||0);
  }
  return {total,present};
}
function cumulativeQuantityFor(name,dish=currentDish(),count=servings()){
  const need=needFor(name,dish,count);
  const aggregate=aggregateContribution(name,dish,need===null?0:need);
  return quantityForNeed(name,aggregate.total,aggregate.present);
}
function storedCumulativeQuantity(name){
  const aggregate=aggregateContribution(name);
  return quantityForNeed(name,aggregate.total,aggregate.present);
}
function reconcileDishContributions(){
  const service=window.COURSES_LIST;
  // Tant que Ma liste affiche son chargement, Home Assistant n'est pas encore une source fiable.
  if(!shoppingList||shoppingList.querySelector('.empty .spinner')||typeof service?.getQuantity!=='function')return false;
  const names=new Set();
  Object.values(dishContributions).forEach(values=>Object.keys(values||{}).forEach(name=>names.add(name)));
  if(!names.size)return false;
  let changed=false;
  names.forEach(name=>{
    const expected=storedCumulativeQuantity(name);
    const current=Math.max(0,Number(service.getQuantity(name))||0);
    if(current>=expected)return;
    Object.keys(dishContributions).forEach(dish=>{
      const values=dishContributions[dish];
      if(!Object.prototype.hasOwnProperty.call(values,name))return;
      delete values[name];
      changed=true;
      if(!Object.keys(values).length)delete dishContributions[dish];
    });
  });
  if(changed)persistDishContributions();
  return changed;
}
function setRecipeNeeds(dish,values){
  const dishName=String(dish||'').trim();
  if(!dishName)return false;
  const clean={};
  Object.entries(values||{}).forEach(([name,value])=>{
    if(!PRODUCT_META.has(name))return;
    const amount=Number(value);
    if(!Number.isFinite(amount)||amount<=0)return;
    const rounded=Math.round(amount*100)/100;
    const base=baseNeedFor(name,dishName,BASE_SERVINGS);
    if(base!==null&&Math.abs(base-rounded)<0.001)return;
    clean[name]=rounded;
  });
  if(Object.keys(clean).length)recipeNeedOverrides[dishName]=clean;
  else delete recipeNeedOverrides[dishName];
  persistRecipeNeedOverrides();
  if(currentDish()===dishName)decorateDishRows();
  return true;
}
function resetRecipeNeeds(dish){
  const dishName=String(dish||'').trim();
  if(!dishName)return false;
  delete recipeNeedOverrides[dishName];
  persistRecipeNeedOverrides();
  if(currentDish()===dishName)decorateDishRows();
  return true;
}
function hasRecipeNeeds(dish){
  return Boolean(Object.keys(recipeNeedOverrides[String(dish||'')]||{}).length);
}
function formatNumber(value){
  return Number.isInteger(value)?String(value):String(Math.round(value*10)/10).replace('.',',');
}
function formatNeed(name,need){
  if(!(Number.isFinite(need)&&need>0))return '';
  const unit=recipeUnitFor(name);
  if(unit==='piece'){
    const rounded=Math.max(0.25,Math.round(need*4)/4);
    return formatNumber(rounded)+' '+(rounded>1?'pièces':'pièce');
  }
  if(unit==='ml'){
    if(need>=1000)return formatNumber(need/1000)+' L';
    if(need%10===0)return formatNumber(need/10)+' cl';
    return formatNumber(need)+' ml';
  }
  if(need>=1000)return formatNumber(need/1000)+' kg';
  return formatNumber(need)+' g';
}
function measuredQuantity(name,count){
  const step=variablePurchaseStepFor(name);
  const value=Math.max(0,Number(count)||0);
  return step&&value>0?formatNeed(name,value*step.amount):'';
}
function ensureStyles(){
  if(document.getElementById('courses-product-quantities-style'))return;
  const style=document.createElement('style');
  style.id='courses-product-quantities-style';
  style.textContent=`
    #products .product .product-pack-badge{
      position:absolute!important;
      z-index:2!important;
      top:6px!important;
      left:6px!important;
      height:17px!important;
      max-width:45px!important;
      padding:0 5px!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      border:1px solid rgba(27,49,35,.08)!important;
      border-radius:999px!important;
      background:rgba(248,250,246,.92)!important;
      color:#5f6e66!important;
      box-shadow:0 2px 7px rgba(46,64,52,.08)!important;
      font-size:8px!important;
      line-height:1!important;
      font-weight:780!important;
      letter-spacing:-.08px!important;
      white-space:nowrap!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
      pointer-events:none!important;
    }
    #products .product.is-selected .product-pack-badge{
      background:rgba(255,255,255,.82)!important;
      color:#365447!important;
    }
    #products .product .pcat{display:block!important}
    #dishDialog .dish-ingredient-name{display:flex!important;flex-direction:column!important;gap:2px!important}
    #dishDialog .dish-ingredient-pack{display:block!important;color:#718078!important;font-size:10.5px!important;line-height:1.05!important;font-weight:720!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    #dishDialog .dish-ingredient-check{font-size:12px!important;letter-spacing:-.2px!important}
    #listItems .list-qty.is-measured-count{display:none!important}
    #listItems .list-measured-quantity{display:block!important;color:#718078!important;font-size:11px!important;line-height:1.15!important;font-weight:720!important;white-space:nowrap!important}
  `;
  document.head.appendChild(style);
}
function decorateProducts(){
  if(!products)return;
  products.querySelectorAll('.product[data-name]').forEach(card=>{
    const name=String(card.dataset.name||'');
    const variableStep=variablePurchaseStepFor(name);
    const quantity=Math.max(0,Number(card.dataset.quantity)||0);
    const meta=PRODUCT_META.get(name);
    const detail=card.querySelector('.pcat');
    const subcategory=String(meta?.sub||meta?.category||'');
    if(detail){
      if(detail.textContent!==subcategory)detail.textContent=subcategory;
      detail.hidden=!subcategory;
      delete detail.dataset.packReference;
      if(subcategory)detail.title=subcategory;
      else detail.removeAttribute('title');
    }
    let reference=card.querySelector('.product-pack-badge');
    if(!reference){
      reference=document.createElement('span');
      reference.className='product-pack-badge';
      card.appendChild(reference);
    }
    const measured=variableStep&&quantity>0?measuredQuantity(name,quantity):'';
    const referenceText=measured||purchaseLabel(name);
    if(reference.textContent!==referenceText)reference.textContent=referenceText;
    reference.title=measured?'Quantité dans Ma liste : '+measured:'Mode d’achat : '+purchaseLabel(name);
  });
}
function decorateShoppingList(){
  if(!shoppingList)return;
  reconcileDishContributions();
  shoppingList.querySelectorAll('.list-row[data-name]').forEach(row=>{
    const name=String(row.dataset.name||'');
    const step=variablePurchaseStepFor(name);
    const countBadge=row.querySelector('.list-qty');
    let measured=row.querySelector('.list-measured-quantity');
    if(!step){
      countBadge?.classList.remove('is-measured-count');
      measured?.remove();
      return;
    }
    const match=String(countBadge?.textContent||'').match(/(\d+)/);
    const count=match?Math.max(1,Number(match[1])||1):1;
    const text=measuredQuantity(name,count);
    const copy=row.querySelector('.list-copy');
    if(!copy||!text)return;
    if(!measured){
      measured=document.createElement('small');
      measured.className='list-measured-quantity';
      copy.appendChild(measured);
    }
    if(measured.textContent!==text)measured.textContent=text;
    countBadge?.classList.add('is-measured-count');
  });
}
function decorateDishRows(){
  if(!dialog?.open||!list)return;
  reconcileDishContributions();
  list.querySelectorAll('.dish-ingredient[data-ingredient]').forEach(row=>{
    const name=String(row.dataset.ingredient||'');
    const purchaseReference=purchaseReferenceFor(name);
    const variableStep=variablePurchaseStepFor(name);
    const need=needFor(name);
    const quantity=quantityFor(name);
    row.dataset.recipeQuantity=String(cumulativeQuantityFor(name));
    row.dataset.dishQuantity=String(quantity);
    const label=row.querySelector('.dish-ingredient-name');
    if(label){
      let reference=label.querySelector('.dish-ingredient-pack');
      const text=purchaseReference?purchaseLabel(name):(need!==null?'Besoin : '+formatNeed(name,need):'');
      if(text){
        if(!reference){
          reference=document.createElement('small');
          reference.className='dish-ingredient-pack';
          label.appendChild(reference);
        }
        reference.textContent=text;
      }else{
        reference?.remove();
      }
    }
    const badge=row.querySelector('.dish-ingredient-check');
    if(badge){
      if(purchaseReference){
        badge.textContent='×'+quantity;
        badge.setAttribute('aria-label',quantity+' '+purchaseLabel(name)+(quantity>1?'s':'')+' à acheter pour ce plat');
      }else if(variableStep&&need!==null){
        const purchaseAmount=measuredQuantity(name,quantity);
        badge.textContent='×'+quantity;
        badge.setAttribute('aria-label',purchaseAmount+' à acheter pour un besoin de '+formatNeed(name,need));
      }else{
        badge.textContent='1';
        badge.setAttribute('aria-label','1 article à ajouter');
      }
    }
  });
  document.dispatchEvent(new CustomEvent('courses:dish-quantities-updated',{detail:{dish:currentDish()}}));
}
function scheduleProductRefresh(){
  if(productFrame)return;
  productFrame=requestAnimationFrame(()=>{productFrame=0;decorateProducts()});
}
function scheduleShoppingListRefresh(){
  if(shoppingListFrame)return;
  shoppingListFrame=requestAnimationFrame(()=>{shoppingListFrame=0;decorateShoppingList()});
}
function scheduleDishRefresh(){
  if(dishFrame)return;
  queueMicrotask(()=>{
    if(dishFrame)return;
    dishFrame=requestAnimationFrame(()=>{dishFrame=0;decorateDishRows()});
  });
}
function bindUiEvents(){
  if(eventsBound)return;
  eventsBound=true;
  document.addEventListener('courses:products-updated',scheduleProductRefresh);
  document.addEventListener('courses:list-rendered',scheduleShoppingListRefresh);
  document.addEventListener('courses:list-changed',()=>{
    scheduleShoppingListRefresh();
    scheduleDishRefresh();
  });
  document.addEventListener('courses:dish-ingredients-rendered',scheduleDishRefresh);
}
function setServings(value){
  const input=dialog?.querySelector('.dish-servings-value');
  if(!input)return false;
  const next=Math.max(1,Math.min(12,Math.round(Number(value)||BASE_SERVINGS)));
  input.value=String(next);
  try{localStorage.setItem(STORAGE_SERVINGS,String(next))}catch(_){}
  decorateDishRows();
  return true;
}
function buildServingsControl(){
  const head=dialog?.querySelector('.dish-sheet-head');
  if(!head||head.querySelector('.dish-servings'))return;
  const block=document.createElement('div');
  block.className='dish-servings';
  block.innerHTML='<strong>Nombre de personnes</strong><div class="dish-servings-control"><button type="button" class="dish-servings-step" data-step="-1" aria-label="Retirer une personne">−</button><input class="dish-servings-value" type="number" inputmode="numeric" min="1" max="12" step="1" aria-label="Nombre de personnes"><button type="button" class="dish-servings-step" data-step="1" aria-label="Ajouter une personne">+</button></div>';
  head.appendChild(block);
  const input=block.querySelector('input');
  let saved=BASE_SERVINGS;
  try{saved=localStorage.getItem(STORAGE_SERVINGS)||BASE_SERVINGS}catch(_){}
  setServings(saved);
  block.querySelectorAll('.dish-servings-step').forEach(button=>button.addEventListener('click',()=>{
    setServings(servings()+Number(button.dataset.step||0));
    navigator.vibrate?.(4);
  }));
  input.addEventListener('input',()=>{
    const value=Number(input.value);
    if(Number.isFinite(value)&&value>=1&&value<=12)setServings(value);
  });
  input.addEventListener('change',()=>setServings(input.value));
  input.addEventListener('blur',()=>setServings(input.value));
}
async function addSelectedQuantities(){
  if(pending)throw new Error('Ajout déjà en cours');
  if(!dialog||!list)throw new Error('Fiche du plat indisponible');
  reconcileDishContributions();
  const dishName=currentDish();
  const count=servings();
  if(!dishName)throw new Error('Plat indisponible');
  const rows=[...list.querySelectorAll('.dish-ingredient.is-selected[data-ingredient]')];
  const previous=dishContributions[dishName]||{};
  const proposed={};
  rows.forEach(row=>{
    const name=String(row.dataset.ingredient||'');
    if(!name)return;
    const need=needFor(name,dishName,count);
    proposed[name]=need===null?0:Math.round(need*100)/100;
  });
  const result={added:0,failed:0,present:0};
  const accepted={};
  pending=true;
  try{
    for(const [name,amount] of Object.entries(proposed)){
      const target=quantityForNeed(name,aggregateContribution(name,dishName,amount).total,true);
      const current=Math.max(0,Number(window.COURSES_LIST.getQuantity?.(name))||0);
      let item;
      if(current>=target)item={added:0,failed:0,present:1};
      else item=await window.COURSES_LIST.ensureQuantity(name,target);
      result.added+=Number(item?.added)||0;
      result.failed+=Number(item?.failed)||0;
      result.present+=Number(item?.present)||0;
      if(Number(item?.failed||0)===0)accepted[name]=amount;
      else if(Object.prototype.hasOwnProperty.call(previous,name))accepted[name]=previous[name];
    }
    if(Object.keys(accepted).length)dishContributions[dishName]=accepted;
    else delete dishContributions[dishName];
    persistDishContributions();
    decorateDishRows();
    return result;
  }finally{pending=false}
}
window.COURSES_QUANTITIES=Object.freeze({
  getQuantity:(dish,name,count)=>quantityFor(name,dish,count),
  getCumulativeQuantity:(dish,name,count)=>cumulativeQuantityFor(name,dish,count),
  getNeed:(dish,name,count)=>needFor(name,dish,count),
  getBaseNeed:(dish,name,count)=>baseNeedFor(name,dish,count),
  getRecipeUnit:recipeUnitFor,
  hasRecipeNeeds,
  setRecipeNeeds,
  resetRecipeNeeds,
  getPurchaseLabel:purchaseLabel,
  addSelected:addSelectedQuantities,
  setServings,
  bind
});
function bind(){
  dialog=document.getElementById('dishDialog');
  list=dialog?.querySelector('.dish-sheet-list');
  products=document.getElementById('products');
  shoppingList=document.getElementById('listItems');
  if(!dialog||!list||!products||!shoppingList)return false;
  auditPurchaseModes();
  ensureStyles();
  buildServingsControl();
  decorateProducts();
  decorateShoppingList();
  decorateDishRows();
  bindUiEvents();

  document.dispatchEvent(new CustomEvent('courses:quantities-ready'));
  return true;
}
})();