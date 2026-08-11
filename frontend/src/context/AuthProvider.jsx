import { useState } from "react";
import { loginToken } from "../api/authApi";
import { setAccessToken } from "../api/client";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = async (credentials) => {
        const response = await loginToken(credentials);
        const authData = response.data.data;

        setAccessToken(authData.access);
        setUser(authData.user);
        setIsAuthenticated(true);

        return authData.user;
    }

    const logout = () => {
        setAccessToken(null);
        setUser(null);
        setIsAuthenticated(false);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}