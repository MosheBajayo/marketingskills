export type Plan = {
  name: string;
  duration: string;
  price: string;
  oldPrice?: string | null;
  saving?: string | null;
  info: string;
  description: string;
  link: string;
  highlighted?: boolean;
  badge?: string | null;
};

export type Benefit = {
  title: string;
  content: string;
  icon: string; // lucide icon name
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type Testimonial = {
  name: string;
  title: string;
  quote: string;
  imageAlt: string;
};
