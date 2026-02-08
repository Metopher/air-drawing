import { Link } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react";

const SignIn = () => {
    return (
        <div className="flex items-center justify-between" style={{ minHeight: "100vh", padding: "2rem" }}>
            <div className="container" style={{ maxWidth: "400px" }}>
                <div className="card text-center">
                    <h2 className="text-2xl font-bold" style={{ marginBottom: "2rem" }}>Welcome Back</h2>

                    <form style={{ textAlign: "left" }}>
                        <div style={{ position: "relative" }}>
                            <Mail size={18} style={{ position: "absolute", top: "14px", left: "12px", color: "var(--text-secondary)" }} />
                            <input type="email" placeholder="Email Address" className="input" style={{ paddingLeft: "2.5rem" }} />
                        </div>

                        <div style={{ position: "relative" }}>
                            <Lock size={18} style={{ position: "absolute", top: "14px", left: "12px", color: "var(--text-secondary)" }} />
                            <input type="password" placeholder="Password" className="input" style={{ paddingLeft: "2.5rem" }} />
                        </div>

                        <button className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                            <LogIn size={18} /> Sign In
                        </button>
                    </form>

                    <p className="text-secondary" style={{ marginTop: "1.5rem", fontSize: "0.9rem" }}>
                        Don't have an account? <Link to="/signup" className="text-accent">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
