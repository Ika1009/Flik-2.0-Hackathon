import base64
from io import BytesIO

import qrcode
from django.shortcuts import render

# Create your views here.





def qr_code_screen(request) :

    data = "https://youtube.si"
    qr = qrcode.QRCode(
        version=1,              # size of the QR grid (1 = small, 40 = large)
        error_correction=qrcode.constants.ERROR_CORRECT_L,  # error correction
        box_size=10,            # size of each "box" pixel
        border=1,               # 👈 reduce from default 4 to 1 (less white space)
    )

    qr.add_data(data)
    qr.make(fit=True)

    # Generate the image
    img = qr.make_image(fill_color="black", back_color="white")

    # Convert to base64 to embed in HTML
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()

    # Pass the image to the template
    return render(request, "qr_screen.html", {"qr_code": img_str})


