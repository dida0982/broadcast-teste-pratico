import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { auth, db } from "../lib/firebase";

export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email.trim(), password);

// Cada usuário cadastrado é um cliente (tenant) da aplicação.
export const signUp = async (name: string, email: string, password: string) => {
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(user, { displayName: name.trim() });
  await user.getIdToken(true);
  await setDoc(doc(db, "clients", user.uid), {
    name: name.trim(),
    email: user.email,
    createdAt: serverTimestamp(),
  });
  return user;
};

export const signOut = () => firebaseSignOut(auth);

const authMessages: Record<string, string> = {
  "auth/invalid-credential": "E-mail ou senha inválidos.",
  "auth/invalid-email": "E-mail inválido.",
  "auth/user-not-found": "E-mail ou senha inválidos.",
  "auth/wrong-password": "E-mail ou senha inválidos.",
  "auth/email-already-in-use": "Este e-mail já está cadastrado.",
  "auth/weak-password": "A senha deve ter ao menos 6 caracteres.",
  "auth/too-many-requests": "Muitas tentativas. Tente novamente em instantes.",
  "auth/network-request-failed": "Falha de conexão. Verifique sua internet.",
};

export const authErrorMessage = (error: unknown): string =>
  error instanceof FirebaseError
    ? authMessages[error.code] ?? "Não foi possível concluir. Tente novamente."
    : "Erro inesperado.";
