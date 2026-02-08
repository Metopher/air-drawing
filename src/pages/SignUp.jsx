import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User } from "lucide-react";

const SignUp = () => {
    return (
        <div className="flex items-center justify-between" style={{ minHeight: "100vh", padding: "2rem" }}>
            <div className="container" style={{ maxWidth: "400px" }}>
                <div className="card text-center">
                    <h2 className="text-2xl font-bold" style={{ marginBottom: "2rem" }}>Create Account</h2>

                    <form style={{ textAlign: "left" }}>
                        <div style={{ position: "relative" }}>
                            <User size={18} style={{ position: "absolute", top: "14px", left: "12px", color: "var(--text-secondary)" }} />
                            <input type="text" placeholder="Full Name" className="input" style={{ paddingLeft: "2.5rem" }} />
                        </div>

                        <div style={{ position: "relative" }}>
                            <Mail size={18} style={{ position: "absolute", top: "14px", left: "12px", color: "var(--text-secondary)" }} />
                            <input type="email" placeholder="Email Address" className="input" style={{ paddingLeft: "2.5rem" }} />
                        </div>

                        <div style={{ position: "relative" }}>
                            <Lock size={18} style={{ position: "absolute", top: "14px", left: "12px", color: "var(--text-secondary)" }} />
                            <input type="password" placeholder="Password" className="input" style={{ paddingLeft: "2.5rem" }} />
                        </div>

                        <button className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                            <UserPlus size={18} /> Sign Up
                        </button>
                    </form>

                    <p className="text-secondary" style={{ marginTop: "1.5rem", fontSize: "0.9rem" }}>
                        Already have an account? <Link to="/signin" className="text-accent">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
