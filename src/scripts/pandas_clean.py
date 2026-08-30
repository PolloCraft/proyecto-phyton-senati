import pandas as pd
import numpy as np
import re, io, json

df = pd.read_csv(io.StringIO(csv_content))
df.columns = [str(c).strip() for c in df.columns]

df_original = df.copy()
originales = json.loads(df_original.to_json(orient='records'))

text_errors = []
type_mismatches = []
date_issues = []
outliers = []
inconsistent_categories = []
unnecessary_columns = []
incorrect_rows = []

missing_per_column = {}
for col in df.columns:
    count = int(df[col].isna().sum()) + int((df[col].astype(str).str.strip() == '').sum())
    missing_per_column[col] = count

vacios_iniciales = int(df.isna().sum().sum())
dup_count = int(df.duplicated().sum())

date_pattern = r'^\d{4}[/-]\d{2}[/-]\d{2}$'
numeric_cols_inferred = []

# === ANALISIS DE CALIDAD DE DATOS POR COLUMNA ===
column_quality = {}

for col in df.columns:
    non_null = df[col].dropna().astype(str).str.strip()
    non_empty = non_null[non_null != '']
    total_rows = len(df)
    non_null_count = len(non_empty)
    missing_count = total_rows - non_null_count
    missing_pct = missing_count / total_rows if total_rows > 0 else 0
    
    if non_null_count == 0:
        column_quality[col] = {
            'type': 'empty',
            'missing_pct': 1.0,
            'non_null_count': 0,
            'unique_count': 0,
            'action': 'drop'
        }
        unnecessary_columns.append(col)
        continue

    # Check if numeric-like
    coerced = pd.to_numeric(non_empty.str.replace(',', '.'), errors='coerce')
    valid_ratio = coerced.notna().sum() / len(non_empty) if len(non_empty) > 0 else 0
    is_numeric = valid_ratio > 0.8

    unique_count = non_empty.nunique()
    unique_pct = unique_count / non_null_count if non_null_count > 0 else 0

    col_info = {
        'missing_pct': missing_pct,
        'non_null_count': non_null_count,
        'unique_count': unique_count,
        'unique_pct': unique_pct,
        'is_numeric': is_numeric,
        'valid_ratio': valid_ratio
    }

    if is_numeric:
        numeric_cols_inferred.append(col)
        col_info['type'] = 'numeric'
        
        # Detect text errors in numeric columns
        for idx, val in non_null.items():
            if val == '' or val == 'nan' or val == 'None':
                continue
            try:
                float(val.replace(',', '.'))
            except (ValueError, AttributeError):
                text_errors.append({"column": col, "row_index": int(idx), "value": val, "issue": "Non-numeric value in numeric column"})

        # Detect type mismatches (mixed actual types)
        if valid_ratio < 1.0:
            samples = non_null[coerced.isna()].unique().tolist()[:3]
            type_mismatches.append({"column": col, "count": int((coerced.isna()).sum()), "sample_values": samples})

        # Detect outliers via IQR
        s_num = coerced.dropna()
        if len(s_num) >= 4:
            q1 = s_num.quantile(0.25)
            q3 = s_num.quantile(0.75)
            iqr = q3 - q1
            if iqr > 0:
                outlier_mask = (s_num < q1 - 1.5 * iqr) | (s_num > q3 + 1.5 * iqr)
                out_count = int(outlier_mask.sum())
                if out_count > 0:
                    outliers.append({"column": col, "count": out_count, "method": "IQR"})
        
        # Decide action for numeric column
        if missing_pct > 0.7:
            col_info['action'] = 'drop_column'  # Too many missing values
        elif missing_pct > 0.3:
            col_info['action'] = 'fill_median'  # Fill with median
        else:
            col_info['action'] = 'fill_mean'  # Fill with mean
            
    else:
        # Text column
        col_info['type'] = 'categorical'
        
        # Detect n/a markers
        na_markers = ['n/a', 'N/A', 'na', 'NA', '-', '--', 'null', 'NULL']
        for idx, val in non_null.items():
            if val in na_markers:
                text_errors.append({"column": col, "row_index": int(idx), "value": val, "issue": "N/A/null marker"})

        # Detect date issues in text columns
        for idx, val in non_null.items():
            if re.match(r'^\d{4}[/-]\d{2}[/-]\d{2}$', str(val)):
                if '/' in str(val):
                    date_issues.append({"row_index": int(idx), "column": col, "value": val, "issue": "Date uses / instead of -"})

        # Detect inconsistent categories (case inconsistencies)
        if non_null_count > 0 and non_null_count < 500:
            vals = non_empty.unique()
            lower_map = {}
            for v in vals:
                low = v.lower().strip()
                if low not in lower_map:
                    lower_map[low] = set()
                lower_map[low].add(v)
            for low, variants in lower_map.items():
                if len(variants) > 1:
                    inconsistent_categories.append({"column": col, "values": list(variants)})
        
        # Decide action for categorical column
        if missing_pct > 0.7:
            col_info['action'] = 'drop_column'
        elif unique_pct > 0.95 and non_null_count > 50:
            # High cardinality - likely ID column
            col_info['action'] = 'drop_column'
            unnecessary_columns.append(col)
        elif missing_pct > 0.3:
            col_info['action'] = 'fill_mode'
        else:
            col_info['action'] = 'fill_mode'

