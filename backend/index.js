const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const { faker } = require("@faker-js/faker");
const randomstring = require("randomstring");
var cors = require("cors");

const app = express();

app.use(cors());

//Server port
const PORT = 3001;

//Supabase credentials
const supabaseUrl = "https://wvodopbhaxbxjbgjrlsn.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2b2RvcGJoYXhieGpiZ2pybHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMxMTU2MzMsImV4cCI6MjAyODY5MTYzM30.tpLigEc6cAReLy34IUBataBSfyvA70g42EVLm7yQjy0";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.use(express.json());

// Sign Up endpoint (POST)
app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password } = req.body;

  const { data, error } = await supabase.auth.signUp(
    { email, password },
    { data: { username } }
  ); // Add username to user object

  if (error) {
    return res.status(500).json({ message: "Failed to create user!", error });
  }

  const userData = {
    user_id: data.user.id, // Use the ID from the signup response
    username,
    email,
    // Add other user data properties here
  };
  console.log(userData)
  const { data: insertData, error: insertError } = await supabase
    .from("users")
    .insert(userData);

  if (insertError) {
    return res
      .status(500)
      .json({ message: "Failed to create user!", error: insertError });
  }

  return res
    .status(201)
    .json({ message: "User created successfully!", user: data.user });
});

// Sign In endpoint (POST)
app.post("/api/auth/signin", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res
      .status(500)
      .json({ message: "Failed to sign in!", error: error.message });
  } else {
    return res
      .status(200)
      .json({ message: "Sign in successful!", session: data.session });
  }
});

const verifySession = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Unauthorized! No authorization header found." });
  }

  const sessionToken = authHeader.split(" ")[1]; // Assuming Bearer token format

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(sessionToken);

  if (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized! Invalid session token." });
  }

  req.user = user; // Attach user object to the request for access in endpoints
  // req.user = {
  //   id: "034b99e6-1797-44cc-b927-09e070d68455",
  //   aud: "authenticated",
  //   role: "authenticated",
  //   email: "kameron.heaney72@yahoo.com",
  //   email_confirmed_at: "2024-04-15T00:27:53.737141Z",
  //   phone: "",
  //   confirmed_at: "2024-04-15T00:27:53.737141Z",
  //   last_sign_in_at: "2024-04-15T22:48:13.726263904Z",
  //   app_metadata: {
  //     provider: "email",
  //     providers: ["email"],
  //   },
  //   user_metadata: {
  //     email: "kameron.heaney72@yahoo.com",
  //     email_verified: false,
  //     phone_verified: false,
  //     sub: "034b99e6-1797-44cc-b927-09e070d68455",
  //   },
  //   identities: [
  //     {
  //       identity_id: "4d1451db-e099-4be9-ab1f-b0fca5ed8692",
  //       id: "034b99e6-1797-44cc-b927-09e070d68455",
  //       user_id: "034b99e6-1797-44cc-b927-09e070d68455",
  //       identity_data: {
  //         email: "kameron.heaney72@yahoo.com",
  //         email_verified: false,
  //         phone_verified: false,
  //         sub: "034b99e6-1797-44cc-b927-09e070d68455",
  //       },
  //       provider: "email",
  //       last_sign_in_at: "2024-04-15T00:27:53.734667Z",
  //       created_at: "2024-04-15T00:27:53.734721Z",
  //       updated_at: "2024-04-15T00:27:53.734721Z",
  //       email: "kameron.heaney72@yahoo.com",
  //     },
  //   ],
  //   created_at: "2024-04-15T00:27:53.732006Z",
  //   updated_at: "2024-04-15T22:48:13.734183Z",
  //   is_anonymous: false,
  // };
  next();
};

