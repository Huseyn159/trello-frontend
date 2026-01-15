import { useEffect, useState } from "react";
import api from "../api/api";
import {
    Card as MuiCard,
    CardContent,
    Typography,
    Box,
} from "@mui/material";

interface Card {
    cardId: number;
    cardName: string;
}

function Cards({ listId }: { listId: number }) {
    const [cards, setCards] = useState<Card[]>([]);

    useEffect(() => {
        api
            .get(`/lists/${listId}/cards`)
            .then((res) => setCards(res.data));
    }, [listId]);

    return (
        <Box>
            {cards.map((card) => (
                <MuiCard
                    key={card.cardId}
                    sx={{ mb: 1 }}
                    variant="outlined"
                >
                    <CardContent>
                        <Typography>
                            {card.cardName}
                        </Typography>
                    </CardContent>
                </MuiCard>
            ))}
        </Box>
    );
}

export default Cards;
