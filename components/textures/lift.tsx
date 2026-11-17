// Lift — a Texture by Textures · https://textures.dev/s/lift
// Install another: npx shadcn@latest add https://textures.dev/r/<slug>.json
// For agents: https://textures.md
// License: free to use
"use client"
import { type CSSProperties, useEffect, useId, useRef, useSyncExternalStore } from "react"
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
const COLS = 23
const ROWS = 16
const X0 = 11
const Y0 = 12
const PITCH = 31
const TILE = 27
const R = 15.5
const CX = 19.5
const CY = 24.5
const PULL = 9
const NEAR = 1
const FULL = 5.5
const TAIL = 0.09
const REACH = 15
const POOL = 330
const EASE_MS = 60
const FIELD_W = (COLS - 1) * PITCH + TILE
const FIELD_H = (ROWS - 1) * PITCH + TILE
export type LiftProps = {
	tokens?: Partial<Record<"--texture-ink" | "--texture-field", string>>
	className?: string
	static?: boolean
}
type Slot = { cell: number; x: number; y: number; tx: number; ty: number; i: number }
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const smooth = (u: number) => u * u * (3 - 2 * u)
const pull = (d: number) => {
	if (d <= FULL) return TAIL + (1 - TAIL) * smooth(clamp((FULL - d) / (FULL - NEAR), 0, 1))
	return TAIL * smooth(clamp((REACH - d) / (REACH - FULL), 0, 1))
}
const subscribeNever = () => () => {}
export function Lift({ tokens, className = "", static: isStatic = false }: LiftProps) {
	const ref = useRef<HTMLDivElement>(null)
	useEffect(() => selfSize(ref.current), [])
	const tiles = useRef<(SVGSVGElement | null)[]>([])
	const circles = useRef<(SVGCircleElement | null)[]>([])
	const poolLive =
		useSyncExternalStore(
			subscribeNever,
			() => true,
			() => false,
		) && !isStatic
	const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
	const patternId = `lift-field-${uid}`
	useEffect(() => {
		const root = ref.current
		if (!root || isStatic) return
		const slots: Slot[] = Array.from({ length: POOL }, (_, i) => ({ cell: -1, x: 0, y: 0, tx: 0, ty: 0, i }))
		const byCell = new Map<number, Slot>()
		const acquire = (cell: number): Slot | null => {
			const have = byCell.get(cell)
			if (have) return have
			let s = slots.find((x) => x.cell === -1) ?? null
			if (!s) {
				for (const x of slots)
					if (x.tx === 0 && x.ty === 0 && (!s || Math.hypot(x.x, x.y) < Math.hypot(s.x, s.y))) s = x
				if (!s) return null
				byCell.delete(s.cell)
			}
			s.cell = cell
			s.x = s.y = s.tx = s.ty = 0
			byCell.set(cell, s)
			const el = tiles.current[s.i]
			if (el) {
				el.setAttribute("x", String(X0 + (cell % COLS) * PITCH))
				el.setAttribute("y", String(Y0 + Math.floor(cell / COLS) * PITCH))
				el.style.opacity = "1"
			}
			return s
		}
		const release = (s: Slot) => {
			byCell.delete(s.cell)
			s.cell = -1
			const el = tiles.current[s.i]
			const c = circles.current[s.i]
			if (el) el.style.opacity = "0"
			if (c) c.style.transform = ""
		}
		return engine(
			root,
			({ x, y, active, reduced }, dt) => {
				for (const s of byCell.values()) s.tx = s.ty = 0
				if (active > 0.001) {
					const pc = (x - X0 - CX) / PITCH
					const pr = (y - Y0 - CY) / PITCH
					const r0 = clamp(Math.floor(pr - REACH), 0, ROWS - 1)
					const r1 = clamp(Math.ceil(pr + REACH), 0, ROWS - 1)
					const c0 = clamp(Math.floor(pc - REACH), 0, COLS - 1)
					const c1 = clamp(Math.ceil(pc + REACH), 0, COLS - 1)
					for (let r = r0; r <= r1; r++) {
						for (let c = c0; c <= c1; c++) {
							const dx = pc - c
							const dy = pr - r
							const d = Math.hypot(dx, dy)
							const k = pull(d) * active
							if (k <= 0.001) continue
							const s = acquire(r * COLS + c)
							if (!s) continue
							const len = Math.max(d, 0.001)
							s.tx = (dx / len) * PULL * k
							s.ty = (dy / len) * PULL * k
						}
					}
				}
				const k = reduced ? 1 : 1 - Math.exp((-dt * 1000) / EASE_MS)
				let more = false
				for (const s of [...byCell.values()]) {
					const nx = s.x + (s.tx - s.x) * k
					const ny = s.y + (s.ty - s.y) * k
					const done = Math.abs(nx - s.tx) < 0.02 && Math.abs(ny - s.ty) < 0.02
					s.x = done ? s.tx : nx
					s.y = done ? s.ty : ny
					if (!done) more = true
					if (done && s.tx === 0 && s.ty === 0) {
						release(s)
						continue
					}
					const c = circles.current[s.i]
					if (c) c.style.transform = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px)`
				}
				return more
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
			data-texture="lift"
			className={className}
		>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				preserveAspectRatio="xMidYMid slice"
				aria-hidden="true"
				focusable="false"
				style={{ position: "absolute", inset: 0, display: "block", height: "100%", width: "100%" }}
			>
				<defs>
					<pattern id={patternId} patternUnits="userSpaceOnUse" x={X0} y={Y0} width={PITCH} height={PITCH}>
						<svg width={TILE} height={TILE} viewBox={`0 0 ${TILE} ${TILE}`} overflow="hidden">
							<rect width={TILE} height={TILE} fill="var(--texture-ink)" />
							<circle cx={CX} cy={CY} r={R} fill="var(--texture-field)" />
						</svg>
					</pattern>
				</defs>
				<rect x={X0} y={Y0} width={FIELD_W} height={FIELD_H} fill={`url(#${patternId})`} />
				{poolLive
					? Array.from({ length: POOL }, (_, i) => (
							<svg
								key={i}
								viewBox={`0 0 ${TILE} ${TILE}`}
								width={TILE}
								height={TILE}
								overflow="hidden"
								style={{ opacity: 0 }}
								ref={(el) => {
									tiles.current[i] = el
								}}
							>
								<rect width={TILE} height={TILE} fill="var(--texture-ink)" />
								<circle
									ref={(el) => {
										circles.current[i] = el
									}}
									cx={CX}
									cy={CY}
									r={R}
									fill="var(--texture-field)"
								/>
							</svg>
						))
					: null}
			</svg>
		</div>
	)
}
