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
        setError(false)

        fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario, password })
        })
        .then(respuesta => {
            if(!respuesta.ok){
                throw new Error()
            }
            return respuesta.json()
        })
        .then(({ token }) => {
            guardarToken(token)
        })
        .catch(() => {
            setError(true)
            setPassword("")     // limpia el campo de contraseña tras el fallo para evitar confusiones al usuario
        })
    }

    return (
        <main>
            <h1>Iniciar sesión</h1>

            <input  type="text"
                    placeholder="usuario"
                    value={usuario}
                    onChange={evento => setUsuario(evento.target.value)} />

            <input  type="password"
                    placeholder="contraseña"
                    value={password}
                    onChange={evento => setPassword(evento.target.value)} />

            <button onClick={entrar}>Login</button>

            { error && <p className="error">Usuario o contraseña incorrectos</p> }
        </main>
    )
}

export default Login