app.get("/api/dashboard", verifySession, async (req, res) => {
  const userId = req.user.id;

  try {
    // Execute all database queries concurrently using Promise.all
    const [
      totalHabits,
      activeHabits,
      longestStreakData,
      journalEntries,
      habitCompletionTrends,
    ] = await Promise.all([
      supabase
        .from("habits")
        .select("habit_id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("habit_progression")
        .select("*, habits!inner(habit_id)")
        .eq("habits.user_id", userId) // Join habits and habit_progression
        .gte(
          "progress_date",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toDateString()
        ), // Past week
      supabase
        .from("habit_progression")
        .select("progress_date, completion_status, habits!inner(habit_id)")
        .eq("habits.user_id", userId) // Join habits and habit_progression
        .order("progress_date", { ascending: true }), // Order chronologically
      supabase
        .from("journal_entries")
        .select("*", { count: "exact", head: false })
        .eq("user_id", userId)
        .order("entry_date", { ascending: false })
        .limit(5),
      supabase
        .from("habit_progression")
        .select("progress_date, completion_status, habits!inner(habit_id)")
        .eq("habits.user_id", userId) // Filter habits by user ID
        .gte(
          "progress_date",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toDateString()
        ), // Past month
    ]);
    // Calculate longest streak from completion status
    let currentStreak = 0;
    let longestStreak = 0;
    let habitName = "";

    for (const entry of longestStreakData.data) {
      if (entry.completion_status) {
        currentStreak++;
      } else {
        currentStreak = 0;
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        habitName = ""; // Assuming habit name isn't stored in habit_progression
      }
    }
    console.log(habitCompletionTrends);
    // Get today's date
    const today = new Date();

    // Prepare an empty array to store weekly completion data
    const weeklyCompletions = [];

    // Loop through the last 4 weeks
    for (let i = 0; i < 4; i++) {
      // Move back i weeks from today
      const weekStart = new Date(today.setDate(today.getDate() - i * 7));
      weekStart.setDate(weekStart.getDate() - (weekStart.getDay() || 7)); // Set to beginning of week (Sunday)

      const weekEnd = new Date(weekStart.getTime()); // Clone the start date for weekEnd
      weekEnd.setDate(weekEnd.getDate() + 6); // Move to the end of the i-th week

      // Filter habit completions within the current week range (inclusive)
      const weekData = habitCompletionTrends.data.filter((entry) => {
        const entryDate = new Date(entry.progress_date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });

      // Count completions for the week
      const weekCount = weekData.reduce(
        (acc, curr) => acc + (curr.completion_status ? 1 : 0),
        0
      );

      // Add data for the current week to the results
      weeklyCompletions.push({
        week: `Week ${i + 1}`,
        count: weekCount,
      });
    }

    const formattedData = {
      totalHabits: totalHabits.count,
      activeHabits: activeHabits.data.length,
      longestStreak: { longestStreak, habitName }, // Update format
      journalEntries,
      habitCompletionTrends: weeklyCompletions.reverse(),
    };

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve dashboard data!", error });
  }
});

//Create a habit for a user
app.post("/api/habits/add", verifySession, async (req, res) => {
  const { habit_name } = req.body;
  console.log(req.body);
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from("habits")
    .insert({ user_id, habit_name })
    .select();

  if (error) {
    return res.status(500).json({ message: "Failed to add habit!", error });
  }

  return res
    .status(201)
    .json({ message: "Habit added successfully!", habit: data[0] });
});

//Edit a user's habit by habit id
app.put("/api/habits/edit/:habitId", verifySession, async (req, res) => {
  const { habitId } = req.params;
  const { habit_name } = req.body;
  const user_id = req.user.id;

  if (!habit_name) {
    return res.status(500).json({
      message: "Failed to update habit!",
      error: "Habit name is missing",
    });
  }

  // Check if habit belongs to the user
  const { data: habitData, error } = await supabase
    .from("habits")
    .select("*")
    .eq("habit_id", habitId)
    .eq("user_id", user_id)
    .select();

  if (error) {
    return res.status(500).json({ message: "Failed to update habit!", error });
  }

  if (habitData.length === 0) {
    return res
      .status(404)
      .json({ message: "Habit not found or does not belong to you!" });
  }

  // Update habit if it belongs to the user
  const { data, error: updateError } = await supabase
    .from("habits")
    .update({ habit_name })
    .match({ habit_id: habitId })
    .select();

  if (updateError) {
    return res
      .status(500)
      .json({ message: "Failed to update habit!", error: updateError });
  }

  return res
    .status(200)
    .json({ message: "Habit updated successfully!", habit: data[0] });
});

//View user's habits
app.get("/api/habits/view", verifySession, async (req, res) => {
  const user_id = req.user.id;

  // Check if user exists first
  const { data: userData, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve habits!", error });
  }

  if (userData.length === 0) {
    return res.status(404).json({ message: "User not found!" });
  }

  // If user exists, proceed with retrieving habits
  const { data: habits, error: habitError } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user_id);

  if (habitError) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve habits!", error: habitError });
  }
  console.log(habits);
  const habitsWithProgress = await Promise.all(
    habits.map(async (habit) => {
      const { data: progressData, error: progressError } = await supabase
        .from("habit_progression")
        .select("progress_date, completion_status")
        .eq("habit_id", habit.habit_id); // Filter by habit ID

      if (progressError) {
        console.error(
          `Error fetching progress for habit ${habit.habit_id}:`,
          progressError
        );
        // You can handle individual habit progress errors here (optional)
        return habit; // Return the habit object even without progress data
      }

      return { ...habit, progressData };
    })
  );

  function calculateStreak(progressDates) {
    // Sort progress dates in ascending order
    progressDates.sort(
      (a, b) => new Date(a.progress_date) - new Date(b.progress_date)
    );

    let streakLength = 0;
    let streakAboutToExpire = false;

    for (let i = 0; i < progressDates.length - 1; i++) {
      const currentDate = new Date(progressDates[i].progress_date);
      const nextDate = new Date(progressDates[i + 1].progress_date);

      // Check if the dates are consecutive
      const timeDiff = nextDate.getTime() - currentDate.getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      if (timeDiff <= oneDay) {
        streakLength++;
      } else {
        // Streak broken, reset streak length
        streakLength = 0;
      }

      // Check if the streak is about to expire (last progress date is yesterday)
      if (i === progressDates.length - 2 && timeDiff > oneDay) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const lastDate = new Date(progressDates[i + 1].progress_date);
        if (
          lastDate.getFullYear() === yesterday.getFullYear() &&
          lastDate.getMonth() === yesterday.getMonth() &&
          lastDate.getDate() === yesterday.getDate()
        ) {
          streakAboutToExpire = true;
        }
      }
    }

    return { streakLength, streakAboutToExpire };
  }

  // Calculate streak for each habit with progress data
  const habitsWithStreaks = habitsWithProgress.map((habit) => {
    if (!habit.progressData) {
      return habit; // No progress data, skip streak calculation
    }
    const currentStreak = calculateStreak(habit.progressData);
    return { ...habit, currentStreak };
  });

  res.status(200).json({
    message: "Habits retrieved successfully!",
    habits: habitsWithStreaks,
  });
});

