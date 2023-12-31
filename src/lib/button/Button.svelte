<script lang="ts">
	import { css, type Css } from '@sxxov/ut/css';
	import Ripple from './Ripple.svelte';
	import Spacer from '../layout/Spacer.svelte';

	export let colourBackground: Css = '----colour-background-secondary';
	export let colourBackgroundHover: Css = '----colour-background-tertiary';
	export let colourBackgroundActive: Css = colourBackgroundHover;
	export let colourBackgroundDisabled: Css = colourBackground;
	export let colourText: Css = '----colour-text-primary';
	export let colourTextHover: Css = colourText;
	export let colourTextActive: Css = colourText;
	export let colourTextDisabled: Css = '----colour-text-secondary';
	export let width: Css = '100%';
	export let height: Css = 56;
	export let roundness: Css = '----roundness';
	export let shadow: Css = 'var(----shadow-inner-sm), var(----shadow-md)';
	export let shadowHover: Css =
		'var(----shadow-inner-sm), var(----shadow-lg)';
	export let shadowActive: Css =
		'var(----shadow-inner-md), var(----shadow-none)';
	export let shadowDisabled: Css = shadow;
	export let disabled = false;
	export let padding: Css = '16px max(var(--roundness), 14px)';
	export let transition: Css = `background 0.2s var(----ease-fast-slow),
								   outline 0.3s var(----ease-slow-slow),
								   box-shadow 0.3s var(----ease-fast-slow),
								   transform 0.3s var(----ease-fast-slow)`;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let tabindex = 0;
</script>

<button
	{disabled}
	{type}
	style="
		--width: {css(width)};
		--height: {css(height)};
		--roundness: {css(roundness)};
		--colour-background: {css(colourBackground)};
		--colour-background-hover: {css(colourBackgroundHover)};
		--colour-background-active: {css(colourBackgroundActive)};
		--colour-background-disabled: {css(colourBackgroundDisabled)};
		--colour-text: {css(colourText)};
		--colour-text-hover: {css(colourTextHover)};
		--colour-text-active: {css(colourTextActive)};
		--colour-text-disabled: {css(colourTextDisabled)};
		--shadow: {css(shadow)};
		--shadow-hover: {css(shadowHover)};
		--shadow-active: {css(shadowActive)};
		--shadow-disabled: {css(shadowDisabled)};
		--padding: {css(padding)};
		--transition: {css(transition)};
	"
	class:left={$$slots.left}
	class:right={$$slots.right}
	{tabindex}
	on:touchstart
	on:touchend
	on:touchcancel
	on:mousedown
	on:mouseup
	on:click
	on:keydown
	on:keyup
	on:keypress
>
	<slot name="background">
		<div class="default background" />
	</slot>

	<slot name="content">
		<div class="default content">
			<slot name="left"
				>{#if $$slots.right}<Spacer
						width={24}
						height={16}
					/>{/if}</slot
			><slot /><slot name="right"
				>{#if $$slots.left}<Spacer
						width={24}
						height={16}
					/>{/if}</slot
			>
		</div>
	</slot>

	<div class="ripple">
		<Ripple />
	</div>
</button>

<style lang="postcss">
	button {
		position: relative;

		height: var(--height);
		width: var(--width);

		background: transparent;
		border: none;

		transform: matrix(1, 0, 0, 1, 0, 0);
		padding: var(--padding);
		box-sizing: border-box;

		cursor: pointer;

		border-radius: var(--roundness);
		color: var(--colour-text);
		fill: var(--colour-text);

		transition: var(--transition);

		& > .ripple {
			position: absolute;
			top: 0;
			left: 0;

			height: 100%;
			width: 100%;

			z-index: 1;

			border-radius: var(--roundness);

			overflow: hidden;
			overflow: clip;

			transition: var(--transition);
		}

		& > .default.content {
			position: relative;
			z-index: 1;
			width: 100%;
			height: 100%;

			display: flex;
			align-items: center;
			justify-content: space-between;

			text-align: center;

			user-select: none;

			gap: 7px;
		}

		&:not(.left):not(.right) > .default.content {
			justify-content: center;
		}

		& > .default.background {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;

			z-index: -1;

			border-radius: var(--roundness);

			background: var(--colour-background);
			box-shadow: var(--shadow);

			outline: solid 1px var(--colour-background);
			outline-offset: -1px;

			transition: var(--transition);
		}

		/*
			replaces \`@media (hover: none)\`
			https://www.ctrl.blog/entry/css-media-hover-samsung.html
		*/
		@media (pointer: fine) {
			&:hover {
				color: var(--colour-text-hover);

				& > .default.background {
					background: var(--colour-background-hover);
					outline: solid 1px var(--colour-background-hover);
					box-shadow: var(--shadow-hover);
				}
			}
		}

		&:active {
			color: var(--colour-text-active);

			& > .default.background {
				background: var(--colour-background-active);

				transition: var(--transition), outline 0s;
				outline: solid 1px var(----colour-text-tertiary);
				box-shadow: var(--shadow-active);
			}
		}

		&:disabled {
			color: var(--colour-text-disabled);
			cursor: not-allowed;

			& > .default.background {
				background: var(--colour-background-disabled);
				outline: solid 1px var(--colour-background-disabled);
				box-shadow: var(--shadow-disabled);
			}
		}
	}
</style>
