"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import RequestForm from "@/components/RequestForm";
export default function TeamLeadPage() {
  const { data: session } = useSession();

  if (!session) {
    return <p>Loading...</p>;
  }

  return (<>
  <div className="bg-white">
    <RequestForm/>
    <button onClick={() => signOut()}>Sign out</button>
    </div></>);
}
