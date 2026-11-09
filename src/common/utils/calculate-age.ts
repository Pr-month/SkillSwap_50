export function calculateAge(birthdate: Date | string | null): number | null {
  if (birthdate === null) return null;

  const birth = new Date(birthdate);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  const yearDifference = today.getUTCFullYear() - birth.getUTCFullYear();

  const birthdayStillAhead =
    today.getUTCMonth() < birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() &&
      today.getUTCDate() < birth.getUTCDate());

  const age = yearDifference - (birthdayStillAhead ? 1 : 0);
  return age >= 0 ? age : null;
}
