"use client"


import { logout } from '@/actions/logout';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { redirect } from 'next/navigation';
import React, { useTransition } from 'react'

function Dashboard() {

    const [isPending, startTransition] = useTransition();

    const user = useCurrentUser();
    console.log("Current User in Dashboard:", user);

    if(!user) {
        return <div>Loading...</div>
    }

    if(!user.masterPassphraseSetupComplete) {
        redirect('/setup/master-passphrase');
    }

    const handleLogout = async () => {
        try {
          startTransition(async() => {
            await logout();
          }) 
        } catch (error) {
            console.error("Error during logout:", error);
            redirect('/dashboard');
        }
    }

  return (
    <div>
        <Button variant="destructive" onClick={handleLogout} disabled={isPending}>
            {isPending ? 'Logging out...' : 'Logout'}
        </Button>
    </div>
  )
}

export default Dashboard
