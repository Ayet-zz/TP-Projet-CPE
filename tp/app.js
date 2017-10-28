'use strict';
// app.js
var fs=require('fs'); //initialisation fs
var express=require("express"); //initialisation de js
var path = require ("path");
var http=require ("http");//initialisation du serveur web
var CONFIG = require("./config.json");
var app=express();
var defaultRoute = require("./app/routes/default.route.js");
var contentRoute = require("./app/routes/content.route.js");
var bodyParser = require('body-parser');
var IOController = require("./app/controllers/io.controller.js");
process.env.CONFIG = JSON.stringify(CONFIG);
var server = http.createServer(app);// Creation du serveur web

//socket
IOController.listen(server);

//Body parser
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Route par défault
app.use(defaultRoute);

// Route content.router.js
app.use(contentRoute);


// Welcome on index.html

app.use("/index", express.static(path.join(__dirname, "public")));
// Redirection vers le dossier admin et watch
app.use("/admin", express.static(path.join(__dirname, "public\\admin\\"))); 
app.use("/watch", express.static(path.join(__dirname, "public\\watch\\"))); 

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
					maMap[cle]=parsed;
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


/*,function(){
	var host = this.adress().address;
	var port = this.adress().port;
	console.log(" Serveur ecoute à l'adresse \""+host+":"+port+"\"");
})*/

server.listen(CONFIG.port, function() {
	console.log("Running...")
}); // listen on config