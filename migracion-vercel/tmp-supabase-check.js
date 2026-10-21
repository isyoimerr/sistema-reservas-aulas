const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const file = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const obj = {};
for (const line of file.split(/\r?\n/)) {
  if (!line || line.trim().startsWith('#')) continue;
  const idx = line.indexOf('=');
  if (idx === -1) continue;
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
  obj[key] = value;
}

const supabase = createClient(obj.NEXT_PUBLIC_SUPABASE_URL, obj.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

(async () => {
  try {
    const { data, error } = await supabase.from('roles').select('*', { count: 'exact', head: true });
    if (error) {
      console.log('ERROR:' + error.message);
      process.exit(1);
    }
    console.log('CONNECTED');
    console.log(JSON.stringify({ rows: data ? data.length : 0 }, null, 2));
  } catch (e) {
    console.log('EXCEPTION:' + e.message);
    process.exit(1);
  }
})();
