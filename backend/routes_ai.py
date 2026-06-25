"""
AI Helper + Playground API: QML tutoring chat, prompt→circuit, and statevector simulation.
Uses Groq (GROQ_API_KEY, default model llama-3.3-70b-versatile) or OPENAI_API_KEY when set;
otherwise returns helpful deterministic fallbacks. Keys load from env or backend/.env via config.
"""

from __future__ import annotations

import json
import logging
import math
import os
import re
from typing import Any, Literal

import httpx
from config import get_settings
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

logger = logging.getLogger("qmatrix.ai")

router = APIRouter(prefix="/api/ai", tags=["ai"])

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    chart: dict[str, Any] | None = None
    bloch: dict[str, float] | None = None


class GateOp(BaseModel):
    op: Literal["H", "X", "Y", "Z", "RX", "RY", "RZ", "CX", "CZ", "I"]
    targets: list[int] = Field(default_factory=list)
    params: list[float] = Field(default_factory=list)


class PlaygroundRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=4000)


class PlaygroundResponse(BaseModel):
    title: str
    explanation: str
    legend: list[str]
    n_qubits: int
    gates: list[GateOp]
    ascii_circuit: str
    state_summary: str


class SimulateRequest(BaseModel):
    n_qubits: int = Field(ge=1, le=8)
    gates: list[GateOp]


class SimulateResponse(BaseModel):
    probabilities: dict[str, float]
    bloch: dict[str, float] | None
    state_summary: str


# ---------------------------------------------------------------------------
# Circuit helpers
# ---------------------------------------------------------------------------


def _apply_gate(qc: QuantumCircuit, g: GateOp) -> None:
    op = g.op
    t = g.targets
    p = g.params or []
    if op == "I":
        return
    if op == "H" and len(t) == 1:
        qc.h(t[0])
    elif op == "X" and len(t) == 1:
        qc.x(t[0])
    elif op == "Y" and len(t) == 1:
        qc.y(t[0])
    elif op == "Z" and len(t) == 1:
        qc.z(t[0])
    elif op == "RX" and len(t) == 1 and len(p) >= 1:
        qc.rx(p[0], t[0])
    elif op == "RY" and len(t) == 1 and len(p) >= 1:
        qc.ry(p[0], t[0])
    elif op == "RZ" and len(t) == 1 and len(p) >= 1:
        qc.rz(p[0], t[0])
    elif op == "CX" and len(t) == 2:
        qc.cx(t[0], t[1])
    elif op == "CZ" and len(t) == 2:
        qc.cz(t[0], t[1])
    else:
        raise ValueError(f"Unsupported gate {op} targets={t} params={p}")


def build_quantum_circuit(n_qubits: int, gates: list[GateOp]) -> QuantumCircuit:
    qc = QuantumCircuit(n_qubits)
    for g in gates:
        _apply_gate(qc, g)
    return qc


def circuit_ascii(n_qubits: int, gates: list[GateOp]) -> str:
    qc = build_quantum_circuit(n_qubits, gates)
    return str(qc.draw(output="text"))


def statevector_summary(n_qubits: int, gates: list[GateOp]) -> tuple[dict[str, float], str | None, dict[str, float] | None]:
    qc = build_quantum_circuit(n_qubits, gates)
    sv = Statevector(qc)
    probs: dict[str, float] = {}
    dim = 2**n_qubits
    for i in range(dim):
        b = format(i, f"0{n_qubits}b")
        probs[b] = round(float(sv.probabilities()[i]), 6)
    top = max(probs, key=probs.get)
    summary = f"Dominant computational basis: |{top}⟩ with P≈{probs[top]:.3f}"

    bloch: dict[str, float] | None = None
    if n_qubits == 1:
        a = complex(sv[0])
        b = complex(sv[1])
        na = abs(a)
        nb = abs(b)
        if na + nb < 1e-12:
            bloch = {"theta": 0.0, "phi": 0.0}
        else:
            theta = 2.0 * math.acos(max(0.0, min(1.0, na)))
            phi = math.atan2(b.imag * na - a.imag * nb, b.real * na - a.real * nb) if na > 1e-9 and nb > 1e-9 else 0.0
            bloch = {"theta": float(theta), "phi": float(phi)}
    return probs, summary, bloch


