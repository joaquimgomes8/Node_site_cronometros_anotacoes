/* ══════════════════════════════════════
    CONFIGURAÇÃO DO SUPABASE
    Preencha os dois valores abaixo com os
    dados do seu projeto:
    Supabase → Settings → API Keys
══════════════════════════════════════ */

const SUPABASE_URL = "https://sxihkatadkfzmffezocl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4aWhrYXRhZGtmem1mZmV6b2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzU5OTMsImV4cCI6MjA5NTgxMTk5M30.9fwMoG-eog--14x5uQt663Uc4XX8j1KnmqFKGuRBnks";

if (SUPABASE_URL.includes("COLE_AQUI") || SUPABASE_ANON_KEY.includes("COLE_AQUI")) {
    console.error(
        "[supabaseClient.js] Você ainda não preencheu SUPABASE_URL e SUPABASE_ANON_KEY. " +
        "Pegue esses valores em Supabase → Settings → API Keys."
    );
}

if (!window.supabase) {
    console.error(
        "[supabaseClient.js] A biblioteca do Supabase não carregou. " +
        "Confira se o <script src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'></script> " +
        "está incluído ANTES deste arquivo no HTML."
    );
}

// Cliente do Supabase usado em login.html e criar_conta.html.
// Chamado de 'sb' (e não 'supabase') de propósito, para não colidir
// com o objeto global window.supabase da biblioteca.
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
