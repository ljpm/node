var express = require("express");
var Imagen = require("./models/imagenes").Imagen;
var router = express.Router();
var fs = require("fs");
var redis = require("redis");

var client = redis.createClient();

var image_finder_middleware = require("./middlewares/find_image");
// app.com/app

router.get("/", function(req, res){
	var pagina = "Inicio";
	Imagen.find({})
	  .populate("creator")
	  .exec(function(err, imagenes){
	  	if(err) console.log(String(err));
		res.render("app/home", {imagenes: imagenes, pagina: pagina});
	  });

});


/*  REST  */

router.get("/imagenes/new", function(req, res){
	res.render("app/imagenes/new");
});

router.all("/imagenes/:id*", image_finder_middleware);

router.get("/imagenes/:id/edit", function(req, res){
	res.render("app/imagenes/edit");
});

router.route("/imagenes/:id")

	.get(function(req, res){
		res.render("app/imagenes/show");
	})
	.put(function(req, res){
	res.locals.imagen.title = req.fields.title;
	res.locals.imagen.save(function(err){
		if(!err){
		res.render("app/imagenes/show");
		}else{
		res.render("app/imagenes/"+req.params.id+"/edit");
		}
	});

	})

	.delete(function(req, res){

		Imagen.findOneAndRemove({ _id: req.params.id }, function(err){
			if(!err){
				res.redirect("/app/imagenes");
			}else{
				console.log(String(err));
				res.redirect("/app/imagenes/"+req.params.id);
			}
		});
	});

router.route("/imagenes")

	.get(function(req, res){
		var pagina = "Todas las imagenes";
		Imagen.find({creator: res.locals.user._id}, function(err, imagenes){

			if(!err){
				res.render("app/imagenes/index", {imagenes: imagenes, pagina: pagina});
			}else{
				res.redirect("/app");
				return;
			}

		});

	})

	.post(function(req, res){
		var extension = req.files.archivo.name.split(".").pop();
		var imagen = new Imagen({
			title: req.fields.title,
			creator: res.locals.user._id,
			extension : extension
		});

		imagen.save(function(err){

			if(!err){


				var imgJSON = {
					"id": imagen._id,
					"title": imagen.title,
					"extension": imagen.extension
				};

				client.publish("images",JSON.stringify(imgJSON));
				fs.rename(req.files.archivo.path, "public/images/"+imagen._id+"."+extension);
				res.redirect("/app/imagenes/"+imagen._id);
			}else{
				console.log(String(err));
			}

		});

	});



module.exports = router;