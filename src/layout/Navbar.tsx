import {
    Typography,
    Button,
    Box,
    Avatar,
    Divider,
    IconButton,
    Tooltip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';

function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");

    // İstifadəçi rəngini adın baş hərfinə görə təyin edirik
    const stringToColor = (string: string) => {
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        return color;
    };

    const userColor = user?.username ? stringToColor(user.username) : "#0079bf";

    return (
        <Box sx={navbarContainer}>
            <Box sx={contentWrapper}>
                {/* Sol tərəf: Logo və Navigasiya */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box
                        onClick={() => navigate("/workspaces")}
                        sx={logoStyle}
                    >
                        <DashboardIcon sx={{ color: '#fff', fontSize: 20 }} />
                        <Typography variant="h6" fontWeight="900" sx={{ color: '#fff', lineHeight: 1 }}>
                            Trello
                        </Typography>
                    </Box>

                    <Typography
                        variant="body2"
                        sx={navLink}
                        onClick={() => navigate("/workspaces")}
                    >
                        Workspaces
                    </Typography>
                </Box>

                {/* Sağ tərəf: User info və Logout */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={userInfo}>
                        <Typography variant="body2" fontWeight="700" color="#172b4d">
                            {user?.username}
                        </Typography>
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                fontSize: 14,
                                fontWeight: 700,
                                bgcolor: userColor,
                                border: '2px solid #fff',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            {user?.username?.[0]?.toUpperCase()}
                        </Avatar>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ my: 2, mx: 1, borderColor: 'rgba(0,0,0,0.08)' }} />

                    <Tooltip title="Logout">
                        <IconButton
                            onClick={() => { localStorage.clear(); navigate("/"); }}
                            sx={logoutBtn}
                        >
                            <LogoutIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </Box>
    );
}

// ================= STYLES =================
const navbarContainer = {
    bgcolor: "rgba(255, 255, 255, 0.75)",
    backdropFilter: "blur(12px) saturate(180%)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 1100,
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.05)"
};

const contentWrapper = {
    maxWidth: "100%",
    mx: "auto",
    px: 3,
    height: "56px", // Bir az daha nazik və modern
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
};

const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    bgcolor: '#0079bf',
    px: 1.5,
    py: 0.5,
    borderRadius: '4px',
    cursor: 'pointer',
    transition: '0.2s',
    '&:hover': { bgcolor: '#026aa7' }
};

const navLink = {
    color: "#44546f",
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    p: '6px 12px',
    borderRadius: '4px',
    '&:hover': { bgcolor: 'rgba(0,0,0,0.05)', color: '#172b4d' }
};

const userInfo = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    bgcolor: 'rgba(0,0,0,0.03)',
    px: 1,
    py: 0.5,
    borderRadius: '20px',
    border: '1px solid rgba(0,0,0,0.05)'
};

const logoutBtn = {
    color: '#626f86',
    transition: '0.2s',
    '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' }
};

export default Navbar;