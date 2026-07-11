
import { useContext,useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import Contexto from "./Contexto"

function App(){

    let { token, borrarToken } = useContext(Contexto)

    // set tareas se rellenará cuando la API devuelva las tareas del usuario, se inicializa como un array vacío
    let [tareas, setTareas] = useState([])

    let [tareaNueva, setTareaNueva] = useState("") // estado del imput de nueva tarea

    let [errorCrear, setErrorCrear] = useState(false)

    // al montar el componente, pedimos las tareas al backend
    useEffect(() => {
        if(!token){
            return   // sin token no pedimos nada salta a la redirección a login
        }

        fetch("http://localhost:3000/tareas", {
            headers: { "Authorization": "Bearer " + token }
        })
        .then(respuesta => {
            if(!respuesta.ok){
                throw new Error()
            }
            return respuesta.json()
        })
        .then(tareas => {
            setTareas(tareas)
        })
        .catch(() => {
            borrarToken()   // en la carga inicial cualquier fallo redirige al login
        })
    }, [])



    
    function crearTarea(){
        if(!tareaNueva.trim()){  // evitar crear tareas vacías
            return
        }

        fetch("http://localhost:3000/nueva", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ titulo: tareaNueva })
        })
        .then(respuesta => { // comprobar que la respuesta es valida, si no lanzar un error al catch para que cierre sesión o de mensaje al usuario de que no udo crearse
       
            if(respuesta.status == 403){
                throw new Error("sesion")
            }
            if(!respuesta.ok){
                throw new Error("peticion")
            }
            return respuesta.json()
        })
        .then(({ id }) => {
            setTareas([...tareas, { _id: id, titulo: tareaNueva, completada: false }]) //Un array nuevo con la tarea añadida, está última se replica sabiendo que será siempre false porque así lo genera el backend, y añade el id que devuelve la API
            setTareaNueva("")//vaciar el input de nueva tarea tras crearla
            setErrorCrear(false)//si había un aviso de error previo, lo limpiamos
        })
        .catch(error => { // solo el fallo de sesión cierra la sesión, el resto avisa en pantalla
            if(error.message == "sesion"){
                borrarToken()
            }else{
                setErrorCrear(true)
            }
        })
      }
    

    //cuando se cierre sesión y deje de haber token se redirije a login
    if(!token){
        return <Navigate to="/login" />
    }

    return (
        <main>
            <h1>Tareas</h1>
            <button onClick={borrarToken}>Cerrar sesión</button>

            //
            <input  type="text"
                    placeholder="Añadir tarea"
                    maxLength={100} // limitar a 100 caracteres ya que en las validaciones no se aceptan más caracteres y así  mejorar la experiencia de usuario, que no escriba de más y luego le salga un error al enviar el formulario
                    value={tareaNueva}
                    onChange={evento => setTareaNueva(evento.target.value)} />

            <button onClick={crearTarea}>Crear</button>
            { errorCrear && <p className="errorCrear">No se pudo crear la tarea</p> }

            <ul>
                { tareas.map(tarea =>
                    <li key={tarea._id}>{tarea.titulo}</li>
                )}
            </ul>

            { tareas.length == 0 && <p>No hay tareas todavía</p> }
        </main>
    )
}
export default App 
