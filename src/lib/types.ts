export type Participant = {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  phone: string;
  telegram: string;
  email: string;
  needsLunch: boolean | null;
  createdAt: string;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  phone: string;
  telegram: string;
  email: string;
  needsLunch: boolean | null;
  consent: boolean;
};
