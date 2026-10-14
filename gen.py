# Generates cube.css: static layout + slot-based pure-CSS T-perm animation.
ALG = "R U R' U' R' F R2 U' R' U' R U R' F'".split()
MOVE_DEF = {"R": ("x", 1, [1]), "U": ("y", -1, [-1]), "F": ("z", 1, [1])}  # axis, sign, layers
IDX = {"x": 0, "y": 1, "z": 2}

def parse(tok):
    q = 2 if tok.endswith("2") else (-1 if tok.endswith("'") else 1)
    axis, sign, layers = MOVE_DEF[tok[0]]
    return axis, 90 * sign * q, layers

def rot(axis, deg):
    c = {0: 1, 90: 0, 180: -1, 270: 0}[deg % 360]
    s = {0: 0, 90: 1, 180: 0, 270: -1}[deg % 360]
    return {"x": [[1,0,0],[0,c,-s],[0,s,c]],
            "y": [[c,0,s],[0,1,0],[-s,0,c]],
            "z": [[c,-s,0],[s,c,0],[0,0,1]]}[axis]

def mul(A, B):
    return [[sum(A[i][k]*B[k][j] for k in range(3)) for j in range(3)] for i in range(3)]

def app(M, p):
    return tuple(sum(M[i][k]*p[k] for k in range(3)) for i in range(3))

IDENT = [[1,0,0],[0,1,0],[0,0,1]]
moves = [parse(t) for t in ALG]
N = len(moves)

def name(x, y, z):  # x,y,z centered (-1..1), y=-1 is up
    n = {-1: "u", 0: "", 1: "d"}[y] + {-1: "b", 0: "", 1: "f"}[z] + {-1: "l", 0: "", 1: "r"}[x]
    return n or "core"

# ---- simulate every cubie -------------------------------------------------
masks, finals = {}, {}
for y in (-1, 0, 1):
    for z in (-1, 0, 1):
        for x in (-1, 0, 1):
            M, p0, mk = IDENT, (x, y, z), []
            for axis, deg, layers in moves:
                pos = app(M, p0)
                hit = pos[IDX[axis]] in layers
                mk.append(1 if hit else 0)
                if hit:
                    M = mul(rot(axis, deg), M)
            masks[name(x, y, z)] = mk
            finals[name(x, y, z)] = (p0, app(M, p0), M)

# ---- verify it is really a T-perm -----------------------------------------
moved = {n: (a, b) for n, (a, b, _) in finals.items() if a != b}
print("cubies that changed position:")
for n, (a, b) in sorted(moved.items()):
    print(" ", n, a, "->", b)
for n, (a, b, M) in finals.items():
    is_center = sum(abs(v) for v in a) <= 1
    if a == b and not is_center:
        assert M == IDENT, ("twisted in place", n)
for n, (a, b, M) in finals.items():  # swapped corners keep U sticker facing up (no twist)
    if a != b and n in ("ufr", "ubr"):
        assert app(M, (0, -1, 0)) == (0, -1, 0), n
assert {"ufr", "ubr", "ul", "ur"} == set(moved), set(moved)
assert finals["ufr"][1] == finals["ubr"][0] and finals["ubr"][1] == finals["ufr"][0]
assert finals["ul"][1] == finals["ur"][0] and finals["ur"][1] == finals["ul"][0]
print("OK: T-perm (UFR<->UBR, UL<->UR), nothing else disturbed")

# ---- CSS ------------------------------------------------------------------
out = []
w = out.append

w(""":root {
  --cubie-size: 50px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}

.cube-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 80%;
  max-width: 600px;
  margin: 0 auto;
}

.cube-container .cube-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(var(--cubie-size) * 5.2);
  /* animation: showCube 10s linear infinite; */
  transform: perspective(calc(var(--cubie-size) * 12)) rotateX(-25deg) rotateY(-35deg);
  transform-style: preserve-3d;
}

@keyframes showCube {
  from {
    transform: perspective(calc(var(--cubie-size) * 12)) rotateX(-25deg) rotateY( -35deg);
  }
  50% {
    transform: perspective(calc(var(--cubie-size) * 12)) rotateX( 25deg) rotateY(-215deg);
  }
  to {
    transform: perspective(calc(var(--cubie-size) * 12)) rotateX(-25deg) rotateY(-395deg);
  }
}

.cube-container .cube {
  position: relative;
  width: calc(var(--cubie-size) * 3);
  height: calc(var(--cubie-size) * 3);
  transform-style: preserve-3d;
}

.cube-container .cubie-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transform-style: preserve-3d;
}

.cube-container .cube.animate .cubie-container {
  transition: transform 350ms ease-out 150ms;
}

.cube-container .cubie {
  width: var(--cubie-size);
  height: var(--cubie-size);
  transform-style: preserve-3d;
}
""")

for y in (0, 1, 2):
    for z in (-1, 0, 1):
        for x in (0, 1, 2):
            cls = name(x - 1, y - 1, z)
            w(f""".cube-container .cubie-container.{cls if cls != 'core' else 'core'} .cubie {{
  transform: translateX(calc(var(--cubie-size) * {x})) translateY(calc(var(--cubie-size) * {y})) translateZ(calc(var(--cubie-size) * {z:2d}));
}}
""")

