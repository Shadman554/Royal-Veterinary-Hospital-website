export const categories = [
  {
    id: "emergency",
    title: "Emergency care",
    short: "When every moment matters.",
    icon: "care-category-emergency.svg",
  },
  {
    id: "wellness",
    title: "Wellness & prevention",
    short: "Good habits. Healthy years ahead.",
    icon: "care-category-wellness.svg",
  },
  {
    id: "surgery",
    title: "Surgery & procedures",
    short: "Careful planning, through to recovery.",
    icon: "care-category-surgery.svg",
  },
  {
    id: "specialist",
    title: "Specialist medicine",
    short: "A closer look at complex conditions.",
    icon: "care-category-specialist.svg",
  },
  {
    id: "rehabilitation",
    title: "Rehabilitation & wellbeing",
    short: "More comfort in everyday movement.",
    icon: "care-category-rehabilitation.svg",
  },
  {
    id: "everyday",
    title: "Grooming & convenience",
    short: "A little help with life together.",
    icon: "care-category-everyday.svg",
  },
] as const;

export type CareCategory = (typeof categories)[number]["id"];
export type CareTopic = [title: string, description: string, icon: string];
export type CareFAQ = [question: string, answer: string];
export interface Service {
  slug: string;
  title: string;
  short: string;
  category: CareCategory;
  icon: string;
  intro: string;
  topics: CareTopic[];
  signs: string[];
  prep: string;
  after: string;
  faqs: CareFAQ[];
  related: string[];
  keywords?: string;
  hidden?: boolean;
}

