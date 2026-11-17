// Blinds — a Texture by Textures · https://textures.dev/s/blinds
// Install another: npx shadcn@latest add https://textures.dev/r/<slug>.json
// For agents: https://textures.md
// License: free to use
"use client"
import { type CSSProperties, useEffect, useRef } from "react"
function selfSize(root: HTMLElement | null): void {
	const host = root?.parentElement
	if (!root || !host || host.getBoundingClientRect().height > 0) return
	root.style.minHeight = "240px"
}
type Pointer = { x: number; y: number; active: number; reduced: boolean }
const AMBIENT_SPEED = 1.5
const AMBIENT_CYCLE = 4.5
type EngineOptions = { ambientSpeed?: number }
function engine(
	root: HTMLElement,
	draw: (p: Pointer, dt: number) => boolean | void,
	min: [number, number],
	options: EngineOptions = {},
): () => void {
	const svg = root.querySelector("svg")
	if (!svg) return () => {}
	const mq = () => matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(update: slow)").matches
	const touchMq = matchMedia("(hover: none), (pointer: coarse)")
	const forced = () => root.closest("[data-motion]")?.getAttribute("data-motion") ?? null
	const wantsAmbient = () => (forced() ? forced() === "ambient" : touchMq.matches)
	const speed = AMBIENT_SPEED * (options.ambientSpeed ?? 1)
	const w = (2 * Math.PI) / AMBIENT_CYCLE
	const phase = Math.random() * 2 * Math.PI
	let onScreen = false
	let ambient = false
	let clock = 0
	let hold = 0
	let box: { left: number; top: number; s: number; ox: number; oy: number } | null = null
	let px = 366
	let py = 258
	let cx = 0
	let cy = 0
	let active = 0
	let target = 0
	let vel = 0
	let frame = 0
	let last = 0
	let lastMoveAt = 0
	const measure = () => {
		const r = svg.getBoundingClientRect()
		if (r.width < min[0] || r.height < min[1]) {
			box = null
			return
		}
		const s = Math.max(r.width / 732, r.height / 516)
		box = { left: r.left, top: r.top, s, ox: (r.width - 732 * s) / 2, oy: (r.height - 516 * s) / 2 }
	}
	const tick = (now: number) => {
		const dt = Math.min(last ? (now - last) / 1000 : 1 / 60, 1 / 30)
		last = now
		let moving = false
		const reduced = mq()
		if (ambient && now > hold) {
			if (reduced) target = 0
			else {
				clock += dt * speed
				const t = clock
				px = 366 + 366 * (0.76 * Math.sin(w * t + phase) + 0.2 * Math.sin(1.93 * w * t + 1.2 + phase))
				py = 258 + 258 * (0.72 * Math.sin(0.75 * w * t + 0.8 + phase) + 0.2 * Math.sin(1.37 * w * t + 2.1 + phase))
				target = 1
				moving = true
			}
		}
		if (reduced) {
			active = target
			vel = 0
		} else {
			const decay = Math.exp(-30 * dt)
			const off = active - target
			const lead = vel + 30 * off
			active = target + (off + lead * dt) * decay
			vel = (vel - 30 * lead * dt) * decay
			if (Math.abs(vel) < 0.02 && Math.abs(active - target) < 0.02) {
				active = target
				vel = 0
			} else moving = true
		}
		const more = draw({ x: px, y: py, active, reduced }, dt)
		if (moving || more) frame = requestAnimationFrame(tick)
		else {
			frame = 0
			last = 0
		}
	}
	const wake = () => {
		if (!frame) frame = requestAnimationFrame(tick)
	}
	const touchIsAmbient = (e: Event) => (e as PointerEvent).pointerType === "touch" && touchMq.matches
	const onEnter = (e: PointerEvent) => {
		if (touchIsAmbient(e)) return
		measure()
	}
	const onMove = (e: PointerEvent) => {
		if (touchIsAmbient(e)) return
		const t = performance.now()
		if (!box || t - lastMoveAt > 250) measure()
		lastMoveAt = t
		if (!box) return
		if (!e.isTrusted) hold = performance.now() + 1000
		cx = e.clientX
		cy = e.clientY
		px = (cx - box.left - box.ox) / box.s
		py = (cy - box.top - box.oy) / box.s
		target = 1
		wake()
	}
	const onLeave = (e?: Event) => {
		if (e && touchIsAmbient(e)) return
		if (e && !e.isTrusted) hold = 0
		if (ambient && performance.now() > hold) return
		target = 0
		wake()
	}
	const onFocus = () => {
		measure()
		if (!box) return
		px = 366
		py = 258
		target = 1
		wake()
	}
	const onResize = () => {
		if (box || ambient) measure()
		if (ambient && !box) ambient = false
		settle()
	}
	const onScroll = () => {
		if (!box || target !== 1 || (ambient && performance.now() > hold)) return
		measure()
		if (!box) return
		px = (cx - box.left - box.ox) / box.s
		py = (cy - box.top - box.oy) / box.s
		wake()
	}
	const settle = () => {
		const next = onScreen && !document.hidden && wantsAmbient()
		if (next === ambient) return
		ambient = next
		if (ambient) {
			measure()
			if (!box) {
				ambient = false
				return
			}
			wake()
		} else {
			target = 0
			wake()
		}
	}
	const io =
		typeof IntersectionObserver === "function"
			? new IntersectionObserver(
					([entry]) => {
						onScreen = !!entry?.isIntersecting
						settle()
					},
					{ threshold: 0.2 },
				)
			: null
	io?.observe(svg)
	if (!io) {
		onScreen = true
		settle()
	}
	const onVisibility = () => settle()
	const onCapability = () => settle()
	const reducedMq = matchMedia("(prefers-reduced-motion: reduce)")
	const onReduced = () => wake()
	document.addEventListener("visibilitychange", onVisibility)
	touchMq.addEventListener?.("change", onCapability)
	reducedMq.addEventListener?.("change", onReduced)
	const host: Element = root.closest("a, button, [tabindex]") ?? root.parentElement ?? root
	root.addEventListener("pointerenter", onEnter)
	root.addEventListener("pointermove", onMove, { passive: true })
	root.addEventListener("pointerleave", onLeave)
	root.addEventListener("pointercancel", onLeave)
	host.addEventListener("focusin", onFocus)
	host.addEventListener("focusout", onLeave)
	window.addEventListener("resize", onResize, { passive: true })
	window.addEventListener("scroll", onScroll, { passive: true, capture: true })
	return () => {
		root.removeEventListener("pointerenter", onEnter)
		root.removeEventListener("pointermove", onMove)
		root.removeEventListener("pointerleave", onLeave)
		root.removeEventListener("pointercancel", onLeave)
		host.removeEventListener("focusin", onFocus)
		host.removeEventListener("focusout", onLeave)
		window.removeEventListener("resize", onResize)
		window.removeEventListener("scroll", onScroll, { capture: true })
		document.removeEventListener("visibilitychange", onVisibility)
		touchMq.removeEventListener?.("change", onCapability)
		reducedMq.removeEventListener?.("change", onReduced)
		io?.disconnect()
		if (frame) cancelAnimationFrame(frame)
	}
}
const W = 732
const H = 516
const N = 27
const X0 = 16
const PITCH = 26
const STRIPE = 24
const W_REST = 2
const Y0 = 15
const Y1 = 499
const TWIST_MAX = 90
const REACH = 11
const SIGMA = 170
const SAMPLES = 40
export type BlindsProps = {
	tokens?: Partial<Record<"--texture-ink" | "--texture-field", string>>
	className?: string
	static?: boolean
}
const TAU_NEAR = 0.03
const TAU_FAR = 0.14
const TAU_HOME = 0.2
const DEAD = 0.003
const rest = (i: number) =>
	`M${X0 + i * PITCH + (STRIPE - W_REST) / 2} ${Y0}H${X0 + i * PITCH + (STRIPE + W_REST) / 2}V${Y1}H${X0 + i * PITCH + (STRIPE - W_REST) / 2}Z`
