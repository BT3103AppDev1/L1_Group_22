import { auth, db } from '@/firebase.js'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'

// Finds an existing conversation between the current homeowner and a contractor, or creates a new one. Returns the conversation ID.
export async function getOrCreateConversation(contractorId) {
  const currentUid = auth.currentUser?.uid
  if (!currentUid) throw new Error('Not logged in')

  // Check for existing conversation
  const q = query(
    collection(db, 'conversations'),
    where('homeownerId', '==', currentUid),
    where('contractorId', '==', contractorId)
  )

  const snap = await getDocs(q)

  if (!snap.empty) {
    // Already exists — return the existing convo ID
    return snap.docs[0].id
  }

  // Create a new conversation
  const docRef = await addDoc(collection(db, 'conversations'), {
    homeownerId: currentUid,
    contractorId,
    lastMessageAt: serverTimestamp(),
  })

  return docRef.id
}