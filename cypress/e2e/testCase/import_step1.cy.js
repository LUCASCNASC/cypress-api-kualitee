// Testes automatizados para API: POST /test_case/import/step1
// Segue o padrão dos testes Cypress do projeto
const PATH_API = '/TestCase/importstepone'

describe('API - Import Step 1 - /test_case/import/step1', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validCsv = 'fixtures/valid_test_cases.csv'; // Coloque um csv de teste válido no diretório fixtures

  // Função utilitária para chamada da API
  function importStep1(body, file, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      ...file && { formData: { ...body, import_csv_file: file } },
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO: upload CSV válido ---
  it('Importa arquivo CSV válido', () => {
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      formData.append('token', validToken);
      formData.append('project_id', validProjectId);
      formData.append('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `/${PATH_API}`,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
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
      formData.append('project_id', validProjectId);
      formData.append('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `/${PATH_API}`,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
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
        formData.append('token', token);
        formData.append('project_id', validProjectId);
        formData.append('import_csv_file', blob, 'valid_test_cases.csv');

        cy.request({
          method: 'POST',
          url: `${BASE_URL}/${PATH_API}`,
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          failOnStatusCode: false
        }).then(response => {
          expect([400, 401, 403]).to.include(response.status);
        });
      });
    });
  });

  // --- Campo obrigatório ausente ---
  it('Falha sem project_id', () => {
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      formData.append('token', validToken);
      formData.append('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `${BASE_URL}/${PATH_API}`,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        failOnStatusCode: false
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Falha sem arquivo CSV', () => {
    cy.request({
      method: 'POST',
      url: `${BASE_URL}/${PATH_API}`,
      form: true,
      body: {
        token: validToken,
        project_id: validProjectId
      },
      failOnStatusCode: false
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  // --- Arquivo CSV inválido ---
  it('Falha com arquivo CSV vazio', () => {
    const emptyBlob = new Blob([''], { type: 'text/csv' });
    const formData = new FormData();
    formData.append('token', validToken);
    formData.append('project_id', validProjectId);
    formData.append('import_csv_file', emptyBlob, 'empty.csv');

    cy.request({
      method: 'POST',
      url: `${BASE_URL}/${PATH_API}`,
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      failOnStatusCode: false
    }).then(response => {
      expect([400, 422, 415]).to.include(response.status);
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `${BASE_URL}/${PATH_API}`,
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
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      formData.append('token', "' OR 1=1 --");
      formData.append('project_id', validProjectId);
      formData.append('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `${BASE_URL}/${PATH_API}`,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
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
      formData.append('token', validToken);
      formData.append('project_id', validProjectId);
      formData.append('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `${BASE_URL}/${PATH_API}`,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
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
      formData.append('token', validToken);
      formData.append('project_id', validProjectId);
      formData.append('import_csv_file', blob, 'valid_test_cases.csv');

      const requests = Array(10).fill(0).map(() =>
        cy.request({
          method: 'POST',
          url: `${BASE_URL}/${PATH_API}`,
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
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
      formData.append('token', validToken);
      formData.append('project_id', validProjectId);
      formData.append('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `${BASE_URL}/${PATH_API}`,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        failOnStatusCode: false
      }).then(() => {
        cy.request({
          method: 'POST',
          url: `${BASE_URL}/${PATH_API}`,
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect([200, 400, 401, 409]).to.include(response.status);
        });
      });
    });
  });

});