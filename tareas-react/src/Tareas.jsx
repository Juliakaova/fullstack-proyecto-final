import { useState } from "react"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import Contexto from "./Contexto"
import Login from "./Login"
import App from "./App"

//Rutas y sus componentes

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />
    },
    {
        path: "/login",
        element: <Login />
    }
])
//gestión del token
function Tareas(){

    //Almacenamiento del token en localStorage para mantener la sesión iniciada aunque se cierre el navegador, solución desarrollada con IA
    let [token, setToken] = useState(localStorage.getItem("token"))

    function guardarToken(tokenNuevo){
        localStorage.setItem("token", tokenNuevo)
        setToken(tokenNuevo)
    }

    return <Contexto.Provider value={{ token, guardarToken }}>
                <RouterProvider router={router} />
           </Contexto.Provider>
}

export default Tareas