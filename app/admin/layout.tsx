import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin - Active Capital",
  description: "Admin interface for Active Capital",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
