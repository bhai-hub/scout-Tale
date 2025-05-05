
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

// Define the context with a default value or undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'isAdminAuthenticated';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading until checked

  // Check session storage on initial load (client-side only)
  useEffect(() => {
    // Ensure this code runs only on the client
    if (typeof window !== 'undefined') {
        try {
            const storedAuthState = sessionStorage.getItem(AUTH_STORAGE_KEY);
            if (storedAuthState === 'true') {
            setIsAdmin(true);
            }
        } catch (error) {
            console.error("Could not access session storage:", error);
        } finally {
            setIsLoading(false); // Finished checking
        }
    } else {
        // On the server, assume not authenticated and finish loading
        setIsLoading(false);
    }
  }, []);

  const login = useCallback(() => {
     setIsAdmin(true);
     // Ensure this code runs only on the client
     if (typeof window !== 'undefined') {
        try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
        } catch (error) {
        console.error("Could not set session storage:", error);
        }
     }
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    // Ensure this code runs only on the client
    if (typeof window !== 'undefined') {
        try {
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
        } catch (error) {
            console.error("Could not remove session storage item:", error);
        }
    }
  }, []);

  // Provide the context value
  const contextValue = { isAdmin, isLoading, login, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
