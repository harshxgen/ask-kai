"use client";

import { useChat } from "ai/react";
import { differenceInHours, format } from "date-fns";

const SAMPLE = {
  flights: [
    {
      id: "result_1",
      departure: {
        cityName: "San Francisco",
        airportCode: "SFO",
        timestamp: "2024-05-19T18:00:00Z",
      },
      arrival: {
        cityName: "Rome",
        airportCode: "FCO",
        timestamp: "2024-05-20T14:30:00Z",
      },
      airlines: ["United Airlines", "Lufthansa"],
      priceInUSD: 1200.5,
      numberOfStops: 1,
    },
    {
      id: "result_2",
      departure: {
        cityName: "San Francisco",
        airportCode: "SFO",
        timestamp: "2024-05-19T17:30:00Z",
      },
      arrival: {
        cityName: "Rome",
        airportCode: "FCO",
        timestamp: "2024-05-20T15:00:00Z",
      },
      airlines: ["British Airways"],
      priceInUSD: 1350,
      numberOfStops: 0,
    },
    {
      id: "result_3",
      departure: {
        cityName: "San Francisco",
        airportCode: "SFO",
        timestamp: "2024-05-19T19:15:00Z",
      },
      arrival: {
        cityName: "Rome",
        airportCode: "FCO",
        timestamp: "2024-05-20T16:45:00Z",
      },
      airlines: ["Delta Air Lines", "Air France"],
      priceInUSD: 1150.75,
      numberOfStops: 1,
    },
    {
      id: "result_4",
      departure: {
        cityName: "San Francisco",
        airportCode: "SFO",
        timestamp: "2024-05-19T16:30:00Z",
      },
      arrival: {
        cityName: "Rome",
        airportCode: "FCO",
        timestamp: "2024-05-20T13:50:00Z",
      },
      airlines: ["American Airlines", "Iberia"],
      totalDurationInMinutes: 740,
      priceInUSD: 1250.25,
      numberOfStops: 1,
    },
  ],
};

export function ListApplications({
  chatId,
  results,
}: {
  chatId: string;
  results?: any;
}) {
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  });

  return (
    <div className="rounded-lg bg-muted px-4 py-1.5 flex flex-col">
      {results.map((application: any) => (
        <div
          key={application.applicationId}
          className="cursor-pointer flex flex-row border-b dark:border-zinc-700 py-2 last-of-type:border-none group"
          onClick={() => {
            append({
              role: "user",
              content: `I would like to get details about ${application.applicationId} application!`,
            });
          }}
        >
          <div className="flex flex-col w-full gap-0.5 justify-between">
            <div className="flex flex-row gap-0.5 text-base sm:text-base font-medium group-hover:underline">
              <div className="text">Application ID</div>
              <div className="no-skeleton">–</div>
              <div className="text">{application.applicationId}</div>
            </div>
            <div className="text w-fit hidden sm:flex text-sm text-muted-foreground flex-row gap-2">
              <div>
                {" "}
                {application.primaryFirstName && application.primaryLastName
                  ? `${application.primaryFirstName} ${application.primaryLastName}`
                  : ""}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-0.5 justify-between">
            <div className="flex flex-row gap-2">
              <div className="text-base sm:text-base">
                {application.oldNic || application.newNic
                  ? application.oldNic || application.newNic
                  : ""}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground flex flex-row">
              <div> {application.primaryEmailAddress} </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