# Detect date columns (by column name heuristic)
for col in df.columns:
    col_lower = col.lower().strip()
    date_keywords = ['fecha', 'date', 'dia', 'day', 'mes', 'month', 'ano', 'year', 'año']
    if any(k in col_lower for k in date_keywords):
        for idx, val in df[col].dropna().items():
            sval = str(val).strip()
            if sval == '':
                continue
            if '/' in sval and re.match(r'^\d{4}/\d{2}/\d{2}$', sval):
                date_issues.append({"row_index": int(idx), "column": col, "value": sval, "issue": "Date uses / separator, standardizing to -"})

# Detect unnecessary columns (constant or near-constant)
for col in df.columns:
    vals = df[col].dropna().astype(str).str.strip()
    non_empty = vals[vals != '']
    if len(non_empty) == 0:
        if col not in unnecessary_columns:
            unnecessary_columns.append(col)
    elif non_empty.nunique() == 1 and len(non_empty) > 1:
        if col not in unnecessary_columns:
            unnecessary_columns.append(col)

# Detect incorrect rows (>50% missing)
threshold = len(df.columns) * 0.5
for idx, row in df.iterrows():
    missing_count = sum(1 for val in row if pd.isna(val) or str(val).strip() in ['', 'nan', 'None'])
    if missing_count > threshold:
        incorrect_rows.append({"row_index": int(idx), "reason": f"More than 50% columns missing ({missing_count}/{len(df.columns)})", "missing_count": int(missing_count)})

# === LIMPIEZA INTELIGENTE BASADA EN CALIDAD ===
# Remove duplicates only, keep all rows
df = df.drop_duplicates().reset_index(drop=True)

# Apply column-specific cleaning based on quality analysis
for col in df.columns:
    if col not in column_quality:
        continue
    
    col_info = column_quality[col]
    action = col_info.get('action', 'keep')
    col_lower = col.lower().strip()
    date_keywords = ['fecha', 'date', 'dia', 'day', 'mes', 'month', 'ano', 'year', 'año']
    is_date_col = any(k in col_lower for k in date_keywords)
    
    if action == 'drop_column':
        if col in df.columns:
            df = df.drop(columns=[col])
        continue
    
    if col_info['type'] == 'numeric' or col in numeric_cols_inferred:
        s_str = df[col].astype(str).str.replace(',', '.').str.strip()
        s_num = pd.to_numeric(s_str, errors='coerce')
        df[col] = s_num.fillna(0.0).astype(float)
    else:
        s_str = df[col].astype(str).str.strip()
        s_str = s_str.replace({'nan': None, 'None': None, 'NoneType': None, '': None, '<NA>': None, 'NaN': None})
        if is_date_col:
            for idx, val in s_str.items():
                if val is not None and '/' in str(val) and re.match(r'^\d{4}/\d{2}/\d{2}$', str(val)):
                    s_str.at[idx] = str(val).replace('/', '-')
        non_null_vals = s_str.dropna()
        unique_vals = non_null_vals.unique()
        if len(unique_vals) > 0 and len(unique_vals) <= 20 and not is_date_col:
            lower_unique = [v.lower() for v in unique_vals]
            if len(set(lower_unique)) < len(unique_vals):
                s_str = s_str.apply(lambda x: x.title() if x is not None else x)
        fill_mode = non_null_vals.mode()
        if len(fill_mode) > 0:
            s_str = s_str.fillna(fill_mode.iloc[0])
        else:
            s_str = s_str.fillna("Sin dato")
        df[col] = s_str

vacios_finales = int(df.isna().sum().sum())

# Final sweep: fill any remaining nulls with 0 for numbers, "Sin dato" for text
for col in df.columns:
    if df[col].isna().any():
        if col in numeric_cols_inferred:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0).astype(float)
        else:
            mode_val = df[col].dropna().mode()
            if len(mode_val) > 0:
                df[col] = df[col].fillna(mode_val.iloc[0])
            else:
                df[col] = df[col].fillna("Sin dato")
col_numericas = len([c for c in df.columns if c in numeric_cols_inferred])
col_texto = len(df.columns) - col_numericas

sort_col = df.columns[0] if len(df.columns) > 0 else None
if sort_col:
    df = df.sort_values(by=sort_col, ascending=True).reset_index(drop=True)

# Keep all columns for cleaned data (not just numeric)
df_limpio = df.copy()

cleaning_summary = {
    "duplicates_removed": dup_count,
    "rows_removed_by_threshold": len(incorrect_rows),
    "columns_dropped": len(unnecessary_columns),
    "numeric_columns_converted": col_numericas,
    "text_columns": col_texto,
    "null_markers_found": len([e for e in text_errors if "N/A/null marker" in e["issue"]]),
    "date_formats_normalized": len(date_issues),
    "columns_actions": {k: v.get('action', 'keep') for k, v in column_quality.items()}
}

_output = json.dumps({
    "total_filas": int(len(df_limpio)),
    "total_filas_original": int(len(df_original)),
    "vacios_rellenados": int(vacios_iniciales - vacios_finales),
    "col_numericas": col_numericas,
    "col_texto": col_texto,
    "columnas": list(df_limpio.columns),
    "columnas_originales": list(df_original.columns),
    "originales": originales,
    "limpios": json.loads(df_limpio.to_json(orient='records')),
    "duplicate_rows": dup_count,
    "missing_per_column": missing_per_column,
    "text_errors": text_errors,
    "type_mismatches": type_mismatches,
    "date_issues": date_issues,
    "outliers": outliers,
    "inconsistent_categories": inconsistent_categories,
    "unnecessary_columns": unnecessary_columns,
    "incorrect_rows": incorrect_rows,
    "cleaning_summary": cleaning_summary,
    "column_quality": column_quality
})
_output
