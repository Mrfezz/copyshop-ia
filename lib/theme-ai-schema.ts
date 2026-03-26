export type ThemeAiPayload = {
  meta: {
    generator: string;
    sourceProductUrl: string;
    pack: string;
    model: string;
    niche: string;
    style: string;
  };
  brand: {
    storeName: string;
    tagline: string;
    brandTone: string;
    brandStory: string;
  };
  colors: {
    background: string;
    text: string;
    primary: string;
    primaryText: string;
    secondary: string;
    secondaryText: string;
    accent: string;
    headerBackground: string;
    headerText: string;
    footerBackground: string;
    footerText: string;
  };
  hero: {
    subheading: string;
    title: string;
    buttonText: string;
    buttonLink: string;
  };
  announcementBar: {
    text: string;
  };
  homeSections: {
    benefits: Array<{
      title: string;
      text: string;
    }>;
    impact: {
      title: string;
      subheading: string;
    };
    storySlides: Array<{
      subheading: string;
      title: string;
      buttonText: string;
    }>;
  };
  faq: Array<{
    q: string;
    a: string;
  }>;
  newsletter: {
    title: string;
    text: string;
    buttonText: string;
  };
  contact: {
    subheading: string;
    title: string;
    text: string;
  };
  policies: {
    shipping: string;
    returns: string;
    support: string;
  };
  assets: {
    logoPrompt: string;
    heroImagePrompt: string;
    heroImageUrl: string | null;
    productImages: string[];
  };
};

export const EMPTY_THEME_AI_PAYLOAD: ThemeAiPayload = {
  meta: {
    generator: '',
    sourceProductUrl: '',
    pack: '',
    model: '',
    niche: '',
    style: '',
  },
  brand: {
    storeName: '',
    tagline: '',
    brandTone: '',
    brandStory: '',
  },
  colors: {
    background: '',
    text: '',
    primary: '',
    primaryText: '',
    secondary: '',
    secondaryText: '',
    accent: '',
    headerBackground: '',
    headerText: '',
    footerBackground: '',
    footerText: '',
  },
  hero: {
    subheading: '',
    title: '',
    buttonText: '',
    buttonLink: '',
  },
  announcementBar: {
    text: '',
  },
  homeSections: {
    benefits: [
      {
        title: '',
        text: '',
      },
      {
        title: '',
        text: '',
      },
      {
        title: '',
        text: '',
      },
    ],
    impact: {
      title: '',
      subheading: '',
    },
    storySlides: [
      {
        subheading: '',
        title: '',
        buttonText: '',
      },
      {
        subheading: '',
        title: '',
        buttonText: '',
      },
    ],
  },
  faq: [
    {
      q: '',
      a: '',
    },
    {
      q: '',
      a: '',
    },
    {
      q: '',
      a: '',
    },
    {
      q: '',
      a: '',
    },
  ],
  newsletter: {
    title: '',
    text: '',
    buttonText: '',
  },
  contact: {
    subheading: '',
    title: '',
    text: '',
  },
  policies: {
    shipping: '',
    returns: '',
    support: '',
  },
  assets: {
    logoPrompt: '',
    heroImagePrompt: '',
    heroImageUrl: null,
    productImages: [],
  },
};

export const THEME_AI_REQUIRED_KEYS = [
  'meta',
  'brand',
  'colors',
  'hero',
  'announcementBar',
  'homeSections',
  'faq',
  'newsletter',
  'contact',
  'policies',
  'assets',
] as const;