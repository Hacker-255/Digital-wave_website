import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

describe('invite flow regression guard', () => {
  it('does not cache or reuse the Clerk session JWT between API requests', () => {
    const apiClient = read('src/services/apiClient.ts');

    assert.equal(apiClient.includes('cachedToken'), false);
    assert.match(apiClient, /getSessionToken\(fresh\)/);
    assert.match(apiClient, /skipCache:\s*true/);
    assert.match(apiClient, /res\.status === 401/);
  });

  it('generates a fresh invite token per invite request with a 48 hour expiry', () => {
    const inviteRoute = read('api/users/invite.ts');

    assert.match(inviteRoute, /const INVITE_EXPIRES_HOURS = 48/);
    assert.match(inviteRoute, /const token = createInvitationToken\(\)/);
    assert.match(inviteRoute, /Date\.now\(\) \+ 1000 \* 60 \* 60 \* INVITE_EXPIRES_HOURS/);
    assert.match(inviteRoute, /expiresInDays:\s*2/);
  });

  it('lets a new invite request succeed after a previous invite token expired', () => {
    const userService = read('server/src/services/userService.ts');

    assert.match(userService, /const INVITE_EXPIRES_MS = 1000 \* 60 \* 60 \* 48/);
    assert.match(userService, /existing && new Date\(existing\.expiresAt\)\.getTime\(\) > Date\.now\(\)/);
    assert.match(userService, /randomBytes\(32\)\.toString\('base64url'\)/);
  });

  it('returns a 410 friendly error for expired invite links', () => {
    const acceptRoute = read('api/users/accept-invitation.ts');
    const localRoutes = read('server/src/routes/userRoutes.ts');

    assert.match(acceptRoute, /response\.status\(410\)\.json\(\{ error: 'Invite expired\. Request a new invite\.' \}\)/);
    assert.match(localRoutes, /res\.status\(410\)\.json\(\{ error: message \}\)/);
  });

  it('keeps Clerk and Resend configuration errors server-side and readable', () => {
    const helpers = read('api/_serverHelpers.ts');
    const emailService = read('api/_emailService.ts');

    assert.match(helpers, /CLERK_SECRET_KEY is not configured/);
    assert.match(emailService, /RESEND_API_KEY is not configured/);
    assert.equal(read('src/services/apiClient.ts').includes('RESEND_API_KEY'), false);
    assert.equal(read('src/services/apiClient.ts').includes('CLERK_SECRET_KEY'), false);
  });
});
