import { MockableType } from "../testing/mock";
import { JiraLoader } from "./interface";

export function mockJiraLoader(): MockableType<JiraLoader> {
  return {
    loadTickets: jest.fn()
  };
}
