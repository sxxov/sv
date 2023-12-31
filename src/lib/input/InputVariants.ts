import type { Variants } from '../common/types/Variants';
import type Input from './Input.svelte';

export const InputVariants = {
	Regular: {
		colourBackground: '----colour-background-secondary',
		colourBackgroundHover: '----colour-background-tertiary',
		colourText: '----colour-text-primary',
		colourTextHover: '----colour-text-primary',
	},
	Transparent: {
		colourBackground: '----colour-background-transparent',
		colourBackgroundHover: '----colour-background-secondary',
		colourText: '----colour-text-primary',
		colourTextHover: '----colour-text-primary',
		shadow: '----shadow-none',
	},
} as const satisfies Variants<Input>;
