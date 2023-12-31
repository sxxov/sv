<script
	context="module"
	lang="ts"
>
	export enum BottomSheetStates {
		FULL = 0b00001,
		PEEK = 0b00010,
		IDLE = 0b00100,
		SETTLING = 0b01000,
		DRAGGING = 0b10000,
	}
</script>

<script lang="ts">
	import { css, type Css } from '@sxxov/ut/css';
	import { whenResize } from '../ut/action/actions/whenResize';
	import { whenScroll } from '../ut/action/actions/whenScroll';
	import { clamp01, lerp, map, map01 } from '@sxxov/ut/math';
	import { bezierQuintOut, bezierSineOut } from '@sxxov/ut/bezier/beziers';

	export let state: BottomSheetStates;
	export let colourBackground: Css = '----colour-background-secondary';
	export let colourUnderlay: Css = '----colour-overlay';
	export let colourBorder: Css = '----colour-background-tertiary';
	export let width: Css = '100%';
	export let fullHeight: Css = '100vh';
	export let peekHeight: Css = '50vh';
	export let idleHeight: Css = 0;
	export let threshold = 0.25;
	export let roundness: Css = '----roundness';

	let currHeight: Css;

	let scrollHeightComputed = 0;
	let fullHeightComputed = 0;
	let peekHeightComputed = 0;
	let idleHeightComputed = 0;
	let currHeightComputed = 0;

	let contentDiv: HTMLDivElement | undefined;
	let componentDiv: HTMLDivElement | undefined;

	let isDragging = false;
	let startY = NaN;
	let deltaY = 0;
	let scrollY = 0;
	let overscrollY = 0;

	$: opacity =
		currHeightComputed === 0 && peekHeightComputed === 0
			? 1
			: Math.min(currHeightComputed / peekHeightComputed, 1);
	$: canDrag = scrollY <= 0;

	$: if (state & BottomSheetStates.FULL) currHeight = fullHeight;
	else if (state & BottomSheetStates.PEEK) currHeight = peekHeight;
	else if (state & BottomSheetStates.IDLE) currHeight = idleHeight;
	else
		console.warn(
			`Encountered invalid BottomSheet state(${state.toString(2)})`,
		);

	$: if (!(state & BottomSheetStates.DRAGGING))
		if (
			(state & BottomSheetStates.PEEK &&
				currHeightComputed === fullHeightComputed) ||
			currHeightComputed === idleHeightComputed ||
			(state & BottomSheetStates.FULL &&
				currHeightComputed === peekHeightComputed) ||
			currHeightComputed === fullHeightComputed ||
			(state & BottomSheetStates.IDLE &&
				currHeightComputed === fullHeightComputed) ||
			currHeightComputed === peekHeightComputed
		)
			state &= ~BottomSheetStates.SETTLING;
		else state |= BottomSheetStates.SETTLING;

	function onWheel(event: WheelEvent) {
		if (!canDrag) return;

		if (state & BottomSheetStates.SETTLING) {
			event.preventDefault();
			return;
		}

		if (event.deltaY > 0) {
			if (state & BottomSheetStates.FULL) return;
			if (state & BottomSheetStates.PEEK) {
				state &= ~BottomSheetStates.PEEK;
				state |= BottomSheetStates.FULL;
			} else return;
		} else {
			if (state & BottomSheetStates.PEEK) return;
			if (state & BottomSheetStates.FULL) {
				state &= ~BottomSheetStates.FULL;
				state |= BottomSheetStates.PEEK;
			} else return;
		}

		deltaY = event.deltaY;
		onDragRelease();

		event.preventDefault();
	}

	let dragDirection = 0;
	function onDragStart(event: MouseEvent | TouchEvent) {
		isDragging = true;
		dragDirection = 0;
		[, startY] = resolvePageCoordinates(event);

		if (!canDrag) return;

		if (!hasParentElem(event.target as HTMLElement, contentDiv!)) return;

		state |= BottomSheetStates.DRAGGING;
	}

	function onDragMove(event: MouseEvent | TouchEvent) {
		if (!isDragging) return;

		const [, y] = resolvePageCoordinates(event);
		const dy = startY - y;

		dragDirection ||= Math.sign(dy);

		if (
			state & BottomSheetStates.FULL ||
			currHeightComputed === fullHeightComputed
		) {
			if (dragDirection < 0 && scrollY <= 0) {
				event.preventDefault();
			}

			if (
				dragDirection > 0 &&
				scrollY >= scrollHeightComputed - fullHeightComputed - 1
			) {
				event.preventDefault();
				overscrollY = lerp(
					bezierSineOut.at(clamp01(map01(dy, 0, fullHeightComputed))),
					0,
					fullHeightComputed / 2,
				);
			}
		} else event.preventDefault();

		if (!(state & BottomSheetStates.DRAGGING)) return;

		// const { top, left, height, width } =
		// 	contentDiv!.getBoundingClientRect();

		// if (x >= left && x <= left + width && y >= top && y <= top + height)
		// 	event.preventDefault();

		if (event.currentTarget !== componentDiv) return;

		// event.preventDefault();
		event.stopImmediatePropagation();

		if (!canDrag || Number.isNaN(startY)) return;

		deltaY = dy;
	}

	function onDragEnd() {
		isDragging = false;
		dragDirection = 0;

		startY = NaN;
		overscrollY = 0;
		onDragRelease();
	}

	function onDragRelease() {
		state &= ~BottomSheetStates.DRAGGING;

		if (
			state & BottomSheetStates.PEEK &&
			deltaY > (fullHeightComputed - peekHeightComputed) * threshold
		)
			state = BottomSheetStates.FULL;
		else if (
			state & BottomSheetStates.PEEK &&
			deltaY < (idleHeightComputed - peekHeightComputed) * threshold
		)
			state = BottomSheetStates.IDLE;
		else if (
			state & BottomSheetStates.IDLE &&
			deltaY > (peekHeightComputed - idleHeightComputed) * threshold
		)
			state = BottomSheetStates.PEEK;
		else if (
			state & BottomSheetStates.FULL &&
			deltaY <
				(idleHeightComputed - fullHeightComputed) * threshold -
					peekHeightComputed
		)
			state = BottomSheetStates.IDLE;
		else if (
			state & BottomSheetStates.FULL &&
			deltaY < (peekHeightComputed - fullHeightComputed) * threshold
		)
			state = BottomSheetStates.PEEK;

		deltaY = 0;
	}

	function resolvePageCoordinates(
		event: MouseEvent | TouchEvent,
	): [x: number, y: number] {
		return typeof TouchEvent !== 'undefined' && event instanceof TouchEvent
			? [event.touches[0]!.clientX, event.touches[0]!.clientY]
			: typeof MouseEvent !== 'undefined' && event instanceof MouseEvent
			? [event.clientX, event.clientY]
			: [NaN, NaN];
	}

	function hasParentElem(elem: HTMLElement, parent: HTMLElement): boolean {
		if (elem === parent) return true;

		if (elem.parentElement)
			return hasParentElem(elem.parentElement, parent);

		return false;
	}
