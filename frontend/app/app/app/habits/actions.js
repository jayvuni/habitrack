"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function revLogs(id) {
  console.log("reved");
  revalidateTag("logs" + id);
}

export async function getData(id) {
  const cookieStore = cookies();
  const token = cookieStore.get("TokenLog");
  const res = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL + "/api/habit-logs/" + id,
    {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      next: { tags: ["logs" + id] },
    }
  );
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  console.log(res.status);
  if (res.status == 401) {
    cookieStore.delete("TokenLog");
    redirect("/login");
  } else if (res.status != 200) {
    redirect("/app/habits");
    throw new Error(res.statusText);
  }

  return res.json();
}

export async function onHabitSubmit(event) {
  console.log("called");
  const cookieStore = cookies();
  const token = cookieStore.get("TokenLog");
  // Clear previous errors when a new request starts
  try {
    console.log(event);
    const response = await fetch(process.env.BASE_URL + "/api/habits/add", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      method: "POST",
      body: JSON.stringify({
        habit_name: event.data,
      }),
    });
    if (response.status == 401) {
      cookieStore.delete("TokenLog");
      throw new Error(await response.json());
    } else if (response.status !== 201) {
      throw new Error(await response.json());
    }
  } catch (error) {
    // Capture the error message to display to the user
    console.log(error);
    throw new Error(JSON.stringify(error));
  }
  return { success: "Habit added succesffully" };
}

export async function MarkCompletedSubmit(id) {
  console.log("called");
  const cookieStore = cookies();
  const token = cookieStore.get("TokenLog");
  // Clear previous errors when a new request starts
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/habits/progression/" + id,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
    if (response.status == 401) {
      cookieStore.delete("TokenLog");
      throw new Error(await response.json());
    } else if (response.status !== 201) {
      throw new Error(await response.json());
    }
  } catch (error) {
    // Capture the error message to display to the user
    console.log(error);
    throw new Error(JSON.stringify(error));
  }
  return { success: "Habit progression updated succesffully" };
}

export async function DeleteHabitSubmit(id) {
  console.log("called");
  const cookieStore = cookies();
  const token = cookieStore.get("TokenLog");
  // Clear previous errors when a new request starts
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/habits/delete/" + id,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
    if (response.status == 401) {
      cookieStore.delete("TokenLog");
      throw new Error(response.statusText);
    } else if (response.status !== 200) {
      throw new Error(response.statusText);
    }
  } catch (error) {
    // Capture the error message to display to the user
    console.log(error);
    throw new Error(error);
  }
  return { success: "Habit progression updated succesffully" };
}
