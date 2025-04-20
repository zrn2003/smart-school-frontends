import './styles.css';
import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (username && password) {
            try {
                const response = await fetch('https://smart-school-backend-2.onrender.com/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });
                const data = await response.json();
                console.log('Response:', data);
                if (response.ok) {
                    toast.success(data.message);
                    Cookies.set('user-login', 'true', { expires: 1 });
                    navigate('/dashboard');
                } else {
                    toast.error(data.message || 'Login failed.');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                toast.error('An error occurred. Please try again.');
            }
        } else {
            toast.error('Please enter both username and password.');
        }
    };

    return (
        <>
            <Toaster />
            <div className="login-page">
                <div className="login-box">
                    <h2 className="login-title">Login</h2>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-input-group">
                            <i className="fas fa-user login-icon" aria-hidden="true"></i>
                            <input 
                                type="text" 
                                name="username" 
                                required 
                                className="login-input"
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                            />
                            <label className="login-label">Username</label>
                        </div>
                        <div className="login-input-group">
                            <i className="fas fa-lock login-icon" aria-hidden="true"></i>
                            <input 
                                type="password" 
                                name="password" 
                                required 
                                className="login-input"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                            <label className="login-label">Password</label>
                        </div>
                        <button type="submit" className="login-button">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
