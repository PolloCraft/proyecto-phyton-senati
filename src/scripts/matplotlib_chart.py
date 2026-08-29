import pandas as pd
import numpy as np
import json
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager
import warnings
warnings.filterwarnings('ignore')

from datetime import datetime

# Professional color palette
PALETTE = ['#1e3a5f', '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0891b2', '#65a30d', '#ea580c']
PALETTE_LIGHT = ['#dbeafe', '#bfdbfe', '#a7f3d0', '#fef3c7', '#fee2e2', '#f3e8ff', '#fce7f3', '#e0f2fe', '#dcfce7', '#ffedd5']

def create_professional_style():
    """Set professional matplotlib style"""
    plt.rcParams.update({
        'font.size': 10,
        'axes.titlesize': 14,
        'axes.labelsize': 11,
        'xtick.labelsize': 9,
        'ytick.labelsize': 9,
        'axes.grid': True,
        'grid.alpha': 0.25,
        'grid.linestyle': ':',
        'grid.linewidth': 0.8,
        'figure.facecolor': '#ffffff',
        'axes.facecolor': '#ffffff',
        'axes.edgecolor': '#e2e8f0',
        'axes.linewidth': 1.2,
        'axes.spines.top': False,
        'axes.spines.right': False,
        'xtick.color': '#64748b',
        'ytick.color': '#64748b',
        'text.color': '#1e293b',
        'axes.titlecolor': '#0f172a',
        'axes.labelcolor': '#334155',
        'legend.frameon': True,
        'legend.framealpha': 0.9,
        'legend.facecolor': '#ffffff',
        'legend.edgecolor': '#e2e8f0',
        'legend.fontsize': 9,
        'savefig.facecolor': '#ffffff',
        'savefig.edgecolor': 'none',
        'savefig.dpi': 150,
        'savefig.bbox': 'tight',
    })

def detect_label_column(df, exclude_col):
    """Find best label column for x-axis"""
    for c in df.columns:
        if c != exclude_col and df[c].dtype == object:
            return c
    return None

def prepare_data(df, col, max_points=100):
    """Prepare numeric data and labels"""
    data_series = pd.to_numeric(df[col], errors='coerce').dropna()
    data = data_series.values
    
    if len(data) > max_points:
        # Sample data for visualization if too many points
        indices = np.linspace(0, len(data) - 1, max_points, dtype=int)
        data = data[indices]
    
    label_col = detect_label_column(df, col)
    if label_col:
        raw_labels = df[label_col].astype(str).values
        if len(raw_labels) > max_points:
            raw_labels = raw_labels[indices]
        labels = [str(x)[:20] for x in raw_labels[:len(data)]]
    else:
        labels = [str(i+1) for i in range(len(data))]
    
    return data, labels, label_col

def create_bar_chart(ax, data, labels, col, x_label, palette):
    """Create professional bar chart"""
    n = len(data)
    x = np.arange(n)
    colors = [palette[i % len(palette)] for i in range(n)]
    bars = ax.bar(x, data, color=colors, edgecolor='#1e3a5f', linewidth=0.8, width=0.7)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=45, ha='right', fontsize=max(7, 10 - n // 10))
    ax.set_title(f'{col} - Distribución (Barras)', fontweight='bold', pad=14, fontsize=14)
    ax.set_xlabel(x_label, fontsize=11)
    ax.set_ylabel('Valor', fontsize=11)
    
    # Add value labels on bars if not too many
    if n <= 20:
        for bar in bars:
            h = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., h + h*0.01, f'{h:.1f}', 
                    ha='center', va='bottom', fontsize=8, fontweight=500, color='#334155')
    
    # Add statistics lines
    mean_val = np.mean(data)
    median_val = np.median(data)
    ax.axhline(mean_val, color='#dc2626', linestyle='--', linewidth=1.5, alpha=0.8, label=f'Media: {mean_val:.2f}')
    ax.axhline(median_val, color='#059669', linestyle=':', linewidth=1.5, alpha=0.8, label=f'Mediana: {median_val:.2f}')
    ax.legend(loc='upper right', fontsize=9)
    
    return {'mean': mean_val, 'median': median_val}

