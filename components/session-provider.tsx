"use client"

import type React from "react"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>
}

