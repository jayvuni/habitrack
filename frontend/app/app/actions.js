"use server";

import { revalidateTag } from "next/cache";

export default async function revHabits() {
  console.log("reved");
  revalidateTag("habits");
}
