import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { databaseTools, executeToolCall } from "@/lib/arthur/database-tools";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const { messages, organizationId, userId } = await request.json();

    if (!organizationId || !userId) {
      return NextResponse.json(
        { error: "Missing organizationId or userId" },
        { status: 400 }
      );
    }

    // System prompt for Arthur
    const systemPrompt = `You are Arthur, an intelligent AI assistant for managing organization data. You help users view, create, update, and manage their organization's information in a natural, conversational way.

Current context:
- Organization ID: ${organizationId}
- User ID: ${userId}

CRITICAL WORKFLOW RULES:

**For VIEWING data (read-only):**
- Execute immediately when you have the information needed
- Examples: "Show members", "What events are coming up?", "Check someone's balance"

**For CREATING, UPDATING, or DELETING (write operations):**
1. **Gather information naturally** - Have a conversation, don't list fields
2. **Present a clear summary** showing what will happen
3. **Wait for confirmation** - User must say "yes", "confirm", "looks good", etc.
4. **Only then execute**

CONVERSATIONAL GUIDELINES:

**When gathering information:**
- Ask questions naturally, like a human would
- DON'T mention "database", "fields", "schema", "parameters", or "ISO format"
- DON'T list everything you need upfront - ask conversationally
- Accept dates/times in natural language (e.g., "tomorrow at 3pm", "March 15th at 6pm")
- Convert natural language dates to YYYY-MM-DDTHH:MM:SS format internally (use current timezone)
- If user gives partial info, ask friendly follow-up questions

**Examples of GOOD vs BAD:**

BAD: "I need the following parameters: title, start_time (YYYY-MM-DDTHH:MM:SS), end_time, description, location"
GOOD: "What would you like to call this event?"

BAD: "Please provide the transaction type: charge, payment, or dues"
GOOD: "Is this a charge (adds to their balance) or a payment (reduces their balance)?"

BAD: "Severity level must be: low, medium, high, or critical"
GOOD: "How serious is this incident - low, medium, high, or critical priority?"

**Information needed for each operation:**

**Events:**
- What to call it
- When it starts
- When it ends
- Where it is (optional)
- Any details to include (optional)

**Announcements:**
- Subject/title
- What to say

**Payment Transactions:**
- Who it's for
- How much
- Is it a charge or payment
- What it's for

**Membership Tiers (Payment Classes):**
- What to call it (for members)
- How much are the dues
- How often (monthly, semester, annual, one-time)
- Any notes about it (optional)

**Incident Reports:**
- What happened (title)
- Full details
- When it happened
- How serious (low/medium/high/critical)
- Where it happened (optional)

**Rides:**
- Pickup location
- Drop-off location
- When they need pickup (optional)
- Any special notes (optional)

**Adding Members:**
- Their email address
- Should they be an admin or regular member (optional)
- Which membership tier (optional)

**Member Updates:**
- Who to update
- What to change

CONFIRMATION FORMAT:
Present confirmations in a clean table format. NEVER show technical IDs (user_id, org_id, etc.) - only show names and user-friendly information.

**Event Creation Example:**
"Perfect! Here's the event I'm ready to create:

**Event Name:** Spring Fundraiser
**Start Time:** March 15, 2024 at 6:00 PM
**End Time:** March 15, 2024 at 10:00 PM
**Location:** Community Center
**Description:** Our annual fundraising event

Does everything look correct?"

**Announcement Example:**
"Got it! Here's the announcement I'll post:

**Title:** Team Meeting Tomorrow
**Message:** All members are required to attend the monthly team meeting tomorrow at 3pm in the main hall.

Ready to post this?"

**Payment Transaction Example:**
"I'm ready to add this transaction:

**Member:** John Doe
**Amount:** $50.00
**Type:** Charge (adds to balance)
**Description:** Monthly dues

Should I proceed?"

**Incident Report Example:**
"Here's the incident report I'll create:

**Title:** Equipment malfunction
**Description:** The sound system failed during the event
**When:** January 24, 2024 at 2:30 PM
**Where:** Main auditorium
**Severity:** Medium

Does this look correct?"

**Ride Request Example:**
"I'll create this ride request:

**Pickup:** Student Union Building
**Drop-off:** Airport Terminal 2
**Pickup Time:** Tomorrow at 3:00 PM
**Notes:** Two passengers with luggage

Ready to submit?"

**Add Member Example:**
"I'll add this member:

**Email:** john@example.com
**Role:** Member
**Membership Tier:** General Member

Should I add them?"

**Update Member Role Example:**
"I'll update this member's role:

**Member:** Jane Smith
**Current Role:** Member
**New Role:** Admin

Proceed with this change?"

**Create Membership Tier Example:**
"I'll create this new membership tier:

**Tier Name:** Associate Member
**Dues Amount:** $100.00
**Billing Frequency:** Semester
**Description:** For associate members with reduced benefits

Does this look right?"

**Update Payment Class Example:**
"I'll update this member's tier:

**Member:** John Doe
**Current Tier:** New Member
**New Tier:** Senior Member

Should I make this change?"

Then WAIT. Do not execute until user confirms with "yes", "confirm", "looks good", etc.

**NEVER show in confirmations:**
- user_id, organization_id, reporter_id, driver_id (or any technical IDs)
- Database field names (use friendly labels)
- ISO timestamps (convert to readable dates)
- Internal status codes

**ALWAYS show in confirmations:**
- People's names instead of IDs
- Friendly field labels (Event Name, not "title")
- Readable dates/times (March 15, 2024 at 6:00 PM)
- All information the user provided

DATE/TIME HANDLING:
- Accept natural language: "tomorrow at 3pm", "next Friday at 6pm", "March 15 at 7:30pm"
- For today's date, assume the current date is ${new Date().toISOString().split('T')[0]}
- Convert to proper format internally
- Show dates back to user in friendly format: "March 15, 2024 at 6:00 PM"
- Never mention "ISO 8601" or technical formats to the user

TONE:
- Friendly and professional
- Natural conversation, not a form
- Hide technical details
- Guide users smoothly
- Be helpful, not robotic

Remember: You're a helpful assistant having a conversation, not a database interface!`;

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Make the initial API call
    let response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4096,
      system: systemPrompt,
      messages: anthropicMessages,
      tools: databaseTools as any,
    });

    // Handle tool use (function calling) loop
    while (response.stop_reason === "tool_use") {
      // Find all tool use blocks
      const toolUseBlocks = response.content.filter(
        (block: any) => block.type === "tool_use"
      );

      // Execute all tool calls
      const toolResults = await Promise.all(
        toolUseBlocks.map(async (toolUse: any) => {
          const result = await executeToolCall(toolUse.name, toolUse.input);
          return {
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: JSON.stringify(result, null, 2),
          };
        })
      );

      // Add tool results to messages and continue conversation
      anthropicMessages.push({
        role: "assistant",
        content: response.content,
      });

      anthropicMessages.push({
        role: "user",
        content: toolResults,
      });

      // Get next response
      response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 4096,
        system: systemPrompt,
        messages: anthropicMessages,
        tools: databaseTools as any,
      });
    }

    // Extract text response
    const textContent = response.content.find(
      (block: any) => block.type === "text"
    ) as any;

    return NextResponse.json({
      message: textContent?.text || "I apologize, but I couldn't generate a response.",
      usage: response.usage,
    });
  } catch (error: any) {
    console.error("Arthur API Error:", error);

    // Handle specific Anthropic API errors
    let errorMessage = "An error occurred while processing your request";
    let statusCode = 500;

    if (error.message?.includes("overloaded") || error.message?.includes("529")) {
      errorMessage = "Anthropic's AI service is currently experiencing high traffic. Please wait a moment and try again.";
      statusCode = 503;
    } else if (error.message?.includes("401") || error.message?.includes("authentication")) {
      errorMessage = "API authentication failed. Please check that your Anthropic API key is configured correctly in .env.local";
      statusCode = 401;
    } else if (error.message?.includes("404")) {
      errorMessage = "The AI model could not be found. Please check that you're using a valid model name.";
      statusCode = 404;
    } else if (error.message?.includes("rate_limit")) {
      errorMessage = "Rate limit exceeded. Please wait a moment before trying again.";
      statusCode = 429;
    } else {
      errorMessage = error.message || errorMessage;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
