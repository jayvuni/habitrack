import Image from "next/image";
import {
  File,
  Flame,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { DrawerDialogDemo } from "../components/AddHabit";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const revalidate = 0;
export const dynamic = "force-dynamic";

async function getData() {
  const cookieStore = cookies();
  const token = cookieStore.get("TokenLog");
  const res = await fetch(process.env.BASE_URL + "/api/habits/view", {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    next: { tags: ["habits"] },
  });
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  console.log(res.status);
  if (res.status == 401) {
    cookieStore.delete("TokenLog");
    redirect("/login");
  } else if (res.status != 200) {
    console.log(res);
    throw new Error("Failed to fetch data");
    redirect("/app/habits");
  }

  return res.json();
}

export default async function Page() {
  const data = await getData();
  console.log(data);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Tabs defaultValue="all">
        <div className="flex items-center">
          {/* <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="archived" className="hidden sm:flex">
              Archived
            </TabsTrigger>
          </TabsList> */}
          <div className="ml-auto flex items-center gap-2">
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
            <DrawerDialogDemo />
          </div>
        </div>
        <TabsContent value="all">
          <Card x-chunk="dashboard-06-chunk-0">
            <CardHeader>
              <CardTitle>Habits</CardTitle>
              <CardDescription>
                Track Your Progress and Build Routines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Started at</TableHead>
                    <TableHead>Streak</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.habits.map((habit) => (
                    <TableRow key={habit.habit_id}>
                      <TableCell className="font-medium">
                        <Link href={"/app/habits/" + habit.habit_id}>
                          {habit.habit_name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {new Date(habit.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline">
                          <Flame className="w-4 h-4 mr-1" />{" "}
                          {habit.currentStreak.streakLength}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>1-{data.habits.length}</strong> of{" "}
                <strong>{data.habits.length}</strong> habits
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
