// Local mode adapter - no Supabase needed
import { localDb } from './localDb'

// Export localDb as supabase for drop-in replacement
export const supabase = localDb
