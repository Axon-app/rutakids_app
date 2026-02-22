/* ══════════════════════════════════════════════════════════════
   RUTAKIDS - CLOUD MODULE (SUPABASE)
   Handles authentication and cloud persistence
   ══════════════════════════════════════════════════════════════ */

const CloudManager = (() => {
  'use strict';

  let client = null;
  let config = {
    url: '',
    anonKey: '',
    table: 'rutakids_data'
  };

  const isConfigured = () => Boolean(config.url && config.anonKey);

  const init = async (userConfig = {}) => {
    config = {
      ...config,
      ...userConfig
    };

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      return { ok: false, error: 'SDK de Supabase no está disponible.' };
    }

    if (!isConfigured()) {
      return { ok: false, error: 'Falta configurar URL y ANON KEY de Supabase.' };
    }

    client = window.supabase.createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    return { ok: true };
  };

  const getSession = async () => {
    if (!client) return null;
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data?.session || null;
  };

  const onAuthStateChange = (callback) => {
    if (!client) return () => {};
    const { data } = client.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return () => {
      data?.subscription?.unsubscribe?.();
    };
  };

  const signUp = async ({ email, password, fullName }) => {
    if (!client) throw new Error('Supabase no inicializado');

    const emailRedirectTo = `${window.location.origin}${window.location.pathname}`;

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: fullName || ''
        }
      }
    });

    if (error) throw error;
    return data;
  };

  const signIn = async ({ email, password }) => {
    if (!client) throw new Error('Supabase no inicializado');

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    if (!client) throw new Error('Supabase no inicializado');

    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { data, error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    if (error) throw error;
    return data;
  };

  const getUserData = async (userId) => {
    if (!client) throw new Error('Supabase no inicializado');

    const { data, error } = await client
      .from(config.table)
      .select('payload')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.payload || null;
  };

  const saveUserData = async (userId, payload) => {
    if (!client) throw new Error('Supabase no inicializado');

    const row = {
      user_id: userId,
      payload,
      updated_at: new Date().toISOString()
    };

    const { error } = await client
      .from(config.table)
      .upsert(row, { onConflict: 'user_id' });

    if (error) throw error;
    return true;
  };

  const resetUserData = async (userId, payloadBase = {}) => {
    if (!client) throw new Error('Supabase no inicializado');
    return saveUserData(userId, payloadBase);
  };

  return {
    init,
    isConfigured,
    getSession,
    onAuthStateChange,
    signUp,
    signIn,
    signOut,
    resetPassword,
    getUserData,
    saveUserData,
    resetUserData
  };
})();
