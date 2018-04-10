var mongoose = require("mongoose");
var Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost/fotos");

//el campo de tipo enum solo es aplicado a String

//posibles valores para el campo sex el cual puede ser masculino o femenino
var posibles_valores = ["M", "F"];

//validacion de un correo con expresiones regulares
var email_match = [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Coloca un email valido"];

//validar que las contraseñas coincidan
var password_validation =  {
			validator: function(p){
			return this.password_confirmation == p;
			},
			message: "Las contraseñas no coinciden"
		}

//Schema del modelo usuario con sus respectivas validaciones
var user_schema = new Schema({

	name: String,
	last_name: String,
	username: {type: String, required: true, maxlength: [50, "Username muy grande"]},
	password: {type: String,minlength: [8, "La contraseña es muy corta"],validate: password_validation},
	age: {type: Number, min: [5, "La edad no puede ser menor de 5 años"], max: [100, "La edad no puede ser mayor de 100 años"]},
	email: {type: String,required: "El correo es obligatorio", match: email_match},
	date_of_birth: Date,
	sex: {type: String, enum: {values: posibles_valores, message: "Opcion no valida"}}
});


user_schema.virtual("password_confirmation").get(function(){

	return this.p_c;

}).set(function(password){

	this.p_c = password;

});


var User = mongoose.model("User", user_schema);


module.exports.User = User;