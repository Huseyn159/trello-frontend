import { useEffect, useState } from "react";
import {
    Typography, Box, Grid, Card, CardActionArea, Button,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions,
    CircularProgress, Alert, Avatar, Fade, IconButton, Tooltip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../layout/Navbar";
import api from "../api/api";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarsIcon from '@mui/icons-material/Stars';

// Workspace üçün təsadüfi gözəl rənglər
const avatarColors = ["#6366F1", "#EC4899", "#8B5CF6", "#10B981", "#F59E0B", "#3B82F6"];

interface Workspace {
    id: number;
    name: string;
    description?: string;
}

function Workspaces() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [createLoading, setCreateLoading] = useState(false);

    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData.id;

    const fetchWorkspaces = async () => {
        setLoading(true);
        try {
            if (!userId) {
                setError("Session expired.");
                return;
            }
            const res = await api.get(`/workspaces?userId=${userId}`);
            setWorkspaces(res.data);
            setError("");
        } catch (err: any) {
            setError("Unable to load workspaces.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWorkspaces(); }, []);

    const handleCreate = async () => {
        if (!name.trim()) return;
        setCreateLoading(true);
        try {
            await api.post(`/workspaces/createWorkspace?creatorId=${userId}`, {
                name: name.trim(),
                description: description.trim() || ""
            });
            setName(""); setDescription(""); setOpen(false);
            fetchWorkspaces();
        } catch (err: any) {
            alert("Error creating workspace.");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, wsId: number) => {
        e.stopPropagation();
        if (!window.confirm("Bu Workspace silinsin?")) return;
        try {
            await api.delete(`/workspaces/${wsId}`, { params: { requesterId: userId } });
            setWorkspaces(prev => prev.filter(ws => ws.id !== wsId));
        } catch (err) {
            alert("Error deleting.");
        }
    };

    return (
        <Box sx={containerStyle}>
            <Navbar />

            <Box sx={{ pt: "110px", px: { xs: 3, md: 8 }, maxWidth: "1400px", mx: "auto" }}>
                <Fade in={true} timeout={800}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 6 }}>
                        <Box>
                            <Typography variant="h3" fontWeight="900" color="#1E293B" sx={{ letterSpacing: "-2px", display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StarsIcon sx={{ color: "#6366F1", fontSize: 40 }} /> Workspaces
                            </Typography>
                            <Typography variant="body1" color="#64748B" sx={{ mt: 1, fontWeight: 500 }}>
                                Your creative team environments.
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={() => setOpen(true)}
                            sx={mainButtonStyle}
                            startIcon={<span>+</span>}
                        >
                            New Workspace
                        </Button>
                    </Box>
                </Fade>

                {error && <Alert severity="error" sx={{ mb: 4, borderRadius: "16px" }}>{error}</Alert>}

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 15 }}><CircularProgress sx={{ color: "#6366F1" }} /></Box>
                ) : (
                    <Grid container spacing={4}>
                        {workspaces.map((ws, index) => (
                            <Grid item xs={12} sm={6} md={4} key={ws.id}>
                                <Card elevation={0} sx={cardStyle}>
                                    <Tooltip title="Delete Workspace">
                                        <IconButton onClick={(e) => handleDelete(e, ws.id)} sx={deleteBtnStyle}>
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>

                                    <CardActionArea
                                        sx={{ p: 4, height: "100%" }}
                                        onClick={() => navigate(`/workspaces/${ws.id}/boards`)}
                                    >
                                        <Avatar sx={{
                                            bgcolor: avatarColors[index % avatarColors.length],
                                            width: 56, height: 56, mb: 3,
                                            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                                            fontSize: "1.5rem", fontWeight: 800
                                        }}>
                                            {ws.name.charAt(0).toUpperCase()}
                                        </Avatar>

                                        <Typography variant="h5" fontWeight="800" color="#1E293B" gutterBottom>
                                            {ws.name}
                                        </Typography>

                                        <Typography variant="body2" sx={{ color: "#64748B", mb: 3, lineHeight: 1.6, minHeight: "44px" }}>
                                            {ws.description || "Manage your boards and collaborate with team members seamlessly."}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', color: "#6366F1", gap: 1 }}>
                                            <Typography variant="subtitle2" fontWeight="800" sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                Open Board
                                            </Typography>
                                            <ArrowForwardIcon sx={{ fontSize: 18 }} />
                                        </Box>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* CREATE DIALOG */}
            <Dialog open={open} onClose={() => !createLoading && setOpen(false)} PaperProps={{ sx: { borderRadius: "28px", p: 1, width: "100%", maxWidth: "450px" } }}>
                <DialogTitle sx={{ fontWeight: 900, fontSize: "1.7rem", color: "#1E293B" }}>Create Workspace</DialogTitle>
                <DialogContent>
                    <TextField label="Workspace Name" fullWidth autoFocus value={name} onChange={(e) => setName(e.target.value)} sx={dialogInputStyle} />
                    <TextField label="What's this for?" fullWidth multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} sx={dialogInputStyle} />
                </DialogContent>
                <DialogActions sx={{ p: 4 }}>
                    <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700, color: "#64748B" }}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={!name.trim() || createLoading} sx={createButtonStyle}>
                        {createLoading ? <CircularProgress size={24} color="inherit" /> : "Get Started"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

// ================= VİZUAL EFFEKTLƏR (BOŞLUQ YARATMIR) =================

const containerStyle = {
    position: "absolute", top: 0, left: 0, width: "100%", minHeight: "100vh",
    bgcolor: "#F1F5F9", m: 0, p: 0, overflowX: "hidden"
};

const cardStyle = {
    position: "relative",
    borderRadius: "30px",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    bgcolor: "#FFFFFF",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    "&:hover": {
        transform: "translateY(-8px)",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        borderColor: "#6366F1"
    }
};

const deleteBtnStyle = {
    position: "absolute", top: 20, right: 20, zIndex: 10,
    color: "#CBD5E1", transition: "0.2s",
    "&:hover": { color: "#F43F5E", bgcolor: "#FFF1F2", transform: "rotate(90deg)" }
};

const mainButtonStyle = {
    bgcolor: "#6366F1", borderRadius: "16px", px: 4, py: 1.5, textTransform: "none",
    fontSize: "1rem", fontWeight: 800, boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
    "&:hover": { bgcolor: "#4F46E5", boxShadow: "0 20px 25px -5px rgba(99, 102, 241, 0.4)" }
};

const createButtonStyle = {
    bgcolor: "#1E293B", borderRadius: "14px", px: 4, py: 1.2, textTransform: "none",
    fontWeight: 700, "&:hover": { bgcolor: "#0F172A" }
};

const dialogInputStyle = {
    mt: 2,
    "& .MuiOutlinedInput-root": {
        borderRadius: "16px", bgcolor: "#F8FAFC",
        "& fieldset": { borderColor: "#E2E8F0" },
        "&.Mui-focused fieldset": { borderColor: "#6366F1" }
    }
};

export default Workspaces;