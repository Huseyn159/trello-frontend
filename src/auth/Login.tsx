import { useState } from "react";
import { Box, TextField, Button, Typography, Paper, Fade, Link, Alert } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import api from "../api/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const res = await api.post("/auth/login", { email, password });
            localStorage.setItem("user", JSON.stringify(res.data));
            navigate("/workspaces");
        } catch (err: any) {
            setError("Invalid credentials. Please check your email and password.");
        }
    };

    return (
        <Box sx={pageStyle}>
            <Fade in={true} timeout={600}>
                <Paper elevation={0} sx={paperStyle}>
                    <Typography variant="h4" fontWeight="800" color="#0F172A" mb={1} letterSpacing="-1px">Sign In</Typography>
                    <Typography variant="body2" color="#64748B" mb={3}>Enter your details to manage your boards.</Typography>

                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleLogin}>
                        <TextField
                            label="Email Address"
                            fullWidth
                            variant="outlined"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={inputStyle}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            variant="outlined"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={inputStyle}
                        />
                        <Button type="submit" variant="contained" fullWidth sx={buttonStyle}>Continue</Button>
                    </Box>

                    <Typography variant="body2" textAlign="center" mt={3} color="#64748B">
                        New here? <Link component={RouterLink} to="/register" sx={linkStyle}>Create an account</Link>
                    </Typography>
                </Paper>
            </Fade>
        </Box>
    );
}

const pageStyle = { height: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", position: "fixed", top: 0, left: 0 };
const paperStyle = { p: { xs: 4, sm: 6 }, width: "100%", maxWidth: "420px", bgcolor: "#FFFFFF", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid #E2E8F0" };
const inputStyle = { mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "#F1F5F9", "& fieldset": { borderColor: "transparent" }, "&.Mui-focused fieldset": { borderColor: "#0F172A" } } };
const buttonStyle = { mt: 2, py: 1.8, borderRadius: "12px", bgcolor: "#0F172A", fontWeight: "600", textTransform: "none", fontSize: "1rem", "&:hover": { bgcolor: "#334155" } };
const linkStyle = { fontWeight: 700, color: "#0F172A", textDecoration: "none", "&:hover": { textDecoration: "underline" } };

export default Login;