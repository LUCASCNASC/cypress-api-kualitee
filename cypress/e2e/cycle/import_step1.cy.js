const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Defect/importstepone';

describe('API - Defects Import Step 1 - /defects/import/step1', () => {
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validCsvFile = 'cypress/fixtures/defects_import.csv';

  function defectsImportStep1(body, filePath, options = {}) {
    // Para envio de arquivo, use um plugin como cypress-form-data ou cy.form_request se disponível
    return cy.form_request(
      'POST',
      `/${PATH_API}`,
      body,
      [{ name: 'import_csv_file', fileName: filePath.split('/').pop(), mimeType: 'text/csv', filePath }],
      { failOnStatusCode: false, ...options }
    );
  }

  // --- POSITIVO ---
  it('Importa CSV de defeitos com campos obrigatórios válidos', () => {
    defectsImportStep1(
      {
        token: validToken,
        project_id: validProjectId
      },
      validCsvFile
    ).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    defectsImportStep1(
      {
        project_id: validProjectId
      },
      validCsvFile
    ).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      defectsImportStep1(
        {
          token,
          project_id: validProjectId
        },
        validCsvFile
      ).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  it('Falha sem project_id', () => {
    defectsImportStep1(
      {
        token: validToken
      },
      validCsvFile
    ).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Falha sem arquivo CSV', () => {
    defectsImportStep1(
      {
        token: validToken,
        project_id: validProjectId
      },
      ''
    ).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      defectsImportStep1(
        {
          token: validToken,
          project_id
        },
        validCsvFile
      ).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Arquivo inválido ---
  ['cypress/fixtures/arquivo.txt', 'cypress/fixtures/image.png', null, '', {}, [], true, false].forEach(invalidFile => {
    it(`Falha com arquivo CSV inválido (${JSON.stringify(invalidFile)})`, () => {
      defectsImportStep1(
        {
          token: validToken,
          project_id: validProjectId
        },
        invalidFile
      ).then(response => {
        expect([400, 415, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    defectsImportStep1(
      {
        token: validToken,
        project_id: validProjectId,
        foo: 'bar'
      },
      validCsvFile
    ).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId
        },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    defectsImportStep1(
      {
        token: "' OR 1=1 --",
        project_id: validProjectId
      },
      validCsvFile
    ).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    defectsImportStep1(
      {
        token: validToken,
        project_id: validProjectId
      },
      validCsvFile
    ).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas importações rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      defectsImportStep1(
        {
          token: validToken,
          project_id: validProjectId
        },
        validCsvFile
      )
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita importações idênticas sequenciais ---
  it('Permite importações duplicadas rapidamente', () => {
    defectsImportStep1(
      {
        token: validToken,
        project_id: validProjectId
      },
      validCsvFile
    ).then(() =>
      defectsImportStep1(
        {
          token: validToken,
          project_id: validProjectId
        },
        validCsvFile
      )
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});