// A região das funções deve ser a mesma do banco Firestore
// (triggers do Firestore exigem isso). Ajuste se criar o banco em outra região.
export const REGION = "us-central1";

// Limite de operações por batch do Firestore é 500; usamos uma margem.
export const BATCH_SIZE = 400;
