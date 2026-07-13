import { useState, useContext } from "react"
import { Navigate } from "react-router-dom"
import Contexto from "./Contexto"

function Login(){

    let { token, guardarToken } = useContext(Contexto)

    let [usuario, setUsuario] = useState("")
    let [password, setPassword] = useState("")
    let [error, setError] = useState(false)

    // si ya hay sesión abierta redirigir a la página principal (App)
    if(token){
        return <Navigate to="/" />
    }

    function entrar(){
        //limpiar cualquier error si hay intentos de login fallidos
        setError(false)

        //petición POST a la API para iniciar sesión y obtener el token
        fetch("http://localhost:3000/login", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario, password }) //convertir a JSON el objeto con los datos del formulario
        })
        //fetch solo rechaza la promesa si hay un error de red, comprobar el estado de la respuesta
        .then(respuesta => {
            if(!respuesta.ok){
                throw new Error()
            }
            return respuesta.json()
        })
        .then(({ token }) => {
            guardarToken(token) // guardar el token para mantener la sesión iniciada, funcion que viene de Tareas.jsx y se pasa a través del contexto
        })
        .catch(() => {
            setError(true)
            setPassword("")     // limpia el campo de contraseña tras el fallo para evitar confusiones al usuario
        })
    }

    //Login devuelve el formulario de login y un mensaje de error si el login falla
    return (
        <main className="login">
            <h1>Tus tareas</h1>
            <div className="inputsFormulario">
                <input type="text"
                        placeholder="usuario"
                        className={error ? "inputError" : ""}
                        value={usuario}
                        onChange={evento => setUsuario(evento.target.value)} />

                <input  type="password"
                        placeholder="contraseña"
                        className={error ? "inputError" : ""}
                        value={password}
                        onChange={evento => setPassword(evento.target.value)} />

                { error && <p className="errorLogin">Usuario o contraseña incorrectos</p> }
            </div>
            
            <button onClick={entrar}>Login</button>

            
        </main>
    )
}

export default Login