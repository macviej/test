export type LunchType = "standard" | "vegan";

export type Participant = {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  phone: string;
  telegram: string;
  email: string;
  needsLunch: boolean | null;
  lunchType: LunchType | null;
  hasAllergy: boolean | null;
  allergyNote: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  createdAt: string;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  phone: string;
  telegram: string;
  email: string;
  needsLunch: boolean | null;
  lunchType: LunchType | null;
  hasAllergy: boolean | null;
  allergyNote: string;
  consent: boolean;
};

export type QuestionStatus = "open" | "answered" | "hidden";

export type Question = {
  id: string;
  text: string;
  authorKey: string;
  authorLabel: string;
  likes: string[];
  status: QuestionStatus;
  createdAt: string;
  answeredAt: string | null;
};
