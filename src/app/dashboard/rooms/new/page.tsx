import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RoomForm from "@/components/dashboard/RoomForm";

// This is a server component
export default async function NewRoomPage() {
  const session = await auth();
  
  if (!session?.user) {
    return redirect('/signin');
  }
  
  const userId = session.user.id as string;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Create New Game Room</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Set up a new THR game room with custom reward tiers.
          </p>
        </div>
        <Link href="/dashboard/rooms">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card className="p-6">
        <RoomForm userId={userId} />
      </Card>
    </div>
  );
} 