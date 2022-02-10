export enum Badges {
    Developer = 1,
    Translator = 2,
    Supporter = 4,
    "Responsible Disclosure" = 8,
    Founder = 16,
    "Platform Moderation" = 32,
    "Active Supporter" = 64,
    Paw = 128,
    "Early Adopter" = 256,
    "Reserved Relevant Joke Badge 1" = 512,
}

export type BadgeString = keyof typeof Badges;