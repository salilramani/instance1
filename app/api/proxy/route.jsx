	
import axios from 'axios';

const allowedOrigins = '*';  // Adjust this to your specific origin if necessary

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const handleError = (error) => {
  console.error('Proxy error:', error);
  return new Response(JSON.stringify({ error: 'Failed to fetch the external website' }), {
    status: 500,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
};

const handleGetRequest = async (req) => {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing target URL' }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const response = await axios.get(targetUrl, { responseType: 'arraybuffer' });
    const contentType = response.headers['content-type'];

    const headers = {
      'Content-Type': contentType,
      ...corsHeaders,
    };

    if (contentType.includes('text/html')) {
      const htmlContent = Buffer.from(response.data, 'binary').toString('utf8');
      const baseUrl = new URL(targetUrl).origin;

      const modifiedContent = htmlContent
        .replace('<head>', `<head><base href="${baseUrl}/">`)
        .replace(
          '</body>',
          `
          <script>
            function updateLinks() {
              document.querySelectorAll('a').forEach(anchor => {
                const href = anchor.getAttribute('href');
                if (href && !href.match(/^(mailto:|tel:|#|javascript:|[a-z]+:)/i) && !href.match(/\\.(css|js|jpg|jpeg|png|gif|bmp|webp|svg|ico|mp4|mp3|wav|ogg|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z)$/i)) {
                  anchor.href = window.location.origin + '/api/proxy?url=' + encodeURIComponent(new URL(anchor.href, window.location.origin).href);
                }
              });
            }

            document.addEventListener('DOMContentLoaded', updateLinks);
            const observer = new MutationObserver(updateLinks);
            observer.observe(document.body, { childList: true, subtree: true });
          </script>
          </body>`
        );

      return new Response(modifiedContent, { headers });
    } else {
      return new Response(response.data, { headers });
    }
  } catch (error) {
    return handleError(error);
  }
};

const handlePostRequest = async (req) => {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing target URL' }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const response = await axios.post(targetUrl, await req.arrayBuffer(), {
      headers: {
        'Content-Type': req.headers.get('content-type') || 'application/json',
      },
      responseType: 'arraybuffer',
    });
    const contentType = response.headers['content-type'];

    const headers = {
      'Content-Type': contentType,
      ...corsHeaders,
    };

    return new Response(response.data, { headers });
  } catch (error) {
    return handleError(error);
  }
};

export const GET = handleGetRequest;
export const POST = handlePostRequest;

export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
    },
  });
};