'use strict';
var fs=require('fs'); //initialisation fs
var express=require("express"); //initialisation de js
var path = require ("path");
var http=require ("http");//initialisation du serveur web
var CONFIG = require("./config.json");
var app=express();
var defaultRoute = require("./app/routes/default.route.js");
var contentRoute = require("./app/routes/content.route.js");
var bodyParser = require('body-parser');
process.env.CONFIG = JSON.stringify(CONFIG);
var server = http.createServer(app);// Creation du serveur web
server.listen(CONFIG.port); // listen on config

/*,function(){
	var host = this.adress().address;
	var port = this.adress().port;
	console.log(" Serveur ecoute à l'adresse \""+host+":"+port+"\"");
})*/
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());
// Route par défault
app.use(defaultRoute);

// Route content.router.js
app.use(contentRoute);


// Welcome on index.html

app.use("/index.html", express.static(path.join(__dirname, "public")));


//creation de loadpres, lis dans le repertoire les differentes .json, et renvoye et rassemble sous forme d'une map json
app.use("/loadPres",function(request, response,cb) {
	
	var directory= CONFIG.presentationDirectory;
	var maMap= new Map();
	fs.readdir(directory,function(err,files)
	{
		var longueur=files.length;
		if(!!err){
			cb(err);
			console.error(err);
			return;
		}
		var i=0;	
		files.forEach(function(file){	
			var fileext=path.extname(file);
			if(fileext==".json")
			{
				fs.readFile((directory+"/"+file),function(err,data){
					if(!!err)
					{	
						cb(err);
						console.error(err);
						return;
					}
					var parsed = JSON.parse(data);
					var cle= parsed.id;
					var valeur=parsed.slidArray;
					maMap[cle]=valeur;
					i=i+1;
					if(longueur==i)
						{
							response.send(maMap);
							cb(null,maMap);
						}
				});
			}
			else{i=i+1;}
		});
	});

});

//creation de savePres enregistre un nouvelle pres en .json
app.use("/savePres",function(request, response,cb) {
	
	var directory= CONFIG.presentationDirectory;
	request.on('data',function(chunk){
	var textfile=JSON.parse(chunk);
	fs.writeFile(directory+'/'+textfile.id+".pres.json",JSON.stringify(textfile),"UTF-8",function(err){
		if(!!err)
		{
			cb(err);
			console.error(err);
			return;
		}
		cb(null);
	});

	});

});

app.use(function(req, res){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable !');
});
//socket
//var IOController = requier("./app/controllers/io.controller.js");
//var server = 3333;
//IOController.listen(server);
