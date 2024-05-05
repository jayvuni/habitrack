"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export default async function revJournal() {
  console.log("reved");
  revalidateTag("journal");
}

export async function onEntrySubmit(event) {
  console.log("called");
  const cookieStore = cookies();
  const token = cookieStore.get("TokenLog");
  // Clear previous errors when a new request starts
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/journal/add",
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        method: "POST",
        body: JSON.stringify({
          entry_content: event.data,
        }),
      }
    );
    if (response.status == 401) {
      cookieStore.delete("TokenLog");
      redirect("/login");
    } else if (response.status !== 201) {
      return NextResponse.error(await response.json().message);
    } else {
      return { yes: "ey" };
    }
  } catch (error) {
    // Capture the error message to display to the user
    console.log(error);
    return NextResponse.error(error);
  }
}

export async function onEntryDelete(event) {
  console.log("called");
  const cookieStore = cookies();
  const token = cookieStore.get("TokenLog");
  // Clear previous errors when a new request starts
  try {
    const response = await fetch(
      process.env.BASE_URL + "/api/journal-entries/" + event.data,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        method: "DELETE",
      }
    );
    if (response.status == 401) {
      cookieStore.delete("TokenLog");
      return { error: await response.json() };
    } else if (response.status !== 201) {
      return { error: await response.json() };
    }
  } catch (error) {
    // Capture the error message to display to the user
    console.log(error);
    return { error: await response.json() };
  }
  return { response: await response.json() };
}

export async function onEntryUpdate(event) {
  console.log("called");
  const cookieStore = cookies();
  const token = cookieStore.get("TokenLog");
  // Clear previous errors when a new request starts
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/journal/edit/" + event.id,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        method: "PUT",
        body: JSON.stringify({
          entry_content: event.data,
        }),
      }
    );
    if (response.status == 401) {
      cookieStore.delete("TokenLog");
      return { error: await response.json() };
    } else if (response.status !== 201) {
      return { error: await response.json() };
    }
  } catch (error) {
    // Capture the error message to display to the user
    console.log(error);
    return { error: await response.json() };
  }
  return { response: await response.json() };
}