# ---------------------------------------------------------------------------
# Heuristic playground (no LLM)
# ---------------------------------------------------------------------------


def _heuristic_playground(prompt: str) -> PlaygroundResponse:
    p = prompt.lower()
    if any(k in p for k in ("bell", "epr", "phi+", "entangle")):
        gates = [GateOp(op="H", targets=[0]), GateOp(op="CX", targets=[0, 1])]
        n = 2
        title = "Bell state (Phi+)"
        explanation = (
            "Hadamard on q₀ then CNOT(0→1) prepares maximal entanglement: "
            "(|00⟩+|11⟩)/√2. Legend: H creates superposition; CX copies the 0-component "
            "to q₁ while XOR-ing the 1-component — the hallmark of entanglement."
        )
        legend = ["H: superposition on control", "CX: conditional NOT (entangler)"]
    elif "ghz" in p and ("3" in p or "three" in p):
        gates = [
            GateOp(op="H", targets=[0]),
            GateOp(op="CX", targets=[0, 1]),
            GateOp(op="CX", targets=[1, 2]),
        ]
        n = 3
        title = "3-qubit GHZ"
        explanation = "Chain of CNOTs after H spreads |+⟩ on q₀ into an equal superposition of |000⟩ and |111⟩."
        legend = ["H on q₀", "CX q₀→q₁", "CX q₁→q₂"]
    elif "superposition" in p or ("hadamard" in p and "one" in p):
        gates = [GateOp(op="H", targets=[0])]
        n = 1
        title = "|+⟩ on one qubit"
        explanation = "A single H rotates the Bloch vector from the north pole |0⟩ toward the +X axis (equal |0⟩,|1⟩ amplitudes)."
        legend = ["H: π rotation about X+Z diagonal"]
    elif "swap" in p:
        gates = [
            GateOp(op="CX", targets=[0, 1]),
            GateOp(op="CX", targets=[1, 0]),
            GateOp(op="CX", targets=[0, 1]),
        ]
        n = 2
        title = "SWAP via 3× CNOT"
        explanation = "Three CNOTs swap two qubit wires — common primitive in layouts."
        legend = ["CX(0,1)", "CX(1,0)", "CX(0,1)"]
    else:
        gates = [
            GateOp(op="H", targets=[0]),
            GateOp(op="RY", targets=[0], params=[math.pi / 4]),
            GateOp(op="CX", targets=[0, 1]),
        ]
        n = 2
        title = "Starter circuit"
        explanation = (
            "Default demo: H then small RY(π/4) on q₀, then entangle with q₁ via CX. "
            "Try prompts like “Bell state”, “GHZ 3”, or “superposition”."
        )
        legend = ["H", "RY(π/4)", "CX(0→1)"]

    ascii_c = circuit_ascii(n, gates)
    _, summary, _ = statevector_summary(n, gates)
    return PlaygroundResponse(
        title=title,
        explanation=explanation,
        legend=legend,
        n_qubits=n,
        gates=gates,
        ascii_circuit=ascii_c,
        state_summary=summary,
    )


# ---------------------------------------------------------------------------
# LLM
# ---------------------------------------------------------------------------

SYSTEM_CHAT = """You are QUANTIX AI — an expert tutor in quantum computing, quantum machine learning, and variational quantum algorithms.

RESPONSE STRUCTURE — always follow this format:

1. **Brief acknowledgment** (1 sentence max) — confirm you understood the question.
2. **Main answer** — clear, well-organized markdown. Use:
   - `**bold**` for key terms on first use
   - Bullet lists for steps or comparisons
   - Numbered lists for procedures
   - ` ``` ` code blocks for math or circuit notation
   - `##` headings only for multi-section answers
3. **Key insight or next step** — 1-2 sentence practical takeaway at the end.

TONE: Encouraging, concise, educational. No filler phrases like "Great question!". Get to the point.
"""


