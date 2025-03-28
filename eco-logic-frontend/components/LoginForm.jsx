'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FormInput from "./FormInput";
import Button from "./Button";
import FormError from "./FormError";

export default function LoginForm({ onSuccess, onClose, onSwitchToSignup }) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                if (onSuccess) onSuccess();
                router.push('/welcome');
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
                <FormInput
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                />

                <FormInput
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                />

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="remember"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                            Remember me
                        </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                        Forgot password?
                    </Link>
                </div>

                <FormError message={error} />

                <Button
                    type="submit"
                    disabled={isLoading}
                    fullWidth
                >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={() => {
                            if (onClose) onClose();
                            if (onSwitchToSignup) onSwitchToSignup();
                        }}
                        className="text-blue-600 hover:text-blue-500 font-medium inline-block"
                    >
                        Sign up
                    </button>
                </p>
            </form>
        </div>
    );
}