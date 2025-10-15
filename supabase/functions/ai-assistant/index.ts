import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message }: ChatMessage = await req.json();

    const { data: accounts } = await supabaseClient
      .from("accounts")
      .select("*")
      .eq("user_id", user.id);

    const { data: transactions } = await supabaseClient
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(100);

    const { data: categories } = await supabaseClient
      .from("categories")
      .select("*")
      .eq("user_id", user.id);

    const { data: budgets } = await supabaseClient
      .from("budgets")
      .select("*")
      .eq("user_id", user.id);

    const totalBalance = (accounts || []).reduce(
      (sum: number, acc: any) => sum + parseFloat(acc.balance || 0),
      0
    );

    const recentIncome = (transactions || [])
      .filter((t: any) => t.type === "income")
      .slice(0, 10);

    const recentExpenses = (transactions || [])
      .filter((t: any) => t.type === "expense")
      .slice(0, 10);

    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlyIncome = (transactions || [])
      .filter(
        (t: any) => t.type === "income" && t.date.startsWith(thisMonth)
      )
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

    const monthlyExpenses = (transactions || [])
      .filter(
        (t: any) => t.type === "expense" && t.date.startsWith(thisMonth)
      )
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

    const financialContext = `
You are a helpful financial assistant for WealthTrack Pro. Here is the user's financial data:

ACCOUNTS:
${(accounts || []).map((a: any) => `- ${a.name} (${a.type}): $${parseFloat(a.balance).toFixed(2)}`).join("\n")}
Total Balance: $${totalBalance.toFixed(2)}

THIS MONTH'S SUMMARY:
- Income: $${monthlyIncome.toFixed(2)}
- Expenses: $${monthlyExpenses.toFixed(2)}
- Net: $${(monthlyIncome - monthlyExpenses).toFixed(2)}

RECENT INCOME (last 10):
${recentIncome.map((t: any) => `- $${parseFloat(t.amount).toFixed(2)} from ${t.description} on ${t.date}`).join("\n")}

RECENT EXPENSES (last 10):
${recentExpenses.map((t: any) => `- $${parseFloat(t.amount).toFixed(2)} for ${t.description} on ${t.date}`).join("\n")}

CATEGORIES:
${(categories || []).map((c: any) => `- ${c.name} (${c.type})`).join("\n")}

BUDGETS:
${(budgets || []).map((b: any) => {
  const category = (categories || []).find((c: any) => c.id === b.category_id);
  return `- ${category?.name || "Unknown"}: $${parseFloat(b.amount).toFixed(2)}/month`;
}).join("\n")}

IMPORTANT: Do not use any markdown formatting in your response. Do not use ** for bold, * for italic, or any other markdown syntax. Write in plain text only. Use bullet points with dashes (-) for lists. Provide helpful, concise, and friendly financial advice. Use the data above to answer questions accurately. Be specific with numbers from the data.
`;

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: financialContext,
                },
                {
                  text: `User question: ${message}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiData = await geminiResponse.json();
    let aiResponse =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't generate a response.";

    aiResponse = aiResponse.replace(/\*\*/g, '').replace(/\*/g, '');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