def _groq_credentials() -> tuple[str, str] | None:
    """Return (api_key, model_id) for Groq, or None if not configured."""
    s = get_settings()
    key = (os.environ.get("GROQ_API_KEY") or s.groq_api_key or "").strip()
    if not key:
        return None
    model = (os.environ.get("GROQ_MODEL") or s.groq_model or "llama-3.3-70b-versatile").strip()
    return key, model


async def _call_openai_compatible(
    messages: list[dict[str, str]],
    *,
    json_mode: bool = False,
    user_api_key: str | None = None,
) -> str:
    groq_creds = _groq_credentials()
    oai = os.environ.get("OPENAI_API_KEY")
    
    if user_api_key:
        if user_api_key.startswith("sk-"):
            url = "https://api.openai.com/v1/chat/completions"
            key = user_api_key
            model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
        else:
            url = "https://api.groq.com/openai/v1/chat/completions"
            key = user_api_key
            model = "llama-3.3-70b-versatile"
    elif groq_creds:
        url = os.environ.get("GROQ_BASE_URL", "https://api.groq.com/openai/v1") + "/chat/completions"
        key, model = groq_creds
    elif oai:
        url = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1") + "/chat/completions"
        key = oai
        model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    else:
        return ""

    payload: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": 0.4,
        "max_tokens": 2000,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(url, headers=headers, json=payload)
            r.raise_for_status()
            data = r.json()
            return str(data["choices"][0]["message"]["content"] or "")
    except httpx.HTTPStatusError as e:
        logger.error("LLM API returned %s: %s", e.response.status_code, e.response.text[:500])
        raise HTTPException(status_code=e.response.status_code, detail=f"LLM API Error: {e.response.text[:100]}")
    except httpx.RequestError as e:
        logger.error("LLM request failed: %s", e)
        raise HTTPException(status_code=502, detail=f"LLM request failed: {str(e)}")


def _extract_json_block(text: str) -> dict[str, Any] | None:
    """Try multiple strategies to extract a JSON object containing chart/bloch data."""
    # Strategy 1: last line is raw JSON
    lines = text.strip().splitlines()
    if lines:
        last = lines[-1].strip()
        if last.startswith("{") and last.endswith("}"):
            try:
                return json.loads(last)
            except json.JSONDecodeError:
                pass

    # Strategy 2: JSON inside ```json ... ``` code fence
    fence_match = re.search(r"```(?:json)?\s*\n?(\{[\s\S]*?\})\s*```", text)
    if fence_match:
        try:
            return json.loads(fence_match.group(1))
        except json.JSONDecodeError:
            pass

    # Strategy 3: last JSON object containing "chart" or "bloch" key
    for m in reversed(list(re.finditer(r'\{[^{}]*(?:"chart"|"bloch")[^{}]*\}', text))):
        try:
            return json.loads(m.group(0))
        except json.JSONDecodeError:
            continue

    # Strategy 4: greedy search for nested JSON with chart/bloch
    m = re.search(r'(\{[\s\S]*"(?:chart|bloch)"[\s\S]*\})\s*$', text)
    if m:
        raw = m.group(1)
        # Try progressively shorter substrings to find valid JSON
        for end in range(len(raw), 0, -1):
            if raw[end - 1] == "}":
                try:
                    return json.loads(raw[:end])
                except json.JSONDecodeError:
                    continue
    return None


