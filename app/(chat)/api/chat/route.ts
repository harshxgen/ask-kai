import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel, mistralModel } from "@/ai";
import {
  generateApplicationDetails,
  generateReservationPrice,
  generateSampleFlightSearchResults,
  generateSampleFlightStatus,
  generateSampleSeatSelection,
} from "@/ai/actions";
import { auth } from "@/app/(auth)/auth";
import {
  createReservation,
  deleteChatById,
  getChatById,
  getReservationById,
  saveChat,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session: any = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0
  );

  const result = await streamText({
    model: mistralModel,
    system: `\n  
    - You help users retrieve information about applications linked to their NIC!  
    - Keep your responses limited to a sentence.  
    - DO NOT output lists.  
    - After every tool call, pretend you're showing the result to the user and keep your response limited to a phrase.  
    - Today's date is ${new Date().toLocaleDateString()}.  
    - Ask follow-up questions to guide the user smoothly through the process.  
    - Ask for any details you don't know, like the NIC number.  
    - Here's the optimal flow:  
      - Ask the user to enter their NIC.  
      - Retrieve applications linked to that NIC.  
      - Have the user select an application from the list.  
      - Provide details about the selected application.  
  
`,
    messages: coreMessages,
    tools: {
      getApplicationsByNIC: {
        description: "Fetches applications linked to a given NIC.",
        parameters: z.object({
          nic: z.string().describe("The user's NIC number"),
        }),
        execute: async ({ nic }) => {
          const response = await fetch(
            `https://los.xgencredit.com/elasticsearch/customers?oldNic=${nic}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch applications");
          }

          const applications = await response.json();
          return applications;
        },
      },
      getApplicationById: {
        description: "get application details by application ID",
        parameters: z.object({
          applicationId: z.string().describe("The application's ID"),
        }),
        execute: async ({ applicationId }) => {
          if (session && session?.user && session?.user?.id) {
            try {
              const response = await fetch(
                `https://los.xgencredit.com/data-api/third-party-service/applications/preparation/details?applicationId=${applicationId}&preparationKeys=applicantDetails`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${session.user?.token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (!response.ok) {
                throw new Error("Failed to fetch application details");
              }

              const result = await response.json();
              const applicantDetails = result?.data?.applicantDetails;

              if (!applicantDetails) {
                throw new Error("No applicant details found.");
              }

              let applicationDetails = await generateApplicationDetails({
                applicantDetails,
              });

              console.log("applicationDetails", applicationDetails);

              return applicantDetails;
            } catch (error: any) {
              return { error: `Error: ${error.message}` };
            }
          } else {
            return {
              error: "User is not signed in to perform this action!",
            };
          }
        },
      },
    },

    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
