# Admin Chat Interface Setup

This admin interface allows non-technical users to update website content through a chat interface powered by Claude AI.

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
ADMIN_PASSWORD='your_admin_password_here'
ANTHROPIC_API_KEY='your_anthropic_api_key_here'
GITHUB_TOKEN='your_github_token_here'
```

#### Getting API Keys:

- **Anthropic API Key**: Get from [https://console.anthropic.com/](https://console.anthropic.com/)
- **GitHub Token**: Generate from [https://github.com/settings/tokens](https://github.com/settings/tokens) with `repo` scope

### 3. Create Staging Branch

```bash
git checkout -b staging
git push -u origin staging
```

### 4. Configure Vercel

1. Go to your Vercel project settings
2. Under "Git", enable deployments for the `staging` branch
3. Set up environment variables in Vercel:
   - Add `ADMIN_PASSWORD`
   - Add `ANTHROPIC_API_KEY`
   - Add `GITHUB_TOKEN`

### 5. Access the Admin Interface

- Development: `http://localhost:3000/admin`
- Production: `https://active.vc/admin`
- Staging: `https://staging-active-vc.vercel.app/admin` (or your staging URL)

## How It Works

### Conversation Storage

- Conversations are stored as markdown files in `/conversations/`
- Each day gets a new conversation file: `YYYY-MM-DD.md`
- Files are git-tracked for audit trail

### Workflow

1. User logs into `/admin` with password
2. User chats with Claude AI about content changes
3. Claude understands the request and explains what will change
4. Changes are committed to `staging` branch
5. Vercel auto-deploys staging site
6. User reviews changes on staging
7. User approves → changes merge to `main` → live deployment

### Example Conversations

**Example 1: Simple Content Update**
```
User: Change the investment range to $150k-$1.5M

Assistant: I'll update the investment range in the HowWeInvest component.
[Reads file, makes changes, deploys to staging]
Done! Changes deployed to staging. Review at: https://staging-active-vc.vercel.app

User: Looks good, publish it

Assistant: Publishing to production...
✓ Live at active.vc
```

**Example 2: Multiple Changes**
```
User: Add "AI Infrastructure" to how we invest and update the team bio for John

Assistant: I'll make both changes:
1. Adding "AI Infrastructure" to investment criteria
2. Updating John's bio
[Makes changes, deploys]
Changes deployed to staging for review.
```

## Security Notes

- Admin password stored as env var (server-side only, never exposed to client)
- All API routes validate authentication
- Conversations are stored in git for audit trail
- GitHub token needs `repo` scope only
- **Rate limiting enabled on all admin endpoints**
- Consider IP whitelisting for production

### Rate Limiting

All admin API endpoints are protected with rate limiting:
- **Login**: 5 attempts per 15 minutes
- **Chat**: 30 messages per minute
- **Deploy**: 10 deployments per minute
- **Publish**: 5 publishes per minute
- **File operations**: 50 operations per minute

Rate limit configuration can be adjusted in `lib/rate-limit.ts`.

## Troubleshooting

### "Authentication failed"
- Verify `ADMIN_PASSWORD` is set correctly in `.env.local`
- Restart the dev server after changing env vars (`yarn dev`)

### "Failed to deploy"
- Check `GITHUB_TOKEN` has correct permissions
- Ensure staging branch exists: `git checkout -b staging && git push -u origin staging`
- Verify Vercel is configured to deploy both branches

### "Claude API error"
- Verify `ANTHROPIC_API_KEY` is valid
- Check API quota at console.anthropic.com

### Merge conflicts
- The system will attempt to merge staging → main
- If conflicts occur, resolve manually:
  ```bash
  git checkout main
  git merge staging
  # Resolve conflicts
  git commit
  git push
  ```

## File Structure

```
active_vc/
├── app/
│   ├── admin/
│   │   └── page.tsx           # Admin chat UI
│   └── api/
│       └── admin/
│           ├── auth/           # Password authentication
│           ├── chat/           # Claude AI integration
│           ├── conversation/   # Load daily conversations
│           ├── deploy/         # Git deployment
│           ├── file-edit/      # File read/write
│           └── publish/        # Staging → Production
├── conversations/
│   └── YYYY-MM-DD.md          # Daily conversation logs
├── lib/
│   └── git-utils.ts           # Git automation utilities
└── middleware.ts                   # Sets x-pathname header for admin layout
```

## Maintenance

### Viewing Conversation History
All conversations are stored as markdown in `/conversations/`. Each file represents one day's chat history.

### Clearing Old Conversations
Conversations are git-tracked. To archive:
```bash
mkdir conversations/archive
git mv conversations/2026-*.md conversations/archive/
git commit -m "Archive old conversations"
```

## Cost Estimate

Uses **Claude Opus 4** ($15/MTok input, $75/MTok output). Typical costs:
- **Simple content update**: ~$0.10-0.30 per conversation
- **Complex multi-file change**: ~$0.30-0.75 per conversation
- **Estimated monthly** (light usage, ~5 updates/week): ~$5-15/month

## Future Enhancements

- [ ] Add rollback functionality
- [ ] Implement deployment status webhooks
- [ ] Add file diff preview before deployment
- [ ] Multi-user support with roles
- [ ] Slack/email notifications for deployments
- [x] Rate limiting on API endpoints