const share = (u: number) => {
	if (u >= REACH) return 0
	const v = 1 - u / REACH
	return v * v * (3 - 2 * v)
}
const SPAN = 3 * SIGMA
const RAD = Math.PI / 180
export function Blinds({ tokens, className = "", static: isStatic = false }: BlindsProps) {
	const ref = useRef<HTMLDivElement>(null)
	useEffect(() => selfSize(ref.current), [])
	const paths = useRef<(SVGPathElement | null)[]>([])
	useEffect(() => {
		const root = ref.current
		if (!root || isStatic) return
		const open = new Float32Array(N)
		const drawnOpen = new Float32Array(N)
		const drawnY = new Float32Array(N)
		const drawnX = new Float32Array(N)
		return engine(
			root,
			({ x, y, active, reduced }, dt) => {
				let moving = false
				for (let i = 0; i < N; i++) {
					const left = X0 + i * PITCH
					const mid = left + STRIPE / 2
					const u = Math.abs(mid - x) / PITCH
					const target = share(u) * active
					const o = open[i]!
					let next: number
					if (reduced) next = target
					else {
						const tau = active > 0 ? TAU_NEAR + (TAU_FAR - TAU_NEAR) * Math.min(1, u / REACH) : TAU_HOME
						next = o + (target - o) * (1 - Math.exp(-dt / tau))
						if (Math.abs(next - target) < DEAD) next = target
					}
					open[i] = next
					if (next !== target) moving = true
					const el = paths.current[i]
					if (!el) continue
					if (next === 0) {
						if (drawnOpen[i] !== 0) {
							drawnOpen[i] = 0
							el.setAttribute("d", rest(i))
						}
						continue
					}
					if (
						Math.abs(next - drawnOpen[i]!) < 0.002 &&
						Math.abs(y - drawnY[i]!) < 0.25 &&
						Math.abs(x - drawnX[i]!) < 0.25
					)
						continue
					drawnOpen[i] = next
					drawnY[i] = y
					drawnX[i] = x
					const top = Math.max(Y0, y - SPAN)
					const bottom = Math.min(Y1, y + SPAN)
					const at = (yy: number, which: -1 | 1) => {
						const dy = (yy - y) / SIGMA
						const theta = next * TWIST_MAX * Math.exp(-dy * dy) * RAD
						const w = W_REST + (STRIPE - W_REST) * Math.sin(theta)
						return (mid + (which * w) / 2).toFixed(2)
					}
					let d = `M${at(Y0, -1)} ${Y0}`
					if (top > Y0) d += `L${at(top, -1)} ${top.toFixed(2)}`
					for (let k = 1; k <= SAMPLES; k++) {
						const yy = top + ((bottom - top) * k) / SAMPLES
						d += `L${at(yy, -1)} ${yy.toFixed(2)}`
					}
					if (bottom < Y1) d += `L${at(Y1, -1)} ${Y1}`
					d += `L${at(Y1, 1)} ${Y1}`
					if (bottom < Y1) d += `L${at(bottom, 1)} ${bottom.toFixed(2)}`
					for (let k = SAMPLES - 1; k >= 0; k--) {
						const yy = top + ((bottom - top) * k) / SAMPLES
						d += `L${at(yy, 1)} ${yy.toFixed(2)}`
					}
					if (top > Y0) d += `L${at(Y0, 1)} ${Y0}`
					d += "Z"
					el.setAttribute("d", d)
				}
				return moving
			},
			[160, 112],
		)
	}, [isStatic])
	const style = {
		"--texture-ink": "var(--foreground)",
		"--texture-field": "var(--background)",
		...tokens,
		color: "var(--texture-ink)",
		background: "var(--texture-field)",
	} as CSSProperties
	return (
		<div
			ref={ref}
			style={{
				position: "relative",
				isolation: "isolate",
				height: "100%",
				width: "100%",
				overflow: "clip",
				contain: "layout paint style",
				containerType: "size",
				...style,
			}}
			data-texture="blinds"
			className={className}
		>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				preserveAspectRatio="xMidYMid slice"
				aria-hidden="true"
				focusable="false"
				fill="currentColor"
				style={{ position: "absolute", inset: 0, display: "block", height: "100%", width: "100%" }}
			>
				{Array.from({ length: N }, (_, i) => (
					<path
						key={i}
						ref={(el) => {
							paths.current[i] = el
						}}
						d={rest(i)}
					/>
				))}
			</svg>
		</div>
	)
}
