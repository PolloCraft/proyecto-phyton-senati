import numpy as np
import json

data = json.loads(data_json)
headers = json.loads(headers_json)
op = operation

def safe_float(v):
    if v is None: return 0.0
    s = str(v).strip().replace(',', '.')
    if s in ('', 'None', 'NaN', 'nan', 'null', 'Sin dato'): return 0.0
    try: return float(s)
    except: return 0.0

vec_a = np.array([safe_float(r.get(col_a, 0)) for r in data], dtype=float)
_output = ""

if op == "create":
    _output = json.dumps({"vector": vec_a.tolist(), "columna": col_a, "dimension": int(vec_a.size), "shape": str(vec_a.shape), "dtype": str(vec_a.dtype)})

elif op == "describe":
    q1, q3 = np.percentile(vec_a, [25, 75])
    _output = json.dumps({
        "columna": col_a,
        "datos": vec_a.tolist(),
        "media": round(float(np.mean(vec_a)), 4),
        "mediana": round(float(np.median(vec_a)), 4),
        "moda": round(float(np.bincount(vec_a.astype(int)).argmax()), 4),
        "varianza": round(float(np.var(vec_a)), 4),
        "desv_est": round(float(np.std(vec_a)), 4),
        "rango": round(float(np.ptp(vec_a)), 4),
        "iqr": round(float(q3 - q1), 4),
        "minimo": round(float(np.min(vec_a)), 4),
        "q1": round(float(q1), 4),
        "q3": round(float(q3), 4),
        "maximo": round(float(np.max(vec_a)), 4)
    })

elif op == "transform":
    t = transform_type
    k = float(scalar_val)
    if t == "normalize":
        r = (vec_a - vec_a.min()) / (vec_a.max() - vec_a.min()) if vec_a.max() != vec_a.min() else vec_a * 0
        formula = "(x-min)/(max-min)"
    elif t == "standardize":
        r = (vec_a - vec_a.mean()) / vec_a.std() if vec_a.std() != 0 else vec_a * 0
        formula = "(x-mean)/std"
    elif t == "add": r = vec_a + k; formula = "x+" + str(k)
    elif t == "subtract": r = vec_a - k; formula = "x-" + str(k)
    elif t == "multiply": r = vec_a * k; formula = "x*" + str(k)
    elif t == "divide": r = vec_a / k if k != 0 else vec_a * np.nan; formula = "x/" + str(k)
    elif t == "square": r = vec_a ** 2; formula = "x^2"
    elif t == "sqrt": r = np.sqrt(np.maximum(vec_a, 0)); formula = "sqrt(x)"
    elif t == "absolute": r = np.abs(vec_a); formula = "|x|"
    _output = json.dumps({"original": vec_a.tolist(), "resultado": r.tolist(), "formula": formula})

elif op == "matrix":
    cols = json.loads(matrix_cols)
    matrix_data = {}
    for c in cols:
        matrix_data[c] = [safe_float(r.get(c, 0)) for r in data]
    mat = np.array([matrix_data[c] for c in cols]).T
    mop = matrix_op
    if mop == "describe":
        stats = []
        for i, c in enumerate(cols):
            col_data = mat[:, i]
            stats.append({"col": c, "n": int(len(col_data)), "media": round(float(np.mean(col_data)), 4), "min": round(float(np.min(col_data)), 4), "max": round(float(np.max(col_data)), 4)})
        _output = json.dumps({"op": "describe", "stats": stats, "shape": str(mat.shape)})
    elif mop == "transpose":
        t = mat.T
        _output = json.dumps({"op": "transpose", "original_shape": str(mat.shape), "transpuesta_shape": str(t.shape)})
    elif mop == "rowSum":
        _output = json.dumps({"op": "rowSum", "suma_filas": np.sum(mat, axis=1).tolist()})
    elif mop == "columnSum":
        _output = json.dumps({"op": "columnSum", "suma_col": {cols[i]: round(float(np.sum(mat[:, i])), 4) for i in range(len(cols))}})
    elif mop == "dot":
        dp = float(np.dot(mat[:, 0], mat[:, 1])) if mat.shape[1] >= 2 else 0
        _output = json.dumps({"op": "dot", "a": mat[:, 0].tolist(), "b": mat[:, 1].tolist(), "producto_punto": dp})

elif op == "operator":
    vec_b = np.array([safe_float(r.get(col_b, 0)) for r in data], dtype=float)
    if len(vec_a) != len(vec_b):
        _output = json.dumps({"error": "Longitudes diferentes: A=" + str(len(vec_a)) + ", B=" + str(len(vec_b))})
    else:
        sym = operator_type
        if sym == "add": r = vec_a + vec_b
        elif sym == "subtract": r = vec_a - vec_b
        elif sym == "multiply": r = vec_a * vec_b
        elif sym == "divide": r = vec_a / np.where(vec_b == 0, np.nan, vec_b)
        elif sym == "power": r = vec_a ** vec_b
        elif sym == "modulo": r = vec_a % np.where(vec_b == 0, np.nan, vec_b)
        _output = json.dumps({"a": vec_a.tolist(), "b": vec_b.tolist(), "resultado": r.tolist(), "simbolo": sym, "col_a": col_a, "col_b": col_b})
_output
