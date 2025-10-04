"use client"


import { useCurrentUser } from '@/hooks/useCurrentUser'
import { redirect } from 'next/navigation';
import React from 'react'

function Dashboard() {

    const user = useCurrentUser();
    console.log("Current User in Dashboard:", user);

    if(!user) {
        return <div>Loading...</div>
    }

    if(!user.masterPassphraseSetupComplete) {
        redirect('/setup/master-passphrase');
    }

  return (
    <div>
        Dashboard
    </div>
  )
}

export default Dashboard
