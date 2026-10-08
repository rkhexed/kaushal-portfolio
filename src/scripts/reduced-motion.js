/* One source of truth for the motion preference. Every demo and the scroll choreography honour it. */
export const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
