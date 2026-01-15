import { Navigate } from "react-router-dom";
import type {JSX} from "react";

function ProtectedRoute({ children }: { children: JSX.Element }) {
    const user = localStorage.getItem("user");

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
