/*
 * ABO blood-group compatibility for kidney donation.
 *
 * Rhesus factor (+/-) is deliberately ignored. Unlike blood transfusion, RhD is
 * not a barrier in kidney transplantation — only the ABO group matters at this
 * screening stage.
 *
 * This is a first-pass filter only. Actual suitability still requires HLA
 * tissue typing and a crossmatch performed by a transplant centre, which is
 * why every result carries a caveat in the UI.
 */

export const COMPATIBILITY = {
  UNIVERSAL_DONOR: 'universal_donor',
  UNIVERSAL_RECIPIENT: 'universal_recipient',
  EXACT: 'exact',
  INCOMPATIBLE: 'incompatible',
  UNKNOWN: 'unknown',
};

/** Strip the Rh suffix: "A+" -> "A" */
const aboGroup = (bloodType) =>
  typeof bloodType === 'string' ? bloodType.replace(/[+-]/g, '').trim().toUpperCase() : '';

/**
 * @returns {{kind: string, compatible: boolean, label: string, variant: string}}
 *   `variant` maps onto a Badge variant so the caller never picks a colour.
 */
export const getABOCompatibility = (donorBloodType, patientBloodType) => {
  const donor = aboGroup(donorBloodType);
  const patient = aboGroup(patientBloodType);

  if (!donor || !patient) {
    return {
      kind: COMPATIBILITY.UNKNOWN,
      compatible: false,
      label: 'Compatibility unknown',
      variant: 'neutral',
    };
  }

  // Group O red cells carry neither A nor B antigen, so an O donor is
  // compatible with any recipient.
  if (donor === 'O') {
    return {
      kind: COMPATIBILITY.UNIVERSAL_DONOR,
      compatible: true,
      label: 'Compatible · universal donor',
      variant: 'success',
    };
  }

  // An AB recipient has no anti-A or anti-B antibodies, so accepts any group.
  if (patient === 'AB') {
    return {
      kind: COMPATIBILITY.UNIVERSAL_RECIPIENT,
      compatible: true,
      label: 'Compatible · universal recipient',
      variant: 'success',
    };
  }

  if (donor === patient) {
    return {
      kind: COMPATIBILITY.EXACT,
      compatible: true,
      label: 'Compatible · exact match',
      variant: 'success',
    };
  }

  return {
    kind: COMPATIBILITY.INCOMPATIBLE,
    compatible: false,
    label: 'ABO incompatible',
    variant: 'danger',
  };
};
