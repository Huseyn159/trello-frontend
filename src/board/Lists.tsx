import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import {
    Box,
    Paper,
    Typography,
} from "@mui/material";
import Navbar from "../layout/Navbar";
import Cards from "./Cards";

interface List {
    id: number;
    listName: string;
}

function Lists() {
    const { boardId } = useParams();
    const [lists, setLists] = useState<List[]>([]);

    useEffect(() => {
        api
            .get(`/boards/${boardId}/lists`)
            .then((res) => setLists(res.data));
    }, [boardId]);

    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            {/* MAIN AREA */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    gap: 2,
                    p: 2,
                    overflowX: "auto",
                    backgroundColor: "#f4f5f7",
                }}
            >
                {lists.map((list) => (
                    <Paper
                        key={list.id}
                        sx={{
                            width: 320,
                            p: 2,
                            flexShrink: 0,
                        }}
                        elevation={3}
                    >
                        <Typography variant="h6" mb={2}>
                            {list.listName}
                        </Typography>

                        <Cards listId={list.id} />
                    </Paper>
                ))}
            </Box>
        </Box>
    );
}

export default Lists;
