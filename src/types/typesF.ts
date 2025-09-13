import type { Ref } from "preact";

export type Article = {
  extra: string;
  content: string;
  id: string;
  collectionId: string;
  title: string;
  subTitle: string;
  slug: string;
  images: string[];
  imgDescription: string;
  releaseDate: string;
};

export type User = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthdate?: string;
  theaterLevel?: "Debutant" | "Intermediaire" | "Confirme" | undefined;
  verified?: boolean;
  profileCompleted?: boolean;
  avatarUrl?: string;
};

export type CoursRecord = {
  id: string;
  // collectionId: string;
  // collectionName: string;
  // created: string;
  // updated: string;
  titre: string;
  description: string;
  isActive: boolean;
  coursType:
    | `Act'Impro`
    | "Atelier Spectacle"
    | "Cours De Theatre"
    | "Cours De Theatre Enfant";
  profID: string;
  jourRepetition: string;
  adressePreInscription: string;
  adresse: string;
  demarrage: string[];
  audition: string[] | null;
  courEssai: string[] | null;
  pieceTheatre: string;
  dateJeu: string[];
  tarif: number[];
  expand?: {
    profID?: EquipeRecord;
  };
};

export type CartItem = CoursRecord & {
  coursId: string;
  selectedTarif: number;
  cartItemId: string;
};

export type NavItem = {
  id: string;
  label: string;
  icon: string;
};

export type EquipeRecord = {
  id: string;
  collectionId: string;
  nom: string;
  prenom: string;
  photo: string;
};

export type LoginForm = {
  email: string;
  password: string;
};

export type SignupForm = LoginForm & {
  passwordConfirm: string;
};

export type Link = {
  href: string;
  label: string;
};

export type NavbarProps = {
  links: Link[];
  currentPath: string;
  isHomePage: boolean;
  logoSrc?: string;
  onDashboardToggle?: () => void;
  dashboardToggleRef?: Ref<HTMLButtonElement>;
};

export type PromoData = {
  originalTotal: number;
  discountAmount: number;
  newTotal: number;
  message: string;
};

export type CommandeItem = {
  courseId: string;
  tarif: number;
  quantity?: number;
};

export type Commande = {
  id: string;
  userId: string;
  status: "created" | "pending" | "authorized" | "completed" | "canceled";
  amount: number;
  items: CommandeItem[] | null;
  created: string;
};
