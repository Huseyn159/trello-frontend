import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Workspaces from "./workspace/Workspaces";
import BoardPage from "./board/Board"; // Sənin faylın Board.tsx-dir
import ProtectedRoute from "./auth/ProtectedRoute";
import BoardDetail from "./board/BoardDetail";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Workspace Siyahısı */}
                <Route
                    path="/workspaces"
                    element={
                        <ProtectedRoute>
                            <Workspaces />
                        </ProtectedRoute>
                    }
                />

                {/* WORKSPACE-Ə KLİKLƏYƏNDƏ BURA GƏLƏCƏKSƏN */}
                <Route
                    path="/workspaces/:workspaceId/boards"
                    element={
                        <ProtectedRoute>
                            <BoardPage />
                        </ProtectedRoute>
                    }
                />

                {/* KONKRET BİR BOARD-A KLİKLƏYƏNDƏ BURA GƏLƏCƏKSƏN */}
                <Route
                    path="/boards/:boardId"
                    element={
                        <ProtectedRoute>
                            <BoardDetail />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;