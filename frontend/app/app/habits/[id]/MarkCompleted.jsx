"use client";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { getData } from "./page";
import { revalidateTag } from "next/cache";
import revHabits from "../../actions";
import revLogs, { MarkCompletedSubmit } from "../actions";

export default function MarkCompleted({ id, completed }) {
  const [status, setStatus] = useState(completed);
  const [loading, setLoading] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-8 gap-1"
      disabled={status || loading}
      onClick={async () => {
        setLoading(true);
        try {
          await MarkCompletedSubmit(id);
          revHabits();
          revLogs(id);
          setLoading(false);
          setStatus(true);
        } catch (e) {
          setLoading(false);
        }
      }}
    >
      {loading ? (
        <Loader2 className="animate-spin h-3.5 w-3.5" />
      ) : (
        <Check className="h-3.5 w-3.5" />
      )}
      <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
        {status == true && "Marked as completed"}
        {status == false && "Mark as completed for today"}
      </span>
    </Button>
  );
}
