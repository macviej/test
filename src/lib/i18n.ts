export type Locale = "RU" | "BY" | "EN";

export type RegistrationStatus = "open" | "closed" | "ended";

export function getRegistrationStatus(): RegistrationStatus {
  const raw = (process.env.NEXT_PUBLIC_REGISTRATION_STATUS || "open").toLowerCase();
  if (raw === "closed" || raw === "ended") return raw;
  return "open";
}

type WelcomeCopy = {
  titleLine1: string;
  titleLine2: string;
  body: string;
  chips: string[];
  cta: string;
  cookiesText: string;
  cookiesOk: string;
};

const welcomeOpen: Record<Locale, WelcomeCopy> = {
  RU: {
    titleLine1: "Добро пожаловать на",
    titleLine2: "IMAGO DEI CONF 2026!",
    body: "В этом году нашей конференции исполняется 5 лет. Уже пятый год мы собираемся вместе, чтобы изучать Божье Слово, общаться, задавать важные вопросы и возрастать в познании Бога.",
    chips: ["Боровляны, Первомайская 23", "30 BYN", "7 ноября", "10:00"],
    cta: "Зарегистрироваться",
    cookiesText: "Для вашего удобства мы используем Кукисы.",
    cookiesOk: "Понятно",
  },
  BY: {
    titleLine1: "Сардэчна запрашаем на",
    titleLine2: "IMAGO DEI CONF 2026!",
    body: "У гэтым годзе нашай канферэнцыі спаўняецца 5 гадоў. Ужо пяты год мы збіраемся разам, каб вывучаць Божае Слова, размаўляць, задаваць важныя пытанні і ўзрастаць у пазнанні Бога.",
    chips: ["Бараўляны, Першамайская 23", "30 BYN", "7 лістапада", "10:00"],
    cta: "Зарэгістравацца",
    cookiesText: "Для вашай зручнасці мы выкарыстоўваем кукісы.",
    cookiesOk: "Зразумела",
  },
  EN: {
    titleLine1: "Welcome to",
    titleLine2: "IMAGO DEI CONF 2026!",
    body: "This year our conference turns 5. For the fifth year we gather to study God's Word, connect, ask important questions, and grow in knowing God.",
    chips: ["Borovlyany, Pervomayskaya 23", "30 BYN", "November 7", "10:00"],
    cta: "Register",
    cookiesText: "For your convenience, we use cookies.",
    cookiesOk: "Got it",
  },
};

const welcomeClosed: Record<Locale, Pick<WelcomeCopy, "titleLine1" | "titleLine2" | "body" | "chips">> = {
  RU: {
    titleLine1: "Добро пожаловать на",
    titleLine2: "IMAGO DEI CONF 2026!",
    body: "К сожалению, регистрация на конференцию уже завершена, но мы все равно будем рады видеть вас! Приходите, чтобы вместе провести время в общении, изучении Божьего Слова и поклонении.",
    chips: welcomeOpen.RU.chips,
  },
  BY: {
    titleLine1: "Сардэчна запрашаем на",
    titleLine2: "IMAGO DEI CONF 2026!",
    body: "На жаль, рэгістрацыя на канферэнцыю ўжо завершана, але мы ўсё роўна будзем рады вас бачыць! Прыходзьце, каб разам правесці час у зносінах, вывучэнні Божага Слова і пакланенні.",
    chips: welcomeOpen.BY.chips,
  },
  EN: {
    titleLine1: "Welcome to",
    titleLine2: "IMAGO DEI CONF 2026!",
    body: "Unfortunately, registration is already closed, but we will still be glad to see you! Come join us for fellowship, studying God's Word, and worship.",
    chips: welcomeOpen.EN.chips,
  },
};

const welcomeEnded: Record<Locale, Pick<WelcomeCopy, "titleLine1" | "titleLine2" | "body">> = {
  RU: {
    titleLine1: "Ждем вас на",
    titleLine2: "IMAGO DEI CONF 2027!",
    body: "К сожалению, конференция уже завершена, но мы будем рады видеть вас в следующем году!\n\nПодписывайтесь на наши соцсети, чтобы не пропустить анонс и открытие регистрации.",
  },
  BY: {
    titleLine1: "Чакаем вас на",
    titleLine2: "IMAGO DEI CONF 2027!",
    body: "На жаль, канферэнцыя ўжо завершана, але мы будзем рады бачыць вас у наступным годзе!\n\nПадпісвайцеся на нашы сацсеткі, каб не прапусціць ананс і адкрыццё рэгістрацыі.",
  },
  EN: {
    titleLine1: "See you at",
    titleLine2: "IMAGO DEI CONF 2027!",
    body: "Unfortunately the conference has ended, but we would love to see you next year!\n\nFollow our socials so you do not miss the announcement and registration opening.",
  },
};

export function getWelcomeCopy(locale: Locale, status: RegistrationStatus) {
  const base = welcomeOpen[locale];
  if (status === "closed") {
    return { ...base, ...welcomeClosed[locale], cta: null as string | null };
  }
  if (status === "ended") {
    return {
      ...base,
      ...welcomeEnded[locale],
      chips: [] as string[],
      cta: null as string | null,
    };
  }
  return { ...base, cta: base.cta as string | null };
}

export const SOCIAL_LINKS = [
  { name: "Telegram", href: "https://t.me/", icon: "/assets/social-telegram.svg" },
  { name: "Instagram", href: "https://instagram.com/", icon: "/assets/social-instagram.svg" },
  { name: "YouTube", href: "https://youtube.com/", icon: "/assets/social-youtube.svg" },
] as const;

export const LOCALE_STORAGE_KEY = "imago-locale";
export const COOKIES_STORAGE_KEY = "imago-cookies-ok";