def create_line_chart(ax, data, labels, col, x_label, palette):
    """Create professional line chart with trend"""
    n = len(data)
    x = np.arange(n)
    
    # Main line
    ax.plot(x, data, marker='o', color=palette[1], linewidth=2.5, markersize=5, 
            label=col, markerfacecolor='white', markeredgewidth=2, markeredgecolor=palette[1])
    
    # Fill area under curve
    ax.fill_between(x, data, alpha=0.1, color=palette[1])
    
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=45, ha='right', fontsize=max(7, 10 - n // 15))
    ax.set_title(f'{col} - Tendencia (Líneas)', fontweight='bold', pad=14, fontsize=14)
    ax.set_xlabel(x_label, fontsize=11)
    ax.set_ylabel('Valor', fontsize=11)
    
    mean_val = np.mean(data)
    median_val = np.median(data)
    ax.axhline(mean_val, color='#dc2626', linestyle='--', linewidth=1.5, alpha=0.8, label=f'Media: {mean_val:.2f}')
    ax.axhline(median_val, color='#059669', linestyle=':', linewidth=1.5, alpha=0.8, label=f'Mediana: {median_val:.2f}')
    ax.legend(loc='best', fontsize=9)
    
    return {'mean': mean_val, 'median': median_val}

def create_scatter_chart(ax, data, labels, col, x_label, palette):
    """Create professional scatter plot with trend line"""
    n = len(data)
    x = np.arange(n)
    colors = data
    
    sc = ax.scatter(x, data, c=colors, cmap='viridis', s=60, 
                    edgecolors='white', linewidth=0.8, alpha=0.9)
    
    # Trend line
    if n >= 2:
        z = np.polyfit(x, data, 1)
        p = np.poly1d(z)
        ax.plot(x, p(x), color='#dc2626', linestyle='--', linewidth=2, alpha=0.9, label='Tendencia lineal')
        r_squared = np.corrcoef(x, data)[0, 1] ** 2
        ax.text(0.02, 0.98, f'R² = {r_squared:.3f}', transform=ax.transAxes, 
                fontsize=9, verticalalignment='top', 
                bbox=dict(boxstyle='round', facecolor='white', edgecolor='#e2e8f0', alpha=0.9))
    
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=45, ha='right', fontsize=max(7, 10 - n // 15))
    ax.set_title(f'{col} - Dispersión', fontweight='bold', pad=14, fontsize=14)
    ax.set_xlabel(x_label, fontsize=11)
    ax.set_ylabel('Valor', fontsize=11)
    ax.legend(fontsize=9)
    plt.colorbar(sc, ax=ax, shrink=0.8, label='Valor')
    
    return {'trend_slope': z[0] if n >= 2 else 0, 'r_squared': r_squared if n >= 2 else 0}

def create_pie_chart(ax, data, labels, col, palette):
    """Create professional pie/donut chart"""
    # Use categorical data from label column or bin numeric data
    cat_labels = [str(x) for x in labels]
    counts = pd.Series(cat_labels).value_counts().head(8)
    
    if len(counts) == 0:
        ax.text(0.5, 0.5, 'Sin datos categóricos', ha='center', va='center', fontsize=12)
        return {}
    
    pie_colors = palette[:len(counts)]
    wedges, texts, autotexts = ax.pie(
        counts.values,
        labels=counts.index,
        autopct='%1.1f%%',
        colors=pie_colors,
        startangle=90,
        pctdistance=0.75,
        textprops={'fontsize': 9, 'fontweight': 500},
        wedgeprops=dict(width=0.55, edgecolor='white', linewidth=2)
    )
    
    for t in texts:
        t.set_fontsize(9)
        t.set_color('#334155')
    for at in autotexts:
        at.set_fontsize(9)
        at.set_color('white')
        at.set_fontweight('bold')
    
    ax.set_title(f'{col} - Proporciones (Circular)', fontweight='bold', pad=14, fontsize=14)
    
    return {'categories': len(counts), 'top_category': counts.index[0] if len(counts) > 0 else None}

def gaussian_kde(data, bw_method=None):
    """Simple Gaussian KDE implementation using numpy only"""
    data = np.asarray(data)
    n = len(data)
    if n == 0:
        return None
    
    # Scott's rule for bandwidth
    if bw_method is None:
        bw = n ** (-1/5) * data.std()
    else:
        bw = bw_method
    
    if bw == 0:
        bw = 1e-6
    
    def kde(x):
        x = np.asarray(x)
        # Vectorized Gaussian kernel
        diff = (x[:, None] - data[None, :]) / bw
        return np.exp(-0.5 * diff**2).mean(axis=1) / (bw * np.sqrt(2 * np.pi))
    
    return kde

def create_histogram_chart(ax, data, col, palette):
    """Create professional histogram with KDE (numpy only, no scipy)"""
    n_bins = min(30, max(10, int(np.sqrt(len(data)))))
    
    n, bins, patches = ax.hist(data, bins=n_bins, color=palette[0], edgecolor='white', 
                                linewidth=1.2, alpha=0.85, density=True)
    
    # Add KDE using numpy-only implementation
    try:
        kde_func = gaussian_kde(data)
        if kde_func:
            x_kde = np.linspace(data.min(), data.max(), 200)
            y_kde = kde_func(x_kde)
            ax.plot(x_kde, y_kde, color='#dc2626', linewidth=2.5, label='Densidad (KDE)')
    except:
        pass
    
    mean_val = np.mean(data)
    median_val = np.median(data)
    ax.axvline(mean_val, color='#dc2626', linestyle='--', linewidth=1.5, alpha=0.8, label=f'Media: {mean_val:.2f}')
    ax.axvline(median_val, color='#059669', linestyle=':', linewidth=1.5, alpha=0.8, label=f'Mediana: {median_val:.2f}')
    
    ax.set_title(f'{col} - Histograma con Densidad', fontweight='bold', pad=14, fontsize=14)
    ax.set_xlabel('Valor', fontsize=11)
    ax.set_ylabel('Densidad', fontsize=11)
    ax.legend(fontsize=9)
    
    return {'mean': mean_val, 'median': median_val, 'bins': n_bins}

def create_box_chart(ax, data, col, palette):
    """Create professional box plot"""
    bp = ax.boxplot(data, vert=True, patch_artist=True, widths=0.5,
                    boxprops=dict(facecolor=palette[0], color='#1e3a5f', linewidth=1.5),
                    medianprops=dict(color='#dc2626', linewidth=2.5),
                    whiskerprops=dict(color='#64748b', linewidth=1.5),
                    capprops=dict(color='#64748b', linewidth=1.5),
                    flierprops=dict(marker='o', color='#dc2626', alpha=0.6, markersize=5))
    
    mean_val = np.mean(data)
    ax.scatter([1], [mean_val], color='#dc2626', s=80, zorder=5, marker='D', label=f'Media: {mean_val:.2f}')
    
    ax.set_title(f'{col} - Diagrama de Caja (Box Plot)', fontweight='bold', pad=14, fontsize=14)
    ax.set_ylabel('Valor', fontsize=11)
    ax.set_xticks([1])
    ax.set_xticklabels([col])
    ax.legend(fontsize=9)
    
    q1, q3 = np.percentile(data, [25, 75])
    return {'mean': mean_val, 'median': np.median(data), 'q1': q1, 'q3': q3, 'iqr': q3 - q1}

def create_violin_chart(ax, data, col, palette):
    """Create professional violin plot"""
    parts = ax.violinplot(data, positions=[1], widths=0.7, showmeans=True, 
                          showmedians=True, showextrema=True)
    
    for pc in parts['bodies']:
        pc.set_facecolor(palette[0])
        pc.set_edgecolor('#1e3a5f')
        pc.set_linewidth(1.5)
        pc.set_alpha(0.7)
    
    parts['cmeans'].set_color('#dc2626')
    parts['cmedians'].set_color('#059669')
    parts['cbars'].set_color('#64748b')
    parts['cmins'].set_color('#64748b')
    parts['cmaxes'].set_color('#64748b')
    
    mean_val = np.mean(data)
    ax.scatter([1], [mean_val], color='#dc2626', s=80, zorder=5, marker='D', label=f'Media: {mean_val:.2f}')
    
    ax.set_title(f'{col} - Violín (Distribución)', fontweight='bold', pad=14, fontsize=14)
    ax.set_ylabel('Valor', fontsize=11)
    ax.set_xticks([1])
    ax.set_xticklabels([col])
    ax.legend(fontsize=9)
    
    return {'mean': mean_val, 'median': np.median(data)}

# Main execution
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
tipo = tipo_grafico
multi_chart = multi_chart if 'multi_chart' in globals() else False

if col not in df.columns:
    _output = json.dumps({
        "graficos": {},
        "stats": {"error": f"Columna '{col}' no encontrada"},
        "chart_type": tipo,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    })
else:
    data, labels, label_col = prepare_data(df, col)
    x_label = label_col if label_col else 'Índice'
    
    if len(data) == 0:
        _output = json.dumps({
            "graficos": {},
            "stats": {"error": "No hay datos numéricos válidos"},
            "chart_type": tipo,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        })
    else:
        create_professional_style()
        graficos = {}
        all_stats = {}
        
        chart_types = ["barras", "lineas", "dispersion", "circular", "histograma", "caja", "violin"]
        
        if multi_chart:
            # Generate all chart types - continue even if one fails
            for chart_type in chart_types:
                try:
                    fig, ax = plt.subplots(figsize=(12, 6))
                    fig.patch.set_facecolor('#ffffff')
                    
                    if chart_type == "barras":
                        stats = create_bar_chart(ax, data, labels, col, x_label, PALETTE)
                    elif chart_type == "lineas":
                        stats = create_line_chart(ax, data, labels, col, x_label, PALETTE)
                    elif chart_type == "dispersion":
                        stats = create_scatter_chart(ax, data, labels, col, x_label, PALETTE)
                    elif chart_type == "circular":
                        stats = create_pie_chart(ax, data, labels, col, PALETTE)
                    elif chart_type == "histograma":
                        stats = create_histogram_chart(ax, data, col, PALETTE)
                    elif chart_type == "caja":
                        stats = create_box_chart(ax, data, col, PALETTE)
                    elif chart_type == "violin":
                        stats = create_violin_chart(ax, data, col, PALETTE)
                    
                    plt.tight_layout()
                    buf = io.BytesIO()
                    fig.savefig(buf, format='png', dpi=150, bbox_inches='tight', facecolor='#ffffff')
                    buf.seek(0)
                    img_b64 = base64.b64encode(buf.read()).decode('utf-8')
                    plt.close(fig)
                    
                    graficos[chart_type] = "data:image/png;base64," + img_b64
                    all_stats[chart_type] = stats
                except Exception as e:
                    # Log error but continue with other charts
                    graficos[chart_type] = ""
                    all_stats[chart_type] = {"error": str(e)}
        else:
            # Generate single chart type
            try:
                fig, ax = plt.subplots(figsize=(12, 6))
                fig.patch.set_facecolor('#ffffff')
                
                if tipo == "barras":
                    stats = create_bar_chart(ax, data, labels, col, x_label, PALETTE)
                elif tipo == "lineas":
                    stats = create_line_chart(ax, data, labels, col, x_label, PALETTE)
                elif tipo == "dispersion":
                    stats = create_scatter_chart(ax, data, labels, col, x_label, PALETTE)
                elif tipo == "circular":
                    stats = create_pie_chart(ax, data, labels, col, PALETTE)
                elif tipo == "histograma":
                    stats = create_histogram_chart(ax, data, col, PALETTE)
                elif tipo == "caja":
                    stats = create_box_chart(ax, data, col, PALETTE)
                elif tipo == "violin":
                    stats = create_violin_chart(ax, data, col, PALETTE)
                else:
                    stats = create_bar_chart(ax, data, labels, col, x_label, PALETTE)
                
                plt.tight_layout()
                buf = io.BytesIO()
                fig.savefig(buf, format='png', dpi=150, bbox_inches='tight', facecolor='#ffffff')
                buf.seek(0)
                img_b64 = base64.b64encode(buf.read()).decode('utf-8')
                plt.close(fig)
                
                graficos[tipo] = "data:image/png;base64," + img_b64
                all_stats[tipo] = stats
            except Exception as e:
                graficos[tipo] = ""
                all_stats[tipo] = {"error": str(e)}
        
        # Overall statistics
        mean_val = float(np.mean(data))
        median_val = float(np.median(data))
        std_val = float(np.std(data))
        min_val = float(np.min(data))
        max_val = float(np.max(data))
        q1 = float(np.percentile(data, 25))
        q3 = float(np.percentile(data, 75))
        
        _stats = {
            "total": int(len(data)),
            "media": round(mean_val, 4),
            "mediana": round(median_val, 4),
            "desviacion": round(std_val, 4),
            "minimo": round(min_val, 4),
            "maximo": round(max_val, 4),
            "q1": round(q1, 4),
            "q3": round(q3, 4),
            "iqr": round(q3 - q1, 4),
            "columna": col,
            "etiquetas": (label_col or 'Índice'),
            "por_tipo": all_stats
        }
        
        _output = json.dumps({
            "graficos": graficos,
            "stats": _stats,
            "chart_type": tipo,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        })

_output
