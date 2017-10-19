'use strict'

var fs=require('fs'); //Création modele de donnée
var CONFIG = require("../../config.json");
var utils = require("../utils/utils.js");
process.env.CONFIG = JSON.stringify(CONFIG);
module.exports = ContentModel;

function ContentModel(content){
  

        //attributs type: public - ['img', 'img_url', 'video', 'web'] id: public - UUID title: public src: public - l'URL qui permet d'acceder au contenu fileName: public - le nom du fichier stocké dans [CONFIG.contentDirectory] dans le cas d'un contenu de type 'img'. Il correspond a l'id du contenu + l'extension qui sera récupérée à partir du fichier original (png, jpeg...). data: privé - accessible par getData() et setData()
        //constructeur: Le constructeur prend en paramètre un objet ContentModel et alimente l'objet en cours avec les données du paramètre.
        this.id=(!!content && !!content.id) ? content.id : null;
        this.type=(!!content && !!content.type) ? content.type : null;
        this.title=(!!content && !!content.title) ? content.title : null;
        this.src=(!!content && !!content.src) ? content.src : null;
        this.fileName=(!!content && !!content.fileName) ? content.fileName : null;
        var data=(!!content && !!content.data) ? content.data : null;

        this.setData= function(data){
            if(!!content&&!!content.data)
                this.data=data;
        }
        this.getData= function(){
            return this.data;
        }
    }
       //create(content, callback): Prend un objet contentModel en paramètre, stocke le contenu de [content.data] dans le fichier [content.fileName] (dans le cas d'un contenu de type 'img') et stocke les meta-données dans un fichier [contentModel.id].meta.json dans le répertoire [CONFIG.contentDirectory].

    ContentModel.create= function(content,cb){
        if(content!=null  && content.id!=null && typeof(content)==typeof(new ContentModel()))
        {

            if(content.type=='img')
            {
            fs.writeFile(utils.getDataFilePath(content.fileName),content.getData(),"UTF-8",function(err){
                    if(!!err)
                    {
                        console.error(err);
                        return cb(err);

                    }   
                    fs.writeFile(utils.getMetaFilePath(content.id),JSON.stringify(content),"UTF-8",function(err){
                        if(!!err)
                        {
                            console.error(err);
                            return cb(err);
                        }   
                        cb(null);
                    });
                });
            }
            else
            {
                fs.writeFile(utils.getMetaFilePath(content.id),JSON.stringify(content),"UTF-8",function(err){
                    if(!!err)
                    {
                        console.error(err);
                        return cb(err);
                    }   
                    cb(null);
                });
            }
            
        }
        else
            return cb(new Error('Content is not normalized!'));
        
        
        
    }
    //read(id, callback): Prend un id en paramètre et retourne l'objet contentModel lu depuis le fichier [content.id].meta.json
    ContentModel.read= function(id,cb){
            utils.readFileIfExists(utils.getMetaFilePath(id),function(err,data){
            if(!!err)
            {
                console.error(err);
                return cb(err);
            }
            var parsed = JSON.parse(data);
            var content = new ContentModel(parsed);
            cb(null,content);
            });

        

    }

//update(content, callback): Prend l'id d'un ContentModel en paramètre et met à jour le fichier de metadata ([content.id].meta.json) et le fichier [content.fileName] si [content.data] est renseigné (non nul avec une taille > 0).
ContentModel.update=function(content,callback)
{
// met à jour [content.fileName] si [content.data] est renseigné (non nul avec une taille > 0) et met à jour le fichier de metadata ([content.id].meta.json) 
        if(content.id==null )
        {
            return callback(new Error('Content.id is null'));
        }
        
        utils.fileExists(utils.getMetaFilePath(content.id), function(err) {
            if (err) {
                callback(err);
            } else {
                ContentModel.create(content,function(err){
                    console.error(err);
                    return callback(err);
                });
                callback(null);
            }
        });
    
}
//delete(id, callback): supprime les fichiers data ([content.src]) et metadata ([content.id].meta.json)
ContentModel.delete= function(id,callback){
    ContentModel.read(id,function(err,content){
        if(content.type=="img")
        {
        fs.unlink(utils.getDataFilePath(content.fileName),function(err){
            if(!!err)
            {
                console.error(err);
                return callback(err);
            }
            fs.unlink(utils.getMetaFilePath(id),function(err){
                if(!!err)
                {
                    console.error(err);
                    return callback(err);
                }  
                    callback(null);
                }); 
        }); 
        }
        else{
            fs.unlink(utils.getMetaFilePath(id),function(err){
                if(!!err)
                {
                  console.error(err);
                  return callback(err);
                }  
                    callback(null);
                }); 
        }
        
    });
        

}
