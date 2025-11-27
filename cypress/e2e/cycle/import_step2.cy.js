const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Defect/step2';

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validCsvFile = 'cypress/fixtures/defects_import.csv';
const validAssignTo = 123;
const validDbColumns = [
  "build_id", "module_id", "description", "bugtype", "priority", "status", "devices", "os", "browser", "steps_to_reproduce", "eresult", "aresult"
];

describe('API rest - Defects Import Step 2 - /defects/import/step2', () => {

  function defectsImportStep2(body, filePath, options = {}) {
    // Para envio de arquivo, use plugin como cypress-form-data ou cy.form_request se disponível
    return cy.form_request(
      'POST',
      `/${PATH_API}`,
      body,
      [{ name: 'import_csv_file', fileName: filePath.split('/').pop(), mimeType: 'text/csv', filePath }],
      { failOnStatusCode: false, ...options }
    );
  }

  it('Importa CSV de defeitos mapeando todos os campos válidos', () => {
    defectsImportStep2(
      {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        assignto: validAssignTo,
        create: 'yes',
        db_columns: validDbColumns
      },
      validCsvFile
    ).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Importa CSV de defeitos com campos mínimos obrigatórios', () => {
    defectsImportStep2(
      {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        db_columns: [null, null, "description", null, null, null, null, "os"] // Apenas os obrigatórios preenchidos
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
    defectsImportStep2(
      {
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        db_columns: validDbColumns
      },
      validCsvFile
    ).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      defectsImportStep2(
        {
          token,
          project_id: validProjectId,
          import_csv_file: validCsvFile,
          db_columns: validDbColumns
        },
        validCsvFile
      ).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'import_csv_file', 'db_columns'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        db_columns: validDbColumns
      };
      delete body[field];
      defectsImportStep2(body, validCsvFile).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      defectsImportStep2(
        {
          token: validToken,
          project_id,
          import_csv_file: validCsvFile,
          db_columns: validDbColumns
        },
        validCsvFile
      ).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  ['cypress/fixtures/arquivo.txt', 'cypress/fixtures/image.png', null, '', {}, [], true, false].forEach(invalidFile => {
    it(`Falha com arquivo CSV inválido (${JSON.stringify(invalidFile)})`, () => {
      defectsImportStep2(
        {
          token: validToken,
          project_id: validProjectId,
          import_csv_file: invalidFile,
          db_columns: validDbColumns
        },
        invalidFile
      ).then(response => {
        expect([400, 415, 422]).to.include(response.status);
      });
    });
  });

  [null, '', {}, [], true, false].forEach(invalidDbColumns => {
    it(`Falha com db_columns inválido (${JSON.stringify(invalidDbColumns)})`, () => {
      defectsImportStep2(
        {
          token: validToken,
          project_id: validProjectId,
          import_csv_file: validCsvFile,
          db_columns: invalidDbColumns
        },
        validCsvFile
      ).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    defectsImportStep2(
      {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        db_columns: validDbColumns,
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
          project_id: validProjectId,
          import_csv_file: validCsvFile,
          db_columns: validDbColumns
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
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        db_columns: validDbColumns
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    defectsImportStep2(
      {
        token: "' OR 1=1 --",
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        db_columns: validDbColumns
      },
      validCsvFile
    ).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    defectsImportStep2(
      {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        db_columns: validDbColumns
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
      defectsImportStep2(
        {
          token: validToken,
          project_id: validProjectId,
          import_csv_file: validCsvFile,
          db_columns: validDbColumns
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
    defectsImportStep2(
      {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        db_columns: validDbColumns
      },
      validCsvFile
    ).then(() =>
      defectsImportStep2(
        {
          token: validToken,
          project_id: validProjectId,
          import_csv_file: validCsvFile,
          db_columns: validDbColumns
        },
        validCsvFile
      )
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});