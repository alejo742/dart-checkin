import { nanoid } from "nanoid";
import { openaiGenerate } from "@/lib/AI/aiGenerate";

export function buildCsvItemsPrompt(csvString: string): string {
  return `
  You are an AI assistant that processes CSV data to extract structured information. Our users are dumb, they could send trash CSV data and your job is to put it together in a good format so that it is good CSV (standard format) for use in a table.
Given the following CSV, return a JSON array of objects, one per row.
- For each row, include a property for each column header, EXCEPT:
- If a column is a "check-in" column (header contains "check", "attendance", "present", etc. OR values are like "X", "Yes", "True"), output a boolean property called "checkedIn" (true if checked, false otherwise), and omit the original column. Use your judgement to detect if the column is a check-in column, it can be based on the header or the values in the column. But a checkin column is always needed, if there is no indicator, just make up one
- All other properties should be strings, matching the original header (or improve the header, by capitalizing or fixing typos).
- Only one column per row should be mapped to "checkedIn".
- Sometimes the user will forget the headers, but they can be made obvious. Never asssume that the values are meaningless. You can usually tell if it is a Name, Last Name, ID, etc. Be creative and if the input has three columns, your JSON should have 3 columns, if it has 4 columns, output 4 columns, and so on. If there are no column headers (apparently) just make them up. Match them to common formats and see if they can be special kind of values. For example, Dartmouth NetIDs always begin with an "f" and then use a combination of alphanumeric characters.
- Output ONLY the JSON array, nothing else. Remember to keep the columns consistent across all rows. In CSV format, if there are two commas on one row, that means the table has three columns (two commas separate three possible columns). Always return the max number of columns and return a placeholder "null" on any column that is not present in a row. Always return a checkedin columns, even if it is not present in the CSV, just make it up.

The schema would look something like this, but we are not strict about it, you can put new attributes inside the objects because the user input changes. You should return an array of objects, where each object represents a row, with each attribute representing the column name and value for that row. For example, a good response would be:
  {
    name: "John",
    lastname: "Doe",
    ID: "f123456",
    checkedIn: true
    RSVP: "Yes"
  }
Usually there is always name, last name and dartmouth ID, and in 0.1% cases maybe there isnt. Checked in, name, ID and lastname should always be there, if not provided, just add. That means, fill whenever possible. If there is only ID in one row, just return an object with ID and the rest of mandatory attribtues in blank, as empty strings. Or, if you are feeling generous, use "null". Remember that the name for the checkedIn field should be strictly "checkedIn" for my program to work. I will convert into a super villain if you use any other checkedIn name. Also, make sure the columns are ordered. Usually the most important attributes go first, if it seems good, leave it as is.

Basically, your task is easy. Infer what columns each object should have, all objects should have all columns, and craft the object by taking the user input and manipulating it to something usable. Remember it must be complete for use in a table.

CSV:
${csvString}
`;
}

export async function fetchItemsFromAI(csvString: string): Promise<Omit<Record<string, any>, 'uid'>[]> {
  const prompt = buildCsvItemsPrompt(csvString);
  const aiResponse = await openaiGenerate(prompt, undefined);
  
  // If the response is a JS array, return as is. If it's a string, parse it.
  if (Array.isArray(aiResponse)) {
    return aiResponse;
  } else if (typeof aiResponse === "string") {
    try {
      return JSON.parse(aiResponse);
    } catch (e) {
      throw new Error("Failed to parse AI response as JSON: " + aiResponse);
    }
  } else {
    throw new Error("AI response is neither an array nor a string: " + JSON.stringify(aiResponse));
  }
}

export function addUIDToItems(items: Omit<Record<string, any>, 'uid'>[]): Record<string, any>[] {
  return items.map(item => ({
    ...item,
    uid: nanoid(),
  }));
}

export async function parseItemsFromCSVWithAI(csvString: string): Promise<Record<string, any>[]> {
  const items = await fetchItemsFromAI(csvString);
  return addUIDToItems(items);
}