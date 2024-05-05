import { Dot, Pen, Trash } from "lucide-react";
import { DrawerDialogDemo } from "../components/AddEntry";
import { DeleteEntryDialog } from "../components/DeleteEntry";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EditEntry } from "./components/EditEntry";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getData() {
  const cookieStore = cookies();
  const token = cookieStore.get("TokenLog");
  const res = await fetch(process.env.BASE_URL + "/api/journal/entries", {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    next: { tags: ["journal"] },
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
  console.log(data);
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Journal Insights</h1>
          <h2>Express yourself freely, write without limits</h2>
        </div>
        <DrawerDialogDemo />
      </div>
      <div>
        {data.entries.map((entry) => (
          <div
            key={entry.entry_id}
            className="border-gray-700 mb-2 border-2 lg:border-0 group lg:flex justify-between hover:bg-muted rounded-lg py-5 lg:py-2 px-5 items-center"
          >
            <div className="flex w-full lg:w-auto justify-center">
              <div className="text-muted-foreground">
                {new Date(entry.created_at).toDateString()}
              </div>
              <Dot />
              <div className="">{entry.entry_content}</div>
            </div>
            <div className="mt-3 lg:mt-0  opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ">
              <EditEntry oldName={entry.entry_content} id={entry.entry_id} />
              <DeleteEntryDialog id={entry.entry_id}>
                <Button
                  variant="outline"
                  className="bg-red-700 hover:bg-red-800"
                >
                  <Trash className="h-3 w-3 mr-2" />
                  <span>Delete entry</span>
                </Button>
              </DeleteEntryDialog>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
