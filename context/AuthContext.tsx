"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    name: string
    email: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    isLoading: boolean
    login: (token: string, user?: User) => void
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check for existing token on mount
        const savedToken = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')

        if (savedToken) {
            setToken(savedToken)
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser))
                } catch {
                    // Invalid user data
                }
            }
        }
        setIsLoading(false)
    }, [])

    const login = (newToken: string, newUser?: User) => {
        setToken(newToken)
        localStorage.setItem('token', newToken)

        if (newUser) {
            setUser(newUser)
            localStorage.setItem('user', JSON.stringify(newUser))
        }
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                login,
                logout,
                isAuthenticated: !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