//Delete a user's habit by habit id
app.delete("/api/habits/delete/:habitId", verifySession, async (req, res) => {
  const { habitId } = req.params;
  const user_id = req.user.id;

  try {
    // Check if habit belongs to the user
    const { data: habitData, error } = await supabase
      .from("habits")
      .select("*")
      .eq("habit_id", habitId)
      .eq("user_id", user_id);

    if (error) {
      return res
        .status(500)
        .json({ message: "Failed to delete habit!", error });
    }

    if (habitData.length === 0) {
      return res
        .status(404)
        .json({ message: "Habit not found or does not belong to you!" });
    }

    // Delete habit if it belongs to the user
    const { data, error: deleteError } = await supabase
      .from("habits")
      .delete()
      .match({ habit_id: habitId });

    if (deleteError) {
      return res
        .status(500)
        .json({ message: "Failed to delete habit!", error: deleteError });
    }

    return res.status(200).json({ message: "Habit deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete habit!", error });
  }
});

//Add an entry to a user's journal
app.post("/api/journal/add", verifySession, async (req, res) => {
  const { entry_content } = req.body;
  const user_id = req.user.id;

  const today = new Date().toISOString(); // Capture current date and time

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({ user_id, entry_content, entry_date: today })
    .select();

  if (error)
    return res
      .status(500)
      .json({ message: "Failed to add journal entry!", error });

  return res
    .status(201)
    .json({ message: "Journal entry added successfully!", entry: data[0] });
});

//Get all entries for a user's journal
app.get("/api/journal/entries", verifySession, async (req, res) => {
  const user_id = req.user.id;

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user_id);

  if (userError) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve journal entries!", userError });
  }

  if (userData.length === 0) {
    return res.status(404).json({ message: "User not found!" });
  }

  // Retrieve journal entries for the user
  const { data: entries, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user_id);

  if (error)
    return res
      .status(500)
      .json({ message: "Failed to retrieve journal entries!", error });
  return res
    .status(200)
    .json({ message: "Journal entries retrieved successfully!", entries });
});

//Delete journal entries for a user
app.delete("/api/journal-entries/:id", verifySession, async (req, res) => {
  const user_id = req.user.id; // Get user ID from session
  const entryId = req.params.id;

  // Check if entry exists and belongs to the user
  const { data: entry, error: entryError } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("entry_id", entryId)
    .single();

  if (entryError) {
    return res.status(500).json({
      message: "Failed to retrieve journal entry!",
      error: entryError,
    });
  }

  if (!entry) {
    return res.status(404).json({ message: "Journal entry not found!" });
  }

  if (entry.user_id !== user_id) {
    return res
      .status(403)
      .json({ message: "Unauthorized! You can only delete your own entries." });
  }

  // Delete the journal entry
  const { error: deleteError } = await supabase
    .from("journal_entries")
    .delete()
    .eq("entry_id", entryId);

  if (deleteError) {
    return res
      .status(500)
      .json({ message: "Failed to delete journal entry!", error: deleteError });
  }

  return res
    .status(200)
    .json({ message: "Journal entry deleted successfully!" });
});

