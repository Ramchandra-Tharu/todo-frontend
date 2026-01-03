const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.message || 'Request failed' };
        }

        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
}

// Auth APIs
export async function signup(name: string, email: string, password: string) {
    return apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
}

export async function login(email: string, password: string) {
    return apiRequest<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

// Todo APIs
export interface Todo {
    _id: string;
    title: string;
    completed?: boolean;
    createdAt?: string;
}

export async function getTodos() {
    return apiRequest<Todo[]>('/todos/');
}

export async function addTodo(title: string) {
    return apiRequest<Todo>('/todos/', {
        method: 'POST',
        body: JSON.stringify({ title }),
    });
}

export async function deleteTodo(id: string) {
    return apiRequest(`/todos/${id}`, {
        method: 'DELETE',
    });
}
