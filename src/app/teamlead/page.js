"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import RequestForm from "@/components/RequestForm";

export default function TeamLeadPage() {
  const { data: session } = useSession();

  if (!session) {
    return <p>Loading...</p>;
  }

  return (<>
    <h1>Welcome, {session.user.name}. You are logged in as TeamLead.</h1>
    <p></p>
    <RequestForm/>
    <button onClick={() => signOut()}>Sign out</button>
  </>);
}
