// 'use client'
// import { useSession, signIn, signOut } from "next-auth/react";

// export default function ProtectedPage() {
//   const { data: session } = useSession();
//   if (!session) {
//     return (
//       <div>
//         <p>You are not signed in.</p>
//         <button onClick={() => signIn("google")}>Sign in with Google</button>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <p>Welcome, {session.user.name}</p>

//       <button onClick={() => signOut()}>Sign out</button>
//     </div>
//   );
// }
'use client';
import { useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      // Check the user's role and redirect accordingly
      const userRole = session.user.role;
      if (userRole === "TeamLead") {
        router.push("/teamlead");
      } else if (userRole === "HOD") {
        router.push("/hod");
      }
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return (
      <div>
        <p>You are not signed in.</p>
        <button onClick={() => signIn("google")}>Sign in with Google</button>
      </div>
    );
  }

  return (
    <div>
      <p>Welcome, {session.user.name}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
