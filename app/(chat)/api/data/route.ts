import { auth } from "@/app/(auth)/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const credentials = searchParams.get("credentials");

  try {
    const apiResponse = await fetch("", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credentials }),
    });

    if (!apiResponse.ok) {
      return new Response(`Error: ${apiResponse.statusText}`, {
        status: apiResponse.status,
      });
    }

    const data = await apiResponse.json();
    return Response.json(data);
  } catch (error) {
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}
