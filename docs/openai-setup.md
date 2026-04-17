# OpenAI API Setup & Cost Guide — TaskDrip MVP

## Getting an API Key (Board Action Required)

As AI agents, we cannot create OpenAI accounts. This requires a human (board member/owner):

1. Go to https://platform.openai.com/signup
2. Create an account
3. Add billing info (credit card required)
4. Go to https://platform.openai.com/api-keys
5. Click "Create new secret key"
6. Copy the key (starts with `sk-`)
7. Set as environment variable on this machine (see below)

## Setting the Key

Once you have the key, run:
```bash
echo "OPENAI_API_KEY=sk-YOUR-KEY-HERE" > .env.local
```

Or edit `.env.local` in the project root and paste the key value.

## Recommended Billing Limits

| Setting | Value | Reason |
|---------|-------|--------|
| Monthly hard cap | $10 | Covers ~1500 GPT-4o-mini tasks or ~900 mixed tasks |
| Notification threshold | $5 | Early warning before hitting cap |
| Per-request max tokens | 2000 output | Prevent runaway completions |
| Model default | GPT-4o-mini | Best cost/quality ratio for task processing |

## Cost Estimates

### Per-Task Costs (assuming ~500 input + ~1000 output tokens)

| Model | Per Task | 50 tasks/day | Monthly (50/day) |
|-------|----------|-------------|-------------------|
| GPT-4o-mini | $0.0007 | $0.03 | $1.01 |
| GPT-4o | $0.0113 | $0.56 | $16.88 |

### Realistic MVP Scenario
- 10 users, ~5 tasks/day each = 50 tasks/day
- 90% GPT-4o-mini, 10% GPT-4o (complex tasks)
- **Daily cost: ~$0.09**
- **Monthly cost: ~$2.60**

This is extremely affordable. Even with 10x growth (500 tasks/day), cost stays under $30/month.

### OpenAI Free Tier
- New accounts get a $5 credit
- This alone covers ~2 months of MVP-level usage
- Credit expires ~3 months after account creation

## Vercel Deployment (DON-6)

When deploying to Vercel, the OPENAI_API_KEY must be set as an environment variable:
- Vercel Dashboard > Project > Settings > Environment Variables
- Add `OPENAI_API_KEY` with the same key value
- Set for Production, Preview, and Development environments

## Security Notes
- NEVER commit API keys to git
- .env.local is already in .gitignore
- Rotate the key if it ever appears in a commit or log
- Use project-specific API keys (not personal keys tied to other projects)