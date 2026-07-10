
import { useContext } from "react"
import { Navigate } from "react-router-dom"
import Contexto from "./Contexto"

function App(){

    let { token, borrarToken } = useContext(Contexto)

    //cuando se cierre sesión y deje de haber token se redirije a login
    if(!token){
        return <Navigate to="/login" />
    }

    return (
        <main>
            <h1>Tareas</h1>
            <button onClick={borrarToken}>Cerrar sesión</button>
        </main>
    )
}