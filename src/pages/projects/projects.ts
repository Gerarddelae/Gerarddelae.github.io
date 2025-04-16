import { getRepositoryDetails } from "../../utils";

export interface Project {
  name: string;
  demoLink: string;
  tags?: string[],
  description?: string;
  postLink?: string;
  demoLinkRel?: string;
  [key: string]: any;
}

export const projects: Project[] = [
  {
    name: 'HOTEL SPA',
    description: 'Hotel SPA is a single-page application (SPA) designed for small hotels looking to efficiently manage guests, bookings, rooms, and other essential operations. The platform provides an intuitive interface for hotel staff to handle daily operations while maintaining a centralized database of all hotel-related information.',
    demoLink: 'https://github.com/Gerarddelae/hotel-spa',
    tags: ['SaaS', 'JS']
  },
  {
    name: 'SQL AGENT',
    description: "The SQL Query Agent is a powerful, AI-assisted tool designed to streamline and optimize database interactions. It allows users to generate, analyze, and refine SQL queries effortlessly using natural language processing (NLP). Whether you're a developer, data analyst, or business user, this tool simplifies complex database operations while ensuring accuracy and efficiency.",
    demoLink: 'https://github.com/Gerarddelae/Hotel-SQL-Agent',
    demoLinkRel: 'nofollow noopener noreferrer',
    tags: ['AI', 'Saas', 'Agent', 'Python']
  }
]
