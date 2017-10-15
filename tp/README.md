# TP NodeJS step-by-step

**TOUS LES FICHIERS JAVASCRIPT (_*.js_) DOIVENT COMMENCER PAR `'use strict';`**

1. Créer l'arborescence suivante

	```
		- tp
		|	\- public
		|	|
		|	+- app
		|	|	\- controllers
		|	|	+- models
		|	|	+- routes
		|	|	+- utils
		|	|	|	\- utils.js
		|	+- presentation_content
		|	+- uploads
		|	+- app.js
		|	+- config.json
	```

2. Initialiser le projet avec npm. Le main de l'application va s'appeler _app.js_.

	```console
	npm init
	```

3. Installer express comme dépendance et l'ajouter au fichier package.json

	```console
	npm install express --save
	```

4. Modifier le fichier _package.json_ pour rendre privée l'application et ajouter un script de démarrage

	```javascript
	// package.json
	[...]
	"scripts": {
		"test": "node testContentModel.js",
		"start": "node app.js"
	},
	"private": true,
	[...]
	```

5. Créer le fichier _app.js_ et ajouter un `console.log('It Works !')`. Démarrer votre application avec npm.

	```console
	npm start
	```
	
	#### Point de validation 1

6. Initialiser express

	```javascript
	// app.js
	var express = require("express");
	[...]
	var app = express();
	```

7. Créer le fichier _config.json_ à la racine du projet, et l'alimenter avec le port d'écoute du serveur.

	```javascript
	// config.json
	{
		"port": 1337
	}
	```

8. Initialiser votre serveur web en utilisant express et la bibliothèque http de NodeJS. Récupérer le port d'écoute depuis le fichier de configuration _config.json_.

	```javascript
	// app.js
	var http = require("http");
	var CONFIG = require("./config.json");
	[...]
	// init server
	var server = http.createServer(app);
	server.listen(CONFIG.port);
	```

	- Pour que la configuration soit accessible par tous les modules pour la suite, déclarer une variable `CONFIG` dans `process.env` et injecter la configuration en JSON "stringifier" comme ceci

	```javascript
	// app.js
	var CONFIG = require("./config.json");
	process.env.CONFIG = JSON.stringify(CONFIG);
	```

	- Ainsi, dans les autres modules, l'accès à la configuration sera faite comme cela

	```javascript
	var CONFIG = JSON.parse(process.env.CONFIG);
	```

9. Faire en sorte que la route _"/"_ réponde _"It works"_.
	- La "meilleure" façon de faire une route est de créer un router (`express.Router()`) dans un nouveau fichier (_default.route.js_) dans le répertoire _route_. Ce fichier se compose comme ceci:

	```javascript
	// default.route.js
	var express = require("express");
	var router = express.Router();
	module.exports = router;
	
	// Routing using
	/*
	router.route(__PATH__)
		.get()
		.post()
		.put()
		.delete()
		.all()
		.[...]
	*/
	```

	- Dans _app.js_, on importe la nouvelle route et on l'utilise avec `app.use(myRoute)`. On peut également passer comme premier argument le chemin d'accès de la route (`app.use([URI], myRoute)`). Dans ce cas, les chemins indiqués dans le routeur sont alors relatifs.

	```javascript
	// app.js
	var defaultRoute = require("./app/routes/default.route.js");
	[...]
	app.use(defaultRoute);
	```

	- Pour des routes simples, on peut aussi les gérer directement dans _app.js_.

	```javascript
	// #2
	app.get("/", function(request, response) {
		response.send("It works !");
	});

	// #3
	app.use(function(request, response, cb) {
		response.send("It works !");
		cb();
	});
	```

10. Récupérer les projets Angular et les déposer dans _public/_.

	```
	- tp
	|	\- public
	|	|	\- admin
	|	|	|	\- [...]
	|	|	+- watch
	|	|	|	\- [...]
	```

11. Créer les routes statiques pour les pages _admin_ et _watch_ directement dans _app.js_. Utiliser la méthode `express.static`.

	```javascript
	// app.js
	var path = require("path");
	[...]
	app.use("/admin", express.static(path.join(__dirname, "public/admin")));
	app.use("/watch", express.static(path.join(__dirname, "public/watch")));
	```

	#### Point de validation 2

12. Mettre à jour le fichier _config.json_ en ajoutant les paramètres suivants:
	- **_contentDirectory_**: chemin d'accès absolu vers le répertoire _uploads_. Ce répertoire contiendra les fichiers de données et de métadonnées associées à ces fichiers. Les métadonnées seront stockées en JSON.
	- **_presentationDirectory_**: chemin d'accès absolu vers le répertoire _presentation\_content_. Ce répertoire contiendra les métadonnées de présentation au format JSON.

