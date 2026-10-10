#!/usr/bin/env python3
"""Run an OpenAI integration while reusing persisted API responses after a retry."""

from __future__ import annotations

import base64
import copy
import json
import os
import re
import sys
from pathlib import Path

import integrate_dish as base

ROOT = Path(__file__).resolve().parents[1]
CHECKPOINT_DIR = ROOT / ".courses-openai-checkpoint"
ORIGINAL_API_JSON = base.api_json
CALL_INDEX = 0


def endpoint_label(url: str) -> str:
    if "/images/generations" in url:
        return "image"
    if "/responses" in url:
        return "response"
    label = re.sub(r"[^a-z0-9]+", "-", url.lower()).strip("-")
    return (label[-32:] or "api")


def checkpoint_key() -> str:
    return str(os.getenv("COURSES_CHECKPOINT_KEY") or "").strip()


def checkpoint_paths(index: int, label: str) -> tuple[Path, Path]:
    stem = f"{index:02d}-{label}"
    return CHECKPOINT_DIR / f"{stem}.json", CHECKPOINT_DIR / f"{stem}.bin"


def restore_cached_response(path: Path, binary_path: Path, key: str, label: str) -> dict:
    try:
        wrapper = json.loads(path.read_text(encoding="utf-8"))
        if wrapper.get("checkpoint_key") != key or wrapper.get("endpoint") != label:
            raise ValueError("identité de checkpoint différente")
        response = wrapper.get("response")
        if not isinstance(response, dict):
            raise ValueError("réponse absente")
        binary_file = str(wrapper.get("binary_file") or "").strip()
        if binary_file:
            expected = CHECKPOINT_DIR / Path(binary_file).name
            if expected != binary_path or not expected.is_file():
                raise ValueError("binaire image absent")
            encoded = base64.b64encode(expected.read_bytes()).decode("ascii")
            data = response.get("data")
            if not isinstance(data, list) or not data or not isinstance(data[0], dict):
                raise ValueError("structure image invalide")
            data[0]["b64_json"] = encoded
        return response
    except Exception as error:
        raise RuntimeError(
            "Checkpoint OpenAI illisible; aucun nouvel appel OpenAI n'a été lancé"
        ) from error


def save_cached_response(path: Path, binary_path: Path, key: str, label: str, response: dict) -> None:
    CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)
    stored = copy.deepcopy(response)
    binary_file = ""
    if label == "image":
        data = stored.get("data")
        encoded = ((data or [{}])[0] or {}).get("b64_json") if isinstance(data, list) else None
        if encoded:
            try:
                binary = base64.b64decode(encoded, validate=True)
            except Exception as error:
                raise RuntimeError("Réponse image OpenAI impossible à mettre en checkpoint") from error
            binary_path.write_bytes(binary)
            data[0]["b64_json"] = ""
            binary_file = binary_path.name
    wrapper = {
        "checkpoint_key": key,
        "endpoint": label,
        "binary_file": binary_file,
        "response": stored,
    }
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(wrapper, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    os.replace(temporary, path)


def cached_api_json(url: str, payload: dict, api_key: str, timeout: int = 180) -> dict:
    global CALL_INDEX
    key = checkpoint_key()
    if not key:
        return ORIGINAL_API_JSON(url, payload, api_key, timeout=timeout)

    CALL_INDEX += 1
    label = endpoint_label(url)
    json_path, binary_path = checkpoint_paths(CALL_INDEX, label)
    if json_path.is_file():
        response = restore_cached_response(json_path, binary_path, key, label)
        print(f"Checkpoint OpenAI réutilisé: appel {CALL_INDEX} ({label})")
        return response

    response = ORIGINAL_API_JSON(url, payload, api_key, timeout=timeout)
    save_cached_response(json_path, binary_path, key, label, response)
    print(f"Checkpoint OpenAI enregistré: appel {CALL_INDEX} ({label})")
    return response


def run(item_type: str) -> None:
    if item_type not in {"product", "dish"}:
        raise SystemExit("Type d'intégration OpenAI attendu: product ou dish")
    if not checkpoint_key():
        raise SystemExit("Clé de checkpoint OpenAI manquante")

    base.api_json = cached_api_json
    if item_type == "product":
        import integrate_product_openai as product

        product.base.api_json = cached_api_json
        product.main()
        return

    import integrate_dish_openai as dish

    dish.base.api_json = cached_api_json
    dish.require_web_push()
    dish.base.main()


if __name__ == "__main__":
    try:
        run((sys.argv[1] if len(sys.argv) > 1 else "").strip().lower())
    except SystemExit:
        raise
    except Exception as error:
        if not base.RESULT_PATH.exists():
            base.RESULT_PATH.write_text(
                json.dumps({"ok": False, "error": str(error)}, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
        print(str(error), file=sys.stderr)
        sys.exit(1)
