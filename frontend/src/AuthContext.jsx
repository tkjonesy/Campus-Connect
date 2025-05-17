import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initialize authState
    const [authState, setAuthState] = useState({
        isAuthenticated: null,
        user: null,
        isAuthLoaded: false
    });

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');

            // No token exists
            if (!token) {
                setAuthState({ isAuthenticated: false, user: null });
                return;
            }

            try {
                const response = await fetch(`/api/verify-token?token=${encodeURIComponent(token)}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });

                const data = await response.json();

                // Backend was able to successfully validate token
                if (data.isAuthenticated) {
                    setAuthState({isAuthenticated: true, user: data.user, isAuthLoaded: true});
                }

                // Backend invalidated token
                else {
                    logout();
                    
                }
            }
            catch (error) {
                console.log('Token validation failed:', error);
                setAuthState({isAuthenticated: false, user: null});
                logout();
            }
        };
        verifyToken();
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setAuthState({ isAuthenticated: false, user: null, isAuthLoaded: true});
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: authState.isAuthenticated,
                user: authState.user,
                isAuthLoaded: authState.isAuthLoaded,
                setAuthState,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);