import { supabase } from './supabase';

// Domínio interno usado para transformar "username" em email.
// O Supabase exige email, então usamos um domínio fake que nunca envia nada.
const DOMAIN = 'meufichario.local';

const toEmail = (username) =>
  `${username.trim().toLowerCase()}@${DOMAIN}`;

export async function signUp(username, password) {
  const clean = username.trim();

  if (clean.length < 3) {
    throw new Error('O nome de usuário precisa ter pelo menos 3 caracteres.');
  }

  const email = toEmail(clean);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // Cria a linha na tabela collections já vazia (opcional, mas evita
  // "not found" no primeiro carregamento)
  if (data?.user) {
    await supabase
      .from('collections')
      .upsert({ user_id: data.user.id, owned: [] }, { onConflict: 'user_id' });
  }

  return data;
}

export async function signIn(username, password) {
  const email = toEmail(username);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}