//Edit an entry in a user's journal
app.put("/api/journal/edit/:entryId", verifySession, async (req, res) => {
  const { entryId } = req.params;
  const { entry_content } = req.body;
  const loggedInUserId = req.user.id; // Assuming JWT stores user_id claim

  // 1. Check entry ownership before update
  const { data: entryData, error: entryError } = await supabase
    .from("journal_entries")
    .select("user_id") // Only fetch user_id for ownership check
    .eq("entry_id", entryId)
    .single();

  if (entryError) {
    return res
      .status(500)
      .json({ message: "Failed to check entry ownership!", entryError });
  }

  if (!entryData || entryData.user_id !== loggedInUserId) {
    return res.status(403).json({ message: "Unauthorized to edit entry!" });
  }

  // 2. Proceed with update logic if ownership is confirmed
  const { data, error } = await supabase
    .from("journal_entries")
    .update({ entry_content })
    .match({ entry_id: entryId })
    .select();

  if (error)
    return res
      .status(500)
      .json({ message: "Failed to update journal entry!", error });
  if (data.length === 0) {
    return res.status(404).json({ message: "Journal entry not found!" });
  }

  return res
    .status(200)
    .json({ message: "Journal entry updated successfully!", entry: data[0] });
});

//Add a progression to habit by habit id (For ex: If a user has football as a habit,
//sending a request to this endpoint will mark this habit done for today)
//Data here stored in a seperate table so it can be used to make charts as you asked
app.post(
  "/api/habits/progression/:habitId",
  verifySession,
  async (req, res) => {
    const { habitId } = req.params;
    const progress_date = new Date().toISOString(); // Assuming date is sent in the request body

    const user_id = req.user.id;

    // Check if habit belongs to the user
    const { data: habitData, error: habitError } = await supabase
      .from("habits")
      .select("*")
      .eq("habit_id", habitId)
      .eq("user_id", user_id);

    if (habitError) {
      return res.status(500).json({
        message: "Failed to add habit progression!",
        error: habitError,
      });
    }

    if (habitData.length === 0) {
      return res
        .status(404)
        .json({ message: "Habit not found or does not belong to you!" });
    }

    // Check if there's existing data for the specific date
    const { data: existingData, error } = await supabase
      .from("habit_progression")
      .select("*")
      .eq("habit_id", habitId)
      .eq("progress_date", progress_date);

    if (error) {
      return res
        .status(500)
        .json({ message: "Failed to add habit progression!", error });
    }

    // If existing data exists, update the completion status
    if (existingData.length > 0) {
      const { data, error: updateError } = await supabase
        .from("habit_progression")
        .update({ completion_status: true })
        .match({ habit_id: habitId, progress_date });

      if (updateError) {
        return res.status(500).json({
          message: "Failed to add habit progression!",
          error: updateError,
        });
      }

      return res
        .status(200)
        .json({ message: "Habit completion updated successfully!" });
    }

    // If no existing data, insert a new entry
    const { data, error: insertError } = await supabase
      .from("habit_progression")
      .insert({ habit_id: habitId, progress_date, completion_status: true });

    if (insertError) {
      return res.status(500).json({
        message: "Failed to add habit progression!",
        error: insertError,
      });
    }

    res.status(201).json({ message: "Habit completion added successfully!" });
  }
);

//Get all habits progressions for a user
app.get("/api/habits/progression", verifySession, async (req, res) => {
  const userId = req.user.id;

  // 1. Fetch all habits for the user
  const { data: habits, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve habit progression!", error });
  }

  if (habits.length === 0) {
    return res.status(200).json({ message: "No habits found for user." });
  }

  // 2. Prepare an empty object to store habit progression data
  const habitProgression = {};

  // 3. Loop through each habit
  for (const habit of habits) {
    const habitId = habit.habit_id;

    // 4. Fetch habit progression data for this habit
    const { data: progressionData, error } = await supabase
      .from("habit_progression")
      .select("*")
      .eq("habit_id", habitId);

    if (error) {
      return res
        .status(500)
        .json({ message: "Failed to retrieve habit progression!", error });
    }

    habitProgression[habitId] = progressionData; // Store data for each habit
  }

  return res.status(200).json({
    message: "Habit progression retrieved successfully!",
    progression: habitProgression,
  });
});

//Get habit progression for a certain habit
app.get("/api/habit-logs/:habitId", verifySession, async (req, res) => {
  const habitId = req.params.habitId;
  const userId = req.user.id;
  console.log(userId);
  try {
    const logs = await supabase
      .from("habits")
      .select(
        "*, habit_progression(progression_id, progress_date)!inner(habit_id)"
      )
      .eq("user_id", userId) // Filter habits by user ID
      .eq("habit_id", habitId) // Filter by specific habit ID
      .single();

    // Check if any logs were found (habit might not belong to user)
    if (logs.data.length === 0) {
      return res
        .status(404)
        .json({ message: "Habit not found or unauthorized access!" });
    }

    return res.status(200).json(logs.data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve habit logs!", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
