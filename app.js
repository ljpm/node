var express = require("express");
var User = require("./models/user").User;
var session = require("express-session");
var router_app = require("./router_app");
var session_middleware = require("./middlewares/session");
var formidable = require("express-formidable");
var RedisStore = require("connect-redis")(session);
var http = require("http");
var realtime = require("./realtime");

var methodOverride = require("method-override");

var app = express();
var server = http.Server(app);

var sessionMiddleware = session({
	store: new RedisStore(),
	secret: "j23489bnsdfgsdf32g",
	resave: true, 
	saveUninitialized: true
});

realtime(server, sessionMiddleware);

app.use("/public",express.static('public'));

//middleware para envio de formulario a la api REST
app.use(methodOverride("_method"));



app.use(sessionMiddleware);

app.use(formidable({ keepExtensions: true }));

app.set("view engine", "jade");

app.get("/", function (req, res) {
console.log(req.session.user_id);	
res.render("index");

});

app.get("/signup", function (req, res) {
	
	User.find(function(err, doc){
	res.render("signup");

});	
	
});

app.get("/login", function (req, res) {	
	res.render("login");
});

app.post("/users", function(req, res){
	
	var user = new User({

	  	email					: req.fields.email,
	 	password 				: req.fields.password, 
		password_confirmation	: req.fields.password_confirmation,
		username                : req.fields.username
	
	});

user.save().then(function(us){
	res.send("Guardamos el usuario exitosamente");
}, function(err){
	if(err){
		console.log(String(err));
		res.send("No pudimos guardar la informacion");

	}
});


});

app.post("/sessions", function(req, res){

	User.findOne({email: req.fields.email, password: req.fields.password}, function(err,user, docs){

		req.session.user_id = user._id;
		res.redirect("/app");
	});

});

app.use("/app", session_middleware);
app.use("/app", router_app);

server.listen(process.env.PORT, '0.0.0.0');
