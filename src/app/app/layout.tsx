import { AuthProvider } from "@/components/auth/auth-provider";
import { RouteGuard } from "@/components/app/route-guard";
import { AppShell } from "@/components/app/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RouteGuard>
        <AppShell>{children}</AppShell>
      </RouteGuard>
    </AuthProvider>
  );
}
