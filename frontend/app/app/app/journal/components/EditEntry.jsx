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
import { Pen, PlusCircle } from "lucide-react";
import revJournal, { onEntryUpdate } from "../actions";

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

export function EditEntry({ oldName, id }) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="hover:bg-gray-900 w-full">
            <Pen className="h-3 w-3 mr-2" />
            <span>Edit entry</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit this entry</DialogTitle>
          </DialogHeader>
          <ProfileForm oldName={oldName} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="hover:bg-gray-900 w-full">
          <Pen className="h-3 w-3 mr-2" />
          <span>Edit entry</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit this entry</DrawerTitle>
        </DrawerHeader>
        <ProfileForm className="px-4" oldName={oldName} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    try {
      await onEntryUpdate({
        id,
        data: new FormData(event.currentTarget).get("entry_content"),
      });
      revJournal();
      setOpen(false);
    } catch (error) {
      // Capture the error message to display to the user
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  function ProfileForm({ className, oldName }) {
    return (
      <form
        className={cn("grid items-start gap-4", className)}
        onSubmit={onSubmit}
      >
        <div className="grid gap-2">
          <Label htmlFor="">Entry content:</Label>
          <Input type="text" defaultValue={oldName} name="entry_content" />
        </div>
        <Button disabled={isLoading} type="submit">
          {isLoading ? "Loading..." : "Save"}
        </Button>
      </form>
    );
  }
}