def _parse_chat_tail_json(text: str) -> tuple[str, dict[str, Any] | None, dict[str, float] | None]:
    chart, bloch = None, None
    if not text or not text.strip():
        return text or "", None, None

    obj = _extract_json_block(text)
    if obj:
        chart = obj.get("chart")
        bloch = obj.get("bloch")
        # Remove the JSON from the reply text
        # Try removing last line first
        lines = text.strip().splitlines()
        last = lines[-1].strip()
        if last.startswith("{"):
            reply = "\n".join(lines[:-1]).strip()
        else:
            # Remove code-fenced JSON
            reply = re.sub(r"```(?:json)?\s*\n?\{[\s\S]*?\}\s*```", "", text).strip()
            if reply == text.strip():
                # Remove inline JSON at end
                reply = re.sub(r'\{[\s\S]*"(?:chart|bloch)"[\s\S]*\}\s*$', "", text).strip()
        if not reply:
            reply = text
        if bloch and isinstance(bloch, dict):
            bloch = {
                "theta": float(bloch.get("theta", 0)),
                "phi": float(bloch.get("phi", 0)),
            }
        return reply, chart, bloch

    return text, None, None


def _mock_chat(user_text: str) -> ChatResponse:
    u = user_text.lower()
    chart, bloch = None, None
    if any(k in u for k in ("bloch", "qubit", "|0", "|1", "+⟩")):
        reply = (
            "For a single qubit |ψ⟩ = α|0⟩ + β|1⟩, measurement probabilities are P(0)=|α|² and P(1)=|β|². "
            "On the Bloch sphere, the state is a unit vector with polar angle θ from the north pole and azimuth φ around Z. "
            "A Hadamard sends |0⟩ to |+⟩ with θ=π/2, φ=0."
        )
        chart = {"labels": ["|0⟩", "|1⟩"], "values": [0.5, 0.5]}
        bloch = {"theta": math.pi / 2, "phi": 0.0}
    elif any(k in u for k in ("vqe", "variational", "eigensolver")):
        reply = (
            "VQE minimizes ⟨ψ(θ)|H|ψ(θ)⟩ using a classical loop: the quantum device evaluates the energy for parameters θ, "
            "then a classical optimizer updates θ — ideal for small noisy machines and chemistry-style Hamiltonians."
        )
    elif any(k in u for k in ("kernel", "qsvm", "quantum machine learning")):
        reply = (
            "Quantum kernels map classical data x into quantum Hilbert space via a feature map U(x)|0…0⟩; "
            "inner products estimated on hardware can be harder for classical models to simulate — "
            "but train carefully: data encoding depth and barren plateaus matter."
        )
    else:
        reply = (
            "I can help with quantum ML topics: VQE/QAOA, quantum kernels, data re-uploading, barren plateaus, "
            "and noise-aware training. Set GROQ_API_KEY (optional GROQ_MODEL) or OPENAI_API_KEY on the server; "
            "otherwise you get this offline tutor. What concept should we unpack?"
        )
    return ChatResponse(reply=reply, chart=chart, bloch=bloch)