</script>

<div
	class="bottom-sheet"
	style="
		--colour-background: {css(colourBackground)};
		--colour-border: {css(colourBorder)};
		--colour-underlay: {css(colourUnderlay)};
		--width: {css(width)};
		--height-idle: {css(idleHeight)};
		--height-peek: {css(peekHeight)};
		--height-full: {css(fullHeight)};
		--height-curr: clamp(var(--height-idle), calc({css(
		currHeight,
	)} + {deltaY}px), var(--height-full));
		--roundness: {css(roundness)};
		--overscroll: {overscrollY}px;
	"
	role="combobox"
	aria-haspopup="listbox"
	aria-expanded={Boolean(
		state & BottomSheetStates.FULL || state & BottomSheetStates.PEEK,
	)}
	aria-owns="listbox"
	aria-controls="listbox"
	tabindex="0"
	bind:this={componentDiv}
	on:mousedown={onDragStart}
	on:touchstart={onDragStart}
	on:mousemove={onDragMove}
	on:touchmove={onDragMove}
	on:mouseup={onDragEnd}
	on:mouseleave={onDragEnd}
	on:blur={onDragEnd}
	on:touchend={onDragEnd}
	on:touchcancel={onDragEnd}
	on:wheel={onWheel}
>
	{#if !(state & BottomSheetStates.IDLE) || state & BottomSheetStates.SETTLING}
		<div
			class="underlay"
			style="
				--opacity: {opacity};
			"
			role="presentation"
			on:click={() => {
				state = BottomSheetStates.IDLE | BottomSheetStates.SETTLING;
			}}
			on:keydown={(event) => {
				if (event.key === 'Escape') event.currentTarget.click();
			}}
			on:touchmove|preventDefault
		/>
	{/if}
	<div
		class="container"
		class:dragging={state & BottomSheetStates.DRAGGING}
		use:whenResize={({ height }) => {
			currHeightComputed = height;
		}}
	>
		<div
			class="content"
			style=""
			bind:this={contentDiv}
			on:scroll={onDragRelease}
			on:scroll={() => {
				if (!(state & BottomSheetStates.FULL))
					state = BottomSheetStates.FULL;
			}}
			use:whenResize={() => {
				scrollHeightComputed = contentDiv?.scrollHeight ?? 0;
			}}
			use:whenScroll={({ y }) => {
				scrollY = y;
			}}
		>
			<slot {state} />
		</div>
		<div class="overlay">
			<slot name="overlay" />
		</div>
	</div>
	<div
		class="sizer"
		style="--height: var(--height-full)"
		use:whenResize={({ height }) => {
			fullHeightComputed = height;
		}}
	/>
	<div
		class="sizer"
		style="--height: var(--height-peek)"
		use:whenResize={({ height }) => {
			peekHeightComputed = height;
		}}
	/>
	<div
		class="sizer"
		style="--height: var(--height-idle)"
		use:whenResize={({ height }) => {
			idleHeightComputed = height;
		}}
	/>
</div>

<style lang="postcss">
	.bottom-sheet {
		position: fixed;

		height: 100%;
		width: 100%;

		top: 0;
		left: 0;

		z-index: 10;

		pointer-events: none;

		& > .underlay {
			position: absolute;

			height: 100%;
			width: 100%;

			top: 0;
			left: 0;

			background: var(--colour-underlay);
			opacity: var(--opacity);

			pointer-events: auto;
		}

		& > .container {
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);

			height: var(--height-curr);
			width: var(--width);

			border-radius: var(--roundness) var(--roundness) 0 0;
			overflow: hidden;
			overflow: clip;
			background: var(--colour-background);
			border: 1px solid var(--colour-border);

			box-shadow: 0 0 32px -1px rgb(17 24 39 / 60%);

			pointer-events: auto;
			touch-action: none;

			transition: height 0.5s var(----ease-fast-slow);

			&.dragging {
				cursor: grabbing;

				transition: none;
			}

			& > .content {
				height: var(--height-full);
				width: 100%;

				overflow: auto;

				transform: translateY(calc(-1 * var(--overscroll)));
				transition: transform 0.5s var(----ease-fast-slow);
			}

			& > .overlay {
				position: absolute;

				bottom: 0;
				right: 0;
			}
		}

		& > .sizer {
			position: absolute;

			height: var(--height);

			visibility: hidden;
		}
	}
</style>
