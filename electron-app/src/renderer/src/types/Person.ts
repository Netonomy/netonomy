export type Person = {
  name: string
  '@context': string
  '@type': string
  email?: string
  image?: string
  url?: string
  banner?: string
  follows?: string[] // List of DIDs of things this person follows
}