export const services: Service[] = [
  {
    slug: "emergency-pet-care",
    title: "Emergency pet care",
    category: "emergency",
    icon: "care-services-1-hover.svg",
    short: "Urgent veterinary care for pets needing immediate attention.",
    intro:
      "If your pet becomes suddenly ill or injured, call us immediately. Our team will assess the most urgent problems first and begin appropriate care.",
    topics: [
      [
        "Triage & stabilisation",
        "Pets are assessed by medical urgency. Oxygen, fluids and pain relief may be needed before further investigation.",
        "care-services-1-hover.svg",
      ],
      [
        "Finding the cause",
        "Examination, blood tests and imaging help the team understand an injury, suspected poisoning or sudden illness.",
        "care-services-2-hover.svg",
      ],
      [
        "Treatment & monitoring",
        "We explain the immediate options, including surgery or hospital care where needed, and keep you informed about next steps.",
        "care-services-3-hover.svg",
      ],
    ],
    signs: [
      "Difficulty breathing, collapse or severe weakness",
      "Seizures, major injury or uncontrolled bleeding",
      "Suspected poisoning or an inability to urinate",
    ],
    prep: "Call before travelling. Bring medication details and any suspected toxin packaging. Do not give human medicines or induce vomiting unless a veterinarian directs you.",
    after:
      "Follow the discharge plan closely. Call immediately if symptoms return or your pet becomes worse.",
    faqs: [
      [
        "Should I book online for an emergency?",
        "No. Call the hospital directly. The appointment form is for planned visits and is not monitored as an emergency service.",
      ],
      [
        "Will my pet be seen in arrival order?",
        "The most seriously unwell patients receive priority. The team will explain what your pet needs and update you as care progresses.",
      ],
    ],
    related: ["diagnostics", "surgery", "general-care"],
    keywords: "urgent accident poison seizure critical 24/7",
  },
  {
    slug: "dental-care",
    title: "Pet dental care",
    category: "wellness",
    icon: "pet-dental-care.svg",
    short: "Dental examinations and treatment for your pet’s teeth and gums.",
    intro:
      "Bad breath, sore gums and difficulty chewing may indicate dental disease. We examine your pet’s mouth and discuss suitable treatment options.",
    topics: [
      [
        "Oral assessment",
        "We examine the mouth and discuss dental imaging when needed to investigate problems below the gumline.",
        "dental-services-1.svg",
      ],
      [
        "Cleaning & treatment",
        "Professional cleaning and necessary extractions are planned with anaesthesia, monitoring and pain management.",
        "dental-services-2.svg",
      ],
      [
        "Everyday prevention",
        "A practical home routine may include pet-safe toothbrushing and suitable dental products.",
        "dental-services-3.svg",
      ],
    ],
    signs: [
      "Persistent bad breath or red, bleeding gums",
      "Drooling, dropping food or chewing on one side",
      "Broken teeth, facial swelling or mouth pain",
    ],
    prep: "Share previous dental records and describe changes in eating. Follow the team’s individual fasting instructions if a procedure is arranged.",
    after:
      "You will receive feeding, medication and recheck instructions after treatment. Start brushing only when your veterinarian says the mouth has healed.",
    faqs: [
      [
        "Does dental cleaning need anaesthesia?",
        "A thorough examination and cleaning below the gums generally require general anaesthesia. Your pet is assessed beforehand and monitored during the procedure.",
      ],
      [
        "Can a pet have dental disease and still eat?",
        "Yes. Continuing to eat does not rule out oral pain. A dental examination can help identify hidden problems.",
      ],
    ],
    related: ["general-care", "wellness-exams", "surgery"],
    keywords: "dentistry teeth gums cleaning extraction",
  },
  {
    slug: "vaccination",
    title: "Pet vaccinations",
    category: "wellness",
    icon: "pet-vaccinations.svg",
    short: "Vaccination plans based on your pet’s age and health.",
    intro:
      "Vaccinations help protect pets against serious infectious diseases. We recommend a schedule based on species, age, health and vaccination history.",
    topics: [
      [
        "A health check first",
        "We review current health and previous reactions before deciding which vaccinations are appropriate.",
        "vaccination-process1-hover.svg",
      ],
      [
        "Individual protection",
        "Core protection and additional vaccines are discussed in the context of lifestyle, travel and exposure.",
        "pet-vaccinations.svg",
      ],
      [
        "A clear next date",
        "Your vaccination record documents what was given and when the next review or booster is due.",
        "vaccination-process5-hover.svg",
      ],
    ],
    signs: [
      "A new puppy, kitten or adopted companion",
      "An overdue or incomplete vaccination record",
      "Plans for boarding, travel or a lifestyle change",
    ],
    prep: "Bring vaccination records and tell us about medicines, recent illness, pregnancy or previous vaccine reactions.",
    after:
      "Ask what to expect after vaccination. Contact a veterinarian urgently for facial swelling, breathing difficulty or collapse.",
    faqs: [
      [
        "Do all vaccines need yearly boosters?",
        "No. Timing depends on the vaccine, previous doses, local requirements and individual risk. We will provide a schedule for your pet.",
      ],
      [
        "What if I have no vaccination record?",
        "Bring any information you have. The veterinarian will assess your pet and discuss an appropriate catch-up plan.",
      ],
    ],
    related: ["dog-vaccinations", "cat-vaccinations", "wellness-exams"],
    keywords: "vaccine booster rabies immunisation",
  },
  {
    slug: "dog-vaccinations",
    title: "Dog vaccinations",
    category: "wellness",
    icon: "dog-vaccinations.svg",
    short: "Vaccinations for puppies and adult dogs.",
    intro:
      "Puppies and adult dogs have different vaccination needs. We review your dog’s health and records before recommending vaccines and booster dates.",
    topics: [
      [
        "Puppy protection",
        "A series of vaccinations builds protection during early life. The team explains the course and follow-up dates.",
        "puppy-vaccination.svg",
      ],
      [
        "Adult boosters",
        "We review protection against diseases such as distemper, parvovirus and infectious hepatitis, alongside rabies requirements.",
        "adult-vaccination.svg",
      ],
      [
        "Lifestyle review",
        "Boarding, group activities and travel may change which additional vaccines are recommended.",
        "dog-vaccinations.svg",
      ],
    ],
    signs: [
      "Starting a puppy vaccination course",
      "An adult dog due for a vaccination review",
      "Upcoming boarding, training classes or travel",
    ],
    prep: "Bring your dog’s booklet and any boarding or travel requirements. Mention recent vomiting, diarrhoea or coughing before the visit.",
    after:
      "Keep the course dates and ask when your puppy can safely explore shared spaces.",
    faqs: [
      [
        "Can my puppy go out after the first vaccination?",
        "Protection is not immediate or complete after one dose. Discuss safe socialisation and local infection risks with your veterinarian.",
      ],
      [
        "Does a missed booster mean starting again?",
        "Not always. The vaccine type and time since the last dose determine the catch-up plan.",
      ],
    ],
    related: ["vaccination", "vet-for-dog", "wellness-exams"],
    keywords: "puppy puppies canine boosters rabies",
  },
  {
    slug: "cat-vaccinations",
    title: "Cat vaccinations",
    category: "wellness",
    icon: "cat-vaccinations.svg",
    short: "Cat vaccinations based on age and exposure risk.",
    intro:
      "Indoor and outdoor cats both need vaccination advice. We consider age, previous vaccinations and exposure to other cats when recommending a plan.",
    topics: [
      [
        "Kitten courses",
        "Early-life vaccinations are given as a course, with follow-up visits to build and maintain protection.",
        "kitten.svg",
      ],
      [
        "Core feline protection",
        "We discuss protection against panleukopenia, herpesvirus and calicivirus, plus rabies where indicated.",
        "cat-vaccinations.svg",
      ],
      [
        "Exposure-based decisions",
        "Outdoor access and contact with other cats help guide advice about feline leukaemia and other risks.",
        "vet-for-cat1.svg",
      ],
    ],
    signs: [
      "A kitten joining your household",
      "An adult cat with unknown vaccination history",
      "Changes in outdoor access or boarding plans",
    ],
    prep: "Use a secure carrier with familiar bedding. Bring records and let us know about previous reactions or current medication.",
    after:
      "Keep the updated record and your next review date. Call urgently for breathing problems, facial swelling or collapse after vaccination.",
    faqs: [
      [
        "Does my indoor cat need vaccines?",
        "Indoor living reduces some risks but does not remove all exposure. Your veterinarian will recommend an appropriate level of protection.",
      ],
      [
        "Can an unwell cat be vaccinated?",
        "Tell us about symptoms before the visit. The veterinarian may postpone vaccination until your cat is well enough.",
      ],
    ],
    related: ["vaccination", "vet-for-cat", "wellness-exams"],
    keywords: "kitten kittens feline boosters rabies",
  },
  {
    slug: "wellness-exams",
    title: "Wellness exams",
    category: "wellness",
    icon: "wellness-exams.svg",
    short: "Routine examinations to monitor your pet’s health.",
    intro:
      "Routine check-ups are useful even when your pet seems healthy. They help us notice changes in weight, appetite, movement and general condition.",
    topics: [
      [
        "Nose-to-tail examination",
        "The visit includes a physical examination and a review of the mouth, skin, body condition and movement.",
        "checkup1-hover.svg",
      ],
      [
        "Prevention planning",
        "We review vaccination, parasite protection, nutrition and daily habits together.",
        "wellness-exams.svg",
      ],
      [
        "Age-appropriate screening",
        "Blood or urine tests may be recommended based on findings, life stage and medical history.",
        "senior.svg",
      ],
    ],
    signs: [
      "A routine preventive review",
      "Changes as your pet enters a new life stage",
      "Questions about weight, diet or parasite protection",
    ],
    prep: "Bring records, medication details and the name and amount of food your pet eats. Note any small changes you have noticed.",
    after:
      "Keep your care plan and recommended review date. Contact us earlier if a new symptom appears.",
    faqs: [
      [
        "How often should my pet have a check-up?",
        "The interval depends on age, health and risk. Older pets and animals managing ongoing conditions may need more frequent reviews.",
      ],
      [
        "Are blood tests included every time?",
        "Tests are recommended when useful for your pet. We explain their purpose and cost before proceeding.",
      ],
    ],
    related: ["general-care", "vaccination", "diagnostics"],
    keywords: "checkup check-up annual preventive senior",
  },
  {
    slug: "general-care",
    title: "Pet consultation",
    category: "wellness",
    icon: "pet-consultation.svg",
    short: "Veterinary consultations to assess concerns and plan next steps.",
    intro:
      "If you’ve noticed a change in your pet’s health or behaviour, book a consultation. We’ll discuss the symptoms, examine your pet and explain what to do next.",
    topics: [
      [
        "Your pet’s story",
        "We review symptoms, routines, diet and previous treatment to build a useful picture of their health.",
        "pet-consultation.svg",
      ],
      [
        "A focused examination",
        "Physical findings help guide whether observation, testing or treatment is the next step.",
        "checkup2-hover.svg",
      ],
      [
        "A plan together",
        "You can discuss options, costs and follow-up before deciding how to proceed.",
        "checkup3-hover.svg",
      ],
    ],
    signs: [
      "Changes in appetite, energy or behaviour",
      "Recurring digestive, skin or mobility concerns",
      "Questions about a diagnosis or ongoing treatment",
    ],
    prep: "Write down when symptoms started. Short videos of unusual movement or behaviour can help, along with records and medication details.",
    after:
      "Follow the agreed plan and contact us if symptoms worsen or do not improve as expected.",
    faqs: [
      [
        "Can I discuss more than one concern?",
        "Yes. Tell the team about your concerns when arranging the visit so we can plan enough time.",
      ],
      [
        "When should I call instead of booking?",
        "Breathing difficulty, collapse, severe injury, seizures or inability to urinate need urgent advice. Call the hospital immediately.",
      ],
    ],
    related: ["wellness-exams", "diagnostics", "emergency-pet-care"],
    keywords: "general health checks exam appointment sick second opinion",
  },
  {
    slug: "vet-for-dog",
    title: "Vet for dogs",
    category: "wellness",
    icon: "vet-for-dog.svg",
    short: "Veterinary care for dogs of all ages.",
    intro:
      "Dogs need different care as they grow. We provide examinations, preventive care and treatment for health problems at every life stage.",
    topics: [
      [
        "A healthy beginning",
        "Discuss growth, feeding, vaccination, parasite protection and early socialisation.",
        "puppy-vaccination.svg",
      ],
      [
        "Adult dog health",
        "Regular reviews cover body condition, teeth, skin and any changes in activity or behaviour.",
        "vet-for-dog.svg",
      ],
      [
        "Support in later life",
        "Mobility, comfort and changes in drinking or appetite guide senior-care discussions and testing.",
        "senior.svg",
      ],
    ],
    signs: [
      "A new dog or puppy in the family",
      "Limping, itching or recurring digestive problems",
      "A change in stamina, weight or daily habits",
    ],
    prep: "Bring your dog on a secure lead. Share records, diet details and any handling worries so we can plan a comfortable visit.",
    after:
      "Use the agreed care plan at home and keep track of changes between visits.",
    faqs: [
      [
        "Can you help with an anxious dog?",
        "Tell us before the visit. We can discuss handling needs and ways to make the appointment more manageable.",
      ],
      [
        "Can you coordinate different types of care?",
        "A consultation can help connect preventive, dental, surgical or specialist needs into a practical plan.",
      ],
    ],
    related: ["dog-vaccinations", "dog-spaying-neutering", "physiotherapy"],
    keywords: "canine puppy puppies senior dogs",
  },
  {
    slug: "vet-for-cat",
    title: "Vet for cats",
    category: "wellness",
    icon: "vet-for-cat-hover.svg",
    short: "Veterinary examinations and treatment for cats.",
    intro:
      "Cats often show subtle signs of illness. Changes in eating, hiding, grooming or litter-tray use are worth discussing with a veterinarian.",
    topics: [
      [
        "Kitten care",
        "Growth, feeding, vaccination and neutering advice help establish a healthy start.",
        "kitten.svg",
      ],
      [
        "Everyday feline health",
        "We assess body condition, oral health, skin and changes in appetite or litter-tray use.",
        "vet-for-cat2.svg",
      ],
      [
        "Senior cat reviews",
        "Changing thirst, weight or activity may prompt blood tests, urine testing or further investigation.",
        "vet-for-cat3.svg",
      ],
    ],
    signs: [
      "Hiding, reduced appetite or changes in grooming",
      "Weight loss, increased thirst or altered activity",
      "Changes in litter-tray habits",
    ],
    prep: "Use a secure carrier with familiar bedding. Leave it accessible at home before travelling, and bring relevant records.",
    after:
      "Give your cat a quiet place after the visit. Follow treatment instructions and report changes promptly.",
    faqs: [
      [
        "My cat strains but produces no urine. Can it wait?",
        "No. This can be a life-threatening emergency. Call the hospital immediately.",
      ],
      [
        "Why examine a cat that seems healthy?",
        "Regular reviews can identify changes in weight, teeth and general health that are easy to miss at home.",
      ],
    ],
    related: ["cat-vaccinations", "cat-spaying-neutering", "wellness-exams"],
    keywords: "feline kitten kittens senior cats",
  },
  {
    slug: "spay-neuter",
    title: "Spay & neuter",
    category: "surgery",
    icon: "spay.svg",
    short: "Consultation and neutering procedures for male and female pets.",
    intro:
      "Spaying and neutering are medical decisions. We’ll assess your pet and discuss the benefits, risks and appropriate timing before surgery.",
    topics: [
      [
        "Choosing the timing",
        "Species, breed, age, health and lifestyle help guide the decision rather than a single age for every animal.",
        "before-surgery.svg",
      ],
      [
        "The procedure",
        "We explain the planned surgery, anaesthesia, monitoring and pain relief before admission.",
        "spay.svg",
      ],
      [
        "Recovery at home",
        "Wound protection, restricted activity and follow-up help support healing.",
        "after-surgery.svg",
      ],
    ],
    signs: [
      "Planning to prevent unwanted litters",
      "Discussing reproductive health",
      "An adopted pet with an unknown surgical history",
    ],
    prep: "Follow the specific food, water and medication instructions provided by the team. Tell us if your pet may be pregnant or in season.",
    after:
      "Prevent licking and jumping as instructed. Contact us about swelling, discharge, marked discomfort or unusual lethargy.",
    faqs: [
      [
        "Will neutering change my pet’s personality?",
        "It may affect some hormone-related behaviours, but it is not a guaranteed solution for behavioural concerns.",
      ],
      [
        "Is surgery risk-free?",
        "No procedure is without risk. Assessment, monitoring and an individual plan help the team manage those risks.",
      ],
    ],
    related: [
      "dog-spaying-neutering",
      "cat-spaying-neutering",
      "laparoscopic-spay",
    ],
    keywords: "sterilisation desexing castration reproductive",
  },
  {
    slug: "laparoscopic-spay",
    title: "Laparoscopic spay",
    category: "surgery",
    icon: "laparascopic.svg",
    short: "Laparoscopic spaying for suitable cases.",
    intro:
      "Laparoscopic spaying uses a camera and specialised instruments through small incisions. The veterinarian will assess whether it’s suitable for your pet.",
    topics: [
      [
        "Suitability assessment",
        "We review size, health and reproductive history, then compare keyhole and conventional options.",
        "laparascopic-1.svg",
      ],
      [
        "Camera-guided surgery",
        "The camera gives a magnified view inside the abdomen while the surgeon works through small access points.",
        "laparascopic-2.svg",
      ],
      [
        "A recovery plan",
        "Smaller incisions may reduce tissue disruption, but pain relief and activity restrictions still matter.",
        "laparascopic-3.svg",
      ],
    ],
    signs: [
      "Considering spaying for your pet",
      "Wanting to compare surgical approaches",
      "Questions about recovery and suitability",
    ],
    prep: "Arrange an assessment first. Follow the admission instructions and report recent illness, medication or a possible pregnancy.",
    after:
      "Check the incisions daily and follow the prescribed rest period, even if your pet seems energetic.",
    faqs: [
      [
        "Is keyhole surgery suitable for every pet?",
        "No. Suitability depends on your pet and the findings at assessment. The surgeon will explain the available options.",
      ],
      [
        "Can the approach change during surgery?",
        "Sometimes a conventional incision becomes necessary. The consent discussion covers this possibility and why it may be needed.",
      ],
    ],
    related: ["spay-neuter", "dog-spaying-neutering", "surgery"],
    keywords: "keyhole minimally invasive ovariectomy",
  },
  {
    slug: "dog-spaying-neutering",
    title: "Dog spaying & neutering",
    category: "surgery",
    icon: "dog-spaying.svg",
    short: "Spaying and neutering for dogs, with pre-operative assessment.",
    intro:
      "Before spaying or neutering a dog, we consider age, breed, size and health. We explain the procedure and what recovery involves.",
    topics: [
      [
        "Female dogs",
        "Spaying prevents pregnancy. The team explains which organs are removed and the appropriate surgical approach.",
        "dog-spaying.svg",
      ],
      [
        "Male dogs",
        "Castration removes the testicles. Retained testicles can require a different surgical plan.",
        "spay.svg",
      ],
      [
        "Planning for recovery",
        "Arrange a calm resting area, supervised exercise and protection from licking the surgical site.",
        "recovery.svg",
      ],
    ],
    signs: [
      "Planning reproductive care for a puppy or adult dog",
      "Questions about breed-specific timing",
      "A retained testicle or uncertain neutering history",
    ],
    prep: "Mention heat cycles, possible pregnancy, previous anaesthesia and medications. Follow your dog’s individual fasting instructions.",
    after:
      "Follow the rest and wound-care plan. Ask about feeding adjustments as energy needs can change after neutering.",
    faqs: [
      [
        "What is the best age for my dog?",
        "There is no single best age for all dogs. Breed, size, development and individual health risks guide the discussion.",
      ],
      [
        "Will neutering stop all unwanted behaviour?",
        "No. Learned behaviours and anxiety may need a separate behaviour plan alongside any surgical decision.",
      ],
    ],
    related: ["spay-neuter", "laparoscopic-spay", "vet-for-dog"],
    keywords: "canine castration sterilisation puppy",
  },
  {
    slug: "cat-spaying-neutering",
    title: "Cat spaying & neutering",
    category: "surgery",
    icon: "cat-spaying.svg",
    short: "Spaying and neutering for cats with veterinary care.",
    intro:
      "Spaying or neutering helps prevent unwanted litters. We assess your cat before surgery and explain the procedure and recovery.",
    topics: [
      [
        "Female cats",
        "Spaying prevents pregnancy and future heat cycles. The surgical approach is explained at the consultation.",
        "cat-spaying.svg",
      ],
      [
        "Male cats",
        "Castration can reduce some hormone-driven roaming and spraying, although behaviour has many causes.",
        "cat-surgery-1.svg",
      ],
      [
        "A quiet recovery",
        "Keep your cat indoors and follow the instructions for wound checks and restricted activity.",
        "cat-surgery-3.svg",
      ],
    ],
    signs: [
      "A kitten approaching reproductive maturity",
      "An unneutered adult or newly adopted cat",
      "Questions about heat cycles, roaming or spraying",
    ],
    prep: "Bring your cat in a secure carrier. Mention any possibility of pregnancy and follow the admission instructions.",
    after:
      "Offer a calm indoor space and prevent wound licking as instructed. Contact the team if eating, comfort or wound appearance concerns you.",
    faqs: [
      [
        "Should my cat have a litter first?",
        "A litter is not necessary before spaying. Discuss timing and any individual health considerations with the veterinarian.",
      ],
      [
        "Can a community cat be assessed?",
        "Yes. Contact us before trapping or transporting a community cat so handling and aftercare can be planned.",
      ],
    ],
    related: ["spay-neuter", "vet-for-cat", "pet-welfare"],
    keywords: "feline kitten castration sterilisation",
  },
  {
    slug: "surgery",
    title: "Soft tissue & orthopaedics",
    category: "surgery",
    icon: "soft-tissue.svg",
    short: "Surgery for injuries and conditions affecting soft tissues, bones and joints.",
    intro:
      "Our surgical services cover selected soft-tissue, bone and joint conditions. Each case is assessed before we discuss the appropriate treatment options.",
    topics: [
      [
        "Soft tissue surgery",
        "Procedures can address wounds, masses and selected abdominal conditions, depending on diagnosis.",
        "soft-tissue.svg",
      ],
      [
        "Bones & joints",
        "Orthopaedic assessment investigates fractures, ligament injuries and joint problems with examination and appropriate imaging.",
        "orthopedic-17.svg",
      ],
      [
        "Recovery & rehabilitation",
        "Pain control, wound care and a staged return to movement are planned around the operation.",
        "recovery.svg",
      ],
    ],
    signs: [
      "Persistent lameness or difficulty bearing weight",
      "A wound, lump or diagnosed surgical condition",
      "An injury needing assessment and repair",
    ],
    prep: "Bring earlier imaging and records. Follow the surgeon’s specific instructions for food, water and medicines before admission.",
    after:
      "Use prescribed medication and activity limits. Attend rechecks so healing can be assessed before exercise increases.",
    faqs: [
      [
        "Does every orthopaedic problem need surgery?",
        "No. Depending on the diagnosis, medication, weight management or rehabilitation may be appropriate alternatives.",
      ],
      [
        "How long will recovery take?",
        "Recovery varies with the procedure and the patient. Your surgeon will explain expected milestones and follow-up visits.",
      ],
    ],
    related: ["diagnostics", "physiotherapy", "hydrotherapy"],
    keywords: "surgical fracture ligament bones joints operation",
  },
  {
    slug: "neurology",
    title: "Neurology",
    category: "specialist",
    icon: "neurology.svg",
    short: "Assessment of neurological, movement and balance problems.",
    intro:
      "Changes in walking, balance, awareness or behaviour can sometimes indicate neurological problems. A neurological examination helps guide further investigation.",
    topics: [
      [
        "Seizure assessment",
        "The pattern, duration and recovery from episodes help guide investigation and ongoing seizure management.",
        "neurology-conditions-1.svg",
      ],
      [
        "Spine & nerve conditions",
        "Weakness, pain and altered movement may need imaging and a discussion of medical or surgical options.",
        "neurology-conditions-2.svg",
      ],
      [
        "Balance & coordination",
        "Head tilt, falling and unusual eye movements can have different causes requiring a focused assessment.",
        "neurology-conditions-5.svg",
      ],
    ],
    signs: [
      "Seizures, tremors or unusual episodes",
      "Head tilt, poor balance or dragging a limb",
      "Neck or back pain, weakness or paralysis",
    ],
    prep: "Bring previous results and medication details. A safely recorded video and a timeline of episodes can be useful.",
    after:
      "Keep the agreed symptom diary and medication schedule. Sudden paralysis or ongoing or repeated seizures need emergency advice.",
    faqs: [
      [
        "Will my pet need a scan?",
        "Not every case does. Examination findings determine whether blood tests, advanced imaging or other investigations are useful.",
      ],
      [
        "Can neurological conditions need ongoing care?",
        "Yes. Some conditions require long-term medication and reviews, while others may need surgery or rehabilitation.",
      ],
    ],
    related: ["diagnostics", "physiotherapy", "emergency-pet-care"],
    keywords: "brain spine nerves seizure epilepsy balance",
  },
  {
    slug: "cardiology",
    title: "Cardiology",
    category: "specialist",
    icon: "cardiology.svg",
    short: "Assessment and investigation of heart conditions.",
    intro:
      "Heart murmurs, abnormal rhythms and other signs may require further investigation. We use the findings to discuss treatment and monitoring.",
    topics: [
      [
        "Heart assessment",
        "A physical examination and history help identify concerns involving heart sounds, rhythm and breathing.",
        "cardiology.svg",
      ],
      [
        "Targeted testing",
        "Heart ultrasound, ECG, blood pressure measurement or chest imaging may be recommended for different questions.",
        "Advanced-CT-MRI-Imaging-1.svg",
      ],
      [
        "Ongoing management",
        "Medication reviews and home observations help track how a condition is responding over time.",
        "cardiology-cta2-hover.svg",
      ],
    ],
    signs: [
      "A heart murmur found during examination",
      "Reduced stamina, coughing or fainting",
      "Changes in resting breathing or unusual fatigue",
    ],
    prep: "Bring medication names, doses and earlier results. Describe changes in exercise and breathing, including when they occur.",
    after:
      "Follow the monitoring plan and never change heart medicines without advice. Breathing difficulty or collapse requires urgent care.",
    faqs: [
      [
        "Does a murmur mean heart failure?",
        "No. A murmur is a finding that may need investigation. Its cause and significance depend on the individual patient.",
      ],
      [
        "What is an echocardiogram?",
        "It is an ultrasound examination used to assess the structure and movement of the heart.",
      ],
    ],
    related: ["diagnostics", "wellness-exams", "emergency-pet-care"],
    keywords: "heart murmur cardiac ECG ultrasound circulation",
  },
  {
    slug: "ophthalmology",
    title: "Ophthalmology",
    category: "specialist",
    icon: "ophthalmology.svg",
    short: "Examinations and treatment for eye and vision problems.",
    intro:
      "Redness, pain, discharge or changes in vision should be examined. We assess your pet’s eyes and discuss treatment based on the findings.",
    topics: [
      [
        "Eye examination",
        "A detailed examination assesses the eyelids, cornea, lens and other structures as appropriate.",
        "Direct-and-Indirect-Ophthalmoscopy-1.svg",
      ],
      [
        "Targeted eye tests",
        "Tear testing, corneal staining and pressure measurement help investigate different eye conditions.",
        "Tonometry-for-Glaucoma-Evaluation-1.svg",
      ],
      [
        "Treatment planning",
        "Medication or surgery may be considered for conditions such as ulcers, eyelid problems, glaucoma or cataracts.",
        "ophthalmology.svg",
      ],
    ],
    signs: [
      "Squinting, redness or rubbing at an eye",
      "Cloudiness, discharge or swelling",
      "Bumping into objects or a sudden change in vision",
    ],
    prep: "Bring existing eye medicines and tell us when they were last used. Do not start leftover drops without advice.",
    after:
      "Use medication exactly as directed and attend rechecks. A painful eye, injury or sudden loss of vision needs urgent attention.",
    faqs: [
      [
        "Can I wait to see if a sore eye improves?",
        "Contact the hospital promptly. Some eye conditions can threaten vision and need timely treatment.",
      ],
      [
        "Will my pet need surgery?",
        "Many conditions are managed medically. Examination and testing help determine whether surgery is appropriate.",
      ],
    ],
    related: ["general-care", "surgery", "emergency-pet-care"],
    keywords: "eyes vision glaucoma cataract cornea",
  },
  {
    slug: "oncology",
    title: "Oncology",
    category: "specialist",
    icon: "oncology.svg",
    short: "Assessment and treatment planning for pets with cancer.",
    intro:
      "If you’ve noticed a lump or your pet has been diagnosed with cancer, an examination can help determine the next steps. We’ll discuss options based on the diagnosis and your pet’s condition.",
    topics: [
      [
        "Diagnosis",
        "Sampling a lump or tissue may be needed to identify what it is. Appearance alone cannot confirm cancer.",
        "oncology-diagnostics-1-hover.svg",
      ],
      [
        "Understanding the extent",
        "Blood tests and imaging may help assess general health and whether a cancer has spread.",
        "oncology-diagnostics-2-hover.svg",
      ],
      [
        "A considered care plan",
        "Options may include surgery, chemotherapy or supportive care, depending on the tumour and your pet’s needs.",
        "oncology.svg",
      ],
    ],
    signs: [
      "A new or changing lump",
      "Unexplained weight loss or persistent swelling",
      "A wound that does not heal or an existing cancer diagnosis",
    ],
    prep: "Bring laboratory reports, imaging, medication details and a timeline of changes. Write down the questions that matter most to you.",
    after:
      "Monitor appetite, activity and comfort using the agreed plan. Treatment goals and next steps are reviewed as your pet’s needs change.",
    faqs: [
      [
        "Does every lump mean cancer?",
        "No. Many lumps are benign, but examination and sometimes sampling are needed to tell the difference.",
      ],
      [
        "Can care focus on comfort?",
        "Yes. Symptom relief and quality of life are central to care, whether or not cancer-directed treatment is chosen.",
      ],
    ],
    related: ["diagnostics", "surgery", "general-care"],
    keywords: "cancer tumour tumor lump chemotherapy",
  },
  {
    slug: "dermatology",
    title: "Dermatology",
    category: "specialist",
    icon: "dermatology.svg",
    short: "Investigation of itching, allergies, hair loss and skin conditions.",
    intro:
      "Persistent itching, hair loss, red skin and ear problems can have different causes. Examination and appropriate tests help us identify the cause and plan treatment.",
    topics: [
      [
        "Skin & coat assessment",
        "The pattern of irritation, seasonality and previous treatments help guide investigation.",
        "skin-conditions-1.svg",
      ],
      [
        "Targeted testing",
        "Skin or ear samples may help investigate parasites, yeast, bacteria and other causes.",
        "skin-conditions-2.svg",
      ],
      [
        "Long-term comfort",
        "Allergy management may involve parasite control, a supervised diet trial, medication and regular reviews.",
        "skin-conditions-3.svg",
      ],
    ],
    signs: [
      "Repeated scratching, licking or chewing",
      "Hair loss, redness, crusting or skin odour",
      "Recurring ear irritation or head shaking",
    ],
    prep: "Bring previous treatment details and a complete food and treat list. Ask before bathing or cleaning affected areas ahead of the visit.",
    after:
      "Follow the plan consistently. Diet trials and chronic skin conditions need planned reviews rather than frequent unsupervised changes.",
    faqs: [
      [
        "Is every itchy pet allergic?",
        "No. Parasites, infections and other conditions can also cause itching. Investigation helps avoid treating the wrong cause.",
      ],
      [
        "Why do skin problems sometimes return?",
        "Some underlying conditions need ongoing management. Rechecks help adjust treatment and investigate flare-ups.",
      ],
    ],
    related: ["general-care", "grooming", "food-delivery"],
    keywords: "skin itchy allergy allergies ears hair loss",
  },
  {
    slug: "diagnostics",
    title: "Imaging & diagnostics",
    category: "specialist",
    icon: "Advanced-CT-MRI-Imaging-1.svg",
    short: "Diagnostic testing and imaging to support accurate assessment.",
    intro:
      "Laboratory tests and medical imaging can help diagnose certain conditions. Your veterinarian recommends tests based on symptoms and examination findings.",
    topics: [
      [
        "Laboratory testing",
        "Blood, urine and other samples can help assess organ function, infection and changes in general health.",
        "pet-consultation.svg",
      ],
      [
        "Diagnostic imaging",
        "X-rays and ultrasound provide different views of internal structures. The choice depends on the problem being investigated.",
        "Advanced-CT-MRI-Imaging-1.svg",
      ],
      [
        "Results in context",
        "Findings are considered alongside symptoms and examination, with follow-up testing discussed when needed.",
        "wellness-exams.svg",
      ],
    ],
    signs: [
      "Symptoms that need further investigation",
      "Monitoring an ongoing condition or medication",
      "Assessing an injury or planning a procedure",
    ],
    prep: "Bring previous results to avoid unnecessary repetition. The team will explain any fasting, sample collection or sedation requirements.",
    after:
      "Confirm how and when results will be discussed. Some samples need more time, and a normal result may not answer every question.",
    faqs: [
      [
        "Will my pet need sedation for imaging?",
        "It depends on the examination, comfort and ability to remain still. The team will discuss this before the test.",
      ],
      [
        "Can I bring results from another clinic?",
        "Yes. Previous reports and original images, where available, can be valuable for comparison.",
      ],
    ],
    related: ["general-care", "surgery", "cardiology"],
    keywords: "xray x-ray ultrasound blood urine lab scan testing",
  },
  {
    slug: "physiotherapy",
    title: "Physiotherapy",
    category: "rehabilitation",
    icon: "physiotherapy.svg",
    short: "Physiotherapy to support mobility and recovery.",
    intro:
      "Physiotherapy can support recovery after injuries or surgery and help with certain mobility problems. Exercises are planned around each pet’s needs.",
    topics: [
      [
        "Movement assessment",
        "We look at walking, posture and joint movement, alongside the diagnosis and any surgical restrictions.",
        "physio-treatment-1.svg",
      ],
      [
        "Tailored exercises",
        "Controlled activities and suitable hands-on techniques target the goals agreed for your pet.",
        "physio-treatment-2.svg",
      ],
      [
        "Progress reviews",
        "The programme changes as strength and function improve, with achievable tasks for home.",
        "physio-treatment-3.svg",
      ],
    ],
    signs: [
      "Recovery after orthopaedic or spinal surgery",
      "Stiffness, reduced strength or difficulty rising",
      "A diagnosed condition affecting mobility",
    ],
    prep: "Bring surgical instructions, imaging reports and medication details. Share videos of everyday activities your pet finds difficult.",
    after:
      "Only perform the exercises prescribed for your pet. Report increased pain, fatigue or lameness before increasing activity.",
    faqs: [
      [
        "Can I start exercises before an assessment?",
        "A diagnosis and suitable plan should come first. Exercises that help one condition may be unsuitable for another.",
      ],
      [
        "How many sessions will we need?",
        "This depends on the condition, goals and response. Progress is reviewed and the plan adjusted together.",
      ],
    ],
    related: ["hydrotherapy", "surgery", "neurology"],
    keywords: "rehab rehabilitation mobility arthritis exercise recovery",
  },
  {
    slug: "hydrotherapy",
    title: "Hydrotherapy for pets",
    category: "rehabilitation",
    icon: "pet-hydrotherapy.svg",
    short: "Water-based rehabilitation for suitable patients.",
    intro:
      "Hydrotherapy uses controlled exercises in water to support movement and rehabilitation. It is suitable only for patients assessed as appropriate.",
    topics: [
      [
        "A suitability check",
        "Medical history, wounds, heart health and mobility are considered before water-based exercise is prescribed.",
        "physiotherapy.svg",
      ],
      [
        "Controlled exercise",
        "Underwater treadmill sessions can be adjusted in depth and pace to match the patient and treatment goals.",
        "pet-hydrotherapy.svg",
      ],
      [
        "Measured progression",
        "Comfort, fatigue and walking quality guide session length and future changes.",
        "physio-treatment-3.svg",
      ],
    ],
    signs: [
      "Rehabilitation after a cleared surgical recovery stage",
      "A mobility plan for arthritis or weakness",
      "Controlled conditioning recommended by your veterinarian",
    ],
    prep: "Ask about feeding before the session. Tell us about wounds, infections, continence problems or anxiety around water.",
    after:
      "Allow rest after the session and follow the home plan. Let us know about any increased soreness or unusual tiredness.",
    faqs: [
      [
        "Is this the same as swimming?",
        "No. Underwater treadmill work allows controlled walking in water. Swimming uses a different movement pattern and is not interchangeable with every rehabilitation plan.",
      ],
      [
        "Is hydrotherapy suitable for every pet?",
        "No. Some medical conditions or open wounds require treatment or clearance first.",
      ],
    ],
    related: ["physiotherapy", "surgery", "holistic-medicine"],
    keywords: "water treadmill swim rehabilitation arthritis",
  },
  {
    slug: "holistic-medicine",
    title: "Holistic medicine",
    category: "rehabilitation",
    icon: "holistic-medicine.svg",
    short: "An approach that considers your pet’s overall health and lifestyle.",
    intro:
      "This approach considers nutrition, movement, behaviour and the home environment alongside medical care. Any complementary options are reviewed for evidence and safety.",
    topics: [
      [
        "Daily-life review",
        "Diet, sleep, activity and surroundings help identify practical opportunities to support wellbeing.",
        "how-holistic-works1.svg",
      ],
      [
        "Complementary options",
        "Discuss whether approaches such as acupuncture or rehabilitation have a useful role in your pet’s care.",
        "therapies-1-hover.svg",
      ],
      [
        "Coordinated treatment",
        "Any additional therapy is considered alongside medicines and the existing treatment plan.",
        "how-holistic-works2.svg",
      ],
    ],
    signs: [
      "Seeking additional support for an ongoing condition",
      "Questions about nutrition, supplements or comfort",
      "Wanting to review daily routines and wellbeing",
    ],
    prep: "Bring all medicines and supplements, including product labels. Tell us which approaches you are considering and what you hope to improve.",
    after:
      "Agree measurable goals and review progress. Do not stop prescribed treatment or add supplements without discussing them with your veterinarian.",
    faqs: [
      [
        "Does holistic care replace medical treatment?",
        "No. It should complement appropriate diagnosis and treatment, not delay necessary care.",
      ],
      [
        "Are natural products always safe?",
        "No. Products may be toxic or interact with medicines. Safety and evidence vary, so each option needs veterinary review.",
      ],
    ],
    related: ["physiotherapy", "general-care", "food-delivery"],
    keywords: "integrative acupuncture complementary nutrition wellbeing",
  },
  {
    slug: "grooming",
    title: "Grooming",
    category: "everyday",
    icon: "grooming.svg",
    short: "Grooming and hygiene services for pets.",
    intro:
      "Grooming is planned around your pet’s coat, skin condition and temperament, with hygiene and comfort in mind.",
    topics: [
      [
        "Bath & coat care",
        "Suitable washing, drying, brushing and coat work are chosen for your pet’s needs.",
        "grooming-services-1.svg",
      ],
      [
        "Nails & hygiene",
        "Nail and hygiene care can be discussed as part of the grooming appointment.",
        "grooming-services-2.svg",
      ],
      [
        "Comfort comes first",
        "Matted coats, sensitive skin and handling worries are assessed before deciding how to proceed.",
        "grooming-services-3.svg",
      ],
    ],
    signs: [
      "A coat that needs regular maintenance",
      "Tangling, matting or overgrown nails",
      "Help managing shedding or hygiene",
    ],
    prep: "Tell us about allergies, skin treatment and past grooming experiences. Describe the result you want and any areas your pet dislikes being touched.",
    after:
      "Ask about brushing between appointments and a suitable grooming interval for your pet’s coat.",
    faqs: [
      [
        "Can grooming treat a skin condition?",
        "Grooming supports coat care, but itching, sores or infection need a veterinary assessment and may require separate treatment.",
      ],
      [
        "Can you groom an anxious pet?",
        "Tell us ahead of time. The team will discuss what is appropriate and how to prioritise comfort and safe handling.",
      ],
    ],
    related: ["dermatology", "pet-taxi", "general-care"],
    keywords: "bath haircut nails coat trim dog cat",
  },
  {
    slug: "mobile-clinic",
    title: "Mobile clinic",
    category: "everyday",
    icon: "mobile-clinic.svg",
    short: "Mobile veterinary visits where appropriate.",
    intro:
      "Some veterinary services may be provided through mobile visits. Contact us to confirm availability in your area and whether a mobile visit is suitable.",
    topics: [
      [
        "Routine visits",
        "Ask about check-ups, preventive care and suitable follow-up appointments through the mobile service.",
        "pet-consultation.svg",
      ],
      [
        "Planned around your pet",
        "Share handling, mobility and access needs in advance so the visit can be organised.",
        "mobile-clinic.svg",
      ],
      [
        "A connected care plan",
        "If tests or treatment need hospital facilities, the team explains how to arrange the next step.",
        "wellness-exams.svg",
      ],
    ],
    signs: [
      "Difficulty bringing your pet to the hospital",
      "A routine preventive care visit",
      "A follow-up that may be suitable for mobile care",
    ],
    prep: "Provide your location, contact number and pet details. Ask what space, access and restraint arrangements are needed.",
    after:
      "Keep the visit summary and any follow-up recommendations. Confirm hospital appointments separately if further care is required.",
    faqs: [
      [
        "Can the mobile clinic handle an emergency?",
        "Call the hospital for emergencies. Do not wait for a mobile appointment when your pet needs urgent care.",
      ],
      [
        "Can every treatment be done on a mobile visit?",
        "No. Suitability depends on the procedure, your pet and the facilities required. The team confirms this before booking.",
      ],
    ],
    related: ["pet-taxi", "vaccination", "wellness-exams"],
    keywords: "home visit transport mobile veterinary",
  },
  {
    slug: "pet-taxi",
    title: "Pet taxi",
    category: "everyday",
    icon: "pet-taxi.svg",
    short: "Pet transport to an agreed destination.",
    intro:
      "If you need help getting your pet to the hospital, ask about our pet taxi service. Transport details are arranged in advance.",
    topics: [
      [
        "Journey planning",
        "Confirm collection, destination, timing and any return trip with the team.",
        "pet-taxi.svg",
      ],
      [
        "Individual needs",
        "Tell us about carriers, mobility limitations, travel anxiety or special handling requirements.",
        "type-dog.svg",
      ],
      [
        "A clear handover",
        "Share appointment details, documents and the contact responsible for treatment decisions.",
        "pet-consultation.svg",
      ],
    ],
    signs: [
      "A planned veterinary appointment without transport",
      "A grooming visit needing collection arrangements",
      "A pet with travel or mobility considerations",
    ],
    prep: "Confirm the quote and service area. Prepare your pet’s secure carrier or agreed restraint, records and a reachable contact number.",
    after:
      "Follow any clinical instructions from the visit and confirm the handover arrangements for the return journey.",
    faqs: [
      [
        "Is a pet taxi an ambulance?",
        "No. For an urgent medical problem, call the hospital directly for advice on immediate care and transport.",
      ],
      [
        "Can I arrange a same-day trip?",
        "Contact the team to check availability. Routes, timing and individual requirements need confirmation.",
      ],
    ],
    related: ["mobile-clinic", "grooming", "general-care"],
    keywords: "transport pickup pick-up collection ride",
  },
  {
    slug: "pet-relocation",
    title: "Pet relocation",
    category: "everyday",
    icon: "pet-relocation.svg",
    short: "Support with arranging pet relocation.",
    intro:
      "Moving a pet to another city or country may require health checks, vaccinations and documents. Contact us early to discuss the requirements.",
    topics: [
      [
        "Health preparation",
        "Review fitness to travel, identification, vaccination records and any required tests with the team.",
        "relocation-role-1.svg",
      ],
      [
        "Documents & timelines",
        "Destination authorities and carriers set requirements. We help identify the steps that need to be confirmed.",
        "relocation-role-2.svg",
      ],
      [
        "Travel arrangements",
        "Discuss a suitable carrier, acclimatisation and your pet’s individual travel needs.",
        "pet-relocation.svg",
      ],
    ],
    signs: [
      "An international or long-distance move",
      "Questions about travel health documents",
      "A pet with medical needs planning to travel",
    ],
    prep: "Share the destination, planned date, airline or transport route, species, microchip details and vaccination records.",
    after:
      "Keep original documents accessible and reconfirm requirements before departure. Arrange continuity of care at your destination.",
    faqs: [
      [
        "How early should I start?",
        "As early as possible. Some destinations require tests or waiting periods that can take months.",
      ],
      [
        "Can entry requirements be guaranteed?",
        "Requirements change and depend on the destination and carrier. Final eligibility must be confirmed with the relevant authorities.",
      ],
    ],
    related: ["vaccination", "pet-taxi", "general-care"],
    keywords: "travel export import flight moving passport microchip",
  },
  {
    slug: "food-delivery",
    title: "Food delivery",
    category: "everyday",
    icon: "food-delivery.svg",
    short: "Pet food delivery on request.",
    intro:
      "Ask us about pet food availability and delivery. If your pet needs a therapeutic diet, your veterinarian can advise on the appropriate choice.",
    topics: [
      [
        "Everyday nutrition",
        "Species, age, body condition and activity help guide appropriate food and portions.",
        "pet-diet-1-hover.svg",
      ],
      [
        "Therapeutic diets",
        "Diets for diagnosed conditions should be selected and reviewed with your veterinarian.",
        "pet-diet-2-hover.svg",
      ],
      [
        "Delivery arrangements",
        "Confirm the product, bag size, quantity, price and delivery area before placing an order.",
        "food-delivery.svg",
      ],
    ],
    signs: [
      "Restocking your pet’s usual food",
      "Managing a veterinary diet",
      "Questions about life-stage feeding or weight",
    ],
    prep: "Have the exact product name or a photo of the label ready. Share any prescribed diet instructions and your delivery address.",
    after:
      "Store food according to its label. If changing diets, ask for a transition plan appropriate to your pet.",
    faqs: [
      [
        "Can I order a therapeutic diet without advice?",
        "Check with the team first. These diets address specific needs and may be unsuitable for another condition or life stage.",
      ],
      [
        "Is delivery available everywhere?",
        "Coverage, stock, charges and timing are confirmed when you contact the team. An enquiry is not a confirmed order.",
      ],
    ],
    related: ["wellness-exams", "dermatology", "general-care"],
    keywords: "nutrition diet prescription food order delivery",
  },
  {
    slug: "pet-welfare",
    title: "Pet welfare",
    category: "everyday",
    icon: "pet-welfare.svg",
    short: "Services that support animal comfort and wellbeing.",
    intro:
      "Animal welfare includes health, nutrition, housing, handling and comfort. Contact us for advice on responsible animal care.",
    topics: [
      [
        "Community animal care",
        "Contact us about health assessment, preventive care and the needs of rescued or community animals.",
        "pet-welfare.svg",
      ],
      [
        "Neutering support",
        "Discuss suitable neutering arrangements and planned aftercare before transporting a community cat.",
        "cat-spaying.svg",
      ],
      [
        "Responsible ownership",
        "Identification, vaccination, nutrition and a suitable environment all contribute to lifelong welfare.",
        "wellness-exams.svg",
      ],
    ],
    signs: [
      "A rescued animal needing a health assessment",
      "Planning community-cat neutering",
      "Questions about adoption care or identification",
    ],
    prep: "Call first with the animal’s condition, location and handling needs. Plan safe transport and recovery care before any trapping.",
    after:
      "Follow the agreed treatment and recovery plan. Decisions about return, fostering or ongoing care should consider the individual animal and local requirements.",
    faqs: [
      [
        "What does TNR mean?",
        "Trap-neuter-return describes a planned community-cat programme involving humane capture, veterinary neutering and appropriate return after recovery.",
      ],
      [
        "Should I bring an injured stray straight in?",
        "Call for immediate advice and safe handling guidance. Do not put yourself at risk attempting to catch an injured or frightened animal.",
      ],
    ],
    related: ["cat-spaying-neutering", "vaccination", "emergency-pet-care"],
    keywords: "stray rescue community TNR trap neuter return adoption",
  },
];

