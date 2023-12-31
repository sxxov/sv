<script lang="ts">
	import { css, type Css } from '@sxxov/ut/css';

	export let height: Css = '100%';
	export let width: Css = '100%';
	export let strokeColour: Css = '----colour-accent-primary';
	export let backgroundStrokeColour: Css = '----colour-accent-secondary';
	export let strokeWeight: Css = 1;
	export let completion = NaN;

	const RADIUS = 100;
	const CIRCUMFERENCE = RADIUS * 2 * Math.PI;

	$: strokeWidthNormalised = `calc(${css(
		strokeWeight,
	)} * ${RADIUS} / min(${css(height)}, ${css(width)}))`;
</script>

<div
	class="loader-circle"
	style="
		--height: {css(height)};
		--width: {css(width)};
		--circumference: {CIRCUMFERENCE}px;
		--offset: {Number.isNaN(completion) ? 0 : (1 - completion) * CIRCUMFERENCE}px;
	"
>
	<svg
		class="circle"
		height="100%"
		width="100%"
		viewBox="0 0 {RADIUS * 2} {RADIUS * 2}"
		preserveAspectRatio="xMidYMid meet"
		vector-effect="non-scaling-stroke"
	>
		<circle
			class="secondary"
			class:indeterminate={completion <= 0 || Number.isNaN(completion)}
			cx={RADIUS}
			cy={RADIUS}
			r="calc({RADIUS} - {strokeWeight})"
			fill="none"
			stroke={css(backgroundStrokeColour)}
			stroke-width={css(strokeWidthNormalised)}
			transform="rotate(-90 {RADIUS} {RADIUS})"
		/>
		<circle
			class="primary"
			class:indeterminate={completion <= 0 || Number.isNaN(completion)}
			cx={RADIUS}
			cy={RADIUS}
			r="calc({RADIUS} - {strokeWeight})"
			fill="none"
			stroke={css(strokeColour)}
			stroke-width={css(strokeWidthNormalised)}
			transform="rotate(-90 {RADIUS} {RADIUS})"
		/>
	</svg>
</div>

<style lang="postcss">
	.loader-circle {
		position: relative;
		height: var(--height);
		width: var(--width);

		& > .circle {
			position: absolute;
			top: 0;
			left: 0;

			animation: rotation 2s var(----ease-slow-slow) normal infinite;

			@keyframes rotation {
				0% {
					transform: rotate(0deg);
				}

				100% {
					transform: rotate(360deg);
				}
			}

			& > circle {
				stroke-dasharray: var(--circumference);

				transition: all 1s var(----ease-slow-slow);

				&.primary {
					stroke-dashoffset: var(--offset);
				}

				&.indeterminate {
					&.primary {
						animation: indeterminate 3s cubic-bezier(0.5, 0, 0.5, 1)
							normal infinite;
					}

					&.secondary {
						animation: indeterminate 3s cubic-bezier(0.5, 0, 1, 1)
							normal infinite;
					}

					@keyframes indeterminate {
						0% {
							stroke-dashoffset: calc(var(--circumference) * 2);
						}

						100% {
							stroke-dashoffset: 0;
						}
					}
				}
			}
		}
	}
</style>
