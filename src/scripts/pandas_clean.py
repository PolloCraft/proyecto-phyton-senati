import pandas as pd
import numpy as np
import io, json

df = pd.read_csv(io.StringIO(csv_content))
df.columns = [str(c).strip() for c in df.columns]

df_original = df.copy()
originales = json.loads(df_original.to_json(orient='records'))

vacios_iniciales = int(df.isna().sum().sum())
col_numericas = 0
col_texto = 0

for col in df.columns:
    s_str = df[col].astype(str).str.replace(',', '.').str.strip()
    s_num = pd.to_numeric(s_str, errors='coerce')
    if s_num.notna().sum() > 0:
        df[col] = s_num.fillna(0.0)
        col_numericas += 1
    else:
        df[col] = s_str.replace({'nan': '', 'None': '', '': ''})
        col_texto += 1

sort_col = df.columns[0]
df = df.sort_values(by=sort_col, ascending=True).reset_index(drop=True)

_output = json.dumps({
    "total_filas": int(len(df)),
    "vacios_rellenados": vacios_iniciales,
    "col_numericas": col_numericas,
    "col_texto": col_texto,
    "columnas": list(df.columns),
    "originales": originales,
    "limpios": json.loads(df.to_json(orient='records'))
})
_output
