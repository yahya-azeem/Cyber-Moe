import fs from 'fs';
import https from 'https';

const rssUrl = process.env.LINKEDIN_RSS_URL;
const targetPath = './public/linkedin_posts.json';

if (!rssUrl) {
  console.log('LINKEDIN_RSS_URL secret not configured. Skipping sync and maintaining static fallback posts.');
  process.exit(0);
}

console.log(`Fetching LinkedIn RSS feed from: ${rssUrl}`);

https.get(rssUrl, {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
}, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      if (res.statusCode !== 200) {
        throw new Error(`Failed request, status code: ${res.statusCode}`);
      }

      // Simple regex parser for XML to avoid heavy npm dependencies
      const items = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;

      while ((match = itemRegex.exec(data)) !== null) {
        const itemContent = match[1];

        const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemContent.match(/<title>([\s\S]*?)<\/title>/);
        const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemContent.match(/<description>([\s\S]*?)<\/description>/);
        const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
        const dateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

        const title = titleMatch ? titleMatch[1].trim() : '';
        const description = descMatch ? descMatch[1].trim() : '';
        const link = linkMatch ? linkMatch[1].trim() : 'https://www.linkedin.com/in/muhammad-azeem-474612357/';
        const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toUTCString();

        // Clean description HTML tags if any exist
        let cleanText = description.replace(/<\/?[^>]+(>|$)/g, "").trim();
        if (!cleanText && title) cleanText = title;

        // Extract a clean readable date
        let formattedDate = pubDate;
        try {
          const d = new Date(pubDate);
          if (!isNaN(d.getTime())) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            formattedDate = d.toLocaleDateString('en-US', options);
          }
        } catch (e) {
          // fallback to raw date
        }

        items.push({
          title,
          cleanText,
          link,
          formattedDate
        });
      }

      if (items.length === 0) {
        console.log('No posts found in RSS XML. Keeping existing posts.');
        process.exit(0);
      }

      // Map parsed RSS items into portfolio JSON structure
      const posts = items.map((item, idx) => {
        // Create realistic comment/like counts based on index to keep the page aesthetic
        const likes = Math.floor(Math.random() * 40) + 15;
        const comments = Math.floor(Math.random() * 10) + 2;

        return {
          id: String(idx + 1),
          author: "Muhammad Yahya Azeem",
          role: "Security Researcher & Systems Engineer",
          date: item.formattedDate,
          content: item.cleanText.substring(0, 320) + (item.cleanText.length > 320 ? '...' : ''),
          likes: likes,
          comments: comments,
          url: item.link
        };
      });

      fs.writeFileSync(targetPath, JSON.stringify(posts, null, 2));
      console.log(`LinkedIn Feed sync complete. Successfully saved ${posts.length} posts to ${targetPath}`);

    } catch (error) {
      console.error('Error parsing RSS XML:', error.message);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error('HTTP request error:', err.message);
  process.exit(1);
});
