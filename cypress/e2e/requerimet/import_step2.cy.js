// Testes automatizados para API: POST /requirements/import/step2
// Segue o padrão dos testes Cypress do projeto

describe('API - Requirements Import Step 2 - /requirements/import/step2', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente
  const validCsvPath = 'caminho/para/arquivo.csv'; // Substitua pelo caminho de um arquivo CSV válido no seu projeto
  const validAssignedTo = 'user123'; // Substitua pelo usuário válido
  const validDbColumns = [
    'col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8'
  ]; // Substitua pelas colunas reais do seu banco, se necessário

  // Função utilitária para chamada da API
  function importStep2(formData, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${BASE_URL}/Requirement/importsteptwo`,
      form: true,
      body: formData,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Importa requisitos (step2) com todos os campos obrigatórios válidos', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      const formData = {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: blob,
        assignedto: validAssignedTo,
        'db_columns[0]': validDbColumns[0],
        'db_columns[1]': validDbColumns[1],
        'db_columns[2]': validDbColumns[2],
        'db_columns[3]': validDbColumns[3],
        'db_columns[4]': validDbColumns[4],
        'db_columns[5]': validDbColumns[5],
        'db_columns[6]': validDbColumns[6],
        'db_columns[7]': validDbColumns[7],
        created_new: 'create'
      };
      importStep2(formData).then(response => {
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
        assignedto: validAssignedTo,
        'db_columns[0]': validDbColumns[0],
        created_new: 'create'
      };
      importStep2(formData).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'import_csv_file', 'assignedto', 'created_new'].forEach(field => {
    it(`Falha sem campo obrigatório: ${field}`, () => {
      cy.fixture(validCsvPath, 'binary').then(CSVContent => {
        const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
        const formData = {
          token: validToken,
          project_id: validProjectId,
          import_csv_file: blob,
          assignedto: validAssignedTo,
          created_new: 'create'
        };
        if (field === 'import_csv_file') delete formData.import_csv_file;
        else if (field === 'project_id') delete formData.project_id;
        else if (field === 'assignedto') delete formData.assignedto;
        else if (field === 'created_new') delete formData.created_new;
        importStep2(formData).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
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
          assignedto: validAssignedTo,
          created_new: 'create'
        };
        importStep2(formData).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Arquivo inválido ---
  it('Falha com arquivo vazio', () => {
    const blob = Cypress.Blob.binaryStringToBlob('', 'text/csv');
    importStep2({
      token: validToken,
      project_id: validProjectId,
      import_csv_file: blob,
      assignedto: validAssignedTo,
      created_new: 'create'
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
        assignedto: validAssignedTo,
        created_new: 'create',
        foo: 'bar'
      };
      importStep2(formData).then(response => {
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
          url: `${BASE_URL}/Requirement/importsteptwo`,
          form: true,
          body: {
            token: validToken,
            project_id: validProjectId,
            import_csv_file: blob,
            assignedto: validAssignedTo,
            created_new: 'create'
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
        url: `${BASE_URL}/Requirement/importsteptwo`,
        body: {
          token: validToken,
          project_id: validProjectId,
          import_csv_file: blob,
          assignedto: validAssignedTo,
          created_new: 'create'
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
      importStep2({
        token: "' OR 1=1 --",
        project_id: validProjectId,
        import_csv_file: blob,
        assignedto: validAssignedTo,
        created_new: 'create'
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
      importStep2({
        token: validToken,
        project_id: validProjectId,
        import_csv_file: blob,
        assignedto: validAssignedTo,
        created_new: 'create'
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
        import_csv_file: blob,
        assignedto: validAssignedTo,
        created_new: 'create'
      };
      const requests = Array(10).fill(0).map(() => importStep2(formData));
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
        import_csv_file: blob,
        assignedto: validAssignedTo,
        created_new: 'create'
      };
      importStep2(formData)
        .then(() => importStep2(formData))
        .then((response) => {
          expect([200, 400, 401, 409]).to.include(response.status);
        });
    });
  });

});