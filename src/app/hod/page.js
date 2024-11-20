"use client";

import { useSession, signIn, signOut } from "next-auth/react";
export default function HODPage() {
  const { data: session } = useSession();

  if (!session) {
    return <p>Loading...</p>;
  }
  return (
    <>
      <h1>Welcome, {session.user.name}. You are logged in as HOD.</h1>
      <p></p>
      <button onClick={() => signOut()}>Sign out</button>
    </>
  );
}
