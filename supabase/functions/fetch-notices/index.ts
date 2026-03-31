const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = 'https://gurugramuniversity.ac.in/allNotifications/allNotice/index.php';
    const response = await fetch(url);
    const html = await response.text();

    // Parse notices from HTML - each notice is in a list item
    const notices: { title: string; url: string; date: string; isNew: boolean }[] = [];
    
    // Match pattern: <li>...<a href="...">title</a>...date...</li>
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let match;
    
    while ((match = liRegex.exec(html)) !== null) {
      const liContent = match[1];
      
      // Extract link
      const linkMatch = liContent.match(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
      if (!linkMatch) continue;
      
      const noticeUrl = linkMatch[1].trim();
      let title = linkMatch[2].replace(/<[^>]+>/g, '').trim();
      
      const isNew = title.includes('NEW') || liContent.includes('NEW');
      title = title.replace(/\s*NEW\s*/g, '').trim();
      
      // Extract date
      const dateMatch = liContent.match(/(\d{4}-\d{2}-\d{2})/);
      const date = dateMatch ? dateMatch[1] : '';
      
      if (title && noticeUrl) {
        notices.push({ title, url: noticeUrl, date, isNew });
      }
    }

    return new Response(JSON.stringify({ success: true, notices }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch notices';
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
