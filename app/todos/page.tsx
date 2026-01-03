"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { getTodos, addTodo, deleteTodo, Todo } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Plus,
    Trash2,
    LogOut,
    Sparkles,
    ListTodo,
    Calendar,
} from "lucide-react";

export default function TodosPage() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const router = useRouter();

    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const todoRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    // Auth check
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, authLoading, router]);

    // Fetch todos
    useEffect(() => {
        if (isAuthenticated) {
            fetchTodos();
        }
    }, [isAuthenticated]);

    // Initial animations
    useEffect(() => {
        if (!isLoading && todos.length >= 0) {
            const ctx = gsap.context(() => {
                // Header animation
                gsap.fromTo(
                    headerRef.current,
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
                );

                // Form animation
                gsap.fromTo(
                    formRef.current,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: "power2.out" }
                );

                // Stagger list items
                const listItems = listRef.current?.children;
                if (listItems && listItems.length > 0) {
                    gsap.fromTo(
                        listItems,
                        { opacity: 0, x: -30 },
                        { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, delay: 0.3, ease: "power2.out" }
                    );
                }
            }, containerRef);

            return () => ctx.revert();
        }
    }, [isLoading, todos.length]);

    const fetchTodos = async () => {
        setIsLoading(true);
        const result = await getTodos();
        if (result.success && result.data) {
            setTodos(result.data);
        }
        setIsLoading(false);
    };

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

        setIsAdding(true);
        const result = await addTodo(newTodo.trim());

        if (result.success && result.data) {
            const newTodoItem = result.data;
            setTodos((prev) => [...prev, newTodoItem]);
            setNewTodo("");

            // Animate new item after render
            setTimeout(() => {
                const newItemEl = todoRefs.current.get(newTodoItem._id);
                if (newItemEl) {
                    gsap.fromTo(
                        newItemEl,
                        { opacity: 0, x: -50, scale: 0.9 },
                        { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
                    );
                }
            }, 10);
        }

        setIsAdding(false);
    };

    const handleDeleteTodo = async (id: string) => {
        const itemEl = todoRefs.current.get(id);

        // Animate out
        if (itemEl) {
            await gsap.to(itemEl, {
                opacity: 0,
                x: 50,
                scale: 0.9,
                duration: 0.3,
                ease: "power2.in",
            });
        }

        const result = await deleteTodo(id);
        if (result.success) {
            setTodos((prev) => prev.filter((todo) => todo._id !== id));
            todoRefs.current.delete(id);
        } else {
            // Revert animation if failed
            if (itemEl) {
                gsap.to(itemEl, { opacity: 1, x: 0, scale: 1, duration: 0.3 });
            }
        }
    };

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    if (authLoading || !isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div
                    ref={headerRef}
                    className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <h1 className="text-2xl font-bold">TaskFlow</h1>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                            <Calendar className="h-4 w-4" />
                            <span>{today}</span>
                        </div>
                    </div>
                    <Button variant="outline" onClick={logout} className="gap-2">
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>

                {/* Add Todo Form */}
                <form ref={formRef} onSubmit={handleAddTodo} className="mb-8">
                    <Card className="p-4">
                        <div className="flex gap-3">
                            <Input
                                type="text"
                                placeholder="What needs to be done?"
                                value={newTodo}
                                onChange={(e) => setNewTodo(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={isAdding || !newTodo.trim()}>
                                {isAdding ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Add
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                </form>

                {/* Stats */}
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <ListTodo className="h-4 w-4" />
                        <span>
                            {todos.length} {todos.length === 1 ? "task" : "tasks"}
                        </span>
                    </div>
                </div>

                {/* Todo List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
                        <p className="mt-4 text-sm text-zinc-500">Loading your tasks...</p>
                    </div>
                ) : todos.length === 0 ? (
                    <Card className="py-16 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                            <ListTodo className="h-8 w-8 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-semibold">No tasks yet</h3>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            Add your first task to get started
                        </p>
                    </Card>
                ) : (
                    <div ref={listRef} className="space-y-3">
                        {todos.map((todo) => (
                            <div
                                key={todo._id}
                                ref={(el) => {
                                    if (el) todoRefs.current.set(todo._id, el);
                                }}
                            >
                                <Card className="group p-4 transition-shadow hover:shadow-md">
                                    <div className="flex items-center gap-4">
                                        <Checkbox id={`todo-${todo._id}`} />
                                        <label
                                            htmlFor={`todo-${todo._id}`}
                                            className="flex-1 cursor-pointer text-sm font-medium peer-data-[state=checked]:line-through peer-data-[state=checked]:text-zinc-400"
                                        >
                                            {todo.title}
                                        </label>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                                            onClick={() => handleDeleteTodo(todo._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
