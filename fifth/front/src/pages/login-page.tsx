import { useState } from "react"
import { sign } from "../api"

export function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)

    async function handleSubmit() {
        try {
            if (!email.trim() || !password.trim()) {
                alert('The data can not be blank!')
            }

            const result = await sign(isLogin ? 'login' : 'signup', { email: email.trim(), password: password.trim(), isAdmin });

            if (result.token) {
                alert('Welcome!');
                return window.location.reload();
            }

            alert('User created with success!')
            setIsLogin(true);

            return;
        } catch (err) {
            if (err?.error) {
                alert(err.error)
            }
            else {
                alert('Error on API comunication')
            }

            return;
        }
    }

    return (
        <div>
            <h1>{isLogin ? 'Login' : 'Sign up'}</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="email-in">E-mail</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} id='email-in' type="email" />

                <label htmlFor="pwd-in">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} id='pwd-in' type="password" />

                {!isLogin &&
                    <div style={{ display: 'flex' }}>
                        <label htmlFor="admin-in">Admin</label>
                        <input checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} id='admin-in' type="checkbox" />
                    </div>
                }


                <button onClick={handleSubmit}>Send</button>
            </div>

            <button style={{ marginTop: 30 }} onClick={() => setIsLogin((old) => !old)}>{isLogin ? 'Don`t have an account? Sign up' : 'Already registered? Log in'}</button>
        </div>
    )
}