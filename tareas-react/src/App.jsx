
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

      // marcar o desmarcar una tarea como completada. Llegan el id y el valor de completada (true o false), al que llamo completa porque personalmente me facilita la lectura de código que no sea el mismo nombre que la propiedad del objeto tarea
      function completarTarea(id, completa){
          fetch("http://localhost:3000/actualizar/" +  id, {
              method: "PATCH",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer " + token
              },
              body: JSON.stringify({ completada: completa })
          })
          .then(respuesta => {
              if(respuesta.status == 403){
                  throw new Error("sesion")
              }
              if(!respuesta.ok){
                  throw new Error("peticion")
              }
              // la tarea afectada se copia con cambiando el valor de la variable completada a true o false (hecha o no), el resto pasan tal cual. Se repintan sin recargar.
              setTareas(tareas.map(t =>
                  t._id == id ? { ...t, completada: completa } : t
              ))
          })
          .catch(error => {
              if(error.message == "sesion"){
                  borrarToken()
              }else{
                  setErrorCrear(true)
              }
          })
      }
      
      // eliminar una tarea en el backend y quitarla de la lista sin recargar
      function borrarTarea(id){
          fetch("http://localhost:3000/borrar/" + id, {
              method: "DELETE",
              headers: { "Authorization": "Bearer " + token }
          })
          .then(respuesta => {
              if(respuesta.status == 403){
                  throw new Error("sesion")
              }
              if(!respuesta.ok){
                  throw new Error("peticion")
              }
              // filtramos creando un nuevo array de tareas pasan el filtro las que no coinciden con el id recibido
              setTareas(tareas.filter(tarea => tarea._id != id))
          })
          .catch(error => {
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

            {/* formulario para añadir una nueva tarea, limitar a 100 caracteres ya que en las validaciones no se aceptan más caracteres y así  mejorar la experiencia de usuario, que no escriba de más y luego le salga un error al enviar el formulario*/}
            <input  type="text"
                    placeholder="Añadir tarea"
                    maxLength={100} 
                    value={tareaNueva}
                    onChange={evento => setTareaNueva(evento.target.value)} />

            <button onClick={crearTarea}>Crear</button>
            { errorCrear && <p className="errorCrear">No se pudo crear la tarea</p> }

            {/* lista de tareas pendientes, se filtra el array de tareas para mostrar solo las pendientes, y se mapea para crear un li por cada tarea */}
            <h2>Pendientes</h2>
            <ul>
                { tareas.filter(tarea => !tarea.completada).map(tarea =>
                    <li key={tarea._id}>
                        <input  type="checkbox"
                                checked={tarea.completada}
                                onChange={() => completarTarea(tarea._id, !tarea.completada)} />
                        <span>{tarea.titulo}</span>
                        <button onClick={() => borrarTarea(tarea._id)}>Borrar</button>
                    </li>
                )}
            </ul>
            { tareas.filter(t => !t.completada).length == 0 && <p>No hay tareas pendientes</p> } {/* si no hay tareas pendientes se muestra un mensaje, aunque haya tareas completadas */}

            {/* lista de tareas completadas, se filtra el array de tareas para mostrar solo las completadas, y se mapea para crear un li por cada tarea */}
            <h2>Completadas</h2>
            <ul>
                { tareas.filter(tarea => tarea.completada).map(tarea =>
                    <li key={tarea._id}>
                        <input  type="checkbox"
                                checked={tarea.completada}
                                onChange={() => completarTarea(tarea._id, !tarea.completada)} />
                        <span className="completada">{tarea.titulo}</span>
                        <button onClick={() => borrarTarea(tarea._id)}>Borrar</button>
                    </li>
                )}
            </ul>
            { tareas.filter(t => t.completada).length == 0 && <p>No hay tareas completadas</p> } {/* si no hay tareas completadas se muestra un mensaje, aunque haya tareas pendientes */}

        </main>
    )
}
export default App 
