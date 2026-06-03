import { AuthProvider } from "@/components/auth/auth-provider";
import { Logo } from "@/components/ui/primitives";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <main className="min-h-screen bg-[#FAFAF7] flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </AuthProvider>
  );
}
