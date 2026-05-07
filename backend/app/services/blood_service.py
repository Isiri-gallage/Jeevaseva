# Blood type compatibility chart
# Key = patient blood type, Value = list of compatible donor types
BLOOD_COMPATIBILITY = {
    "A+":  ["A+", "A-", "O+", "O-"],
    "A-":  ["A-", "O-"],
    "B+":  ["B+", "B-", "O+", "O-"],
    "B-":  ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],  # universal receiver
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+":  ["O+", "O-"],
    "O-":  ["O-"],  # universal donor - can only receive O-
}

VALID_BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

def get_compatible_donors(patient_blood_type: str) -> list:
    """
    Given a patient's blood type, return list of
    compatible donor blood types
    """
    return BLOOD_COMPATIBILITY.get(patient_blood_type, [])

def is_valid_blood_type(blood_type: str) -> bool:
    """Check if blood type is valid"""
    return blood_type in VALID_BLOOD_TYPES