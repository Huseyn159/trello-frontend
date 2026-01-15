import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box, Typography, IconButton, Paper, CircularProgress,
    InputBase, Button, Avatar, AvatarGroup, Tooltip, Checkbox
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

import Navbar from "../layout/Navbar";
import api from "../api/api";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';

function BoardDetail() {
    const { boardId } = useParams<{ boardId: string }>();
    const navigate = useNavigate();
    const [lists, setLists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCardTitles, setNewCardTitles] = useState<Record<number, string>>({});
    const [newListTitle, setNewListTitle] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id;

    const fetchContent = useCallback(async () => {
        if (!boardId || !userId) return;
        try {
            const res = await api.get(`/boards/${boardId}/lists?userId=${userId}`);
            const fetchedLists = res.data || [];
            const listsWithCards = await Promise.all(
                fetchedLists.map(async (list: any) => {
                    const cardRes = await api.get(`/lists/${list.id}/cards`);
                    return {
                        ...list,
                        cards: (cardRes.data || []).sort((a: any, b: any) => a.position - b.position)
                    };
                })
            );
            setLists(listsWithCards.sort((a, b) => a.position - b.position));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [boardId, userId]);

    useEffect(() => { fetchContent(); }, [fetchContent]);

    // ================= ACTIONS =================
    const handleCreateList = async () => {
        if (!newListTitle.trim() || !boardId || !userId) return;
        try {
            await api.post(`/lists?userId=${userId}`, {
                listName: newListTitle.trim(),
                boardId: Number(boardId)
            });
            setNewListTitle("");
            fetchContent();
        } catch (e) { console.error(e); }
    };

    const handleDeleteList = async (listId: number) => {
        if (!window.confirm("Bu siyahını silmək istədiyinizə əminsiniz?")) return;
        await api.delete(`/lists/${listId}?userId=${userId}`);
        fetchContent();
    };

    const handleDeleteCard = async (cardId: number) => {
        await api.delete(`/cards/${cardId}?userId=${userId}`);
        fetchContent();
    };

    const handleInvite = () => {
        const email = prompt("Dəvət etmək istədiyiniz şəxsin e-poçtunu yazın:");
        if (email) alert(`${email} ünvanına dəvət göndərildi!`);
    };

    // ================= DRAG & DROP =================
    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId, type } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        if (type === "COLUMN") {
            const newLists = [...lists];
            const [moved] = newLists.splice(source.index, 1);
            newLists.splice(destination.index, 0, moved);
            setLists(newLists);
            await api.patch(`/lists/reorder?userId=${userId}`, {
                listId: Number(draggableId.replace("list-", "")),
                newPosition: destination.index + 1
            });
            return;
        }

        const sourceListIdx = lists.findIndex(l => `list-${l.id}` === source.droppableId);
        const destListIdx = lists.findIndex(l => `list-${l.id}` === destination.droppableId);
        const newPosition = destination.index + 1;

        const newLists = structuredClone(lists);
        const [movedCard] = newLists[sourceListIdx].cards.splice(source.index, 1);
        newLists[destListIdx].cards.splice(destination.index, 0, movedCard);
        setLists(newLists);

        const cardId = Number(draggableId.replace("card-", ""));
        if (sourceListIdx === destListIdx) {
            await api.patch(`/cards/reorder?userId=${userId}`, { cardId, newPosition });
        } else {
            await api.patch(`/cards/move?userId=${userId}`, {
                cardId,
                targetListId: newLists[destListIdx].id,
                newPosition
            });
        }
    };

    if (loading) return <Box sx={center}><CircularProgress /></Box>;

    return (
        <Box sx={root}>
            <Navbar />

            <Box sx={subHeader}>
                <Box display="flex" alignItems="center">
                    <IconButton onClick={() => navigate(-1)} sx={backBtn}>
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#172b4d' }}>Workflow</Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: 14 } }}>
                        <Avatar alt="User 1" src="/1.jpg" />
                        <Avatar alt="User 2" src="/2.jpg" />
                        <Avatar>{user?.username?.[0]}</Avatar>
                    </AvatarGroup>
                    <Button
                        startIcon={<PersonAddAltIcon />}
                        variant="contained"
                        size="small"
                        onClick={handleInvite}
                        sx={inviteBtn}
                    >
                        Invite
                    </Button>
                </Box>
            </Box>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="all-lists" direction="horizontal" type="COLUMN">
                    {(p) => (
                        <Box ref={p.innerRef} {...p.droppableProps} sx={listWrapper}>
                            {lists.map((list, i) => (
                                <Draggable key={`list-${list.id}`} draggableId={`list-${list.id}`} index={i}>
                                    {(p) => (
                                        <Box ref={p.innerRef} {...p.draggableProps} sx={listContainer}>
                                            <Box {...p.dragHandleProps} sx={listHeader}>
                                                <Typography sx={listTitle}>{list.listName}</Typography>
                                                <IconButton size="small" onClick={() => handleDeleteList(list.id)}>
                                                    <DeleteOutlineIcon sx={{fontSize: 18}} />
                                                </IconButton>
                                            </Box>

                                            <Droppable droppableId={`list-${list.id}`} type="CARD">
                                                {(p, snapshot) => (
                                                    <Box ref={p.innerRef} {...p.droppableProps} sx={cardsArea}>
                                                        {list.cards.map((card: any, idx: number) => (
                                                            <Draggable key={`card-${card.cardId}`} draggableId={`card-${card.cardId}`} index={idx}>
                                                                {(p, snapshot) => (
                                                                    <Paper
                                                                        ref={p.innerRef}
                                                                        {...p.draggableProps}
                                                                        {...p.dragHandleProps}
                                                                        sx={{
                                                                            ...cardPaper,
                                                                            boxShadow: snapshot.isDragging ? '0 10px 20px rgba(0,0,0,0.1)' : 'none',
                                                                        }}
                                                                    >
                                                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                                                            <Box display="flex" alignItems="center">
                                                                                <Checkbox
                                                                                    icon={<CheckCircleOutlineIcon sx={{fontSize: 20}} />}
                                                                                    checkedIcon={<CheckCircleIcon sx={{fontSize: 20, color: '#36b37e'}} />}
                                                                                    sx={{p: 0, mr: 1}}
                                                                                />
                                                                                <Typography sx={cardText}>{card.cardName}</Typography>
                                                                            </Box>
                                                                            <Tooltip title="Delete">
                                                                                <IconButton size="small" className="delete-card-btn" onClick={() => handleDeleteCard(card.cardId)}>
                                                                                    <DeleteOutlineIcon sx={{fontSize: 16}} />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Box>
                                                                    </Paper>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {p.placeholder}
                                                    </Box>
                                                )}
                                            </Droppable>

                                            <Box sx={footerInputArea}>
                                                <InputBase
                                                    placeholder="Add a card..."
                                                    fullWidth
                                                    startAdornment={<AddIcon sx={{color: '#44546f', mr: 1, fontSize: 18}} />}
                                                    value={newCardTitles[list.id] || ""}
                                                    onChange={(e) => setNewCardTitles({...newCardTitles, [list.id]: e.target.value})}
                                                    onKeyDown={async (e) => {
                                                        if (e.key === "Enter" && newCardTitles[list.id]) {
                                                            const title = newCardTitles[list.id];
                                                            setNewCardTitles({...newCardTitles, [list.id]: ""});
                                                            await api.post(`/cards?userId=${userId}`, { cardName: title, listId: list.id });
                                                            fetchContent();
                                                        }
                                                    }}
                                                    sx={inputBaseStyle}
                                                />
                                            </Box>
                                        </Box>
                                    )}
                                </Draggable>
                            ))}
                            {p.placeholder}

                            {/* ADD LIST SECTION */}
                            <Box sx={addListContainer}>
                                <InputBase
                                    placeholder="+ Add another list"
                                    fullWidth
                                    value={newListTitle}
                                    onChange={(e) => setNewListTitle(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") handleCreateList(); }}
                                    sx={addListInput}
                                />
                                {newListTitle.trim() && (
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={handleCreateList}
                                        sx={addListBtn}
                                    >
                                        Add List
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>
        </Box>
    );
}

// ================= STYLES =================
const root = { height: "100vh", width: "100vw", bgcolor: "#f1f2f4", display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'absolute', top: 0, left: 0 };
const subHeader = { pt: "85px", pb: 2, px: 4, display: "flex", alignItems: "center", justifyContent: 'space-between' };
const backBtn = { mr: 2, bgcolor: '#fff', '&:hover': { bgcolor: '#f1f2f4' }, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' };
const inviteBtn = { bgcolor: '#0079bf', textTransform: 'none', borderRadius: '6px', fontWeight: 600, '&:hover': {bgcolor: '#026aa7'} };
const listWrapper = { display: "flex", px: 4, py: 1, gap: 2, overflowX: "auto", flex: 1, alignItems: 'flex-start' };
const listContainer = { minWidth: 280, width: 280, bgcolor: "#ebedf0", borderRadius: '12px', display: 'flex', flexDirection: 'column', maxHeight: '90%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const listHeader = { p: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: "grab" };
const listTitle = { fontWeight: 700, fontSize: '0.9rem', color: '#172b4d' };
const cardsArea = { p: '0 12px 4px 12px', flex: 1, overflowY: "auto" };
const cardPaper = {
    p: '8px 10px', mb: 1, borderRadius: '8px', bgcolor: '#fff', border: '1px solid #ddd',
    '& .delete-card-btn': { opacity: 0, transition: '0.2s' },
    '&:hover .delete-card-btn': { opacity: 1 }
};
const cardText = { fontSize: '0.85rem', color: '#172b4d' };
const footerInputArea = { p: '8px 12px 12px 12px' };
const inputBaseStyle = { fontSize: '0.85rem', p: '6px 10px', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } };
const center = { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" };

// New Styles
const addListContainer = {
    minWidth: 280, width: 280, bgcolor: "rgba(255,255,255,0.45)", borderRadius: '12px', p: '6px',
    height: 'fit-content', transition: '0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.7)' }
};
const addListInput = { fontSize: '0.9rem', fontWeight: 600, px: 1, borderRadius: '8px' };
const addListBtn = { mt: 1, ml: 1, bgcolor: '#0079bf', textTransform: 'none', borderRadius: '6px', '&:hover': {bgcolor: '#026aa7'} };

export default BoardDetail;