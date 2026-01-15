import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box, Typography, Grid, Card, CardActionArea,
    CircularProgress, Fade, Button, Dialog,
    DialogTitle, DialogContent, TextField, DialogActions,
    Breadcrumbs, Link, Chip, IconButton, Tooltip, Avatar
} from "@mui/material";
import Navbar from "../layout/Navbar";
import api from "../api/api";
import DashboardIcon from '@mui/icons-material/Dashboard';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';

// Board-lar üçün rəng palitrası
const boardColors = ["#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

function BoardPage() {
    const { workspaceId } = useParams();
    const navigate = useNavigate();

    const [boards, setBoards] = useState<any[]>([]);
    const [workspace, setWorkspace] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [createLoading, setCreateLoading] = useState(false);

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData.id;

    const fetchData = useCallback(async () => {
        if (!workspaceId || !userId) return;
        setLoading(true);
        try {
            const boardsRes = await api.get(`/workspaces/${workspaceId}/boards`);
            setBoards(boardsRes.data);

            const wsRes = await api.get(`/workspaces?userId=${userId}`);
            const currentWS = wsRes.data.find((w: any) => w.id === Number(workspaceId));
            setWorkspace(currentWS);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [workspaceId, userId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateBoard = async () => {
        if (!newTitle.trim()) return;
        setCreateLoading(true);
        try {
            await api.post(`/boards?userId=${userId}`, {
                title: newTitle.trim(),
                workspaceId: Number(workspaceId)
            });
            setNewTitle("");
            setOpen(false);
            fetchData();
        } catch (error) {
            alert("Xəta baş verdi.");
        } finally {
            setCreateLoading(false);
        }
    };

    // --- SİLMƏ FUNKSİYASI (API-A UYĞUN) ---
    const handleDeleteBoard = async (e: React.MouseEvent, boardId: number) => {
        e.stopPropagation();
        if (!window.confirm("Bu board silinsin?")) return;
        try {
            // DELETE /api/boards/{boardId}?userId={userId}
            await api.delete(`/boards/${boardId}`, { params: { userId: userId } });
            setBoards(prev => prev.filter(b => b.id !== boardId));
        } catch (error) {
            alert("Silinmə zamanı xəta baş verdi.");
        }
    };

    return (
        <Box sx={pageContainer}>
            <Navbar />

            <Box sx={contentWrapper}>
                {/* Breadcrumbs */}
                <Fade in={true} timeout={500}>
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: '#94A3B8' }} />} sx={{ mb: 3 }}>
                        <Link
                            underline="none"
                            onClick={() => navigate("/workspaces")}
                            sx={breadcrumbLink}
                        >
                            Workspaces
                        </Link>
                        <Typography sx={breadcrumbCurrent}>
                            {workspace?.name || "..."}
                        </Typography>
                    </Breadcrumbs>
                </Fade>

                {/* Header Section */}
                <Box sx={headerSection}>
                    <Box>
                        <Typography variant="h3" sx={workspaceTitleStyle}>
                            {workspace?.name} <span style={{ color: '#94A3B8', fontWeight: 400 }}>Boards</span>
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#64748B", mt: 1, fontWeight: 500 }}>
                            {workspace?.description || "Select a board to start organizing your tasks."}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpen(true)}
                        sx={addButtonStyle}
                    >
                        Create Board
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 15 }}>
                        <CircularProgress sx={{ color: '#0F172A' }} />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {boards.map((board, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={board.id}>
                                <Card elevation={0} sx={boardCardStyle}>
                                    {/* Silmə Düyməsi */}
                                    <Tooltip title="Delete Board">
                                        <IconButton
                                            onClick={(e) => handleDeleteBoard(e, board.id)}
                                            sx={deleteBtnStyle}
                                        >
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>

                                    <CardActionArea
                                        sx={{ p: 3, height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between' }}
                                        onClick={() => navigate(`/boards/${board.id}`)}
                                    >
                                        <Avatar sx={{
                                            bgcolor: boardColors[index % boardColors.length],
                                            width: 40, height: 40, borderRadius: '12px'
                                        }}>
                                            <DashboardIcon sx={{ fontSize: 22 }} />
                                        </Avatar>

                                        <Box sx={{ width: '100%' }}>
                                            <Typography variant="h6" sx={boardTitleStyle}>
                                                {board.title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                <Chip label="Active" size="small" sx={chipStyle} />
                                                <Typography sx={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                                                    Open →
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* Dialog - Create Board */}
            <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: "28px", p: 1, width: '450px' } }}>
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.8rem', color: '#0F172A' }}>New Board</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        Give your board a title to start tracking tasks in <strong>{workspace?.name}</strong>.
                    </Typography>
                    <TextField
                        label="Board Title"
                        fullWidth
                        autoFocus
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        sx={inputStyle}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 4 }}>
                    <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700, color: '#64748B' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateBoard}
                        disabled={!newTitle.trim() || createLoading}
                        sx={createConfirmButton}
                    >
                        {createLoading ? <CircularProgress size={24} color="inherit" /> : "Create Board"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

// ================= STILLƏR (Boşluqsuz & Premium) =================

const pageContainer = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    minHeight: "100vh",
    bgcolor: "#F8FAFC",
    m: 0,
    p: 0,
    overflowX: "hidden"
};

const contentWrapper = {
    pt: "110px",
    px: { xs: 3, md: 8 },
    pb: 8,
    maxWidth: "1400px",
    mx: "auto"
};

const breadcrumbLink = {
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 700,
    color: '#64748B',
    transition: '0.2s',
    '&:hover': { color: '#0F172A' }
};

const breadcrumbCurrent = {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0F172A'
};

const headerSection = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 6,
    flexWrap: 'wrap',
    gap: 3
};

const workspaceTitleStyle = {
    fontWeight: 900,
    color: "#0F172A",
    letterSpacing: "-2.5px",
    fontSize: { xs: '2.2rem', md: '3.5rem' }
};

const boardCardStyle = {
    position: "relative",
    borderRadius: "28px",
    border: "1px solid #E2E8F0",
    bgcolor: "#FFFFFF",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
        transform: "translateY(-8px)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
        borderColor: "#0F172A"
    }
};

const deleteBtnStyle = {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
    color: "#CBD5E1",
    transition: "0.2s",
    "&:hover": { color: "#EF4444", bgcolor: "rgba(239, 68, 68, 0.08)" }
};

const boardTitleStyle = {
    fontWeight: 800,
    color: '#1E293B',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100%'
};

const addButtonStyle = {
    bgcolor: "#0F172A",
    borderRadius: "16px",
    px: 4,
    py: 1.5,
    textTransform: "none",
    fontWeight: 800,
    fontSize: '0.95rem',
    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)',
    "&:hover": { bgcolor: "#334155", transform: 'scale(1.02)' }
};

const chipStyle = {
    fontSize: '10px',
    fontWeight: 800,
    height: '22px',
    bgcolor: '#F1F5F9',
    color: '#64748B',
    borderRadius: '8px'
};

const inputStyle = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "18px",
        bgcolor: "#F8FAFC",
        "& fieldset": { borderColor: "#E2E8F0" },
        "&.Mui-focused fieldset": { borderColor: "#0F172A" }
    }
};

const createConfirmButton = {
    bgcolor: "#0F172A",
    borderRadius: "16px",
    px: 4,
    py: 1.2,
    textTransform: "none",
    fontWeight: 800,
    "&:hover": { bgcolor: "#334155" }
};

export default BoardPage;