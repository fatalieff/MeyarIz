export type PlanId = "basic" | "plus" | "ultra";

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  description: string;
  price: number | null;
  priceLabel: string;
  priceNote: string;
  studentLimit: string;
  features: readonly string[];
  cta: string;
  featured?: boolean;
  current?: boolean;
}

const sharedFeatures = [
  "Limitsiz qrup",
  "Şagird idarəetməsi",
  "Dərs cədvəli",
  "İmtahan nəticələri",
  "Avtomatik reytinq sistemi",
  "Ödəniş tarixçəsi",
  "Statistik göstəricilər",
] as const;

export const subscriptionPlans: readonly SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Fərdi repetitorlar üçün ideal başlanğıc.",
    price: 30,
    priceLabel: "30 AZN",
    priceNote: "/ ay",
    studentLimit: "Maksimum 100 şagird",
    features: sharedFeatures,
    cta: "Paketi seç",
  },
  {
    id: "plus",
    name: "Plus",
    description: "Böyüyən şagird bazasına malik müəllimlər üçün daha geniş imkanlar.",
    price: 50,
    priceLabel: "50 AZN",
    priceNote: "/ ay",
    studentLimit: "Maksimum 500 şagird",
    features: sharedFeatures,
    cta: "Paketi seç",
    featured: true,
    current: true,
  },
  {
    id: "ultra",
    name: "Ultra",
    description: "Geniş şagird bazasına malik müəllimlər və hazırlıq kursları üçün fərdi həll.",
    price: null,
    priceLabel: "Fərdi qiymət",
    priceNote: "Razılaşma əsasında",
    studentLimit: "Ehtiyacınıza uyğun şagird sayı",
    features: sharedFeatures,
    cta: "Bizimlə əlaqə",
  },
] as const;
