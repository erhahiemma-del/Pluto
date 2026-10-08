import express from 'express';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Ensure HMR is disabled in AI Studio environment to prevent port 24678 conflicts and WebSocket errors
process.env.DISABLE_HMR = 'true';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  const ai = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      })
    : null;

  const resendApiKey = process.env.RESEND_API_KEY;

  // Supabase (server-side only). The service role key never reaches the browser.
  // Uses the URL from AI Studio's Supabase integration (VITE_SUPABASE_URL) if SUPABASE_URL isn't set.
  const tidy = (v?: string) => (v || '').trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
  const supabaseUrl = tidy(process.env.SUPABASE_URL) || tidy(process.env.VITE_SUPABASE_URL);
  const supabaseKey = tidy(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const supabaseAdmin =
    supabaseUrl && supabaseKey
      ? createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false },
        })
      : null;
  const CARDS_TABLE = process.env.SUPABASE_CARDS_TABLE || 'extra_mile_cards';
  const EVENTS_TABLE = process.env.SUPABASE_EVENTS_TABLE || 'extra_mile_events';
  const FUNNEL_STEPS = ['Who you are thanking', 'Photo', 'Personalise', 'Your details', 'Card created'];

  const clean = (value: unknown, max: number) =>
    typeof value === 'string' ? value.trim().slice(0, max) : '';

  // Save one completed card (no photo or image is stored).
  app.post('/api/cards', async (req, res) => {
    if (!supabaseAdmin) {
      console.log('[Supabase] Database not configured: card not saved');
      return res.status(503).json({ error: 'Database not configured' });
    }
    const b = req.body || {};
    const row = {
      recipient_name: clean(b.recipientName, 120),
      relationship: clean(b.relationship, 80),
      message: clean(b.message, 600),
      selected_traits: Array.isArray(b.selectedTraits)
        ? b.selectedTraits.slice(0, 6).map((t: unknown) => clean(t, 60))
        : [],
      creator_first_name: clean(b.creatorFirstName, 80),
      creator_last_name: clean(b.creatorLastName, 80),
      creator_email: clean(b.creatorEmail, 160),
      creator_job_title: clean(b.creatorJobTitle, 120),
      creator_company: clean(b.creatorCompany, 120),
      creator_industry: clean(b.creatorIndustry, 80),
      marketing_consent: b.marketingConsent === true,
      campaign: clean(b.campaign, 60) || 'ThoseWhoWentTheExtraMile',
    };
    const { data, error } = await supabaseAdmin.from(CARDS_TABLE).insert(row).select('id').single();
    if (error) {
      console.log('[Supabase] Insert failed:', error.message);
      return res.status(500).json({ error: 'Could not save card' });
    }
    return res.json({ id: data.id });
  });

  // Record that a wizard session reached a step (1-5). Used for the real funnel.
  app.post('/api/events', async (req, res) => {
    if (!supabaseAdmin) return res.status(204).end();
    const sessionId = clean(req.body?.sessionId, 80);
    const step = Number(req.body?.step);
    if (!sessionId || !Number.isInteger(step) || step < 1 || step > FUNNEL_STEPS.length) {
      return res.status(400).json({ error: 'Invalid event' });
    }
    const { error } = await supabaseAdmin.from(EVENTS_TABLE).insert({ session_id: sessionId, step });
    if (error) console.log('[Supabase] Event insert failed:', error.message);
    return res.status(204).end();
  });

  // Admin: list cards. Requires the x-admin-token header to match ADMIN_TOKEN.
  app.get('/api/admin/cards', async (req, res) => {
    const token = process.env.ADMIN_TOKEN;
    if (!token || req.get('x-admin-token') !== token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!supabaseAdmin) {
      console.log('[Supabase] Database not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      return res.status(503).json({ error: 'Database not configured' });
    }
    const { data, error } = await supabaseAdmin
      .from(CARDS_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5000);
    if (error) {
      console.log('[Supabase] Select failed:', error.message);
      return res.status(500).json({ error: 'Could not load cards' });
    }
    const cards = (data || []).map((r: any) => ({
      id: r.id,
      recipientName: r.recipient_name,
      relationship: r.relationship,
      message: r.message,
      selectedTraits: r.selected_traits || [],
      creatorFirstName: r.creator_first_name,
      creatorLastName: r.creator_last_name,
      creatorEmail: r.creator_email,
      creatorJobTitle: r.creator_job_title,
      creatorCompany: r.creator_company,
      creatorIndustry: r.creator_industry,
      marketingConsent: r.marketing_consent,
      campaign: r.campaign,
      createdAt: r.created_at,
    }));
    // Real funnel: how many wizard sessions reached each step.
    let funnel: { step: string; users: number }[] = [];
    const { data: events, error: eventsError } = await supabaseAdmin
      .from(EVENTS_TABLE)
      .select('session_id, step')
      .limit(100000);
    if (eventsError) {
      console.log('[Supabase] Events select failed:', eventsError.message);
    } else {
      const furthest = new Map<string, number>();
      for (const e of events || []) {
        const prev = furthest.get(e.session_id) || 0;
        if (e.step > prev) furthest.set(e.session_id, e.step);
      }
      funnel = FUNNEL_STEPS.map((label, i) => ({
        step: `${i + 1}. ${label}`,
        users: [...furthest.values()].filter((max) => max >= i + 1).length,
      }));
    }

    return res.json({ cards, funnel });
  });

  app.post('/api/generate-message', async (req, res) => {
    const { recipientName, relationship, traits, context } = req.body;
    
    if (ai) {
      try {
        const prompt = `Write 3 distinct, warm, sincere, professional thank-you message options for an appreciation card.
Recipient: ${recipientName || 'a mentor/colleague'}
Relationship: ${relationship || 'Mentor'}
Key attributes: ${(traits && traits.length) ? traits.join(', ') : 'believed in my potential, challenged me to grow'}
Personal context: ${context || 'They made a lasting difference in my career'}

Requirements:
- Tone: Sincere, warm, human, Nigerian professional context, deeply appreciative.
- Avoid corporate clichés, generic motivational platitudes, or exaggerated praise.
- Keep each option between 20 and 35 words.

Return a JSON object in this exact format:
{
  "options": [
    "First option text",
    "Second option text",
    "Third option text"
  ]
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (Array.isArray(parsed.options) && parsed.options.length > 0) {
            return res.json({
              options: parsed.options.slice(0, 3),
              message: parsed.options[0],
            });
          }
        }
      } catch (error) {
        console.warn('Gemini API call failed, using crafted template:', error);
      }
    }

    // High quality crafted fallbacks
    const fallbackOptions = [
      "You didn’t just give direction. You gave me opportunity, challenged me to grow, and believed in me when I doubted myself.",
      "Thank you for opening doors and standing by me when it counted most. Your guidance and trust transformed my career journey.",
      "Working with you taught me what true leadership looks like. You saw my potential and gave me the confidence to excel."
    ];

    return res.json({
      options: fallbackOptions,
      message: fallbackOptions[0],
    });
  });

  app.post('/api/send-email', async (req, res) => {
    const { email, dataUrl } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    if (resendApiKey && dataUrl) {
      try {
        const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        const cleanEmail = String(email).trim();
        const fromAddress = process.env.RESEND_FROM || 'Pluto by VerifyMe <onboarding@resend.dev>';

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [cleanEmail],
            subject: 'Your Personalised Thank You Card — Pluto',
            text: 'Attached is your thank you card from Pluto (#ThoseWhoWentTheExtraMile). Thank you for celebrating those who shaped your journey!',
            attachments: [
              {
                filename: 'thank-you-card.png',
                content: base64Data,
              },
            ],
          }),
        });

        const result: any = await response.json();

        if (!response.ok) {
          // Log informational note without console.error so expected test sandbox restrictions don't trigger error banners
          console.log(`[Email Dispatch Notice] Resend status ${response.status} for ${cleanEmail}: ${result?.message || result?.name || 'sandbox recipient restriction'}`);
          return res.status(502).json({ success: false, error: 'Email could not be delivered' });
        }

        console.log(`[Email] Card successfully emailed to ${cleanEmail} via Resend. ID: ${result?.id}`);
        return res.json({ success: true, delivered: true, id: result?.id });
      } catch (error: any) {
        console.log('[Email Dispatch Notice] Exception during send:', error?.message || error);
        return res.status(502).json({ success: false, error: 'Email could not be delivered' });
      }
    }

    console.log(`[Email] Not sent to ${email}: Resend key not configured.`);
    return res.status(503).json({ success: false, error: 'Email is not available right now' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: false,
        hmr: false,
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // index.html must never be cached, so visitors always get the latest version after a deploy.
    // Hashed files in /assets can be cached for a long time.
    app.use(
      express.static('dist', {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          } else if (filePath.includes(`${'/'}assets${'/'}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );
    // Single-page app: send index.html for any other page path (e.g. /ExtraMile)
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile('index.html', { root: 'dist' });
    });
  }

  // Startup check (runs after the server is listening, so it never delays startup)
  const checkSupabase = async () => {
    if (!supabaseAdmin) {
      console.log('[Supabase] Not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    } else {
      let host = '(invalid URL)';
      try { host = new URL(String(supabaseUrl).trim()).host; } catch {}
      try {
        const { error } = await supabaseAdmin.from(CARDS_TABLE).select('id', { count: 'exact', head: true });
        if (error && /fetch failed/i.test(error.message)) {
          let reason = '';
          try { await fetch(`${supabaseUrl}/rest/v1/`); } catch (e: any) { reason = e?.cause?.code || e?.cause?.message || e?.message || ''; }
          console.log(`[Supabase] Could not reach ${host} (${reason || 'network error'}). Check SUPABASE_URL is exactly your Project URL, e.g. https://<project>.supabase.co`);
        } else if (error) {
          console.log(`[Supabase] Reached ${host} but the check failed: ${error.message}`);
        } else {
          console.log(`[Supabase] Connected to ${host} (tables: ${CARDS_TABLE}, ${EVENTS_TABLE})`);
        }
      } catch (err: any) {
        console.log(`[Supabase] Could not reach ${host}: ${err?.cause?.code || err?.cause?.message || err?.message || err}`);
      }
    }
  };

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    checkSupabase();
  });
}

startServer();
