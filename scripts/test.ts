import { getAvailableDates } from "@/lib/db";
async function run() {
  console.log("Fetching dates...");
  const dates = await getAvailableDates();
  console.log("Dates:", dates);
}
run();
