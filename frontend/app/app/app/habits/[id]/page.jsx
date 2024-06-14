import { Check, ChevronLeft, MoreVertical, Pen, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import MarkCompleted from "./MarkCompleted";
import DeleteHabit from "./DeleteHabit";
import { permanentRedirect, redirect } from "next/navigation";
import { getData } from "../actions";

export const revalidate = 0;

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  let month = String(today.getMonth() + 1).padStart(2, "0"); // Add leading zero if necessary
  let day = String(today.getDate()).padStart(2, "0"); // Add leading zero if necessary

  return `${year}-${month}-${day}`;
}

export default async function Page({ params }) {
  const { id } = params;
  const data = await getData(id);
  console.log(data);
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-start bg-muted/50">
          <div className="flex items-center gap-3">
            <Link href="/app/habits">
              <Button variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <CardTitle className="group flex items-center gap-2 text-lg">
                {data.habit_name}
              </CardTitle>
              <CardDescription>
                Started at: {new Date(data.created_at).toLocaleString()}
              </CardDescription>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <MarkCompleted
              id={id}
              completed={
                data.habit_progression.find(
                  (obj) => obj.progress_date == getTodayDate()
                ) == null
                  ? false
                  : true
              }
            />
            <DeleteHabit id={id} />
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="bg-muted/50">
          <div className="flex flex-col gap-0.5">
            <CardTitle className="group flex items-center gap-2 text-lg">
              Recent Logs
            </CardTitle>
            <CardDescription>Check out your latest progress</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Log #</TableHead>
                <TableHead>Log Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.habit_progression.map((log) => (
                <TableRow key={log.progression_id}>
                  <TableCell className="font-medium">
                    {log.progression_id}
                  </TableCell>
                  <TableCell>
                    {new Date(log.progress_date).toDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
