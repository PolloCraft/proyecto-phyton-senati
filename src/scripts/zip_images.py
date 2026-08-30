import base64
import io
import zipfile
import json
import time

images_data = json.loads(images_json)
zip_buffer = io.BytesIO()

with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
    for idx, img in enumerate(images_data):
        img_bytes = base64.b64decode(img['data'])
        filename = f"imagen_{idx + 1}_{img.get('label', 'sin_clase')}.png"
        zip_file.writestr(filename, img_bytes)

zip_buffer.seek(0)
zip_base64 = base64.b64encode(zip_buffer.read()).decode('utf-8')

_output = json.dumps({
    "zip": zip_base64,
    "filename": f"clasificacion_{int(time.time())}.zip",
    "total": len(images_data)
})
_output
