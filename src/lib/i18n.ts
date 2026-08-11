export type Locale = "RU" | "BY" | "EN";

export type RegistrationStatus = "open" | "closed" | "ended";

export function getRegistrationStatus(): RegistrationStatus {
  const raw = (process.env.NEXT_PUBLIC_REGISTRATION_STATUS || "open").toLowerCase();
  if (raw === "closed" || raw === "ended") return raw;
  return "open";
}

export const LOCALE_STORAGE_KEY = "imago-locale";
export const COOKIES_STORAGE_KEY = "imago-cookies-ok";

export function parseLocale(value: string | null | undefined): Locale {
  if (value === "RU" || value === "BY" || value === "EN") return value;
  return "RU";
}

type WelcomeCopy = {
  titleLine1: string;
  titleLine2: string;
  body: string;
  chips: string[];
  cta: string;
  ticketLogin: string;
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
    ticketLogin: "Войти",
    cookiesText: "Для вашего удобства мы используем Кукисы.",
    cookiesOk: "Понятно",
  },
  BY: {
    titleLine1: "Сардэчна запрашаем на",
    titleLine2: "IMAGO DEI CONF 2026!",
    body: "У гэтым годзе нашай канферэнцыі спаўняецца 5 гадоў. Ужо пяты год мы збіраемся разам, каб вывучаць Божае Слова, размаўляць, задаваць важныя пытанні і ўзрастаць у пазнанні Бога.",
    chips: ["Бараўляны, Першамайская 23", "30 BYN", "7 лістапада", "10:00"],
    cta: "Зарэгістравацца",
    ticketLogin: "Увайсці",
    cookiesText: "Для вашай зручнасці мы выкарыстоўваем кукісы.",
    cookiesOk: "Зразумела",
  },
  EN: {
    titleLine1: "Welcome to",
    titleLine2: "IMAGO DEI CONF 2026!",
    body: "This year our conference turns 5. For the fifth year we gather to study God's Word, connect, ask important questions, and grow in knowing God.",
    chips: ["Borovlyany, Pervomayskaya 23", "30 BYN", "November 7", "10:00"],
    cta: "Register",
    ticketLogin: "Log in",
    cookiesText: "For your convenience, we use cookies.",
    cookiesOk: "Got it",
  },
};

const welcomeClosed: Record<
  Locale,
  Pick<WelcomeCopy, "titleLine1" | "titleLine2" | "body" | "chips">
> = {
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

const welcomeEnded: Record<
  Locale,
  Pick<WelcomeCopy, "titleLine1" | "titleLine2" | "body">
> = {
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
    return {
      ...base,
      ...welcomeClosed[locale],
      cta: null as string | null,
      ticketLogin: base.ticketLogin,
    };
  }
  if (status === "ended") {
    return {
      ...base,
      ...welcomeEnded[locale],
      chips: [] as string[],
      cta: null as string | null,
      ticketLogin: null as string | null,
    };
  }
  return {
    ...base,
    cta: base.cta as string | null,
    ticketLogin: base.ticketLogin as string | null,
  };
}

export const registerCopy: Record<
  Locale,
  {
    closed: string;
    title: string;
    firstName: string;
    lastName: string;
    phone: string;
    telegram: string;
    email: string;
    consent: string;
    next: string;
    lunchTitle: string;
    lunchQuestion: string;
    yes: string;
    no: string;
    saving: string;
    errRequired: string;
    errConsent: string;
    errLunch: string;
    errGeneric: string;
    errSubmit: string;
  }
> = {
  RU: {
    closed: "Регистрация закрыта",
    title: "Общая информация",
    firstName: "Имя",
    lastName: "Фамилия",
    phone: "Номер телефона",
    telegram: "Никнейм в Телеграм",
    email: "E-mail",
    consent: "Я согласен с обработкой данных",
    next: "Далее",
    lunchTitle: "Обед",
    lunchQuestion: "Нужен ли вам обед?",
    yes: "Да",
    no: "Нет",
    saving: "Сохраняем...",
    errRequired: "Заполните все обязательные поля",
    errConsent: "Нужно согласие на обработку данных",
    errLunch: "Выберите вариант с обедом",
    errGeneric: "Ошибка регистрации",
    errSubmit: "Не удалось отправить форму",
  },
  BY: {
    closed: "Рэгістрацыя закрыта",
    title: "Агульная інфармацыя",
    firstName: "Імя",
    lastName: "Прозвішча",
    phone: "Нумар тэлефона",
    telegram: "Нікнейм у Telegram",
    email: "E-mail",
    consent: "Я згодны з апрацоўкай даных",
    next: "Далей",
    lunchTitle: "Абед",
    lunchQuestion: "Ці патрэбны вам абед?",
    yes: "Так",
    no: "Не",
    saving: "Захоўваем...",
    errRequired: "Запоўніце ўсе абавязковыя палі",
    errConsent: "Патрэбна згода на апрацоўку даных",
    errLunch: "Выберыце варыянт з абедам",
    errGeneric: "Памылка рэгістрацыі",
    errSubmit: "Не ўдалося адправіць форму",
  },
  EN: {
    closed: "Registration is closed",
    title: "General information",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone number",
    telegram: "Telegram username",
    email: "E-mail",
    consent: "I agree to the processing of my data",
    next: "Next",
    lunchTitle: "Lunch",
    lunchQuestion: "Do you need lunch?",
    yes: "Yes",
    no: "No",
    saving: "Saving...",
    errRequired: "Please fill in all required fields",
    errConsent: "Data processing consent is required",
    errLunch: "Please choose a lunch option",
    errGeneric: "Registration error",
    errSubmit: "Could not submit the form",
  },
};

