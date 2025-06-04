export interface Attendee {
  id?: string;
  name?: string;
  lastname?: string;
  email?: string;
  status?: string;
  [key: string]: string | undefined; // for additional fields/columns
}