export const categorySteps: Record<CareCategory, [string, string][]> = {
  emergency: [
    [
      "Call & arrive",
      "Tell us what happened and follow the team’s immediate instructions.",
    ],
    [
      "Assess & act",
      "Urgent needs take priority while the team explains the care required.",
    ],
    [
      "Plan the next step",
      "Discuss ongoing monitoring, treatment or a supported return home.",
    ],
  ],
  wellness: [
    [
      "Tell us about your pet",
      "Share daily routines, previous records and the questions on your mind.",
    ],
    [
      "Examine & discuss",
      "Understand the findings and agree on any tests or treatment.",
    ],
    [
      "Leave with a plan",
      "Know what to do at home and when to arrange the next review.",
    ],
  ],
  surgery: [
    [
      "Assess & plan",
      "Discuss the procedure, alternatives, estimate and preparation.",
    ],
    [
      "Treat & monitor",
      "The surgical and recovery plan is tailored to your pet.",
    ],
    [
      "Recover & review",
      "Follow written home-care instructions and attend planned rechecks.",
    ],
  ],
  specialist: [
    [
      "Share the history",
      "Previous results and a timeline help connect the important details.",
    ],
    [
      "Investigate together",
      "Discuss the purpose of proposed tests and what they may tell us.",
    ],
    [
      "Review the options",
      "Make an informed care decision and agree how progress will be monitored.",
    ],
  ],
  rehabilitation: [
    [
      "Set a starting point",
      "Review the diagnosis, movement and everyday activities.",
    ],
    [
      "Agree achievable goals",
      "Choose appropriate sessions and practical support at home.",
    ],
    [
      "Measure & adapt",
      "Review comfort and function, then adjust the programme.",
    ],
  ],
  everyday: [
    [
      "Tell us what you need",
      "Share your pet’s details and your preferred arrangements.",
    ],
    [
      "Confirm the details",
      "The team confirms suitability, availability and the cost with you.",
    ],
    [
      "We’ll take it from there",
      "Follow the agreed preparation and keep the team informed of any changes.",
    ],
  ],
};
