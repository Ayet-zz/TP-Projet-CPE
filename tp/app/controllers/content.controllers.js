'use strict';
// content.controller.js

var fs = require("fs");
var utils = require("../utils/utils.js");
var CONFIG = require('../../config.json');
process.env.CONFIG = JSON.stringify(CONFIG);
var contentModel = require('../models/content.model.js');

module.exports = ContentController;

function ContentController(){

}

ContentController.create= function(request,response){
    var content = new contentModel(request.body);
    content.id = utils.generateUUID();
    if(content.fileName!=null)
        content.fileName=utils.getNewFileName(content.id,request.file.originalname);
    contentModel.create(content,function(err,data){
        if(!!err)
        {
            console.error(err);
            return;
        }
        response.end();
    });
}
ContentController.list= function(request,response){
    var maMap= new Map();
    var i=0;
    fs.readdir(CONFIG.contentDirectory, function(err, files){
        if(!!err){
            console.error(err);
            return;
        }
        files=files.filter(utils.filterJson);
        files.forEach(function(file){
            var nom= file.split('.');
                nom.pop();
                nom.pop();  

                contentModel.read(nom[0],function(err,data){
                    if(!!err){
                        console.error(err);
                        return;
                    }
                    maMap[nom]=data;
                    i=i+1;
                    if(files.length==i)
                    {
                       response.send(JSON.stringify(maMap));
                    }
                    
                });
        
        });
    
    });
}

ContentController.read= function(request,response){
    var id = request.params.contentId;
    contentModel.read(id,function(err,data){
        if(!!err)
        {
            console.error(err);
            return;
        }
        if(request.param("json")=="true")
        {
            response.end(JSON.stringify(data));
        }
        if(data.type=="video")
        {
           response.redirect(data.src);

        }
        if(data.type=="img")
        {
           response.sendfile(utils.getDataFilePath(data.fileName));

        }
    });
    }