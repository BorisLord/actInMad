export interface Articles {
  expand?: { [key: string]: unknown };
  id: string;
  isActive: boolean;
  slug: string;
  title: string;
  subTitle: string;
  imgDescription: string;
  releaseDate: string;
  content: string;
  extra: string;
  images: string[];
  created: string;
  updated: string;
}

export interface NewsletterSubExpanded {
  userId?: Users;
  [key: string]: unknown;
}

export interface NewsletterSub {
  expand?: NewsletterSubExpanded;
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  isSubscribed: boolean;
  userId: string;
  created: string;
  updated: string;
}

export enum EquipesTypeOptions {
  Comediens = "comediens",
  Profs = "profs",
  Founders = "founders",
}

export interface Equipes {
  expand?: { [key: string]: unknown };
  id: string;
  isActive: boolean;
  nom: string;
  prenom: string;
  type: [EquipesTypeOptions];
  instagram: string;
  linkedIn: string;
  description: string;
  photo: string;
  created: string;
  updated: string;
}

export enum UsersTheaterLevelOptions {
  Dbutant = "Débutant",
  Intermdiaire = "Intermédiaire",
  Confirm = "Confirmé",
}

export interface Users {
  expand?: { [key: string]: unknown };
  id: string;
  email: string;
  emailVisibility: boolean;
  verified: boolean;
  profileCompleted: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  birthdate: string;
  theaterLevel: UsersTheaterLevelOptions;
  avatar: string;
  created: string;
  updated: string;
}

export enum CoursCoursTypeOptions {
  ActImpro = "Act'Impro",
  AtelierSpectacle = "Atelier Spectacle",
  CoursDeTheatre = "Cours de Theatre",
  CoursDeTheatreEnfant = "Cours de Theatre Enfant",
}

export interface CoursExpanded {
  profID?: Equipes;
  [key: string]: unknown;
}

export interface Cours {
  expand?: CoursExpanded;
  id: string;
  isActive: boolean;
  titre: string;
  description: string;
  jourRepetition: string;
  adresse: string;
  adressePreInscription: string;
  pieceTheatre: string;
  courEssai: object | null | "";
  demarrage: object | null | "";
  dateJeu: object | null | "";
  audition: object | null | "";
  tarif: object | null | "";
  coursType: CoursCoursTypeOptions;
  profID: string;
  created: string;
  updated: string;
}

export enum PromoCodeTypeOptions {
  Percentage = "percentage",
  Fixed = "fixed",
}

export interface PromoCode {
  expand?: { [key: string]: unknown };
  id: string;
  isActive: boolean;
  code: string;
  type: PromoCodeTypeOptions;
  value: number;
  expiresAt: string;
  created: string;
  updated: string;
}

export interface CommandesExpanded {
  userId?: Users;
  [key: string]: unknown;
}

export interface Commandes {
  expand?: CommandesExpanded;
  id: string;
  userId: string;
  items: object | null | "";
  status: string;
  amount: number;
  paymentId: string;
  created: string;
  updated: string;
}
