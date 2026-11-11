export const pageSections = [
  { page: "Home page", sections: [
    ["homeHero", "Main banner"], ["homeBenefits", "Benefits"],
    ["homeServices", "Featured services"], ["homeAbout", "About the hospital"],
    ["homeTeam", "Our team"], ["homeVisit", "Visit us"], ["homeFaq", "Questions & answers"],
  ] },
  { page: "About page", sections: [
    ["aboutIntro", "Page introduction"], ["aboutStory", "About the hospital"],
    ["aboutTeam", "Our team"], ["aboutVisit", "Visit us"],
  ] },
  { page: "Team page", sections: [
    ["teamIntro", "Page introduction"], ["teamMembers", "Our team"], ["teamVisit", "Visit us"],
  ] },
  { page: "Care packages page", sections: [
    ["plansIntro", "Page introduction"], ["plansList", "Care packages"],
    ["plansJourney", "Care journey"], ["plansFaq", "Questions & answers"],
  ] },
  { page: "Contact page", sections: [
    ["contactIntro", "Page introduction"], ["contactVisit", "Visit us"], ["contactFaq", "Questions & answers"],
  ] },
  { page: "Facilities page", sections: [
    ["facilitiesIntro", "Page introduction"], ["facilitiesAbout", "About the hospital"],
    ["facilitiesList", "Facilities"], ["facilitiesVisit", "Visit us"],
  ] },
  { page: "Services page", sections: [
    ["servicesIntro", "Page introduction"], ["servicesDirectory", "Services directory"],
    ["servicesContact", "Contact prompt"],
  ] },
  { page: "Navigation", sections: [
    ["navHome", "Home"], ["navServices", "Services"], ["navTeam", "Our team"],
    ["navAbout", "About Us"], ["navContact", "Contact"],
    ["navFacilities", "Facilities"], ["navPackages", "Care packages"],
  ] },
  { page: "Pages", sections: [
    ["pageServices", "Services"], ["pageAbout", "About Us"], ["pageTeam", "Our team"],
    ["pageFacilities", "Facilities"], ["pagePackages", "Care packages"], ["pageContact", "Contact"],
  ] },
  { page: "About page elements", sections: [
    ["aboutHeading", "Heading"], ["aboutIntroduction", "Introduction"],
    ["aboutDescription", "Description"], ["aboutImage", "Image"],
    ["aboutTeamButton", "Team button"], ["aboutBookingButton", "Appointment button"],
  ] },
] as const;

export const defaultSections: Record<string, boolean> = Object.fromEntries(
  pageSections.flatMap(({ sections }) => sections.map(([key]) => [key, true])),
);
export const defaultFeaturedServices = ["general-care", "vaccination", "surgery", "dental-care", "grooming"];
export const defaultSectionOrder: Record<string, number> = Object.fromEntries(
  pageSections.slice(0, 7).flatMap(({ sections }) => sections.map(([key], index) => [key, index])),
);
