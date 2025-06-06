export function getRedirectAfterSignup(role: string | null | undefined, redirectPath: string = '/dashboard') {
  return role ? redirectPath : '/apply';
}
