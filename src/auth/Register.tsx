import { useState } from "react";
import { Box, TextField, Button, Typography, Paper, Grid, Link, Alert } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import api from "../api/api";

function Register() {
    const navigate = useNavigate();

    // Form data
    const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });

    // Backend-dən gələn spesifik xətalar üçün
    const [errors, setErrors] = useState<any>({});
    const [generalError, setGeneralError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setGeneralError("");

        // Frontend ön yoxlama
        if (form.password !== form.confirmPassword) {
            setErrors({ confirmPassword: "Passwords do not match!" });
            return;
        }

        try {
            await api.post("/users/registration", form);
            navigate("/"); // Uğurludursa Login-ə at
        } catch (err: any) {
            // Backend-dən gələn mesajları tutmaq (Backend formatına uyğun tənzimlə)
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setGeneralError(err.response?.data?.message || "Registration failed. Please try again.");
            }
        }
    };

    // Stillər (Xəta almamamaq üçün funksiya daxilində və ya sx daxilində)
    const styles = {
        page: { height: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" },
        paper: { p: { xs: 4, sm: 6 }, width: "100%", maxWidth: "500px", bgcolor: "#FFFFFF", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid #E2E8F0" },
        input: {
            mb: 1,
            "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                bgcolor: "#F1F5F9",
                "& fieldset": { borderColor: "transparent" },
                "&.Mui-focused fieldset": { borderColor: "#0F172A" }
            }
        }
    };

    return (
        <Box sx={styles.page}>
            <Paper elevation={0} sx={styles.paper}>
                <Typography variant="h4" fontWeight="800" color="#0F172A" mb={1} letterSpacing="-1px">Create Account</Typography>
                <Typography variant="body2" color="#64748B" mb={3}>Join us to start organizing your projects.</Typography>

                {generalError && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>{generalError}</Alert>}

                <Box component="form" onSubmit={handleRegister}>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <TextField
                                label="Username"
                                fullWidth
                                error={!!errors.username}
                                helperText={errors.username}
                                value={form.username}
                                onChange={(e) => setForm({...form, username: e.target.value})}
                                sx={styles.input}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                error={!!errors.email}
                                helperText={errors.email}
                                value={form.email}
                                onChange={(e) => setForm({...form, email: e.target.value})}
                                sx={styles.input}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Password"
                                type="password"
                                fullWidth
                                error={!!errors.password}
                                helperText={errors.password}
                                value={form.password}
                                onChange={(e) => setForm({...form, password: e.target.value})}
                                sx={styles.input}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Confirm"
                                type="password"
                                fullWidth
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                value={form.confirmPassword}
                                onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                                sx={styles.input}
                            />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 3, py: 1.8, borderRadius: "12px", bgcolor: "#0F172A", fontWeight: "600", textTransform: "none", "&:hover": { bgcolor: "#334155" } }}
                    >
                        Sign Up
                    </Button>
                </Box>
                <Typography variant="body2" textAlign="center" mt={3} color="#64748B">
                    Already have an account? <Link component={RouterLink} to="/" sx={{fontWeight: 700, color: "#0F172A", textDecoration: "none"}}>Sign In</Link>
                </Typography>
            </Paper>
        </Box>
    );
}

export default Register;