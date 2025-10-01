// Testes automatizados para API: POST /test_case/import/step2
// Segue o padrão dos testes Cypress do projeto
const PATH_API = '/TestCase/importsteptwo'

describe('API - Import Step 2 - /test_case/import/step2', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente
  const validAssignedTo = 123; // Substitua por um assignedto válido do seu ambiente
  const validCsv = 'fixtures/valid_test_cases.csv'; // Coloque um csv de teste válido no diretório fixtures

  // Todos os db_columns requeridos (ordem importa)
  const dbColumns = [
    'build_id',
    'module_id',
    'tc_scenario_id',
    'tc_scenario_summary',
    'tc_name',
    'summary',
    'importance',
    'execution_type'
  ];

  function buildBody(overrides = {}) {
    const body = {
      token: validToken,
      project_id: validProjectId,
      import_csv_file: 'dummy.csv', // Placeholder, será substituído pelo arquivo real no formData
      assignedto: validAssignedTo
    };
    dbColumns.forEach((col, i) => body[`db_columns[${i}]`] = col);
    return { ...body, ...overrides };
  }

  // --- POSITIVO: upload CSV válido e todos os campos obrigatórios ---
  it('Importa arquivo CSV válido e todos os campos obrigatórios', () => {
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      const body = buildBody();
      Object.keys(body).forEach(k => formData.append(k, body[k]));
      formData.set('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `/${PATH_API}`,
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('success');
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  // --- NEGATIVO: AUTH ---
  it('Falha sem token', () => {
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      const body = buildBody({ token: undefined });
      Object.keys(body).forEach(k => formData.append(k, body[k]));
      formData.set('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `/${PATH_API}`,
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        failOnStatusCode: false
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
        const formData = new FormData();
        const body = buildBody({ token });
        Object.keys(body).forEach(k => formData.append(k, body[k]));
        formData.set('import_csv_file', blob, 'valid_test_cases.csv');

        cy.request({
          method: 'POST',
          url: `/${PATH_API}`,
          body: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
          failOnStatusCode: false
        }).then(response => {
          expect([400, 401, 403]).to.include(response.status);
        });
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'import_csv_file', 'assignedto', ...dbColumns.map((_, i) => `db_columns[${i}]`)].forEach(field => {
    it(`Falha sem campo obrigatório: ${field}`, () => {
      cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
        const formData = new FormData();
        const body = buildBody();
        delete body[field];
        Object.keys(body).forEach(k => formData.append(k, body[k]));
        if (field !== 'import_csv_file') {
          formData.set('import_csv_file', blob, 'valid_test_cases.csv');
        }
        cy.request({
          method: 'POST',
          url: `/${PATH_API}`,
          body: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
          failOnStatusCode: false
        }).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- db_columns inválido ---
  it('Falha com db_columns inválido', () => {
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      const body = buildBody({ 'db_columns[2]': 'xxxx' });
      Object.keys(body).forEach(k => formData.append(k, body[k]));
      formData.set('import_csv_file', blob, 'valid_test_cases.csv');
      cy.request({
        method: 'POST',
        url: `/${PATH_API}`,
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        failOnStatusCode: false
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Arquivo CSV inválido ---
  it('Falha com arquivo CSV vazio', () => {
    const emptyBlob = new Blob([''], { type: 'text/csv' });
    const formData = new FormData();
    const body = buildBody();
    Object.keys(body).forEach(k => formData.append(k, body[k]));
    formData.set('import_csv_file', emptyBlob, 'empty.csv');
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      failOnStatusCode: false
    }).then(response => {
      expect([400, 422, 415]).to.include(response.status);
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: buildBody(),
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      const body = buildBody({ token: "' OR 1=1 --" });
      Object.keys(body).forEach(k => formData.append(k, body[k]));
      formData.set('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `/${PATH_API}`,
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        failOnStatusCode: false
      }).then(response => {
        const body = JSON.stringify(response.body);
        expect(body).not.to.match(/exception|trace|sql|database/i);
      });
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      const body = buildBody();
      Object.keys(body).forEach(k => formData.append(k, body[k]));
      formData.set('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `/${PATH_API}`,
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        failOnStatusCode: false
      }).then(response => {
        expect(response.headers).to.have.property('access-control-allow-origin');
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplos uploads rápidos (rate limit)', () => {
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      const body = buildBody();
      Object.keys(body).forEach(k => formData.append(k, body[k]));
      formData.set('import_csv_file', blob, 'valid_test_cases.csv');

      const requests = Array(10).fill(0).map(() =>
        cy.request({
          method: 'POST',
          url: `/${PATH_API}`,
          body: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
          failOnStatusCode: false
        })
      );
      cy.wrap(Promise.all(requests)).then((responses) => {
        const rateLimited = responses.some(r => r.status === 429);
        expect(rateLimited).to.be.true;
      });
    });
  });

  // --- Duplicidade: aceita upload idêntico sequencial ---
  it('Permite uploads CSV idênticos rapidamente', () => {
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      const body = buildBody();
      Object.keys(body).forEach(k => formData.append(k, body[k]));
      formData.set('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `/${PATH_API}`,
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        failOnStatusCode: false
      }).then(() => {
        cy.request({
          method: 'POST',
          url: `/${PATH_API}`,
          body: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
          failOnStatusCode: false
        }).then((response) => {
          expect([200, 400, 401, 409]).to.include(response.status);
        });
      });
    });
  });

});