async def _llm_playground(prompt: str, user_api_key: str | None = None) -> PlaygroundResponse | None:
    sys = (
        "You are a quantum circuit design assistant. Given a user prompt, design a quantum circuit and return ONLY valid JSON (no markdown, no explanation outside JSON).\n"
        "\n"
        "JSON schema:\n"
        "{\n"
        '  "title": "string — short descriptive title",\n'
        '  "explanation": "string — 2-4 sentence educational explanation of what the circuit does and why",\n'
        '  "legend": ["string array — one entry per gate explaining its role"],\n'
        '  "n_qubits": "integer 1-4",\n'
        '  "gates": [\n'
        '    {"op": "H|X|Y|Z|RX|RY|RZ|CX|CZ", "targets": [int], "params": [float]}\n'
        "  ]\n"
        "}\n"
        "\n"
        "Rules:\n"
        "- Use valid qubit indices (0 to n_qubits-1)\n"
        "- CX and CZ require exactly 2 targets: [control, target]\n"
        "- RX, RY, RZ require exactly 1 param (angle in radians, use multiples of pi like 1.5708 for pi/2, 3.14159 for pi, 0.7854 for pi/4)\n"
        "- H, X, Y, Z require exactly 1 target and no params\n"
        "- Create educational, meaningful circuits that demonstrate quantum concepts\n"
        "- For unknown prompts, create something creative and interesting\n"
        "- Always provide a thorough explanation and legend\n"
    )
    raw = await _call_openai_compatible(
        [{"role": "system", "content": sys}, {"role": "user", "content": prompt}],
        json_mode=True,
        user_api_key=user_api_key,
    )
    if not raw:
        return None
    try:
        obj = json.loads(raw)
        n = int(obj.get("n_qubits", 2))
        n = max(1, min(4, n))
        gates_raw = obj.get("gates") or []
        gates: list[GateOp] = []
        allowed = {"H", "X", "Y", "Z", "RX", "RY", "RZ", "CX", "CZ", "I"}
        for g in gates_raw:
            op = str(g.get("op", "I")).upper()
            if op not in allowed:
                op = "I"
            gates.append(
                GateOp(
                    op=op,  # type: ignore[arg-type]
                    targets=list(g.get("targets", [])),
                    params=[float(x) for x in (g.get("params") or [])],
                )
            )
        ascii_c = circuit_ascii(n, gates)
        _, summary, _ = statevector_summary(n, gates)
        return PlaygroundResponse(
            title=str(obj.get("title", "Circuit")),
            explanation=str(obj.get("explanation", "")),
            legend=[str(x) for x in (obj.get("legend") or [])],
            n_qubits=n,
            gates=gates,
            ascii_circuit=ascii_c,
            state_summary=summary,
        )
    except (json.JSONDecodeError, KeyError, ValueError, TypeError, RuntimeError) as e:
        logger.warning("LLM playground JSON or circuit build failed: %s", e)
        return None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.post("/chat", response_model=ChatResponse)
async def ai_chat(body: ChatRequest, authorization: str | None = Header(None)) -> ChatResponse:
    user_api_key = authorization.replace("Bearer ", "") if authorization and authorization.startswith("Bearer ") else None
    if not body.messages:
        raise HTTPException(400, "messages required")
    last_user = next((m.content for m in reversed(body.messages) if m.role == "user"), "")
    msgs = [{"role": "system", "content": SYSTEM_CHAT}] + [m.model_dump() for m in body.messages[-12:]]
    try:
        raw = await _call_openai_compatible(msgs, user_api_key=user_api_key)
    except HTTPException as e:
        raise e
    except httpx.HTTPError as e:
        logger.exception("LLM HTTP error")
        raise HTTPException(502, f"LLM Network Error: {str(e)}")
    except Exception as e:
        logger.exception("Unexpected LLM error")
        raise HTTPException(500, f"Unexpected Error: {str(e)}")

    if not raw:
        raise HTTPException(500, "LLM returned empty response")

    reply, chart, bloch = _parse_chat_tail_json(raw)
    if not reply:
        reply = raw
    logger.info("AI chat OK — chart=%s bloch=%s", bool(chart), bool(bloch))
    return ChatResponse(reply=reply, chart=chart, bloch=bloch)


@router.post("/playground", response_model=PlaygroundResponse)
async def ai_playground(body: PlaygroundRequest, authorization: str | None = Header(None)) -> PlaygroundResponse:
    user_api_key = authorization.replace("Bearer ", "") if authorization and authorization.startswith("Bearer ") else None
    try:
        llm = await _llm_playground(body.prompt, user_api_key=user_api_key)
        if llm:
            logger.info("Playground LLM generated: %s (%d gates)", llm.title, len(llm.gates))
            return llm
        else:
            raise HTTPException(500, "LLM returned empty response")
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.warning("Playground LLM failed (%s)", e)
        raise HTTPException(500, f"Playground error: {str(e)}")


@router.post("/simulate", response_model=SimulateResponse)
def ai_simulate(body: SimulateRequest) -> SimulateResponse:
    try:
        probs, summary, bloch = statevector_summary(body.n_qubits, body.gates)
        return SimulateResponse(probabilities=probs, bloch=bloch, state_summary=summary)
    except Exception as e:
        logger.exception("simulate failed")
        raise HTTPException(400, str(e)) from e
