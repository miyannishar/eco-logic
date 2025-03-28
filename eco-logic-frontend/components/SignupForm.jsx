"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "./FormInput";
import Button from "./Button";
import FormError from "./FormError";

export default function SignupForm({ onSuccess, onClose, onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
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
        
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: `${formData.firstName} ${formData.lastName}`.trim()
                }),
            });

            const data = await res.json();

            if (res.ok) {
                if (onSuccess) onSuccess();
                router.push('/welcome');
            } else {
                setError(data.message || 'Registration failed');
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
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        placeholder="John"
                    />
                    <FormInput
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        placeholder="Doe"
                    />
                </div>

                <FormInput
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                />

                <FormInput
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                />

                <FormInput
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                />

                <FormError message={error} />

                <Button
                    type="submit"
                    disabled={isLoading}
                    fullWidth
                >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={() => {
                            if (onClose) onClose();
                            if (onSwitchToLogin) onSwitchToLogin();
                        }}
                        className="text-blue-600 hover:text-blue-500 font-medium inline-block"
                    >
                        Sign in
                    </button>
                </p>
            </form>
        </div>
    );
} 