
import { useContext,useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import Contexto from "./Contexto"

function App(){

    let { token, borrarToken } = useContext(Contexto)

    // set tareas se rellenará cuando la API devuelva las tareas del usuario, se inicializa como un array vacío
    let [tareas, setTareas] = useState([])

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
            borrarToken()   // token inválido 
        })
    }, [])

    //cuando se cierre sesión y deje de haber token se redirije a login
    if(!token){
        return <Navigate to="/login" />
    }

    return (
        <main>
            <h1>Tareas</h1>
            <button onClick={borrarToken}>Cerrar sesión</button>
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