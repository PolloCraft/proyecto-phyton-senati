import pandas as pd
import numpy as np
import json
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings('ignore')

df = pd.read_csv(io.StringIO(csv_content))
df.columns = [str(c).strip() for c in df.columns]
for c in df.columns:
    s_str = df[c].astype(str).str.replace(',', '.').str.strip()
    s_num = pd.to_numeric(s_str, errors='coerce')
    if s_num.notna().sum() > 0:
        df[c] = s_num.fillna(0.0)
    else:
        df[c] = s_str.replace({'nan': '', 'None': '', '': ''})

col = selected_col
data = pd.to_numeric(df[col], errors='coerce').dropna().values
tipo = tipo_grafico

label_col = None
for c in df.columns:
    if c != col and df[c].dtype == object:
        label_col = c
        break

if label_col:
    raw_labels = [str(x)[:15] for x in df[label_col].astype(str).values[:len(data)]]
else:
    raw_labels = [str(i+1) for i in range(len(data))]

labels = raw_labels

plt.rcParams.update({'font.size': 11, 'axes.titlesize': 15, 'axes.labelsize': 12, 'xtick.labelsize': 9, 'ytick.labelsize': 11})
fig, ax = plt.subplots(figsize=(12, 6))
fig.patch.set_facecolor('#f8f9fa')
ax.set_facecolor('#ffffff')
mean_val = np.mean(data)
median_val = np.median(data)
x_label = label_col if label_col else 'Indice'

if tipo == "barras":
    bars = ax.bar(range(len(data)), data, color='#6366f1', edgecolor='#4338ca', linewidth=0.5, width=0.7)
    ax.set_xticks(range(len(data)))
    ax.set_xticklabels(labels, rotation=45, ha='right')
    ax.set_title(col + ' - Barras', fontweight='bold', pad=12)
    ax.set_xlabel(x_label)
    ax.set_ylabel('Valor')
    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., h, '{:.1f}'.format(h), ha='center', va='bottom', fontsize=8)

elif tipo == "lineas":
    ax.plot(range(len(data)), data, marker='o', color='#2563eb', linewidth=2, markersize=5, label=col)
    ax.axhline(mean_val, color='#ef4444', linestyle='--', linewidth=1.5, label='Media: ' + '{:.2f}'.format(mean_val))
    ax.axhline(median_val, color='#10b981', linestyle=':', linewidth=1.5, label='Mediana: ' + '{:.2f}'.format(median_val))
    ax.set_xticks(range(len(data)))
    ax.set_xticklabels(labels, rotation=45, ha='right')
    ax.set_title(col + ' - Lineas', fontweight='bold', pad=12)
    ax.set_xlabel(x_label)
    ax.set_ylabel('Valor')
    ax.legend(loc='best', fontsize=10)
    ax.grid(True, linestyle=':', alpha=0.4)

elif tipo == "dispersion":
    sc = ax.scatter(range(len(data)), data, c=data, cmap='viridis', s=60, edgecolors='white', linewidth=0.5)
    z = np.polyfit(range(len(data)), data, 1)
    p = np.poly1d(z)
    ax.plot(range(len(data)), p(range(len(data))), "r--", alpha=0.8, linewidth=1.5, label='Tendencia')
    ax.set_xticks(range(len(data)))
    ax.set_xticklabels(labels, rotation=45, ha='right')
    ax.set_title(col + ' - Dispersion', fontweight='bold', pad=12)
    ax.set_xlabel(x_label)
    ax.set_ylabel('Valor')
    ax.legend(fontsize=10)
    plt.colorbar(sc, ax=ax, shrink=0.8)

elif tipo == "circular":
    if label_col:
        cat_labels = [str(x)[:20] for x in df[label_col].astype(str).values[:len(data)]]
        counts = pd.Series(cat_labels).value_counts().head(8)
    else:
        counts = pd.Series([str(v) for v in data]).value_counts().head(8)
    pie_colors = ['#6366f1', '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
    wedges, texts, autotexts = ax.pie(counts.values, labels=counts.index, autopct='%1.1f%%', colors=pie_colors[:len(counts)], startangle=90, pctdistance=0.80, textprops={'fontsize': 10})
    for t in texts:
        t.set_fontsize(10)
    for at in autotexts:
        at.set_fontsize(9)
        at.set_color('white')
        at.set_fontweight('bold')
    ax.set_title(col + ' - Circular', fontweight='bold', pad=12)

plt.tight_layout()
buf = io.BytesIO()
fig.savefig(buf, format='png', dpi=130, bbox_inches='tight', facecolor=fig.get_facecolor())
buf.seek(0)
img_b64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)

_stats = {
    "total": int(len(data)),
    "media": round(float(mean_val), 4),
    "mediana": round(float(median_val), 4),
    "minimo": round(float(np.min(data)), 4),
    "maximo": round(float(np.max(data)), 4),
    "columna": col,
    "etiquetas": (label_col or 'Indice'),
}
_output = json.dumps({"grafico": "data:image/png;base64," + img_b64, "stats": _stats})
_output
