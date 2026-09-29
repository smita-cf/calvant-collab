export async function GET(request, { params }) {
  const { type } = await params;
  
  try {
    const res = await fetch(
      `https://api.calvant.com/footer-service/api/footer-content/type/${type}`,
      {
        headers: {
          'Origin': 'https://calvant.com',
          'Referer': 'https://calvant.com/',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; CalVant-SSR/1.0)',
        }
      }
    );
    
    console.log('[proxy] upstream status:', res.status);
    if (!res.ok) {
      const text = await res.text();
      console.error('[proxy] upstream error body:', text);
      return Response.json(null, { status: res.status });
    }
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error('[proxy] fetch error:', err.message);
    return Response.json(null, { status: 500 });
  }
}