"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { login as loginApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);

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

            // Animate features
            gsap.fromTo(
                featuresRef.current?.children || [],
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, delay: 0.3, ease: "power2.out" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await loginApi(email, password);

        if (result.success && result.data?.token) {
            login(result.data.token);
            router.push("/todos");
        } else {
            setError(result.error || "Login failed");
            // Shake animation on error
            gsap.fromTo(
                cardRef.current,
                { x: -10 },
                { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }
            );
        }

        setIsLoading(false);
    };

    const features = [
        "Stay organized with ease",
        "Track your daily tasks",
        "Simple and beautiful interface",
    ];

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
                {/* Left side - Features */}
                <div className="flex-1 text-center lg:text-left">
                    <h1 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
                        Welcome back
                    </h1>
                    <p className="mb-8 text-lg text-zinc-500 dark:text-zinc-400">
                        Sign in to continue managing your tasks
                    </p>
                    <div ref={featuresRef} className="space-y-4">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400"
                            >
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right side - Login form */}
                <div ref={cardRef} className="w-full max-w-sm">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sign In</CardTitle>
                            <CardDescription>
                                Enter your credentials to access your account
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
                                            Sign In
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                                <p className="text-center text-sm text-zinc-500">
                                    Don&apos;t have an account?{" "}
                                    <Link
                                        href="/signup"
                                        className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
                                    >
                                        Sign up
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
