export const ASSETS = `${import.meta.env.BASE_URL}rvh/assets/`;
export const PHONE = "+9647700893434";
export const MAP =
  "https://www.google.com/maps/search/?api=1&query=Royal+Veterinary+Hospital+60+Meter+Road+Kobane+Bridge+Sulaymaniyah";
export { services } from "./services-data";
export const featuredServices = [
  {
    slug: "general-care",
    title: "General health checks",
    short: "A little prevention. A lifetime of good health.",
    category: "Everyday care",
    icon: "pet-consultation.svg",
    x: 90,
    intro:
      "A familiar face for every stage of your pet’s life. Our consultations make space for a thorough examination, your questions, and a care plan that fits your companion.",
    included: [
      "A complete nose-to-tail examination",
      "Weight, nutrition and lifestyle review",
      "A conversation about any changes at home",
      "A personalised plan for next steps",
    ],
    prep: "Bring previous medical records, a list of medications, and any questions you would like to discuss.",
  },
  {
    slug: "vaccination",
    title: "Vaccination & prevention",
    short: "Protection for their next great adventure.",
    category: "Everyday care",
    icon: "pet-vaccinations.svg",
    x: 440,
    intro:
      "Preventive care built around your pet. We review their age, lifestyle and vaccination history before discussing an appropriate schedule with you.",
    included: [
      "Vaccination history review",
      "A health examination before vaccination",
      "Core and lifestyle vaccination discussion",
      "A clear record of upcoming appointments",
    ],
    prep: "Please bring your pet’s vaccination booklet and details of any previous reactions or recent illness.",
  },
  {
    slug: "surgery",
    title: "Surgery & recovery",
    short: "Thoughtful care, before and after surgery.",
    category: "Specialist care",
    icon: "cat-surgery-1.svg",
    x: 790,
    intro:
      "From the first consultation to the journey home, you should understand what happens next. Our surgical team talks you through the procedure, preparation and recovery plan.",
    included: [
      "Pre-operative consultation and assessment",
      "A procedure and anaesthesia discussion",
      "Monitoring and recovery support",
      "Written home-care and follow-up instructions",
    ],
    prep: "Preparation varies by procedure. Contact the team for instructions specific to your pet before the day of surgery.",
  },
  {
    slug: "dental-care",
    title: "Dental care",
    short: "Healthy teeth. Happier little smiles.",
    category: "Specialist care",
    icon: "pet-dental-care.svg",
    x: 1130,
    intro:
      "Comfort starts with a healthy mouth. A dental consultation helps us understand your pet’s oral health and talk through suitable treatment and ongoing care.",
    included: [
      "An oral health assessment",
      "Discussion of cleaning and treatment options",
      "A tailored treatment estimate",
      "Practical home-care guidance",
    ],
    prep: "Tell us about changes in eating, chewing or behaviour, and bring details of previous dental treatment.",
  },
  {
    slug: "grooming",
    title: "Grooming & wellbeing",
    short: "Looking good. Feeling even better.",
    category: "Everyday care",
    icon: "grooming.svg",
    x: 1480,
    intro:
      "A fresh coat and a comfortable companion. Our grooming visits are a chance to discuss your pet’s coat, skin and individual comfort needs.",
    included: [
      "A coat and grooming needs consultation",
      "Bathing and coat care",
      "Nail and hygiene care discussion",
      "Guidance for coat maintenance at home",
    ],
    prep: "Let us know about skin sensitivities, previous grooming experiences and anything that helps your pet feel at ease.",
  },
  {
    slug: "diagnostics",
    title: "Imaging & diagnostics",
    short: "Clearer answers. A clearer way forward.",
    category: "Specialist care",
    icon: "Advanced-CT-MRI-Imaging-1.svg",
    x: 1820,
    intro:
      "The right information helps guide the right care. We use examination findings to discuss suitable laboratory tests, X-rays or ultrasound and explain the results with you.",
    included: [
      "A review of symptoms and medical history",
      "A recommended diagnostic plan",
      "Laboratory testing or imaging as appropriate",
      "A results discussion and next-step plan",
    ],
    prep: "Bring relevant previous results. The team will tell you if any preparation is needed for your pet’s particular test.",
  },
];
export const plans = [
  {
    name: "Starter Care",
    label: "FOR LITTLE BEGINNINGS",
    price: "100,000",
    desc: "A thoughtful start for puppies and kittens.",
    features: [
      "First-year health examination",
      "Core primary vaccinations",
      "Deworming & faecal screening",
      "Nutrition & growth guidance",
    ],
  },
  {
    name: "Preventive Plus",
    label: "FOR EVERYDAY ADVENTURES",
    price: "185,000",
    desc: "Keep their good days going, year after year.",
    features: [
      "Annual head-to-tail examination",
      "Core vaccination boosters",
      "Complete blood count (CBC)",
      "Preventive care planning",
    ],
  },
  {
    name: "Golden Years",
    label: "FOR A LIFETIME OF LOVE",
    price: "255,000",
    desc: "Extra attention for your oldest friend.",
    features: [
      "Two senior health examinations",
      "Comprehensive blood chemistry",
      "Joint & mobility assessment",
      "Comfort-focused care planning",
    ],
  },
];
export const team = [
  [
    "Dr. Alan Rashid",
    "Chief Medical Director",
    "Surgery & orthopaedics",
    "cat-surgery-1.svg",
  ],
  [
    "Dr. Sara Karim",
    "Internal & Feline Medicine",
    "Feline health & internal medicine",
    "pet-consultation.svg",
  ],
  [
    "Dr. Rebin Omer",
    "Anaesthesia & Critical Care",
    "Anaesthesia & emergency care",
    "cardiology.svg",
  ],
  [
    "Dr. Choman Bakr",
    "Dentistry & Exotic Animals",
    "Dental health & exotic companions",
    "pet-dental-care.svg",
  ],
];
export const faqs = [
  [
    "Is This Your Pet’s First Visit to Royal?",
    "If your pet has had vaccinations, tests or previous treatment, please bring any relevant records. Keep dogs on a leash and cats in a secure carrier. If your pet is nervous, let us know so we can help.",
  ],
  [
    "How Can I Request an Appointment?",
    "You can request an appointment through our website, WhatsApp or by phone. Once we receive your request, our team will contact you to arrange and confirm a suitable time.",
  ],
  [
    "Can I Contact You Outside Opening Hours?",
    "For urgent cases, contact our emergency line directly. Please don’t wait for an online appointment response in an emergency.",
  ],
  [
    "Which Care Package Should I Choose?",
    "Starter Care is for young pets, Preventive Plus focuses on annual check-ups, and Golden Years is designed for senior pets. Our team can help you choose the most suitable option.",
  ],
];
