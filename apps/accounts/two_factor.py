"""
Two-Factor Authentication utilities
"""
import pyotp
import qrcode
import io
import base64
import secrets
from django.conf import settings


def generate_totp_secret():
    """
    Generate a random TOTP secret key
    Returns: 32-character base32 encoded string
    """
    return pyotp.random_base32()


def generate_backup_codes(count=10):
    """
    Generate backup codes for 2FA recovery
    Args:
        count: Number of backup codes to generate (default: 10)
    Returns: List of backup codes
    """
    codes = []
    for _ in range(count):
        # Generate 8-character alphanumeric code
        code = secrets.token_hex(4).upper()
        codes.append(code)
    return codes


def get_totp_uri(user, secret):
    """
    Generate TOTP URI for QR code
    Args:
        user: User instance
        secret: TOTP secret key
    Returns: TOTP URI string
    """
    totp = pyotp.TOTP(secret)
    site_name = getattr(settings, 'SITE_NAME', 'News Site')
    return totp.provisioning_uri(
        name=user.email,
        issuer_name=site_name
    )


def generate_qr_code(uri):
    """
    Generate QR code image from TOTP URI
    Args:
        uri: TOTP URI string
    Returns: Base64 encoded QR code image
    """
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(uri)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode()

    return f"data:image/png;base64,{img_base64}"


def verify_totp_code(secret, code):
    """
    Verify TOTP code
    Args:
        secret: TOTP secret key
        code: 6-digit code to verify
    Returns: Boolean indicating if code is valid
    """
    totp = pyotp.TOTP(secret)
    # Allow 1 time step before and after for clock skew
    return totp.verify(code, valid_window=1)


def verify_backup_code(user, code):
    """
    Verify and consume backup code
    Args:
        user: User instance
        code: Backup code to verify
    Returns: Boolean indicating if code is valid
    """
    code = code.upper().strip()

    if code in user.backup_codes:
        # Remove used backup code
        user.backup_codes.remove(code)
        user.save(update_fields=['backup_codes'])
        return True

    return False


def get_current_totp_code(secret):
    """
    Get current TOTP code (for testing/demo purposes)
    Args:
        secret: TOTP secret key
    Returns: Current 6-digit TOTP code
    """
    totp = pyotp.TOTP(secret)
    return totp.now()
