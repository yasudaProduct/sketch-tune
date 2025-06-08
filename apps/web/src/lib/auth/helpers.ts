"use server";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "@/lib/auth";

export async function signIn() {
    await nextAuthSignIn();
}

export async function signOut() {
    await nextAuthSignOut();
}