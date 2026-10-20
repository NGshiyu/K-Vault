const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadUploadPage(savedHistory = []) {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const script = html.match(/<script>\s*(const LOCAL_PREVIEW_PAGE[\s\S]*?)<\/script>/);
  assert.ok(script, 'upload page script should exist');
  let options;
  const storage = new Map([['uploadHistory', JSON.stringify(savedHistory)]]);
  vm.runInNewContext(script[1], {
    URL,
    document: { location: { origin: 'https://site-a.example' } },
    localStorage: {
      getItem(key) { return storage.get(key) || null; },
      setItem(key, value) { storage.set(key, value); },
    },
    Vue: function Vue(config) { options = config; },
  });
  return Object.assign({}, options.data, options.methods, {
    addToHistory() {},
  });
}

describe('Upload result public domain option', function () {
  it('keeps the saved public origin when formatting an absolute file URL', function () {
    const page = loadUploadPage();
    const savedFile = {
      name: 'picture.jpg',
      url: 'https://images-b.example/file/r2:r2_picture.jpg',
      path: '/file/r2:r2_picture.jpg',
    };
    page.uploadedFiles.push(savedFile);

    assert.equal(page.formatLink(savedFile), 'https://images-b.example/file/r2:r2_picture.jpg');
    assert.equal(page.getBatchLinks(), page.formatLink(savedFile));
  });

  it('repairs saved history using its selected public domain', function () {
    const page = loadUploadPage([{
      name: 'picture.jpg',
      fileName: 'picture.jpg',
      url: 'https://site-a.example/file/r2:r2_picture.jpg',
      path: '/file/r2:r2_picture.jpg',
      linkBaseURL: 'https://images-b.example',
    }]);

    page.loadHistory();
    assert.equal(page.uploadHistory[0].url, 'https://images-b.example/file/r2:r2_picture.jpg');
    assert.equal(page.formatLink(page.uploadHistory[0]), page.uploadHistory[0].url);
  });

  it('uses PUBLIC_BASE_URL only for results uploaded with the checkbox selected', function () {
    const page = loadUploadPage();
    page.publicBaseUrl = 'https://images-b.example';
    page.usePublicBaseUrl = true;

    const selectedContext = page.createUploadContext();
    const selectedItem = {
      file: { name: 'picture.jpg', size: 123 },
      linkBaseURL: selectedContext.linkBaseURL,
    };
    page.handleUploadSuccess(selectedItem, '/file/r2:r2_picture.jpg');
    assert.equal(page.formatLink(page.uploadedFiles[0]), 'https://images-b.example/file/r2:r2_picture.jpg');

    page.usePublicBaseUrl = false;
    const defaultContext = page.createUploadContext();
    const defaultItem = {
      file: { name: 'other.jpg', size: 456 },
      linkBaseURL: defaultContext.linkBaseURL,
    };
    page.handleUploadSuccess(defaultItem, '/file/r2:r2_other.jpg');
    assert.equal(page.formatLink(page.uploadedFiles[0]), 'https://site-a.example/file/r2:r2_other.jpg');
    assert.equal(page.formatLink(page.uploadedFiles[1]), 'https://images-b.example/file/r2:r2_picture.jpg');
  });

  it('disables the public domain choice when no valid URL is configured', async function () {
    const { onRequestGet } = await import('../functions/api/status.js');
    const validResponse = await onRequestGet({
      env: { PUBLIC_BASE_URL: 'https://images-b.example/cache/' },
    });
    assert.equal((await validResponse.json()).publicBaseUrl, 'https://images-b.example');

    const response = await onRequestGet({ env: { PUBLIC_BASE_URL: 'javascript:alert(1)' } });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).publicBaseUrl, '');

    const page = loadUploadPage();
    page.usePublicBaseUrl = true;
    assert.equal(page.getSelectedLinkBaseURL(), 'https://site-a.example');
  });
});
