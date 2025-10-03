import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

const SETUP_PATH = "/setup/master-passphrase";

export default function E2EEAuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    const user = session?.user as any;
    
    const isSetupRequired = user && !user.masterPassphraseSetupComplete;
    const isSetupPage = pathname === SETUP_PATH;

    if (isSetupRequired && !isSetupPage) {
      router.replace(SETUP_PATH);
      return;
    }

    if (!isSetupRequired && isSetupPage) {
      router.replace("/dashboard");
      return;
    }
  }, [session, status, router, pathname]);

  if (status === "loading" || (session?.user && !session.user.masterPassphraseSetupComplete && pathname !== SETUP_PATH)) {
    return <div className="min-h-screen flex items-center justify-center">Loading Secure Session...</div>;
  }

  return <>{children}</>;
}