"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { useChat } from "ai/react";

export function ValidateNic({ chatId }: { chatId: string }) {
  const [input, setInput] = useState("");

  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  });
  return (
    <div className="bg-muted p-4 rounded-lg flex flex-col gap-2">
      <div className="text font-medium">
        Use your NIC to proceed the application
      </div>
      <div className="text-muted-foreground text-sm sm:text-base">
        Enter NIC number to get applications
      </div>

      <Input
        type="text"
        placeholder="Enter NIC"
        className="dark:bg-zinc-700 text-base border-none mt-2"
        onChange={(event) => setInput(event.target.value)}
        onInput={(event) => setInput(event.currentTarget.value)}
        onKeyDown={async (event) => {
          if (event.key === "Enter") {
            append({
              role: "user",
              content: `Provide applications related to this NIC: ${input}`,
            });
            setInput("");
          }
        }}
      />
    </div>
  );
}
