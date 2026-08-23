from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import io

app = Flask(__name__)
CORS(app)

current_df = None

@app.route('/api/upload', methods=['POST'])
def upload_file():
    global current_df
    if 'file' not in request.files:
        return jsonify({'error': 'No se encontró ningún archivo'}), 400
    
    file = request.files['file']
    
    try:
        filename = file.filename.lower()
        if filename.endswith('.csv'):
            current_df = pd.read_csv(io.BytesIO(file.read()))
        elif filename.endswith(('.xls', '.xlsx')):
            current_df = pd.read_excel(io.BytesIO(file.read()))
        else:
            return jsonify({'error': 'Formato no soportado'}), 400
        
        df_display = current_df.fillna('')
        
        return jsonify({
            'headers': list(df_display.columns),
            'rows': df_display.values.tolist()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/clean', methods=['POST'])
def clean_data():
    global current_df
    if current_df is None:
        return jsonify({'error': 'No hay datos cargados para limpiar'}), 400
    
    try:
        df = current_df.copy()
        
        # 1. Reemplazar cadenas vacías o espacios en blanco por NaN
        df.replace(r'^\s*$', np.nan, regex=True, inplace=True)
        
        # 2. Borrar filas donde DNI o Departamento estén vacíos
        cols_to_check = []
        if 'DNI' in df.columns:
            cols_to_check.append('DNI')
        if 'Departamento' in df.columns:
            cols_to_check.append('Departamento')
            
        if cols_to_check:
            df.dropna(subset=cols_to_check, inplace=True)
        
        # 3. Rellenar nombres y apellidos con texto aleatorio
        if 'Nombre' in df.columns:
            nombres = ['Carlos', 'Lucía', 'Mateo', 'Valeria', 'Diego', 'Camila']
            df['Nombre'] = df['Nombre'].fillna(pd.Series(np.random.choice(nombres, len(df)), index=df.index))
            
        if 'Apellido' in df.columns:
            apellidos = ['Gómez', 'Torres', 'Ramírez', 'Flores', 'Vargas', 'Silva']
            df['Apellido'] = df['Apellido'].fillna(pd.Series(np.random.choice(apellidos, len(df)), index=df.index))
            
        # 4. Rellenar datos numéricos faltantes con 0
        columnas_numericas = ['Salario', 'Bono']
        for col in columnas_numericas:
            if col in df.columns:
                df[col] = df[col].fillna(0)

        current_df = df
        df_display = df.fillna('')

        return jsonify({
            'headers': list(df_display.columns),
            'rows': df_display.values.tolist()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ruta para NumPy: convierte ID y DNI a texto para que solo queden los datos numéricos reales
@app.route('/api/numpy-data', methods=['GET'])
def get_numpy_data():
    global current_df
    if current_df is None:
        return jsonify({'error': 'No hay datos cargados'}), 400
    
    try:
        df_temp = current_df.copy()
        
        # Convertir ID y DNI a texto para que NumPy / Pandas los ignore como números matemáticos
        for col in ['ID', 'DNI']:
            if col in df_temp.columns:
                df_temp[col] = df_temp[col].astype(str)
            
        # Filtrar solo columnas numéricas reales (como Salario, Bono, etc.)
        df_numeric = df_temp.select_dtypes(include=[np.number])
            
        return jsonify({
            'headers': list(df_numeric.columns),
            'rows': df_numeric.fillna(0).values.tolist()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)