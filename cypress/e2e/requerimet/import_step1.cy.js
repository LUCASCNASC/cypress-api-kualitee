// Testes automatizados para API: POST /requirements/import/step1
// Segue o padrão dos testes Cypress do projeto

describe('API - Requirements Import Step 1 - /requirements/import/step1', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente
  const validCsvPath = 'caminho/para/arquivo.csv'; // Substitua pelo caminho de um arquivo CSV válido no seu projeto

  // Função utilitária para chamada da API
  function importStep1(formData, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${BASE_URL}/Requirement/importstepone`,
      form: true,
      body: formData,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Importa requisitos com token, project_id e arquivo CSV válidos', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      const formData = {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: blob,
      };
      importStep1(formData).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('success');
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  // --- NEGATIVO: AUTH ---
  it('Falha sem token', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      const formData = {
        project_id: validProjectId,
        import_csv_file: blob,
      };
      importStep1(formData).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  ['token_invalido', 'token_expirado', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      cy.fixture(validCsvPath, 'binary').then(CSVContent => {
        const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
        const formData = {
          token,
          project_id: validProjectId,
          import_csv_file: blob,
        };
        importStep1(formData).then(response => {
          expect([400, 401, 403]).to.include(response.status);
        });
      });
    });
  });

  // --- Campo obrigatório ausente ---
  it('Falha sem project_id', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      const formData = {
        token: validToken,
        import_csv_file: blob,
      };
      importStep1(formData).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Falha sem import_csv_file', () => {
    importStep1({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  // --- Campos obrigatórios inválidos ---
  const invalidValues = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];

  invalidValues.forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      cy.fixture(validCsvPath, 'binary').then(CSVContent => {
        const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
        const formData = {
          token: validToken,
          project_id,
          import_csv_file: blob,
        };
        importStep1(formData).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Arquivo inválido ---
  it('Falha com arquivo vazio', () => {
    const blob = Cypress.Blob.binaryStringToBlob('', 'text/csv');
    importStep1({
      token: validToken,
      project_id: validProjectId,
      import_csv_file: blob,
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Falha com arquivo não CSV', () => {
    const blob = Cypress.Blob.binaryStringToBlob('not,a,csv', 'text/plain');
    importStep1({
      token: validToken,
      project_id: validProjectId,
      import_csv_file: blob,
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      const formData = {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: blob,
        foo: 'bar'
      };
      importStep1(formData).then(response => {
        expect([200, 400]).to.include(response.status);
      });
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.fixture(validCsvPath, 'binary').then(CSVContent => {
        const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
        cy.request({
          method,
          url: `${BASE_URL}/Requirement/importstepone`,
          form: true,
          body: {
            token: validToken,
            project_id: validProjectId,
            import_csv_file: blob
          },
          failOnStatusCode: false,
        }).then(response => {
          expect([405, 404, 400]).to.include(response.status);
        });
      });
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/json', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      cy.request({
        method: 'POST',
        url: `${BASE_URL}/Requirement/importstepone`,
        body: {
          token: validToken,
          project_id: validProjectId,
          import_csv_file: blob
        },
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false
      }).then((response) => {
        expect([400, 415]).to.include(response.status);
      });
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      importStep1({
        token: "' OR 1=1 --",
        project_id: validProjectId,
        import_csv_file: blob
      }).then(response => {
        const body = JSON.stringify(response.body);
        expect(body).not.to.match(/exception|trace|sql|database/i);
      });
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      importStep1({
        token: validToken,
        project_id: validProjectId,
        import_csv_file: blob
      }).then(response => {
        expect(response.headers).to.have.property('access-control-allow-origin');
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      const formData = {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: blob
      };
      const requests = Array(10).fill(0).map(() => importStep1(formData));
      cy.wrap(Promise.all(requests)).then((responses) => {
        const rateLimited = responses.some(r => r.status === 429);
        expect(rateLimited).to.be.true;
      });
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      const formData = {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: blob
      };
      importStep1(formData)
        .then(() => importStep1(formData))
        .then((response) => {
          expect([200, 400, 401, 409]).to.include(response.status);
        });
    });
  });

});