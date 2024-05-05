import Link from "next/link";
import {
  Activity,
  AlignLeft,
  ArrowUpRight,
  Check,
  CircleUser,
  CreditCard,
  DollarSign,
  Dot,
  Flame,
  Menu,
  Package2,
  PencilLine,
  Search,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LineChart from "./components/LineChart";
import LineChartComponent from "./components/LineChart";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const revalidate = 0;

async function getData() {
  const cookieStore = cookies();
  const token = cookieStore.get("TokenLog");
  const res = await fetch(process.env.BASE_URL + "/api/dashboard", {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
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
  }

  return res.json();
}

export default async function Page() {
  const data = await getData();
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card x-chunk="dashboard-01-chunk-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalHabits}</div>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeHabits}</div>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Longest Streak
            </CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.longestStreak.longestStreak}
            </div>
            {/* <p className="text-xs text-muted-foreground">Smoking</p> */}
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Journal Entries
            </CardTitle>
            <AlignLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.journalEntries.count}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Habit Completion</CardTitle>
              <CardDescription>
                Habit completion trends over this month
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/app/habits">
                View All Habits
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <LineChartComponent data={data.habitCompletionTrends} />
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-5">
          <CardHeader>
            <CardTitle>Recent Journal Entries</CardTitle>
            <CardDescription>Get a glance of your journal</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            {data.journalEntries.data.map((entry) => (
              <div className="flex items-center gap-4" key={entry.entry_id}>
                <PencilLine className="hidden h-4 w-4 sm:flex" />
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    {entry.entry_content}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
