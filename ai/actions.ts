import { generateObject, streamText , generateText  } from "ai";
import { z } from "zod";

import { geminiFlashModel, mistralModel,  } from ".";

export async function generateSampleFlightStatus({
  flightNumber,
  date,
}: {
  flightNumber: string;
  date: string;
}) {
  const { object: flightStatus } = await generateObject({
    model: geminiFlashModel,
    prompt: `Flight status for flight number ${flightNumber} on ${date}`,
    schema: z.object({
      flightNumber: z.string().describe("Flight number, e.g., BA123, AA31"),
      departure: z.object({
        cityName: z.string().describe("Name of the departure city"),
        airportCode: z.string().describe("IATA code of the departure airport"),
        airportName: z.string().describe("Full name of the departure airport"),
        timestamp: z.string().describe("ISO 8601 departure date and time"),
        terminal: z.string().describe("Departure terminal"),
        gate: z.string().describe("Departure gate"),
      }),
      arrival: z.object({
        cityName: z.string().describe("Name of the arrival city"),
        airportCode: z.string().describe("IATA code of the arrival airport"),
        airportName: z.string().describe("Full name of the arrival airport"),
        timestamp: z.string().describe("ISO 8601 arrival date and time"),
        terminal: z.string().describe("Arrival terminal"),
        gate: z.string().describe("Arrival gate"),
      }),
      totalDistanceInMiles: z
        .number()
        .describe("Total flight distance in miles"),
    }),
  });

  return flightStatus;
}

export async function generateSampleFlightSearchResults({
  origin,
  destination,
}: {
  origin: string;
  destination: string;
}) {
  const { object: flightSearchResults } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate search results for flights from ${origin} to ${destination}, limit to 4 results`,
    output: "array",
    schema: z.object({
      id: z
        .string()
        .describe("Unique identifier for the flight, like BA123, AA31, etc."),
      departure: z.object({
        cityName: z.string().describe("Name of the departure city"),
        airportCode: z.string().describe("IATA code of the departure airport"),
        timestamp: z.string().describe("ISO 8601 departure date and time"),
      }),
      arrival: z.object({
        cityName: z.string().describe("Name of the arrival city"),
        airportCode: z.string().describe("IATA code of the arrival airport"),
        timestamp: z.string().describe("ISO 8601 arrival date and time"),
      }),
      airlines: z.array(
        z.string().describe("Airline names, e.g., American Airlines, Emirates")
      ),
      priceInUSD: z.number().describe("Flight price in US dollars"),
      numberOfStops: z.number().describe("Number of stops during the flight"),
    }),
  });

  return { flights: flightSearchResults };
}

export async function generateSampleSeatSelection({
  flightNumber,
}: {
  flightNumber: string;
}) {
  const { object: rows } = await generateObject({
    model: geminiFlashModel,
    prompt: `Simulate available seats for flight number ${flightNumber}, 6 seats on each row and 5 rows in total, adjust pricing based on location of seat`,
    output: "array",
    schema: z.array(
      z.object({
        seatNumber: z.string().describe("Seat identifier, e.g., 12A, 15C"),
        priceInUSD: z
          .number()
          .describe("Seat price in US dollars, less than $99"),
        isAvailable: z
          .boolean()
          .describe("Whether the seat is available for booking"),
      })
    ),
  });

  return { seats: rows };
}

export async function generateReservationPrice(props: {
  seats: string[];
  flightNumber: string;
  departure: {
    cityName: string;
    airportCode: string;
    timestamp: string;
    gate: string;
    terminal: string;
  };
  arrival: {
    cityName: string;
    airportCode: string;
    timestamp: string;
    gate: string;
    terminal: string;
  };
  passengerName: string;
}) {
  const { object: reservation } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate price for the following reservation \n\n ${JSON.stringify(
      props,
      null,
      2
    )}`,
    schema: z.object({
      totalPriceInUSD: z
        .number()
        .describe("Total reservation price in US dollars"),
    }),
  });

  return reservation;
}

export async function generateApplicationDetails({
  applicantDetails,
}: {
  applicantDetails: any;
}) {
  const { object: applicationDetails } = await generateObject({
    model: mistralModel,
    prompt: `Application details for applicant ${applicantDetails.personalData.primaryFirstName} ${applicantDetails.personalData.primaryLastName}`,
    schema: z.object({
      personalData: z.object({
        individualId: z.number().describe("Unique identifier for the applicant"),
        primaryLastName: z.string().describe("Applicant's last name"),
        primaryFirstName: z.string().describe("Applicant's first name"),
        primaryMiddleName: z.string().optional().describe("Applicant's middle name"),
        usedName: z.string().describe("Used name or preferred name"),
        primaryTitle: z.string().describe("Applicant's title"),
        gender: z.string().describe("Applicant's gender"),
        civilState: z.string().describe("Civil status of the applicant"),
        race: z.string().describe("Race of the applicant"),
        dob: z.string().describe("Date of birth in ISO format"),
        nationality: z.string().describe("Applicant's nationality"),
        applicantType: z.string().describe("Type of applicant (e.g., individual)"),
        loanAmount: z.number().describe("Requested loan amount"),
        loanPurpose: z.string().describe("Purpose of the loan"),
        interestRate: z.number().describe("Loan interest rate"),
        loanFrequency: z.string().describe("Repayment frequency (e.g., monthly)"),
        loanTerms: z.number().describe("Loan term in years"),
      }),
      contactData: z.object({
        primaryContact: z.string().describe("Primary contact number"),
        primaryEmail: z.string().email().describe("Primary email address"),
        relationship: z.string().describe("Relationship to main applicant"),
        relationName: z.string().describe("Name of the related person"),
        relationLandNumber: z.string().describe("Landline number of related person"),
      }),
      addressData: z.object({
        permanentAddress: z.string().describe("Permanent address of the applicant"),
        mailingAddressData: z.string().describe("Mailing address of the applicant"),
        currentAddressData: z.string().describe("Current address of the applicant"),
        residentialState: z.string().describe("Current residential status"),
        currentResidenceYears: z.number().describe("Number of years in current residence"),
        currentResidenceMonths: z.number().describe("Number of months in current residence"),
      }),
      educationData: z.object({
        primaryEducationGrade: z.string().describe("Highest grade or level of education"),
      }),
      incomeData: z.object({
        personnelIncome: z.string().describe("Personal income of the applicant"),
        businessIncome: z.string().describe("Business income, if applicable"),
      }),
      securityData: z.object({
        securityType: z.string().describe("Type of security (if any) for the loan"),
        movable: z.string().describe("Movable assets as security (if any)"),
      }),
      expenseData: z.object({
        numberOfDepends: z.number().describe("Number of dependents of the applicant"),
        expenses: z.string().describe("Monthly expenses of the applicant"),
      }),
      inquiryOfObligationsData: z.object({
        totalLiabilityAmount: z.string().describe("Total liability amount of the applicant"),
      }),
    }),
  });

  return applicationDetails;
}

