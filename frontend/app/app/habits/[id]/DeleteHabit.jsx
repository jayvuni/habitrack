"use client";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Trash } from "lucide-react";
import { useState } from "react";
import { getData } from "./page";
import { revalidateTag } from "next/cache";
import revHabits from "../../actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { DeleteHabitSubmit } from "../actions";

export default function DeleteHabit({ id }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 gap-1">
          <Trash className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete this
            habit and remove its data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={loading}
            variant="destructive"
            onClick={async () => {
              setLoading(true);
              try {
                await DeleteHabitSubmit(id);
                revHabits();
                router.push("/app/habits");
                setLoading(false);
              } catch (e) {
                setLoading(false);
              }
            }}
          >
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
