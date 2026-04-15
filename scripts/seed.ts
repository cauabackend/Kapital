import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Categories shared between transactions and budgets
const CATEGORIES = [
  "Housing",
  "Groceries",
  "Transport",
  "Entertainment",
  "Dining Out",
  "Shopping",
  "Health",
  "Education",
  "Subscriptions",
  "Travel",
];

const POT_NAMES = [
  "Emergency Fund",
  "Vacation",
  "New Laptop",
  "Car Down Payment",
  "Wedding",
  "Home Renovation",
];

const POT_COLORS = [
  "#d4a053", // amber
  "#5b9a6f", // sage
  "#c45c5c", // rose
  "#5b7fb5", // blue
  "#9b6fb5", // purple
  "#5bb5a6", // teal
];

const BILL_NAMES = [
  "Rent",
  "Netflix",
  "Spotify",
  "Internet",
  "Phone Plan",
  "Gym Membership",
  "Car Insurance",
  "Health Insurance",
  "Cloud Storage",
  "Electricity",
];

async function seed(userId: string) {
  console.log(`Seeding data for user: ${userId}\n`);

  // 1. Seed transactions (60 records — ~6 months of data)
  console.log("Seeding transactions...");
  const transactions = [];
  for (let i = 0; i < 60; i++) {
    const isIncome = faker.number.float({ min: 0, max: 1 }) < 0.25;
    const category = isIncome
      ? "Income"
      : faker.helpers.arrayElement(CATEGORIES);

    transactions.push({
      user_id: userId,
      amount: isIncome
        ? faker.number.float({ min: 2000, max: 6000, fractionDigits: 2 })
        : faker.number.float({ min: 5, max: 500, fractionDigits: 2 }),
      category,
      date: faker.date
        .between({
          from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          to: new Date(),
        })
        .toISOString()
        .split("T")[0],
      description: isIncome
        ? faker.helpers.arrayElement(["Salary", "Freelance", "Bonus", "Refund", "Side project"])
        : faker.commerce.productName(),
      type: isIncome ? "income" : "expense",
    });
  }

  const { error: txError } = await supabase
    .from("transactions")
    .insert(transactions);
  if (txError) {
    console.error("  Error:", txError.message);
  } else {
    console.log(`  Inserted ${transactions.length} transactions`);
  }

  // 2. Seed budgets (one per category, pick 6 random)
  console.log("Seeding budgets...");
  const budgetCategories = faker.helpers.arrayElements(CATEGORIES, 6);
  const budgets = budgetCategories.map((category) => ({
    user_id: userId,
    category,
    max_amount: faker.number.float({
      min: 100,
      max: 1500,
      fractionDigits: 2,
    }),
  }));

  const { error: budgetError } = await supabase
    .from("budgets")
    .insert(budgets);
  if (budgetError) {
    console.error("  Error:", budgetError.message);
  } else {
    console.log(`  Inserted ${budgets.length} budgets`);
  }

  // 3. Seed pots (4 pots)
  console.log("Seeding pots...");
  const potNames = faker.helpers.arrayElements(POT_NAMES, 4);
  const pots = potNames.map((name, i) => {
    const target = faker.number.float({
      min: 500,
      max: 10000,
      fractionDigits: 2,
    });
    return {
      user_id: userId,
      name,
      target_amount: target,
      current_amount: faker.number.float({
        min: 0,
        max: target * 0.85,
        fractionDigits: 2,
      }),
      theme_color: POT_COLORS[i % POT_COLORS.length],
    };
  });

  const { error: potError } = await supabase.from("pots").insert(pots);
  if (potError) {
    console.error("  Error:", potError.message);
  } else {
    console.log(`  Inserted ${pots.length} pots`);
  }

  // 4. Seed recurring bills (8 bills)
  console.log("Seeding recurring bills...");
  const billNames = faker.helpers.arrayElements(BILL_NAMES, 8);
  const today = new Date().getDate();

  const bills = billNames.map((name) => {
    const dueDay = faker.number.int({ min: 1, max: 28 });
    return {
      user_id: userId,
      name,
      amount: faker.number.float({ min: 9.99, max: 1500, fractionDigits: 2 }),
      due_day: dueDay,
      category: faker.helpers.arrayElement(CATEGORIES),
      is_paid: dueDay < today,
    };
  });

  const { error: billError } = await supabase
    .from("recurring_bills")
    .insert(bills);
  if (billError) {
    console.error("  Error:", billError.message);
  } else {
    console.log(`  Inserted ${bills.length} recurring bills`);
  }

  console.log("\nSeed complete!");
}

// Get user ID from command line or use the test user
const userId = process.argv[2];
if (!userId) {
  console.error("Usage: npx tsx scripts/seed.ts <user-id>");
  console.error("Get your user ID from Supabase dashboard or run:");
  console.error('  SELECT id FROM auth.users WHERE email = \'your@email.com\';');
  process.exit(1);
}

seed(userId).catch(console.error);
