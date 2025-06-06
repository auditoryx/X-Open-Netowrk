declare module 'next/navigation' {
  export function useRouter(): ReturnType<typeof import('next/dist/client/components/navigation').useRouter>;
  export function usePathname(): string | null;
  export function useSearchParams(): URLSearchParams;
}
