import dotenv from "dotenv";
dotenv.config();

import { MongoClient, ObjectId } from "mongodb";

const urlMongo = process.env.MONGO_URL;

function conectar(){
    return MongoClient.connect(urlMongo);
}

// buscar un usuario en concreto
export function buscarUsuario(nombreUsuario){
      return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("tareas").collection("usuarios");

            return coleccion.findOne({ usuario : nombreUsuario });
        })
        .then( usuario => {
            ok(usuario);
        })
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}

// leer todas las tareas
export function leerTareas(idUsuario){
     return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("tareas").collection("tareas");

            return coleccion.find({ usuario : idUsuario }).toArray();
        })
        .then( tareas => {
            ok(tareas);
        })
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}

//crear tarea en la base de datos
export function crearTarea(objTarea){ // {titulo, completada, usuario}
    // insertOne
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("tareas").collection("tareas");

            return coleccion.insertOne(objTarea);
        })
        .then( ({insertedId}) => {
            ok(insertedId);
        })
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}

//borrar tarea de la base de datos
export function borrarTarea(idTarea, idUsuario){
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("tareas").collection("tareas");

            return coleccion.deleteOne({ _id: new ObjectId(idTarea), usuario: idUsuario });
        })
        .then( ({deletedCount}) => {
            ok(deletedCount);
        })
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}
//actualizar el estado de la tarea
export function actualizarTarea(id, objCambios, idUsuario){
    return new Promise((ok,ko) => {
        let conexion = null;
        conectar()
        .then( objConexion => {
            conexion = objConexion;

            let coleccion = conexion.db("tareas").collection("tareas");

            return coleccion.updateOne(
                { _id: new ObjectId(id), usuario: idUsuario },
                { $set: objCambios }
            );
        })
        .then( ({modifiedCount, matchedCount}) => {
            ok({
                existe: matchedCount,
                cambio: modifiedCount
            });
        })
        .catch(() => ko({ error : "error en bbdd" }))
        .finally(() => {
            if(conexion){
                conexion.close();
            }
        });
    });
}
