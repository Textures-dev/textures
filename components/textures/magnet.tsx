// Magnet — a Texture by Textures · https://textures.dev/s/magnet
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
const COLS = 51
const ROWS = 35
const X0 = 18
const Y0 = 18
const DX = 13.84
const DY = 14
const DOT = 4
const REACH = 2
const DRIFT = 11
const PULL = 5.5
const PACK = 3.7
const POOL = 384
const FIELD_W = (COLS - 1) * DX + DOT
const FIELD_H = (ROWS - 1) * DY + DOT
export type MagnetProps = {
	tokens?: Partial<Record<"--texture-ink" | "--texture-field", string>>
	className?: string
	static?: boolean
}
type Slot = {
	cell: number
	hx: number
	hy: number
	x: number
	y: number
	vx: number
	vy: number
	tx: number
	ty: number
	k: number
	d: number
	i: number
}
const STIFFNESS = 760
const ZETA = 0.66
const SPREAD = 0.35
const noise = (seed: number) => {
	let t = (seed + 0x6d2b79f5) | 0
	t = Math.imul(t ^ (t >>> 15), t | 1)
	t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const homeX = (c: number) => X0 + c * DX
const homeY = (r: number) => Y0 + r * DY
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const lean = (d: number) => {
	const u = clamp((DRIFT - d) / (DRIFT - REACH), 0, 1)
	return PULL * u * u * (3 - 2 * u)
}
const subscribeNever = () => () => {}
export function Magnet({ tokens, className = "", static: isStatic = false }: MagnetProps) {
	const ref = useRef<HTMLDivElement>(null)
	useEffect(() => selfSize(ref.current), [])
	const dots = useRef<(SVGRectElement | null)[]>([])
	const masks = useRef<(SVGRectElement | null)[]>([])
	const poolLive =
		useSyncExternalStore(
			subscribeNever,
			() => true,
			() => false,
		) && !isStatic
	const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
	const patternId = `magnet-dots-${uid}`
	const maskId = `magnet-hole-${uid}`
	useEffect(() => {
		const root = ref.current
		if (!root || isStatic) return
		const slots: Slot[] = Array.from({ length: POOL }, (_, i) => ({
			cell: -1,
			hx: 0,
			hy: 0,
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			tx: 0,
			ty: 0,
			k: 0,
			d: 0,
			i,
		}))
		const byCell = new Map<number, Slot>()
		let prev = -1
		const acquire = (cell: number): Slot | null => {
			const have = byCell.get(cell)
			if (have) return have
			let s = slots.find((t) => t.cell === -1) ?? null
			if (!s) {
				for (const t of slots)
					if (
						t.tx === t.hx &&
						t.ty === t.hy &&
						(!s || Math.hypot(t.x - t.hx, t.y - t.hy) < Math.hypot(s.x - s.hx, s.y - s.hy))
					)
						s = t
				if (!s) return null
				byCell.delete(s.cell)
			}
			const c = cell % COLS
			const r = Math.floor(cell / COLS)
			s.cell = cell
			s.hx = s.x = s.tx = homeX(c)
			s.hy = s.y = s.ty = homeY(r)
			s.vx = s.vy = 0
			s.k = STIFFNESS * (1 + SPREAD * (noise(cell) * 2 - 1))
			s.d = 2 * ZETA * Math.sqrt(s.k)
			byCell.set(cell, s)
			const m = masks.current[s.i]
			const el = dots.current[s.i]
			if (m) {
				m.setAttribute("x", (s.hx - 0.75).toFixed(2))
				m.setAttribute("y", (s.hy - 0.75).toFixed(2))
				m.style.opacity = "1"
			}
			if (el) {
				el.setAttribute("x", s.hx.toFixed(2))
				el.setAttribute("y", s.hy.toFixed(2))
				el.style.transform = ""
				el.style.opacity = "1"
			}
			return s
		}
		const release = (s: Slot) => {
			byCell.delete(s.cell)
			s.cell = -1
			const m = masks.current[s.i]
			const el = dots.current[s.i]
			if (m) m.style.opacity = "0"
			if (el) {
				el.style.opacity = "0"
				el.style.transform = ""
			}
		}
		return engine(
			root,
			({ x, y, active, reduced }, dt) => {
				const on = active > 0.01
				const mx = clamp(x, homeX(REACH) + DOT / 2, homeX(COLS - 1 - REACH) + DOT / 2)
				const my = clamp(y, homeY(REACH) + DOT / 2, homeY(ROWS - 1 - REACH) + DOT / 2)
				const cc = on ? Math.round((mx - DOT / 2 - X0) / DX) : -1
				const cr = on ? Math.round((my - DOT / 2 - Y0) / DY) : -1
				const key = cr * COLS + cc
				if (key !== prev) {
					for (const s of byCell.values()) {
						s.tx = s.hx
						s.ty = s.hy
					}
					prev = key
				}
				if (on) {
					for (let i = -DRIFT; i <= DRIFT; i++) {
						for (let j = -DRIFT; j <= DRIFT; j++) {
							const c = cc + i
							const r = cr + j
							if (c < 0 || c >= COLS || r < 0 || r >= ROWS) continue
							const d = Math.hypot(i, j)
							if (d > DRIFT) continue
							const s = acquire(r * COLS + c)
							if (!s) continue
							if (Math.abs(i) <= REACH && Math.abs(j) <= REACH) {
								s.tx = mx + i * PACK - DOT / 2
								s.ty = my + j * PACK - DOT / 2
							} else {
								const ox = mx - DOT / 2 - s.hx
								const oy = my - DOT / 2 - s.hy
								const len = Math.hypot(ox, oy) || 1
								const l = lean(d)
								s.tx = s.hx + (ox / len) * l
								s.ty = s.hy + (oy / len) * l
							}
						}
					}
				}
				let moving = false
				for (const s of [...byCell.values()]) {
					if (reduced) {
						s.x = s.tx
						s.y = s.ty
						s.vx = s.vy = 0
					} else {
						const steps = Math.ceil(dt * 240)
						const h = dt / steps
						for (let n = 0; n < steps; n++) {
							s.vx += (-s.k * (s.x - s.tx) - s.d * s.vx) * h
							s.vy += (-s.k * (s.y - s.ty) - s.d * s.vy) * h
							s.x += s.vx * h
							s.y += s.vy * h
						}
					}
					const settled =
						Math.abs(s.x - s.tx) < 0.02 && Math.abs(s.y - s.ty) < 0.02 && Math.abs(s.vx) < 0.5 && Math.abs(s.vy) < 0.5
					if (settled) {
						s.x = s.tx
						s.y = s.ty
						s.vx = s.vy = 0
						if (s.tx === s.hx && s.ty === s.hy) {
							release(s)
							continue
						}
					} else moving = true
					const el = dots.current[s.i]
					if (el) el.style.transform = `translate(${(s.x - s.hx).toFixed(2)}px, ${(s.y - s.hy).toFixed(2)}px)`
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
			data-texture="magnet"
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
				<defs>
					<pattern id={patternId} patternUnits="userSpaceOnUse" x={X0} y={Y0} width={DX} height={DY}>
						<rect width={DOT} height={DOT} fill="currentColor" />
					</pattern>
					<mask id={maskId}>
						<rect x="0" y="0" width={W} height={H} fill="white" />
						<g fill="black">
							{poolLive
								? Array.from({ length: POOL }, (_, i) => (
										<rect
											key={i}
											ref={(el) => {
												masks.current[i] = el
											}}
											width={DOT + 1.5}
											height={DOT + 1.5}
											style={{ opacity: 0 }}
										/>
									))
								: null}
						</g>
					</mask>
				</defs>
				<rect
					x={X0}
					y={Y0}
					width={FIELD_W.toFixed(2)}
					height={FIELD_H}
					fill={`url(#${patternId})`}
					mask={`url(#${maskId})`}
				/>
				<g fill="currentColor">
					{poolLive
						? Array.from({ length: POOL }, (_, i) => (
								<rect
									key={i}
									ref={(el) => {
										dots.current[i] = el
									}}
									width={DOT}
									height={DOT}
									style={{ opacity: 0 }}
								/>
							))
						: null}
				</g>
			</svg>
		</div>
	)
}
