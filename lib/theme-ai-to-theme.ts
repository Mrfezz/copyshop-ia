import type { ThemeAiPayload } from "@/lib/theme-ai-schema";

type ThemeFilesResult = {
  indexJson: any;
  settingsDataJson: any;
};

function safe(v: unknown, fallback = "") {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

export function buildThemeFilesFromThemeAi(themeAi: ThemeAiPayload): ThemeFilesResult {
  const indexJson = {
    sections: {
      slideshow_QVjWpN: {
        type: "slideshow",
        blocks: {
          image_zTMUzq: {
            type: "image",
            settings: {
              content_max_width: 780,
              mobile_text_position: "place-self-end-center text-center",
              desktop_text_position: "sm:place-self-center sm:text-center",
              subheading: safe(themeAi.hero.subheading, "Votre marque, votre univers"),
              title: safe(themeAi.hero.title, "Une boutique pensée pour convertir"),
              heading_tag: "h1",
              button_text: safe(themeAi.hero.buttonText, "Découvrir la boutique"),
              button_link: safe(themeAi.hero.buttonLink, ""),
              text_color: "#ffffff",
              button_background: "#ffffff",
              button_text_color: "#000000",
              overlay_color: "#000000",
              overlay_opacity: 30,
              background: "",
              background_gradient: ""
            }
          }
        },
        block_order: ["image_zTMUzq"],
        settings: {
          full_width: true,
          allow_transparent_header: true,
          image_size: "lg",
          controls_type: "none",
          transition_type: "fade_with_text",
          autoplay: false,
          cycle_speed: 6,
          background: "#f2f2f2",
          background_gradient: ""
        }
      },

      scrolling_text_XJ3zM3: {
        type: "scrolling-text",
        blocks: {},
        block_order: [],
        settings: {
          full_width: true,
          text: safe(
            themeAi.announcementBar.text,
            "Qualité • Confiance • Livraison rapide • Service client"
          ),
          font_size: 24,
          speed: 18,
          direction: "left",
          background: safe(themeAi.colors.primary, "#6a2fd6"),
          background_gradient: "",
          text_color: safe(themeAi.colors.primaryText, "#ffffff")
        }
      },

      images_with_text_scrolling_jrGe3T: {
        type: "images-with-text-scrolling",
        blocks: {
          benefit_1: {
            type: "item",
            settings: {
              title: safe(
                themeAi.homeSections.benefits?.[0]?.title,
                "Une offre claire et convaincante"
              ),
              content: safe(
                themeAi.homeSections.benefits?.[0]?.text,
                "Présentez vos avantages de façon claire et vendeuse."
              )
            }
          },
          benefit_2: {
            type: "item",
            settings: {
              title: safe(
                themeAi.homeSections.benefits?.[1]?.title,
                "Une boutique pensée pour inspirer confiance"
              ),
              content: safe(
                themeAi.homeSections.benefits?.[1]?.text,
                "Mettez en avant les éléments qui rassurent vos clients."
              )
            }
          },
          benefit_3: {
            type: "item",
            settings: {
              title: safe(
                themeAi.homeSections.benefits?.[2]?.title,
                "Une expérience moderne et fluide"
              ),
              content: safe(
                themeAi.homeSections.benefits?.[2]?.text,
                "Proposez une boutique agréable à parcourir sur mobile et desktop."
              )
            }
          }
        },
        block_order: ["benefit_1", "benefit_2", "benefit_3"],
        settings: {
          subheading: "Nos points forts",
          title: "Pourquoi choisir notre boutique",
          background: "#ffffff",
          background_gradient: "",
          text_color: safe(themeAi.colors.text, "#191818")
        }
      },

      impact_text_eLVNxk: {
        type: "impact-text",
        blocks: {},
        block_order: [],
        settings: {
          subheading: safe(
            themeAi.homeSections.impact?.subheading,
            "Une boutique alignée avec votre image de marque"
          ),
          title: safe(themeAi.homeSections.impact?.title, "100%"),
          background: safe(themeAi.colors.secondary, "#e64aa7"),
          background_gradient: "",
          text_color: safe(themeAi.colors.secondaryText, "#ffffff")
        }
      },

      slideshow_jUXY7P: {
        type: "slideshow",
        blocks: {
          story_1: {
            type: "image",
            settings: {
              content_max_width: 780,
              mobile_text_position: "place-self-end-center text-center",
              desktop_text_position: "sm:place-self-center sm:text-center",
              subheading: safe(
                themeAi.homeSections.storySlides?.[0]?.subheading,
                "Une identité forte"
              ),
              title: safe(
                themeAi.homeSections.storySlides?.[0]?.title,
                "Des visuels, du texte et une structure cohérente"
              ),
              heading_tag: "h2",
              button_text: safe(
                themeAi.homeSections.storySlides?.[0]?.buttonText,
                "En savoir plus"
              ),
              button_link: "",
              text_color: "#ffffff",
              button_background: "#ffffff",
              button_text_color: "#000000",
              overlay_color: "#000000",
              overlay_opacity: 35,
              background: "",
              background_gradient: ""
            }
          },
          story_2: {
            type: "image",
            settings: {
              content_max_width: 780,
              mobile_text_position: "place-self-end-center text-center",
              desktop_text_position: "sm:place-self-center sm:text-center",
              subheading: safe(
                themeAi.homeSections.storySlides?.[1]?.subheading,
                "Une boutique prête à évoluer"
              ),
              title: safe(
                themeAi.homeSections.storySlides?.[1]?.title,
                "Modifiable facilement dans Shopify"
              ),
              heading_tag: "h2",
              button_text: safe(
                themeAi.homeSections.storySlides?.[1]?.buttonText,
                "Voir les avantages"
              ),
              button_link: "",
              text_color: "#ffffff",
              button_background: "#ffffff",
              button_text_color: "#000000",
              overlay_color: "#000000",
              overlay_opacity: 35,
              background: "",
              background_gradient: ""
            }
          }
        },
        block_order: ["story_1", "story_2"],
        settings: {
          full_width: true,
          allow_transparent_header: false,
          image_size: "lg",
          controls_type: "dots",
          transition_type: "fade",
          autoplay: false,
          cycle_speed: 6,
          background: "#f7f7f7",
          background_gradient: ""
        }
      },

      faq_UTQbQP: {
        type: "faq",
        blocks: {
          faq_1: {
            type: "question",
            settings: {
              title: safe(themeAi.faq?.[0]?.q, "Quels sont les délais de livraison ?"),
              content: safe(
                themeAi.faq?.[0]?.a,
                "Les délais varient selon la destination et le produit."
              )
            }
          },
          faq_2: {
            type: "question",
            settings: {
              title: safe(themeAi.faq?.[1]?.q, "Puis-je retourner un produit ?"),
              content: safe(
                themeAi.faq?.[1]?.a,
                "Oui, selon les conditions affichées sur la boutique."
              )
            }
          },
          faq_3: {
            type: "question",
            settings: {
              title: safe(themeAi.faq?.[2]?.q, "Comment contacter le service client ?"),
              content: safe(
                themeAi.faq?.[2]?.a,
                "Vous pouvez nous écrire via la page de contact."
              )
            }
          },
          faq_4: {
            type: "question",
            settings: {
              title: safe(themeAi.faq?.[3]?.q, "La qualité est-elle garantie ?"),
              content: safe(
                themeAi.faq?.[3]?.a,
                "Nous sélectionnons nos offres avec soin pour offrir une expérience rassurante."
              )
            }
          }
        },
        block_order: ["faq_1", "faq_2", "faq_3", "faq_4"],
        settings: {
          subheading: "FAQ",
          title: "Questions fréquentes",
          content: "",
          text_position: "center",
          background: "#ffffff",
          background_gradient: "",
          text_color: safe(themeAi.colors.text, "#191818")
        }
      },

      newsletter_q8UxQw: {
        type: "newsletter",
        blocks: {},
        block_order: [],
        settings: {
          subheading: "",
          title: safe(themeAi.newsletter.title, "Newsletter"),
          content: safe(
            themeAi.newsletter.text,
            "Recevez nos nouveautés, nos offres spéciales et nos conseils directement par email."
          ),
          button_text: safe(themeAi.newsletter.buttonText, "S'abonner"),
          background: "#f7f7f7",
          background_gradient: "",
          text_color: safe(themeAi.colors.text, "#191818")
        }
      },

      contact_9CP78F: {
        type: "contact",
        blocks: {},
        block_order: [],
        settings: {
          full_width: true,
          subheading: safe(themeAi.contact.subheading, "Contactez-nous"),
          title: safe(themeAi.contact.title, "Une question ?"),
          content: `<p>${safe(
            themeAi.contact.text,
            "Notre équipe reste disponible pour vous répondre et vous accompagner."
          )}</p>`,
          text_position: "center",
          contact_form_size: "large",
          background: "#f6f6f6",
          background_gradient: "",
          text_color: "",
          heading_color: "",
          heading_gradient: "",
          contact_background: safe(themeAi.colors.accent, "#ff6f20"),
          contact_text_color: "",
          button_background: "",
          button_text_color: "",
          show_faq: false,
          faq_text: "",
          faq_link: "",
          faq_button_text: "FAQ"
        }
      }
    },

    order: [
      "slideshow_QVjWpN",
      "scrolling_text_XJ3zM3",
      "images_with_text_scrolling_jrGe3T",
      "impact_text_eLVNxk",
      "slideshow_jUXY7P",
      "faq_UTQbQP",
      "newsletter_q8UxQw",
      "contact_9CP78F"
    ]
  };

  const settingsDataJson = {
    current: {
      page_width: 1440,
      section_vertical_spacing: "small",
      section_boxed_horizontal_spacing: "medium",
      button_border_radius: 10,
      input_border_radius: 6,
      block_border_radius: 20,
      block_shadow_opacity: 0,
      block_shadow_vertical_offset: 0,
      icon_stroke_width: 2,
      icon_style: "duo",
      button_style: "fill",
      button_hover_effect: "reverse",

      background: safe(themeAi.colors.background, "#ffffff"),
      text_color: safe(themeAi.colors.text, "#191818"),
      success_color: "#22c55e",
      warning_color: "#ff6f20",
      error_color: "#aa2826",

      header_background: safe(themeAi.colors.headerBackground, "#ffffff"),
      header_text_color: safe(themeAi.colors.headerText, "#191818"),

      footer_background: safe(themeAi.colors.footerBackground, "#f7f7f7"),
      footer_text_color: safe(themeAi.colors.footerText, "#191818"),

      dialog_background: "#ffffff",

      primary_button_background: safe(themeAi.colors.primary, "#6a2fd6"),
      primary_button_text_color: safe(themeAi.colors.primaryText, "#ffffff"),

      secondary_button_background: safe(themeAi.colors.secondary, "#e64aa7"),
      secondary_button_text_color: safe(themeAi.colors.secondaryText, "#ffffff"),

      product_card_text_color: "#292929",
      product_rating_color: "#ff6f20",
      product_on_sale_accent: "#ff6f20",
      product_sold_out_badge_background: "#bebdb9",
      product_primary_badge_background: safe(themeAi.colors.primary, "#6a2fd6"),

      heading_font: "oswald_n4",
      heading_font_size: "small",
      heading_text_transform: "normal",
      heading_letter_spacing: -1,

      text_font: "roboto_n4",
      text_font_size_mobile: 14,
      text_font_size_desktop: 16,
      text_font_letter_spacing: 0,

      currency_code_enabled: false,
      show_page_transition: false,
      zoom_image_on_hover: true,
      reduce_drawer_animation: false,
      reduce_menu_animation: false,
      heading_apparition: "split_rotation",

      color_swatch_style: "round",
      color_swatch_config: "",

      show_vendor: false,
      show_secondary_image: true,
      show_quick_buy: true,
      show_product_rating: false,
      product_rating_mode: "rating",
      show_sold_out_badge: true,
      show_discount: true,
      discount_mode: "saving",
      product_color_display: "count",
      product_image_aspect_ratio: "natural",
      product_info_alignment: "center",

      cart_type: "popover",
      cart_empty_button_link: "",
      cart_show_free_shipping_threshold: false,
      cart_free_shipping_threshold: 0,
      cart_module_timer_enable: true,
      cart_module_timer_text: "Panier actif pendant $time",
      timer_delay: 10,
      bg: safe(themeAi.colors.primary, "#6a2fd6"),

      social_facebook: "",
      social_twitter: "",
      social_pinterest: "",
      social_instagram: "",
      social_youtube: "",
      social_tiktok: "",
      social_linkedin: "",

      favicon: "",
      checkout_logo_image: "",
      checkout_logo_position: "center",
      checkout_logo_size: "small",
      checkout_body_background_color: "#f7f7f7",
      checkout_sidebar_background_color: "#ffffff",
      checkout_accent_color: safe(themeAi.colors.primary, "#6a2fd6"),
      checkout_button_color: safe(themeAi.colors.primary, "#6a2fd6"),

      content_for_index: [],
      blocks: {}
    },
    presets: {}
  };

  return {
    indexJson,
    settingsDataJson,
  };
}