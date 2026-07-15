import dotenv from "dotenv";
dotenv.config();

import { ObjectId } from "mongodb";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { leerTareas, crearTarea, borrarTarea, actualizarTarea, buscarUsuario } from "./db.js";

//-------- Middleware para verificar el token y obtener el id del usuario--------

async function verificar(peticion,respuesta,siguiente){
    if(!peticion.headers.authorization){
        return respuesta.sendStatus(403);
    }

    let [,token] = peticion.headers.authorization.split(" ");

    try{

        let datos = await jwt.verify(token,process.env.SECRET);

        peticion.usuario = datos.id;

        siguiente();

    }catch(e){
        respuesta.sendStatus(403);
    }
}

// servidor

const servidor = express();

servidor.use(cors());

servidor.use(express.json());

//servidor.use(express.static("./front"));

//-------- Rutas --------

// login, usuario y contraseña, si todo está ok devolvemos un token
servidor.post("/login", async (peticion,respuesta) => {
    let { usuario, password } = peticion.body;
     if(!usuario || !usuario.trim() || !password || !password.trim()){
        return respuesta.sendStatus(403);
    }

    try{

        let usuarioLogandose = await buscarUsuario(usuario);

        if(!usuarioLogandose){
            return respuesta.sendStatus(403);
        }

        let coincide = await bcrypt.compare(password,usuarioLogandose.password);

        if(!coincide){
            return respuesta.sendStatus(401);
        }

        let token = jwt.sign({ id : usuarioLogandose._id },process.env.SECRET);

        respuesta.json({token});

    }catch(e){
        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }

});

servidor.use(verificar);

//leer las tareas del usuario
servidor.get("/tareas", async (peticion, respuesta) => {
    try{
        let tareas = await leerTareas(peticion.usuario);
        respuesta.json(tareas);
    }catch(e){
        respuesta.status(500);
        respuesta.json({ error : "error en el servidor" });
    }
});

//crear tarea en la base de datos
servidor.post("/nueva", async (peticion, respuesta) => {
    try{
        let { titulo } = peticion.body;

        // Validar que no esté vacío  y longitud limitada. (typeof titulo != "string" ----> generado con IA) 
        if(!titulo || typeof titulo != "string" || !titulo.trim() || titulo.length > 100){
            return respuesta.sendStatus(400);
        }

        let usuario = peticion.usuario;

        let id = await crearTarea({ titulo: titulo.trim(), completada: false, usuario });

        respuesta.json({ id }); // devuelve solo el id de la tarea creada porque el resto se puede replicar en el front, ya que completada siempre es false y el titulo es el que envía el front

    }catch(e){
        respuesta.status(500);
        respuesta.json({ error : "error en el servidor" });
    }
});

//borrar tarea de la base de datos
servidor.delete("/borrar/:id", async (peticion, respuesta, siguiente) => {
    try{
        // Validar que el id tenga formato válido de ObjectId en MongoDB
        if(!ObjectId.isValid(peticion.params.id)){
            return respuesta.sendStatus(400);
        }
        //si el id existe y pertenece al usuario db.js devueleve 1 si lo borra (deletedCount) y 0 si no lo borra. 
        let cantidad = await borrarTarea(peticion.params.id, peticion.usuario);
        //si no lo borra al ser 0 sería false, solo si lo borra devuelve 1 que es true, entonces responde con 204.
        if(cantidad){
            return respuesta.sendStatus(204);
        }

        siguiente();

    }catch(e){
        respuesta.status(500);
        respuesta.json({ error : "error en el servidor" });
    }
});

//actualizar tarea en la base de datos
servidor.patch("/actualizar/:id", async (peticion, respuesta, siguiente) => {
    try{
        // Validar que el id tenga formato válido de ObjectId en MongoDB
        if(!ObjectId.isValid(peticion.params.id)){
            return respuesta.sendStatus(400);
        }

        // Validar que solo sea un boolean, no aceptar otro tipo de dato
        if(typeof peticion.body.completada != "boolean"){
            return respuesta.sendStatus(400);
        }

        // Construir el objCambios para que $set en db.js solo reciba la propiedad completada, no permitir que se cambie otra propiedad.
        let objCambios = { completada: peticion.body.completada };

        //actualizarTarea en db.js devuelve existe: matchedCount y cambio: modifiedCount, 1 o 0
        let { existe, cambio } = await actualizarTarea(peticion.params.id, objCambios, peticion.usuario);

        //solo es posible cambio=1 si existe=1, con lo cual si entra aquí es que todo está ok y devuele 204
        if(cambio){
            return respuesta.sendStatus(204);
        }
        // si entra aquí es porque cambio=0
        if(existe){
            return respuesta.json({ info : "no se actualizó el recurso" });
        }

        siguiente();

    }catch(e){
        respuesta.status(500);
        respuesta.json({ error : "error en el servidor" });
    }
});

//middlewares finales para errores y rutas no encontradas
servidor.use((error,peticion,respuesta,siguiente) => {
        respuesta.status(400);//bad request
        respuesta.json({ error : "error en la petición" });
});

servidor.use((peticion,respuesta) => {
        respuesta.status(404);
        respuesta.json({ error : "recurso no encontrado" });
});


servidor.listen(process.env.PORT);