export const findTicketCopy: Record<
  Locale,
  {
    title: string;
    hint: string;
    lastName: string;
    phone: string;
    submit: string;
    loading: string;
    errRequired: string;
    errGeneric: string;
  }
> = {
  RU: {
    title: "Войти",
    hint: "Введите фамилию и телефон из регистрации — откроем ваш QR и доступ к Q&A.",
    lastName: "Фамилия",
    phone: "Номер телефона",
    submit: "Войти",
    loading: "Ищем...",
    errRequired: "Укажите фамилию и телефон",
    errGeneric: "Не удалось найти регистрацию",
  },
  BY: {
    title: "Увайсці",
    hint: "Увядзіце прозвішча і тэлефон з рэгістрацыі — адкрыем ваш QR і доступ да Q&A.",
    lastName: "Прозвішча",
    phone: "Нумар тэлефона",
    submit: "Увайсці",
    loading: "Шукаем...",
    errRequired: "Укажыце прозвішча і тэлефон",
    errGeneric: "Не ўдалося знайсці рэгістрацыю",
  },
  EN: {
    title: "Log in",
    hint: "Enter the last name and phone from registration to open your QR and Q&A.",
    lastName: "Last name",
    phone: "Phone number",
    submit: "Log in",
    loading: "Looking up...",
    errRequired: "Enter last name and phone",
    errGeneric: "Could not find your registration",
  },
};

export const ticketCopy: Record<
  Locale,
  {
    loading: string;
    notFound: string;
    loadError: string;
    thanks: string;
    body: string;
    invite: string;
    askQuestion: string;
    inviteShare: string;
    linkCopied: string;
    cantCome: string;
    cancel: string;
    cancelSoon: string;
    info: string;
    close: string;
    yourData: string;
    lunch: string;
    lunchYes: string;
    lunchNo: string;
    chips: string[];
  }
> = {
  RU: {
    loading: "Загрузка...",
    notFound: "Билет не найден",
    loadError: "Не удалось загрузить QR",
    thanks: "Спасибо за регистрацию",
    body: "Этот QR-код — твой пропуск на конференцию. Покажи его на стойке регистрации или назови последние 3 цифры кода.",
    invite: "Пригласить друга",
    askQuestion: "Задать вопрос",
    inviteShare: "Присоединяйся к Imago Dei Conf 2026!",
    linkCopied: "Ссылка скопирована",
    cantCome: "Не получается прийти?",
    cancel: "Отменить регистрацию",
    cancelSoon: "Отмена регистрации будет доступна позже",
    info: "Информация",
    close: "Закрыть",
    yourData: "Ваши данные",
    lunch: "Обед",
    lunchYes: "Нужен",
    lunchNo: "Не нужен",
    chips: welcomeOpen.RU.chips,
  },
  BY: {
    loading: "Загрузка...",
    notFound: "Білет не знойдзены",
    loadError: "Не ўдалося загрузіць QR",
    thanks: "Дзякуй за рэгістрацыю",
    body: "Гэты QR-код — твой пропуск на канферэнцыю. Пакажы яго на стойцы рэгістрацыі або назві апошнія 3 лічбы кода.",
    invite: "Запрасіць сябра",
    askQuestion: "Задаць пытанне",
    inviteShare: "Далучайся да Imago Dei Conf 2026!",
    linkCopied: "Спасылка скапіявана",
    cantCome: "Не можаш прыйсці?",
    cancel: "Адмяніць рэгістрацыю",
    cancelSoon: "Адмена рэгістрацыі будзе даступная пазней",
    info: "Інфармацыя",
    close: "Закрыць",
    yourData: "Вашы даныя",
    lunch: "Абед",
    lunchYes: "Патрэбны",
    lunchNo: "Не патрэбны",
    chips: welcomeOpen.BY.chips,
  },
  EN: {
    loading: "Loading...",
    notFound: "Ticket not found",
    loadError: "Could not load QR",
    thanks: "Thanks for registering",
    body: "This QR code is your pass to the conference. Show it at the registration desk or say the last 3 digits of the code.",
    invite: "Invite a friend",
    askQuestion: "Ask a question",
    inviteShare: "Join Imago Dei Conf 2026!",
    linkCopied: "Link copied",
    cantCome: "Can't make it?",
    cancel: "Cancel registration",
    cancelSoon: "Registration cancellation will be available later",
    info: "Information",
    close: "Close",
    yourData: "Your details",
    lunch: "Lunch",
    lunchYes: "Needed",
    lunchNo: "Not needed",
    chips: welcomeOpen.EN.chips,
  },
};

export const notFoundCopy: Record<
  Locale,
  { title: string; body: string; home: string }
> = {
  RU: {
    title: "Похоже, страница вознеслась",
    body: "Мы искали её повсюду, но так и не нашли. Попробуйте начать заново с главной страницы.",
    home: "НА ГЛАВНУЮ",
  },
  BY: {
    title: "Падобна, старонка ўзнеслася",
    body: "Мы шукалі яе паўсюль, але так і не знайшлі. Паспрабуйце пачаць зноў з галоўнай старонкі.",
    home: "НА ГАЛОЎНУЮ",
  },
  EN: {
    title: "Looks like this page ascended",
    body: "We looked everywhere, but couldn't find it. Try starting over from the home page.",
    home: "GO HOME",
  },
};

export const SOCIAL_LINKS = [
  {
    name: "Telegram",
    href: "https://t.me/imagodeiconf",
    icon: "/assets/social-telegram.svg",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/trinityminsk/",
    icon: "/assets/social-instagram.svg",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@trinity-church-minsk",
    icon: "/assets/social-youtube.svg",
  },
] as const;
