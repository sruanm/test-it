import { useState } from "react"

export function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [error, setError] = useState('')

    async function handleSubmit() {
        const baseUrl = import.meta.env.VITE_PUBLIC_API_URL;
        const endpoint = isLogin ? 'login' : 'signup'

        const res = await fetch(`${baseUrl}/auth/${endpoint}`, {
            method: "POST",
            body: JSON.stringify({
                email,
                password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })

        if (res.ok) {
            if (!isLogin) {
                alert("Usuário criado com sucesso!")
                setIsLogin(true);
                return;
            }

            const body = await res.json();

            localStorage.setItem("token", body.token);
            window.location.reload();
            return;
        }

        const body = await res.json();
        setError(body.error as string)

        return;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <h1>{isLogin ? "Login" : "Cadastro"}</h1>
            <label htmlFor='email-in'>E-mail</label>
            <input id='email-in' type='email' onChange={(e) => setEmail(e.target.value)} />

            <label htmlFor='pwd-in'>Senha</label>
            <input id='pwd-in' type='password' value={password} onChange={(e) => setPassword(e.target.value)} />

            <button onClick={handleSubmit} style={{ marginTop: 20 }}>Enviar</button>

            {error &&
                <p style={{ color: 'red' }}>{error}</p>}

            <button onClick={() => setIsLogin((oldValue) => !oldValue)} style={{ marginTop: 10 }}>
                {
                    isLogin
                        ?
                        "Não tem conta? Se cadastre"
                        :
                        "Já tem conta? Faça login"
                }
            </button>
        </div>
    )
}