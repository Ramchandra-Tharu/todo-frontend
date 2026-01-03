"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { signup as signupApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const decorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push("/todos");
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate card
            gsap.fromTo(
                cardRef.current,
                { opacity: 0, y: 40, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }
            );

            // Animate decoration
            gsap.fromTo(
                decorRef.current?.children || [],
                { opacity: 0, scale: 0 },
                { opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, delay: 0.4, ease: "back.out(1.7)" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await signupApi(name, email, password);

        if (result.success) {
            // Success animation then redirect
            gsap.to(cardRef.current, {
                scale: 0.95,
                opacity: 0,
                duration: 0.3,
                onComplete: () => router.push("/login"),
            });
        } else {
            setError(result.error || "Signup failed");
            gsap.fromTo(
                cardRef.current,
                { x: -10 },
                { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }
            );
        }

        setIsLoading(false);
    };

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="flex min-h-screen items-center justify-center p-4"
        >
            <div className="flex w-full max-w-4xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
                {/* Left side - Branding */}
                <div className="flex-1 text-center lg:text-left">
                    <div ref={decorRef} className="mb-6 flex items-center justify-center gap-2 lg:justify-start">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-bold">TaskFlow</span>
                    </div>
                    <h1 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
                        Start your journey
                    </h1>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400">
                        Create an account and take control of your tasks. Simple, fast, and
                        beautifully designed.
                    </p>
                </div>

                {/* Right side - Signup form */}
                <div ref={cardRef} className="w-full max-w-sm">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Account</CardTitle>
                            <CardDescription>
                                Fill in your details to get started
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                {error && (
                                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium" htmlFor="name">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium" htmlFor="email">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium" htmlFor="password">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10"
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col gap-4">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                                <p className="text-center text-sm text-zinc-500">
                                    Already have an account?{" "}
                                    <Link
                                        href="/login"
                                        className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