13. Créer les services _"/loadPres"_ et _"/savePres"_.
	Ces 2 services seront créés directement dans app.js (Cf #9.3).
	
	13.1. Le service "_/loadPres_".
		Ce service doit envoyer la liste de toutes les présentations présentes dans le répertoire _CONFIG.presentationDirectory_.
		Pour ce service, on lit le contenu de tous les fichiers `*.json` de présentation contenus dans _CONFIG.presentationDirectory_, on parse le contenu des fichiers pour extraire les données et on retourne un objet JSON au format "clé-valeur". La clé est l'ID de la présentation et la valeur est l'objet retourné par le parseur JSON.

	```javascript
	{
		"pres1.id": [Object_Pres1],
		"pres2.id": [Object_Pres2],
		"pres3.id": [Object_Pres3]
		...
	}
	```

	13.2. Le service "_/savePres_".
		Pour ce service, on récupère des données au format JSON et on les enregistre dans le répertoire _CONFIG.presentationDirectory_ dans un fichier qui doit s'appeler _[pres.id].pres.json_. L'ID est a récuperer dans les données reçues.

	#### Point de validation 3

14. Créer le modele de donnée pour le contenu des slides.
	- Créer le fichier _content.model.js_ dans _app/models/_.
	- Ce fichier va contenir la "classe" **_ContentModel_** avec la définition suivante:
		- **_attributs_**
			- **type**: public - ['img', 'img_url', 'video', 'web']
			- **id**: public - UUID
			- **title**: public
			- **src**: public - l'URL qui permet d'acceder au contenu
			- **fileName**: public - le nom du fichier stocké dans _[CONFIG.contentDirectory]_ dans le cas d'un contenu de type 'img'.
			Il correspond a l'id du contenu + l'extension qui sera récupérée à partir du fichier original (png, jpeg...).
			- **data**: privé - accessible par getData() et setData()

		- **_méthodes_: /!\ Toutes ces méthodes doivent être statiques**
			- **create(content, callback)**:
			Prend un objet _contentModel_ en paramètre, stocke le contenu de _[content.data]_ dans le fichier _[content.fileName]_ (dans le cas d'un contenu de type 'img') et stocke les meta-données dans un fichier _[contentModel.id].meta.json_ dans le répertoire _[CONFIG.contentDirectory]_.
			- **read(id, callback)**:
			Prend un id en paramètre et retourne l'objet _contentModel_ lu depuis le fichier _[content.id].meta.json_
			- **update(content, callback)**:
			Prend l'id d'un _ContentModel_ en paramètre et met à jour le fichier de metadata (_[content.id].meta.json_) et le fichier _[content.fileName]_ si _[content.data]_ est renseigné (non nul avec une taille > 0).
			- **delete(id, callback)**:
			supprime les fichiers data (_[content.src]_) et metadata (_[content.id].meta.json_)

		- **_constructeur_**: Le constructeur prend en paramètre un objet _ContentModel_ et alimente l'objet en cours avec les données du paramètre.

	- Lancer les tests unitaires via la commande `npm test`. La commande doit se terminer par un `=== FIN TESTS ===`.

	#### Point de validation 4

15. Créer le router pour exposer les web services REST d'accès au contenu (_content.router.js_). De manière générale, les routeurs ne comportent pas de métier, ils se contentent d'appeler le controleur avec les bons paramètres.
	Ajouter ce router à _app.js_ (comme pour le _default.route.js_).

	>	#### Tuto
	>	
	>	Pour avoir des WS RESTful, on utilise les verbes HTTP (GET, POST, PUT, DELETE) pour déterminer quel action doit être effectuée et les URI doivent permettre d'identifier directement sur quel ressource on doit effectuer l'action.
	>	Par exemple, une adresse possible pour accéder à un annuaire est: `http://MyService/users/1`.
	>	L'URI est donc de la forme `Protocol://ServiceName/ResourceType/ResourceID`.
	>
	>	Le routeur peut s'articuler ainsi pour une ressource `users`:
	>
	>	```javascript
	>	// user.route.js
	>	"use strict";
	>
	>	var express = require("express");
	>	var router = express.Router();
	>	module.exports = router;
	>
	>	var userController = require('./../controllers/user.controllers');
	>
	>    router.route('/users')
	>      .get(userController.list)
	>      .post(userController.token, userController.create);
	>
	>    router.route('/users/:userId')
	>      .get(userController.read)
	>      .put(userController.update)
	>      .delete(userController.delete);
	>
	>    router.param('userId', function(req, res, next, id) {
	>    	req.userId = id;
	>    	next();
	>    });
	>	```

	Dans notre cas, le routeur doit fonctionner ainsi:

	- "/contents" + GET => retourne la liste des métadonnées de contenu de slides disponibles sur le serveur (_[content.id].meta.json_)
	- "/contents" + POST => crée un nouveau contenu à partir du formulaire d'ajout de contenu ('file', 'title', 'type', 'src')
	- "/contents/[content.id]" + GET => retourne le contenu avec l'ID correspondant.


	Pour pouvoir faire un upload de fichiers sur le serveur (dans le cas d'un POST avec un contenu de type 'img'), on ajoute le module ***multer*** au projet.

	```javascript
	// content.route.js
	var multer = require("multer");
	var express = require("express");
	var router = express.Router();
	module.exports = router;

	var multerMiddleware = multer({ "dest": "/tmp/" });

	router.post("/contents", multerMiddleware.single("file"), function(request, response) {
		console.log(request.file.path); // The full path to the uploaded file
		console.log(request.file.originalname); // Name of the file on the user's computer
		console.log(request.file.mimetype); // Mime type of the file
	});
	```

	#### Point de validation 5

16. Créer le controleur (_content.controller.js_) pour faire le lien entre le routeur et le modèle.
	Le controleur va donc avoir les fonctions suivantes:

	- **list**: liste les fichiers de contenu du répertoire _[CONFIG.contentDirectory]_ et retourne le résultat sous la forme un objet JSON au format "clé-valeur". La clé est l'ID du contenu (_ContentModel.id_) et la valeur est l'objet _ContentModel_ au format JSON.
	```
	{
		_ContentModel[1].id_ : _ContentModel[1]_,
		_ContentModel[2].id_ : _ContentModel[2]_,
		...
	}
	```
	- **create**: récupère les paramètres de requète pour créer un objet _ContentModel_ et le stocker via la méthode statique du modèle.
	- **read**: Lit le contenu dont l'id est passé en paramètre et:
		- soit retourne l'url d'accés aux données (_ContentModel.src_) dans le cas où les données sont hébergés sur le serveur (c'est-à-dire dans le cas où le type de contenu est 'img')
		- soit effectue une redirection dans le cas où les données ne sont pas stockées sur le serveur.
		- soit retiourne les metadatas (le _ContentModel_ au format JSON) si on passe en paramètre `json=true` dans l'URL.

	#### Point de validation 6

17. Créer le serveur de websocket et gérer les évènements.
	- Installer la bibliothèque `socket.io` via npm (et l'ajouter au _package.json_). Cette librairie permet de créer des websockets avec NodeJS.
	- Créer un nouveau controleur (_io.controller.js_). Les évènements des websockets seront gérés dans ce controleur. Il expose une fonction _listen(httpServer)_ et prend en paramètre une instance de serveur HTTP de NodeJS.

	```javascript
	// app.js
	var IOController = require("./app/controllers/io.controller.js");
	[...]
	IOController.listen(server);
	```

	- Emettre l'évenement "_connection_" sur la nouvelle socket quand une nouvelle connexion est ouverte sur le serveur de websocket

	- Ecouter l'évènement "_data\_comm_" et enregistrer la socket dans une map, avec en clé l'id du client (qui est fourni dans le message).

	- Ecouter l'évenement "_slidEvent_". Le message que nous fourni cet évènemment est un objet JSON qui contient la commande de la présentation et l'id de la présentation

	```javascript
	{
		"CMD": [START | PAUSE | END | BEGIN | PREV | NEXT ],
		"PRES_ID": [pres.id] // Seulement pour la commande START
	}
	```

	Pour les commandes START, END, BEGIN, PREV et NEXT, on récupère et on envoie les métadonnées du contenu de la slide que l'on doit diffuser à toutes les sockets connectées (penser à passer par _ContentModel_ pour lire les métadonnées).
	En plus des données présentes dans le fichier de métadonnée de la slide, on ajoute un attribut "src" qui contient l'url pour accéder directement aux données.

	```javascript
	// io.controller.js
	[...]
	ContentModel.read(..., function (err, content) {
		[...]
		content.src = "/contents/" + content.id;
		[...]
	})
	[...]

	```
	
	#### Point de validation 7

18. Gérer les évènements côté clients en utilisant un controleur dédié.
	- Récupérer la bibliothèque _socket.io_ côté client, en insérant la balise HTML suivante:
	```html
	<script type="text/javascript" src="/socket.io/socket.io.js"></script>
	```

	- Initialiser la connexion au serveur de websocket dans le controleur et récupérer la socket sur laquelle on doit gérer les évènements.
	```javascript
	var socket = io.connect();
	```

	- Ecouter l'évènement _connection_. Lorsqu'il est détecté, émettre l'évènement _data\_com_ avec comme message l'id de la socket. Cet étape doit être faite sur les pages _/admin_ et _/watch_.

	- Côté _/admin_, émettre un évènement _slidEvent_ avec la commande associée (START, END, PAUSE, NEXT...) en fonction des actions sur les boutons de commande de la présentation. Pour la commande START, ne pas oublier d'ajouter le _PRES\_ID_ dans le message JSON.

	- Côté _/watch_, écouter l'évènement _currentSlidEvent_ et mettre à jour l'affichage en utilisant les données reçus.

	#### Point de validation 8

19. Quelques idées pour aller plus loin...
	- Créer un webservice pour créer les UUID systématiquement côté serveur et supprimer la fonction _generateUUID()_ côté client.

	- Créer un modèle de données pour les présentations et passer les webservices en RESTful.

	- Permettre la diffusion de plusieurs présentation en même temps. Côté admin, en listant les présentations disponibles et en permettant de sélectionner celle que l'on veut diffuser. Côté serveur, en créant des URL de _/watch_ différentes en fonction des présentations diffusées (par exemple, _/watch/[PRES\_ID]_). On pourra utiliser les "rooms" de socket.io pour compartimenter les présentations et pouvoir faire des broadcasts par "room".
