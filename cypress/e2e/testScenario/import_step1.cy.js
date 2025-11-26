const PATH_API = '/Test%20Scenario/importstepone'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validCsvFilePath = 'cypress/fixtures/test_scenarios_import.csv';

describe('API - Import Step One - /test_scenario/import/step1', () => {

  function importStep1(body, filePath, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      // Suporte a envio de arquivo CSV
      ...(
        filePath
          ? { headers: { 'Content-Type': 'multipart/form-data' }, file: { import_csv_file: filePath } }
          : {}
      ),
      failOnStatusCode: false,
      ...options,
    });
  }

  // POSITIVO: todos os campos obrigatórios válidos
  it('Importa CSV de cenários de teste (passo 1) com campos obrigatórios válidos', () => {
    cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
      cy.form_request(
        'POST',
        '/Test%20Scenario/importstepone',
        {
          token: validToken,
          project_id: validProjectId
        },
        [
          { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
        ]
      ).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('success');
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  // NEGATIVO: AUTH
  it('Falha sem token', () => {
    cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
      cy.form_request(
        'POST',
        '/Test%20Scenario/importstepone',
        {
          project_id: validProjectId
        },
        [
          { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
        ]
      ).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
        cy.form_request(
          'POST',
          '/Test%20Scenario/importstepone',
          {
            token,
            project_id: validProjectId
          },
          [
            { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
          ]
        ).then(response => {
          expect([400, 401, 403]).to.include(response.status);
        });
      });
    });
  });

  // Campo obrigatório ausente
  ['project_id', 'import_csv_file'].forEach(field => {
    it(`Falha sem campo obrigatório: ${field}`, () => {
      const body = { token: validToken, project_id: validProjectId };
      if (field === 'project_id') delete body.project_id;
      if (field === 'import_csv_file') {
        // Não envia o arquivo
        cy.request({
          method: 'POST',
          url: `/${PATH_API}`,
          form: true,
          body,
          failOnStatusCode: false
        }).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      } else {
        cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
          cy.form_request(
            'POST',
            `/${PATH_API}`,
            body,
            [
              { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
            ]
          ).then(response => {
            expect([400, 422, 404]).to.include(response.status);
          });
        });
      }
    });
  });

  // Campos obrigatórios inválidos
  const invalidValues = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];
  ['project_id'].forEach(field => {
    invalidValues.forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
          const body = { token: validToken, project_id: validProjectId };
          body[field] = value;
          cy.form_request(
            'POST',
            '/Test%20Scenario/importstepone',
            body,
            [
              { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
            ]
          ).then(response => {
            expect([400, 422, 404]).to.include(response.status);
          });
        });
      });
    });
  });

  // Arquivo CSV inválido
  it('Falha com arquivo CSV inválido', () => {
    cy.fixture('invalid.txt', 'base64').then(fileContent => {
      cy.form_request(
        'POST',
        '/Test%20Scenario/importstepone',
        {
          token: validToken,
          project_id: validProjectId
        },
        [
          { name: 'import_csv_file', fileName: 'invalid.txt', mimeType: 'text/plain', fileContent, encoding: 'base64' }
        ]
      ).then(response => {
        expect([400, 415, 422]).to.include(response.status);
      });
    });
  });

  // Campos extras
  it('Ignora campo extra no body', () => {
    cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
      cy.form_request(
        'POST',
        '/Test%20Scenario/importstepone',
        {
          token: validToken,
          project_id: validProjectId,
          foo: 'bar'
        },
        [
          { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
        ]
      ).then(response => {
        expect([200, 400]).to.include(response.status);
      });
    });
  });

  // HTTP Method errado
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
        cy.request({
          method,
          url: `/${PATH_API}`,
          form: true,
          body: {
            token: validToken,
            project_id: validProjectId
          },
          failOnStatusCode: false
        }).then(response => {
          expect([405, 404, 400]).to.include(response.status);
        });
      });
    });
  });

  // Contrato: Não vazar informações sensíveis
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
      cy.form_request(
        'POST',
        '/Test%20Scenario/importstepone',
        {
          token: "' OR 1=1 --",
          project_id: validProjectId
        },
        [
          { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
        ]
      ).then(response => {
        const body = JSON.stringify(response.body);
        expect(body).not.to.match(/exception|trace|sql|database/i);
      });
    });
  });

  // Headers
  it('Headers devem conter CORS e content-type', () => {
    cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
      cy.form_request(
        'POST',
        '/Test%20Scenario/importstepone',
        {
          token: validToken,
          project_id: validProjectId
        },
        [
          { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
        ]
      ).then(response => {
        expect(response.headers).to.have.property('access-control-allow-origin');
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  // Rate limit (se aplicável)
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
      const requests = Array(10).fill(0).map(() =>
        cy.form_request(
          'POST',
          '/Test%20Scenario/importstepone',
          {
            token: validToken,
            project_id: validProjectId
          },
          [
            { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
          ]
        )
      );
      cy.wrap(Promise.all(requests)).then((responses) => {
        const rateLimited = responses.some(r => r.status === 429);
        expect(rateLimited).to.be.true;
      });
    });
  });

  // Duplicidade: aceita chamadas idênticas sequenciais
  it('Permite chamadas idênticas rapidamente', () => {
    cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
      cy.form_request(
        'POST',
        '/Test%20Scenario/importstepone',
        {
          token: validToken,
          project_id: validProjectId
        },
        [
          { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
        ]
      ).then(() => {
        cy.form_request(
          'POST',
          '/Test%20Scenario/importstepone',
          {
            token: validToken,
            project_id: validProjectId
          },
          [
            { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
          ]
        ).then((response) => {
          expect([200, 400, 401, 409]).to.include(response.status);
        });
      });
    });
  });

});