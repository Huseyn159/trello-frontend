function Logout() {
    const handleLogout = () => {
        localStorage.removeItem("user");
        alert("Logged out");
    };

    return <button onClick={handleLogout}>Logout</button>;
}

export default Logout;