w(""".cube-container .face {
  position: absolute;
  width: var(--cubie-size);
  height: var(--cubie-size);
  padding: 4%;
  background: black;
}

.cube-container .face.up {
  transform: translateY(calc(var(--cubie-size) * -0.5)) rotateX(90deg);
}

.cube-container .face.right {
  transform: translateX(calc(var(--cubie-size) * 0.5)) rotateY(90deg);
}

.cube-container .face.front {
  transform: translateZ(calc(var(--cubie-size) * 0.5));
}

.cube-container .face.down {
  transform: translateY(calc(var(--cubie-size) * 0.5)) rotateX(-90deg);
}

.cube-container .face.left {
  transform: translateX(calc(var(--cubie-size) * -0.5)) rotateY(-90deg);
}

.cube-container .face.back {
  transform: translateZ(calc(var(--cubie-size) * -0.5));
}

.cube-container .sticker {
  width: 100%;
  height: 100%;
  border-radius: 10%;
}

.cube-container .face.up .sticker {
  background-color: #ffd500;
}

.cube-container .face.right .sticker {
  background-color: #b71234;
}

.cube-container .face.front .sticker {
  background-color: #0046ad;
}

.cube-container .face.down .sticker {
  background-color: #ffffff;
}

.cube-container .face.left .sticker {
  background-color: #ff5800;
}

.cube-container .face.back .sticker {
  background-color: #009b48;
}
""")

# slice-turn classes (unchanged, except the S block: si/s2 were swapped)
turn_defs = [("u","uslice","Y",-90),("r","rslice","X",90),("d","dslice","Y",90),
             ("e","eslice","Y",90),("m","mslice","X",-90),("s","sslice","Z",90)]
for t, sl, ax, a in turn_defs:
    for suf, ang in (("", a), ("i", -a), ("2", 2*a), ("2i", -2*a)):
        w(f""".cube-container .cube.turn-{t}{suf} .cubie-container.{sl} {{
  transform: rotate{ax}({ang}deg);
}}""")
    out[-1] += "\n"

# ---- T-perm block ---------------------------------------------------------
w("/*")
w(" * Pure-CSS T-perm:  " + " ".join(ALG))
w(" *")
w(" * One \"slot\" per move. --aN is the angle of move N (animated, registered as <angle>);")
w(" * --kN is 1 when a cubie is in the layer that move N turns, 0 otherwise (per cubie).")
w(" * The transform lists the slots newest-first, so each rotation happens about the")
w(" * fixed world axis, which is why the compound angles never need to be worked out by hand.")
w(" *")
for i, (tok, (axis, deg, _)) in enumerate(zip(ALG, moves), 1):
    w(f" *   slot {i:2d}: {tok:<2}  rotate{axis.upper()}({deg}deg)")
w(" *")
w(" * Usage: add class \"t-perm\" to the .cube element (and do not combine it with .animate).")
w(" * Generated by a script that tracks every cubie through the algorithm.")
w(" */")
w("")
w(":root {\n  --move-duration: 450ms;\n  --move-gap: 120ms;\n  --move-step: calc(var(--move-duration) + var(--move-gap));\n}\n")

for i in range(1, N + 1):
    w(f"@property --a{i} {{ syntax: \"<angle>\"; inherits: true; initial-value: 0deg; }}")
w("")

for i, (axis, deg, _) in enumerate(moves, 1):
    w(f"@keyframes m{i} {{ to {{ --a{i}: {deg}deg; }} }}")
w("")

w(".cube-container .cube.t-perm {")
w("  animation-name: " + ", ".join(f"m{i}" for i in range(1, N + 1)) + ";")
w("  animation-duration: var(--move-duration);")
w("  animation-timing-function: ease-in-out;")
w("  animation-fill-mode: forwards;")
w("  animation-delay:")
w(",\n".join(f"    calc(var(--move-step) * {i})" for i in range(N)) + ";")
w("}\n")

w(".cube-container .cube.t-perm .cubie-container {")
w("  transition: none;")
w("  " + " ".join(f"--k{i}: 0;" for i in range(1, N + 1)))
w("  transform:")
w("\n".join(f"    rotate{moves[i-1][0].upper()}(calc(var(--a{i}) * var(--k{i})))" for i in range(N, 0, -1)) + ";")
w("}\n")

for n, mk in masks.items():
    if not any(mk):
        continue
    decl = " ".join(f"--k{i}: 1;" for i, v in enumerate(mk, 1) if v)
    w(f".cube-container .cube.t-perm .cubie-container.{n} {{ {decl} }}")
w("")

w("""/*
.cube-container .cubie-container.rslice {
  animation: rotateSliceX 2s linear infinite;
}

.cube-container .cubie-container.uslice {
  animation: rotateSliceY 2s linear infinite;
}

@keyframes rotateSliceY {
  from {
    transform: rotateY(0);
  }
  25% {
    transform: rotateY(-180deg);
  }
  50% {
    transform: rotateY(-180deg);
  }
  75% {
    transform: rotateY(-360deg);
  }
  to {
    transform: rotateY(-360deg);
  }
}

@keyframes rotateSliceX {
  from {
    transform: rotateX(0);
  }
  25% {
    transform: rotateX(0deg);
  }
  50% {
    transform: rotateX(-180deg);
  }
  75% {
    transform: rotateX(-180deg);
  }
  to {
    transform: rotateX(-360deg);
  }
}
*/""")

open("/mnt/user-data/outputs/cube.css", "w").write("\n".join(out) + "\n")
