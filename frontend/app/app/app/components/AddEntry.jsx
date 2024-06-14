"use client";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import revHabits from "../actions";
import revJournal, { onEntrySubmit } from "../journal/actions";

function useMediaQuery(query) {
  const [value, setValue] = React.useState(false);

  React.useEffect(() => {
    function onChange(event) {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener("change", onChange);
    setValue(result.matches);

    return () => result.removeEventListener("change", onChange);
  }, [query]);

  return value;
}

const subtitle = [
  "Start building your routine today",
  "Take the first step towards your goals",
  "Let's add something positive to your routine",
  "Get started in seconds",
  "Define your goal and track its progress",
];
function random_item(items) {
  // Use Math.random() to generate a random number between 0 and 1,
  // multiply it by the length of the array, and use Math.floor() to round down to the nearest integer
  return items[Math.floor(Math.random() * items.length)];
}
const selectedSubtitle = random_item(subtitle);
export function DrawerDialogDemo() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors when a new request starts
    try {
      await onEntrySubmit({
        data: new FormData(event.currentTarget).get("entry_content"),
      });
      revJournal();
      setOpen(false);
    } catch (error) {
      // Capture the error message to display to the user
      setError(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  function ProfileForm({ className }) {
    return (
      <form
        className={cn("grid items-start gap-4", className)}
        onSubmit={onSubmit}
      >
        {error && <div style={{ color: "red" }}>{error}</div>}
        <div className="grid gap-2">
          <Label htmlFor="">Entry content:</Label>
          <Input type="text" name="entry_content" />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Save"}
        </Button>
      </form>
    );
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="h-7 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Entry
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add a new entry</DialogTitle>
            <DialogDescription>{selectedSubtitle}</DialogDescription>
          </DialogHeader>
          <ProfileForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Entry
          </span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add a new entry</DrawerTitle>
          <DrawerDescription>{selectedSubtitle}</DrawerDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
