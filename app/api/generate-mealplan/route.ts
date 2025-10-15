import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { openAiSecretKey } from "@/lib/openrouter";
interface DailyMealPlan {
  Breakfast?: string;
  Lunch?: string;
  Dinner?: string;
  Snacks?: string;
}

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: openAiSecretKey,
});

export async function POST(request: NextRequest) {
  try {
    const { dietType, calories, allergies, cuisine, snacks } =
      await request.json();

    const prompt = `
      You are a professional nutritionist. Create a 7-day meal plan for an individual following a ${dietType} diet aiming for ${calories} calories per day.
      
      Allergies or restrictions: ${allergies || "none"}.
      Preferred cuisine: ${cuisine || "no preference"}.
      Snacks included: ${snacks ? "yes" : "no"}.
      
      For each day, provide:
        - Breakfast
        - Lunch
        - Dinner
        ${snacks ? "- Snacks" : ""}
      
      Use simple ingredients and provide brief instructions. Include approximate calorie counts for each meal.
      
      Structure the response as a JSON object where each day is a key, and each meal (breakfast, lunch, dinner, snacks) is a sub-key. Example:
      
      {
        "Monday": {
          "Breakfast": "Oatmeal with fruits - 350 calories",
          "Lunch": "Grilled chicken salad - 500 calories",
          "Dinner": "Steamed vegetables with quinoa - 600 calories",
          "Snacks": "Greek yogurt - 150 calories"
        },
        "Tuesday": {
          "Breakfast": "Smoothie bowl - 300 calories",
          "Lunch": "Turkey sandwich - 450 calories",
          "Dinner": "Baked salmon with asparagus - 700 calories",
          "Snacks": "Almonds - 200 calories"
        }
        // ...and so on for each day
      }

      Return just the json with no extra commentaries and no backticks.
    `;

    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3.2-3b-instruct:free",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: 1500,
    });
    let praseMealPlan: { [meal: string]: DailyMealPlan };
    const aiContent = response.choices[0].message.content?.trim() || "";
    try {
      praseMealPlan = JSON.parse(aiContent);
    } catch (error: any) {
      return NextResponse.json(
        {
          error: "Failed to parse meal plan. Please try again." + error.message,
        },
        { status: 500 }
      );
    }
    if (typeof praseMealPlan !== "object" || praseMealPlan == null) {
      return NextResponse.json(
        { error: "Failed to parse meal plan. Please try again." },
        { status: 500 }
      );
    }

    // Return the parsed meal plan
    return NextResponse.json({ mealPlan: praseMealPlan });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Error:" + error.message },
      { status: 500 }
    );
  }
}
