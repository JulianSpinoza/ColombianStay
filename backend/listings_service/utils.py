from PIL import Image
from django.core.files.base import ContentFile
from io import BytesIO

import os

def create_thumbnail(image_field, size=(300, 300)):
    image_field.file.seek(0)

    img = Image.open(image_field.file)
    img.thumbnail(size)

    thumb_io = BytesIO()
    img.save(thumb_io, format='JPEG', quality=70)

    original_name = os.path.basename(image_field.name)
    filename = f'thumb_{original_name}'

    return ContentFile(thumb_io.getvalue(), name=filename)