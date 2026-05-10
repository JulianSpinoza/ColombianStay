from PIL import Image
from django.core.files.base import ContentFile
from io import BytesIO

from django.contrib.gis.geos import Point

import os
import random

def create_thumbnail(image_field, size=(300, 300)):
    image_field.file.seek(0)

    img = Image.open(image_field.file)
    img.thumbnail(size)

    thumb_io = BytesIO()
    img.save(thumb_io, format='JPEG', quality=70)

    original_name = os.path.basename(image_field.name)
    filename = f'thumb_{original_name}'

    return ContentFile(thumb_io.getvalue(), name=filename)

def random_point_in_multipolygon(multipolygon):

    min_x, min_y, max_x, max_y = multipolygon.extent

    while True:

        random_point = Point(
            random.uniform(min_x, max_x),
            random.uniform(min_y, max_y),
            srid=4326
        )

        if multipolygon.contains(random_point):
            return random_point