const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

describe('S3 connection diagnostics', function () {
  let originalFetch;
  let S3Client;

  before(async function () {
    const source = fs.readFileSync(path.join(__dirname, '..', 'functions/utils/s3client.js'), 'utf8');
    ({ S3Client } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`));
  });

  beforeEach(function () {
    originalFetch = globalThis.fetch;
  });

  afterEach(function () {
    globalThis.fetch = originalFetch;
  });

  function client() {
    return new S3Client({
      endpoint: 'https://example.r2.cloudflarestorage.com',
      region: 'auto',
      bucket: 'k-vault-files',
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
    });
  }

  it('reports the upstream status and S3 code without exposing the response message', async function () {
    globalThis.fetch = async () => new Response(
      '<Error><Code>SignatureDoesNotMatch</Code><Message>private signed request</Message></Error>',
      { status: 403 }
    );

    await assert.rejects(client().checkConnection(), (error) => {
      assert.equal(error.message, 'S3 check failed (HTTP 403: SignatureDoesNotMatch)');
      return true;
    });
  });

  it('reports HTTP status when the upstream response has no S3 error code', async function () {
    globalThis.fetch = async () => new Response('upstream details', { status: 502 });
    await assert.rejects(client().checkConnection(), {
      message: 'S3 check failed (HTTP 502)',
    });
  });

  it('accepts a successful bucket listing', async function () {
    globalThis.fetch = async () => new Response('<ListBucketResult/>', { status: 200 });
    assert.equal(await client().checkConnection(), true);
  });
});
