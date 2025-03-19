"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { validateCousinEntry, activateCousinEntry } from "@/lib/actions";

export default function CousinEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  const handleValidate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!roomId) {
      setError("Invalid room access");
      setLoading(false);
      return;
    }

    try {
      const result = await validateCousinEntry(roomId, code);

      if (!result.success || !result.data) {
        setError(result.error || "Invalid entry code");
      } else {
        // If entry exists and has a user, redirect to sign in
        if (result.data.existingUser) {
          router.push(`/signin?entry=${code}&roomId=${roomId}`);
        } else {
          // Show name input for new entries
          setIsValidating(false);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!roomId) {
      setError("Invalid room access");
      setLoading(false);
      return;
    }

    try {
      const result = await activateCousinEntry(roomId, code, name);

      if (!result.success) {
        setError(result.error || "Failed to activate entry");
      } else {
        // Success - redirect to sign in
        router.push(`/signin?entry=${code}&roomId=${roomId}`);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Enter Game Room
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Please enter your unique entry code to join the game
          </p>
        </div>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/30 dark:border-red-700">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={isValidating ? handleValidate : handleActivate}>
          <div className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Entry Code
              </label>
              <Input
                id="code"
                name="code"
                type="text"
                required
                className="mt-1"
                placeholder="Enter your unique code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={!isValidating}
              />
            </div>
            {!isValidating && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Your Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? isValidating
                ? "Validating..."
                : "Activating..."
              : isValidating
              ? "Validate Code"
              : "Join Game"}
          </Button>
        </form>
      </Card>
    </div>
  );
} 